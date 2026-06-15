"use client";

import { useEffect, useState } from "react";
import type { Activity } from "@prisma/client";

const ACTIVITY_TYPES = [
  { value: "CHIAMATA", label: "Chiamata", icon: "📞" },
  { value: "EMAIL", label: "Email", icon: "📧" },
  { value: "RIUNIONE", label: "Riunione", icon: "🤝" },
  { value: "NOTA", label: "Nota", icon: "📝" },
  { value: "MOCKUP_INVIATO", label: "Mockup inviato", icon: "🎨" },
  { value: "PREVENTIVO", label: "Preventivo", icon: "📄" },
] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number]["value"];

const TYPE_ICON: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.value, t.icon])
);

const TYPE_LABEL: Record<string, string> = Object.fromEntries(
  ACTIVITY_TYPES.map((t) => [t.value, t.label])
);

function formatDate(val: Date | string): string {
  return new Date(val).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  prospectId: number;
}

interface FormState {
  type: ActivityType;
  date: string;
  summary: string;
  outcome: string;
  nextAction: string;
}

const EMPTY_FORM: FormState = {
  type: "CHIAMATA",
  date: todayISO(),
  summary: "",
  outcome: "",
  nextAction: "",
};

export default function ActivityLog({ prospectId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/prospects/${prospectId}/activities`)
      .then((r) => r.json())
      .then(setActivities);
  }, [prospectId]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.summary.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/prospects/${prospectId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        date: form.date,
        summary: form.summary.trim(),
        outcome: form.outcome.trim() || undefined,
        nextAction: form.nextAction.trim() || undefined,
      }),
    });
    const created: Activity = await res.json();
    setActivities((prev) => [created, ...prev]);
    setForm({ ...EMPTY_FORM, date: todayISO() });
    setOpen(false);
    setSaving(false);
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    await fetch(`/api/prospects/${prospectId}/activities/${id}`, {
      method: "DELETE",
    });
    setActivities((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  }

  const inp =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 placeholder:text-gray-300";
  const sel =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white";
  const lbl = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Attività
        </h3>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-colors"
        >
          {open ? "Annulla" : "+ Aggiungi"}
        </button>
      </div>

      {/* Form inline */}
      {open && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setField("type", e.target.value as ActivityType)}
                className={sel}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
                className={inp}
              />
            </div>
          </div>

          <div>
            <label className={lbl}>Sommario *</label>
            <textarea
              value={form.summary}
              onChange={(e) => setField("summary", e.target.value)}
              required
              rows={2}
              placeholder="Descrivi brevemente l'attività..."
              className={`${inp} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Esito</label>
              <input
                type="text"
                value={form.outcome}
                onChange={(e) => setField("outcome", e.target.value)}
                placeholder="Es. Interessato, richiama"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Prossima azione</label>
              <input
                type="text"
                value={form.nextAction}
                onChange={(e) => setField("nextAction", e.target.value)}
                placeholder="Es. Inviare mockup"
                className={inp}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !form.summary.trim()}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              {saving ? "Salvataggio..." : "Salva attività"}
            </button>
          </div>
        </form>
      )}

      {/* Lista attività */}
      {activities.length === 0 ? (
        <p className="text-xs text-gray-300 text-center py-4">
          Nessuna attività registrata
        </p>
      ) : (
        <ul className="space-y-2">
          {activities.map((a) => (
            <li
              key={a.id}
              className="group flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 bg-gray-50"
            >
              {/* Icona */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-base mt-0.5">
                {TYPE_ICON[a.type] ?? "📌"}
              </div>

              {/* Contenuto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-700">
                    {TYPE_LABEL[a.type] ?? a.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(a.date)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 leading-snug">
                  {a.summary}
                </p>
                {a.outcome && (
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="font-medium text-gray-600">Esito:</span>{" "}
                    {a.outcome}
                  </p>
                )}
                {a.nextAction && (
                  <p className="text-xs text-orange-600 mt-0.5">
                    <span className="font-medium">→</span> {a.nextAction}
                  </p>
                )}
              </div>

              {/* Elimina */}
              <button
                onClick={() => handleDelete(a.id)}
                disabled={deleting === a.id}
                title="Elimina"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 text-xs self-start"
              >
                {deleting === a.id ? "…" : "✕"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
