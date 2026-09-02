import { auth } from "@/auth";
import { db } from "@/db";
import { brandLogos } from "@/db/schema";
import { deleteCloudinaryResource } from "@/lib/cloudinary-server";
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
  const { name, imageUrl, publicId, order, posX, posY } = await req.json();

  const existing = await db.query.brandLogos.findFirst({
    where: eq(brandLogos.id, id),
  });

  if (!existing) {
    return NextResponse.json({ error: "Brand logo not found" }, { status: 404 });
  }

  // If replacing image with a new one and an old publicId exists, clean up old Cloudinary asset
  if (publicId && existing.publicId && publicId !== existing.publicId) {
    await deleteCloudinaryResource(existing.publicId);
  }

  const [updated] = await db
    .update(brandLogos)
    .set({
      name: name !== undefined ? name.trim() : existing.name,
      imageUrl: imageUrl !== undefined ? imageUrl.trim() : existing.imageUrl,
      publicId: publicId !== undefined ? (publicId?.trim() || null) : existing.publicId,
      order: typeof order === "number" ? order : existing.order,
      posX: posX !== undefined ? (posX === null ? null : Number(posX)) : existing.posX,
      posY: posY !== undefined ? (posY === null ? null : Number(posY)) : existing.posY,
      updatedAt: new Date(),
    })
    .where(eq(brandLogos.id, id))
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

  const existing = await db.query.brandLogos.findFirst({
    where: eq(brandLogos.id, id),
  });

  if (!existing) {
    return NextResponse.json({ error: "Brand logo not found" }, { status: 404 });
  }

  if (existing.publicId) {
    await deleteCloudinaryResource(existing.publicId);
  }

  await db.delete(brandLogos).where(eq(brandLogos.id, id));

  return NextResponse.json({ success: true });
}
