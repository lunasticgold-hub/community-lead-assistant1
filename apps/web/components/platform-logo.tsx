import { cn } from "@/components/ui";

type PlatformLogoProps = {
  platform: string;
  className?: string;
};

const platformStyle: Record<string, { label: string; bg: string; fg: string }> = {
  reddit: { label: "r/", bg: "bg-orange-500", fg: "text-white" },
  linkedin: { label: "in", bg: "bg-[#0A66C2]", fg: "text-white" },
  facebook: { label: "f", bg: "bg-[#1877F2]", fg: "text-white" },
  slack: { label: "#", bg: "bg-[#4A154B]", fg: "text-white" },
  discord: { label: "D", bg: "bg-[#5865F2]", fg: "text-white" },
  telegram: { label: "T", bg: "bg-[#229ED9]", fg: "text-white" },
  whatsapp: { label: "W", bg: "bg-[#25D366]", fg: "text-slate-950" },
  indiehackers: { label: "IH", bg: "bg-[#0E2439]", fg: "text-white" },
  producthunt: { label: "P", bg: "bg-[#DA552F]", fg: "text-white" },
  x: { label: "X", bg: "bg-black", fg: "text-white" }
};

export function normalizePlatform(value: string) {
  const key = value.toLowerCase().replace(/\s+/g, "").replace("groups", "").replace("web", "");
  if (key.includes("reddit")) return "reddit";
  if (key.includes("linkedin")) return "linkedin";
  if (key.includes("facebook")) return "facebook";
  if (key.includes("slack")) return "slack";
  if (key.includes("discord")) return "discord";
  if (key.includes("telegram")) return "telegram";
  if (key.includes("whatsapp")) return "whatsapp";
  if (key.includes("indie")) return "indiehackers";
  if (key.includes("producthunt")) return "producthunt";
  if (key === "x" || key.includes("twitter")) return "x";
  return key || "platform";
}

export function PlatformLogo({ platform, className }: PlatformLogoProps) {
  const key = normalizePlatform(platform);
  const config = platformStyle[key] || { label: platform.slice(0, 2).toUpperCase(), bg: "bg-slate-900", fg: "text-white" };

  return (
    <span className={cn("inline-grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black shadow-sm", config.bg, config.fg, className)}>
      {config.label}
    </span>
  );
}

export function platformDisplayName(platform: string) {
  const key = normalizePlatform(platform);
  const names: Record<string, string> = {
    reddit: "Reddit",
    linkedin: "LinkedIn",
    facebook: "Facebook Groups",
    slack: "Slack",
    discord: "Discord",
    telegram: "Telegram",
    whatsapp: "WhatsApp",
    indiehackers: "Indie Hackers",
    producthunt: "Product Hunt",
    x: "X"
  };
  return names[key] || platform;
}
