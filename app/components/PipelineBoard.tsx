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

function ProspectCard({
  prospect,
  onClick,
}: {
  prospect: Prospect;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-lg border border-gray-200 p-3.5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="font-semibold text-gray-900 text-sm mb-0.5 truncate">
        {prospect.businessName}
      </div>
      {prospect.ownerName && (
        <div className="text-xs text-gray-400 mb-2">{prospect.ownerName}</div>
      )}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">
          {prospect.category}
        </span>
        <span className="text-xs text-gray-400">{prospect.city}</span>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
            POTENTIAL_STYLES[prospect.potential] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {prospect.potential === "ALTO"
            ? "Alto"
            : prospect.potential === "MEDIO"
            ? "Medio"
            : "Basso"}
        </span>
        {prospect.nextFollowUp && (
          <span className="text-xs text-orange-500">
            ↻{" "}
            {new Date(prospect.nextFollowUp).toLocaleDateString("it-IT", {
              day: "2-digit",
              month: "2-digit",
            })}
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
    <div
      className={`flex flex-col rounded-xl border ${stage.border} min-w-0`}
    >
      <div
        className={`${stage.header} rounded-t-xl px-4 py-3 border-b ${stage.border}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${stage.dot}`} />
            <span className="text-sm font-semibold text-gray-700 truncate">
              {stage.label}
            </span>
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${stage.color}`}
          >
            {prospects.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2 min-h-[180px]">
        {prospects.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-gray-300">Nessun prospect</span>
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
      if (
        q &&
        ![p.businessName, p.ownerName ?? "", p.city, p.category]
          .some((f) => f.toLowerCase().includes(q))
      )
        return false;
      if (filterCategory && p.category !== filterCategory) return false;
      if (filterPotential && p.potential !== filterPotential) return false;
      if (filterCity && p.city !== filterCity) return false;
      return true;
    });
  }, [prospects, search, filterCategory, filterPotential, filterCity]);

  const hasActiveFilter = search !== "" || filterCategory !== "" || filterPotential !== "" || filterCity !== "";

  const { scaduti, followUpOggi, nuovi, senzaFollowUp } = useMemo(() => {
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
      nuovi: [...prospects]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      senzaFollowUp: prospects
        .filter((p) => !p.nextFollowUp && p.status !== "DA_CONTATTARE")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    };
  }, [prospects]);

  const byStage = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [
      s.key,
      filteredProspects.filter((p) => p.status === s.key),
    ])
  );

  function handleSaved(saved: Prospect) {
    setProspects((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      return exists
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [saved, ...prev];
    });
    setDrawer(null);
  }

  function handleDeleted(id: number) {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    setDrawer(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Pipeline Prospect
          </h1>
          <p className="text-gray-500 text-sm">
            {hasActiveFilter
              ? `${filteredProspects.length} di ${prospects.length} prospect`
              : `${prospects.length} prospect totali`}
          </p>
        </div>
        <button
          onClick={() => setDrawer({ mode: "create", prospect: null })}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          Nuovo prospect
        </button>
      </div>

      {/* Filtri */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca prospect..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Tutte le categorie</option>
          {uniqueCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterPotential}
          onChange={(e) => setFilterPotential(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Tutti</option>
          {POTENTIAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Tutte le città</option>
          {uniqueCities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {hasActiveFilter && (
          <button
            onClick={() => {
              setSearch("");
              setFilterCategory("");
              setFilterPotential("");
              setFilterCity("");
            }}
            className="text-sm text-gray-400 hover:text-gray-700 whitespace-nowrap transition-colors"
          >
            Azzera filtri
          </button>
        )}
      </div>

      {/* Bacheca */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">📋 Bacheca</h2>
        <div className="grid grid-cols-4 gap-4">
          {/* Scaduti */}
          <div className="rounded-lg border border-red-200 flex flex-col">
            <div className="rounded-t-lg border-b border-red-200 px-3 py-2 flex items-center justify-between bg-red-50">
              <span className="text-xs font-bold uppercase tracking-widest text-red-700">Scaduti</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">{scaduti.length}</span>
            </div>
            <div className="flex flex-col gap-1.5 p-2 max-h-48 overflow-y-auto">
              {scaduti.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Nessun arretrato 🎉</p>
              ) : scaduti.map((p) => (
                <button key={p.id} onClick={() => setDrawer({ mode: "view", prospect: p })}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-white bg-gray-50 transition-all">
                  <div className="font-medium text-sm text-gray-900 truncate">{p.businessName}</div>
                  <div className="text-xs text-gray-400 truncate">{p.city} · {p.category}</div>
                  <div className="text-xs text-orange-500 mt-0.5">↻ {new Date(p.nextFollowUp!).toLocaleDateString("it-IT")}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Oggi */}
          <div className="rounded-lg border border-orange-200 flex flex-col">
            <div className="rounded-t-lg border-b border-orange-200 px-3 py-2 flex items-center justify-between bg-orange-50">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-700">Oggi</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{followUpOggi.length}</span>
            </div>
            <div className="flex flex-col gap-1.5 p-2 max-h-48 overflow-y-auto">
              {followUpOggi.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Nessun follow-up oggi</p>
              ) : followUpOggi.map((p) => (
                <button key={p.id} onClick={() => setDrawer({ mode: "view", prospect: p })}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-white bg-gray-50 transition-all">
                  <div className="font-medium text-sm text-gray-900 truncate">{p.businessName}</div>
                  <div className="text-xs text-gray-400 truncate">{p.city} · {p.category}</div>
                  <div className="text-xs text-orange-500 mt-0.5">↻ {new Date(p.nextFollowUp!).toLocaleDateString("it-IT")}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Nuovi */}
          <div className="rounded-lg border border-blue-200 flex flex-col">
            <div className="rounded-t-lg border-b border-blue-200 px-3 py-2 flex items-center justify-between bg-blue-50">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700">Ultimi aggiunti</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{nuovi.length}</span>
            </div>
            <div className="flex flex-col gap-1.5 p-2 max-h-48 overflow-y-auto">
              {nuovi.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Nessun prospect</p>
              ) : nuovi.map((p) => (
                <button key={p.id} onClick={() => setDrawer({ mode: "view", prospect: p })}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-white bg-gray-50 transition-all">
                  <div className="font-medium text-sm text-gray-900 truncate">{p.businessName}</div>
                  <div className="text-xs text-gray-400 truncate">{p.city} · {p.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Senza follow-up */}
          <div className="rounded-lg border border-gray-200 flex flex-col">
            <div className="rounded-t-lg border-b border-gray-200 px-3 py-2 flex items-center justify-between bg-gray-50">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Senza follow-up</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{senzaFollowUp.length}</span>
            </div>
            <div className="flex flex-col gap-1.5 p-2 max-h-48 overflow-y-auto">
              {senzaFollowUp.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Tutti hanno un follow-up</p>
              ) : senzaFollowUp.map((p) => (
                <button key={p.id} onClick={() => setDrawer({ mode: "view", prospect: p })}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-white bg-gray-50 transition-all">
                  <div className="font-medium text-sm text-gray-900 truncate">{p.businessName}</div>
                  <div className="text-xs text-gray-400 truncate">{p.city} · {p.category}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-6" />

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage.key}
            className={`rounded-lg border ${stage.border} ${stage.header} px-4 py-3`}
          >
            <div className="text-2xl font-bold text-gray-800">
              {byStage[stage.key]?.length ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">
              {stage.label}
            </div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-5 gap-4">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.key}
            stage={stage}
            prospects={byStage[stage.key] ?? []}
            onCardClick={(p) => setDrawer({ mode: "view", prospect: p })}
          />
        ))}
      </div>

      {/* Drawer */}
      {drawer && (
        <ProspectDrawer
          prospect={drawer.prospect}
          mode={drawer.mode}
          onClose={() => setDrawer(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
          onEdit={() =>
            drawer.prospect &&
            setDrawer({ mode: "edit", prospect: drawer.prospect })
          }
        />
      )}
    </>
  );
}
