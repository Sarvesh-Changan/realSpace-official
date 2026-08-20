import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { GalleryTabsClient } from "./_components/GalleryTabsClient";

export const revalidate = 0;

export default async function AdminGalleryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const categories = await prisma.galleryCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const images = await prisma.galleryImage.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return <GalleryTabsClient categories={categories} images={images} />;
}
