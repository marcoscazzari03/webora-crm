import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const { attachmentId } = await params;

  const attachment = await prisma.attachment.findUnique({
    where: { id: Number(attachmentId) },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fullPath = path.join(process.cwd(), "uploads", attachment.storagePath);
  try {
    await unlink(fullPath);
  } catch {
    // file already gone, proceed
  }

  await prisma.attachment.delete({ where: { id: Number(attachmentId) } });
  return NextResponse.json({ ok: true });
}
