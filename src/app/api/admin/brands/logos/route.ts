import { auth } from "@/auth";
import { db } from "@/db";
import { brandLogos } from "@/db/schema";
import { ensureBrandsTables } from "@/lib/brands-db";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();

  const rows = await db.query.brandLogos.findMany({
    orderBy: [asc(brandLogos.order), asc(brandLogos.createdAt)],
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();

  const { name, imageUrl, publicId, order, posX, posY } = await req.json();
  if (!name || !imageUrl) {
    return NextResponse.json({ error: "Name and image URL are required" }, { status: 400 });
  }

  let finalOrder = typeof order === "number" ? order : null;
  if (finalOrder === null) {
    const existing = await db.query.brandLogos.findMany();
    finalOrder = existing.length;
  }

  const [inserted] = await db
    .insert(brandLogos)
    .values({
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      publicId: publicId?.trim() || null,
      order: finalOrder,
      posX: typeof posX === "number" ? posX : null,
      posY: typeof posY === "number" ? posY : null,
    })
    .returning();

  return NextResponse.json(inserted);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();

  const { items } = await req.json();
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid items payload" }, { status: 400 });
  }

  // Update order and positions for each brand logo
  for (const item of items) {
    if (item.id) {
      const updateData: Record<string, any> = { updatedAt: new Date() };
      if (typeof item.order === "number") updateData.order = item.order;
      if (item.posX !== undefined) updateData.posX = item.posX === null ? null : Number(item.posX);
      if (item.posY !== undefined) updateData.posY = item.posY === null ? null : Number(item.posY);

      await db
        .update(brandLogos)
        .set(updateData)
        .where(eq(brandLogos.id, item.id));
    }
  }

  const updatedRows = await db.query.brandLogos.findMany({
    orderBy: [asc(brandLogos.order), asc(brandLogos.createdAt)],
  });

  return NextResponse.json(updatedRows);
}
