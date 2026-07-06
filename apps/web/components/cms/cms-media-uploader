"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCmsToast } from "@/hooks/cms/use-cms-toast";

export function CmsMediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [folder, setFolder] = useState("library");
  const [uploading, setUploading] = useState(false);
  const { toast, showToast } = useCmsToast();

  async function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      showToast("Choose a file first.", "error");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const response = await fetch("/api/cms/media/upload", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    setUploading(false);
    if (!response.ok || data.ok === false) {
      showToast(data.error || "Upload failed.", "error");
      return;
    }
    showToast("Media uploaded.", "success");
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-48 flex-1">
          <span className="mb-1 block text-sm font-medium text-slate-200">Folder</span>
          <input value={folder} onChange={event => setFolder(event.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-blue-400" />
        </label>
        <label className="min-w-64 flex-1">
          <span className="mb-1 block text-sm font-medium text-slate-200">Upload media</span>
          <input ref={inputRef} type="file" className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white" />
        </label>
        <button type="button" disabled={uploading} onClick={upload} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-60">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">Supports images, SVG, video, PDF, and ZIP up to 50MB.</p>
      {toast ? (
        <div className={[
          "fixed bottom-5 right-5 z-50 rounded-2xl px-4 py-3 text-sm font-semibold shadow-2xl",
          toast.tone === "error" ? "bg-red-500 text-white" : toast.tone === "success" ? "bg-emerald-500 text-white" : "bg-white text-slate-950"
        ].join(" ")}>
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
