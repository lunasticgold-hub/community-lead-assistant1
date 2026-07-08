import { fail, ok } from "@/lib/api-response";
import { leadToDb } from "@/lib/db-mappers";
import { bearerToken, authenticateExtensionToken } from "@/lib/extension-auth";
import { normalizeLeadPerson } from "@/lib/lead-identity";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Lead } from "@/lib/types";

type LeadDbWriteRow = ReturnType<typeof leadToDb>;
type ExistingLeadKey = { duplicate_key: string | null };
type FraudProfileRow = {
  platform: string | null;
  normalized_author_key: string | null;
  normalized_profile_key: string | null;
};

export async function POST(request: Request) {
  const auth = await authenticateExtensionToken(bearerToken(request));
  if (!auth) return fail("Unauthorized", 401);
  const body = await request.json().catch(() => ({}));
  const leads = (Array.isArray(body.leads) ? body.leads : [body.lead].filter(Boolean)) as Partial<Lead>[];
  if (!leads.length) return ok({ synced: 0 });

  const rows: LeadDbWriteRow[] = leads.map(lead => leadToDb({ ...lead, workspaceId: auth.workspaceId, ownerId: auth.userId, creatorEmail: auth.userEmail }));
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ synced: rows.length, localOnly: true });

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, plan, billing_status, monthly_lead_limit, monthly_leads_used, trial_ends_at")
    .eq("id", auth.workspaceId)
    .maybeSingle();

  if (workspace?.plan === "trial" && workspace.trial_ends_at && new Date(workspace.trial_ends_at).getTime() < Date.now()) {
    return fail("Trial ended. Upgrade to a paid plan to sync more leads.", 402);
  }

  const unblockedRows = await filterBlockedFraudProfiles(supabase, rows);
  if (!unblockedRows.length) return ok({ synced: 0, blockedFraudProfiles: rows.length });

  const duplicateKeys = unblockedRows.map(row => row.duplicate_key).filter((key): key is string => Boolean(key));
  const { data: existingRows } = duplicateKeys.length
    ? await supabase.from("leads").select("duplicate_key").eq("workspace_id", auth.workspaceId).in("duplicate_key", duplicateKeys)
    : { data: [] as ExistingLeadKey[] };
  const existing = new Set((existingRows || []).map(row => row.duplicate_key).filter((key): key is string => Boolean(key)));
  const newRows = unblockedRows.filter(row => !existing.has(row.duplicate_key));
  const remaining = Math.max(0, (workspace?.monthly_lead_limit ?? 50) - (workspace?.monthly_leads_used ?? 0));
  const allowedNewKeys = new Set(newRows.slice(0, remaining).map(row => row.duplicate_key));
  const allowedRows = unblockedRows.filter(row => existing.has(row.duplicate_key) || allowedNewKeys.has(row.duplicate_key));

  if (!allowedRows.length) {
    return fail("Lead limit reached. Upgrade to a paid plan to sync more leads.", 402);
  }

  let { error } = await supabase.from("leads").upsert(allowedRows, { onConflict: "workspace_id,duplicate_key" });
  if (error && /community_url|platform_user_id|profile_variables|current_sequence_id|current_sequence_step|creator_email|lead_category|lead_subcategory|category_confidence|global_identity_key|schema cache|column/i.test(error.message)) {
    const compatibleRows = allowedRows.map(row => {
      const {
        community_url: _communityUrl,
        platform_user_id: _platformUserId,
        profile_variables: _profileVariables,
        current_sequence_id: _currentSequenceId,
        current_sequence_step: _currentSequenceStep,
        creator_email: _creatorEmail,
        lead_category: _leadCategory,
        lead_subcategory: _leadSubcategory,
        category_confidence: _categoryConfidence,
        global_identity_key: _globalIdentityKey,
        ...rest
      } = row as LeadDbWriteRow & {
        community_url?: string;
        platform_user_id?: string;
        profile_variables?: Record<string, unknown>;
        current_sequence_id?: string | null;
        current_sequence_step?: number;
        creator_email?: string;
        lead_category?: string;
        lead_subcategory?: string;
        category_confidence?: number;
        global_identity_key?: string;
      };
      void _communityUrl;
      void _platformUserId;
      void _profileVariables;
      void _currentSequenceId;
      void _currentSequenceStep;
      void _creatorEmail;
      void _leadCategory;
      void _leadSubcategory;
      void _categoryConfidence;
      void _globalIdentityKey;
      return rest;
    });
    const retry = await supabase.from("leads").upsert(compatibleRows, { onConflict: "workspace_id,duplicate_key" });
    error = retry.error;
  }
  if (error) return fail(error.message, 500);
  if (allowedNewKeys.size) {
    await supabase
      .from("workspaces")
      .update({ monthly_leads_used: (workspace?.monthly_leads_used ?? 0) + allowedNewKeys.size })
      .eq("id", auth.workspaceId);
  }
  return ok({ synced: allowedRows.length, limitReached: allowedRows.length < rows.length, blockedFraudProfiles: rows.length - unblockedRows.length });
}

async function filterBlockedFraudProfiles(supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>, rows: LeadDbWriteRow[]) {
  const platforms = Array.from(new Set(rows.map(row => String(row.platform || "").toLowerCase()).filter(Boolean)));
  if (!platforms.length) return rows;

  const { data, error } = await supabase
    .from("lead_fraud_profiles")
    .select("platform, normalized_author_key, normalized_profile_key")
    .in("platform", platforms);

  if (error) return rows;

  const blockedAuthors = new Set<string>();
  const blockedProfiles = new Set<string>();
  ((data || []) as FraudProfileRow[]).forEach(profile => {
    const platform = String(profile.platform || "").toLowerCase();
    if (profile.normalized_author_key) blockedAuthors.add(`${platform}:${profile.normalized_author_key}`);
    if (profile.normalized_profile_key) blockedProfiles.add(`${platform}:${profile.normalized_profile_key}`);
  });

  return rows.filter(row => {
    const platform = String(row.platform || "").toLowerCase();
    const authorKey = normalizeLeadPerson(String(row.author_name || ""));
    const profileKey = normalizeLeadPerson(String(row.author_profile_url || ""));
    return !(authorKey && blockedAuthors.has(`${platform}:${authorKey}`)) && !(profileKey && blockedProfiles.has(`${platform}:${profileKey}`));
  });
}
