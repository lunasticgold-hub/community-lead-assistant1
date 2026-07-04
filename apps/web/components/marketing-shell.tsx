import { getCurrentUser } from "@/lib/auth/session";
import { MarketingShellView } from "./marketing-shell-view";

export async function MarketingShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return <MarketingShellView loggedIn={Boolean(user)}>{children}</MarketingShellView>;
}
