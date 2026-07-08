create extension if not exists pgcrypto;

create table if not exists admin_employees (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null unique,
  full_name text not null,
  company_email text not null unique,
  phone_number text not null default '',
  profile_picture_url text not null default '',
  position text not null default '',
  department text not null default '',
  reporting_manager text not null default '',
  joining_date date,
  login_email text not null unique,
  password_hash text not null default '',
  password_salt text not null default '',
  password_iterations integer not null default 210000,
  password_algorithm text not null default 'pbkdf2_sha256',
  force_password_change boolean not null default true,
  send_credentials_by_email boolean not null default false,
  role_id uuid references admin_roles(id) on delete set null,
  status text not null default 'active',
  two_factor_enabled boolean not null default false,
  last_login_at timestamptz,
  login_count integer not null default 0,
  failed_login_count integer not null default 0,
  last_login_ip text not null default '',
  last_login_browser text not null default '',
  last_login_device text not null default '',
  suspended_at timestamptz,
  suspended_by uuid,
  disabled_at timestamptz,
  deleted_at timestamptz,
  notes text not null default '',
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_employee_sessions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references admin_employees(id) on delete cascade,
  token_hash text not null unique,
  ip_address text not null default '',
  user_agent text not null default '',
  browser text not null default '',
  device text not null default '',
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists admin_employee_access_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references admin_employees(id) on delete cascade,
  requested_module text not null,
  requested_permission text not null default 'view',
  reason text not null default '',
  status text not null default 'pending',
  manager_notes text not null default '',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_employee_activity_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references admin_employees(id) on delete set null,
  actor_id uuid,
  actor_type text not null default 'system',
  action text not null,
  module text not null default 'employee-iam',
  ip_address text not null default '',
  user_agent text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table admin_team_members
  add column if not exists employee_record_id uuid references admin_employees(id) on delete set null;

create index if not exists admin_employees_login_email_idx on admin_employees(login_email);
create index if not exists admin_employees_status_idx on admin_employees(status, updated_at desc);
create index if not exists admin_employees_role_idx on admin_employees(role_id);
create index if not exists admin_employee_sessions_token_idx on admin_employee_sessions(token_hash);
create index if not exists admin_employee_sessions_employee_idx on admin_employee_sessions(employee_id, expires_at desc);
create index if not exists admin_employee_requests_status_idx on admin_employee_access_requests(status, created_at desc);
create index if not exists admin_employee_activity_created_idx on admin_employee_activity_logs(created_at desc);

alter table admin_employees enable row level security;
alter table admin_employee_sessions enable row level security;
alter table admin_employee_access_requests enable row level security;
alter table admin_employee_activity_logs enable row level security;

insert into admin_roles (name, slug, description, full_access, locked)
values
  ('Super Admin', 'super-admin', 'Unrestricted internal admin with access to employee IAM, CMS, billing, security, and all system modules.', true, true),
  ('Admin', 'admin', 'Internal administrator with broad CMS and operations access, excluding highest-risk employee credential actions.', false, false),
  ('Manager', 'manager', 'Team manager with dashboard, campaign, lead, content, and approval visibility.', false, false),
  ('Developer', 'developer', 'Developer access for QA, website editor, integrations, extension, and logs.', false, false),
  ('Content Writer', 'content-writer', 'Content and blog publishing workflow access.', false, false),
  ('SEO Executive', 'seo-executive', 'SEO, redirects, metadata, and analytics visibility.', false, false),
  ('Graphic Designer', 'graphic-designer', 'Media, website editor, and brand asset access.', false, false),
  ('Video Editor', 'video-editor', 'Media and content asset access.', false, false),
  ('Marketing Executive', 'marketing-executive', 'Marketing, campaigns, CMS, announcements, and analytics access.', false, false),
  ('Sales Executive', 'sales-executive', 'Leads, campaigns, outreach activity, and CRM workflow access.', false, false),
  ('HR', 'hr', 'Employee directory view and support workflow access.', false, false),
  ('Finance', 'finance', 'Billing, invoices, plan, and finance reporting access.', false, false),
  ('Support', 'support', 'Support visibility for users, workspaces, logs, and issue investigation.', false, false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  full_access = excluded.full_access,
  locked = excluded.locked,
  updated_at = now();

with modules(module_key) as (
  values
    ('dashboard'), ('website-editor'), ('cms'), ('qa'), ('analytics'), ('users'), ('workspaces'),
    ('campaigns'), ('customer-success'), ('outreach-queue'), ('leads'), ('knowledge-base'), ('blogs'), ('seo'),
    ('marketing'), ('billing'), ('extension'), ('outreach-activity'),
    ('system-logs'), ('profile'), ('media'), ('forms'), ('integrations')
),
super_admin as (
  select id from admin_roles where slug = 'super-admin'
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
  super_admin.id,
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
from super_admin cross join modules
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

with presets(role_slug, module_key, can_view, can_create, can_edit, can_delete) as (
  values
    ('content-writer', 'dashboard', true, false, false, false),
    ('content-writer', 'blogs', true, true, true, false),
    ('content-writer', 'knowledge-base', true, true, true, false),
    ('content-writer', 'cms', true, true, true, false),
    ('seo-executive', 'dashboard', true, false, false, false),
    ('seo-executive', 'seo', true, true, true, false),
    ('seo-executive', 'analytics', true, false, false, false),
    ('seo-executive', 'blogs', true, false, true, false),
    ('graphic-designer', 'dashboard', true, false, false, false),
    ('graphic-designer', 'media', true, true, true, false),
    ('graphic-designer', 'website-editor', true, false, true, false),
    ('video-editor', 'dashboard', true, false, false, false),
    ('video-editor', 'media', true, true, true, false),
    ('marketing-executive', 'dashboard', true, false, false, false),
    ('marketing-executive', 'marketing', true, true, true, false),
    ('marketing-executive', 'campaigns', true, true, true, false),
    ('marketing-executive', 'analytics', true, false, false, false),
    ('sales-executive', 'dashboard', true, false, false, false),
    ('sales-executive', 'customer-success', true, true, true, false),
    ('sales-executive', 'leads', true, true, true, false),
    ('sales-executive', 'campaigns', true, false, true, false),
    ('sales-executive', 'outreach-queue', true, true, true, false),
    ('sales-executive', 'outreach-activity', true, false, false, false),
    ('developer', 'dashboard', true, false, false, false),
    ('developer', 'website-editor', true, true, true, false),
    ('developer', 'qa', true, true, true, false),
    ('developer', 'extension', true, true, true, false),
    ('developer', 'system-logs', true, false, false, false),
    ('finance', 'dashboard', true, false, false, false),
    ('finance', 'billing', true, false, true, false),
    ('finance', 'analytics', true, false, false, false),
    ('support', 'dashboard', true, false, false, false),
    ('support', 'customer-success', true, false, true, false),
    ('support', 'users', true, false, false, false),
    ('support', 'workspaces', true, false, false, false),
    ('support', 'system-logs', true, false, false, false),
    ('hr', 'dashboard', true, false, false, false),
    ('manager', 'dashboard', true, false, false, false),
    ('manager', 'analytics', true, false, false, false),
    ('manager', 'leads', true, false, true, false),
    ('manager', 'campaigns', true, true, true, false),
    ('admin', 'dashboard', true, false, false, false),
    ('admin', 'analytics', true, false, false, false),
    ('admin', 'users', true, false, true, false),
    ('admin', 'workspaces', true, false, true, false),
    ('admin', 'campaigns', true, true, true, false),
    ('admin', 'leads', true, true, true, false),
    ('admin', 'blogs', true, true, true, false),
    ('admin', 'seo', true, true, true, false),
    ('admin', 'marketing', true, true, true, false),
)
insert into admin_role_permissions (role_id, module_key, can_view, can_create, can_edit, can_delete)
select admin_roles.id, presets.module_key, presets.can_view, presets.can_create, presets.can_edit, presets.can_delete
from presets
join admin_roles on admin_roles.slug = presets.role_slug
on conflict (role_id, module_key) do update set
  can_view = excluded.can_view,
  can_create = excluded.can_create,
  can_edit = excluded.can_edit,
  can_delete = excluded.can_delete,
  updated_at = now();
