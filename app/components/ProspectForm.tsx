"use client";

import {
  PIPELINE_STAGES,
  POTENTIAL_OPTIONS,
  WEBSITE_STATUS_OPTIONS,
  SOCIAL_STATUS_OPTIONS,
} from "@/lib/constants";
import type { Prospect } from "@prisma/client";

type FormData = Omit<Prospect, "id" | "createdAt" | "updatedAt"> & {
  lastContact: string;
  nextFollowUp: string;
};

interface Props {
  initial?: Partial<Prospect>;
  onSubmit: (data: Partial<FormData>) => void;
  onCancel: () => void;
  loading?: boolean;
}

function toDateInput(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function ProspectForm({ initial, onSubmit, onCancel, loading }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string | null> = {};
    fd.forEach((v, k) => {
      data[k] = (v as string).trim() || null;
    });
    onSubmit(data as Partial<FormData>);
  }

  const inp =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-300";
  const sel =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white";
  const lbl = "block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide";
  const textarea =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none placeholder:text-gray-300";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informazioni attività */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Informazioni attività
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={lbl}>Nome attività *</label>
            <input
              name="businessName"
              defaultValue={initial?.businessName ?? ""}
              required
              className={inp}
              placeholder="Es. Pizzeria Da Mario"
            />
          </div>
          <div>
            <label className={lbl}>Titolare</label>
            <input
              name="ownerName"
              defaultValue={initial?.ownerName ?? ""}
              className={inp}
              placeholder="Es. Mario Rossi"
            />
          </div>
          <div>
            <label className={lbl}>Categoria *</label>
            <input
              name="category"
              defaultValue={initial?.category ?? ""}
              required
              className={inp}
              placeholder="Es. Ristorazione"
            />
          </div>
          <div>
            <label className={lbl}>Città *</label>
            <input
              name="city"
              defaultValue={initial?.city ?? ""}
              required
              className={inp}
              placeholder="Es. Milano"
            />
          </div>
          <div>
            <label className={lbl}>Telefono</label>
            <input
              name="phone"
              defaultValue={initial?.phone ?? ""}
              className={inp}
              placeholder="02 1234567"
            />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input
              name="email"
              type="email"
              defaultValue={initial?.email ?? ""}
              className={inp}
              placeholder="info@esempio.it"
            />
          </div>
          <div>
            <label className={lbl}>Sito web</label>
            <input
              name="website"
              defaultValue={initial?.website ?? ""}
              className={inp}
              placeholder="esempio.it"
            />
          </div>
          <div>
            <label className={lbl}>Instagram</label>
            <input
              name="instagram"
              defaultValue={initial?.instagram ?? ""}
              className={inp}
              placeholder="@handle"
            />
          </div>
        </div>
      </section>

      {/* Valutazione */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Valutazione
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={lbl}>Potenziale</label>
            <select name="potential" defaultValue={initial?.potential ?? "MEDIO"} className={sel}>
              {POTENTIAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Stato sito</label>
            <select name="websiteStatus" defaultValue={initial?.websiteStatus ?? "ASSENTE"} className={sel}>
              {WEBSITE_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={lbl}>Stato social</label>
            <select name="socialStatus" defaultValue={initial?.socialStatus ?? "SCARSO"} className={sel}>
              {SOCIAL_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Pipeline
        </h3>
        <div>
          <label className={lbl}>Stato</label>
          <select name="status" defaultValue={initial?.status ?? "DA_CONTATTARE"} className={sel}>
            {PIPELINE_STAGES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Note */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Note
        </h3>
        <div className="space-y-3">
          <div>
            <label className={lbl}>Problemi individuati</label>
            <textarea
              name="issues"
              defaultValue={initial?.issues ?? ""}
              rows={2}
              className={textarea}
              placeholder="Es. Nessuna presenza online, sito obsoleto..."
            />
          </div>
          <div>
            <label className={lbl}>Opportunità individuate</label>
            <textarea
              name="opportunities"
              defaultValue={initial?.opportunities ?? ""}
              rows={2}
              className={textarea}
              placeholder="Es. Zona ad alta densità turistica..."
            />
          </div>
          <div>
            <label className={lbl}>Note libere</label>
            <textarea
              name="notes"
              defaultValue={initial?.notes ?? ""}
              rows={2}
              className={textarea}
              placeholder="Altre note..."
            />
          </div>
        </div>
      </section>

      {/* Date */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
          Date
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Ultimo contatto</label>
            <input
              name="lastContact"
              type="date"
              defaultValue={toDateInput(initial?.lastContact)}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Prossimo follow-up</label>
            <input
              name="nextFollowUp"
              type="date"
              defaultValue={toDateInput(initial?.nextFollowUp)}
              className={inp}
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Salvataggio..." : "Salva"}
        </button>
      </div>
    </form>
  );
}
