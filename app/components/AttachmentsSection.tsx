"use client";

import { useEffect, useRef, useState } from "react";
import type { Attachment } from "@prisma/client";

const CATEGORIES = [
  { value: "SCREENSHOT_SITO", label: "Screenshot sito" },
  { value: "SCREENSHOT_INSTAGRAM", label: "Screenshot Instagram" },
  { value: "MOCKUP", label: "Mockup nuovo sito" },
  { value: "ANTEPRIMA", label: "Anteprima grafica" },
  { value: "PDF_PROPOSTA", label: "PDF proposta" },
  { value: "ALTRO", label: "Altro" },
] as const;

const CATEGORY_ICON: Record<string, string> = {
  SCREENSHOT_SITO: "🌐",
  SCREENSHOT_INSTAGRAM: "📸",
  MOCKUP: "🎨",
  ANTEPRIMA: "🖼",
  PDF_PROPOSTA: "📄",
  ALTRO: "📎",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

interface Props {
  prospectId: number;
}

export default function AttachmentsSection({ prospectId }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("ALTRO");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [preview, setPreview] = useState<Attachment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/prospects/${prospectId}/attachments`)
      .then((r) => r.json())
      .then(setAttachments);
  }, [prospectId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("category", category);
    const res = await fetch(`/api/prospects/${prospectId}/attachments`, {
      method: "POST",
      body: fd,
    });
    const created: Attachment = await res.json();
    setAttachments((prev) => [created, ...prev]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    await fetch(`/api/prospects/${prospectId}/attachments/${id}`, {
      method: "DELETE",
    });
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  }

  const fileUrl = (a: Attachment) => `/api/files/${a.storagePath.replace(/\\/g, "/")}`;

  const sel = "border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-gray-900";

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        Materiali
      </h3>

      {/* Upload row */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={sel}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <span
            className={`flex items-center justify-center gap-1.5 w-full px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 cursor-pointer hover:border-gray-500 hover:text-gray-800 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {uploading ? "Caricamento..." : "＋ Carica file"}
          </span>
        </label>
      </div>

      {/* File list */}
      {attachments.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-4">
          Nessun materiale caricato
        </p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50 group"
            >
              {/* Thumbnail or icon */}
              {isImage(a.mimeType) ? (
                <button
                  onClick={() => setPreview(a)}
                  className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileUrl(a)}
                    alt={a.originalName}
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : (
                <div className="w-10 h-10 rounded flex-shrink-0 bg-white border border-gray-200 flex items-center justify-center text-lg">
                  {CATEGORY_ICON[a.category] ?? "📎"}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {a.originalName}
                </p>
                <p className="text-xs text-gray-400">
                  {CATEGORIES.find((c) => c.value === a.category)?.label ?? a.category}
                  {" · "}
                  {formatBytes(a.size)}
                  {" · "}
                  {formatDate(a.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {isImage(a.mimeType) && (
                  <button
                    onClick={() => setPreview(a)}
                    title="Anteprima"
                    className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 text-xs"
                  >
                    👁
                  </button>
                )}
                <a
                  href={fileUrl(a)}
                  download={a.originalName}
                  title="Scarica"
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 text-xs"
                >
                  ↓
                </a>
                <a
                  href={fileUrl(a)}
                  target="_blank"
                  rel="noreferrer"
                  title="Apri"
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-900 text-xs"
                >
                  ↗
                </a>
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deleting === a.id}
                  title="Elimina"
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 text-xs"
                >
                  {deleting === a.id ? "…" : "✕"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Image preview lightbox */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-8"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-w-3xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-3 -right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-gray-900 shadow text-sm"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl(preview)}
              alt={preview.originalName}
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
            <p className="text-center text-white/70 text-xs mt-2">
              {preview.originalName}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
