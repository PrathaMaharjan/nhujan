import { auth } from "@/auth";
import { db } from "@/db";
import { preloaderImages } from "@/db/schema";
import { deleteCloudinaryResource } from "@/lib/cloudinary-server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const image = await db.query.preloaderImages.findFirst({
    where: eq(preloaderImages.id, id),
  });

  if (image?.publicId) {
    await deleteCloudinaryResource(image.publicId);
  }

  await db.delete(preloaderImages).where(eq(preloaderImages.id, id));
  return NextResponse.json({ success: true });
}