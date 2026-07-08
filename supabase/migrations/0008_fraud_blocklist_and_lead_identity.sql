alter table leads
  add column if not exists global_identity_key text not null default '';

update leads
set global_identity_key = concat(
  'identity:',
  lower(coalesce(platform, 'unknown')),
  ':',
  md5(lower(coalesce(nullif(author_profile_url, ''), nullif(author_name, ''), 'unknown'))),
  ':',
  md5(lower(coalesce(nullif(post_text, ''), nullif(post_snippet, ''), nullif(source_url, ''), 'empty')))
)
where global_identity_key = '';

create index if not exists leads_workspace_global_identity_idx on leads(workspace_id, global_identity_key);
create index if not exists leads_platform_author_idx on leads(platform, author_name);
create index if not exists leads_creator_email_idx on leads(creator_email);

create table if not exists lead_fraud_profiles (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  author_name text not null default '',
  author_profile_url text not null default '',
  platform_user_id text not null default '',
  normalized_author_key text,
  normalized_profile_key text,
  reason text not null default '',
  reported_by_user_id uuid references users(id) on delete set null,
  workspace_id uuid references workspaces(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists lead_fraud_profiles_platform_author_unique
  on lead_fraud_profiles(platform, normalized_author_key);

create unique index if not exists lead_fraud_profiles_platform_profile_unique
  on lead_fraud_profiles(platform, normalized_profile_key);

create index if not exists lead_fraud_profiles_created_idx
  on lead_fraud_profiles(created_at desc);

alter table lead_fraud_profiles enable row level security;
