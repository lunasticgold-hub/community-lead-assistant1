insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'application/pdf',
    'application/zip'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
  updated_at timestamptz not null default now()
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
  storage_path text not null,
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
  updated_at timestamptz not null default now()
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
  updated_at timestamptz not null default now()
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
  updated_at timestamptz not null default now()
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

create index if not exists cms_pages_status_idx on cms_pages(status);
create index if not exists cms_pages_slug_idx on cms_pages(slug);
create index if not exists cms_sections_page_order_idx on cms_sections(page_id, sort_order);
create index if not exists cms_media_folder_idx on cms_media(folder, created_at desc);
create index if not exists cms_posts_status_idx on cms_posts(status);
create index if not exists cms_posts_slug_idx on cms_posts(slug);
create index if not exists cms_posts_category_idx on cms_posts(category_id);
create index if not exists cms_navigation_location_idx on cms_navigation(location, sort_order);
create index if not exists cms_faq_category_idx on cms_faq(category, sort_order);
create index if not exists cms_announcements_status_idx on cms_announcements(status, starts_at, ends_at);
create index if not exists cms_redirects_source_idx on cms_redirects(source_path);
create index if not exists cms_newsletter_status_idx on cms_newsletter_subscribers(status, created_at desc);

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
