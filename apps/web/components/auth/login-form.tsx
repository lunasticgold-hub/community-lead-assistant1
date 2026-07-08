"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { PasswordInput } from "@/components/password-input";
import { Button, Card, Field, TextInput } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

function authMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) return "Email or password is incorrect.";
  if (lower.includes("email not confirmed")) return "Please confirm your email before logging in.";
  if (lower.includes("provider") || lower.includes("disabled")) return "Google login is not enabled in Supabase yet.";
  if (lower.includes("supabase is not configured")) return message;
  if (lower.includes("failed to fetch") || lower.includes("network")) return "Network error. Check your internet connection and Supabase settings.";
  return message || "Something went wrong. Please try again.";
}

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const initialError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError || "");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (mounted && data.user) router.replace(next);
      });
    } catch {
      // The form shows a configuration error if the user attempts login.
    }
    return () => {
      mounted = false;
    };
  }, [next, router]);

  async function handleGoogleLogin() {
    setError("");
    setLoading("google");
    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", next);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString()
        }
      });
      if (oauthError) throw oauthError;
    } catch (googleError) {
      setError(authMessage(googleError instanceof Error ? googleError.message : "Could not start Google login."));
      setLoading(null);
    }
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter your password.");

    setLoading("email");
    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (loginError) throw loginError;
      await fetch("/api/auth/provision", { method: "POST" });
      router.push(next);
      router.refresh();
    } catch (loginError) {
      setError(authMessage(loginError instanceof Error ? loginError.message : "Could not log in."));
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="mt-2 text-sm text-slate-600">Use email/password or Google login through Supabase Auth.</p>
      <div className="mt-6 space-y-4">
        <Button type="button" className="w-full" variant="secondary" onClick={handleGoogleLogin} disabled={loading !== null}>
          {loading === "google" ? "Opening Google..." : "Continue with Google"}
        </Button>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
        </div>
        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <Field label="Email"><TextInput value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></Field>
          <Field label="Password"><PasswordInput value={password} onChange={event => setPassword(event.target.value)} placeholder="Password" autoComplete="current-password" /></Field>
          {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{authMessage(error)}</p> : null}
          <Button type="submit" className="w-full" disabled={loading !== null}>{loading === "email" ? "Logging in..." : "Log in"}</Button>
        </form>
      </div>
      <p className="mt-4 text-sm text-slate-500">New here? <Link className="font-semibold text-slate-950" href="/signup">Start trial</Link></p>
    </Card>
  );
}
