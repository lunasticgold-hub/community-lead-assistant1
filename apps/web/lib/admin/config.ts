import type { AdminModuleConfig, AdminModuleSlug } from "./types";

export const adminModules: AdminModuleConfig[] = [
  {
    slug: "analytics",
    title: "Analytics",
    description: "Traffic, conversion, extension activity, and product usage events.",
    table: "usage_events",
    defaultSort: "created_at",
    searchable: ["event_type", "platform", "extension_version"],
    actions: ["view", "delete"],
    exportEnabled: true,
    columns: [
      { key: "event_type", label: "Event", sortable: true, filterable: true },
      { key: "platform", label: "Platform", filterable: true },
      { key: "extension_version", label: "Version", filterable: true },
      { key: "workspace_id", label: "Workspace" },
      { key: "user_id", label: "User" },
      { key: "metadata", label: "Metadata", type: "json" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "users",
    title: "Users",
    description: "Manage customer portal accounts, trial usage, billing state, and account status.",
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
    slug: "customer-success",
    title: "Customer Success",
    description: "Customer revenue generated, verified project wins, usage analytics, health scores, and product value tracking.",
    table: "customer_success_projects",
    defaultSort: "created_at",
    searchable: ["client_name", "project_title", "lead_source", "project_category", "status", "currency"],
    actions: ["view", "edit", "delete"],
    createEnabled: true,
    exportEnabled: true,
    columns: [
      { key: "client_name", label: "Client", sortable: true, editable: true },
      { key: "project_title", label: "Project", sortable: true, editable: true },
      { key: "project_category", label: "Category", filterable: true, editable: true },
      { key: "date_won", label: "Date Won", type: "date", sortable: true, editable: true },
      { key: "currency", label: "Currency", editable: true },
      { key: "project_value", label: "Value", type: "number", sortable: true, editable: true },
      { key: "is_recurring_revenue", label: "Recurring", type: "boolean", filterable: true, editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
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
    slug: "leads",
    title: "Leads",
    description: "Search, filter, export, and moderate captured leads.",
    table: "leads",
    defaultSort: "created_at",
    searchable: ["author_name", "creator_email", "platform", "community_name", "community_url", "source_url", "post_text", "status", "lead_temperature", "lead_category", "lead_subcategory"],
    actions: ["view", "edit", "delete"],
    exportEnabled: true,
    columns: [
      { key: "author_name", label: "Lead", sortable: true, editable: true },
      { key: "creator_email", label: "Created By Email", type: "email", filterable: true, editable: true },
      { key: "platform", label: "Platform", filterable: true, editable: true },
      { key: "community_name", label: "Community", filterable: true, editable: true },
      { key: "community_url", label: "Community Link", type: "url", editable: true },
      { key: "source_url", label: "Source Link", type: "url", editable: true },
      { key: "lead_category", label: "Category", filterable: true, editable: true },
      { key: "lead_subcategory", label: "Subcategory", filterable: true, editable: true },
      { key: "category_confidence", label: "Category Confidence", type: "number", sortable: true, editable: true },
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
    slug: "marketing",
    title: "Marketing",
    description: "Campaigns, emails, segments, UTM links, referrals, automation, A/B tests, budgets, and performance reports.",
    table: "marketing_items",
    defaultSort: "updated_at",
    searchable: ["type", "name", "objective", "audience", "channel", "status"],
    actions: ["view", "edit", "publish", "draft", "schedule", "delete"],
    createEnabled: true,
    exportEnabled: true,
    columns: [
      { key: "name", label: "Name", sortable: true, editable: true },
      { key: "type", label: "Section", filterable: true, editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "objective", label: "Objective", editable: true },
      { key: "audience", label: "Audience", filterable: true, editable: true },
      { key: "channel", label: "Channel", filterable: true, editable: true },
      { key: "budget", label: "Budget", type: "number", sortable: true, editable: true },
      { key: "currency", label: "Currency", editable: true },
      { key: "utm_source", label: "UTM Source", editable: true },
      { key: "utm_medium", label: "UTM Medium", editable: true },
      { key: "utm_campaign", label: "UTM Campaign", editable: true },
      { key: "conversion_goal", label: "Conversion Goal", editable: true },
      { key: "payload", label: "Details", type: "json", editable: true },
      { key: "starts_at", label: "Starts", type: "datetime", editable: true },
      { key: "ends_at", label: "Ends", type: "datetime", editable: true },
      { key: "updated_at", label: "Updated", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "billing",
    title: "Billing",
    description: "Workspace plans, Stripe readiness, billing status, lead limits, trial limits, and future subscription mapping.",
    table: "workspaces",
    defaultSort: "created_at",
    searchable: ["name", "plan", "billing_status", "stripe_customer_id", "stripe_subscription_id"],
    actions: ["view", "edit"],
    exportEnabled: true,
    columns: [
      { key: "name", label: "Workspace", sortable: true },
      { key: "plan", label: "Plan", filterable: true, editable: true },
      { key: "billing_status", label: "Billing Status", type: "status", filterable: true, editable: true },
      { key: "monthly_lead_limit", label: "Lead Limit", type: "number", sortable: true, editable: true },
      { key: "monthly_leads_used", label: "Leads Used", type: "number", sortable: true },
      { key: "monthly_ai_draft_limit", label: "AI Draft Limit", type: "number", sortable: true, editable: true },
      { key: "monthly_ai_drafts_used", label: "AI Drafts Used", type: "number", sortable: true },
      { key: "stripe_customer_id", label: "Stripe Customer", editable: true },
      { key: "stripe_subscription_id", label: "Stripe Subscription", editable: true },
      { key: "trial_ends_at", label: "Trial Ends", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "extension",
    title: "Extension",
    description: "Extension usage events, platform scans, versions, sync activity, and connected workspaces.",
    table: "usage_events",
    defaultSort: "created_at",
    searchable: ["event_type", "platform", "extension_version"],
    actions: ["view", "delete"],
    exportEnabled: true,
    columns: [
      { key: "user_email", label: "User Email", type: "email" },
      { key: "event_type", label: "Event", filterable: true },
      { key: "platform", label: "Platform", filterable: true },
      { key: "extension_version", label: "Version", filterable: true },
      { key: "workspace_id", label: "Workspace" },
      { key: "metadata", label: "Metadata", type: "json" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "outreach-activity",
    title: "Outreach Activity",
    description: "Manual outreach and extension activity such as profile opens, draft copies, saves, scans, and sync events.",
    table: "usage_events",
    defaultSort: "created_at",
    searchable: ["event_type", "platform", "extension_version"],
    actions: ["view", "delete"],
    exportEnabled: true,
    columns: [
      { key: "event_type", label: "Event", filterable: true },
      { key: "platform", label: "Platform", filterable: true },
      { key: "workspace_id", label: "Workspace" },
      { key: "user_id", label: "User" },
      { key: "metadata", label: "Metadata", type: "json" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "system-logs",
    title: "System Logs",
    description: "Extension and API error logs captured from browser sessions and sync failures.",
    table: "extension_errors",
    defaultSort: "created_at",
    searchable: ["platform", "error_message", "extension_version"],
    actions: ["view", "delete"],
    exportEnabled: true,
    columns: [
      { key: "platform", label: "Platform", filterable: true },
      { key: "extension_version", label: "Version", filterable: true },
      { key: "error_message", label: "Error", type: "textarea" },
      { key: "stack", label: "Stack", type: "textarea" },
      { key: "metadata", label: "Metadata", type: "json" },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  },
  {
    slug: "profile",
    title: "Employee Access Management",
    description: "Internal Admin/CMS employee credentials, roles, permissions, sessions, and access requests.",
    table: "admin_employees",
    defaultSort: "created_at",
    searchable: ["full_name", "company_email", "login_email", "position", "department", "status"],
    actions: ["view", "edit", "delete"],
    createEnabled: true,
    exportEnabled: true,
    columns: [
      { key: "full_name", label: "Employee", sortable: true, editable: true },
      { key: "login_email", label: "Login Email", type: "email", sortable: true, editable: true },
      { key: "position", label: "Position", sortable: true, editable: true },
      { key: "department", label: "Department", filterable: true, editable: true },
      { key: "status", label: "Status", type: "status", filterable: true, editable: true },
      { key: "last_login_at", label: "Last Login", type: "datetime", sortable: true },
      { key: "created_at", label: "Created", type: "datetime", sortable: true }
    ]
  }
];

export const sidebarItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cms/website-editor", label: "Website Editor" },
  { href: "/admin/cms", label: "CMS" },
  { href: "/admin/qa", label: "QA Center" },
  ...adminModules.map(module => ({ href: `/admin/${module.slug}`, label: module.title }))
];

export function getAdminModule(slug: string): AdminModuleConfig | undefined {
  return adminModules.find(module => module.slug === slug);
}

export function isAdminModuleSlug(slug: string): slug is AdminModuleSlug {
  return Boolean(getAdminModule(slug));
}
