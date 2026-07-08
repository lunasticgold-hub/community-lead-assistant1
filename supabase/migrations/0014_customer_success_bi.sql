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
  status text not null default 'pending_review' check (status in ('pending_review', 'verified', 'rejected')),
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
  updated_at timestamptz not null default now(),
  unique(workspace_id, user_id, progress_date)
);

create table if not exists customer_success_notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  project_id uuid references customer_success_projects(id) on delete set null,
  type text not null,
  title text not null,
  body text not null default '',
  severity text not null default 'info' check (severity in ('info', 'success', 'warning', 'critical')),
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists customer_success_projects_workspace_status_idx on customer_success_projects(workspace_id, status, date_won desc);
create index if not exists customer_success_projects_user_idx on customer_success_projects(user_id, date_won desc);
create index if not exists customer_success_projects_category_idx on customer_success_projects(project_category, date_won desc);
create index if not exists customer_usage_sessions_user_login_idx on customer_usage_sessions(user_id, login_at desc);
create index if not exists customer_usage_sessions_workspace_login_idx on customer_usage_sessions(workspace_id, login_at desc);
create index if not exists customer_activity_events_workspace_time_idx on customer_activity_events(workspace_id, occurred_at desc);
create index if not exists customer_activity_events_module_idx on customer_activity_events(module_key, occurred_at desc);
create index if not exists customer_daily_progress_workspace_date_idx on customer_daily_progress(workspace_id, progress_date desc);
create index if not exists customer_success_notifications_status_idx on customer_success_notifications(status, created_at desc);

alter table customer_success_projects enable row level security;
alter table customer_usage_sessions enable row level security;
alter table customer_activity_events enable row level security;
alter table customer_daily_progress enable row level security;
alter table customer_success_notifications enable row level security;

drop policy if exists customer_success_projects_member_select on customer_success_projects;
create policy customer_success_projects_member_select on customer_success_projects
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_success_projects.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists customer_success_projects_member_insert on customer_success_projects;
create policy customer_success_projects_member_insert on customer_success_projects
  for insert to authenticated
  with check (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_success_projects.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists customer_success_projects_member_update on customer_success_projects;
create policy customer_success_projects_member_update on customer_success_projects
  for update to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_success_projects.workspace_id and workspace_members.user_id = auth.uid()))
  with check (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_success_projects.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists customer_usage_sessions_member_select on customer_usage_sessions;
create policy customer_usage_sessions_member_select on customer_usage_sessions
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_usage_sessions.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists customer_activity_events_member_select on customer_activity_events;
create policy customer_activity_events_member_select on customer_activity_events
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_activity_events.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists customer_daily_progress_member_select on customer_daily_progress;
create policy customer_daily_progress_member_select on customer_daily_progress
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_daily_progress.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists customer_success_notifications_member_select on customer_success_notifications;
create policy customer_success_notifications_member_select on customer_success_notifications
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = customer_success_notifications.workspace_id and workspace_members.user_id = auth.uid()));

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
  id,
  'customer-success',
  true,
  full_access,
  full_access or slug in ('admin', 'manager', 'sales-executive', 'support'),
  full_access,
  false,
  full_access or slug in ('admin', 'manager'),
  false,
  full_access or slug in ('admin', 'manager'),
  full_access,
  full_access
from admin_roles
on conflict (role_id, module_key) do update set
  can_view = excluded.can_view,
  can_create = excluded.can_create,
  can_edit = excluded.can_edit,
  can_delete = excluded.can_delete,
  can_export = excluded.can_export,
  can_approve = excluded.can_approve,
  can_manage_settings = excluded.can_manage_settings,
  full_access = excluded.full_access,
  updated_at = now();
