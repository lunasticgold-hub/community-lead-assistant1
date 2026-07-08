import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();

for (const file of [path.join(root, ".env.local"), path.join(root, "apps/web/.env.local")]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });

const tables = {
  users: ["id", "name", "email", "plan", "account_status", "leads_used", "ai_credits_used", "storage_used_bytes", "last_active_at", "created_at", "updated_at"],
  workspaces: ["id", "name", "owner_id", "plan", "billing_status", "monthly_lead_limit", "monthly_leads_used", "monthly_ai_draft_limit", "monthly_ai_drafts_used", "storage_used_bytes", "data_retention_days", "stripe_customer_id", "stripe_subscription_id", "trial_ends_at", "created_at", "updated_at"],
  campaigns: ["id", "name", "active", "target_platforms", "min_score", "pause_after_leads", "created_at", "updated_at"],
  leads: ["id", "author_name", "creator_email", "platform", "community_name", "community_url", "source_url", "lead_category", "lead_subcategory", "category_confidence", "lead_score", "lead_temperature", "status", "created_at", "updated_at"],
  knowledge_bases: ["id", "name", "my_service", "offer", "icp", "tone", "created_at", "updated_at"],
  outreach_draft_queue: ["id", "platform", "status", "step_order", "due_at", "sent_manually_at", "created_at", "updated_at"],
  usage_events: ["id", "event_type", "platform", "extension_version", "workspace_id", "user_id", "metadata", "created_at"],
  extension_errors: ["id", "platform", "extension_version", "error_message", "stack", "metadata", "created_at"],
  cms_pages: ["id", "slug", "title", "page_type", "status", "content", "seo", "published_at", "scheduled_at", "created_at", "updated_at"],
  cms_sections: ["id", "page_id", "section_key", "section_type", "sort_order", "enabled", "content", "created_at", "updated_at"],
  cms_media: ["id", "folder", "file_name", "file_type", "file_size_bytes", "storage_path", "public_url", "alt_text", "metadata", "created_at", "updated_at"],
  cms_categories: ["id", "name", "slug", "description", "sort_order", "created_at", "updated_at"],
  cms_tags: ["id", "name", "slug", "created_at"],
  cms_posts: ["id", "title", "slug", "status", "excerpt", "content_markdown", "content_json", "author_name", "tags", "reading_time_minutes", "seo", "revision", "created_at", "updated_at"],
  cms_post_revisions: ["id", "post_id", "revision", "snapshot", "created_at"],
  cms_navigation: ["id", "location", "label", "href", "icon", "sort_order", "visible", "metadata", "created_at", "updated_at"],
  cms_footer: ["id", "group_name", "label", "href", "sort_order", "visible", "created_at", "updated_at"],
  cms_testimonials: ["id", "name", "company", "role", "rating", "review", "featured", "status", "sort_order", "created_at", "updated_at"],
  cms_faq: ["id", "question", "answer", "category", "sort_order", "status", "created_at", "updated_at"],
  cms_settings: ["id", "group_name", "key", "value", "created_at", "updated_at"],
  cms_announcements: ["id", "type", "title", "body", "cta_label", "cta_href", "dismissible", "status", "starts_at", "ends_at", "created_at", "updated_at"],
  cms_redirects: ["id", "source_path", "destination_path", "status_code", "enabled", "created_at", "updated_at"],
  cms_landing_pages: ["id", "slug", "title", "status", "sections", "seo", "created_at", "updated_at"],
  cms_newsletter_subscribers: ["id", "email", "name", "status", "source", "metadata", "created_at", "updated_at"],
  admin_audit_logs: ["id", "admin_user_id", "module", "action", "target_id", "metadata", "created_at"],
  analytics_events: ["id", "event_name", "metadata", "created_at"],
  system_logs: ["id", "level", "source", "message", "metadata", "created_at"],
  api_request_logs: ["id", "route", "method", "status_code", "created_at"],
  ai_usage_events: ["id", "provider", "model", "status", "tokens_total", "created_at"],
  extension_installs: ["id", "extension_version", "browser", "status", "last_seen_at", "created_at"],
  stripe_customers: ["id", "stripe_customer_id", "email", "created_at"],
  stripe_subscriptions: ["id", "stripe_subscription_id", "plan_name", "status", "mrr_cents", "created_at"],
  storage_usage_snapshots: ["id", "bytes_used", "source", "created_at"]
};

let failed = 0;

for (const [table, columns] of Object.entries(tables)) {
  const missing = [];
  for (const column of columns) {
    const { error } = await supabase.from(table).select(column).limit(1);
    if (error) missing.push(`${column}: ${error.code || "unknown"} ${error.message || ""}`.trim());
  }

  if (missing.length) {
    failed += 1;
    console.log(`FAIL ${table}`);
    missing.forEach(item => console.log(`  - ${item}`));
  } else {
    console.log(`PASS ${table}`);
  }
}

if (failed) {
  console.error(`\n${failed} table(s) need the production repair migration.`);
  process.exit(1);
}

console.log("\nAdmin/CMS schema audit passed.");
