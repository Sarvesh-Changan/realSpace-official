"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play, Loader2, AlertTriangle, Upload } from "lucide-react";
import {
  reraGalleryItemSchema,
  type ReraGalleryItemInput,
  RERA_GALLERY_CATEGORIES,
} from "../schema";
import { updateGalleryItem } from "../actions";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

export function SingleItemForm({
  initialData,
}: {
  initialData: ReraGalleryItemInput;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReraGalleryItemInput>({
    resolver: zodResolver(reraGalleryItemSchema),
    defaultValues: initialData,
  });

  const isVideo = watch("mediaType") === "VIDEO";
  const currentThumbUrl = watch("thumbnailUrl");
  const mediaUrl = watch("url");

  const displayThumb = isVideo
    ? currentThumbUrl || getVideoThumbnailUrl(mediaUrl, "VIDEO")
    : mediaUrl;

  const handleCustomThumbnail = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setServerError("Please select an image file for the thumbnail.");
      return;
    }

    setIsUploadingThumb(true);
    setServerError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "rera-gallery", resourceType: "image" }),
      });

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to get upload signature.");
      }

      const signData = await signRes.json();
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "api_key",
        signData.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || ""
      );
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder || "rera-gallery");

      const targetCloud =
        signData.cloudName ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        "dipeupebc";

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json().catch(() => ({}));
        throw new Error(
          uploadErr.error?.message || "Thumbnail upload failed."
        );
      }

      const uploadData = await uploadRes.json();
      setValue("thumbnailUrl", uploadData.secure_url || uploadData.url, {
        shouldDirty: true,
      });
      setValue("thumbnailPublicId", uploadData.public_id, {
        shouldDirty: true,
      });
    } catch (err: unknown) {
      console.error("Thumbnail upload error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to upload thumbnail.";
      setServerError(msg);
    } finally {
      setIsUploadingThumb(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (data: ReraGalleryItemInput) => {
    if (!initialData.id) return;
    setIsSubmitting(true);
    setServerError(null);

    const result = await updateGalleryItem(initialData.id, data);

    if (result.success) {
      router.push("/admin/rera/gallery");
      router.refresh();
    } else {
      setServerError(result.error || "Failed to update gallery item.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-3xl"
    >
      {serverError && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-red-300 bg-red-50 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{serverError}</div>
        </div>
      )}

      {/* Media Preview Box */}
      <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-32 h-24 rounded bg-neutral-900 overflow-hidden relative shrink-0 border border-neutral-200">
          {isVideo ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {displayThumb && !displayThumb.match(/\.(mp4|mov|webm|ogv|m4v)/i) ? (
                <Image
                  src={displayThumb}
                  alt={watch("title") || "Video preview"}
                  fill
                  sizes="128px"
                  className="object-cover opacity-80"
                  unoptimized={!displayThumb.includes("res.cloudinary.com")}
                />
              ) : null}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
            </div>
          ) : (
            <Image
              src={mediaUrl}
              alt={watch("title") || "Image preview"}
              fill
              sizes="128px"
              className="object-cover"
              unoptimized={!mediaUrl.includes("res.cloudinary.com")}
            />
          )}
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase text-neutral-500">
            {watch("mediaType")} Asset
          </div>
          <div className="text-sm font-mono text-neutral-600 break-all">
            {mediaUrl}
          </div>
          {isVideo && (
            <div className="pt-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-xs">
                {isUploadingThumb ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                {isUploadingThumb
                  ? "Uploading..."
                  : "Change Video Poster Thumbnail"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomThumbnail}
                  disabled={isUploadingThumb || isSubmitting}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("title")}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          {...register("category")}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 bg-white"
        >
          {RERA_GALLERY_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center pt-2">
        <div>
          <label className="block text-xs font-medium text-neutral-600">
            Sort Order (0 = highest)
          </label>
          <input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        <div className="sm:pt-5">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-neutral-800 select-none">
            <input
              type="checkbox"
              {...register("isPublished")}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer h-4 w-4"
            />
            <span>Published on website</span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-neutral-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/rera/gallery")}
          className="px-5 py-2.5 min-h-[44px] bg-white border border-neutral-300 text-neutral-700 font-medium text-sm rounded-md hover:bg-neutral-50 transition-colors shadow-xs cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting || isUploadingThumb}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Updating Item..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

