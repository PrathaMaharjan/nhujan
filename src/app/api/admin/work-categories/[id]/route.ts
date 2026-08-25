import { auth } from "@/auth";
import { db } from "@/db";
import { workCategories } from "@/db/schema";
import { deleteCloudinaryResource } from "@/lib/cloudinary-server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await db.query.workCategories.findFirst({
    where: eq(workCategories.id, id),
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Partial<typeof workCategories.$inferInsert> = { updatedAt: new Date() };
  if (body.url && body.publicId) {
    // If image is being replaced, clean up old one from Cloudinary
    if (existing.publicId && existing.publicId !== body.publicId) {
      await deleteCloudinaryResource(existing.publicId);
    }
    updates.imageUrl = body.url;
    updates.publicId = body.publicId;
  }
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.subtext === "string") updates.subtext = body.subtext;
  if (typeof body.order === "number") updates.order = body.order;

  const [updated] = await db
    .update(workCategories)
    .set(updates)
    .where(eq(workCategories.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const existing = await db.query.workCategories.findFirst({
    where: eq(workCategories.id, id),
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.isDefault) {
    return NextResponse.json({ error: "Cannot delete the default background" }, { status: 400 });
  }

  if (existing.publicId) {
    await deleteCloudinaryResource(existing.publicId);
  }

  await db.delete(workCategories).where(eq(workCategories.id, id));
  return NextResponse.json({ success: true });
}