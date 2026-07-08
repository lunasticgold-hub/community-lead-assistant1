create extension if not exists pgcrypto;

alter table users
  add column if not exists profile_photo_url text not null default '',
  add column if not exists phone_number text not null default '',
  add column if not exists company_name text not null default '',
  add column if not exists job_title text not null default '',
  add column if not exists country text not null default '',
  add column if not exists timezone text not null default 'UTC',
  add column if not exists last_login_at timestamptz,
  add column if not exists last_login_ip text not null default '',
  add column if not exists last_login_browser text not null default '',
  add column if not exists last_login_device text not null default '',
  add column if not exists login_count integer not null default 0,
  add column if not exists trial_status text not null default 'trialing',
  add column if not exists trial_expires_at timestamptz,
  add column if not exists billing_status text not null default 'trialing',
  add column if not exists renewal_date timestamptz,
  add column if not exists stripe_customer_id text not null default '',
  add column if not exists stripe_subscription_id text not null default '',
  add column if not exists monthly_leads_remaining integer not null default 50,
  add column if not exists ai_credits_remaining integer not null default 50,
  add column if not exists communities_connected integer not null default 0,
  add column if not exists chrome_extension_connected boolean not null default false,
  add column if not exists total_searches integer not null default 0,
  add column if not exists total_exports integer not null default 0,
  add column if not exists email_verified boolean not null default false,
  add column if not exists suspended_at timestamptz,
  add column if not exists suspended_until timestamptz,
  add column if not exists suspension_reason text not null default '',
  add column if not exists suspension_notes text not null default '',
  add column if not exists blocked_at timestamptz,
  add column if not exists blocked_until timestamptz,
  add column if not exists block_type text not null default '',
  add column if not exists block_reason text not null default '',
  add column if not exists block_notes text not null default '',
  add column if not exists blocked_by uuid,
  add column if not exists force_logout_after timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists archived_at timestamptz;

create table if not exists admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  full_access boolean not null default false,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references admin_roles(id) on delete cascade,
  module_key text not null,
  can_view boolean not null default false,
  can_create boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  can_publish boolean not null default false,
  can_export boolean not null default false,
  can_import boolean not null default false,
  can_approve boolean not null default false,
  can_manage_settings boolean not null default false,
  full_access boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(role_id, module_key)
);

create table if not exists admin_team_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  role_id uuid references admin_roles(id) on delete set null,
  name text not null,
  email text not null unique,
  phone text not null default '',
  department text not null default '',
  designation text not null default '',
  profile_photo_url text not null default '',
  status text not null default 'invited',
  invited_by uuid references users(id) on delete set null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  last_active_at timestamptz,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_access_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid references users(id) on delete set null,
  team_member_id uuid references admin_team_members(id) on delete cascade,
  requested_module text not null,
  requested_action text not null default 'view',
  current_role text not null default '',
  reason text not null,
  priority text not null default 'normal',
  message text not null default '',
  status text not null default 'pending',
  manager_notes text not null default '',
  approved_until timestamptz,
  resolved_by uuid references users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references users(id) on delete cascade,
  title text not null,
  body text not null default '',
  type text not null default 'info',
  read_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists admin_security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  event_type text not null,
  severity text not null default 'info',
  ip_address text not null default '',
  user_agent text not null default '',
  device text not null default '',
  location text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists admin_user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_label text not null default 'Web session',
  ip_address text not null default '',
  browser text not null default '',
  device text not null default '',
  trusted boolean not null default false,
  revoked_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists admin_api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  token_hash text not null unique,
  scopes jsonb not null default '[]',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table auth_logs
  add column if not exists severity text not null default 'info',
  add column if not exists device text not null default '',
  add column if not exists location text not null default '';

create index if not exists users_account_status_idx on users(account_status, updated_at desc);
create index if not exists users_plan_status_idx on users(plan, billing_status);
create index if not exists users_last_active_idx on users(last_active_at desc);
create index if not exists admin_team_email_idx on admin_team_members(email);
create index if not exists admin_team_status_idx on admin_team_members(status);
create index if not exists admin_role_permissions_role_idx on admin_role_permissions(role_id);
create index if not exists admin_access_requests_status_idx on admin_access_requests(status, created_at desc);
create index if not exists admin_security_user_created_idx on admin_security_events(user_id, created_at desc);
create index if not exists admin_user_sessions_user_idx on admin_user_sessions(user_id, last_seen_at desc);

alter table admin_roles enable row level security;
alter table admin_role_permissions enable row level security;
alter table admin_team_members enable row level security;
alter table admin_access_requests enable row level security;
alter table admin_notifications enable row level security;
alter table admin_security_events enable row level security;
alter table admin_user_sessions enable row level security;
alter table admin_api_tokens enable row level security;

insert into admin_roles (name, slug, description, full_access, locked)
values
  ('Owner', 'owner', 'SaaS owner with unrestricted access to every admin, CMS, billing, and security module.', true, true),
  ('Super Admin', 'super-admin', 'Senior operator with full operational access except owner-only billing secrets.', true, false),
  ('Administrator', 'administrator', 'General admin for users, workspaces, content, support, and reports.', false, false),
  ('Editor', 'editor', 'Can edit website content and drafts but cannot manage billing or users.', false, false),
  ('Content Manager', 'content-manager', 'Can manage blogs, media, FAQs, and website content.', false, false),
  ('SEO Manager', 'seo-manager', 'Can manage SEO, redirects, analytics, and metadata.', false, false),
  ('Marketing Manager', 'marketing-manager', 'Can manage announcements, landing pages, campaigns, and newsletters.', false, false),
  ('Sales Manager', 'sales-manager', 'Can manage leads, outreach queues, CRM status, and exports.', false, false),
  ('Support Agent', 'support-agent', 'Can view users, logs, support data, and limited account status.', false, false),
  ('Developer', 'developer', 'Can view system logs, integrations, APIs, extension, QA, and technical settings.', false, false),
  ('QA Tester', 'qa-tester', 'Can view QA, reports, website pages, and validation results.', false, false),
  ('Viewer', 'viewer', 'Read-only access to approved admin modules.', false, false),
  ('Custom Role', 'custom-role', 'Editable custom role template for future permission sets.', false, false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  full_access = excluded.full_access,
  locked = excluded.locked,
  updated_at = now();

with modules(module_key) as (
  values
    ('dashboard'), ('analytics'), ('users'), ('workspaces'), ('campaigns'), ('leads'),
    ('knowledge-base'), ('blogs'), ('seo'), ('marketing'), ('billing'), ('ai-monitoring'),
    ('extension'), ('outreach-activity'), ('system-logs'), ('settings'), ('profile'),
    ('website-editor'), ('cms'), ('qa'), ('media'), ('forms'), ('integrations'), ('reports')
),
owner_roles as (
  select id from admin_roles where slug in ('owner', 'super-admin')
)
insert into admin_role_permissions (
  role_id,
  module_key,
  can_view,
  can_create,
  can_edit,
  can_delete,
  can_publish,
  can_export,
  can_import,
  can_approve,
  can_manage_settings,
  full_access
)
select
  owner_roles.id,
  modules.module_key,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true
from owner_roles
cross join modules
on conflict (role_id, module_key) do update set
  can_view = excluded.can_view,
  can_create = excluded.can_create,
  can_edit = excluded.can_edit,
  can_delete = excluded.can_delete,
  can_publish = excluded.can_publish,
  can_export = excluded.can_export,
  can_import = excluded.can_import,
  can_approve = excluded.can_approve,
  can_manage_settings = excluded.can_manage_settings,
  full_access = excluded.full_access,
  updated_at = now();

with modules(module_key) as (
  values
    ('dashboard'), ('analytics'), ('blogs'), ('seo'), ('marketing'), ('website-editor'),
    ('cms'), ('media'), ('forms'), ('leads'), ('outreach-activity'), ('qa')
),
roles as (
  select id from admin_roles where slug in ('administrator', 'editor', 'content-manager', 'seo-manager', 'marketing-manager', 'sales-manager', 'support-agent', 'developer', 'qa-tester', 'viewer')
)
insert into admin_role_permissions (role_id, module_key, can_view, can_create, can_edit, can_export)
select roles.id, modules.module_key, true, roles.id in (select id from admin_roles where slug not in ('viewer', 'qa-tester')), roles.id in (select id from admin_roles where slug not in ('viewer')), true
from roles
cross join modules
on conflict (role_id, module_key) do nothing;
