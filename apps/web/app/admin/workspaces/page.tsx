import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";

export default function AdminWorkspacesPage() {
  const workspaces = [
    ["Acme Growth Studio", "Trial"],
    ["Northstar SEO", "Starter"],
    ["Outbound Lab", "Agency"]
  ] as const;

  return (
    <AppShell title="Admin - Workspaces">
      <Card>
        <div className="grid gap-3">
          {workspaces.map(([name, plan]) => (
            <div key={name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>{name}</span>
              <Badge>{plan}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
