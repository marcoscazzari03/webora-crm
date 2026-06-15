"use client";

import { useState, useMemo } from "react";
import type { Prospect } from "@prisma/client";
import { PIPELINE_STAGES, POTENTIAL_OPTIONS, POTENTIAL_STYLES } from "@/lib/constants";
import ProspectDrawer from "./ProspectDrawer";

interface Props {
  initialProspects: Prospect[];
}

type DrawerState =
  | { mode: "view" | "edit"; prospect: Prospect }
  | { mode: "create"; prospect: null }
  | null;

function ProspectCard({ prospect, onClick }: { prospect: Prospect; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
    >
      <div className="font-medium text-gray-900 text-sm truncate leading-snug">
        {prospect.businessName}
      </div>
      {prospect.ownerName && (
        <div className="text-xs text-gray-400 mt-0.5 truncate">{prospect.ownerName}</div>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs bg-gray-50 text-gray-500 border border-gray-100 rounded px-1.5 py-0.5 truncate max-w-[90px]">
          {prospect.category}
        </span>
        <span className="text-xs text-gray-400 truncate">{prospect.city}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${POTENTIAL_STYLES[prospect.potential] ?? "bg-gray-50 text-gray-500"}`}>
          {prospect.potential === "ALTO" ? "Alto" : prospect.potential === "MEDIO" ? "Medio" : "Basso"}
        </span>
        {prospect.nextFollowUp && (
          <span className="text-xs text-amber-500 font-medium">
            ↻ {new Date(prospect.nextFollowUp).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" })}
          </span>
        )}
      </div>
    </button>
  );
}

function PipelineColumn({
  stage,
  prospects,
  onCardClick,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  prospects: Prospect[];
  onCardClick: (p: Prospect) => void;
}) {
  return (
    <div className={`flex flex-col rounded-xl border ${stage.border} bg-white overflow-hidden`}>
      <div className={`${stage.header} px-4 py-3 border-b ${stage.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${stage.dot}`} />
            <span className="text-xs font-semibold text-gray-700 truncate">{stage.label}</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${stage.color}`}>
            {prospects.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-2.5 flex flex-col gap-1.5 min-h-[160px] bg-gray-50/40">
        {prospects.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-gray-300">Vuoto</span>
          </div>
        ) : (
          prospects.map((p) => (
            <ProspectCard key={p.id} prospect={p} onClick={() => onCardClick(p)} />
          ))
        )}
      </div>
    </div>
  );
}

const inp = "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors";
const sel = "bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors";

export default function PipelineBoard({ initialProspects }: Props) {
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPotential, setFilterPotential] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const uniqueCategories = useMemo(
    () => [...new Set(prospects.map((p) => p.category).filter(Boolean))].sort(),
    [prospects]
  );
  const uniqueCities = useMemo(
    () => [...new Set(prospects.map((p) => p.city).filter(Boolean))].sort(),
    [prospects]
  );

  const filteredProspects = useMemo(() => {
    const q = search.toLowerCase();
    return prospects.filter((p) => {
      if (q && ![p.businessName, p.ownerName ?? "", p.city, p.category].some((f) => f.toLowerCase().includes(q)))
        return false;
      if (filterCategory && p.category !== filterCategory) return false;
      if (filterPotential && p.potential !== filterPotential) return false;
      if (filterCity && p.city !== filterCity) return false;
      return true;
    });
  }, [prospects, search, filterCategory, filterPotential, filterCity]);

  const hasActiveFilter = search !== "" || filterCategory !== "" || filterPotential !== "" || filterCity !== "";

  const { scaduti, followUpOggi, daContattare, senzaFollowUp } = useMemo(() => {
    const oggi = new Date(new Date().setHours(0, 0, 0, 0));
    const domani = new Date(oggi.getTime() + 86400000);
    return {
      scaduti: prospects
        .filter((p) => p.nextFollowUp && new Date(p.nextFollowUp) < oggi)
        .sort((a, b) => new Date(a.nextFollowUp!).getTime() - new Date(b.nextFollowUp!).getTime()),
      followUpOggi: prospects.filter((p) => {
        if (!p.nextFollowUp) return false;
        const d = new Date(p.nextFollowUp);
        return d >= oggi && d < domani;
      }),
      daContattare: prospects
        .filter((p) => p.status === "DA_CONTATTARE")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 5),
      senzaFollowUp: prospects
        .filter((p) => !p.nextFollowUp && p.status !== "DA_CONTATTARE")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
  }, [prospects]);

  const byStage = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [s.key, filteredProspects.filter((p) => p.status === s.key)])
  );

  function giorniFa(data: Date | string): string {
    const diff = Math.floor(
      (new Date(new Date().setHours(0, 0, 0, 0)).getTime() - new Date(data).getTime()) / 86400000
    );
    if (diff === 0) return "scaduto oggi";
    if (diff === 1) return "scaduto ieri";
    return `scaduto ${diff} gg fa`;
  }

  function handleSaved(saved: Prospect) {
    setProspects((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
    setDrawer(null);
  }

  function handleDeleted(id: number) {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setDrawer(null);
  }

  function BachecaCol({
    title,
    items,
    borderCls,
    headerCls,
    titleCls,
    badgeCls,
    emptyText,
    renderCard,
  }: {
    title: string;
    items: Prospect[];
    borderCls: string;
    headerCls: string;
    titleCls: string;
    badgeCls: string;
    emptyText: string;
    renderCard: (p: Prospect) => React.ReactNode;
  }) {
    if (items.length === 0) {
      return (
        <div className={`rounded-lg border ${borderCls} opacity-40`}>
          <div className={`rounded-lg px-3 py-2 flex items-center justify-between ${headerCls}`}>
            <span className={`text-xs font-semibold uppercase tracking-widest ${titleCls}`}>{title}</span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${badgeCls}`}>0</span>
          </div>
        </div>
      );
    }
    return (
      <div className={`rounded-lg border ${borderCls} flex flex-col overflow-hidden`}>
        <div className={`px-3 py-2 flex items-center justify-between border-b ${borderCls} ${headerCls}`}>
          <span className={`text-xs font-semibold uppercase tracking-widest ${titleCls}`}>{title}</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${badgeCls}`}>{items.length}</span>
        </div>
        <div className="flex flex-col gap-1 p-1.5 max-h-44 overflow-y-auto bg-white">
          {items.map((p) => (
            <div key={p.id}>{renderCard(p)}</div>
          ))}
        </div>
        {emptyText && items.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">{emptyText}</p>
        )}
      </div>
    );
  }

  const bcCard = (p: Prospect, extra?: React.ReactNode) => (
    <button
      onClick={() => setDrawer({ mode: "view", prospect: p })}
      className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 transition-colors"
    >
      <div className="font-medium text-sm text-gray-900 truncate">{p.businessName}</div>
      <div className="text-xs text-gray-400 truncate">{p.city} · {p.category}</div>
      {extra}
    </button>
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Pipeline</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {hasActiveFilter
              ? `${filteredProspects.length} di ${prospects.length} prospect`
              : `${prospects.length} prospect totali`}
          </p>
        </div>
        <button
          onClick={() => setDrawer({ mode: "create", prospect: null })}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="text-base leading-none">+</span>
          Nuovo prospect
        </button>
      </div>

      {/* Filtri */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca prospect..."
          className={`flex-1 ${inp}`}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={sel}>
          <option value="">Tutte le categorie</option>
          {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterPotential} onChange={(e) => setFilterPotential(e.target.value)} className={sel}>
          <option value="">Tutti</option>
          {POTENTIAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className={sel}>
          <option value="">Tutte le città</option>
          {uniqueCities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasActiveFilter && (
          <button
            onClick={() => { setSearch(""); setFilterCategory(""); setFilterPotential(""); setFilterCity(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap transition-colors px-1"
          >
            Azzera
          </button>
        )}
      </div>

      {/* Bacheca */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Bacheca</p>
        <div className="grid grid-cols-4 gap-3">
          <BachecaCol
            title="Scaduti"
            items={scaduti}
            borderCls="border-red-100"
            headerCls="bg-red-50"
            titleCls="text-red-500"
            badgeCls="bg-red-100 text-red-600"
            emptyText=""
            renderCard={(p) => bcCard(p,
              <div className="text-xs text-red-500 font-medium mt-0.5">⚠ {giorniFa(p.nextFollowUp!)}</div>
            )}
          />
          <BachecaCol
            title="Oggi"
            items={followUpOggi}
            borderCls="border-amber-100"
            headerCls="bg-amber-50"
            titleCls="text-amber-600"
            badgeCls="bg-amber-100 text-amber-700"
            emptyText=""
            renderCard={(p) => bcCard(p,
              <div className="text-xs text-amber-500 mt-0.5">↻ {new Date(p.nextFollowUp!).toLocaleDateString("it-IT")}</div>
            )}
          />
          <BachecaCol
            title="Da contattare"
            items={daContattare}
            borderCls="border-blue-100"
            headerCls="bg-blue-50"
            titleCls="text-blue-600"
            badgeCls="bg-blue-100 text-blue-700"
            emptyText=""
            renderCard={(p) => {
              const oggi = new Date(new Date().setHours(0, 0, 0, 0));
              const giorni = Math.max(0, Math.floor((oggi.getTime() - new Date(p.createdAt).getTime()) / 86400000));
              return bcCard(p, <div className="text-xs text-blue-400 mt-0.5">In lista da {giorni} gg</div>);
            }}
          />
          <BachecaCol
            title="Senza follow-up"
            items={senzaFollowUp}
            borderCls="border-gray-200"
            headerCls="bg-gray-50"
            titleCls="text-gray-500"
            badgeCls="bg-gray-100 text-gray-600"
            emptyText=""
            renderCard={(p) => bcCard(p)}
          />
        </div>
      </div>

      {/* Stats pipeline */}
      <div className="grid grid-cols-5 gap-2.5 mb-6">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.key} className={`rounded-lg border ${stage.border} bg-white px-4 py-3`}>
            <div className="text-2xl font-bold text-gray-900 leading-none">
              {byStage[stage.key]?.length ?? 0}
            </div>
            <div className="text-xs text-gray-400 mt-1 leading-tight">{stage.label}</div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.key}
            stage={stage}
            prospects={byStage[stage.key] ?? []}
            onCardClick={(p) => setDrawer({ mode: "view", prospect: p })}
          />
        ))}
      </div>

      {drawer && (
        <ProspectDrawer
          prospect={drawer.prospect}
          mode={drawer.mode}
          onClose={() => setDrawer(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onEdit={() => drawer.prospect && setDrawer({ mode: "edit", prospect: drawer.prospect })}
        />
      )}
    </>
  );
}
