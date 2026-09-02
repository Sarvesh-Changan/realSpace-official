"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, Film, Image as ImageIcon, Loader2, X, Trash2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { imageSchema, bulkImageSchema, type ImageInput, type BulkImageInput } from "../schema";
import { createImage, createBulkImages, updateImage } from "../actions";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

interface UploadedMediaItem {
  id: string;
  url: string;
  cloudinaryId: string;
  mediaType: "IMAGE" | "VIDEO";
  fileName: string;
}

interface ImageFormProps {
  initialData?: ImageInput;
  categories: { id: string; name: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ImageForm({ initialData, categories, onSuccess, onCancel }: ImageFormProps) {
  const isUpdate = !!initialData?.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedMediaItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // --- Single Item Edit Form Setup ---
  const singleForm = useForm<ImageInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(imageSchema) as any,
    defaultValues: {
      categoryId: initialData?.categoryId || "",
      title: initialData?.title || "",
      designType: initialData?.designType || "INTERIOR",
      mediaType: initialData?.mediaType || "IMAGE",
      url: initialData?.url || "",
      cloudinaryId: initialData?.cloudinaryId || "",
      isCategoryCover: initialData?.isCategoryCover ?? false,
      isFeatured: initialData?.isFeatured ?? false,
      isPublished: initialData?.isPublished ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  // --- Bulk Create Form Setup ---
  const bulkForm = useForm<BulkImageInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bulkImageSchema) as any,
    defaultValues: {
      categoryId: "",
      title: "",
      designType: "INTERIOR",
      isCategoryCover: false,
      isFeatured: false,
      isPublished: true,
      sortOrder: 0,
    },
  });

  // --- Direct File Upload for Single Edit Mode ---
  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setServerError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "realspace-gallery" }),
      });

      if (!signRes.ok) {
        const errJson = await signRes.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to get upload signature from server.");
      }

      const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const targetCloud = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dipeupebc";
      const resourceType = file.type.startsWith("video") ? "video" : "image";

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadErr.error?.message || "Cloudinary file upload failed.");
      }

      const uploadData = await uploadRes.json();

      singleForm.setValue("url", uploadData.secure_url || uploadData.url);
      singleForm.setValue("cloudinaryId", uploadData.public_id);
      singleForm.setValue("mediaType", resourceType === "video" ? "VIDEO" : "IMAGE");
    } catch (err: any) {
      console.error("Direct upload error:", err);
      setServerError(err.message || "Failed to upload file to Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Batch Upload for Multi-File Create Mode ---
  const handleBatchFileUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setServerError(null);
    setUploadProgress({ current: 0, total: files.length });

    const newItems: UploadedMediaItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder: "realspace-gallery" }),
        });

        if (!signRes.ok) {
          const errJson = await signRes.json().catch(() => ({}));
          throw new Error(errJson.error || `Failed to sign upload for file #${i + 1}.`);
        }

        const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const targetCloud = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dipeupebc";
        const resourceType = file.type.startsWith("video") ? "video" : "image";

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${targetCloud}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => ({}));
          throw new Error(uploadErr.error?.message || `Cloudinary upload failed for ${file.name}.`);
        }

        const uploadData = await uploadRes.json();

        newItems.push({
          id: `${uploadData.public_id}-${Date.now()}-${i}`,
          url: uploadData.secure_url || uploadData.url,
          cloudinaryId: uploadData.public_id,
          mediaType: resourceType === "video" ? "VIDEO" : "IMAGE",
          fileName: file.name,
        });
      }

      setUploadedFiles((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      console.error("Batch upload error:", err);
      setServerError(err.message || "Failed to upload file batch to Cloudinary.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  // --- Form Submissions ---
  const onSingleSubmit = async (data: ImageInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await updateImage(initialData!.id!, data);
      if (result.success) {
        onSuccess();
      } else {
        setServerError(result.error || "An error occurred while saving.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Single submission error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const onBulkSubmit = async (data: BulkImageInput) => {
    if (uploadedFiles.length === 0) {
      setServerError("Please upload at least one image or video file.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const batchPayload: ImageInput[] = uploadedFiles.map((file, idx) => ({
        title: data.title,
        categoryId: data.categoryId,
        designType: data.designType,
        mediaType: file.mediaType,
        url: file.url,
        cloudinaryId: file.cloudinaryId,
        // Apply isCategoryCover ONLY to the first file in the batch
        isCategoryCover: data.isCategoryCover && idx === 0,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        sortOrder: (data.sortOrder || 0) + idx,
      }));

      const result = await createBulkImages(batchPayload);

      if (result.success) {
        onSuccess();
      } else {
        setServerError(result.error || "An error occurred while saving gallery batch.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Bulk submission error:", err);
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  // --- Render Single Item Edit Flow ---
  if (isUpdate) {
    const currentUrl = singleForm.watch("url");
    const currentMediaType = singleForm.watch("mediaType");

    return (
      <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-semibold text-neutral-900">Edit Gallery Image</h3>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...singleForm.register("title")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
              placeholder="e.g. Minimalist Master Bedroom"
            />
            {singleForm.formState.errors.title && <p className="mt-1 text-xs text-red-500">{singleForm.formState.errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              {...singleForm.register("categoryId")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {singleForm.formState.errors.categoryId && <p className="mt-1 text-xs text-red-500">{singleForm.formState.errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Design Type <span className="text-red-500">*</span>
            </label>
            <select
              {...singleForm.register("designType")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
            >
              <option value="INTERIOR">Interior</option>
              <option value="EXTERIOR">Exterior</option>
            </select>
            {singleForm.formState.errors.designType && <p className="mt-1 text-xs text-red-500">{singleForm.formState.errors.designType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Media Type <span className="text-red-500">*</span>
            </label>
            <select
              {...singleForm.register("mediaType")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
            </select>
            {singleForm.formState.errors.mediaType && <p className="mt-1 text-xs text-red-500">{singleForm.formState.errors.mediaType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Sort Order
            </label>
            <input
              type="number"
              {...singleForm.register("sortOrder", { valueAsNumber: true })}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 font-mono"
            />
            {singleForm.formState.errors.sortOrder && <p className="mt-1 text-xs text-red-500">{singleForm.formState.errors.sortOrder.message}</p>}
          </div>

          {/* Cloudinary Single Upload Section */}
          <div className="md:col-span-2 space-y-3">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Media File / URL <span className="text-red-500">*</span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-red-700 cursor-pointer transition-colors shadow-sm disabled:opacity-50">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? "Uploading File..." : "Replace File (Image/Video)"}
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleSingleFileUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            </div>

            <input
              type="text"
              {...singleForm.register("url")}
              className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
              placeholder="https://res.cloudinary.com/... or paste URL directly"
            />
            <input type="hidden" {...singleForm.register("cloudinaryId")} />
            {singleForm.formState.errors.url && <p className="mt-1 text-xs text-red-500">{singleForm.formState.errors.url.message}</p>}

            {/* Preview */}
            {currentUrl && (
              <div className="mt-2 p-2 border border-neutral-200 rounded-md bg-neutral-50 max-w-sm">
                <p className="text-xs text-neutral-500 mb-1 font-medium flex items-center gap-1">
                  {currentMediaType === "VIDEO" ? <Film className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  Preview ({currentMediaType}):
                </p>
                {currentMediaType === "VIDEO" ? (
                  <video src={currentUrl} poster={getVideoThumbnailUrl(currentUrl, "VIDEO")} controls className="w-full max-h-48 rounded object-cover" />
                ) : (
                  <div className="relative w-full h-48 rounded overflow-hidden">
                    <Image src={currentUrl} alt="Gallery Preview" fill className="object-cover" unoptimized={!currentUrl.includes("res.cloudinary.com")} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
            <div className="flex items-center min-h-[44px]">
              <input
                type="checkbox"
                id="isCategoryCoverSingle"
                {...singleForm.register("isCategoryCover")}
                className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
              />
              <label htmlFor="isCategoryCoverSingle" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
                Set as Primary Category Cover Card
              </label>
            </div>
            <div className="flex items-center min-h-[44px]">
              <input
                type="checkbox"
                id="isFeaturedSingle"
                {...singleForm.register("isFeatured")}
                className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
              />
              <label htmlFor="isFeaturedSingle" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
                Featured
              </label>
            </div>
            <div className="flex items-center min-h-[44px]">
              <input
                type="checkbox"
                id="isPublishedSingle"
                {...singleForm.register("isPublished")}
                className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
              />
              <label htmlFor="isPublishedSingle" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
                Published
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    );
  }

  // --- Render Bulk Upload Flow for Creation ---
  return (
    <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Add Gallery Images (Bulk Upload)</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Enter shared title and details once, then upload multiple files together.
          </p>
        </div>
        {uploadedFiles.length > 0 && (
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} ready
          </span>
        )}
      </div>

      {serverError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
          {serverError}
        </div>
      )}

      {/* Shared Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Shared Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...bulkForm.register("title")}
            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
            placeholder="e.g. Modern Living Room Concept"
          />
          {bulkForm.formState.errors.title && <p className="mt-1 text-xs text-red-500">{bulkForm.formState.errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...bulkForm.register("categoryId")}
            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {bulkForm.formState.errors.categoryId && <p className="mt-1 text-xs text-red-500">{bulkForm.formState.errors.categoryId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Design Type <span className="text-red-500">*</span>
          </label>
          <select
            {...bulkForm.register("designType")}
            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
          >
            <option value="INTERIOR">Interior</option>
            <option value="EXTERIOR">Exterior</option>
          </select>
          {bulkForm.formState.errors.designType && <p className="mt-1 text-xs text-red-500">{bulkForm.formState.errors.designType.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Starting Sort Order
          </label>
          <input
            type="number"
            {...bulkForm.register("sortOrder", { valueAsNumber: true })}
            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 font-mono"
          />
          {bulkForm.formState.errors.sortOrder && <p className="mt-1 text-xs text-red-500">{bulkForm.formState.errors.sortOrder.message}</p>}
        </div>

        {/* Multi-File Upload Dropzone */}
        <div className="md:col-span-2 space-y-4">
          <label className="block text-sm font-medium text-neutral-700">
            Upload Media Files (Images &amp; Videos) <span className="text-red-500">*</span>
          </label>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleBatchFileUpload(Array.from(e.dataTransfer.files));
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              isDragging ? "border-brand-red bg-red-50/50" : "border-neutral-300 hover:border-neutral-400 bg-neutral-50/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white rounded-full shadow-xs border border-neutral-200 text-brand-red">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-sm font-medium text-neutral-700">
                <label className="text-brand-red hover:underline cursor-pointer font-semibold inline-block">
                  Click to select multiple files
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleBatchFileUpload(Array.from(e.target.files));
                      }
                    }}
                    disabled={isUploading}
                    className="sr-only"
                  />
                </label>{" "}
                or drag &amp; drop a batch of images and videos here
              </div>
              <p className="text-xs text-neutral-500">
                Supports JPG, PNG, WEBP, MP4, MOV, WEBM. Select multiple files at once.
              </p>
            </div>
          </div>

          {/* Upload Progress Feedback */}
          {uploadProgress && (
            <div className="p-4 bg-red-50/60 border border-brand-red/20 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold text-neutral-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-brand-red animate-spin" />
                  Uploading files to Cloudinary...
                </span>
                <span className="text-brand-red font-bold">
                  Uploading {uploadProgress.current} of {uploadProgress.total}
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-red h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Batch Files Grid */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-800">
                  Batch Files ({uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""})
                </h4>
                <button
                  type="button"
                  onClick={() => setUploadedFiles([])}
                  className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Batch
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 border border-neutral-200 rounded-lg bg-neutral-50">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className="relative group rounded-md border border-neutral-200 bg-white p-2 shadow-xs flex flex-col justify-between"
                  >
                    <div className="relative w-full h-24 rounded bg-neutral-100 overflow-hidden mb-1.5">
                      {file.mediaType === "VIDEO" ? (
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={file.url}
                          alt={file.fileName}
                          fill
                          className="object-cover"
                          unoptimized={!file.url.includes("res.cloudinary.com")}
                        />
                      )}
                      <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                        {file.mediaType === "VIDEO" ? <Film className="w-3 h-3 text-amber-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                        {file.mediaType}
                      </span>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                        className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-neutral-600 truncate font-mono" title={file.fileName}>
                      #{index + 1}: {file.fileName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
          <div className="flex items-center min-h-[44px]">
            <input
              type="checkbox"
              id="isCategoryCoverBulk"
              {...bulkForm.register("isCategoryCover")}
              className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
            />
            <label htmlFor="isCategoryCoverBulk" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
              Set First File as Category Cover Card
            </label>
          </div>
          <div className="flex items-center min-h-[44px]">
            <input
              type="checkbox"
              id="isFeaturedBulk"
              {...bulkForm.register("isFeatured")}
              className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
            />
            <label htmlFor="isFeaturedBulk" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
              Featured (All)
            </label>
          </div>
          <div className="flex items-center min-h-[44px]">
            <input
              type="checkbox"
              id="isPublishedBulk"
              {...bulkForm.register("isPublished")}
              className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
            />
            <label htmlFor="isPublishedBulk" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
              Published (All)
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploading || uploadedFiles.length === 0}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isSubmitting ? "Creating Batch..." : `Create ${uploadedFiles.length || 0} Gallery Image${uploadedFiles.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </form>
  );
}

