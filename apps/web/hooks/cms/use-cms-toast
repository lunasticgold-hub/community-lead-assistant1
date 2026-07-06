"use client";

import { useCallback, useState } from "react";

export type CmsToast = {
  message: string;
  tone: "success" | "error" | "info";
};

export function useCmsToast() {
  const [toast, setToast] = useState<CmsToast | null>(null);

  const showToast = useCallback((message: string, tone: CmsToast["tone"] = "info") => {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  return { toast, showToast };
}
