import { auth } from "@/auth";
import { db } from "@/db";
import { projectGalleryImages, workProjects } from "@/db/schema";
import { deleteCloudinaryResource, deleteCloudinaryResources } from "@/lib/cloudinary-server";
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

  const existing = await db.query.workProjects.findFirst({
    where: eq(workProjects.id, id),
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Partial<typeof workProjects.$inferInsert> = { updatedAt: new Date() };
  if (typeof body.title === "string") updates.title = body.title;
  if (typeof body.categoryLabel === "string") updates.categoryLabel = body.categoryLabel;
  if (typeof body.vimeoId === "string") updates.vimeoId = body.vimeoId;
  if (typeof body.director === "string") updates.director = body.director;
  if (typeof body.year === "string") updates.year = body.year;
  if (typeof body.client === "string") updates.client = body.client;
  if (typeof body.description === "string") updates.description = body.description;
  if (typeof body.order === "number") updates.order = body.order;

  if (body.thumbnailUrl !== undefined) {
    if (existing.thumbnailPublicId && existing.thumbnailPublicId !== body.thumbnailPublicId) {
      await deleteCloudinaryResource(existing.thumbnailPublicId);
    }
    updates.thumbnailUrl = body.thumbnailUrl;
    updates.thumbnailPublicId = body.thumbnailPublicId ?? null;
  }
  if (body.gifUrl !== undefined) {
    if (existing.gifPublicId && existing.gifPublicId !== body.gifPublicId) {
      await deleteCloudinaryResource(existing.gifPublicId);
    }
    updates.gifUrl = body.gifUrl;
    updates.gifPublicId = body.gifPublicId ?? null;
  }
  if (body.heroImageUrl !== undefined) {
    if (existing.heroImagePublicId && existing.heroImagePublicId !== body.heroImagePublicId) {
      await deleteCloudinaryResource(existing.heroImagePublicId);
    }
    updates.heroImageUrl = body.heroImageUrl;
    updates.heroImagePublicId = body.heroImagePublicId ?? null;
  }

  const [updated] = await db
    .update(workProjects)
    .set(updates)
    .where(eq(workProjects.id, id))
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

  const existing = await db.query.workProjects.findFirst({
    where: eq(workProjects.id, id),
  });

  if (existing) {
    const galleryImages = await db.query.projectGalleryImages.findMany({
      where: eq(projectGalleryImages.projectId, id),
    });

    const publicIdsToDelete = [
      existing.thumbnailPublicId,
      existing.gifPublicId,
      existing.heroImagePublicId,
      ...galleryImages.map((g) => g.publicId),
    ].filter(Boolean);

    if (publicIdsToDelete.length > 0) {
      await deleteCloudinaryResources(publicIdsToDelete);
    }

    await db.delete(projectGalleryImages).where(eq(projectGalleryImages.projectId, id));
    await db.delete(workProjects).where(eq(workProjects.id, id));
  }

  return NextResponse.json({ success: true });
}