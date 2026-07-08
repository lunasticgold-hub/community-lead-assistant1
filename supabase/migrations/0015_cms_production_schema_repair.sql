create extension if not exists pgcrypto;

create table if not exists cms_authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text default 'Author',
  bio text default '',
  avatar_url text default '',
  social_links jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_media_folders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text default '',
  parent_id uuid references cms_media_folders(id) on delete set null,
  sort_order integer not null default 0,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  form_type text not null default 'contact',
  fields jsonb not null default '[]'::jsonb,
  success_message text default 'Thanks, we received your message.',
  error_message text default 'Something went wrong. Please try again.',
  notification_email text default '',
  webhook_url text default '',
  status text not null default 'draft',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references cms_forms(id) on delete set null,
  submitter_name text default '',
  submitter_email text default '',
  source_url text default '',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'new',
  ip_address text default '',
  user_agent text default '',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_tracking (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  tracking_id text default '',
  script text default '',
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_integrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text default '',
  status text not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  notes text default '',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  client_name text default '',
  industry text default '',
  summary text default '',
  results jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_portfolio (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  category text default '',
  description text default '',
  project_url text default '',
  gallery jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  published_at timestamptz,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default '',
  department text default '',
  bio text default '',
  photo_url text default '',
  social_links jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status text not null default 'draft',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text default '',
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_permissions (
  id uuid primary key default gen_random_uuid(),
  role_slug text not null,
  module text not null,
  action text not null,
  allowed boolean not null default false,
  created_by text,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists cms_page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references cms_pages(id) on delete cascade,
  revision integer not null default 1,
  snapshot jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists cms_versions (
  id uuid primary key default gen_random_uuid(),
  resource_table text not null,
  resource_id uuid not null,
  revision integer not null default 1,
  snapshot jsonb not null default '{}'::jsonb,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists cms_import_jobs (
  id uuid primary key default gen_random_uuid(),
  module_slug text not null,
  status text not null default 'pending',
  file_name text default '',
  total_rows integer not null default 0,
  processed_rows integer not null default 0,
  error_message text default '',
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists cms_pages add column if not exists page_type text default 'page';
alter table if exists cms_pages add column if not exists content jsonb not null default '{}'::jsonb;
alter table if exists cms_pages add column if not exists seo jsonb not null default '{}'::jsonb;
alter table if exists cms_pages add column if not exists revision integer not null default 1;
alter table if exists cms_pages add column if not exists published_at timestamptz;
alter table if exists cms_pages add column if not exists scheduled_at timestamptz;
alter table if exists cms_pages add column if not exists created_by text;
alter table if exists cms_pages add column if not exists updated_by text;
alter table if exists cms_pages add column if not exists deleted_at timestamptz;

alter table if exists cms_sections add column if not exists hidden boolean not null default false;
alter table if exists cms_sections add column if not exists status text not null default 'published';
alter table if exists cms_sections add column if not exists created_by text;
alter table if exists cms_sections add column if not exists updated_by text;
alter table if exists cms_sections add column if not exists deleted_at timestamptz;

alter table if exists cms_media add column if not exists folder_id uuid references cms_media_folders(id) on delete set null;
alter table if exists cms_media add column if not exists status text not null default 'active';
alter table if exists cms_media add column if not exists file_size_bytes bigint not null default 0;
alter table if exists cms_media add column if not exists storage_path text default '';
alter table if exists cms_media add column if not exists tags text[] not null default '{}';
alter table if exists cms_media add column if not exists caption text default '';
alter table if exists cms_media add column if not exists width integer;
alter table if exists cms_media add column if not exists height integer;
alter table if exists cms_media add column if not exists created_by text;
alter table if exists cms_media add column if not exists updated_by text;
alter table if exists cms_media add column if not exists deleted_at timestamptz;

alter table if exists cms_categories add column if not exists status text not null default 'published';
alter table if exists cms_categories add column if not exists created_by text;
alter table if exists cms_categories add column if not exists updated_by text;
alter table if exists cms_categories add column if not exists deleted_at timestamptz;

alter table if exists cms_tags add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table if exists cms_tags add column if not exists status text not null default 'active';
alter table if exists cms_tags add column if not exists created_by text;
alter table if exists cms_tags add column if not exists updated_by text;
alter table if exists cms_tags add column if not exists updated_at timestamptz not null default now();
alter table if exists cms_tags add column if not exists deleted_at timestamptz;

alter table if exists cms_posts add column if not exists author_id uuid references cms_authors(id) on delete set null;
alter table if exists cms_posts add column if not exists author_name text default 'Admin';
alter table if exists cms_posts add column if not exists reading_time_minutes integer not null default 4;
alter table if exists cms_posts add column if not exists tags jsonb not null default '[]'::jsonb;
alter table if exists cms_posts add column if not exists seo jsonb not null default '{}'::jsonb;
alter table if exists cms_posts add column if not exists scheduled_at timestamptz;
alter table if exists cms_posts add column if not exists published_at timestamptz;
alter table if exists cms_posts add column if not exists revision integer not null default 1;
alter table if exists cms_posts add column if not exists created_by text;
alter table if exists cms_posts add column if not exists updated_by text;
alter table if exists cms_posts add column if not exists deleted_at timestamptz;

alter table if exists cms_navigation add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table if exists cms_navigation add column if not exists status text not null default 'active';
alter table if exists cms_navigation add column if not exists created_by text;
alter table if exists cms_navigation add column if not exists updated_by text;
alter table if exists cms_navigation add column if not exists deleted_at timestamptz;

alter table if exists cms_footer add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table if exists cms_footer add column if not exists status text not null default 'active';
alter table if exists cms_footer add column if not exists created_by text;
alter table if exists cms_footer add column if not exists updated_by text;
alter table if exists cms_footer add column if not exists deleted_at timestamptz;

alter table if exists cms_testimonials add column if not exists photo_url text default '';
alter table if exists cms_testimonials add column if not exists company_logo_url text default '';
alter table if exists cms_testimonials add column if not exists created_by text;
alter table if exists cms_testimonials add column if not exists updated_by text;
alter table if exists cms_testimonials add column if not exists deleted_at timestamptz;

alter table if exists cms_faq add column if not exists created_by text;
alter table if exists cms_faq add column if not exists updated_by text;
alter table if exists cms_faq add column if not exists deleted_at timestamptz;

alter table if exists cms_settings add column if not exists label text default '';
alter table if exists cms_settings add column if not exists description text default '';
alter table if exists cms_settings add column if not exists status text not null default 'active';
alter table if exists cms_settings add column if not exists created_by text;
alter table if exists cms_settings add column if not exists updated_by text;
alter table if exists cms_settings add column if not exists deleted_at timestamptz;

alter table if exists cms_announcements add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table if exists cms_announcements add column if not exists created_by text;
alter table if exists cms_announcements add column if not exists updated_by text;
alter table if exists cms_announcements add column if not exists deleted_at timestamptz;

alter table if exists cms_redirects add column if not exists notes text default '';
alter table if exists cms_redirects add column if not exists status text not null default 'active';
alter table if exists cms_redirects add column if not exists created_by text;
alter table if exists cms_redirects add column if not exists updated_by text;
alter table if exists cms_redirects add column if not exists updated_at timestamptz not null default now();
alter table if exists cms_redirects add column if not exists deleted_at timestamptz;

alter table if exists cms_landing_pages add column if not exists created_by text;
alter table if exists cms_landing_pages add column if not exists updated_by text;
alter table if exists cms_landing_pages add column if not exists deleted_at timestamptz;

alter table if exists cms_newsletter_subscribers add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table if exists cms_newsletter_subscribers add column if not exists created_by text;
alter table if exists cms_newsletter_subscribers add column if not exists updated_by text;
alter table if exists cms_newsletter_subscribers add column if not exists updated_at timestamptz not null default now();
alter table if exists cms_newsletter_subscribers add column if not exists deleted_at timestamptz;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_pages
  where coalesce(slug, '') <> ''
)
update cms_pages set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_pages.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_categories
  where coalesce(slug, '') <> ''
)
update cms_categories set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_categories.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_tags
  where coalesce(slug, '') <> ''
)
update cms_tags set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_tags.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_posts
  where coalesce(slug, '') <> ''
)
update cms_posts set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_posts.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, email, row_number() over (partition by lower(email) order by created_at, id) as rn
  from cms_authors
  where coalesce(email, '') <> ''
)
update cms_authors set email = split_part(ranked.email, '@', 1) || '+' || ranked.rn || '@' || split_part(ranked.email, '@', 2)
from ranked
where cms_authors.id = ranked.id and ranked.rn > 1 and position('@' in ranked.email) > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_media_folders
  where coalesce(slug, '') <> ''
)
update cms_media_folders set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_media_folders.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, source_path, row_number() over (partition by source_path order by created_at, id) as rn
  from cms_redirects
  where coalesce(source_path, '') <> ''
)
update cms_redirects set source_path = ranked.source_path || '-' || ranked.rn
from ranked
where cms_redirects.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_landing_pages
  where coalesce(slug, '') <> ''
)
update cms_landing_pages set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_landing_pages.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_forms
  where coalesce(slug, '') <> ''
)
update cms_forms set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_forms.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_case_studies
  where coalesce(slug, '') <> ''
)
update cms_case_studies set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_case_studies.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_portfolio
  where coalesce(slug, '') <> ''
)
update cms_portfolio set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_portfolio.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as rn
  from cms_roles
  where coalesce(slug, '') <> ''
)
update cms_roles set slug = ranked.slug || '-' || ranked.rn
from ranked
where cms_roles.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, location, label, href, row_number() over (partition by location, label, href order by created_at, id) as rn
  from cms_navigation
)
update cms_navigation set label = ranked.label || ' ' || ranked.rn
from ranked
where cms_navigation.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, group_name, key, row_number() over (partition by group_name, key order by created_at, id) as rn
  from cms_settings
)
update cms_settings set key = ranked.key || '-' || ranked.rn
from ranked
where cms_settings.id = ranked.id and ranked.rn > 1;

with ranked as (
  select id, role_slug, module, action, row_number() over (partition by role_slug, module, action order by created_at, id) as rn
  from cms_permissions
)
update cms_permissions set action = ranked.action || '-' || ranked.rn
from ranked
where cms_permissions.id = ranked.id and ranked.rn > 1;

create unique index if not exists cms_pages_slug_unique on cms_pages(slug);
create unique index if not exists cms_categories_slug_unique on cms_categories(slug);
create unique index if not exists cms_tags_slug_unique on cms_tags(slug);
create unique index if not exists cms_posts_slug_unique on cms_posts(slug);
create unique index if not exists cms_authors_email_unique on cms_authors(email);
create unique index if not exists cms_media_folders_slug_unique on cms_media_folders(slug);
create unique index if not exists cms_navigation_unique on cms_navigation(location, label, href);
create unique index if not exists cms_settings_group_key_unique on cms_settings(group_name, key);
create unique index if not exists cms_redirects_source_unique on cms_redirects(source_path);
create unique index if not exists cms_landing_pages_slug_unique on cms_landing_pages(slug);
create unique index if not exists cms_forms_slug_unique on cms_forms(slug);
create unique index if not exists cms_case_studies_slug_unique on cms_case_studies(slug);
create unique index if not exists cms_portfolio_slug_unique on cms_portfolio(slug);
create unique index if not exists cms_roles_slug_unique on cms_roles(slug);
create unique index if not exists cms_permissions_unique on cms_permissions(role_slug, module, action);

create index if not exists cms_authors_status_idx on cms_authors(status, updated_at desc);
create index if not exists cms_media_folders_parent_idx on cms_media_folders(parent_id, sort_order);
create index if not exists cms_media_deleted_idx on cms_media(deleted_at, created_at desc);
create index if not exists cms_forms_status_idx on cms_forms(status, updated_at desc);
create index if not exists cms_form_submissions_status_idx on cms_form_submissions(status, created_at desc);
create index if not exists cms_tracking_provider_idx on cms_tracking(provider, status);
create index if not exists cms_integrations_provider_idx on cms_integrations(provider, status);
create index if not exists cms_case_studies_status_idx on cms_case_studies(status, updated_at desc);
create index if not exists cms_portfolio_status_idx on cms_portfolio(status, updated_at desc);
create index if not exists cms_team_status_idx on cms_team(status, sort_order);
create index if not exists cms_roles_status_idx on cms_roles(status);
create index if not exists cms_permissions_role_idx on cms_permissions(role_slug, module);
create index if not exists cms_versions_resource_idx on cms_versions(resource_table, resource_id, revision desc);
create index if not exists cms_import_jobs_status_idx on cms_import_jobs(status, created_at desc);

alter table cms_authors enable row level security;
alter table cms_media_folders enable row level security;
alter table cms_forms enable row level security;
alter table cms_form_submissions enable row level security;
alter table cms_tracking enable row level security;
alter table cms_integrations enable row level security;
alter table cms_case_studies enable row level security;
alter table cms_portfolio enable row level security;
alter table cms_team enable row level security;
alter table cms_roles enable row level security;
alter table cms_permissions enable row level security;
alter table cms_page_revisions enable row level security;
alter table cms_versions enable row level security;
alter table cms_import_jobs enable row level security;

insert into cms_authors (name, email, role, bio, status)
values ('Admin', 'support@communityleadassistant.com', 'Admin', 'Default CMS author for product updates and documentation.', 'active')
on conflict (email) do update set name = excluded.name, role = excluded.role, updated_at = now();

insert into cms_media_folders (name, slug, description, sort_order)
values
  ('Images', 'images', 'Website images, hero graphics, and photos.', 10),
  ('Videos', 'videos', 'Product videos, testimonials, and demos.', 20),
  ('Documents', 'documents', 'PDFs, guides, and downloadable files.', 30),
  ('Icons', 'icons', 'SVG icons and small brand assets.', 40),
  ('Logos', 'logos', 'Brand and customer logos.', 50),
  ('Uploads', 'uploads', 'General uploaded media.', 60)
on conflict (slug) do update set description = excluded.description, sort_order = excluded.sort_order, updated_at = now();

insert into cms_categories (name, slug, description, sort_order, status)
values
  ('Technology', 'technology', 'Technical product and platform articles.', 10, 'published'),
  ('Marketing', 'marketing', 'Growth, community, and outreach advice.', 20, 'published'),
  ('News', 'news', 'Company and product news.', 30, 'published'),
  ('Product Updates', 'product-updates', 'Release notes and feature updates.', 40, 'published')
on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order, status = excluded.status, updated_at = now();

insert into cms_tags (name, slug, metadata)
values
  ('Lead Generation', 'lead-generation', '{}'::jsonb),
  ('Community Marketing', 'community-marketing', '{}'::jsonb),
  ('Chrome Extension', 'chrome-extension', '{}'::jsonb),
  ('SaaS', 'saas', '{}'::jsonb)
on conflict (slug) do update set name = excluded.name, metadata = excluded.metadata, updated_at = now();

insert into cms_pages (slug, title, page_type, status, content, seo, published_at)
values
  ('home', 'Home', 'homepage', 'published', '{"sections":["hero","platforms","workflow","pricing","faq"]}'::jsonb, '{"title":"Community Lead Assistant","description":"Find high-intent leads inside communities and manage manual outreach drafts."}'::jsonb, now()),
  ('about', 'About', 'about', 'published', '{"headline":"Built for safe community lead intelligence."}'::jsonb, '{"title":"About Community Lead Assistant"}'::jsonb, now()),
  ('contact', 'Contact', 'contact', 'published', '{"headline":"Contact our team","email":"support@communityleadassistant.com"}'::jsonb, '{"title":"Contact"}'::jsonb, now()),
  ('pricing', 'Pricing', 'pricing', 'published', '{"headline":"Start with a 7-day trial"}'::jsonb, '{"title":"Pricing"}'::jsonb, now()),
  ('features', 'Features', 'features', 'published', '{"headline":"Lead scanning, scoring, drafts, and follow-ups"}'::jsonb, '{"title":"Features"}'::jsonb, now()),
  ('solutions', 'Solutions', 'solutions', 'published', '{"headline":"For freelancers, agencies, and growth teams"}'::jsonb, '{"title":"Solutions"}'::jsonb, now()),
  ('resources', 'Resources', 'resources', 'published', '{"headline":"Guides and playbooks"}'::jsonb, '{"title":"Resources"}'::jsonb, now()),
  ('customers', 'Customers', 'customers', 'published', '{"headline":"Customer stories"}'::jsonb, '{"title":"Customers"}'::jsonb, now()),
  ('careers', 'Careers', 'careers', 'draft', '{"headline":"Join Community Lead Assistant"}'::jsonb, '{"title":"Careers"}'::jsonb, null),
  ('changelog', 'Changelog', 'changelog', 'published', '{"headline":"Product changelog"}'::jsonb, '{"title":"Changelog"}'::jsonb, now()),
  ('release-notes', 'Release Notes', 'release-notes', 'published', '{"headline":"Release notes"}'::jsonb, '{"title":"Release Notes"}'::jsonb, now())
on conflict (slug) do update set title = excluded.title, page_type = excluded.page_type, seo = excluded.seo, updated_at = now();

insert into cms_navigation (location, label, href, icon, sort_order, visible, metadata)
values
  ('header', 'Home', '/', 'home', 10, true, '{}'::jsonb),
  ('header', 'Features', '/features', 'sparkles', 20, true, '{}'::jsonb),
  ('header', 'Solutions', '/solutions', 'layers', 30, true, '{}'::jsonb),
  ('header', 'Pricing', '/pricing', 'credit-card', 40, true, '{}'::jsonb),
  ('header', 'Blog', '/blog', 'newspaper', 50, true, '{}'::jsonb),
  ('header', 'Contact', '/contact', 'mail', 60, true, '{}'::jsonb)
on conflict (location, label, href) do update set sort_order = excluded.sort_order, visible = excluded.visible, updated_at = now();

insert into cms_footer (group_name, label, href, sort_order, visible, metadata)
values
  ('Product', 'Features', '/features', 10, true, '{}'::jsonb),
  ('Product', 'Pricing', '/pricing', 20, true, '{}'::jsonb),
  ('Product', 'Extension', '/extension', 30, true, '{}'::jsonb),
  ('Resources', 'Blog', '/blog', 10, true, '{}'::jsonb),
  ('Resources', 'Documentation', '/documentation', 20, true, '{}'::jsonb),
  ('Company', 'About', '/about', 10, true, '{}'::jsonb),
  ('Company', 'Contact', '/contact', 20, true, '{}'::jsonb),
  ('Legal', 'Privacy Policy', '/privacy', 10, true, '{}'::jsonb),
  ('Legal', 'Terms', '/terms', 20, true, '{}'::jsonb)
on conflict do nothing;

insert into cms_settings (group_name, key, label, description, value)
values
  ('seo', 'homepage', 'Homepage SEO', 'Default homepage metadata.', '{"title":"Community Lead Assistant","description":"Find high-intent community leads and manage manual outreach drafts.","canonical":"/"}'::jsonb),
  ('seo', 'about', 'About SEO', 'Default about page metadata.', '{"title":"About Community Lead Assistant","description":"Learn about Community Lead Assistant."}'::jsonb),
  ('seo', 'contact', 'Contact SEO', 'Default contact page metadata.', '{"title":"Contact Community Lead Assistant","description":"Contact the Community Lead Assistant team."}'::jsonb),
  ('seo', 'blog', 'Blog SEO', 'Default blog metadata.', '{"title":"Community Lead Assistant Blog","description":"Community lead generation guides and product updates."}'::jsonb),
  ('seo', 'robots', 'Robots', 'Robots settings.', '{"index":true,"follow":true}'::jsonb),
  ('seo', 'sitemap', 'Sitemap', 'Sitemap generation settings.', '{"enabled":true,"includeBlog":true,"includePages":true}'::jsonb),
  ('newsletter', 'default', 'Newsletter Defaults', 'Default newsletter configuration.', '{"doubleOptIn":false,"fromName":"Community Lead Assistant"}'::jsonb),
  ('tracking', 'default', 'Tracking Defaults', 'Default analytics configuration.', '{"googleAnalytics":"","googleTagManager":"","metaPixel":""}'::jsonb),
  ('branding', 'default', 'Branding', 'Default brand settings.', '{"companyName":"Community Lead Assistant","primaryColor":"#2563eb","supportEmail":"support@communityleadassistant.com"}'::jsonb)
on conflict (group_name, key) do update set label = excluded.label, description = excluded.description, value = excluded.value, updated_at = now();

insert into cms_faq (question, answer, category, sort_order, status)
values
  ('Does Community Lead Assistant auto-send messages?', 'No. It helps users find leads and prepare manual outreach drafts that require human review and manual sending.', 'Product', 10, 'published'),
  ('Which platforms can I scan?', 'The extension focuses on supported community platforms and scans visible content only.', 'Product', 20, 'published'),
  ('Can I export CMS data?', 'Yes. CMS modules support CSV export from the admin interface.', 'CMS', 30, 'published')
on conflict do nothing;

insert into cms_testimonials (name, company, role, rating, review, featured, status, sort_order)
values ('Sample Customer', 'Community Lead Assistant', 'Founder', 5, 'A safe workflow for finding and organizing community leads.', true, 'published', 10)
on conflict do nothing;

insert into cms_announcements (type, title, body, cta_label, cta_href, dismissible, status, starts_at, metadata)
values ('product_update', 'CMS is ready', 'Manage pages, blog posts, SEO, media, navigation, and announcements from one admin portal.', 'Open CMS', '/admin/cms', true, 'published', now(), '{}'::jsonb)
on conflict do nothing;

insert into cms_posts (title, slug, status, excerpt, content_markdown, author_name, reading_time_minutes, tags, seo, published_at)
values (
  'Welcome to Community Lead Assistant',
  'welcome-to-community-lead-assistant',
  'draft',
  'A starter draft article for the CMS.',
  '# Welcome\n\nUse this draft as a starting point for your first public blog post.',
  'Admin',
  2,
  '["product-updates"]'::jsonb,
  '{"title":"Welcome to Community Lead Assistant","description":"A starter draft article for the CMS."}'::jsonb,
  null
)
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, updated_at = now();

insert into cms_redirects (source_path, destination_path, status_code, enabled, notes)
values ('/docs', '/documentation', 301, true, 'Default documentation redirect.')
on conflict (source_path) do update set destination_path = excluded.destination_path, status_code = excluded.status_code, enabled = excluded.enabled, updated_at = now();

insert into cms_forms (name, slug, form_type, fields, success_message, notification_email, status)
values (
  'Contact Form',
  'contact-form',
  'contact',
  '[{"name":"name","type":"text","required":true},{"name":"email","type":"email","required":true},{"name":"message","type":"textarea","required":true}]'::jsonb,
  'Thanks, we will reply soon.',
  'support@communityleadassistant.com',
  'published'
)
on conflict (slug) do update set fields = excluded.fields, success_message = excluded.success_message, updated_at = now();

insert into cms_tracking (provider, tracking_id, script, status, metadata)
values ('google_analytics', '', '', 'draft', '{"note":"Add measurement ID before publishing."}'::jsonb)
on conflict do nothing;

insert into cms_integrations (name, provider, status, config, notes)
values ('Google Analytics', 'google_analytics', 'draft', '{}'::jsonb, 'Add credentials in settings before activating.')
on conflict do nothing;

insert into cms_roles (name, slug, description, permissions, status)
values
  ('Super Admin', 'super-admin', 'Full CMS access.', '[{"module":"*","actions":["view","create","edit","delete"]}]'::jsonb, 'active'),
  ('Content Manager', 'content-manager', 'Manage pages, blog, media, and SEO content.', '[{"module":"blog","actions":["view","create","edit"]},{"module":"media-library","actions":["view","create","edit"]}]'::jsonb, 'active'),
  ('SEO Manager', 'seo-manager', 'Manage SEO, redirects, sitemap, and metadata.', '[{"module":"seo","actions":["view","create","edit"]},{"module":"redirects","actions":["view","create","edit"]}]'::jsonb, 'active')
on conflict (slug) do update set description = excluded.description, permissions = excluded.permissions, updated_at = now();

insert into cms_permissions (role_slug, module, action, allowed)
values
  ('super-admin', '*', 'view', true),
  ('super-admin', '*', 'create', true),
  ('super-admin', '*', 'edit', true),
  ('super-admin', '*', 'delete', true),
  ('content-manager', 'blog', 'view', true),
  ('content-manager', 'blog', 'create', true),
  ('content-manager', 'blog', 'edit', true),
  ('seo-manager', 'seo', 'view', true),
  ('seo-manager', 'seo', 'edit', true)
on conflict (role_slug, module, action) do update set allowed = excluded.allowed, updated_at = now();
