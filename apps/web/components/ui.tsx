import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-soft", className)}>{children}</section>;
}

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "green" | "orange" | "blue" | "red" | "slate" }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200"
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1", tones[tone])}>{children}</span>;
}

export function Button({ children, variant = "primary", className }: { children: React.ReactNode; variant?: "primary" | "secondary" | "ghost"; className?: string }) {
  const styles = {
    primary: "bg-ink text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100"
  };
  return <button className={cn("rounded-xl px-4 py-2 text-sm font-semibold transition", styles[variant], className)}>{children}</button>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400", props.className)} />;
}
