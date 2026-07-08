"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/password-input";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) return "/admin";
  return value;
}

export function AdminEmployeeLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get("error") || "");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fetch("/api/admin/employee-auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const json = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(String(json.error || "Could not log in."));
      return;
    }
    router.replace(safeNext(searchParams.get("next")));
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Admin login email</span>
        <input
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="employee@company.com"
          autoComplete="email"
          className="mt-1 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Admin password</span>
        <div className="mt-1">
          <PasswordInput value={password} onChange={event => setPassword(event.target.value)} placeholder="Temporary password" autoComplete="current-password" />
        </div>
      </label>
      {error ? <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      <button disabled={loading} className="min-h-11 w-full rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
        {loading ? "Checking employee access..." : "Log in to Admin/CMS"}
      </button>
      <p className="text-center text-xs leading-5 text-slate-500">
        This login is only for internal employees. It does not create or use customer portal credentials.
      </p>
    </form>
  );
}
