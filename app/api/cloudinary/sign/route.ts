import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@/lib/auth";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const paramsToSign = body.paramsToSign || body;

    // Security requirements per SECURITY.md §4 & ARCHITECTURE.md §5:
    // Restricted folders ("realspace-projects", "realspace-gallery"), expiring timestamp
    const allowedFolders = ["realspace-projects", "realspace-gallery"];
    const requestedFolder = body.folder || paramsToSign?.folder;
    const folder = allowedFolders.includes(requestedFolder)
      ? requestedFolder
      : "realspace-projects";

    const timestamp = Math.floor(Date.now() / 1000);

    const finalParams: Record<string, unknown> = {
      ...paramsToSign,
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      finalParams,
      process.env.CLOUDINARY_API_SECRET || ""
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName:
        process.env.CLOUDINARY_CLOUD_NAME ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey:
        process.env.CLOUDINARY_API_KEY ||
        process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature." },
      { status: 500 }
    );
  }
}
