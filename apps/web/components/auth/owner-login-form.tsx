"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { PasswordInput } from "@/components/password-input";
import { Button, Field, TextInput } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin/cms";
  return value;
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email or password is incorrect.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm this email in Supabase before logging in.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "Network error. Check your connection and Supabase settings.";
  }
  if (lower.includes("owner access")) {
    return "This account is not allowed to open the owner area.";
  }
  return message || "Could not complete owner login.";
}

export function OwnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function redirectExistingOwner() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!mounted || !data.user) return;

        const ownerCheck = await fetch("/api/auth/owner-check", { method: "POST" });
        if (ownerCheck.ok) {
          router.replace(next);
          router.refresh();
        }
      } catch {
        // Existing sessions are checked again on form submit.
      }
    }

    redirectExistingOwner();
    return () => {
      mounted = false;
    };
  }, [next, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Enter the owner email.");
      return;
    }

    if (!password) {
      setError("Enter the owner password.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (loginError) throw loginError;

      const ownerCheck = await fetch("/api/auth/owner-check", { method: "POST" });
      if (!ownerCheck.ok) {
        await supabase.auth.signOut();
        throw new Error("Owner access is not allowed for this account.");
      }

      router.replace(next);
      router.refresh();
    } catch (loginError) {
      setError(friendlyAuthError(loginError instanceof Error ? loginError.message : "Could not complete owner login."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field label="Owner email">
        <TextInput
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="owner@example.com"
          autoComplete="email"
          inputMode="email"
        />
      </Field>
      <Field label="Owner password">
        <PasswordInput
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="Password"
          autoComplete="current-password"
        />
      </Field>
      {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Checking access..." : "Open owner CMS"}
      </Button>
    </form>
  );
}
