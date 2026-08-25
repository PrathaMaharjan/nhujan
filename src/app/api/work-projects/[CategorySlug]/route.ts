import { db } from "@/db";
import { workProjects } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ CategorySlug?: string; categorySlug?: string }> }
) {
  const resolved = await params;
  const categorySlug = resolved.categorySlug || resolved.CategorySlug;

  if (!categorySlug) {
    return NextResponse.json([]);
  }

  const rows = await db.query.workProjects.findMany({
    where: eq(workProjects.categorySlug, categorySlug),
    orderBy: [asc(workProjects.order)],
  });

  const projects = rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    category: r.categoryLabel,
    thumbnail: r.thumbnailUrl ?? "",
    gif: r.gifUrl ?? "",
    preview: r.gifUrl ?? "",
    vimeoId: r.vimeoId,
  }));

  return NextResponse.json(projects);
}
