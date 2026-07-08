"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

export function AccessDenied({ moduleKey, permission = "view" }: { moduleKey: string; permission?: string }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestAccess() {
    setError("");
    setMessage("");
    setLoading(true);
    const response = await fetch("/api/admin/iam", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "submitEmployeeAccessRequest",
        requestedModule: moduleKey,
        requestedPermission: permission,
        reason
      })
    });
    const json = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(String(json.error || "Could not request access."));
      return;
    }
    setMessage(String(json.message || "Access request submitted."));
  }

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-8 text-center shadow-2xl shadow-blue-950/20">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-200">
        <Lock size={24} />
      </div>
      <h1 className="mt-5 text-2xl font-semibold text-white">You don't currently have permission to access this module.</h1>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        Module: <span className="font-semibold text-slate-200">{moduleKey}</span>. Requested permission: <span className="font-semibold text-slate-200">{permission}</span>.
      </p>
      <textarea
        value={reason}
        onChange={event => setReason(event.target.value)}
        placeholder="Optional reason for the Super Admin"
        className="mt-5 min-h-24 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-left text-sm text-slate-100 outline-none focus:border-blue-400"
      />
      {message ? <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</div> : null}
      {error ? <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div> : null}
      <div className="mt-5 flex justify-center gap-2">
        <button type="button" onClick={() => window.history.back()} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10">
          Cancel
        </button>
        <button type="button" disabled={loading} onClick={requestAccess} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60">
          {loading ? "Submitting..." : "Request Access"}
        </button>
      </div>
    </section>
  );
}
