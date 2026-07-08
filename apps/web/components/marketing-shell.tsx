import { getCurrentUser } from "@/lib/auth/session";
import { getWebsiteEditorContent } from "@/lib/cms/website-editor";
import { MarketingShellView } from "./marketing-shell-view";

export async function MarketingShell({ children }: { children: React.ReactNode }) {
  const [user, website] = await Promise.all([
    getCurrentUser(),
    getWebsiteEditorContent()
  ]);

  return <MarketingShellView loggedIn={Boolean(user)} website={website}>{children}</MarketingShellView>;
}
