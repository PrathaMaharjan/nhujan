import { auth } from "@/auth";
import { db } from "@/db";
import { workProjects } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("categorySlug");

  const rows = categorySlug
    ? await db.query.workProjects.findMany({
        where: eq(workProjects.categorySlug, categorySlug),
        orderBy: [asc(workProjects.order)],
      })
    : await db.query.workProjects.findMany({ orderBy: [asc(workProjects.order)] });

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { categorySlug, title, categoryLabel } = await req.json();
  if (!categorySlug || !title) {
    return NextResponse.json({ error: "categorySlug and title are required" }, { status: 400 });
  }

  const existing = await db.query.workProjects.findMany({
    where: eq(workProjects.categorySlug, categorySlug),
  });

  const [inserted] = await db
    .insert(workProjects)
    .values({
      categorySlug,
      title,
      categoryLabel: categoryLabel ?? "",
      order: existing.length,
    })
    .returning();

  return NextResponse.json(inserted);
}