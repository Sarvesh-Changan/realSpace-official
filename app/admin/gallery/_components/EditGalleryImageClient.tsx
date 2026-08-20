"use client";

import { useRouter } from "next/navigation";
import { ImageForm } from "./ImageForm";
import type { ImageInput } from "../schema";

export function EditGalleryImageClient({
  initialData,
  categories,
}: {
  initialData: ImageInput;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();

  return (
    <ImageForm
      initialData={initialData}
      categories={categories}
      onSuccess={() => router.push("/admin/gallery")}
      onCancel={() => router.push("/admin/gallery")}
    />
  );
}
