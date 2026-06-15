import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attachments = await prisma.attachment.findMany({
    where: { prospectId: Number(id) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(attachments);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prospectId = Number(id);

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || "ALTRO";

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "uploads", String(prospectId));
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${randomUUID()}${ext}`;
  const storagePath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storagePath, buffer);

  const attachment = await prisma.attachment.create({
    data: {
      prospectId,
      filename,
      originalName: file.name,
      storagePath: path.join(String(prospectId), filename),
      mimeType: file.type,
      size: file.size,
      category,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
