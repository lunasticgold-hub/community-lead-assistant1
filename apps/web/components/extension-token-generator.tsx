"use client";

import { useState } from "react";
import { Button } from "./ui";

export function ExtensionTokenGenerator() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateToken() {
    setError("");
    setToken("");
    setLoading(true);
    try {
      const response = await fetch("/api/extension/tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "Chrome extension" })
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Could not create extension token.");
      setToken(data.token);
    } catch (tokenError) {
      setError(tokenError instanceof Error ? tokenError.message : "Could not create extension token.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" onClick={generateToken} disabled={loading}>{loading ? "Generating..." : "Generate new token"}</Button>
      {token ? (
        <div className="mt-4 rounded-xl bg-slate-950 p-4 text-sm text-white">
          <div className="mb-2 text-xs text-slate-400">Copy this now. It is shown once.</div>
          <code className="break-all">{token}</code>
        </div>
      ) : null}
      {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
