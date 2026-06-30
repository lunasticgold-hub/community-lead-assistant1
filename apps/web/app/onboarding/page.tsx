import { AppShell } from "@/components/app-shell";
import { Button, Card, Field, TextArea, TextInput } from "@/components/ui";

const steps = ["Business info", "Lead intent", "Knowledge base", "Campaign", "Install extension"];

export default function OnboardingPage() {
  return (
    <AppShell title="Onboarding">
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>{steps.map((step, i) => <div key={step} className="mb-3 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm font-semibold">{i + 1}</span><span className="text-sm font-medium">{step}</span></div>)}</Card>
        <Card>
          <h2 className="text-xl font-semibold">Configure your first campaign</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="What do you sell?"><TextInput placeholder="B2B lead generation service" /></Field>
            <Field label="Ideal customer"><TextInput placeholder="Founder-led SaaS companies" /></Field>
            <Field label="Platforms"><TextInput placeholder="Reddit, Facebook Groups, Slack" /></Field>
            <Field label="Campaign name"><TextInput placeholder="Founder communities" /></Field>
            <Field label="Offer"><TextArea rows={3} placeholder="We help book qualified calls..." /></Field>
            <Field label="CTA"><TextInput placeholder="Open to a quick chat?" /></Field>
          </div>
          <div className="mt-6"><Button>Save and generate extension token</Button></div>
        </Card>
      </div>
    </AppShell>
  );
}
