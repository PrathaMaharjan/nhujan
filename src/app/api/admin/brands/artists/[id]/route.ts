import { auth } from "@/auth";
import { db } from "@/db";
import { artists } from "@/db/schema";
import { ensureBrandsTables } from "@/lib/brands-db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();
  const { id } = await params;
  const { name, order, posX, posY } = await req.json();

  const existing = await db.query.artists.findFirst({
    where: eq(artists.id, id),
  });

  if (!existing) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(artists)
    .set({
      name: name !== undefined ? String(name).trim() : existing.name,
      order: typeof order === "number" ? order : existing.order,
      posX: posX !== undefined ? (posX === null ? null : Number(posX)) : existing.posX,
      posY: posY !== undefined ? (posY === null ? null : Number(posY)) : existing.posY,
      updatedAt: new Date(),
    })
    .where(eq(artists.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();
  const { id } = await params;

  const existing = await db.query.artists.findFirst({
    where: eq(artists.id, id),
  });

  if (!existing) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  await db.delete(artists).where(eq(artists.id, id));

  return NextResponse.json({ success: true });
}
