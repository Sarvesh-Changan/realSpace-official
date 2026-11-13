"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

export type WebsiteContentState = { success?: boolean; error?: string; message?: string };

const sectionKeys: Record<string, string[]> = {
  home: ["hero", "slide1", "slide2", "slide3", "slide4", "slide5", "welcome", "services", "properties", "gallery", "testimonials", "faqs", "contact", "callback"],
  about: ["hero", "intro", "details", "cta"],
};

function readSection(formData: FormData, key: string, sortOrder: number) {
  const value = (field: string) => String(formData.get(`${key}.${field}`) || "").trim();
  const requestedOrder = Number(formData.get(`${key}.sortOrder`));
  return {
    sectionKey: key,
    heading: value("heading") || null,
    body: value("body") || null,
    imageUrl: value("imageUrl") || null,
    imagePublicId: value("imagePublicId") || null,
    imageAlt: value("imageAlt") || null,
    mediaAssetId: value("mediaAssetId") || null,
    buttonLabel: value("buttonLabel") || null,
    buttonUrl: value("buttonUrl") || null,
    isEnabled: formData.get(`${key}.isEnabled`) === "on",
    sortOrder: Number.isFinite(requestedOrder) ? Math.max(0, Math.trunc(requestedOrder)) : sortOrder,
  };
}

export async function saveWebsitePage(_state: WebsiteContentState, formData: FormData): Promise<WebsiteContentState> {
  const session = await auth();
  if (!session?.user) return { error: "Your admin session has expired. Sign in again." };
  const slug = String(formData.get("slug") || "");
  if (!(slug in sectionKeys)) return { error: "Unknown website page." };
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Page title is required." };
  const sections = sectionKeys[slug].map((key, index) => readSection(formData, key, index));
  const description = String(formData.get("description") || "").trim() || null;
  const shouldPublish = formData.get("actionMode") === "publish";
  const shouldUnpublish = formData.get("actionMode") === "unpublish";
  const snapshot = JSON.stringify({ title, description, sections });
  try {
    await prisma.$transaction(async (tx) => {
      const page = await tx.websitePage.upsert({
        where: { slug },
        update: {
          title, description,
          ...(shouldPublish ? { isPublished: true, publishedContentJson: snapshot } : {}),
          ...(shouldUnpublish ? { isPublished: false } : {}),
        },
        create: {
          slug, title, description,
          isPublished: shouldPublish,
          publishedContentJson: shouldPublish ? snapshot : null,
          sortOrder: slug === "home" ? 0 : 1,
        },
      });
      for (const section of sections) {
        await tx.websitePageSection.upsert({
          where: { pageId_sectionKey: { pageId: page.id, sectionKey: section.sectionKey } },
          update: section,
          create: { pageId: page.id, ...section },
        });
      }
    });
  } catch (error) {
    console.error("[saveWebsitePage]", error);
    return { error: "Could not save page content. Check the database connection and migration status." };
  }

  revalidatePath("/admin/website-content");
  revalidatePath(`/admin/website-content/${slug}`);
  if (shouldPublish || shouldUnpublish) revalidatePath(slug === "home" ? "/" : "/about");
  return { success: true, message: shouldPublish ? "Changes published." : shouldUnpublish ? "Page unpublished." : "Draft saved." };
}

export async function updateMediaAsset(id: string, data: { altText: string; category: string; sortOrder: number }) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized." };
  if (!data.altText.trim() || !data.category.trim()) return { success: false, error: "Alt text and category are required." };
  try {
    await prisma.mediaAsset.update({ where: { id }, data: { altText: data.altText.trim(), category: data.category.trim().slice(0, 60), sortOrder: Math.max(0, Math.trunc(data.sortOrder || 0)) } });
    revalidatePath("/admin/website-content/media");
    return { success: true };
  } catch (error) {
    console.error("[updateMediaAsset]", error);
    return { success: false, error: "Could not update media details." };
  }
}

export async function createMediaAssets(items: Array<{ url: string; cloudinaryId: string; altText: string; category: string; format?: string; width?: number; height?: number; fileSizeBytes?: number }>) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized." };
  if (!Array.isArray(items) || items.length < 1 || items.length > 30) return { success: false, error: "Upload between 1 and 30 images at a time." };
  if (items.some((item) => !item.url.startsWith("https://res.cloudinary.com/") || !item.cloudinaryId || !item.altText.trim() || !item.category.trim())) {
    return { success: false, error: "Each image needs a Cloudinary URL, alt text, and category." };
  }
  try {
    const created = await prisma.$transaction(items.map((item, index) => prisma.mediaAsset.create({
      data: {
        url: item.url,
        cloudinaryId: item.cloudinaryId,
        altText: item.altText.trim().slice(0, 300),
        category: item.category.trim().slice(0, 60),
        format: item.format?.slice(0, 20) || null,
        width: item.width && item.width > 0 ? Math.trunc(item.width) : null,
        height: item.height && item.height > 0 ? Math.trunc(item.height) : null,
        fileSizeBytes: item.fileSizeBytes && item.fileSizeBytes > 0 ? Math.trunc(item.fileSizeBytes) : null,
        sortOrder: index,
      },
    })));
    revalidatePath("/admin/website-content/media");
    return { success: true, count: created.length };
  } catch (error) {
    console.error("[createMediaAssets]", error);
    return { success: false, error: "Upload succeeded but saving its media record failed. Contact an administrator before deleting the Cloudinary asset." };
  }
}

export async function deleteMediaAsset(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized." };
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { success: false, error: "Media asset not found." };
  const usedIn = await prisma.websitePageSection.findFirst({ where: { mediaAssetId: id }, select: { id: true } });
  if (usedIn) return { success: false, error: "This image is selected on a website page. Replace it there before deleting." };

  // A Media Library asset can also be copied into an existing module. Check common
  // Cloudinary-backed fields before deleting the remote file.
  const publicId = asset.cloudinaryId;
  if (publicId) {
    const [projectImage, galleryImage, homeImage, propertyImage, pageImage, services, settings, siteSettings, offer, certification, event, eventMedia, configuration, builder, reraGallery, testimonial, propertyCover, publishedPageImage] = await Promise.all([
      prisma.projectImage.findFirst({ where: { OR: [{ cloudinaryId: publicId }, { thumbnailPublicId: publicId }] }, select: { id: true } }),
      prisma.galleryImage.findFirst({ where: { cloudinaryId: publicId }, select: { id: true } }),
      prisma.homeGalleryImage.findFirst({ where: { cloudinaryId: publicId }, select: { id: true } }),
      prisma.reraPropertyImage.findFirst({ where: { publicId }, select: { id: true } }),
      prisma.websitePageSection.findFirst({ where: { imagePublicId: publicId }, select: { id: true } }),
      prisma.reraService.findMany({ select: { id: true, bannerImagePublicId: true, contentImages: true, sections: true } }),
      prisma.reraSettings.findFirst({ where: { OR: [{ heroImagePublicId: publicId }, { founderImagePublicId: publicId }, { bhk1ImagePublicId: publicId }, { bhk2ImagePublicId: publicId }, { bhk3ImagePublicId: publicId }, { heroSlidesJson: { contains: publicId } }] }, select: { id: true } }),
      prisma.siteSettings.findFirst({ where: { OR: [{ ownerPortraitPublicId: publicId }, { logoPublicId: publicId }, { faviconPublicId: publicId }] }, select: { id: true } }),
      prisma.offer.findFirst({ where: { imagePublicId: publicId }, select: { id: true } }),
      prisma.certification.findFirst({ where: { imagePublicId: publicId }, select: { id: true } }),
      prisma.event.findFirst({ where: { coverImagePublicId: publicId }, select: { id: true } }),
      prisma.eventMedia.findFirst({ where: { mediaPublicId: publicId }, select: { id: true } }),
      prisma.reraConfiguration.findFirst({ where: { imagePublicId: publicId }, select: { id: true } }),
      prisma.reraBuilderPartner.findFirst({ where: { logoPublicId: publicId }, select: { id: true } }),
      prisma.reraGalleryItem.findFirst({ where: { OR: [{ publicId }, { thumbnailPublicId: publicId }] }, select: { id: true } }),
      prisma.testimonial.findFirst({ where: { OR: [
        { imagePublicId: publicId }, { videoPublicId: publicId }, { thumbnailPublicId: publicId },
        { imagePublicIds: { has: publicId } }, { videoPublicIds: { has: publicId } }, { thumbnailPublicIds: { has: publicId } },
      ] }, select: { id: true } }),
      prisma.reraProperty.findFirst({ where: { coverImagePublicId: publicId }, select: { id: true } }),
      prisma.websitePage.findFirst({ where: { publishedContentJson: { contains: publicId } }, select: { id: true } }),
    ]);
    const serviceUsesImage = services.some((item) => item.bannerImagePublicId === publicId || JSON.stringify([item.contentImages, item.sections]).includes(publicId));
    if ([projectImage, galleryImage, homeImage, propertyImage, pageImage, serviceUsesImage, settings, siteSettings, offer, certification, event, eventMedia, configuration, builder, reraGallery, testimonial, propertyCover, publishedPageImage].some(Boolean)) {
      return { success: false, error: "This image is referenced by another website module and cannot be deleted." };
    }
  }
  try {
    if (asset.cloudinaryId) {
      cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
      const result = await cloudinary.uploader.destroy(asset.cloudinaryId);
      if (result.result !== "ok" && result.result !== "not found") return { success: false, error: "Cloudinary could not delete this file; its media record was kept." };
    }
    await prisma.mediaAsset.delete({ where: { id } });
    revalidatePath("/admin/website-content/media");
    return { success: true };
  } catch (error) {
    console.error("[deleteMediaAsset]", error);
    return { success: false, error: "Could not delete media asset." };
  }
}
