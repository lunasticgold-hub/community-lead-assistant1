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
  updated_at timestamptz not null default now()
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
  updated_at timestamptz not null default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  extension_version text,
  event_type text not null,
  platform text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists cms_media_folder_ready_idx on cms_media(folder, created_at desc);
create index if not exists cms_categories_slug_ready_idx on cms_categories(slug);
create index if not exists cms_posts_status_ready_idx on cms_posts(status, updated_at desc);
create index if not exists cms_posts_slug_ready_idx on cms_posts(slug);
create index if not exists cms_settings_group_key_ready_idx on cms_settings(group_name, key);
create index if not exists cms_announcements_status_ready_idx on cms_announcements(status, starts_at, ends_at);
create index if not exists usage_events_ready_idx on usage_events(workspace_id, created_at desc);

alter table cms_media enable row level security;
alter table cms_categories enable row level security;
alter table cms_posts enable row level security;
alter table cms_settings enable row level security;
alter table cms_announcements enable row level security;
alter table usage_events enable row level security;

insert into cms_settings (group_name, key, value)
values
  ('seo', 'homepage', '{"metaTitle":"Community Lead Assistant","metaDescription":"Find high-intent leads inside communities and manage manual outreach safely.","robots":"index,follow"}'::jsonb),
  ('seo', 'blog', '{"metaTitle":"Community Lead Assistant Blog","metaDescription":"Guides for safe community lead discovery, growth, and manual outreach workflows.","robots":"index,follow"}'::jsonb),
  ('seo', 'pricing', '{"metaTitle":"Pricing | Community Lead Assistant","metaDescription":"Start with a 7-day trial and choose a plan for freelancers, agencies, and growth teams.","robots":"index,follow"}'::jsonb)
on conflict (group_name, key) do nothing;
