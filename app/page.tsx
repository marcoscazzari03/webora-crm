import { prisma } from "@/lib/prisma";
import PipelineBoard from "./components/PipelineBoard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const prospects = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <PipelineBoard initialProspects={prospects} />;
}
