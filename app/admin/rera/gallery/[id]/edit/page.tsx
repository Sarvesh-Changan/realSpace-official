import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { SingleItemForm } from "../../_components/SingleItemForm";
import type { ReraGalleryItemInput } from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditReraGalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const item = await prisma.reraGalleryItem.findUnique({
    where: { id },
  });

  if (!item) {
    notFound();
  }

  const initialData: ReraGalleryItemInput = {
    id: item.id,
    title: item.title,
    category: item.category,
    mediaType: item.mediaType,
    url: item.url,
    publicId: item.publicId,
    thumbnailUrl: item.thumbnailUrl,
    thumbnailPublicId: item.thumbnailPublicId,
    fileSizeBytes: item.fileSizeBytes,
    cloudinaryEtag: item.cloudinaryEtag,
    sortOrder: item.sortOrder,
    isPublished: item.isPublished,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/gallery"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Gallery
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Edit Gallery Item
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update item title, category classification, video poster frame, or visibility.
        </p>
      </div>

      <SingleItemForm initialData={initialData} />
    </div>
  );
}

