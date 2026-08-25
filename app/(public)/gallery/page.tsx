import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { GalleryClient, type CategoryFolder, type GalleryItem } from "./_components/GalleryClient";

export const revalidate = 60; // Revalidate static cache every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `Design Gallery & Inspiration | ${companyName}`,
    description: `Browse photos and videos of interior and exterior design ideas, modular kitchens, living rooms, and bedrooms by ${companyName}.`,
    path: "/gallery",
  });
}

export default async function GalleryPage() {
  const [dbCategories, dbImages] = await Promise.all([
    prisma.galleryCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        images: {
          where: { isPublished: true },
          orderBy: [
            { isCategoryCover: "desc" },
            { sortOrder: "asc" },
            { createdAt: "desc" },
          ],
          take: 1,
          select: { url: true, mediaType: true },
        },
        _count: {
          select: {
            images: { where: { isPublished: true } },
          },
        },
      },
    }),
    prisma.galleryImage.findMany({
      where: { isPublished: true },
      include: { category: true },
      orderBy: [
        { isCategoryCover: "desc" },
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    }),
  ]);

  const categoryFolders: CategoryFolder[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c._count.images,
    coverUrl: c.images[0]?.url || "/images/placeholder-image.png",
    coverMediaType: c.images[0]?.mediaType || "IMAGE",
  }));

  const items: GalleryItem[] = dbImages.map((img) => ({
    id: img.id,
    title: img.title,
    url: img.url,
    mediaType: img.mediaType,
    categoryId: img.categoryId,
    category: img.category?.name || "Uncategorized",
    designType: img.designType,
    theme: img.theme,
    approxBudgetLabel: img.approxBudgetLabel,
    description: img.description,
    isCategoryCover: img.isCategoryCover,
  }));

  return <GalleryClient categoryFolders={categoryFolders} images={items} />;
}