import { AppShell } from "@/components/app-shell";
import { Badge, Card } from "@/components/ui";

export default function AdminUsersPage() {
  return (
    <AppShell title="Admin - Users">
      <Card>
        <div className="grid gap-3">
          {["founder@example.com", "agency@example.com", "sdr@example.com"].map((email, i) => (
            <div key={email} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span>{email}</span>
              <Badge>{i === 0 ? "Owner" : "Active"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
