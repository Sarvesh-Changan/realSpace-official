import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { HomeGalleryManager, type HomeGalleryItem } from "./_components/HomeGalleryManager";

export const dynamic = "force-dynamic";

export default async function AdminHomeGalleryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const rawImages = await prisma.homeGalleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const initialImages: HomeGalleryItem[] = rawImages.map((img) => ({
    id: img.id,
    title: img.title,
    altText: img.altText,
    url: img.url,
    cloudinaryId: img.cloudinaryId,
    sortOrder: img.sortOrder,
    isPublished: img.isPublished,
    createdAt: img.createdAt,
  }));

  return <HomeGalleryManager initialImages={initialImages} />;
}
