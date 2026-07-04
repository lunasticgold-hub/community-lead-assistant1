alter table leads
  add column if not exists community_url text not null default '';

create index if not exists leads_workspace_platform_community_idx
  on leads(workspace_id, platform, community_name);
