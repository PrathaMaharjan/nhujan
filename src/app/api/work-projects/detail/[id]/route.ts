import { db } from "@/db";
import { workProjects, projectGalleryImages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const project = await db.query.workProjects.findFirst({
    where: eq(workProjects.id, id),
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const gallery = await db.query.projectGalleryImages.findMany({
    where: eq(projectGalleryImages.projectId, id),
    orderBy: [asc(projectGalleryImages.order)],
  });

  return NextResponse.json({
    ...project,
    gallery,
  });
}
