"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { MarketingShell } from "@/components/marketing-shell";
import { Button, Card, Field, TextInput } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

function authMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already")) return "This email is already registered. Try logging in instead.";
  if (lower.includes("provider") || lower.includes("disabled")) return "Google login is not enabled in Supabase yet.";
  if (lower.includes("password")) return "Please use a stronger password.";
  if (lower.includes("supabase is not configured")) return message;
  if (lower.includes("failed to fetch") || lower.includes("network")) return "Network error. Check your internet connection and Supabase settings.";
  return message || "Something went wrong. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);

  async function handleGoogleSignup() {
    setError("");
    setNotice("");
    setLoading("google");
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (oauthError) throw oauthError;
    } catch (googleError) {
      setError(authMessage(googleError instanceof Error ? googleError.message : "Could not start Google signup."));
      setLoading(null);
    }
  }

  async function handleEmailSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!name.trim()) return setError("Please enter your name.");
    if (!email.trim()) return setError("Please enter your email.");
    if (!password) return setError("Please enter a password.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading("email");
    try {
      const supabase = createClient();
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            full_name: name.trim()
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
        }
      });
      if (signupError) throw signupError;

      if (data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }

      setNotice("Account created. Check your email to confirm your account, then log in.");
    } catch (signupError) {
      setError(authMessage(signupError instanceof Error ? signupError.message : "Could not create account."));
    } finally {
      setLoading(null);
    }
  }

  return (
    <MarketingShell>
      <main className="mx-auto max-w-md px-6 py-16">
        <Card>
          <h1 className="text-2xl font-semibold">Start your 7-day trial</h1>
          <p className="mt-2 text-sm text-slate-600">Includes 50 saved lead credits and 50 Gemini draft credits. No free plan after trial.</p>
          <div className="mt-6 space-y-4">
            <Button type="button" className="w-full" variant="secondary" onClick={handleGoogleSignup} disabled={loading !== null}>
              {loading === "google" ? "Opening Google..." : "Continue with Google"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" />
            </div>
            <form className="space-y-4" onSubmit={handleEmailSignup}>
              <Field label="Name"><TextInput value={name} onChange={event => setName(event.target.value)} placeholder="Ava Founder" autoComplete="name" /></Field>
              <Field label="Email"><TextInput value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></Field>
              <Field label="Password"><TextInput value={password} onChange={event => setPassword(event.target.value)} type="password" placeholder="Create a password" autoComplete="new-password" /></Field>
              {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
              {notice ? <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-700">{notice}</p> : null}
              <Button type="submit" className="w-full" disabled={loading !== null}>{loading === "email" ? "Creating account..." : "Continue"}</Button>
            </form>
          </div>
          <p className="mt-4 text-sm text-slate-500">Already have an account? <Link className="font-semibold text-slate-950" href="/login">Log in</Link></p>
          <p className="mt-4 text-xs leading-5 text-slate-500">Google OAuth is enabled through Supabase Auth once the Google client ID and secret are added in the Supabase dashboard.</p>
        </Card>
      </main>
    </MarketingShell>
  );
}
