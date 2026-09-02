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
    // If request comes from next-cloudinary CldUploadWidget (contains paramsToSign).
    // An empty object is used by the direct-upload form and must use the full
    // response below, including the timestamp required by Cloudinary.
    if (
      body.paramsToSign &&
      typeof body.paramsToSign === "object" &&
      Object.keys(body.paramsToSign).length > 0
    ) {
      const signature = cloudinary.utils.api_sign_request(
        body.paramsToSign,
        process.env.CLOUDINARY_API_SECRET || ""
      );
      return NextResponse.json({ signature });
    }

    // Direct file upload fallback (from custom <input type="file" />)
    const allowedFolders = [
      "realspace-projects",
      "realspace-gallery",
      "realspace-offers",
      "offers",
      "realspace-certifications",
      "certifications",
      "testimonials",
      "realspace-events",
      "events",
    ];
    const requestedFolder = body.folder;
    const folder = allowedFolders.includes(requestedFolder)
      ? requestedFolder
      : "realspace-projects";

    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder,
    };

    const isTestimonialUpload = folder === "testimonials";
    const isEventsUpload = folder === "events" || folder === "realspace-events";

    let resourceType = "image";
    if (isTestimonialUpload) {
      resourceType = body.resourceType === "image" ? "image" : "video";
    } else if (isEventsUpload) {
      resourceType = body.resourceType === "video" ? "video" : "image";
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || ""
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      resourceType,
      allowedFormats: isTestimonialUpload || isEventsUpload
        ? resourceType === "video" ? ["mp4", "webm", "mov"] : ["jpg", "jpeg", "png", "webp"]
        : undefined,
      maxFileSize: isTestimonialUpload || isEventsUpload ? 100 * 1024 * 1024 : undefined,
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
