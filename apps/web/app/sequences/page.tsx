import { AppShell } from "@/components/app-shell";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { SequenceBuilderClient } from "@/components/sequence-builder-client";
import { Badge, Card } from "@/components/ui";
import { requireWorkspace } from "@/lib/auth/session";
import { listSequences } from "@/lib/outreach";

export default async function SequencesPage() {
  const { workspace } = await requireWorkspace();
  const sequences = await listSequences(workspace.id);

  return (
    <AppShell title="Sequences">
      <div className="grid gap-5 xl:grid-cols-[1fr_.9fr]">
        <SequenceBuilderClient />
        <div className="space-y-4">
          {sequences.map(sequence => (
            <Card key={sequence.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <PlatformLogo platform={sequence.targetPlatform} />
                  <div>
                    <h2 className="text-lg font-semibold">{sequence.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{platformDisplayName(sequence.targetPlatform)} / {sequence.objective || "Manual review outreach"}</p>
                  </div>
                </div>
                <Badge tone={sequence.status === "active" ? "green" : sequence.status === "paused" ? "orange" : "slate"}>{sequence.status}</Badge>
              </div>
              <div className="mt-5 space-y-3">
                {sequence.steps.map(step => (
                  <div key={step.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{step.stepOrder}. {step.name}</span>
                      <span className="text-slate-500">{step.delayHours}h delay / {step.variationCount} variations</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{step.template}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
          {!sequences.length ? (
            <Card>
              <h2 className="font-semibold">No sequences yet</h2>
              <p className="mt-2 text-sm text-slate-500">Create your first manual-review sequence, then enroll leads from the Leads page or Chrome extension overlay.</p>
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
