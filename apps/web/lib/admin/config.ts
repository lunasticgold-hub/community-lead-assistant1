import type { AdminModuleConfig, AdminModuleSlug } from "./types";

export const adminModules: AdminModuleConfig[] = [
  {
    slug: "analytics",
    title: "Analytics",
    description: "Traffic, conversion, active usage, and product analytics.",
    table: "analytics_events",
    defaultSort: "created_at",
    searchable: ["event_name", "source", "path", "country"],
    actions: ["view", "delete"],
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "event_name", label: "Event", sortable: true, editable: true },
      { key: "source", label: "Source", filterable: true, editable: true },
      { key: "path", label: "Path", editable: true },
      { key: "country", label: "Country", editable: true },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "users",
    title: "Users",
    description: "Manage customers, trials, limits, status, and impersonation.",
    table: "users",
    defaultSort: "created_at",
    searchable: ["email", "name", "account_status", "plan"],
    actions: ["view", "edit", "suspend", "unsuspend", "resetTrial", "extendTrial", "upgradePlan", "downgradePlan", "impersonate", "delete"],
    exportEnabled: true,
    columns: [
      { key: "name", label: "Name", sortable: true, editable: true },
      { key: "email", label: "Email", type: "email", sortable: true, editable: true },
      { key: "plan", label: "Plan", filterable: true, editable: true },
      { key: "account_status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "leads_used", label: "Leads Used", type: "number", sortable: true, editable: true },
      { key: "ai_credits_used", label: "AI Credits", type: "number", sortable: true, editable: true },
      { key: "storage_used_bytes", label: "Storage", type: "number", sortable: true },
      { key: "created_at", label: "Signup Date", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "workspaces",
    title: "Workspaces",
    description: "Workspace ownership, members, billing, campaigns, leads, and storage.",
    table: "workspaces",
    defaultSort: "created_at",
    searchable: ["name", "plan", "billing_status"],
    actions: ["view", "edit", "transferOwnership", "disableWorkspace", "delete"],
    exportEnabled: true,
    columns: [
      { key: "name", label: "Workspace", sortable: true, editable: true },
      { key: "owner_id", label: "Owner", editable: true },
      { key: "plan", label: "Plan", filterable: true, editable: true },
      { key: "billing_status", label: "Billing", type: "status", editable: true },
      { key: "monthly_leads_used", label: "Lead Count", type: "number" },
      { key: "monthly_ai_drafts_used", label: "AI Usage", type: "number" },
      { key: "storage_used_bytes", label: "Storage", type: "number" },
      { key: "created_at", label: "Created Date", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "campaigns",
    title: "Campaigns",
    description: "Campaign status, platforms, keywords, leads generated, and conversion controls.",
    table: "campaigns",
    defaultSort: "updated_at",
    searchable: ["name", "scan_mode"],
    actions: ["view", "edit", "pause", "resume", "delete"],
    exportEnabled: true,
    columns: [
      { key: "name", label: "Campaign", sortable: true, editable: true },
      { key: "active", label: "Status", type: "boolean", filterable: true, editable: true },
      { key: "target_platforms", label: "Platforms", type: "json", editable: true },
      { key: "min_score", label: "Min Score", type: "number", sortable: true, editable: true },
      { key: "pause_after_leads", label: "Lead Target", type: "number", editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "outreach-sequences",
    title: "Outreach Sequences",
    description: "Manual-review DM sequences, windows, review limits, status, and platform targeting.",
    table: "outreach_sequences",
    defaultSort: "updated_at",
    searchable: ["name", "objective", "target_platform", "status"],
    actions: ["view", "edit", "pause", "resume", "delete"],
    exportEnabled: true,
    columns: [
      { key: "name", label: "Sequence", sortable: true, editable: true },
      { key: "objective", label: "Objective", editable: true },
      { key: "target_platform", label: "Platform", filterable: true, editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "daily_review_limit", label: "Daily Reviews", type: "number", sortable: true, editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "outreach-queue",
    title: "Draft Queue",
    description: "Manual-review drafts waiting for approval, copying, profile opening, and manual send tracking.",
    table: "outreach_draft_queue",
    defaultSort: "due_at",
    searchable: ["platform", "status", "draft_text"],
    actions: ["view", "edit", "delete"],
    exportEnabled: true,
    columns: [
      { key: "platform", label: "Platform", filterable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "step_order", label: "Step", type: "number", sortable: true },
      { key: "due_at", label: "Due", type: "datetime", sortable: true },
      { key: "sent_manually_at", label: "Sent Manually", type: "datetime" },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "lead-sequences",
    title: "Lead Sequences",
    description: "Lead enrollment state, current step, reply pauses, and completion tracking.",
    table: "lead_sequences",
    defaultSort: "updated_at",
    searchable: ["status"],
    actions: ["view", "edit", "delete"],
    exportEnabled: true,
    columns: [
      { key: "lead_id", label: "Lead" },
      { key: "sequence_id", label: "Sequence" },
      { key: "current_step_order", label: "Current Step", type: "number", sortable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "replied_at", label: "Replied", type: "datetime" },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "leads",
    title: "Leads",
    description: "Search, filter, export, and moderate captured leads.",
    table: "leads",
    defaultSort: "created_at",
    searchable: ["author_name", "platform", "community_name", "community_url", "source_url", "post_text", "status", "lead_temperature"],
    actions: ["view", "edit", "delete"],
    exportEnabled: true,
    columns: [
      { key: "author_name", label: "Lead", sortable: true, editable: true },
      { key: "platform", label: "Platform", filterable: true, editable: true },
      { key: "community_name", label: "Community", filterable: true, editable: true },
      { key: "community_url", label: "Community Link", type: "url", editable: true },
      { key: "source_url", label: "Source Link", type: "url", editable: true },
      { key: "lead_score", label: "Score", type: "number", sortable: true, editable: true },
      { key: "lead_temperature", label: "Temperature", type: "status", filterable: true, editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "knowledge-base",
    title: "Knowledge Base",
    description: "Customer service descriptions, offers, uploaded context, and draft rules.",
    table: "knowledge_bases",
    defaultSort: "updated_at",
    searchable: ["name", "my_service", "offer", "icp"],
    actions: ["view", "edit", "delete"],
    exportEnabled: true,
    columns: [
      { key: "name", label: "Name", sortable: true, editable: true },
      { key: "my_service", label: "Service", editable: true },
      { key: "offer", label: "Offer", editable: true },
      { key: "icp", label: "ICP", editable: true },
      { key: "tone", label: "Tone", editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "blogs",
    title: "Blogs",
    description: "Blog CMS with drafts, publishing, scheduling, markdown, media, and SEO.",
    table: "blog_posts",
    defaultSort: "updated_at",
    searchable: ["title", "slug", "excerpt", "author_name", "status"],
    actions: ["view", "edit", "draft", "publish", "schedule", "delete"],
    createEnabled: true,
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "title", label: "Title", sortable: true, editable: true },
      { key: "slug", label: "Slug", editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "author_name", label: "Author", editable: true },
      { key: "excerpt", label: "Excerpt", type: "textarea", editable: true },
      { key: "seo_title", label: "SEO Title", editable: true },
      { key: "meta_description", label: "Meta Description", type: "textarea", editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "seo",
    title: "SEO",
    description: "Meta tags, canonicals, robots, sitemap data, redirects, schema, and reports.",
    table: "seo_entries",
    defaultSort: "updated_at",
    searchable: ["page_path", "meta_title", "meta_description", "canonical_url"],
    actions: ["view", "edit", "delete"],
    createEnabled: true,
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "page_path", label: "Page", sortable: true, editable: true },
      { key: "meta_title", label: "Meta Title", editable: true },
      { key: "meta_description", label: "Description", type: "textarea", editable: true },
      { key: "canonical_url", label: "Canonical", type: "url", editable: true },
      { key: "robots", label: "Robots", editable: true },
      { key: "indexing", label: "Indexing", type: "status", filterable: true, editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "marketing",
    title: "Marketing",
    description: "Announcements, feature flags, testimonials, landing pages, newsletters, popups, referrals, and promo codes.",
    table: "marketing_items",
    defaultSort: "updated_at",
    searchable: ["name", "type", "status"],
    actions: ["view", "edit", "publish", "draft", "delete"],
    createEnabled: true,
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "name", label: "Name", sortable: true, editable: true },
      { key: "type", label: "Type", filterable: true, editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "payload", label: "Payload", type: "json", editable: true },
      { key: "starts_at", label: "Starts", type: "datetime", editable: true },
      { key: "ends_at", label: "Ends", type: "datetime", editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "billing",
    title: "Billing",
    description: "Stripe customers, subscriptions, invoices, payments, refunds, coupons, MRR, ARR, and churn.",
    table: "stripe_subscriptions",
    defaultSort: "created_at",
    searchable: ["stripe_customer_id", "stripe_subscription_id", "status", "plan_name"],
    actions: ["view", "edit"],
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "stripe_customer_id", label: "Customer" },
      { key: "stripe_subscription_id", label: "Subscription" },
      { key: "plan_name", label: "Plan", filterable: true, editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "mrr_cents", label: "MRR", type: "number", sortable: true, editable: true },
      { key: "current_period_end", label: "Period End", type: "datetime" }
    ]
  },
  {
    slug: "ai-monitoring",
    title: "AI Monitoring",
    description: "Gemini requests, tokens, cost, latency, failures, and monthly AI usage.",
    table: "ai_usage_events",
    defaultSort: "created_at",
    searchable: ["provider", "model", "status", "error_message"],
    actions: ["view", "delete"],
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "provider", label: "Provider", filterable: true },
      { key: "model", label: "Model", filterable: true },
      { key: "status", label: "Status", type: "status", filterable: true },
      { key: "tokens_total", label: "Tokens", type: "number", sortable: true },
      { key: "cost_cents", label: "Cost", type: "number", sortable: true },
      { key: "latency_ms", label: "Latency", type: "number", sortable: true },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "extension",
    title: "Extension",
    description: "Installed users, version distribution, events, scans, errors, and crash reports.",
    table: "extension_installs",
    defaultSort: "last_seen_at",
    searchable: ["extension_version", "browser", "status"],
    actions: ["view", "delete"],
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "extension_version", label: "Version", filterable: true },
      { key: "browser", label: "Browser", filterable: true },
      { key: "status", label: "Status", type: "status", filterable: true },
      { key: "community_scan_count", label: "Scan Count", type: "number", sortable: true },
      { key: "last_seen_at", label: "Last Seen", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "extension-events",
    title: "Extension Events",
    description: "User extension activity including scan starts, scanned communities, source links, lead saves, sync failures, and exports.",
    table: "usage_events",
    defaultSort: "created_at",
    searchable: ["event_type", "platform", "extension_version"],
    actions: ["view", "delete"],
    exportEnabled: true,
    columns: [
      { key: "event_type", label: "Event", filterable: true },
      { key: "platform", label: "Platform", filterable: true },
      { key: "user_id", label: "User" },
      { key: "workspace_id", label: "Workspace" },
      { key: "extension_version", label: "Version", filterable: true },
      { key: "metadata", label: "Community / Source Details", type: "json" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "outreach-activity",
    title: "Outreach Activity",
    description: "Immutable log of queueing, copy, profile open, manual send, and reply events.",
    table: "outreach_activity_events",
    defaultSort: "created_at",
    searchable: ["event_type"],
    actions: ["view", "delete"],
    exportEnabled: true,
    columns: [
      { key: "event_type", label: "Event", filterable: true },
      { key: "lead_id", label: "Lead" },
      { key: "sequence_id", label: "Sequence" },
      { key: "queue_item_id", label: "Queue Item" },
      { key: "metadata", label: "Metadata", type: "json" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "system-logs",
    title: "System Logs",
    description: "Authentication, API, AI, error, audit, and webhook logs.",
    table: "system_logs",
    defaultSort: "created_at",
    searchable: ["level", "source", "message"],
    actions: ["view", "delete"],
    exportEnabled: true,
    optionalTable: true,
    columns: [
      { key: "level", label: "Level", type: "status", filterable: true },
      { key: "source", label: "Source", filterable: true },
      { key: "message", label: "Message", type: "textarea" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "settings",
    title: "Settings",
    description: "Site name, logo, SMTP, OAuth, Google, Stripe, Gemini, extension, API keys, and maintenance mode.",
    table: "admin_settings",
    defaultSort: "updated_at",
    searchable: ["group_name", "key"],
    actions: ["view", "edit", "delete"],
    createEnabled: true,
    optionalTable: true,
    columns: [
      { key: "group_name", label: "Group", filterable: true, editable: true },
      { key: "key", label: "Key", sortable: true, editable: true },
      { key: "value", label: "Value", type: "json", editable: true },
      { key: "is_secret", label: "Secret", type: "boolean", editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "profile",
    title: "Profile",
    description: "Admin profile, change password readiness, 2FA readiness, and session history.",
    table: "auth_logs",
    defaultSort: "created_at",
    searchable: ["event_type", "ip_address", "user_agent"],
    actions: ["view", "delete"],
    optionalTable: true,
    columns: [
      { key: "event_type", label: "Event", filterable: true },
      { key: "ip_address", label: "IP" },
      { key: "user_agent", label: "Session" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  }
];

export const sidebarItems = [
  { href: "/admin", label: "Dashboard" },
  ...adminModules.map(module => ({ href: `/admin/${module.slug}`, label: module.title }))
];

export function getAdminModule(slug: string): AdminModuleConfig | undefined {
  return adminModules.find(module => module.slug === slug);
}

export function isAdminModuleSlug(slug: string): slug is AdminModuleSlug {
  return Boolean(getAdminModule(slug));
}
