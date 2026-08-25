import { auth } from "@/auth";
import { db } from "@/db";
import { preloaderImages } from "@/db/schema";
import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await db.query.preloaderImages.findMany({
    orderBy: [asc(preloaderImages.order)],
  });
  return NextResponse.json(images);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, publicId } = await req.json();
  if (!url || !publicId) {
    return NextResponse.json({ error: "Missing url or publicId" }, { status: 400 });
  }

  const [inserted] = await db
    .insert(preloaderImages)
    .values({ url, publicId })
    .returning();

  return NextResponse.json(inserted);
}