"use client";

import { useEffect, useState } from "react";
import type { SpesaOperativa } from "@prisma/client";

const CATEGORIE = ["Hosting", "AI", "Software", "Dominio", "VPS", "Altro"];
const FREQUENZE = ["MENSILE", "ANNUALE", "UNA_TANTUM"];

function toDateInput(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function formatDate(val: Date | string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("it-IT");
}

function scadenteEntro30(val: Date | string | null | undefined): boolean {
  if (!val) return false;
  const d = new Date(val);
  const oggi = new Date();
  const diff = d.getTime() - oggi.getTime();
  return diff >= 0 && diff <= 30 * 86400000;
}

function totMensile(spese: SpesaOperativa[]): number {
  return spese.reduce((acc, s) => {
    if (s.frequenza === "MENSILE") return acc + s.importo;
    if (s.frequenza === "ANNUALE") return acc + s.importo / 12;
    return acc;
  }, 0);
}

function totAnnuale(spese: SpesaOperativa[]): number {
  return spese.reduce((acc, s) => {
    if (s.frequenza === "MENSILE") return acc + s.importo * 12;
    if (s.frequenza === "ANNUALE") return acc + s.importo;
    return acc;
  }, 0);
}

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors";
const sel = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors";
const lbl = "block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide";

type FormData = {
  nome: string;
  categoria: string;
  importo: string;
  valuta: string;
  frequenza: string;
  prossimoRinnovo: string;
  rinnovoAuto: boolean;
  note: string;
};

const emptyForm: FormData = {
  nome: "",
  categoria: "Hosting",
  importo: "",
  valuta: "EUR",
  frequenza: "MENSILE",
  prossimoRinnovo: "",
  rinnovoAuto: false,
  note: "",
};

function SpesaForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={lbl}>Nome *</label>
          <input className={inp} value={form.nome} onChange={e => set("nome", e.target.value)} required placeholder="Es. Hostinger Business" />
        </div>
        <div>
          <label className={lbl}>Categoria *</label>
          <select className={sel} value={form.categoria} onChange={e => set("categoria", e.target.value)}>
            {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={lbl}>Importo *</label>
          <input className={inp} type="number" step="0.01" min="0" value={form.importo} onChange={e => set("importo", e.target.value)} required placeholder="0.00" />
        </div>
        <div>
          <label className={lbl}>Valuta</label>
          <select className={sel} value={form.valuta} onChange={e => set("valuta", e.target.value)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Frequenza *</label>
          <select className={sel} value={form.frequenza} onChange={e => set("frequenza", e.target.value)}>
            {FREQUENZE.map(f => <option key={f} value={f}>{f === "MENSILE" ? "Mensile" : f === "ANNUALE" ? "Annuale" : "Una tantum"}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className={lbl}>Prossimo rinnovo</label>
          <input className={inp} type="date" value={form.prossimoRinnovo} onChange={e => set("prossimoRinnovo", e.target.value)} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            id="rinnovoAuto"
            type="checkbox"
            checked={form.rinnovoAuto}
            onChange={e => set("rinnovoAuto", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
          />
          <label htmlFor="rinnovoAuto" className="text-sm text-gray-700">Rinnovo automatico</label>
        </div>
        <div className="col-span-2">
          <label className={lbl}>Note</label>
          <textarea className={`${inp} resize-none`} rows={2} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Note opzionali..." />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          Annulla
        </button>
        <button type="submit" disabled={loading} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50">
          {loading ? "Salvataggio..." : "Salva"}
        </button>
      </div>
    </form>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm">✕</button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  );
}

export default function SpesePage() {
  const [spese, setSpese] = useState<SpesaOperativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"create" | { spesa: SpesaOperativa } | null>(null);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/spese")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSpese(data); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(data: FormData) {
    setSaving(true);
    try {
      if (modal === "create") {
        const res = await fetch("/api/spese", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const created: SpesaOperativa = await res.json();
        setSpese(prev => [created, ...prev]);
      } else if (modal && typeof modal === "object") {
        const res = await fetch(`/api/spese/${modal.spesa.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const updated: SpesaOperativa = await res.json();
        setSpese(prev => prev.map(s => s.id === updated.id ? updated : s));
      }
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await fetch(`/api/spese/${id}`, { method: "DELETE" });
    setSpese(prev => prev.filter(s => s.id !== id));
    setConfirmDel(null);
  }

  const scadenze = spese.filter(s => scadenteEntro30(s.prossimoRinnovo));
  const mensile = totMensile(spese);
  const annuale = totAnnuale(spese);

  const freqLabel = (f: string) => f === "MENSILE" ? "Mensile" : f === "ANNUALE" ? "Annuale" : "Una tantum";

  function toFormData(s: SpesaOperativa): FormData {
    return {
      nome: s.nome,
      categoria: s.categoria,
      importo: String(s.importo),
      valuta: s.valuta,
      frequenza: s.frequenza,
      prossimoRinnovo: toDateInput(s.prossimoRinnovo),
      rinnovoAuto: s.rinnovoAuto,
      note: s.note ?? "",
    };
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Spese Operative</h1>
          <p className="text-sm text-gray-400 mt-0.5">{spese.length} spese attive</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Aggiungi spesa
        </button>
      </div>

      {/* Card riepilogative */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Totale mensile</p>
          <p className="text-2xl font-bold text-gray-900">{mensile.toFixed(2)} <span className="text-sm font-normal text-gray-400">EUR</span></p>
          <p className="text-xs text-gray-400 mt-0.5">stima basata sulle spese attive</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">Totale annuale</p>
          <p className="text-2xl font-bold text-gray-900">{annuale.toFixed(2)} <span className="text-sm font-normal text-gray-400">EUR</span></p>
          <p className="text-xs text-gray-400 mt-0.5">stima basata sulle spese attive</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">Rinnovi entro 30 gg</p>
            {scadenze.length > 0 && (
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{scadenze.length}</span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{scadenze.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {scadenze.length === 0 ? "Nessun rinnovo imminente" : scadenze.map(s => s.nome).join(", ")}
          </p>
        </div>
      </div>

      {/* Tabella */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-gray-400">Caricamento...</div>
        </div>
      ) : spese.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center py-16 gap-2">
          <p className="text-gray-400 text-sm">Nessuna spesa registrata</p>
          <button onClick={() => setModal("create")} className="text-sm text-gray-900 underline underline-offset-2">
            Aggiungi la prima spesa
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Categoria</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Importo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Frequenza</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Prossimo rinnovo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Auto</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {spese.map(s => {
                const inScadenza = scadenteEntro30(s.prossimoRinnovo);
                return (
                  <tr key={s.id} className={`group transition-colors ${inScadenza ? "bg-amber-50/60" : "hover:bg-gray-50"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{s.nome}</span>
                        {inScadenza && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">⚠ In scadenza</span>
                        )}
                      </div>
                      {s.note && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{s.note}</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{s.categoria}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-900 tabular-nums">
                      {s.importo.toFixed(2)} <span className="text-xs text-gray-400">{s.valuta}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600">{freqLabel(s.frequenza)}</td>
                    <td className="px-4 py-3.5 text-gray-600">{formatDate(s.prossimoRinnovo)}</td>
                    <td className="px-4 py-3.5 text-center">
                      {s.rinnovoAuto
                        ? <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Attivo</span>
                        : <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium">No</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal({ spesa: s })}
                          className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-md transition-colors"
                        >
                          Modifica
                        </button>
                        {confirmDel === s.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(s.id)} className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">Elimina</button>
                            <button onClick={() => setConfirmDel(null)} className="px-2 py-1 text-xs text-gray-400 hover:text-gray-700">No</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDel(s.id)}
                            className="px-2.5 py-1 text-xs text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 rounded-md transition-colors"
                          >
                            Elimina
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <Modal
          title={modal === "create" ? "Nuova spesa" : `Modifica — ${(modal as { spesa: SpesaOperativa }).spesa.nome}`}
          onClose={() => setModal(null)}
        >
          <SpesaForm
            initial={modal === "create" ? emptyForm : toFormData((modal as { spesa: SpesaOperativa }).spesa)}
            onSave={handleSave}
            onCancel={() => setModal(null)}
            loading={saving}
          />
        </Modal>
      )}

      {/* Confirm delete overlay (se il modal è chiuso ma confirmDel è attivo su riga non visibile) */}
    </div>
  );
}
