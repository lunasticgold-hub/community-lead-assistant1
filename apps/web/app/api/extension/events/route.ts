import { fail, ok } from "@/lib/api-response";
import { bearerToken, authenticateExtensionToken } from "@/lib/extension-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type ExtensionEventPayload = {
  extensionVersion?: string;
  extension_version?: string;
  eventType?: string;
  event_type?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const auth = await authenticateExtensionToken(bearerToken(request));
  if (!auth) return fail("Unauthorized", 401);
  const body = await request.json().catch(() => ({}));
  const events = (Array.isArray(body.events) ? body.events : [body].filter(Boolean)) as ExtensionEventPayload[];
  const rows = events.map(event => ({
    workspace_id: auth.workspaceId,
    user_id: auth.userId,
    extension_version: event.extensionVersion || event.extension_version || null,
    event_type: event.eventType || event.event_type || "unknown",
    platform: event.platform || null,
    metadata: event.metadata || {}
  }));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ synced: rows.length, localOnly: true });
  const { error } = await supabase.from("usage_events").insert(rows);
  if (error) return fail(error.message, 500);
  return ok({ synced: rows.length });
}
