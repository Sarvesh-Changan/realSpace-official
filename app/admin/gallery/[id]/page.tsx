import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditGalleryImageClient } from "../_components/EditGalleryImageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryItemPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const image = await prisma.galleryImage.findUnique({
    where: { id },
  });

  if (!image) {
    notFound();
  }

  const categories = await prisma.galleryCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const initialData = {
    id: image.id,
    title: image.title,
    categoryId: image.categoryId,
    designType: image.designType,
    mediaType: image.mediaType,
    url: image.url,
    cloudinaryId: image.cloudinaryId,
    isCategoryCover: image.isCategoryCover,
    isFeatured: image.isFeatured,
    isPublished: image.isPublished,
    sortOrder: image.sortOrder,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/gallery"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Gallery
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Gallery Image</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update gallery media details and display options.
        </p>
      </div>

      <EditGalleryImageClient
        initialData={initialData}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
