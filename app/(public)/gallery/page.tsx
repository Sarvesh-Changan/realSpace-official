import prisma from "@/lib/prisma";
import { GalleryClient, type GalleryItem } from "./_components/GalleryClient";

export const revalidate = 60; // Revalidate static cache every 60 seconds

export default async function GalleryPage() {
  const [dbCategories, dbImages] = await Promise.all([
    prisma.galleryCategory.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.galleryImage.findMany({
      where: { isPublished: true },
      include: { category: true },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    }),
  ]);

  const categories = [
    "All",
    ...dbCategories.map((c) => c.name),
  ];

  const images: GalleryItem[] = dbImages.map((img) => ({
    id: img.id,
    title: img.title,
    url: img.url,
    mediaType: img.mediaType,
    category: img.category?.name || "Other",
    designType: img.designType,
    theme: img.theme,
    approxBudgetLabel: img.approxBudgetLabel,
    description: img.description,
  }));

  return <GalleryClient categories={categories} images={images} />;
}