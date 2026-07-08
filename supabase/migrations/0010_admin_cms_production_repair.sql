create extension if not exists pgcrypto;

-- Production repair migration for databases that were created before the CMS/admin modules existed.
-- It is intentionally idempotent and safe to run on existing Supabase projects.

alter table users
  add column if not exists account_status text not null default 'active',
  add column if not exists plan text not null default 'trial',
  add column if not exists leads_used integer not null default 0,
  add column if not exists ai_credits_used integer not null default 0,
  add column if not exists storage_used_bytes bigint not null default 0,
  add column if not exists last_active_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table workspaces
  add column if not exists disabled_at timestamptz,
  add column if not exists storage_used_bytes bigint not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table leads
  add column if not exists community_url text not null default '',
  add column if not exists creator_email text not null default '',
  add column if not exists lead_category text not null default 'Common Freelance Tasks',
  add column if not exists lead_subcategory text not null default 'General Freelance Work',
  add column if not exists category_confidence integer not null default 10,
  add column if not exists global_identity_key text not null default '',
  add column if not exists platform_user_id text not null default '',
  add column if not exists profile_variables jsonb not null default '{}',
  add column if not exists current_sequence_id uuid,
  add column if not exists current_sequence_step integer not null default 0;

update leads
set creator_email = users.email
from users
where leads.owner_id = users.id
  and coalesce(leads.creator_email, '') = '';

update leads
set global_identity_key = concat(
  'identity:',
  lower(coalesce(platform, 'unknown')),
  ':',
  md5(lower(coalesce(nullif(author_profile_url, ''), nullif(author_name, ''), 'unknown'))),
  ':',
  md5(lower(coalesce(nullif(post_text, ''), nullif(post_snippet, ''), nullif(source_url, ''), 'empty')))
)
where coalesce(global_identity_key, '') = '';

update leads
set lead_category = case
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%wordpress%', '%shopify%', '%webflow%', '%website%', '%landing page%', '%frontend%', '%backend%', '%full stack%', '%api%']) then 'Web Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%android%', '%ios%', '%flutter%', '%react native%', '%mobile app%', '%swift%', '%kotlin%']) then 'Mobile App Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%chatbot%', '%gpt%', '%claude%', '%ai agent%', '%rag%', '%machine learning%', '%llm%', '%prompt%']) then 'AI & Machine Learning'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%figma%', '%ui%', '%ux%', '%wireframe%', '%prototype%', '%dashboard design%']) then 'UI/UX Design'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%logo%', '%brand identity%', '%graphic designer%', '%banner%', '%brochure%', '%presentation design%']) then 'Graphic Design'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%video editing%', '%motion graphics%', '%youtube editing%', '%reels%', '%tiktok editing%', '%animation%']) then 'Video & Animation'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%seo%', '%google ads%', '%meta ads%', '%lead generation%', '%cold email%', '%demand gen%', '%marketing agency%', '%cro%']) then 'Digital Marketing'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%appointment setter%', '%sdr%', '%sales development%', '%cold calling%', '%linkedin outreach%', '%lead qualification%']) then 'Sales'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%virtual assistant%', '%administrative%', '%email management%', '%calendar%', '%data entry%', '%research%']) then 'Virtual Assistance'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%customer support%', '%live chat%', '%help desk%', '%ticket%', '%technical support%']) then 'Customer Support'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%bookkeeping%', '%payroll%', '%tax%', '%accounting%', '%invoice%']) then 'Finance & Accounting'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%legal%', '%contract%', '%nda%', '%privacy policy%', '%trademark%']) then 'Legal'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%excel%', '%google sheets%', '%power bi%', '%tableau%', '%sql%', '%data analysis%', '%dashboard%']) then 'Data'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%aws%', '%azure%', '%docker%', '%kubernetes%', '%devops%', '%github actions%', '%server administration%']) then 'Cloud & DevOps'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike any (array['%qa%', '%testing%', '%selenium%', '%cypress%', '%playwright%', '%bug reporting%']) then 'QA & Testing'
    else lead_category
  end,
  lead_subcategory = case
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%lead generation%' then 'Lead Generation'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%appointment setter%' then 'Appointment Setting'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%cold email%' then 'Cold Email'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%wordpress%' then 'WordPress Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%shopify%' then 'Shopify Development'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%figma%' then 'Figma Design'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%seo%' then 'SEO'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%data entry%' then 'Data Entry'
    when post_text || ' ' || post_snippet || ' ' || community_name ilike '%virtual assistant%' then 'Virtual Assistant'
    else lead_subcategory
  end,
  category_confidence = greatest(category_confidence, 40);

create table if not exists cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  page_type text not null default 'page',
  status text not null default 'draft',
  content jsonb not null default '{}',
  seo jsonb not null default '{}',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references cms_pages(id) on delete cascade,
  section_key text not null,
  section_type text not null,
  sort_order integer not null default 0,
  enabled boolean not null default true,
  content jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_media (
  id uuid primary key default gen_random_uuid(),
  folder text not null default 'library',
  file_name text not null,
  file_type text not null,
  file_size_bytes bigint not null default 0,
  storage_path text not null default '',
  public_url text not null default '',
  alt_text text not null default '',
  metadata jsonb not null default '{}',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists cms_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists cms_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status text not null default 'draft',
  excerpt text not null default '',
  content_markdown text not null default '',
  content_json jsonb not null default '{}',
  featured_media_id uuid references cms_media(id) on delete set null,
  author_name text not null default '',
  category_id uuid references cms_categories(id) on delete set null,
  tags jsonb not null default '[]',
  reading_time_minutes integer not null default 1,
  seo jsonb not null default '{}',
  revision integer not null default 1,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists cms_post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references cms_posts(id) on delete cascade,
  revision integer not null,
  snapshot jsonb not null default '{}',
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(post_id, revision)
);

create table if not exists cms_navigation (
  id uuid primary key default gen_random_uuid(),
  location text not null default 'header',
  label text not null,
  href text not null,
  icon text not null default '',
  parent_id uuid references cms_navigation(id) on delete cascade,
  sort_order integer not null default 0,
  visible boolean not null default true,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_footer (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null default '',
  role text not null default '',
  rating integer not null default 5,
  review text not null,
  photo_url text not null default '',
  featured boolean not null default false,
  status text not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'General',
  sort_order integer not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_settings (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  key text not null,
  value jsonb not null default '{}',
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(group_name, key)
);

create table if not exists cms_announcements (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'top_banner',
  title text not null,
  body text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  dismissible boolean not null default true,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists cms_redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 301,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cms_landing_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'draft',
  sections jsonb not null default '[]',
  seo jsonb not null default '{}',
  created_by uuid references users(id) on delete set null,
  updated_by uuid references users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists cms_newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null default '',
  status text not null default 'subscribed',
  source text not null default 'website',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  module text not null,
  action text not null,
  target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  event_name text not null,
  source text,
  path text,
  country text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists system_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  source text not null,
  message text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists api_request_logs (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  method text not null,
  status_code integer not null,
  latency_ms integer,
  user_id uuid,
  workspace_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  user_id uuid,
  provider text not null default 'gemini',
  model text not null default 'gemini-2.5-flash',
  status text not null default 'success',
  tokens_prompt integer not null default 0,
  tokens_completion integer not null default 0,
  tokens_total integer not null default 0,
  cost_cents numeric not null default 0,
  latency_ms integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists extension_installs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  user_id uuid,
  extension_version text not null default '2.0.0',
  browser text not null default 'chrome',
  status text not null default 'active',
  community_scan_count integer not null default 0,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  stripe_customer_id text not null unique,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan_name text not null,
  status text not null,
  mrr_cents integer not null default 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists storage_usage_snapshots (
  id uuid primary key default gen_random_uuid(),
  bytes_used bigint not null default 0,
  source text not null default 'supabase',
  created_at timestamptz not null default now()
);

create index if not exists users_email_admin_idx on users(email);
create index if not exists users_status_admin_idx on users(account_status, created_at desc);
create index if not exists workspaces_plan_admin_idx on workspaces(plan, billing_status);
create index if not exists leads_creator_email_idx on leads(creator_email);
create index if not exists leads_category_idx on leads(lead_category, lead_subcategory);
create index if not exists leads_workspace_category_idx on leads(workspace_id, lead_category, lead_subcategory);
create index if not exists leads_workspace_platform_community_idx on leads(workspace_id, platform, community_name);
create index if not exists leads_workspace_global_identity_idx on leads(workspace_id, global_identity_key);
create index if not exists cms_pages_status_idx on cms_pages(status);
create index if not exists cms_pages_slug_idx on cms_pages(slug);
create index if not exists cms_sections_page_order_idx on cms_sections(page_id, sort_order);
create index if not exists cms_media_folder_idx on cms_media(folder, created_at desc);
create index if not exists cms_posts_status_idx on cms_posts(status);
create index if not exists cms_posts_slug_idx on cms_posts(slug);
create index if not exists cms_posts_category_idx on cms_posts(category_id);
create index if not exists cms_navigation_location_idx on cms_navigation(location, sort_order);
create index if not exists cms_footer_group_idx on cms_footer(group_name, sort_order);
create index if not exists cms_faq_category_idx on cms_faq(category, sort_order);
create index if not exists cms_settings_group_key_idx on cms_settings(group_name, key);
create index if not exists cms_announcements_status_idx on cms_announcements(status, starts_at, ends_at);
create index if not exists cms_redirects_source_idx on cms_redirects(source_path);
create index if not exists cms_newsletter_status_idx on cms_newsletter_subscribers(status, created_at desc);
create index if not exists analytics_events_created_idx on analytics_events(created_at);
create index if not exists admin_audit_created_idx on admin_audit_logs(created_at);
create index if not exists system_logs_created_idx on system_logs(created_at);
create index if not exists api_request_logs_created_idx on api_request_logs(created_at);
create index if not exists ai_usage_created_idx on ai_usage_events(created_at);
create index if not exists extension_installs_seen_idx on extension_installs(last_seen_at);

alter table cms_pages enable row level security;
alter table cms_sections enable row level security;
alter table cms_media enable row level security;
alter table cms_categories enable row level security;
alter table cms_tags enable row level security;
alter table cms_posts enable row level security;
alter table cms_post_revisions enable row level security;
alter table cms_navigation enable row level security;
alter table cms_footer enable row level security;
alter table cms_testimonials enable row level security;
alter table cms_faq enable row level security;
alter table cms_settings enable row level security;
alter table cms_announcements enable row level security;
alter table cms_redirects enable row level security;
alter table cms_landing_pages enable row level security;
alter table cms_newsletter_subscribers enable row level security;
alter table admin_audit_logs enable row level security;
alter table analytics_events enable row level security;
alter table system_logs enable row level security;
alter table api_request_logs enable row level security;
alter table ai_usage_events enable row level security;
alter table extension_installs enable row level security;
alter table stripe_customers enable row level security;
alter table stripe_subscriptions enable row level security;
alter table storage_usage_snapshots enable row level security;

insert into cms_categories (name, slug, description, sort_order)
values
  ('Product Updates', 'product-updates', 'Release notes and product improvements.', 10),
  ('Lead Generation', 'lead-generation', 'Guides about finding and qualifying community leads.', 20),
  ('Safe Outreach', 'safe-outreach', 'Manual outreach, compliance, and follow-up workflows.', 30)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into cms_pages (slug, title, page_type, status, content, seo, published_at)
values
  ('home', 'Home', 'homepage', 'published', '{"hero":{"headline":"Find high-intent leads inside communities.","subheadline":"Lead intelligence, not spam automation","primaryCta":"Start 7-day trial"},"sections":["hero","platforms","workflow","features","pricing","faq","cta"]}'::jsonb, '{"metaTitle":"Community Lead Assistant","metaDescription":"Find high-intent community leads and manage manual outreach safely.","robots":"index,follow"}'::jsonb, now()),
  ('about', 'About', 'about', 'published', '{"headline":"Built for safer community lead discovery.","body":"Community Lead Assistant helps freelancers, agencies, founders, and growth teams qualify public community intent without auto-sending messages."}'::jsonb, '{"metaTitle":"About | Community Lead Assistant","metaDescription":"Learn about Community Lead Assistant and our manual-review outreach philosophy.","robots":"index,follow"}'::jsonb, now()),
  ('contact', 'Contact', 'contact', 'published', '{"email":"support@communityleadassistant.com","workingHours":"Monday-Friday","headline":"Contact Community Lead Assistant"}'::jsonb, '{"metaTitle":"Contact | Community Lead Assistant","metaDescription":"Contact the Community Lead Assistant team.","robots":"index,follow"}'::jsonb, now()),
  ('pricing', 'Pricing', 'pricing', 'published', '{"headline":"Start with a 7-day trial.","plans":["Free Trial","Starter","Pro","Agency"]}'::jsonb, '{"metaTitle":"Pricing | Community Lead Assistant","metaDescription":"Choose a plan for community lead discovery and manual outreach workflows.","robots":"index,follow"}'::jsonb, now()),
  ('features', 'Features', 'features', 'published', '{"headline":"Everything for community lead intelligence.","features":["Visible content scanning","Lead scoring","Manual outreach drafts","Review queue","CMS and admin analytics"]}'::jsonb, '{"metaTitle":"Features | Community Lead Assistant","metaDescription":"Explore lead discovery, scoring, CMS, and manual outreach features.","robots":"index,follow"}'::jsonb, now())
on conflict (slug) do update set
  title = excluded.title,
  page_type = excluded.page_type,
  status = excluded.status,
  content = excluded.content,
  seo = excluded.seo,
  published_at = coalesce(cms_pages.published_at, excluded.published_at),
  updated_at = now();

insert into cms_settings (group_name, key, value)
values
  ('branding', 'identity', '{"companyName":"Community Lead Assistant","shortName":"Community Lead","tagline":"Find high-intent leads inside communities.","primaryColor":"#2563eb","secondaryColor":"#020617","accentColor":"#10b981","headingFont":"Inter","bodyFont":"Inter"}'::jsonb),
  ('seo', 'homepage', '{"metaTitle":"Community Lead Assistant","metaDescription":"Find high-intent leads inside communities and manage manual outreach safely.","robots":"index,follow"}'::jsonb),
  ('seo', 'blog', '{"metaTitle":"Community Lead Assistant Blog","metaDescription":"Guides for community lead discovery, qualification, and manual outreach workflows.","robots":"index,follow"}'::jsonb),
  ('seo', 'pricing', '{"metaTitle":"Pricing | Community Lead Assistant","metaDescription":"Start with a 7-day trial and choose a plan for freelancers, agencies, and growth teams.","robots":"index,follow"}'::jsonb),
  ('tracking', 'pixels', '{"googleAnalytics":"","googleTagManager":"","metaPixel":"","linkedInInsight":"","microsoftClarity":""}'::jsonb),
  ('legal', 'policies', '{"privacy":"/privacy","terms":"/terms","cookiePolicy":"/cookie-policy","security":"/security"}'::jsonb)
on conflict (group_name, key) do update set
  value = excluded.value,
  updated_at = now();

insert into cms_navigation (location, label, href, icon, sort_order, visible)
values
  ('header', 'Features', '/features', 'sparkles', 10, true),
  ('header', 'Solutions', '/solutions', 'briefcase', 20, true),
  ('header', 'Pricing', '/pricing', 'credit-card', 30, true),
  ('header', 'Resources', '/resources', 'book-open', 40, true),
  ('header', 'Blog', '/blog', 'newspaper', 50, true),
  ('header', 'Documentation', '/docs', 'file-text', 60, true),
  ('header', 'Extension', '/extension', 'chrome', 70, true),
  ('header', 'Customers', '/customers', 'users', 80, true)
on conflict do nothing;

insert into cms_footer (group_name, label, href, sort_order, visible)
values
  ('Product', 'Features', '/features', 10, true),
  ('Product', 'Pricing', '/pricing', 20, true),
  ('Product', 'Extension', '/download-extension', 30, true),
  ('Resources', 'Blog', '/blog', 10, true),
  ('Resources', 'Documentation', '/docs', 20, true),
  ('Company', 'About', '/about', 10, true),
  ('Company', 'Contact', '/contact', 20, true),
  ('Legal', 'Privacy Policy', '/privacy', 10, true),
  ('Legal', 'Terms', '/terms', 20, true),
  ('Legal', 'Cookie Policy', '/cookie-policy', 30, true),
  ('Legal', 'Security', '/security', 40, true)
on conflict do nothing;

insert into cms_faq (question, answer, category, sort_order, status)
values
  ('Does Community Lead Assistant send automatic DMs?', 'No. It generates and organizes outreach drafts, but every message requires human review and manual send.', 'Safety', 10, 'published'),
  ('Which platforms are supported?', 'The extension supports visible scanning on configured community platforms such as Reddit, LinkedIn, Facebook Groups, Discord, Slack, Telegram, WhatsApp, IndieHackers, Product Hunt, and X.', 'Product', 20, 'published'),
  ('Can I edit website content without code?', 'Yes. The CMS lets an owner manage pages, SEO, navigation, footer links, FAQs, testimonials, announcements, and blog content from the admin area.', 'CMS', 30, 'published')
on conflict do nothing;

insert into cms_testimonials (name, company, role, rating, review, featured, status, sort_order)
values
  ('Founder-led SaaS Team', 'B2B SaaS', 'Growth team', 5, 'Community Lead Assistant keeps lead discovery organized while keeping outreach manual and reviewed.', true, 'published', 10),
  ('Small Agency Operator', 'Growth Agency', 'Owner', 5, 'The dashboard makes it easier to qualify community leads, save context, and follow up without losing track.', true, 'published', 20)
on conflict do nothing;

insert into cms_announcements (type, title, body, cta_label, cta_href, dismissible, status, starts_at)
values
  ('product_update', 'Community Lead Assistant CMS is live', 'Manage core website content, SEO, navigation, FAQs, testimonials, and announcements from the admin CMS.', 'Open CMS', '/admin/cms', true, 'published', now())
on conflict do nothing;

insert into cms_posts (title, slug, status, excerpt, content_markdown, author_name, reading_time_minutes, seo, published_at)
values
  ('How Community Lead Assistant Keeps Outreach Manual and Safe', 'manual-safe-community-outreach', 'published', 'A short guide to using community intent signals, reviewed drafts, and manual sends safely.', '# Manual, safe community outreach\n\nCommunity Lead Assistant is designed for lead intelligence and draft organization. It does not auto-send DMs, comments, or follow-ups.\n\nUse the extension to identify visible public intent, save context, generate drafts, and manually review every message before sending.', 'Community Lead Assistant', 3, '{"title":"Manual Safe Community Outreach | Community Lead Assistant","description":"Learn how Community Lead Assistant supports reviewed, manual outreach workflows.","robots":"index,follow"}'::jsonb, now())
on conflict (slug) do update set
  title = excluded.title,
  status = excluded.status,
  excerpt = excluded.excerpt,
  content_markdown = excluded.content_markdown,
  author_name = excluded.author_name,
  reading_time_minutes = excluded.reading_time_minutes,
  seo = excluded.seo,
  published_at = coalesce(cms_posts.published_at, excluded.published_at),
  updated_at = now();

insert into cms_redirects (source_path, destination_path, status_code, enabled)
values
  ('/download', '/download-extension', 301, true),
  ('/chrome-extension', '/download-extension', 301, true)
on conflict (source_path) do update set
  destination_path = excluded.destination_path,
  status_code = excluded.status_code,
  enabled = excluded.enabled,
  updated_at = now();

insert into storage_usage_snapshots (bytes_used, source)
select 0, 'supabase'
where not exists (select 1 from storage_usage_snapshots);
