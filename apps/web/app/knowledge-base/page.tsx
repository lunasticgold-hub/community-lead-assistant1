import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, Field, TextArea, TextInput } from "@/components/ui";
import { defaultKnowledgeBase, productConfig } from "@/lib/defaults";

export default function KnowledgeBasePage() {
  return (
    <AppShell title="Knowledge Base">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_.8fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Structured knowledge base</h2>
              <p className="mt-1 text-sm text-slate-600">Used by Gemini and local templates to create manual outreach drafts.</p>
            </div>
            <Badge tone="blue">Recommended</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="My service"><TextInput defaultValue={defaultKnowledgeBase.myService} /></Field>
            <Field label="CTA"><TextInput defaultValue={defaultKnowledgeBase.cta} /></Field>
            <Field label="Offer"><TextArea rows={3} defaultValue={defaultKnowledgeBase.offer} /></Field>
            <Field label="Ideal customer profile"><TextArea rows={3} defaultValue={defaultKnowledgeBase.icp} /></Field>
            <Field label="Target pain points"><TextArea rows={3} defaultValue={defaultKnowledgeBase.painPoints.join("\n")} /></Field>
            <Field label="Proof / case studies"><TextArea rows={3} defaultValue={defaultKnowledgeBase.proof} /></Field>
            <Field label="Tone"><TextArea rows={3} defaultValue={defaultKnowledgeBase.tone} /></Field>
            <Field label="FAQs"><TextArea rows={3} defaultValue={defaultKnowledgeBase.faqs.join("\n")} /></Field>
            <Field label="Objection handling"><TextArea rows={3} defaultValue={defaultKnowledgeBase.objections.join("\n")} /></Field>
            <Field label="Blocked words"><TextArea rows={3} defaultValue={defaultKnowledgeBase.blockedWords.join("\n")} /></Field>
          </div>
          <div className="mt-6"><Button>Save knowledge base</Button></div>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Upload raw docs</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload sales notes, case studies, website copy, or service docs. Gemini can summarize these into draft context after the API key is configured.
          </p>
          <form action="/api/knowledge-documents" method="post" encType="multipart/form-data" className="mt-5 rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-5 text-center">
            <div className="text-sm font-semibold text-slate-950">Upload knowledge file</div>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Allowed: {productConfig.allowedKnowledgeFileTypes.join(", ")}. Max {productConfig.maxKnowledgeFileMb} MB per file.
            </p>
            <input type="hidden" name="workspaceId" value="demo-workspace" />
            <input name="file" type="file" accept=".pdf,.docx,.txt" className="mt-4 block w-full text-xs text-slate-600" />
            <div className="mt-4"><Button variant="secondary">Upload file</Button></div>
          </form>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-3">Storage bucket: knowledge-documents</div>
            <div className="rounded-xl bg-slate-50 p-3">Processing: Gemini document summarization when GEMINI_API_KEY is present</div>
            <div className="rounded-xl bg-slate-50 p-3">Privacy: users can delete uploaded knowledge files</div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
