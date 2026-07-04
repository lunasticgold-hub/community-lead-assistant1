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
  add column if not exists storage_used_bytes bigint not null default 0;

create table if not exists blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  status text not null default 'draft',
  excerpt text not null default '',
  content_markdown text not null default '',
  content_html text not null default '',
  featured_image_url text,
  author_name text not null default '',
  category_id uuid references blog_categories(id) on delete set null,
  reading_time_minutes integer not null default 1,
  seo_title text,
  meta_description text,
  seo_keywords text[] not null default '{}',
  canonical_url text,
  open_graph jsonb not null default '{}',
  twitter_card jsonb not null default '{}',
  schema_org jsonb not null default '{}',
  indexing text not null default 'index',
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists blog_post_tags (
  post_id uuid references blog_posts(id) on delete cascade,
  tag_id uuid references blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists seo_entries (
  id uuid primary key default gen_random_uuid(),
  page_path text not null unique,
  meta_title text not null,
  meta_description text not null default '',
  keywords text[] not null default '{}',
  canonical_url text,
  robots text not null default 'index,follow',
  indexing text not null default 'index',
  open_graph jsonb not null default '{}',
  twitter_card jsonb not null default '{}',
  schema_org jsonb not null default '{}',
  sitemap_priority numeric(2,1) not null default 0.5,
  sitemap_change_frequency text not null default 'weekly',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists redirects (
  id uuid primary key default gen_random_uuid(),
  source_path text not null unique,
  destination_path text not null,
  status_code integer not null default 301,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists broken_links (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  broken_url text not null,
  status_code integer,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  enabled boolean not null default false,
  rollout_percentage integer not null default 0,
  rules jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_title text,
  company text,
  quote text not null,
  avatar_url text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists landing_pages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'draft',
  content jsonb not null default '{}',
  seo_entry_id uuid references seo_entries(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'subscribed',
  source text,
  created_at timestamptz not null default now()
);

create table if not exists email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  status text not null default 'draft',
  body_markdown text not null default '',
  scheduled_at timestamptz,
  sent_at timestamptz,
  metrics jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists popup_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft',
  trigger_rules jsonb not null default '{}',
  content jsonb not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists referral_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reward_type text not null default 'credit',
  reward_value numeric not null default 0,
  enabled boolean not null default false,
  rules jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null,
  discount_value numeric not null,
  max_redemptions integer,
  redeemed_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists marketing_items (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  status text not null default 'draft',
  payload jsonb not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  module text not null,
  action text not null,
  target_id text,
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

create table if not exists auth_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_type text not null,
  ip_address text,
  user_agent text,
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

create table if not exists webhook_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  status text not null,
  payload jsonb not null default '{}',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists admin_settings (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  key text not null,
  value jsonb not null default '{}',
  is_secret boolean not null default false,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_name, key)
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

create table if not exists stripe_invoices (
  id uuid primary key default gen_random_uuid(),
  stripe_invoice_id text not null unique,
  stripe_customer_id text,
  amount_due_cents integer not null default 0,
  amount_paid_cents integer not null default 0,
  status text not null,
  hosted_invoice_url text,
  created_at timestamptz not null default now()
);

create table if not exists stripe_payments (
  id uuid primary key default gen_random_uuid(),
  stripe_payment_id text not null unique,
  stripe_customer_id text,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists stripe_refunds (
  id uuid primary key default gen_random_uuid(),
  stripe_refund_id text not null unique,
  stripe_payment_id text,
  amount_cents integer not null default 0,
  reason text,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists stripe_coupons (
  id uuid primary key default gen_random_uuid(),
  stripe_coupon_id text not null unique,
  name text,
  percent_off numeric,
  amount_off_cents integer,
  valid boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  user_id uuid,
  provider text not null default 'gemini',
  model text not null,
  status text not null,
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
  extension_version text not null,
  browser text not null default 'chrome',
  status text not null default 'active',
  community_scan_count integer not null default 0,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists extension_crash_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid,
  user_id uuid,
  extension_version text,
  error_message text not null,
  stack text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists storage_usage_snapshots (
  id uuid primary key default gen_random_uuid(),
  bytes_used bigint not null default 0,
  source text not null default 'supabase',
  created_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_status on blog_posts(status);
create index if not exists idx_blog_posts_slug on blog_posts(slug);
create index if not exists idx_seo_entries_path on seo_entries(page_path);
create index if not exists idx_analytics_events_created on analytics_events(created_at);
create index if not exists idx_admin_audit_created on admin_audit_logs(created_at);
create index if not exists idx_system_logs_created on system_logs(created_at);
create index if not exists idx_ai_usage_created on ai_usage_events(created_at);
create index if not exists idx_extension_installs_seen on extension_installs(last_seen_at);

alter table blog_categories enable row level security;
alter table blog_tags enable row level security;
alter table blog_posts enable row level security;
alter table blog_post_tags enable row level security;
alter table seo_entries enable row level security;
alter table redirects enable row level security;
alter table broken_links enable row level security;
alter table announcements enable row level security;
alter table feature_flags enable row level security;
alter table testimonials enable row level security;
alter table landing_pages enable row level security;
alter table newsletter_subscribers enable row level security;
alter table email_campaigns enable row level security;
alter table popup_campaigns enable row level security;
alter table referral_settings enable row level security;
alter table promo_codes enable row level security;
alter table marketing_items enable row level security;
alter table analytics_events enable row level security;
alter table admin_audit_logs enable row level security;
alter table system_logs enable row level security;
alter table auth_logs enable row level security;
alter table api_request_logs enable row level security;
alter table webhook_logs enable row level security;
alter table admin_settings enable row level security;
alter table stripe_customers enable row level security;
alter table stripe_subscriptions enable row level security;
alter table stripe_invoices enable row level security;
alter table stripe_payments enable row level security;
alter table stripe_refunds enable row level security;
alter table stripe_coupons enable row level security;
alter table ai_usage_events enable row level security;
alter table extension_installs enable row level security;
alter table extension_crash_reports enable row level security;
alter table storage_usage_snapshots enable row level security;
