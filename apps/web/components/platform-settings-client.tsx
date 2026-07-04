"use client";

import { useState } from "react";
import { PlatformLogo, platformDisplayName } from "@/components/platform-logo";
import { Badge, Button, Card } from "@/components/ui";
import type { Platform } from "@/lib/types";

export type PlatformSetting = {
  id: Platform;
  label: string;
  description: string;
};

type PlatformSettingsClientProps = {
  platforms: PlatformSetting[];
  enabled: Platform[];
};

export function PlatformSettingsClient({ platforms, enabled }: PlatformSettingsClientProps) {
  const [enabledPlatforms, setEnabledPlatforms] = useState<Platform[]>(enabled);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  async function toggle(platformId: Platform) {
    const nextEnabled = enabledPlatforms.includes(platformId)
      ? enabledPlatforms.filter(id => id !== platformId)
      : [...enabledPlatforms, platformId];

    setEnabledPlatforms(nextEnabled);
    setSaving(platformId);
    setMessage("");

    const response = await fetch("/api/platform-settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targetPlatforms: nextEnabled })
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.ok === false) {
      setEnabledPlatforms(enabledPlatforms);
      setMessage(data.error || "Could not update platform settings.");
    } else {
      setMessage("Platform settings saved. Click Sync in the extension to refresh campaign settings.");
    }
    setSaving("");
  }

  return (
    <div className="space-y-4">
      {message ? <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-600">{message}</div> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map(platform => {
          const isEnabled = enabledPlatforms.includes(platform.id);
          return (
            <Card key={platform.id} className="transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <PlatformLogo platform={platform.id} />
                  <div>
                    <h2 className="font-semibold">{platform.label}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{platform.description}</p>
                  </div>
                </div>
                <Badge tone={isEnabled ? "green" : "slate"}>{isEnabled ? "Enabled" : "Disabled"}</Badge>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{platformDisplayName(platform.id)}</div>
                <Button
                  type="button"
                  variant={isEnabled ? "secondary" : "primary"}
                  disabled={Boolean(saving)}
                  onClick={() => toggle(platform.id)}
                >
                  {saving === platform.id ? "Saving" : isEnabled ? "Disable" : "Enable"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
