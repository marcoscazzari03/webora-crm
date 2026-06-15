import { prisma } from "@/lib/prisma";
import { PIPELINE_STAGES } from "@/lib/constants";
import type { Prospect } from "@prisma/client";

async function getProspects(): Promise<Prospect[]> {
  return prisma.prospect.findMany({ orderBy: { createdAt: "desc" } });
}

function ProspectCard({ prospect }: { prospect: Prospect }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="font-semibold text-gray-900 text-sm mb-1 truncate">
        {prospect.businessName}
      </div>
      {prospect.ownerName && (
        <div className="text-xs text-gray-500 mb-2">{prospect.ownerName}</div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
          {prospect.category}
        </span>
        <span className="text-xs text-gray-400">{prospect.city}</span>
      </div>
      {prospect.notes && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
          {prospect.notes}
        </p>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        {prospect.phone && <span>{prospect.phone}</span>}
        {prospect.instagram && (
          <span className="text-pink-400">{prospect.instagram}</span>
        )}
      </div>
    </div>
  );
}

function PipelineColumn({
  stage,
  prospects,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  prospects: Prospect[];
}) {
  return (
    <div className={`flex flex-col rounded-xl border ${stage.border} min-w-0`}>
      <div className={`${stage.header} rounded-t-xl px-4 py-3 border-b ${stage.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${stage.dot}`} />
            <span className="text-sm font-semibold text-gray-700">
              {stage.label}
            </span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.color}`}>
            {prospects.length}
          </span>
        </div>
      </div>
      <div className="flex-1 p-3 flex flex-col gap-2 min-h-[200px]">
        {prospects.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-gray-300">Nessun prospect</span>
          </div>
        ) : (
          prospects.map((p) => <ProspectCard key={p.id} prospect={p} />)
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const prospects = await getProspects();

  const byStage = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [
      s.key,
      prospects.filter((p) => p.status === s.key),
    ])
  );

  const total = prospects.length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pipeline Prospect</h1>
        <p className="text-gray-500 text-sm">
          {total} prospect totali &mdash; aggiornato oggi
        </p>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage.key}
            className={`rounded-lg border ${stage.border} ${stage.header} px-4 py-3`}
          >
            <div className="text-2xl font-bold text-gray-800">
              {byStage[stage.key]?.length ?? 0}
            </div>
            <div className="text-xs text-gray-500 mt-1 leading-tight">
              {stage.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.key}
            stage={stage}
            prospects={byStage[stage.key] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
