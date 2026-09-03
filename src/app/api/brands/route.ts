import { db } from "@/db";
import { brandLogos, artists } from "@/db/schema";
import {
  ensureBrandsTables,
  DEFAULT_BRAND_LOGOS,
  DEFAULT_ARTISTS,
} from "@/lib/brands-db";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureBrandsTables();

  try {
    const dbLogos = await db.query.brandLogos.findMany({
      orderBy: [asc(brandLogos.order), asc(brandLogos.createdAt)],
    });

    const dbArtists = await db.query.artists.findMany({
      orderBy: [asc(artists.order), asc(artists.createdAt)],
    });

    const finalBrands =
      dbLogos.length > 0
        ? dbLogos.map((b) => ({
            id: b.id,
            name: b.name,
            image: b.imageUrl,
            order: b.order,
          }))
        : DEFAULT_BRAND_LOGOS.map((b, idx) => ({
            id: `default-brand-${idx}`,
            name: b.name,
            image: b.imageUrl,
            order: idx,
          }));

    const finalArtists =
      dbArtists.length > 0
        ? dbArtists.map((a) => ({
            id: a.id,
            name: a.name,
            order: a.order,
          }))
        : DEFAULT_ARTISTS.map((name, idx) => ({
            id: `default-artist-${idx}`,
            name,
            order: idx,
          }));

    return NextResponse.json(
      {
        brands: finalBrands,
        artists: finalArtists,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch public brands and artists:", error);
    return NextResponse.json({
      brands: DEFAULT_BRAND_LOGOS.map((b, idx) => ({
        id: `default-brand-${idx}`,
        name: b.name,
        image: b.imageUrl,
        order: idx,
      })),
      artists: DEFAULT_ARTISTS.map((name, idx) => ({
        id: `default-artist-${idx}`,
        name,
        order: idx,
      })),
    });
  }
}
