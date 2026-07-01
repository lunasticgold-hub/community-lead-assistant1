import { fail, ok } from "@/lib/api-response";
import { requireApiUser } from "@/lib/api-auth";
import { productConfig } from "@/lib/defaults";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const allowedExtensions = new Set(["pdf", "docx", "txt"]);
const allowedMime = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const supabase = getSupabaseAdmin();
  if (!supabase) return ok({ documents: [], localOnly: true });
  const { data, error } = await supabase.from("knowledge_documents").select("*").eq("workspace_id", auth.workspace.id).order("created_at", { ascending: false }).limit(100);
  if (error) return fail(error.message, 500);
  return ok({ documents: data || [] });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const form = await request.formData().catch(() => null);
  if (!form) return fail("Expected multipart form data", 400);

  const file = form.get("file");
  const workspaceId = auth.workspace.id;
  const knowledgeBaseId = String(form.get("knowledgeBaseId") || "");
  if (!(file instanceof File)) return fail("Missing file", 400);

  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const maxBytes = productConfig.maxKnowledgeFileMb * 1024 * 1024;
  if (!allowedExtensions.has(extension) || !allowedMime.has(file.type)) {
    return fail("Only PDF, DOCX, and TXT files are allowed", 400);
  }
  if (file.size > maxBytes) {
    return fail(`File must be ${productConfig.maxKnowledgeFileMb} MB or smaller`, 400);
  }

  const storagePath = `${workspaceId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return ok({
      localOnly: true,
      document: {
        fileName: file.name,
        fileType: file.type,
        fileSizeBytes: file.size,
        storagePath,
        processingStatus: "pending"
      }
    });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const upload = await supabase.storage.from("knowledge-documents").upload(storagePath, bytes, {
    contentType: file.type,
    upsert: false
  });
  if (upload.error) return fail(upload.error.message, 500);

  const { data, error } = await supabase
    .from("knowledge_documents")
    .insert({
      workspace_id: workspaceId,
      knowledge_base_id: knowledgeBaseId || null,
      file_name: file.name,
      file_type: file.type,
      file_size_bytes: file.size,
      storage_path: storagePath,
      processing_status: "pending"
    })
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  return ok({ document: data });
}
