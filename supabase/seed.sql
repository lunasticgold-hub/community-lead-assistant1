insert into users (id, email, name)
values ('00000000-0000-0000-0000-000000000001', 'founder@example.com', 'Demo Founder')
on conflict (email) do nothing;

insert into workspaces (id, name, owner_id, plan, billing_status, monthly_lead_limit, monthly_ai_draft_limit)
values ('00000000-0000-0000-0000-000000000010', 'Acme Growth Studio', '00000000-0000-0000-0000-000000000001', 'trial', 'trialing', 50, 50)
on conflict (id) do nothing;

insert into workspace_members (workspace_id, user_id, role)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'owner')
on conflict (workspace_id, user_id) do nothing;

insert into knowledge_bases (id, workspace_id, my_service, offer, icp, proof, cta, tone, blocked_words)
values (
  '00000000-0000-0000-0000-000000000020',
  '00000000-0000-0000-0000-000000000010',
  'B2B lead generation and outbound sales support',
  'A practical lead generation system that helps book qualified sales conversations.',
  'B2B SaaS founders, agencies, consultants, and service businesses.',
  'Targeted lead lists, sharp positioning, and manual review before outreach.',
  'Open to a quick chat?',
  'Friendly, concise, useful, not pushy.',
  '["guaranteed", "spam", "blast", "bot"]'::jsonb
) on conflict (id) do nothing;

insert into template_sets (id, workspace_id, short_direct, friendly, service_specific, follow_up_1, follow_up_2, final_follow_up)
values (
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000010',
  'Hi {author}, saw your post in {community} about {matched_keywords}. I help with {my_service}. {cta}',
  'Hi {author}, noticed your {platform} post about {matched_keywords}. This caught my eye because {offer}. {cta}',
  'Hi {author}, I help {icp} with {my_service}. Based on your post, {offer} may be relevant. {proof} {cta}',
  'Hi {author}, just following up on your post about {matched_keywords}.',
  'Hi {author}, quick second follow-up. Happy to send a few ideas around {offer}.',
  'Hi {author}, closing the loop here. If this becomes a priority later, happy to help.'
) on conflict (id) do nothing;

insert into campaigns (id, workspace_id, name, target_platforms, min_score, scan_mode, pause_after_leads, template_set_id, knowledge_base_id)
values (
  '00000000-0000-0000-0000-000000000040',
  '00000000-0000-0000-0000-000000000010',
  'Founder communities',
  '["reddit", "indiehackers", "facebook", "slack", "discord", "telegram", "whatsapp"]'::jsonb,
  25,
  'review_leads',
  25,
  '00000000-0000-0000-0000-000000000030',
  '00000000-0000-0000-0000-000000000020'
) on conflict (id) do nothing;
