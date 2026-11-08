"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Film,
  Plus,
  Loader2,
  Trash2,
  AlertTriangle,
  Play,
  CheckCircle2,
} from "lucide-react";
import {
  bulkGalleryCreateSchema,
  type BulkGalleryCreateInput,
  type UploadedMediaItem,
  RERA_GALLERY_CATEGORIES,
} from "../schema";
import { createBulkGalleryItems } from "../actions";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

function formatBytes(bytes?: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BulkUploadForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [uploadedItems, setUploadedItems] = useState<UploadedMediaItem[]>([]);
  const [uploadingThumbIndex, setUploadingThumbIndex] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BulkGalleryCreateInput>({
    resolver: zodResolver(bulkGalleryCreateSchema),
    defaultValues: {
      title: "",
      category: "RESIDENTIAL",
      sortOrder: 0,
      isPublished: true,
      items: [],
    },
  });

  // Handle batch selection & upload to Cloudinary (folder: rera-gallery)
  const handleBatchFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 1. Pre-upload 100MB size check for all files before any upload begins
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setServerError(
          `File "${file.name}" (${sizeMB}MB) exceeds the 100MB limit. Please choose a smaller file.`
        );
        e.target.value = "";
        return;
      }
    }

    setIsUploading(true);
    setServerError(null);
    setUploadProgress({ current: 0, total: files.length });

    const newUploaded: UploadedMediaItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        const isVideo =
          file.type.startsWith("video/") ||
          Boolean(file.name.match(/\.(mp4|mov|webm|ogv|m4v)$/i));

        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: "rera-gallery",
            resourceType: isVideo ? "video" : "image",
          }),
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
        const resourceType = isVideo ? "video" : "auto";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(
            uploadErr.error?.message || `Upload failed for ${file.name}`
          );
        }

        const uploadData = await uploadRes.json();
        const isVideoResult =
          isVideo ||
          uploadData.resource_type === "video" ||
          (uploadData.secure_url &&
            uploadData.secure_url.includes("/video/upload/"));

        const secureUrl = uploadData.secure_url || uploadData.url;
        const autoThumb = isVideoResult
          ? getVideoThumbnailUrl(secureUrl, "VIDEO")
          : null;

        newUploaded.push({
          url: secureUrl,
          publicId: uploadData.public_id,
          mediaType: isVideoResult ? "VIDEO" : "IMAGE",
          fileSizeBytes: uploadData.bytes || file.size,
          cloudinaryEtag: uploadData.etag || null,
          thumbnailUrl: autoThumb,
          thumbnailPublicId: null,
          fileName: file.name,
        });
      }

      const combined = [...uploadedItems, ...newUploaded];
      setUploadedItems(combined);
      setValue("items", combined, { shouldDirty: true, shouldValidate: true });
    } catch (err: unknown) {
      console.error("Batch upload error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to upload files.";
      setServerError(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      e.target.value = "";
    }
  };

  // Upload custom thumbnail for video item
  const handleVideoThumbnailUpload = async (file: File, index: number) => {
    if (!file.type.startsWith("image/")) {
      setServerError("Thumbnail must be an image file.");
      return;
    }

    setUploadingThumbIndex(index);
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
      const updated = [...uploadedItems];
      updated[index] = {
        ...updated[index],
        thumbnailUrl: uploadData.secure_url || uploadData.url,
        thumbnailPublicId: uploadData.public_id,
      };

      setUploadedItems(updated);
      setValue("items", updated, { shouldDirty: true, shouldValidate: true });
    } catch (err: unknown) {
      console.error("Video thumbnail upload error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to upload video thumbnail.";
      setServerError(msg);
    } finally {
      setUploadingThumbIndex(null);
    }
  };

  const handleRemoveItem = (index: number) => {
    const updated = uploadedItems.filter((_, idx) => idx !== index);
    setUploadedItems(updated);
    setValue("items", updated, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (data: BulkGalleryCreateInput) => {
    if (uploadedItems.length === 0) {
      setServerError("Please upload at least one image or video before saving.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const result = await createBulkGalleryItems({
      ...data,
      items: uploadedItems,
    });

    if (result.success) {
      router.push("/admin/rera/gallery");
      router.refresh();
    } else {
      setServerError(result.error || "Failed to save gallery items.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-4xl"
    >
      {serverError && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-red-300 bg-red-50 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{serverError}</div>
        </div>
      )}

      {/* Shared Batch Metadata */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
          Shared Batch Details
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Shared Title / Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="e.g. Majiwada Project Tower A Progress"
              className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Gallery Category <span className="text-red-500">*</span>
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
        </div>
      </div>

      {/* Multi-file Upload Control */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-2">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Select Media Files
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select multiple photos and videos (max 100MB per file). Each will create a distinct gallery item.
            </p>
          </div>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors shadow-xs shrink-0 disabled:opacity-50">
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isUploading ? "Uploading Batch..." : "Choose Files"}
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleBatchFileSelect}
              disabled={isUploading || isSubmitting}
              className="sr-only"
            />
          </label>
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress && (
          <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 text-xs flex items-center justify-between">
            <span className="font-medium text-neutral-700">
              Uploading file {uploadProgress.current} of {uploadProgress.total}...
            </span>
            <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
          </div>
        )}

        {/* Uploaded Files Preview Cards */}
        {uploadedItems.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-lg text-neutral-400 text-sm">
            No files uploaded yet. Click &quot;Choose Files&quot; above to select multiple images and videos.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {uploadedItems.map((item, idx) => {
              const isVideo = item.mediaType === "VIDEO";
              const thumbUrl = isVideo ? item.thumbnailUrl : item.url;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-neutral-200 bg-white flex flex-col justify-between space-y-2 relative"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded bg-neutral-900 overflow-hidden relative shrink-0 border border-neutral-200">
                      {isVideo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {thumbUrl && !thumbUrl.match(/\.(mp4|mov|webm|ogv|m4v)/i) ? (
                            <Image
                              src={thumbUrl}
                              alt={item.fileName || "Video"}
                              fill
                              sizes="64px"
                              className="object-cover opacity-80"
                              unoptimized={!thumbUrl.includes("res.cloudinary.com")}
                            />
                          ) : null}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      ) : (
                        <Image
                          src={item.url}
                          alt={item.fileName || "Upload"}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized={!item.url.includes("res.cloudinary.com")}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 truncate">
                        {item.fileName || `Item #${idx + 1}`}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {formatBytes(item.fileSizeBytes)}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700">
                        {isVideo ? "Video" : "Image"}
                      </span>
                    </div>
                  </div>

                  {/* Video Thumbnail Action & Remove */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    {isVideo ? (
                      <label className="text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
                        {uploadingThumbIndex === idx
                          ? "Uploading Poster..."
                          : "Custom Poster"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoThumbnailUpload(file, idx);
                            e.target.value = "";
                          }}
                          disabled={uploadingThumbIndex === idx || isSubmitting}
                          className="sr-only"
                        />
                      </label>
                    ) : (
                      <span className="text-[11px] text-neutral-400">Ready</span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sort Order & Publishing */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center pt-2">
        <div>
          <label className="block text-xs font-medium text-neutral-600">
            Initial Sort Order (0 = highest)
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
            <span>Publish all items immediately</span>
          </label>
        </div>
      </div>

      {/* Form Submission */}
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
          disabled={isSubmitting || isUploading || uploadedItems.length === 0}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting
            ? "Creating Gallery Items..."
            : `Save ${uploadedItems.length} Gallery Item${
                uploadedItems.length === 1 ? "" : "s"
              }`}
        </button>
      </div>
    </form>
  );
}

