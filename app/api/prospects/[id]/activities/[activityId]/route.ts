import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  const { activityId } = await params;

  const activity = await prisma.activity.findUnique({
    where: { id: Number(activityId) },
  });

  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.activity.delete({ where: { id: Number(activityId) } });
  return NextResponse.json({ ok: true });
}
