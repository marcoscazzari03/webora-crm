"use client";

import { useEffect, useRef, useState } from "react";
import type { Prospect } from "@prisma/client";
import ProspectForm from "./ProspectForm";
import AttachmentsSection from "./AttachmentsSection";
import {
  PIPELINE_STAGES,
  POTENTIAL_STYLES,
  WEBSITE_STATUS_OPTIONS,
  SOCIAL_STATUS_OPTIONS,
} from "@/lib/constants";

interface Props {
  prospect: Prospect | null;
  mode: "view" | "edit" | "create";
  onClose: () => void;
  onSaved: (p: Prospect) => void;
  onDeleted: (id: number) => void;
  onEdit: () => void;
}

function formatDate(val: Date | string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("it-IT");
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

function Badge({ value, map }: { value: string; map: Record<string, string> }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[value] ?? "bg-gray-100 text-gray-600"}`}>
      {value}
    </span>
  );
}

export default function ProspectDrawer({ prospect, mode, onClose, onSaved, onDeleted, onEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    try {
      const url = prospect ? `/api/prospects/${prospect.id}` : "/api/prospects";
      const method = prospect ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const saved: Prospect = await res.json();
      onSaved(saved);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!prospect) return;
    setLoading(true);
    await fetch(`/api/prospects/${prospect.id}`, { method: "DELETE" });
    onDeleted(prospect.id);
    setLoading(false);
  }

  const stage = PIPELINE_STAGES.find((s) => s.key === prospect?.status);

  const websiteLabel =
    WEBSITE_STATUS_OPTIONS.find((o) => o.value === prospect?.websiteStatus)?.label ?? prospect?.websiteStatus;
  const socialLabel =
    SOCIAL_STATUS_OPTIONS.find((o) => o.value === prospect?.socialStatus)?.label ?? prospect?.socialStatus;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-base">
            {mode === "create"
              ? "Nuovo prospect"
              : mode === "edit"
              ? "Modifica prospect"
              : prospect?.businessName}
          </h2>
          <div className="flex items-center gap-2">
            {mode === "view" && prospect && (
              <>
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                >
                  Modifica
                </button>
                {confirmDelete ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-600">Sicuro?</span>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Elimina
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-900"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 border border-red-200 rounded-lg hover:border-red-400 transition-colors"
                  >
                    Elimina
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {mode === "view" && prospect ? (
            <div className="space-y-6">
              {/* Status badge */}
              {stage && (
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.color}`}>
                    {stage.label}
                  </span>
                  <Badge
                    value={prospect.potential}
                    map={POTENTIAL_STYLES}
                  />
                </div>
              )}

              {/* Info attività */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Informazioni attività
                </h3>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <InfoRow label="Nome attività" value={prospect.businessName} />
                  <InfoRow label="Titolare" value={prospect.ownerName} />
                  <InfoRow label="Categoria" value={prospect.category} />
                  <InfoRow label="Città" value={prospect.city} />
                  <InfoRow label="Telefono" value={prospect.phone} />
                  <InfoRow label="Email" value={prospect.email} />
                  <InfoRow label="Sito web" value={prospect.website} />
                  <InfoRow label="Instagram" value={prospect.instagram} />
                </dl>
              </section>

              {/* Valutazione */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Valutazione
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Potenziale</dt>
                    <Badge value={prospect.potential} map={POTENTIAL_STYLES} />
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Stato sito</dt>
                    <dd className="text-sm text-gray-900">{websiteLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Stato social</dt>
                    <dd className="text-sm text-gray-900">{socialLabel}</dd>
                  </div>
                </div>
              </section>

              {/* Note */}
              {(prospect.issues || prospect.opportunities || prospect.notes) && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Note
                  </h3>
                  <div className="space-y-3">
                    {prospect.issues && (
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Problemi individuati</dt>
                        <dd className="text-sm text-gray-700 leading-relaxed">{prospect.issues}</dd>
                      </div>
                    )}
                    {prospect.opportunities && (
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Opportunità</dt>
                        <dd className="text-sm text-gray-700 leading-relaxed">{prospect.opportunities}</dd>
                      </div>
                    )}
                    {prospect.notes && (
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Note libere</dt>
                        <dd className="text-sm text-gray-700 leading-relaxed">{prospect.notes}</dd>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Date */}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Date
                </h3>
                <dl className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Creato</dt>
                    <dd className="text-sm text-gray-900">{formatDate(prospect.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Ultimo contatto</dt>
                    <dd className="text-sm text-gray-900">{formatDate(prospect.lastContact)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Follow-up</dt>
                    <dd className="text-sm text-gray-900">{formatDate(prospect.nextFollowUp)}</dd>
                  </div>
                </dl>
              </section>

              {/* Materiali */}
              <AttachmentsSection prospectId={prospect.id} />
            </div>
          ) : (
            <ProspectForm
              initial={prospect ?? undefined}
              onSubmit={handleSubmit}
              onCancel={onClose}
              loading={loading}
            />
          )}
        </div>
      </div>
    </>
  );
}
