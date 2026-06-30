import { AppShell } from "@/components/app-shell";
import { Button, Card, Field, TextArea } from "@/components/ui";
import { defaultTemplates } from "@/lib/defaults";

export default function TemplatesPage() {
  return <AppShell title="Outreach Templates"><Card><div className="grid gap-4">{Object.entries(defaultTemplates).map(([key, value]) => <Field key={key} label={key}><TextArea rows={4} defaultValue={value} /></Field>)}</div><p className="mt-4 text-sm text-slate-500">Variables: {"{author} {platform} {community} {post_snippet} {matched_keywords} {my_service} {offer} {cta} {proof}"}</p><div className="mt-6"><Button>Save templates</Button></div></Card></AppShell>;
}
