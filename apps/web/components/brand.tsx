import { cn } from "./ui";

export function BrandMark({ className, logoUrl }: { className?: string; logoUrl?: string }) {
  if (logoUrl) {
    return (
      <span
        className={cn("relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white bg-contain bg-center bg-no-repeat shadow-soft", className)}
        style={{ backgroundImage: `url("${logoUrl}")` }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span className={cn("relative grid h-9 w-9 place-items-center rounded-xl bg-ink text-white shadow-soft", className)} aria-hidden="true">
      <span className="absolute inset-1 rounded-lg bg-gradient-to-br from-blue-500 to-sky-300 opacity-95" />
      <span className="relative h-4 w-4 rounded-[5px] border-2 border-white">
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-white" />
      </span>
    </span>
  );
}

export function BrandLockup({ compact = false, name, shortName, logoUrl }: { compact?: boolean; name?: string; shortName?: string; logoUrl?: string }) {
  const displayName = compact ? shortName || "Community Lead" : name || "Community Lead Assistant";
  return (
    <span className="flex items-center gap-3">
      <BrandMark logoUrl={logoUrl} />
      <span className="leading-tight">
        <span className="block font-semibold text-slate-950 dark:text-white">{displayName}</span>
        {compact ? <span className="block text-xs text-slate-500 dark:text-slate-400">Workspace</span> : null}
      </span>
    </span>
  );
}
