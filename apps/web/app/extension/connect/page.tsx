"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Badge, Button, Card } from "@/components/ui";

type ExtensionResponse = {
  ok?: boolean;
  error?: string;
};

type ChromeRuntimeBridge = {
  runtime?: {
    lastError?: { message?: string };
    sendMessage?: (
      extensionId: string,
      message: { type: "CLA_EXTENSION_SESSION"; payload: unknown },
      callback: (response?: ExtensionResponse) => void
    ) => void;
  };
};

type SessionPayload = {
  ok?: boolean;
  error?: string;
  token?: string;
  workspace?: unknown;
  campaign?: unknown;
  knowledgeBase?: unknown;
  keywordGroups?: unknown[];
  templateSet?: unknown;
};

function getChromeBridge(): ChromeRuntimeBridge | undefined {
  return (window as Window & { chrome?: ChromeRuntimeBridge }).chrome;
}

function ExtensionConnectClient() {
  const searchParams = useSearchParams();
  const extensionId = useMemo(() => searchParams.get("extensionId") || "", [searchParams]);
  const [state, setState] = useState<"connecting" | "success" | "login" | "error">("connecting");
  const [message, setMessage] = useState("Connecting your website session to the Chrome extension...");

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (!extensionId) {
        setState("error");
        setMessage("Missing extension ID. Open this page from the extension popup.");
        return;
      }

      try {
        const response = await fetch("/api/extension/auth/session", {
          method: "GET",
          credentials: "same-origin"
        });
        const payload = (await response.json().catch(() => ({}))) as SessionPayload;

        if (cancelled) return;

        if (response.status === 401) {
          setState("login");
          setMessage("You need to log in on the website first, then retry extension connection.");
          return;
        }

        if (!response.ok || !payload.ok || !payload.token) {
          setState("error");
          setMessage(payload.error || "Could not create an extension session.");
          return;
        }

        const chromeBridge = getChromeBridge();
        if (!chromeBridge?.runtime?.sendMessage) {
          setState("error");
          setMessage("Chrome extension messaging is not available. Make sure the extension is installed and reloaded.");
          return;
        }

        chromeBridge.runtime.sendMessage(extensionId, { type: "CLA_EXTENSION_SESSION", payload }, extensionResponse => {
          const runtimeError = chromeBridge.runtime?.lastError?.message;
          if (runtimeError) {
            setState("error");
            setMessage(runtimeError);
            return;
          }

          if (!extensionResponse?.ok) {
            setState("error");
            setMessage(extensionResponse?.error || "The extension rejected the connection.");
            return;
          }

          setState("success");
          setMessage("Connected. You can return to the extension popup now.");
        });
      } catch (error) {
        if (cancelled) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "Could not connect the extension.");
      }
    }

    connect();

    return () => {
      cancelled = true;
    };
  }, [extensionId]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-xl">
        <Card>
          <Badge tone={state === "success" ? "green" : state === "error" ? "red" : "blue"}>Extension connection</Badge>
          <h1 className="mt-4 text-3xl font-semibold">Connect Community Lead Assistant</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>

          {state === "connecting" ? <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-2/3 animate-pulse rounded-full bg-blue-600" /></div> : null}

          {state === "login" ? (
            <div className="mt-6">
              <Link href={`/login?next=${encodeURIComponent(`/extension/connect?extensionId=${extensionId}`)}`}>
                <Button>Log in and connect</Button>
              </Link>
            </div>
          ) : null}

          {state === "success" ? (
            <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
              The extension is connected to this dashboard workspace.
            </p>
          ) : null}

          {state === "error" ? (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              Reload the extension from <code>chrome://extensions</code>, open the dashboard, then click Use active website session again.
            </div>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

export default function ExtensionConnectPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950" />}>
      <ExtensionConnectClient />
    </Suspense>
  );
}
