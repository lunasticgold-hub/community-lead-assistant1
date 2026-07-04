alter table leads
  add column if not exists platform_user_id text not null default '',
  add column if not exists profile_variables jsonb not null default '{}',
  add column if not exists current_sequence_id uuid,
  add column if not exists current_sequence_step integer not null default 0;

create table if not exists outreach_sequences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  name text not null,
  objective text not null default '',
  target_platform text not null default 'reddit',
  status text not null default 'draft',
  timezone text not null default 'UTC',
  send_window_start text not null default '09:00',
  send_window_end text not null default '18:00',
  send_days jsonb not null default '["mon","tue","wed","thu","fri"]',
  daily_review_limit integer not null default 25,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outreach_sequence_steps (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  sequence_id uuid not null references outreach_sequences(id) on delete cascade,
  step_order integer not null,
  name text not null,
  delay_hours integer not null default 0,
  template text not null default '',
  variation_count integer not null default 3,
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(sequence_id, step_order)
);

create table if not exists lead_sequences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  sequence_id uuid not null references outreach_sequences(id) on delete cascade,
  current_step_id uuid references outreach_sequence_steps(id) on delete set null,
  current_step_order integer not null default 1,
  status text not null default 'active',
  replied_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, lead_id, sequence_id)
);

create table if not exists outreach_draft_queue (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  lead_sequence_id uuid references lead_sequences(id) on delete cascade,
  sequence_id uuid references outreach_sequences(id) on delete cascade,
  step_id uuid references outreach_sequence_steps(id) on delete set null,
  step_order integer not null default 1,
  platform text not null default '',
  status text not null default 'queued',
  due_at timestamptz not null default now(),
  draft_text text not null default '',
  draft_variations jsonb not null default '[]',
  selected_variation_index integer not null default 0,
  copied_at timestamptz,
  profile_opened_at timestamptz,
  sent_manually_at timestamptz,
  approved_at timestamptz,
  failed_reason text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outreach_activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  lead_sequence_id uuid references lead_sequences(id) on delete cascade,
  queue_item_id uuid references outreach_draft_queue(id) on delete set null,
  sequence_id uuid references outreach_sequences(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists outreach_sequences_workspace_status_idx on outreach_sequences(workspace_id, status);
create index if not exists outreach_sequence_steps_sequence_order_idx on outreach_sequence_steps(sequence_id, step_order);
create index if not exists lead_sequences_workspace_status_idx on lead_sequences(workspace_id, status);
create index if not exists lead_sequences_lead_idx on lead_sequences(lead_id);
create index if not exists lead_sequences_sequence_idx on lead_sequences(sequence_id);
create index if not exists outreach_draft_queue_workspace_status_due_idx on outreach_draft_queue(workspace_id, status, due_at);
create index if not exists outreach_draft_queue_lead_idx on outreach_draft_queue(lead_id);
create index if not exists outreach_draft_queue_sequence_idx on outreach_draft_queue(sequence_id);
create index if not exists outreach_draft_queue_lead_sequence_idx on outreach_draft_queue(lead_sequence_id);
create index if not exists outreach_activity_workspace_created_idx on outreach_activity_events(workspace_id, created_at desc);
create index if not exists outreach_activity_lead_idx on outreach_activity_events(lead_id);
create index if not exists outreach_activity_sequence_idx on outreach_activity_events(sequence_id);
create index if not exists leads_current_sequence_idx on leads(current_sequence_id);

alter table leads
  drop constraint if exists leads_current_sequence_id_fkey;

alter table leads
  add constraint leads_current_sequence_id_fkey
  foreign key (current_sequence_id) references outreach_sequences(id) on delete set null;

alter table outreach_sequences enable row level security;
alter table outreach_sequence_steps enable row level security;
alter table lead_sequences enable row level security;
alter table outreach_draft_queue enable row level security;
alter table outreach_activity_events enable row level security;

drop policy if exists workspace_scoped_select on outreach_sequences;
create policy workspace_scoped_select on outreach_sequences
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = outreach_sequences.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists workspace_scoped_select on outreach_sequence_steps;
create policy workspace_scoped_select on outreach_sequence_steps
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = outreach_sequence_steps.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists workspace_scoped_select on lead_sequences;
create policy workspace_scoped_select on lead_sequences
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = lead_sequences.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists workspace_scoped_select on outreach_draft_queue;
create policy workspace_scoped_select on outreach_draft_queue
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = outreach_draft_queue.workspace_id and workspace_members.user_id = auth.uid()));

drop policy if exists workspace_scoped_select on outreach_activity_events;
create policy workspace_scoped_select on outreach_activity_events
  for select to authenticated
  using (exists (select 1 from workspace_members where workspace_members.workspace_id = outreach_activity_events.workspace_id and workspace_members.user_id = auth.uid()));
