import { db } from "@/db";
import { workCategories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.query.workCategories.findMany({
    orderBy: [asc(workCategories.order)],
  });

  const defaultRow = rows.find((r) => r.isDefault);
  const categories = rows
    .filter((r) => !r.isDefault)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      subtext: r.subtext,
      image: r.imageUrl,
    }));

  return NextResponse.json(
    {
      defaultImage: defaultRow?.imageUrl ?? null,
      categories,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}