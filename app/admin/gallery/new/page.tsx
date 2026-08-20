import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NewGalleryImageClient } from "../_components/NewGalleryImageClient";

export default async function NewGalleryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const categories = await prisma.galleryCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/gallery"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Gallery
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add New Gallery Image</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Add a new photo or video to your inspiration gallery.
        </p>
      </div>

      <NewGalleryImageClient categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
