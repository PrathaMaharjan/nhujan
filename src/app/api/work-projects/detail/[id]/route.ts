import { db } from "@/db";
import { workProjects, projectGalleryImages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/slug";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
  }

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let project = null;
  if (isUuid) {
    project = await db.query.workProjects.findFirst({
      where: eq(workProjects.id, id),
    });
  }

  if (!project) {
    const allProjects = await db.query.workProjects.findMany();
    project =
      allProjects.find(
        (p: any) =>
          p.id === id ||
          (p.slug && p.slug === id) ||
          slugify(p.title) === id
      ) || null;
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const gallery = await db.query.projectGalleryImages.findMany({
    where: eq(projectGalleryImages.projectId, project.id),
    orderBy: [asc(projectGalleryImages.order)],
  });

  return NextResponse.json({
    ...project,
    slug: (project as any).slug || slugify(project.title),
    gallery,
  });
}
