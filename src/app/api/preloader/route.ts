import { db } from "@/db";
import { preloaderImages } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const images = await db.query.preloaderImages.findMany({
    orderBy: [asc(preloaderImages.order)],
  });
  return NextResponse.json(images.map((img) => img.url));
}