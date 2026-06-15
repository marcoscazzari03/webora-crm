"use client";

import { useState } from "react";
import type { Prospect } from "@prisma/client";
import { PIPELINE_STAGES, POTENTIAL_STYLES } from "@/lib/constants";
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

  const byStage = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [
      s.key,
      prospects.filter((p) => p.status === s.key),
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
            {prospects.length} prospect totali
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
