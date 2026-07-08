import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { defaultWebsiteEditorContent, mergeWebsiteEditorContent, type WebsiteEditorContent } from "./website-editor-defaults";

const GROUP_NAME = "website_editor";
const SETTINGS_KEY = "live_site";

type CmsSettingsRow = {
  id: string;
  value: unknown;
};

export async function getWebsiteEditorContent(): Promise<WebsiteEditorContent> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return defaultWebsiteEditorContent;

  const { data, error } = await supabase
    .from("cms_settings")
    .select("id,value")
    .eq("group_name", GROUP_NAME)
    .eq("key", SETTINGS_KEY)
    .maybeSingle();

  if (error || !data) return defaultWebsiteEditorContent;
  return mergeWebsiteEditorContent((data as CmsSettingsRow).value);
}

export async function saveWebsiteEditorContent(content: WebsiteEditorContent, userId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Server Supabase admin client is not configured.");

  const payload = mergeWebsiteEditorContent(content);
  const { data, error } = await supabase
    .from("cms_settings")
    .upsert({
      group_name: GROUP_NAME,
      key: SETTINGS_KEY,
      value: payload,
      updated_by: userId,
      updated_at: new Date().toISOString()
    }, { onConflict: "group_name,key" })
    .select("*")
    .single();

  if (error) {
    if (/does not exist|schema cache|could not find/i.test(error.message)) {
      throw new Error("CMS settings storage is not ready for live publishing.");
    }
    throw error;
  }

  return data;
}
