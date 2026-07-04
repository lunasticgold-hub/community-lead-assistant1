"use client";

import { useState } from "react";
import { Button, Card, Field, TextArea, TextInput } from "@/components/ui";

type StepInput = {
  name: string;
  delayHours: number;
  template: string;
  variationCount: number;
};

const initialSteps: StepInput[] = [
  {
    name: "Initial outreach",
    delayHours: 0,
    variationCount: 3,
    template: "Hi {{first_name}}, saw your post about {{recent_post_topic}}. I help with {my_service}. {cta}"
  },
  {
    name: "Follow-up 1",
    delayHours: 48,
    variationCount: 3,
    template: "Hi {{first_name}}, quick follow-up on {{recent_post_topic}}. If this is still a priority, happy to share a few practical ideas."
  },
  {
    name: "Final follow-up",
    delayHours: 120,
    variationCount: 3,
    template: "Hi {{first_name}}, closing the loop. If {{recent_post_topic}} becomes important later, happy to help."
  }
];

export function SequenceBuilderClient() {
  const [name, setName] = useState("Founder lead follow-up");
  const [objective, setObjective] = useState("Start a helpful manual conversation with high-intent community leads.");
  const [targetPlatform, setTargetPlatform] = useState("reddit");
  const [dailyReviewLimit, setDailyReviewLimit] = useState(25);
  const [steps, setSteps] = useState<StepInput[]>(initialSteps);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function updateStep(index: number, patch: Partial<StepInput>) {
    setSteps(current => current.map((step, stepIndex) => stepIndex === index ? { ...step, ...patch } : step));
  }

  async function submit() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/outreach/sequences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, objective, targetPlatform, dailyReviewLimit, steps })
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok || data.ok === false) {
      setMessage(data.error || "Could not create sequence.");
      return;
    }
    setMessage("Sequence created. You can now enroll leads into this manual review flow.");
    setTimeout(() => window.location.reload(), 700);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Visual sequence builder</h2>
          <p className="mt-1 text-sm text-slate-500">Build manual-review steps. Nothing is sent automatically.</p>
        </div>
        <Button type="button" disabled={saving} onClick={submit}>{saving ? "Saving" : "Create sequence"}</Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Sequence name"><TextInput value={name} onChange={event => setName(event.target.value)} /></Field>
        <Field label="Target platform"><TextInput value={targetPlatform} onChange={event => setTargetPlatform(event.target.value.toLowerCase())} /></Field>
        <Field label="Objective"><TextInput value={objective} onChange={event => setObjective(event.target.value)} /></Field>
        <Field label="Daily review limit"><TextInput type="number" min={1} value={dailyReviewLimit} onChange={event => setDailyReviewLimit(Number(event.target.value))} /></Field>
      </div>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Step {index + 1}</h3>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{step.delayHours}h delay</div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Step name"><TextInput value={step.name} onChange={event => updateStep(index, { name: event.target.value })} /></Field>
              <Field label="Delay hours"><TextInput type="number" min={0} value={step.delayHours} onChange={event => updateStep(index, { delayHours: Number(event.target.value) })} /></Field>
              <Field label="Variations"><TextInput type="number" min={3} max={5} value={step.variationCount} onChange={event => updateStep(index, { variationCount: Number(event.target.value) })} /></Field>
            </div>
            <div className="mt-4">
              <Field label="Message template">
                <TextArea rows={4} value={step.template} onChange={event => updateStep(index, { template: event.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </div>
      {message ? <p className="mt-4 text-sm font-medium text-slate-600">{message}</p> : null}
    </Card>
  );
}
