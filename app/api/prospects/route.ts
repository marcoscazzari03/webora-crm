import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const prospects = await prisma.prospect.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prospects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const prospect = await prisma.prospect.create({ data: body });
  return NextResponse.json(prospect, { status: 201 });
}
