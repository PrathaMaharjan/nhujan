import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!apiSecret) {
    return NextResponse.json(
      { error: "CLOUDINARY_API_SECRET is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const { paramsToSign } = await req.json();
    if (!paramsToSign) {
      return NextResponse.json(
        { error: "Missing paramsToSign" },
        { status: 400 }
      );
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    return NextResponse.json({ signature });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to generate signature" },
      { status: 500 }
    );
  }
}
