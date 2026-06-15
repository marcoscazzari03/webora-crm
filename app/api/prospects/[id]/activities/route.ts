import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const activities = await prisma.activity.findMany({
    where: { prospectId: Number(id) },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(activities);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospectId = Number(id);
  const body = await req.json();

  const { type, date, summary, outcome, nextAction } = body as {
    type: string;
    date: string;
    summary: string;
    outcome?: string;
    nextAction?: string;
  };

  const activityDate = date ? new Date(date) : new Date();

  const activity = await prisma.activity.create({
    data: {
      prospectId,
      type,
      date: activityDate,
      summary,
      outcome: outcome || null,
      nextAction: nextAction || null,
    },
  });

  // Aggiorna lastContact se la data dell'attività è più recente
  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    select: { lastContact: true },
  });

  if (!prospect?.lastContact || activityDate > prospect.lastContact) {
    await prisma.prospect.update({
      where: { id: prospectId },
      data: { lastContact: activityDate },
    });
  }

  return NextResponse.json(activity, { status: 201 });
}
