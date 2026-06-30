create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'knowledge-documents',
  'knowledge-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamptz not null default now()
);

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references users(id) on delete set null,
  plan text not null default 'trial',
  billing_status text not null default 'trialing',
  monthly_lead_limit int not null default 50,
  monthly_leads_used int not null default 0,
  monthly_ai_draft_limit int not null default 50,
  monthly_ai_drafts_used int not null default 0,
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  data_retention_days int not null default 90,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  created_at timestamptz not null default now()
);

create table if not exists workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table if not exists extension_tokens (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  name text not null default 'Chrome extension',
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null default 'Default knowledge base',
  my_service text not null default '',
  offer text not null default '',
  icp text not null default '',
  pain_points jsonb not null default '[]',
  proof text not null default '',
  cta text not null default '',
  tone text not null default '',
  blocked_words jsonb not null default '[]',
  faqs jsonb not null default '[]',
  objections jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  knowledge_base_id uuid references knowledge_bases(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size_bytes bigint not null default 0,
  storage_path text not null,
  extracted_summary text not null default '',
  processing_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists keyword_groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  positive_keywords jsonb not null default '[]',
  negative_keywords jsonb not null default '[]',
  required_combinations jsonb not null default '[]',
  score_weights jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists template_sets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null default 'Default templates',
  short_direct text not null default '',
  friendly text not null default '',
  service_specific text not null default '',
  follow_up_1 text not null default '',
  follow_up_2 text not null default '',
  final_follow_up text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  target_platforms jsonb not null default '[]',
  min_score int not null default 25,
  scan_mode text not null default 'review_leads',
  pause_after_leads int not null default 25,
  keyword_group_ids jsonb not null default '[]',
  template_set_id uuid references template_sets(id) on delete set null,
  knowledge_base_id uuid references knowledge_bases(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete set null,
  platform text not null,
  community_name text not null default '',
  author_name text not null default '',
  author_profile_url text not null default '',
  source_url text not null default '',
  post_text text not null default '',
  post_snippet text not null default '',
  matched_keywords jsonb not null default '[]',
  negative_signals jsonb not null default '[]',
  lead_score int not null default 0,
  lead_temperature text not null default 'Review',
  status text not null default 'New',
  notes text not null default '',
  owner_id uuid references users(id) on delete set null,
  follow_up_date date,
  outreach_draft text not null default '',
  follow_up_draft text not null default '',
  duplicate_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, duplicate_key)
);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  extension_version text,
  event_type text not null,
  platform text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists extension_errors (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  extension_version text,
  platform text,
  error_message text not null,
  stack text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists leads_workspace_created_idx on leads(workspace_id, created_at desc);
create index if not exists leads_workspace_status_idx on leads(workspace_id, status);
create index if not exists knowledge_documents_workspace_idx on knowledge_documents(workspace_id, created_at desc);
create index if not exists usage_workspace_created_idx on usage_events(workspace_id, created_at desc);
create index if not exists extension_errors_workspace_created_idx on extension_errors(workspace_id, created_at desc);

alter table users enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table extension_tokens enable row level security;
alter table campaigns enable row level security;
alter table knowledge_bases enable row level security;
alter table knowledge_documents enable row level security;
alter table keyword_groups enable row level security;
alter table template_sets enable row level security;
alter table leads enable row level security;
alter table lead_events enable row level security;
alter table usage_events enable row level security;
alter table extension_errors enable row level security;
