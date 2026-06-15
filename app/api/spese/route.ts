import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const spese = await prisma.spesaOperativa.findMany({
      where: { attivo: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(spese);
  } catch {
    return NextResponse.json({ error: "Errore nel recupero delle spese" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const spesa = await prisma.spesaOperativa.create({
      data: {
        nome: body.nome,
        categoria: body.categoria,
        importo: parseFloat(body.importo),
        valuta: body.valuta ?? "EUR",
        frequenza: body.frequenza,
        prossimoRinnovo: body.prossimoRinnovo ? new Date(body.prossimoRinnovo) : null,
        rinnovoAuto: body.rinnovoAuto === true || body.rinnovoAuto === "true",
        note: body.note ?? null,
        attivo: true,
      },
    });
    return NextResponse.json(spesa, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Errore nella creazione della spesa" }, { status: 500 });
  }
}
