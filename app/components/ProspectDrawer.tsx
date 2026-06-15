"use client";

import { useEffect, useRef, useState } from "react";
import type { Prospect } from "@prisma/client";
import ProspectForm from "./ProspectForm";
import AttachmentsSection from "./AttachmentsSection";
import ActivityLog from "./ActivityLog";
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
      <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-800">{value}</dd>
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
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(data: Record<string, unknown>) {
    setLoading(true);
    try {
      const url = prospect ? `/api/prospects/${prospect.id}` : "/api/prospects";
      const method = prospect ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
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
  const websiteLabel = WEBSITE_STATUS_OPTIONS.find((o) => o.value === prospect?.websiteStatus)?.label ?? prospect?.websiteStatus;
  const socialLabel = SOCIAL_STATUS_OPTIONS.find((o) => o.value === prospect?.socialStatus)?.label ?? prospect?.socialStatus;

  const sectionTitle = "text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-xl bg-white border-l border-gray-200 z-50 flex flex-col shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">
            {mode === "create" ? "Nuovo prospect" : mode === "edit" ? "Modifica prospect" : prospect?.businessName}
          </h2>
          <div className="flex items-center gap-2">
            {mode === "view" && prospect && (
              <>
                <button
                  onClick={onEdit}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-md transition-colors"
                >
                  Modifica
                </button>
                {confirmDelete ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-red-500">Sicuro?</span>
                    <button
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Elimina
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-700"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-md transition-colors"
                  >
                    Elimina
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {mode === "view" && prospect ? (
            <div className="space-y-6">
              {stage && (
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${stage.dot}`} />
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span>
                  <Badge value={prospect.potential} map={POTENTIAL_STYLES} />
                </div>
              )}

              <section>
                <h3 className={sectionTitle}>Informazioni attività</h3>
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

              <section>
                <h3 className={sectionTitle}>Valutazione</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Potenziale</dt>
                    <Badge value={prospect.potential} map={POTENTIAL_STYLES} />
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Stato sito</dt>
                    <dd className="text-sm text-gray-700">{websiteLabel ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Stato social</dt>
                    <dd className="text-sm text-gray-700">{socialLabel ?? "—"}</dd>
                  </div>
                </div>
              </section>

              {(prospect.issues || prospect.opportunities || prospect.notes) && (
                <section>
                  <h3 className={sectionTitle}>Note</h3>
                  <div className="space-y-3">
                    {prospect.issues && (
                      <div>
                        <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Problemi</dt>
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

              <section>
                <h3 className={sectionTitle}>Date</h3>
                <dl className="grid grid-cols-3 gap-4">
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Creato</dt>
                    <dd className="text-sm text-gray-700">{formatDate(prospect.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Ultimo contatto</dt>
                    <dd className="text-sm text-gray-700">{formatDate(prospect.lastContact)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Follow-up</dt>
                    <dd className="text-sm text-gray-700">{formatDate(prospect.nextFollowUp)}</dd>
                  </div>
                </dl>
              </section>

              <ActivityLog prospectId={prospect.id} />
              <AttachmentsSection prospectId={prospect.id} />
            </div>
          ) : (
            <ProspectForm initial={prospect ?? undefined} onSubmit={handleSubmit} onCancel={onClose} loading={loading} />
          )}
        </div>
      </div>
    </>
  );
}
