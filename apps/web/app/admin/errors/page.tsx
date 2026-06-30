import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";

export default function AdminErrorsPage() {
  const errors = ["Facebook selector changed", "Slack sync retry queued", "Token revoked request rejected"];

  return (
    <AppShell title="Admin - Error Logs">
      <Card>
        <div className="space-y-3">
          {errors.map((error, i) => (
            <div key={error} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>{error}</span>
              <Badge tone={i === 0 ? "red" : "orange"}>{i === 0 ? "Extension" : "Sync"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
