import { auth } from "@/auth";
import { db } from "@/db";
import { brandLogos, artists } from "@/db/schema";
import { ensureBrandsTables, DEFAULT_BRAND_LOGOS, DEFAULT_ARTISTS } from "@/lib/brands-db";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureBrandsTables();

  const existingLogos = await db.query.brandLogos.findMany();
  let logoOrder = existingLogos.length;
  const createdLogos = [];

  for (const b of DEFAULT_BRAND_LOGOS) {
    const exists = existingLogos.some((el) => el.name.toLowerCase() === b.name.toLowerCase());
    if (!exists) {
      const [inserted] = await db
        .insert(brandLogos)
        .values({
          name: b.name,
          imageUrl: b.imageUrl,
          order: logoOrder++,
        })
        .returning();
      createdLogos.push(inserted);
    }
  }

  const existingArtists = await db.query.artists.findMany();
  let artistOrder = existingArtists.length;
  const createdArtists = [];

  for (const name of DEFAULT_ARTISTS) {
    const exists = existingArtists.some((ea) => ea.name.toLowerCase() === name.toLowerCase());
    if (!exists) {
      const [inserted] = await db
        .insert(artists)
        .values({
          name,
          order: artistOrder++,
        })
        .returning();
      createdArtists.push(inserted);
    }
  }

  return NextResponse.json({
    message: "Seed completed",
    addedLogos: createdLogos.length,
    addedArtists: createdArtists.length,
  });
}
