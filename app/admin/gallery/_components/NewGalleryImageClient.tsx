"use client";

import { useRouter } from "next/navigation";
import { ImageForm } from "./ImageForm";

export function NewGalleryImageClient({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();

  return (
    <ImageForm
      categories={categories}
      onSuccess={() => router.push("/admin/gallery")}
      onCancel={() => router.push("/admin/gallery")}
    />
  );
}
