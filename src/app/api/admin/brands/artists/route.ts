import { auth } from "@/auth";
import { db } from "@/db";
import { artists } from "@/db/schema";
import { ensureBrandsTables } from "@/lib/brands-db";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();

  const rows = await db.query.artists.findMany({
    orderBy: [asc(artists.order), asc(artists.createdAt)],
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();

  const { name, names, order } = await req.json();

  // Support batch creation if `names` array is supplied
  if (Array.isArray(names) && names.length > 0) {
    const existing = await db.query.artists.findMany();
    let currentOrder = existing.length;

    const insertedList = [];
    for (const rawName of names) {
      const clean = String(rawName || "").trim();
      if (!clean) continue;
      const [inserted] = await db
        .insert(artists)
        .values({
          name: clean,
          order: currentOrder++,
        })
        .returning();
      insertedList.push(inserted);
    }
    return NextResponse.json(insertedList);
  }

  if (!name || !String(name).trim()) {
    return NextResponse.json(
      { error: "Artist name is required" },
      { status: 400 },
    );
  }

  let finalOrder = typeof order === "number" ? order : null;
  if (finalOrder === null) {
    const existing = await db.query.artists.findMany();
    finalOrder = existing.length;
  }

  const [inserted] = await db
    .insert(artists)
    .values({
      name: String(name).trim(),
      order: finalOrder,
    })
    .returning();

  return NextResponse.json(inserted);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();

  const { items } = await req.json();
  if (!Array.isArray(items)) {
    return NextResponse.json(
      { error: "Invalid items payload" },
      { status: 400 },
    );
  }

  // Update display order for each artist
  for (const item of items) {
    if (item.id) {
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (typeof item.order === "number") updateData.order = item.order;

      await db.update(artists).set(updateData).where(eq(artists.id, item.id));
    }
  }

  const updatedRows = await db.query.artists.findMany({
    orderBy: [asc(artists.order), asc(artists.createdAt)],
  });

  return NextResponse.json(updatedRows);
}
