import { auth } from "@/auth";
import { db } from "@/db";
import { workCategories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.query.workCategories.findMany({
    orderBy: [asc(workCategories.order)],
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, subtext } = await req.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const baseSlug = slugify(title);
  let slug = baseSlug;
  let attempt = 1;

  while (
    await db.query.workCategories.findFirst({
      where: (wc, { eq }) => eq(wc.slug, slug),
    })
  ) {
    slug = `${baseSlug}-${attempt++}`;
  }

  const existingCount = (await db.query.workCategories.findMany()).length;

  const [inserted] = await db
    .insert(workCategories)
    .values({
      slug,
      title,
      subtext: subtext ?? "",
      order: existingCount,
      isDefault: false,
    })
    .returning();

  return NextResponse.json(inserted);
}