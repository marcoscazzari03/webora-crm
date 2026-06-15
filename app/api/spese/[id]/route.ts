import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const spesa = await prisma.spesaOperativa.update({
      where: { id: parseInt(id) },
      data: {
        nome: body.nome,
        categoria: body.categoria,
        importo: parseFloat(body.importo),
        valuta: body.valuta ?? "EUR",
        frequenza: body.frequenza,
        prossimoRinnovo: body.prossimoRinnovo ? new Date(body.prossimoRinnovo) : null,
        rinnovoAuto: body.rinnovoAuto === true || body.rinnovoAuto === "true",
        note: body.note ?? null,
      },
    });
    return NextResponse.json(spesa);
  } catch {
    return NextResponse.json({ error: "Errore nella modifica della spesa" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.spesaOperativa.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Errore nell'eliminazione della spesa" }, { status: 500 });
  }
}
