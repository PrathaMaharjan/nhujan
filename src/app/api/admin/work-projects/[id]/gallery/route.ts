import { auth } from "@/auth";
import { db } from "@/db";
import { projectGalleryImages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const rows = await db.query.projectGalleryImages.findMany({
    where: eq(projectGalleryImages.projectId, id),
    orderBy: [asc(projectGalleryImages.order)],
  });

  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const { imageUrl, publicId, colSpan, aspectRatio } = body;
  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
  }

  const existing = await db.query.projectGalleryImages.findMany({
    where: eq(projectGalleryImages.projectId, id),
  });

  const [inserted] = await db
    .insert(projectGalleryImages)
    .values({
      projectId: id,
      imageUrl,
      publicId: publicId ?? null,
      colSpan: colSpan ?? "col-span-12 md:col-span-6",
      aspectRatio: aspectRatio ?? "aspect-[16/9]",
      order: existing.length,
    })
    .returning();

  return NextResponse.json(inserted);
}
