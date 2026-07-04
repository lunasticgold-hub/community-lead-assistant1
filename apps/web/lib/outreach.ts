import "server-only";
import { defaultKnowledgeBase } from "@/lib/defaults";
import { leadFromDb } from "@/lib/db-mappers";
import { renderDraft } from "@/lib/drafts";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  DraftQueueStatus,
  Lead,
  LeadSequence,
  LeadSequenceStatus,
  OutreachActivityEvent,
  OutreachDraftQueueItem,
  OutreachSequence,
  OutreachSequenceStatus,
  OutreachSequenceStep
} from "@/lib/types";

type DbRow = Record<string, unknown>;

export type QueueItemWithLead = OutreachDraftQueueItem & {
  lead: Lead | null;
  sequence: OutreachSequence | null;
  step: OutreachSequenceStep | null;
};

export type SequenceWithSteps = OutreachSequence & {
  steps: OutreachSequenceStep[];
};

export type OutreachFunnel = {
  totalLeads: number;
  draftsGenerated: number;
  sentManually: number;
  repliesReceived: number;
};

function adminClient() {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");
  return supabase;
}

export function sequenceFromDb(row: DbRow): OutreachSequence {
  return {
    id: String(row.id || ""),
    workspaceId: String(row.workspace_id || ""),
    campaignId: typeof row.campaign_id === "string" ? row.campaign_id : null,
    name: String(row.name || ""),
    objective: String(row.objective || ""),
    targetPlatform: String(row.target_platform || "reddit"),
    status: parseSequenceStatus(row.status),
    timezone: String(row.timezone || "UTC"),
    sendWindowStart: String(row.send_window_start || "09:00"),
    sendWindowEnd: String(row.send_window_end || "18:00"),
    sendDays: Array.isArray(row.send_days) ? row.send_days.map(String) : ["mon", "tue", "wed", "thu", "fri"],
    dailyReviewLimit: Number(row.daily_review_limit || 25),
    createdBy: typeof row.created_by === "string" ? row.created_by : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
}

export function stepFromDb(row: DbRow): OutreachSequenceStep {
  return {
    id: String(row.id || ""),
    workspaceId: String(row.workspace_id || ""),
    sequenceId: String(row.sequence_id || ""),
    stepOrder: Number(row.step_order || 1),
    name: String(row.name || ""),
    delayHours: Number(row.delay_hours || 0),
    template: String(row.template || ""),
    variationCount: Number(row.variation_count || 3),
    locked: Boolean(row.locked),
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
}

export function leadSequenceFromDb(row: DbRow): LeadSequence {
  return {
    id: String(row.id || ""),
    workspaceId: String(row.workspace_id || ""),
    leadId: String(row.lead_id || ""),
    sequenceId: String(row.sequence_id || ""),
    currentStepId: typeof row.current_step_id === "string" ? row.current_step_id : null,
    currentStepOrder: Number(row.current_step_order || 1),
    status: parseLeadSequenceStatus(row.status),
    repliedAt: typeof row.replied_at === "string" ? row.replied_at : null,
    pausedAt: typeof row.paused_at === "string" ? row.paused_at : null,
    completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
    createdBy: typeof row.created_by === "string" ? row.created_by : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
}

export function queueItemFromDb(row: DbRow): OutreachDraftQueueItem {
  return {
    id: String(row.id || ""),
    workspaceId: String(row.workspace_id || ""),
    leadId: String(row.lead_id || ""),
    leadSequenceId: typeof row.lead_sequence_id === "string" ? row.lead_sequence_id : null,
    sequenceId: typeof row.sequence_id === "string" ? row.sequence_id : null,
    stepId: typeof row.step_id === "string" ? row.step_id : null,
    stepOrder: Number(row.step_order || 1),
    platform: String(row.platform || ""),
    status: parseQueueStatus(row.status),
    dueAt: String(row.due_at || ""),
    draftText: String(row.draft_text || ""),
    draftVariations: Array.isArray(row.draft_variations) ? row.draft_variations.map(String) : [],
    selectedVariationIndex: Number(row.selected_variation_index || 0),
    copiedAt: typeof row.copied_at === "string" ? row.copied_at : null,
    profileOpenedAt: typeof row.profile_opened_at === "string" ? row.profile_opened_at : null,
    sentManuallyAt: typeof row.sent_manually_at === "string" ? row.sent_manually_at : null,
    approvedAt: typeof row.approved_at === "string" ? row.approved_at : null,
    failedReason: typeof row.failed_reason === "string" ? row.failed_reason : null,
    createdBy: typeof row.created_by === "string" ? row.created_by : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || "")
  };
}

export function activityFromDb(row: DbRow): OutreachActivityEvent {
  return {
    id: String(row.id || ""),
    workspaceId: String(row.workspace_id || ""),
    leadId: typeof row.lead_id === "string" ? row.lead_id : null,
    leadSequenceId: typeof row.lead_sequence_id === "string" ? row.lead_sequence_id : null,
    queueItemId: typeof row.queue_item_id === "string" ? row.queue_item_id : null,
    sequenceId: typeof row.sequence_id === "string" ? row.sequence_id : null,
    userId: typeof row.user_id === "string" ? row.user_id : null,
    eventType: String(row.event_type || ""),
    metadata: isRecord(row.metadata) ? row.metadata : {},
    createdAt: String(row.created_at || "")
  };
}

export async function listSequences(workspaceId: string): Promise<SequenceWithSteps[]> {
  const supabase = adminClient();
  const [sequenceResult, stepResult] = await Promise.all([
    supabase.from("outreach_sequences").select("*").eq("workspace_id", workspaceId).order("updated_at", { ascending: false }),
    supabase.from("outreach_sequence_steps").select("*").eq("workspace_id", workspaceId).order("step_order", { ascending: true })
  ]);
  if (sequenceResult.error) throw sequenceResult.error;
  if (stepResult.error) throw stepResult.error;

  const steps = (stepResult.data || []).map(row => stepFromDb(row as DbRow));
  return (sequenceResult.data || []).map(row => {
    const sequence = sequenceFromDb(row as DbRow);
    return { ...sequence, steps: steps.filter(step => step.sequenceId === sequence.id) };
  });
}

export async function listReviewQueue(workspaceId: string, status?: DraftQueueStatus): Promise<QueueItemWithLead[]> {
  const supabase = adminClient();
  let queueQuery = supabase
    .from("outreach_draft_queue")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("due_at", { ascending: true })
    .limit(100);
  if (status) queueQuery = queueQuery.eq("status", status);

  const { data, error } = await queueQuery;
  if (error) throw error;
  const queue = (data || []).map(row => queueItemFromDb(row as DbRow));
  if (!queue.length) return [];

  const leadIds = Array.from(new Set(queue.map(item => item.leadId)));
  const sequenceIds = Array.from(new Set(queue.map(item => item.sequenceId).filter((id): id is string => Boolean(id))));
  const stepIds = Array.from(new Set(queue.map(item => item.stepId).filter((id): id is string => Boolean(id))));

  const [leadResult, sequenceResult, stepResult] = await Promise.all([
    supabase.from("leads").select("*").eq("workspace_id", workspaceId).in("id", leadIds),
    sequenceIds.length ? supabase.from("outreach_sequences").select("*").eq("workspace_id", workspaceId).in("id", sequenceIds) : Promise.resolve({ data: [], error: null }),
    stepIds.length ? supabase.from("outreach_sequence_steps").select("*").eq("workspace_id", workspaceId).in("id", stepIds) : Promise.resolve({ data: [], error: null })
  ]);
  if (leadResult.error) throw leadResult.error;
  if (sequenceResult.error) throw sequenceResult.error;
  if (stepResult.error) throw stepResult.error;

  const leads = new Map((leadResult.data || []).map(row => [String(row.id), leadFromDb(row as DbRow)]));
  const sequences = new Map((sequenceResult.data || []).map(row => [String(row.id), sequenceFromDb(row as DbRow)]));
  const steps = new Map((stepResult.data || []).map(row => [String(row.id), stepFromDb(row as DbRow)]));

  return queue.map(item => ({
    ...item,
    lead: leads.get(item.leadId) || null,
    sequence: item.sequenceId ? sequences.get(item.sequenceId) || null : null,
    step: item.stepId ? steps.get(item.stepId) || null : null
  }));
}

export async function listInbox(workspaceId: string): Promise<QueueItemWithLead[]> {
  return listReviewQueue(workspaceId).then(items => items.filter(item => item.status === "replied" || item.lead?.status === "Replied" || item.lead?.status === "Interested"));
}

export async function getOutreachFunnel(workspaceId: string): Promise<OutreachFunnel> {
  const supabase = adminClient();
  const [leads, drafts, sent, replies] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("outreach_draft_queue").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("outreach_draft_queue").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "sent_manually"),
    supabase.from("lead_sequences").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "replied")
  ]);

  return {
    totalLeads: leads.count || 0,
    draftsGenerated: drafts.count || 0,
    sentManually: sent.count || 0,
    repliesReceived: replies.count || 0
  };
}

export async function createSequence(input: {
  workspaceId: string;
  userId: string;
  name: string;
  objective: string;
  targetPlatform: string;
  dailyReviewLimit: number;
  status?: OutreachSequenceStatus;
  steps: Array<{ name: string; delayHours: number; template: string; variationCount: number }>;
}) {
  const supabase = adminClient();
  const { data: sequence, error } = await supabase
    .from("outreach_sequences")
    .insert({
      workspace_id: input.workspaceId,
      name: input.name,
      objective: input.objective,
      target_platform: input.targetPlatform,
      daily_review_limit: input.dailyReviewLimit,
      status: input.status || "active",
      created_by: input.userId
    })
    .select("*")
    .single();
  if (error) throw error;

  const steps = input.steps.length ? input.steps : defaultSequenceSteps();
  const { error: stepError } = await supabase.from("outreach_sequence_steps").insert(steps.map((step, index) => ({
    workspace_id: input.workspaceId,
    sequence_id: sequence.id,
    step_order: index + 1,
    name: step.name || `Step ${index + 1}`,
    delay_hours: Math.max(0, Number(step.delayHours || 0)),
    template: step.template || defaultSequenceSteps()[Math.min(index, 2)].template,
    variation_count: Math.min(5, Math.max(3, Number(step.variationCount || 3)))
  })));
  if (stepError) throw stepError;

  await logOutreachEvent({
    workspaceId: input.workspaceId,
    userId: input.userId,
    sequenceId: String(sequence.id),
    eventType: "sequence_created",
    metadata: { name: input.name, targetPlatform: input.targetPlatform }
  });

  return sequenceFromDb(sequence as DbRow);
}

export async function enrollLeadInSequence(input: {
  workspaceId: string;
  userId: string;
  leadId: string;
  sequenceId: string;
}) {
  const supabase = adminClient();
  const [leadResult, stepsResult] = await Promise.all([
    supabase.from("leads").select("*").eq("workspace_id", input.workspaceId).eq("id", input.leadId).single(),
    supabase.from("outreach_sequence_steps").select("*").eq("workspace_id", input.workspaceId).eq("sequence_id", input.sequenceId).order("step_order", { ascending: true }).limit(1)
  ]);
  if (leadResult.error) throw leadResult.error;
  if (stepsResult.error) throw stepsResult.error;
  const stepRow = stepsResult.data?.[0] as DbRow | undefined;
  if (!stepRow) throw new Error("This sequence has no steps.");

  const lead = leadFromDb(leadResult.data as DbRow);
  const step = stepFromDb(stepRow);
  const { data: leadSequence, error: sequenceError } = await supabase
    .from("lead_sequences")
    .upsert({
      workspace_id: input.workspaceId,
      lead_id: input.leadId,
      sequence_id: input.sequenceId,
      current_step_id: step.id,
      current_step_order: step.stepOrder,
      status: "active",
      created_by: input.userId,
      updated_at: new Date().toISOString()
    }, { onConflict: "workspace_id,lead_id,sequence_id" })
    .select("*")
    .single();
  if (sequenceError) throw sequenceError;

  await supabase
    .from("leads")
    .update({
      current_sequence_id: input.sequenceId,
      current_sequence_step: step.stepOrder,
      status: "Reviewed",
      updated_at: new Date().toISOString()
    })
    .eq("workspace_id", input.workspaceId)
    .eq("id", input.leadId);

  const queueItem = await queueSequenceStep({
    workspaceId: input.workspaceId,
    userId: input.userId,
    lead,
    leadSequenceId: String(leadSequence.id),
    sequenceId: input.sequenceId,
    step
  });

  await logOutreachEvent({
    workspaceId: input.workspaceId,
    userId: input.userId,
    leadId: input.leadId,
    leadSequenceId: String(leadSequence.id),
    sequenceId: input.sequenceId,
    queueItemId: queueItem.id,
    eventType: "lead_enrolled",
    metadata: { stepOrder: step.stepOrder }
  });

  return { leadSequence: leadSequenceFromDb(leadSequence as DbRow), queueItem };
}

export async function queueSequenceStep(input: {
  workspaceId: string;
  userId: string;
  lead: Lead;
  leadSequenceId: string;
  sequenceId: string;
  step: OutreachSequenceStep;
}) {
  const supabase = adminClient();
  const draftVariations = await generateDraftVariations(input.lead, input.step.template, input.step.variationCount, input.workspaceId, input.userId);
  const dueAt = new Date(Date.now() + input.step.delayHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("outreach_draft_queue")
    .insert({
      workspace_id: input.workspaceId,
      lead_id: input.lead.id,
      lead_sequence_id: input.leadSequenceId,
      sequence_id: input.sequenceId,
      step_id: input.step.id,
      step_order: input.step.stepOrder,
      platform: String(input.lead.platform || ""),
      status: "review",
      due_at: dueAt,
      draft_text: draftVariations[0] || "",
      draft_variations: draftVariations,
      created_by: input.userId
    })
    .select("*")
    .single();
  if (error) throw error;

  await logOutreachEvent({
    workspaceId: input.workspaceId,
    userId: input.userId,
    leadId: input.lead.id,
    leadSequenceId: input.leadSequenceId,
    sequenceId: input.sequenceId,
    queueItemId: String(data.id),
    eventType: "draft_queued",
    metadata: { stepOrder: input.step.stepOrder, dueAt }
  });

  return queueItemFromDb(data as DbRow);
}

export async function updateQueueAction(input: {
  workspaceId: string;
  userId: string;
  queueItemId: string;
  action: "approve" | "copy" | "open_profile" | "mark_sent" | "mark_replied" | "archive" | "select_variation";
  selectedVariationIndex?: number;
}) {
  const supabase = adminClient();
  const { data: existing, error: existingError } = await supabase
    .from("outreach_draft_queue")
    .select("*")
    .eq("workspace_id", input.workspaceId)
    .eq("id", input.queueItemId)
    .single();
  if (existingError) throw existingError;

  const queueItem = queueItemFromDb(existing as DbRow);
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  let eventType = `queue_${input.action}`;

  if (input.action === "approve") {
    patch.status = "ready_to_send";
    patch.approved_at = now;
  }
  if (input.action === "copy") patch.copied_at = now;
  if (input.action === "open_profile") patch.profile_opened_at = now;
  if (input.action === "mark_sent") {
    patch.status = "sent_manually";
    patch.sent_manually_at = now;
  }
  if (input.action === "mark_replied") {
    patch.status = "replied";
    eventType = "reply_received";
  }
  if (input.action === "archive") patch.status = "archived";
  if (input.action === "select_variation") {
    const index = Math.max(0, Number(input.selectedVariationIndex || 0));
    const variations = queueItem.draftVariations;
    patch.selected_variation_index = index;
    patch.draft_text = variations[index] || queueItem.draftText;
  }

  const { data, error } = await supabase
    .from("outreach_draft_queue")
    .update(patch)
    .eq("workspace_id", input.workspaceId)
    .eq("id", input.queueItemId)
    .select("*")
    .single();
  if (error) throw error;

  if (input.action === "mark_sent") {
    await scheduleNextStep(input.workspaceId, input.userId, queueItem);
    await supabase.from("leads").update({ status: "Contacted Manually", updated_at: now }).eq("workspace_id", input.workspaceId).eq("id", queueItem.leadId);
  }

  if (input.action === "mark_replied") {
    await Promise.all([
      queueItem.leadSequenceId
        ? supabase.from("lead_sequences").update({ status: "replied", replied_at: now, paused_at: now, updated_at: now }).eq("workspace_id", input.workspaceId).eq("id", queueItem.leadSequenceId)
        : Promise.resolve({ error: null }),
      supabase.from("leads").update({ status: "Replied", updated_at: now }).eq("workspace_id", input.workspaceId).eq("id", queueItem.leadId),
      queueItem.leadSequenceId
        ? supabase.from("outreach_draft_queue").update({ status: "archived", updated_at: now }).eq("workspace_id", input.workspaceId).eq("lead_sequence_id", queueItem.leadSequenceId).in("status", ["queued", "review", "ready_to_send"])
        : Promise.resolve({ error: null })
    ]);
  }

  await logOutreachEvent({
    workspaceId: input.workspaceId,
    userId: input.userId,
    leadId: queueItem.leadId,
    leadSequenceId: queueItem.leadSequenceId,
    sequenceId: queueItem.sequenceId,
    queueItemId: input.queueItemId,
    eventType,
    metadata: { action: input.action, selectedVariationIndex: input.selectedVariationIndex }
  });

  return queueItemFromDb(data as DbRow);
}

export async function logOutreachEvent(input: {
  workspaceId: string;
  userId?: string | null;
  leadId?: string | null;
  leadSequenceId?: string | null;
  queueItemId?: string | null;
  sequenceId?: string | null;
  eventType: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = adminClient();
  await supabase.from("outreach_activity_events").insert({
    workspace_id: input.workspaceId,
    user_id: input.userId || null,
    lead_id: input.leadId || null,
    lead_sequence_id: input.leadSequenceId || null,
    queue_item_id: input.queueItemId || null,
    sequence_id: input.sequenceId || null,
    event_type: input.eventType,
    metadata: input.metadata || {}
  });
}

export async function getReviewQueueCount(workspaceId: string) {
  const supabase = adminClient();
  const { count, error } = await supabase
    .from("outreach_draft_queue")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .in("status", ["review", "ready_to_send"])
    .lte("due_at", new Date().toISOString());
  if (error) throw error;
  return count || 0;
}

export async function getOutreachActivity(workspaceId: string, leadId?: string): Promise<OutreachActivityEvent[]> {
  const supabase = adminClient();
  let query = supabase
    .from("outreach_activity_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (leadId) query = query.eq("lead_id", leadId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row => activityFromDb(row as DbRow));
}

export function defaultSequenceSteps() {
  return [
    {
      name: "Initial outreach",
      delayHours: 0,
      variationCount: 3,
      template: "Hi {{first_name}}, saw your post about {{recent_post_topic}}. I help with {my_service}. {cta}"
    },
    {
      name: "Follow-up 1",
      delayHours: 48,
      variationCount: 3,
      template: "Hi {{first_name}}, quick follow-up on {{recent_post_topic}}. If this is still a priority, happy to share a few practical ideas."
    },
    {
      name: "Final follow-up",
      delayHours: 120,
      variationCount: 3,
      template: "Hi {{first_name}}, closing the loop. If {{recent_post_topic}} becomes important later, happy to help."
    }
  ];
}

async function scheduleNextStep(workspaceId: string, userId: string, queueItem: OutreachDraftQueueItem) {
  if (!queueItem.sequenceId || !queueItem.leadSequenceId) return;
  const supabase = adminClient();
  const { data: nextStepRows, error: stepError } = await supabase
    .from("outreach_sequence_steps")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("sequence_id", queueItem.sequenceId)
    .gt("step_order", queueItem.stepOrder)
    .order("step_order", { ascending: true })
    .limit(1);
  if (stepError) throw stepError;
  const nextStepRow = nextStepRows?.[0] as DbRow | undefined;
  if (!nextStepRow) {
    await supabase.from("lead_sequences").update({ status: "completed", completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("workspace_id", workspaceId).eq("id", queueItem.leadSequenceId);
    return;
  }

  const [leadResult] = await Promise.all([
    supabase.from("leads").select("*").eq("workspace_id", workspaceId).eq("id", queueItem.leadId).single(),
    supabase.from("lead_sequences").update({ current_step_id: nextStepRow.id, current_step_order: nextStepRow.step_order, updated_at: new Date().toISOString() }).eq("workspace_id", workspaceId).eq("id", queueItem.leadSequenceId)
  ]);
  if (leadResult.error) throw leadResult.error;

  await queueSequenceStep({
    workspaceId,
    userId,
    lead: leadFromDb(leadResult.data as DbRow),
    leadSequenceId: queueItem.leadSequenceId,
    sequenceId: queueItem.sequenceId,
    step: stepFromDb(nextStepRow)
  });
}

async function generateDraftVariations(lead: Lead, template: string, count: number, workspaceId: string, userId: string) {
  const local = localVariations(lead, template, count);
  if ((process.env.AI_PROVIDER || "gemini") !== "gemini" || process.env.AI_DRAFTS_ENABLED === "false" || !process.env.GEMINI_API_KEY) return local;

  const model = process.env.AI_DEFAULT_MODEL || "gemini-2.5-flash";
  const prompt = [
    `Generate ${count} concise manual-review outreach draft variations.`,
    "Rules: no auto-send language, no spammy claims, no pressure, no mention of scraping. User will review and send manually.",
    `Lead author: ${lead.authorName}`,
    `Platform: ${lead.platform}`,
    `Community: ${lead.communityName}`,
    `Snippet: ${lead.postSnippet || lead.postText}`,
    `Template: ${renderOutreachTemplate(template, lead)}`,
    "Return valid JSON: {\"variations\":[\"draft 1\",\"draft 2\",\"draft 3\"]}"
  ].join("\n");

  const started = Date.now();
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.65, maxOutputTokens: 600 }
      })
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Gemini status ${response.status}`);
    const jsonText = text.match(/\{[\s\S]*\}/)?.[0] || "";
    const parsed = JSON.parse(jsonText) as { variations?: unknown };
    const variations = Array.isArray(parsed.variations) ? parsed.variations.map(String).filter(Boolean).slice(0, 5) : [];
    await logAiUsage(workspaceId, userId, model, "success", Date.now() - started);
    return variations.length ? variations : local;
  } catch (error) {
    await logAiUsage(workspaceId, userId, model, "failed", Date.now() - started, error instanceof Error ? error.message : "Gemini generation failed");
    return local;
  }
}

function localVariations(lead: Lead, template: string, count: number) {
  const base = renderOutreachTemplate(template, lead);
  const openers = [
    base,
    base.replace(/^Hi\b/i, "Hey"),
    `${base}\n\nEither way, your post stood out.`,
    base.replace("happy to", "open to"),
    `${base}\n\nNo pressure if timing is off.`
  ];
  return openers.map(value => value.trim()).filter(Boolean).slice(0, Math.min(5, Math.max(3, count)));
}

function renderOutreachTemplate(template: string, lead: Lead) {
  const firstName = lead.authorName.split(/\s+/)[0] || lead.authorName || "there";
  const variables = lead.profileVariables || {};
  return renderDraft(template, lead, defaultKnowledgeBase)
    .replaceAll("{{first_name}}", variables.first_name || firstName)
    .replaceAll("{{company}}", variables.company || "")
    .replaceAll("{{recent_post_topic}}", variables.recent_post_topic || lead.matchedKeywords[0] || lead.postSnippet.slice(0, 80));
}

async function logAiUsage(workspaceId: string, userId: string, model: string, status: "success" | "failed", latencyMs: number, errorMessage?: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  await supabase.from("ai_usage_events").insert({
    workspace_id: workspaceId,
    user_id: userId,
    provider: "gemini",
    model,
    status,
    latency_ms: latencyMs,
    error_message: errorMessage || null,
    metadata: { feature: "manual_outreach_variations" }
  });
}

function parseSequenceStatus(value: unknown): OutreachSequenceStatus {
  return value === "active" || value === "paused" || value === "completed" ? value : "draft";
}

function parseLeadSequenceStatus(value: unknown): LeadSequenceStatus {
  return value === "paused" || value === "replied" || value === "completed" || value === "archived" ? value : "active";
}

function parseQueueStatus(value: unknown): DraftQueueStatus {
  return value === "queued" || value === "ready_to_send" || value === "sent_manually" || value === "replied" || value === "archived" || value === "failed" ? value : "review";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
