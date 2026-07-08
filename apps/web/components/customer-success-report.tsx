"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SuccessProjectInput } from "@/lib/customer-success/types";
import { money } from "@/lib/customer-success/format";

type OwnProject = {
  id: string;
  client_name?: string;
  project_title?: string;
  project_category?: string;
  date_won?: string;
  currency?: string;
  project_value?: number;
  status?: string;
};

const emptyForm: SuccessProjectInput = {
  clientName: "",
  projectTitle: "",
  leadSource: "",
  projectCategory: "",
  projectDescription: "",
  dateWon: new Date().toISOString().slice(0, 10),
  currency: "USD",
  projectValue: 0,
  isRecurringRevenue: false,
  notes: "",
  invoiceUrl: ""
};

export function CustomerSuccessReport({ projects }: { projects: OwnProject[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/customer-success/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form)
    });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setError(String(result.error || "Could not report project."));
      return;
    }
    setMessage("Project reported. It will appear in verified revenue after admin review.");
    setForm(emptyForm);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Report New Project</h2>
        <p className="mt-1 text-sm text-slate-500">Tell us when Community Lead Assistant helped you convert a lead into paid work.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Field label="Client Name" value={form.clientName} onChange={value => setForm({ ...form, clientName: value })} />
          <Field label="Project Title" value={form.projectTitle} onChange={value => setForm({ ...form, projectTitle: value })} />
          <Field label="Lead Source (Optional)" value={form.leadSource || ""} onChange={value => setForm({ ...form, leadSource: value })} />
          <Field label="Project Category" value={form.projectCategory} onChange={value => setForm({ ...form, projectCategory: value })} />
          <Field label="Date Won" type="date" value={form.dateWon} onChange={value => setForm({ ...form, dateWon: value })} />
          <Field label="Currency" value={form.currency} onChange={value => setForm({ ...form, currency: value.toUpperCase().slice(0, 3) })} />
          <Field label="Project Value" type="number" value={String(form.projectValue)} onChange={value => setForm({ ...form, projectValue: Number(value || 0) })} />
          <Field label="Invoice/Screenshot URL (Optional)" value={form.invoiceUrl || ""} onChange={value => setForm({ ...form, invoiceUrl: value })} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={Boolean(form.isRecurringRevenue)} onChange={event => setForm({ ...form, isRecurringRevenue: event.target.checked })} />
          This is recurring revenue
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Project Description</span>
          <textarea value={form.projectDescription || ""} onChange={event => setForm({ ...form, projectDescription: event.target.value })} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea value={form.notes || ""} onChange={event => setForm({ ...form, notes: event.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </label>
        {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <button type="button" disabled={saving} onClick={submit} className="mt-5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? "Submitting..." : "Report New Project"}
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold">Your Reported Projects</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>{["Client", "Project", "Category", "Date Won", "Value", "Status"].map(label => <th key={label} className="border-b border-slate-200 py-2">{label}</th>)}</tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.id}>
                  <td className="border-b border-slate-100 py-3">{project.client_name}</td>
                  <td className="border-b border-slate-100 py-3">{project.project_title}</td>
                  <td className="border-b border-slate-100 py-3">{project.project_category}</td>
                  <td className="border-b border-slate-100 py-3">{project.date_won}</td>
                  <td className="border-b border-slate-100 py-3">{money(Number(project.project_value || 0), project.currency || "USD")}</td>
                  <td className="border-b border-slate-100 py-3">{String(project.status || "").replace("_", " ")}</td>
                </tr>
              ))}
              {!projects.length ? <tr><td colSpan={6} className="h-32 text-center text-slate-500">No projects reported yet.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" />
    </label>
  );
}
