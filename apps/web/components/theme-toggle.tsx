"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cla-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = saved ? saved === "dark" : prefersDark;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("cla-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
