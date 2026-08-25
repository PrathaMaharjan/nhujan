import { auth } from "@/auth";
import { db } from "@/db";
import { projectGalleryImages } from "@/db/schema";
import { deleteCloudinaryResource } from "@/lib/cloudinary-server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const body = await req.json();

  const updates: Partial<typeof projectGalleryImages.$inferInsert> = { updatedAt: new Date() };
  if (typeof body.colSpan === "string") updates.colSpan = body.colSpan;
  if (typeof body.aspectRatio === "string") updates.aspectRatio = body.aspectRatio;
  if (typeof body.order === "number") updates.order = body.order;

  const [updated] = await db
    .update(projectGalleryImages)
    .set(updates)
    .where(eq(projectGalleryImages.id, imageId))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { imageId } = await params;
  const existing = await db.query.projectGalleryImages.findFirst({
    where: eq(projectGalleryImages.id, imageId),
  });

  if (existing?.publicId) {
    await deleteCloudinaryResource(existing.publicId);
  }

  await db.delete(projectGalleryImages).where(eq(projectGalleryImages.id, imageId));
  return NextResponse.json({ success: true });
}
