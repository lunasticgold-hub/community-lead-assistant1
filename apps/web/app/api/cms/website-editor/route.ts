import { fail, ok } from "@/lib/api-response";
import { hasAdminModuleAccess, requireAdminApiUser } from "@/lib/admin/auth";
import { getWebsiteEditorContent, saveWebsiteEditorContent } from "@/lib/cms/website-editor";
import { mergeWebsiteEditorContent } from "@/lib/cms/website-editor-defaults";

export async function GET() {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "website-editor", "view")) return fail("Forbidden", 403);

  try {
    return ok({ content: await getWebsiteEditorContent() });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load website editor content.", 500);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApiUser();
  if ("error" in auth) return auth.error;
  if (!hasAdminModuleAccess(auth.access, "website-editor", "edit")) return fail("Forbidden", 403);

  const body = await request.json().catch(() => ({}));
  const content = mergeWebsiteEditorContent(body.content || body);

  try {
    await saveWebsiteEditorContent(content, auth.user.id);
    return ok({ content });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save website editor content.", 500);
  }
}
