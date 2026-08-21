import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { GalleryClient, type GalleryItem } from "./_components/GalleryClient";

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