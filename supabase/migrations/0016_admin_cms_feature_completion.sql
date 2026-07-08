create extension if not exists pgcrypto;

create table if not exists admin_roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
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
  updated_at timestamptz not null default now()
);

create table if not exists admin_employees (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null,
  full_name text not null,
  company_email text not null,
  phone_number text not null default '',
  profile_picture_url text not null default '',
  position text not null default '',
  department text not null default '',
  reporting_manager text not null default '',
  joining_date date not null default current_date,
  login_email text not null,
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
  token_hash text not null,
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

create table if not exists admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  module text not null,
  action text not null,
  target_id text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists marketing_items (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  objective text not null default '',
  audience text not null default '',
  channel text not null default '',
  status text not null default 'draft',
  budget numeric(14,2) not null default 0,
  currency text not null default 'USD',
  utm_source text not null default '',
  utm_medium text not null default '',
  utm_campaign text not null default '',
  conversion_goal text not null default '',
  payload jsonb not null default '{}',
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists customer_success_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  client_name text not null,
  project_title text not null,
  lead_source text,
  project_category text not null,
  project_description text not null default '',
  date_won date not null,
  currency text not null default 'USD',
  project_value numeric(14,2) not null default 0,
  is_recurring_revenue boolean not null default false,
  notes text not null default '',
  invoice_url text,
  status text not null default 'pending_review',
  submitted_by uuid references users(id) on delete set null,
  reviewed_by uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  review_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_usage_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  login_at timestamptz not null default now(),
  logout_at timestamptz,
  duration_seconds integer not null default 0,
  ip_address text,
  browser text,
  device text,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  session_id uuid references customer_usage_sessions(id) on delete set null,
  event_type text not null,
  module_key text not null default '',
  event_label text not null default '',
  duration_seconds integer not null default 0,
  metadata jsonb not null default '{}',
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists customer_daily_progress (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  progress_date date not null default current_date,
  blogs_published integer not null default 0,
  pages_edited integer not null default 0,
  campaigns_created integer not null default 0,
  ai_credits_used integer not null default 0,
  leads_added integer not null default 0,
  knowledge_updates integer not null default 0,
  seo_tasks_completed integer not null default 0,
  outreach_activities integer not null default 0,
  files_uploaded integer not null default 0,
  productivity_score integer not null default 0,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_success_notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  project_id uuid references customer_success_projects(id) on delete set null,
  type text not null,
  title text not null,
  body text not null default '',
  severity text not null default 'info',
  status text not null default 'unread',
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table admin_roles add column if not exists name text not null default '';
alter table admin_roles add column if not exists slug text not null default '';
alter table admin_roles add column if not exists description text not null default '';
alter table admin_roles add column if not exists full_access boolean not null default false;
alter table admin_roles add column if not exists locked boolean not null default false;
alter table admin_roles add column if not exists created_at timestamptz not null default now();
alter table admin_roles add column if not exists updated_at timestamptz not null default now();

alter table admin_role_permissions add column if not exists can_publish boolean not null default false;
alter table admin_role_permissions add column if not exists can_export boolean not null default false;
alter table admin_role_permissions add column if not exists can_import boolean not null default false;
alter table admin_role_permissions add column if not exists can_approve boolean not null default false;
alter table admin_role_permissions add column if not exists can_manage_settings boolean not null default false;
alter table admin_role_permissions add column if not exists full_access boolean not null default false;
alter table admin_role_permissions add column if not exists created_at timestamptz not null default now();
alter table admin_role_permissions add column if not exists updated_at timestamptz not null default now();

alter table admin_employees add column if not exists joining_date date not null default current_date;
alter table admin_employees add column if not exists role_id uuid references admin_roles(id) on delete set null;

alter table marketing_items add column if not exists objective text not null default '';
alter table marketing_items add column if not exists audience text not null default '';
alter table marketing_items add column if not exists channel text not null default '';
alter table marketing_items add column if not exists budget numeric(14,2) not null default 0;
alter table marketing_items add column if not exists currency text not null default 'USD';
alter table marketing_items add column if not exists utm_source text not null default '';
alter table marketing_items add column if not exists utm_medium text not null default '';
alter table marketing_items add column if not exists utm_campaign text not null default '';
alter table marketing_items add column if not exists conversion_goal text not null default '';
alter table marketing_items add column if not exists created_by uuid;
alter table marketing_items add column if not exists updated_by uuid;
alter table marketing_items add column if not exists deleted_at timestamptz;

create unique index if not exists admin_roles_slug_unique on admin_roles(slug);
create unique index if not exists admin_role_permissions_unique on admin_role_permissions(role_id, module_key);
create unique index if not exists admin_employees_employee_id_unique on admin_employees(employee_id);
create unique index if not exists admin_employees_company_email_unique on admin_employees(lower(company_email));
create unique index if not exists admin_employees_login_email_unique on admin_employees(lower(login_email));
create unique index if not exists admin_employee_sessions_token_unique on admin_employee_sessions(token_hash);
create unique index if not exists customer_daily_progress_unique on customer_daily_progress(workspace_id, user_id, progress_date);

create index if not exists admin_role_permissions_module_idx on admin_role_permissions(module_key);
create index if not exists admin_employees_status_idx on admin_employees(status, updated_at desc);
create index if not exists admin_employees_joining_date_idx on admin_employees(joining_date desc);
create index if not exists admin_employee_requests_status_idx on admin_employee_access_requests(status, created_at desc);
create index if not exists admin_employee_activity_created_idx on admin_employee_activity_logs(created_at desc);
create index if not exists marketing_items_type_status_idx on marketing_items(type, status, updated_at desc);
create index if not exists marketing_items_channel_idx on marketing_items(channel, updated_at desc);
create index if not exists customer_success_projects_workspace_status_idx on customer_success_projects(workspace_id, status, date_won desc);
create index if not exists customer_usage_sessions_user_login_idx on customer_usage_sessions(user_id, login_at desc);
create index if not exists customer_activity_events_module_idx on customer_activity_events(module_key, occurred_at desc);
create index if not exists customer_daily_progress_workspace_date_idx on customer_daily_progress(workspace_id, progress_date desc);
create index if not exists customer_success_notifications_status_idx on customer_success_notifications(status, created_at desc);

alter table admin_roles enable row level security;
alter table admin_role_permissions enable row level security;
alter table admin_employees enable row level security;
alter table admin_employee_sessions enable row level security;
alter table admin_employee_access_requests enable row level security;
alter table admin_employee_activity_logs enable row level security;
alter table admin_audit_logs enable row level security;
alter table marketing_items enable row level security;
alter table customer_success_projects enable row level security;
alter table customer_usage_sessions enable row level security;
alter table customer_activity_events enable row level security;
alter table customer_daily_progress enable row level security;
alter table customer_success_notifications enable row level security;

insert into admin_roles (name, slug, description, full_access, locked)
values
  ('Owner', 'owner', 'Product owner with unrestricted platform access.', true, true),
  ('Super Admin', 'super-admin', 'Unrestricted internal admin with employee IAM, CMS, billing, security, and system access.', true, true),
  ('Administrator', 'administrator', 'Broad operational access without ownership lock.', false, false),
  ('Admin', 'admin', 'Internal administrator with broad CMS and operations access.', false, false),
  ('Manager', 'manager', 'Team manager with dashboard, campaign, lead, and approval visibility.', false, false),
  ('Marketing', 'marketing', 'Marketing campaigns, audiences, UTM, referrals, and reports.', false, false),
  ('Marketing Executive', 'marketing-executive', 'Marketing, campaigns, CMS, announcements, and analytics access.', false, false),
  ('Sales', 'sales', 'Lead, campaign, outreach, and customer success workflows.', false, false),
  ('Sales Executive', 'sales-executive', 'Sales pipeline, lead, and outreach workflows.', false, false),
  ('SEO', 'seo', 'Website editor SEO, redirects, metadata, and analytics visibility.', false, false),
  ('SEO Executive', 'seo-executive', 'SEO, redirects, metadata, and analytics visibility.', false, false),
  ('Developer', 'developer', 'QA, website editor, integrations, extension, and logs.', false, false),
  ('Designer', 'designer', 'Website editor and media access.', false, false),
  ('Graphic Designer', 'graphic-designer', 'Media, website editor, and brand asset access.', false, false),
  ('Video Editor', 'video-editor', 'Media and content asset access.', false, false),
  ('Content Writer', 'content-writer', 'Content, website editor, and publishing workflow access.', false, false),
  ('Support', 'support', 'Support visibility for users, workspaces, logs, and issue investigation.', false, false),
  ('QA', 'qa', 'QA center, extension, and system issue visibility.', false, false),
  ('Finance', 'finance', 'Billing and finance reporting access.', false, false),
  ('HR', 'hr', 'Employee directory and internal access visibility.', false, false),
  ('Intern', 'intern', 'Limited view-only dashboard access.', false, false),
  ('Viewer', 'viewer', 'View-only access to approved admin modules.', false, false),
  ('Custom', 'custom', 'Editable custom role template.', false, false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  full_access = excluded.full_access,
  locked = excluded.locked,
  updated_at = now();

with modules(module_key) as (
  values
    ('dashboard'), ('website-editor'), ('cms'), ('qa'), ('analytics'), ('users'), ('workspaces'),
    ('campaigns'), ('customer-success'), ('outreach-queue'), ('leads'), ('knowledge-base'),
    ('marketing'), ('billing'), ('extension'), ('outreach-activity'), ('system-logs'), ('profile'),
    ('media'), ('forms'), ('integrations')
),
owners as (
  select id from admin_roles where slug in ('owner', 'super-admin')
)
insert into admin_role_permissions (
  role_id, module_key, can_view, can_create, can_edit, can_delete, can_publish, can_export,
  can_import, can_approve, can_manage_settings, full_access
)
select owners.id, modules.module_key, true, true, true, true, true, true, true, true, true, true
from owners cross join modules
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

with presets(role_slug, module_key, can_view, can_create, can_edit, can_delete, can_publish, can_export, can_import, can_approve, can_manage_settings) as (
  values
    ('administrator', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('administrator', 'users', true, false, true, false, false, true, false, false, false),
    ('administrator', 'workspaces', true, false, true, false, false, true, false, false, false),
    ('administrator', 'campaigns', true, true, true, false, true, true, true, true, false),
    ('administrator', 'leads', true, true, true, false, false, true, true, true, false),
    ('administrator', 'marketing', true, true, true, false, true, true, true, true, true),
    ('administrator', 'customer-success', true, true, true, false, false, true, true, true, false),
    ('administrator', 'website-editor', true, true, true, false, true, true, true, true, true),
    ('admin', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('admin', 'campaigns', true, true, true, false, true, true, true, true, false),
    ('admin', 'leads', true, true, true, false, false, true, true, true, false),
    ('admin', 'marketing', true, true, true, false, true, true, true, true, true),
    ('manager', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('manager', 'analytics', true, false, false, false, false, true, false, false, false),
    ('manager', 'campaigns', true, true, true, false, true, true, false, true, false),
    ('manager', 'leads', true, false, true, false, false, true, false, true, false),
    ('marketing', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('marketing', 'marketing', true, true, true, false, true, true, true, true, true),
    ('marketing', 'campaigns', true, true, true, false, true, true, false, false, false),
    ('marketing-executive', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('marketing-executive', 'marketing', true, true, true, false, true, true, true, false, false),
    ('sales', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('sales', 'leads', true, true, true, false, false, true, true, true, false),
    ('sales', 'customer-success', true, true, true, false, false, true, true, true, false),
    ('sales-executive', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('sales-executive', 'leads', true, true, true, false, false, true, false, false, false),
    ('sales-executive', 'outreach-queue', true, true, true, false, false, true, false, false, false),
    ('seo', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('seo', 'website-editor', true, false, true, false, true, true, false, false, true),
    ('seo-executive', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('seo-executive', 'website-editor', true, false, true, false, true, true, false, false, true),
    ('developer', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('developer', 'website-editor', true, true, true, false, true, true, true, false, true),
    ('developer', 'qa', true, true, true, false, false, true, false, false, true),
    ('developer', 'extension', true, true, true, false, false, true, false, false, true),
    ('developer', 'system-logs', true, false, false, false, false, true, false, false, false),
    ('designer', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('designer', 'website-editor', true, false, true, false, false, true, false, false, false),
    ('designer', 'media', true, true, true, false, false, true, true, false, false),
    ('content-writer', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('content-writer', 'website-editor', true, true, true, false, true, true, true, false, false),
    ('content-writer', 'knowledge-base', true, true, true, false, false, true, true, false, false),
    ('support', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('support', 'users', true, false, false, false, false, true, false, false, false),
    ('support', 'workspaces', true, false, false, false, false, true, false, false, false),
    ('support', 'system-logs', true, false, false, false, false, true, false, false, false),
    ('qa', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('qa', 'qa', true, true, true, false, false, true, false, false, false),
    ('qa', 'extension', true, false, false, false, false, true, false, false, false),
    ('finance', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('finance', 'billing', true, false, true, false, false, true, false, false, false),
    ('hr', 'dashboard', true, false, false, false, false, true, false, false, false),
    ('hr', 'profile', true, false, false, false, false, true, false, false, false),
    ('intern', 'dashboard', true, false, false, false, false, false, false, false, false),
    ('viewer', 'dashboard', true, false, false, false, false, true, false, false, false)
)
insert into admin_role_permissions (
  role_id, module_key, can_view, can_create, can_edit, can_delete, can_publish, can_export,
  can_import, can_approve, can_manage_settings
)
select
  admin_roles.id,
  presets.module_key,
  presets.can_view,
  presets.can_create,
  presets.can_edit,
  presets.can_delete,
  presets.can_publish,
  presets.can_export,
  presets.can_import,
  presets.can_approve,
  presets.can_manage_settings
from presets
join admin_roles on admin_roles.slug = presets.role_slug
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
  updated_at = now();

insert into marketing_items (type, name, objective, audience, channel, status, budget, currency, utm_source, utm_medium, utm_campaign, conversion_goal, payload)
values
  ('campaign_management', 'Founder Lead Capture Campaign', 'Generate qualified trial signups from startup communities.', 'Freelancers, agencies, founders, and growth teams', 'multi-channel', 'active', 0, 'USD', 'community', 'organic', 'founder-lead-capture', 'trial_signup', '{"sections":["campaign_management","performance_reports"]}'::jsonb),
  ('email_campaign', 'Trial Activation Email', 'Help new trial users install the extension and scan their first community.', 'Trial users', 'email', 'draft', 0, 'USD', 'product', 'email', 'trial-activation', 'extension_install', '{"subject":"Start finding community leads today","template":"activation"}'::jsonb),
  ('lead_segmentation', 'Agency Segment', 'Group agency users by platform and lead category interest.', 'Agencies', 'crm', 'active', 0, 'USD', '', '', '', 'qualified_segment', '{"rules":["plan=trial_or_paid","category=agency"]}'::jsonb),
  ('audience_list', 'High Intent Founders', 'Audience list for founders scanning Reddit, LinkedIn, and IndieHackers.', 'Founders', 'audience', 'active', 0, 'USD', '', '', '', 'lead_capture', '{"sources":["reddit","linkedin","indiehackers"]}'::jsonb),
  ('utm_management', 'Website CTA UTM Set', 'Standard UTM naming for website CTAs and download links.', 'Website visitors', 'website', 'active', 0, 'USD', 'website', 'cta', 'extension-download', 'download_extension', '{"naming":"source-medium-campaign"}'::jsonb),
  ('referral_tracking', 'Agency Referral Program', 'Track referred workspaces and customer success revenue.', 'Agency customers', 'referral', 'draft', 0, 'USD', 'referral', 'partner', 'agency-referral', 'paid_conversion', '{}'::jsonb),
  ('landing_pages', 'Agency Landing Page', 'Landing page for small agencies and lead generation teams.', 'Agencies', 'website', 'draft', 0, 'USD', 'website', 'landing_page', 'agency', 'trial_signup', '{}'::jsonb),
  ('conversion_tracking', 'Trial to Extension Install', 'Track signup to extension install conversion.', 'Trial users', 'analytics', 'active', 0, 'USD', '', '', '', 'extension_install', '{"events":["signup","extension_login","scan_started"]}'::jsonb),
  ('templates', 'Manual Outreach Template Set', 'Reusable manual outreach copy blocks for community leads.', 'All users', 'content', 'active', 0, 'USD', '', '', '', 'draft_copied', '{}'::jsonb),
  ('broadcast_emails', 'Product Update Broadcast', 'Broadcast safe feature updates to active customers.', 'Active customers', 'email', 'draft', 0, 'USD', 'product', 'email', 'feature-update', 'feature_adoption', '{}'::jsonb),
  ('automation_rules', 'Inactive Trial Nudge', 'Create reminder tasks when users do not scan in first 48 hours.', 'Inactive trial users', 'product', 'draft', 0, 'USD', 'product', 'lifecycle', 'inactive-trial', 'scan_started', '{}'::jsonb),
  ('social_scheduling', 'Weekly Community Lead Tips', 'Schedule educational posts for LinkedIn and X.', 'Founders and agencies', 'social', 'draft', 0, 'USD', 'social', 'organic', 'weekly-tips', 'website_visit', '{}'::jsonb),
  ('ab_testing', 'Homepage CTA Test', 'Compare Start Free Trial versus Download Extension CTAs.', 'Website visitors', 'website', 'draft', 0, 'USD', 'website', 'ab_test', 'homepage-cta', 'trial_signup', '{"variants":["trial","download"]}'::jsonb),
  ('performance_reports', 'Monthly Growth Report', 'Monthly marketing performance report template.', 'Internal team', 'reporting', 'active', 0, 'USD', '', '', '', 'report_viewed', '{}'::jsonb),
  ('budget_tracking', 'Organic Growth Budget', 'Track organic growth spend and campaign ROI.', 'Internal team', 'finance', 'active', 0, 'USD', '', '', '', 'roi_positive', '{}'::jsonb)
on conflict do nothing;
