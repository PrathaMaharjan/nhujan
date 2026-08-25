import { db } from "@/db";
import { workCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const category = await db.query.workCategories.findFirst({
    where: eq(workCategories.slug, slug),
  });

  if (!category || category.isDefault) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}