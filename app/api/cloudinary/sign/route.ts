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
    console.log("Cloudinary Sign Request Body:", JSON.stringify(body, null, 2));

    // If request comes from next-cloudinary CldUploadWidget (contains paramsToSign)
    if (body.paramsToSign) {
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
    const resourceType = isTestimonialUpload && body.resourceType === "image" ? "image" : isTestimonialUpload ? "video" : "image";

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET || ""
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      resourceType,
      allowedFormats: isTestimonialUpload
        ? resourceType === "video" ? ["mp4", "webm", "mov"] : ["jpg", "jpeg", "png", "webp"]
        : undefined,
      maxFileSize: isTestimonialUpload ? 100 * 1024 * 1024 : undefined,
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
