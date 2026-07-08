import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "application/pdf",
  "application/zip"
]);

export async function POST(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "media", "create") && !hasAdminModuleAccess(auth.access, "cms", "create")) return fail("Forbidden", 403);
  const supabase = getSupabaseAdmin();
  if (!supabase) return fail("Server Supabase admin client is not configured.", 500);

  try {
    const form = await request.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "library").replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
    if (!(file instanceof File)) return fail("Upload file is required.", 400);
    if (!allowedTypes.has(file.type)) return fail("File type is not allowed.", 400);
    if (file.size > 50 * 1024 * 1024) return fail("File must be 50MB or smaller.", 400);

    const extension = file.name.split(".").pop() || "asset";
    const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]/gi, "-").toLowerCase();
    const storagePath = `${folder}/${Date.now()}-${safeName}.${extension}`;
    const bytes = await file.arrayBuffer();
    const upload = await supabase.storage.from("cms-media").upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false
    });
    if (upload.error) return fail(upload.error.message, 500);
    const publicUrl = supabase.storage.from("cms-media").getPublicUrl(storagePath).data.publicUrl;

    const { data, error } = await supabase
      .from("cms_media")
      .insert({
        folder,
        file_name: file.name,
        file_type: file.type,
        file_size_bytes: file.size,
        storage_path: storagePath,
        public_url: publicUrl,
        created_by: auth.user.id,
        metadata: { source: "cms_upload" }
      })
      .select("*")
      .single();
    if (error) return fail(error.message, 500);
    return ok({ media: data }, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Upload failed.", 500);
  }
}
