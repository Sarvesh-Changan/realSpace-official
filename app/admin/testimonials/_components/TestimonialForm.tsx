"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Star,
  Upload,
  Video,
  X,
  Film,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB limit
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const testimonialSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientRole: z.string().optional(),
  quote: z.string().min(1, "Quote is required"),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  imageUrls: z.array(z.string()).default([]),
  imagePublicIds: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),
  videoPublicId: z.string().optional(),
  videoUrls: z.array(z.string()).default([]),
  videoPublicIds: z.array(z.string()).default([]),
  thumbnailUrl: z.string().optional(),
  thumbnailPublicId: z.string().optional(),
  thumbnailUrls: z.array(z.string()).default([]),
  thumbnailPublicIds: z.array(z.string()).default([]),
  slug: z.string().optional(),
  location: z.string().optional(),
  projectType: z.string().optional(),
  rating: z.number().min(1).max(5),
  sortOrder: z.number(),
  isPublished: z.boolean(),
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
  initialData?: Partial<TestimonialFormValues>;
  onSubmit: (data: TestimonialFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type UploadKind = "video" | "image" | "testimonial-image";

interface UploadProgressState {
  current: number;
  total: number;
  percent: number;
  fileName?: string;
}

export function TestimonialForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: TestimonialFormProps) {
  const [isUploading, setIsUploading] = useState<UploadKind | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newVideoInputUrl, setNewVideoInputUrl] = useState("");
  const [isDraggingImages, setIsDraggingImages] = useState(false);
  const [isDraggingVideos, setIsDraggingVideos] = useState(false);

  // Per-video thumbnail upload state
  const [activeThumbVideoIndex, setActiveThumbVideoIndex] = useState<number | null>(null);
  const [isUploadingThumbIndex, setIsUploadingThumbIndex] = useState<number | null>(null);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const perVideoThumbInputRef = useRef<HTMLInputElement>(null);

  const initialVideoUrls = initialData?.videoUrls?.length
    ? initialData.videoUrls
    : initialData?.videoUrl
    ? [initialData.videoUrl]
    : [];

  const initialThumbnailUrls = initialData?.thumbnailUrls?.length
    ? initialData.thumbnailUrls
    : initialData?.thumbnailUrl
    ? [initialData.thumbnailUrl]
    : initialVideoUrls.map(() => "");

  const initialThumbnailPublicIds = initialData?.thumbnailPublicIds?.length
    ? initialData.thumbnailPublicIds
    : initialData?.thumbnailPublicId
    ? [initialData.thumbnailPublicId]
    : initialVideoUrls.map(() => "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof testimonialSchema>, unknown, TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: initialData?.clientName || "",
      clientRole: initialData?.clientRole || "",
      quote: initialData?.quote || "",
      imageUrl: initialData?.imageUrl || "",
      imagePublicId: initialData?.imagePublicId || "",
      imageUrls: initialData?.imageUrls?.length
        ? initialData.imageUrls
        : initialData?.imageUrl
        ? [initialData.imageUrl]
        : [],
      imagePublicIds: initialData?.imagePublicIds?.length
        ? initialData.imagePublicIds
        : initialData?.imagePublicId
        ? [initialData.imagePublicId]
        : [],
      videoUrl: initialData?.videoUrl || "",
      videoPublicId: initialData?.videoPublicId || "",
      videoUrls: initialVideoUrls,
      videoPublicIds: initialData?.videoPublicIds?.length
        ? initialData.videoPublicIds
        : initialData?.videoPublicId
        ? [initialData.videoPublicId]
        : [],
      thumbnailUrl: initialData?.thumbnailUrl || "",
      thumbnailPublicId: initialData?.thumbnailPublicId || "",
      thumbnailUrls: initialThumbnailUrls,
      thumbnailPublicIds: initialThumbnailPublicIds,
      slug: initialData?.slug || "",
      location: initialData?.location || "",
      projectType: initialData?.projectType || "",
      rating: initialData?.rating || 5,
      sortOrder: initialData?.sortOrder ?? 0,
      isPublished: initialData?.isPublished ?? true,
    },
  });

  const currentRating = watch("rating");
  const currentImageUrl = watch("imageUrl");
  const currentImageUrls = watch("imageUrls") || [];
  const currentImagePublicIds = watch("imagePublicIds") || [];
  const currentVideoUrl = watch("videoUrl");
  const currentVideoUrls = watch("videoUrls") || [];
  const currentVideoPublicIds = watch("videoPublicIds") || [];
  const currentThumbnailUrls = watch("thumbnailUrls") || [];
  const currentThumbnailPublicIds = watch("thumbnailPublicIds") || [];

  // --- Primary Selection Helpers (Independent of Array Order) ---
  const setPrimaryImage = (index: number) => {
    const targetUrl = currentImageUrls[index];
    const targetPid = currentImagePublicIds[index] || "";
    if (targetUrl) {
      setValue("imageUrl", targetUrl, { shouldValidate: true });
      setValue("imagePublicId", targetPid);
    }
  };

  const setPrimaryVideo = (index: number) => {
    const targetUrl = currentVideoUrls[index];
    const targetPid = currentVideoPublicIds[index] || "";
    const targetThumb = currentThumbnailUrls[index] || "";
    const targetThumbPid = currentThumbnailPublicIds[index] || "";

    if (targetUrl) {
      setValue("videoUrl", targetUrl, { shouldValidate: true });
      setValue("videoPublicId", targetPid);
      setValue("thumbnailUrl", targetThumb, { shouldValidate: true });
      setValue("thumbnailPublicId", targetThumbPid);
    }
  };

  // --- Per-Video Thumbnail Upload ---
  const handleUploadVideoThumbnail = async (file: File, videoIndex: number) => {
    if (!IMAGE_TYPES.includes(file.type) && !file.type.startsWith("image")) {
      setUploadError(`File "${file.name}" is not a supported image format (JPG, PNG, WebP, AVIF).`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`Thumbnail file exceeds the 100MB limit.`);
      return;
    }

    setIsUploadingThumbIndex(videoIndex);
    setUploadError(null);

    try {
      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder: "testimonials",
          resourceType: "image",
        }),
      });

      const signatureData = await signResponse.json().catch(() => ({}));
      if (!signResponse.ok) {
        throw new Error(signatureData.error || "Failed to prepare Cloudinary signature.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
      formData.append("timestamp", String(signatureData.timestamp));
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);

      const cloudName =
        signatureData.cloudName ||
        process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        "dipeupebc";

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadErr.error?.message || "Thumbnail upload failed.");
      }

      const uploadData = await uploadRes.json();
      if (!uploadData.secure_url || !uploadData.public_id) {
        throw new Error("Incomplete upload response received.");
      }

      const nextThumbs = [...currentThumbnailUrls];
      const nextThumbPids = [...currentThumbnailPublicIds];

      // Ensure array length matches currentVideoUrls
      while (nextThumbs.length < currentVideoUrls.length) {
        nextThumbs.push("");
        nextThumbPids.push("");
      }

      nextThumbs[videoIndex] = uploadData.secure_url;
      nextThumbPids[videoIndex] = uploadData.public_id;

      setValue("thumbnailUrls", nextThumbs, { shouldValidate: true });
      setValue("thumbnailPublicIds", nextThumbPids);

      // If this video is currently primary, sync to scalar thumbnailUrl
      const isPrimary =
        currentVideoUrls[videoIndex] === currentVideoUrl ||
        (!currentVideoUrl && videoIndex === 0);

      if (isPrimary) {
        setValue("thumbnailUrl", uploadData.secure_url, { shouldValidate: true });
        setValue("thumbnailPublicId", uploadData.public_id);
      }
    } catch (err) {
      console.error("Video thumbnail upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload video thumbnail.");
    } finally {
      setIsUploadingThumbIndex(null);
      setActiveThumbVideoIndex(null);
    }
  };

  const removeVideoThumbnail = (videoIndex: number) => {
    const nextThumbs = [...currentThumbnailUrls];
    const nextThumbPids = [...currentThumbnailPublicIds];

    if (nextThumbs[videoIndex] !== undefined) {
      nextThumbs[videoIndex] = "";
      nextThumbPids[videoIndex] = "";
    }

    setValue("thumbnailUrls", nextThumbs, { shouldValidate: true });
    setValue("thumbnailPublicIds", nextThumbPids);

    const isPrimary =
      currentVideoUrls[videoIndex] === currentVideoUrl ||
      (!currentVideoUrl && videoIndex === 0);

    if (isPrimary) {
      setValue("thumbnailUrl", "", { shouldValidate: true });
      setValue("thumbnailPublicId", "");
    }
  };

  // --- Batch Upload for Multi-File Inputs ---
  const handleBatchFileUpload = async (files: File[], kind: UploadKind) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    // Pre-flight file size and type validation
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setUploadError(
          `File "${file.name}" (${sizeMB}MB) exceeds the 100MB limit — please compress the file or choose a smaller file.`
        );
        return;
      }

      if (kind === "video" && !VIDEO_TYPES.includes(file.type) && !file.type.startsWith("video")) {
        setUploadError(`File "${file.name}" is not a supported video format (MP4, WebM, MOV).`);
        return;
      }

      if (
        (kind === "image" || kind === "testimonial-image") &&
        !IMAGE_TYPES.includes(file.type) &&
        !file.type.startsWith("image")
      ) {
        setUploadError(`File "${file.name}" is not a supported image format (JPG, PNG, WebP, AVIF).`);
        return;
      }
    }

    setIsUploading(kind);
    setUploadProgress({ current: 0, total: files.length, percent: 0 });

    let latestImageUrls = [...(watch("imageUrls") || [])];
    let latestImagePublicIds = [...(watch("imagePublicIds") || [])];
    let latestVideoUrls = [...(watch("videoUrls") || [])];
    let latestVideoPublicIds = [...(watch("videoPublicIds") || [])];
    let latestThumbnailUrls = [...(watch("thumbnailUrls") || [])];
    let latestThumbnailPublicIds = [...(watch("thumbnailPublicIds") || [])];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({
          current: i + 1,
          total: files.length,
          percent: 0,
          fileName: file.name,
        });

        const isVideo = kind === "video";
        const signResponse = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder: "testimonials",
            resourceType: isVideo ? "video" : "image",
          }),
        });

        const signatureData = await signResponse.json().catch(() => ({}));
        if (!signResponse.ok) {
          throw new Error(
            signatureData.error || `Failed to prepare Cloudinary signature for "${file.name}".`
          );
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
        formData.append("timestamp", String(signatureData.timestamp));
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);

        const cloudName =
          signatureData.cloudName ||
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
          "dipeupebc";
        const resourceType =
          signatureData.resourceType || (isVideo ? "video" : "image");

        const uploadData = await new Promise<{ secure_url?: string; public_id?: string }>(
          (resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open(
              "POST",
              `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
            );
            request.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setUploadProgress({
                  current: i + 1,
                  total: files.length,
                  percent,
                  fileName: file.name,
                });
              }
            });
            request.addEventListener("load", () => {
              const response = JSON.parse(request.responseText) as {
                secure_url?: string;
                public_id?: string;
                error?: { message?: string };
              };
              if (request.status >= 200 && request.status < 300) {
                resolve(response);
              } else {
                reject(
                  new Error(
                    response.error?.message || `Cloudinary upload failed for "${file.name}".`
                  )
                );
              }
            });
            request.addEventListener("error", () =>
              reject(new Error(`Network error uploading "${file.name}" to Cloudinary.`))
            );
            request.send(formData);
          }
        );

        if (!uploadData.secure_url || !uploadData.public_id) {
          throw new Error(`Incomplete upload response received for "${file.name}".`);
        }

        if (kind === "video") {
          latestVideoUrls = [...latestVideoUrls, uploadData.secure_url];
          latestVideoPublicIds = [...latestVideoPublicIds, uploadData.public_id];
          latestThumbnailUrls = [...latestThumbnailUrls, ""];
          latestThumbnailPublicIds = [...latestThumbnailPublicIds, ""];

          setValue("videoUrls", latestVideoUrls, { shouldValidate: true });
          setValue("videoPublicIds", latestVideoPublicIds);
          setValue("thumbnailUrls", latestThumbnailUrls);
          setValue("thumbnailPublicIds", latestThumbnailPublicIds);

          // If no primary is set or current is invalid, assign first
          const currentPrimary = watch("videoUrl");
          if (!currentPrimary || !latestVideoUrls.includes(currentPrimary)) {
            setValue("videoUrl", latestVideoUrls[0], { shouldValidate: true });
            setValue("videoPublicId", latestVideoPublicIds[0]);
            setValue("thumbnailUrl", latestThumbnailUrls[0] || "");
            setValue("thumbnailPublicId", latestThumbnailPublicIds[0] || "");
          }
        } else if (kind === "testimonial-image") {
          latestImageUrls = [...latestImageUrls, uploadData.secure_url];
          latestImagePublicIds = [...latestImagePublicIds, uploadData.public_id];
          setValue("imageUrls", latestImageUrls, { shouldValidate: true });
          setValue("imagePublicIds", latestImagePublicIds);

          const currentPrimary = watch("imageUrl");
          if (!currentPrimary || !latestImageUrls.includes(currentPrimary)) {
            setValue("imageUrl", latestImageUrls[0], { shouldValidate: true });
            setValue("imagePublicId", latestImagePublicIds[0]);
          }
        }
      }
    } catch (error) {
      console.error("Batch upload error:", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during batch upload."
      );
    } finally {
      setIsUploading(null);
      setUploadProgress(null);
    }
  };

  const handleAddVideoUrl = () => {
    if (!newVideoInputUrl.trim()) return;
    try {
      new URL(newVideoInputUrl.trim());
    } catch {
      setUploadError("Please enter a valid video URL.");
      return;
    }

    const nextVideoUrls = [...currentVideoUrls, newVideoInputUrl.trim()];
    const nextVideoPublicIds = [...currentVideoPublicIds, ""];
    const nextThumbnailUrls = [...currentThumbnailUrls, ""];
    const nextThumbnailPublicIds = [...currentThumbnailPublicIds, ""];

    setValue("videoUrls", nextVideoUrls, { shouldValidate: true });
    setValue("videoPublicIds", nextVideoPublicIds);
    setValue("thumbnailUrls", nextThumbnailUrls);
    setValue("thumbnailPublicIds", nextThumbnailPublicIds);

    const currentPrimary = watch("videoUrl");
    if (!currentPrimary || !nextVideoUrls.includes(currentPrimary)) {
      setValue("videoUrl", nextVideoUrls[0], { shouldValidate: true });
      setValue("videoPublicId", nextVideoPublicIds[0]);
      setValue("thumbnailUrl", nextThumbnailUrls[0] || "");
      setValue("thumbnailPublicId", nextThumbnailPublicIds[0] || "");
    }

    setNewVideoInputUrl("");
    setUploadError(null);
  };

  const removeImage = (index: number) => {
    const removingUrl = currentImageUrls[index];
    const nextUrls = currentImageUrls.filter((_, i) => i !== index);
    const nextPublicIds = currentImagePublicIds.filter((_, i) => i !== index);
    setValue("imageUrls", nextUrls, { shouldValidate: true });
    setValue("imagePublicIds", nextPublicIds);

    // Fallback: If removed image was primary, assign first remaining
    if (removingUrl === currentImageUrl || !nextUrls.includes(currentImageUrl || "")) {
      setValue("imageUrl", nextUrls[0] || "", { shouldValidate: true });
      setValue("imagePublicId", nextPublicIds[0] || "");
    }
  };

  const removeVideo = (index: number) => {
    const removingUrl = currentVideoUrls[index];
    const nextUrls = currentVideoUrls.filter((_, i) => i !== index);
    const nextPublicIds = currentVideoPublicIds.filter((_, i) => i !== index);
    const nextThumbnailUrls = currentThumbnailUrls.filter((_, i) => i !== index);
    const nextThumbnailPublicIds = currentThumbnailPublicIds.filter((_, i) => i !== index);

    setValue("videoUrls", nextUrls, { shouldValidate: true });
    setValue("videoPublicIds", nextPublicIds);
    setValue("thumbnailUrls", nextThumbnailUrls);
    setValue("thumbnailPublicIds", nextThumbnailPublicIds);

    // Fallback: If removed video was primary, assign first remaining
    if (removingUrl === currentVideoUrl || !nextUrls.includes(currentVideoUrl || "")) {
      setValue("videoUrl", nextUrls[0] || "", { shouldValidate: true });
      setValue("videoPublicId", nextPublicIds[0] || "");
      setValue("thumbnailUrl", nextThumbnailUrls[0] || "", { shouldValidate: true });
      setValue("thumbnailPublicId", nextThumbnailPublicIds[0] || "");
    }

    if (nextUrls.length === 0) {
      setValue("thumbnailUrl", "");
      setValue("thumbnailPublicId", "");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-3xl w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("clientName")}
            className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            placeholder="e.g. Rahul Sharma"
          />
          {errors.clientName && (
            <p className="mt-1 text-xs text-red-600">{errors.clientName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Location / Area</label>
          <input
            {...register("location")}
            className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            placeholder="e.g. Majiwada, Thane"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Client Role (Optional)
          </label>
          <input
            {...register("clientRole")}
            className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            placeholder="e.g. Homeowner"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Project Type (Optional)
          </label>
          <input
            {...register("projectType")}
            className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
            placeholder="e.g. 3BHK Interior"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Custom Slug (Optional)
          </label>
          <input
            {...register("slug")}
            className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red font-mono text-sm"
            placeholder="rahul-sharma-kitchen"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Leave blank to auto-generate a clean slug from the client name.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Quote <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("quote")}
          rows={4}
          className="w-full px-3 py-2.5 border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          placeholder="Client's testimonial quote..."
        />
        {errors.quote && <p className="mt-1 text-xs text-red-600">{errors.quote.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* MULTIPLE VIDEOS SECTION WITH PER-VIDEO THUMBNAILS */}
        <div className="rounded-lg border border-neutral-200 p-4 sm:p-5 space-y-4 bg-neutral-50/40">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-red" /> Video Testimonials &amp; Custom Thumbnails
            </label>
            <p className="text-xs text-neutral-500">
              Paste YouTube/Vimeo URLs or batch upload direct MP4/WebM/MOV video files (up to 100MB each). Add an individual thumbnail for each video.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={newVideoInputUrl}
              onChange={(e) => setNewVideoInputUrl(e.target.value)}
              placeholder="Paste YouTube, Vimeo or MP4 URL"
              className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red bg-white"
            />
            <button
              type="button"
              onClick={handleAddVideoUrl}
              className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-md hover:bg-black transition-colors cursor-pointer"
            >
              Add URL
            </button>
          </div>

          {/* Video Dropzone / Direct Batch File Input */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingVideos(true);
            }}
            onDragLeave={() => setIsDraggingVideos(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingVideos(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                void handleBatchFileUpload(Array.from(e.dataTransfer.files), "video");
              }
            }}
            onClick={() => videoFileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
              isDraggingVideos
                ? "border-brand-red bg-red-50/60"
                : "border-neutral-300 hover:border-neutral-400 bg-white"
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="p-2 bg-red-50 rounded-full text-brand-red">
                <Video className="w-5 h-5" />
              </div>
              <div className="text-xs font-medium text-neutral-700">
                <span className="text-brand-red hover:underline font-semibold inline-block">
                  Click to select video files
                </span>{" "}
                or drag &amp; drop video files here
              </div>
              <p className="text-[11px] text-neutral-500">
                Supports MP4, WebM, MOV up to 100MB per file. Multi-file selection supported.
              </p>
            </div>
            <input
              ref={videoFileInputRef}
              type="file"
              multiple
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              disabled={!!isUploading}
              onChange={(event) => {
                if (event.target.files && event.target.files.length > 0) {
                  void handleBatchFileUpload(Array.from(event.target.files), "video");
                }
                event.target.value = "";
              }}
            />
          </div>

          {/* Video Upload Progress */}
          {isUploading === "video" && uploadProgress && (
            <div className="p-3 bg-red-50/80 border border-brand-red/20 rounded-md space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-brand-red animate-spin" />
                  Uploading video {uploadProgress.current} of {uploadProgress.total}
                  {uploadProgress.fileName && ` (${uploadProgress.fileName})`}
                </span>
                <span className="text-brand-red font-bold">{uploadProgress.percent}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-red h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Hidden Per-Video Thumbnail File Picker */}
          <input
            ref={perVideoThumbInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
            disabled={isUploadingThumbIndex !== null}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && activeThumbVideoIndex !== null) {
                void handleUploadVideoThumbnail(file, activeThumbVideoIndex);
              }
              e.target.value = "";
            }}
          />

          {/* Attached Videos List with Individual Thumbnails & Primary Selector */}
          {currentVideoUrls.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-neutral-200/60">
              <span className="text-xs font-bold text-neutral-700">
                Attached Videos ({currentVideoUrls.length}):
              </span>
              <div className="space-y-3">
                {currentVideoUrls.map((url, idx) => {
                  const isPrimary =
                    url === currentVideoUrl ||
                    (!currentVideoUrl && idx === 0) ||
                    (!currentVideoUrls.includes(currentVideoUrl || "") && idx === 0);

                  const thumbUrl = currentThumbnailUrls[idx] || "";
                  const isUploadingThisThumb = isUploadingThumbIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs transition-all space-y-2.5 ${
                        isPrimary
                          ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-300/60 shadow-xs"
                          : "bg-white border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      {/* Top Row: Video info and Primary / Delete actions */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Film className="w-4 h-4 text-brand-red shrink-0" />
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 flex items-center gap-1 ${
                              isPrimary
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                            }`}
                          >
                            {isPrimary ? (
                              <>
                                <Star className="w-3 h-3 fill-current" /> Primary Video
                              </>
                            ) : (
                              `#${idx + 1}`
                            )}
                          </span>
                          <span className="truncate font-mono text-neutral-800" title={url}>
                            {url}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {!isPrimary ? (
                            <button
                              type="button"
                              onClick={() => setPrimaryVideo(idx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 hover:text-brand-red border border-neutral-200 rounded transition-colors cursor-pointer"
                              title="Set as the main featured video for this testimonial"
                            >
                              <Star className="w-3 h-3 text-neutral-400" /> Set as Primary
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                              Active Primary
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => removeVideo(idx)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Individual Thumbnail Card */}
                      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100/80">
                        {thumbUrl ? (
                          <div className="flex items-center gap-3">
                            <div className="relative w-24 h-14 rounded border border-neutral-300 bg-black overflow-hidden shrink-0 shadow-xs">
                              <img
                                src={thumbUrl}
                                alt={`Thumbnail for video #${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveThumbVideoIndex(idx);
                                  perVideoThumbInputRef.current?.click();
                                }}
                                disabled={isUploadingThisThumb}
                                className="px-2.5 py-1 text-[11px] font-medium text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-300 rounded shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                {isUploadingThisThumb ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-brand-red" />
                                ) : (
                                  <Upload className="w-3 h-3 text-brand-red" />
                                )}
                                Replace Thumbnail
                              </button>
                              <button
                                type="button"
                                onClick={() => removeVideoThumbnail(idx)}
                                className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                                title="Remove thumbnail"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveThumbVideoIndex(idx);
                                perVideoThumbInputRef.current?.click();
                              }}
                              disabled={isUploadingThisThumb}
                              className="px-3 py-1.5 text-[11px] font-medium text-neutral-600 bg-white hover:bg-neutral-50 hover:text-brand-red border border-dashed border-neutral-300 rounded-md shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                            >
                              {isUploadingThisThumb ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-red" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                              )}
                              <span>No thumbnail — click to add</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MULTIPLE IMAGES SECTION */}
        <div className="rounded-lg border border-neutral-200 p-4 sm:p-5 space-y-4 bg-neutral-50/40">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-red" /> Testimonial Images (Multiple Allowed)
            </label>
            <p className="text-xs text-neutral-500">
              Upload project photos or client pictures (JPG, PNG, WebP, AVIF). Select which image is the Primary Cover.
            </p>
          </div>

          {/* Cloudinary Widget & Direct Dropzone */}
          <div className="flex flex-col gap-3">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingImages(true);
              }}
              onDragLeave={() => setIsDraggingImages(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingImages(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  void handleBatchFileUpload(
                    Array.from(e.dataTransfer.files),
                    "testimonial-image"
                  );
                }
              }}
              onClick={() => imageFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer ${
                isDraggingImages
                  ? "border-brand-red bg-red-50/60"
                  : "border-neutral-300 hover:border-neutral-400 bg-white"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="p-2.5 bg-red-50 rounded-full text-brand-red">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-neutral-700">
                  <span className="text-brand-red hover:underline font-semibold inline-block">
                    Click to select multiple images
                  </span>{" "}
                  or drag &amp; drop photos here
                </div>
                <p className="text-[11px] text-neutral-500">
                  Supports JPG, PNG, WebP, AVIF up to 100MB per file.
                </p>
              </div>
              <input
                ref={imageFileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                disabled={!!isUploading}
                onChange={(event) => {
                  if (event.target.files && event.target.files.length > 0) {
                    void handleBatchFileUpload(
                      Array.from(event.target.files),
                      "testimonial-image"
                    );
                  }
                  event.target.value = "";
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">or use Cloudinary Media Library:</span>
              <CldUploadWidget
                signatureEndpoint="/api/cloudinary/sign"
                options={{
                  sources: ["local"],
                  folder: "testimonials",
                  resourceType: "image",
                  clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
                  maxFiles: 20,
                  maxFileSize: MAX_FILE_SIZE_BYTES,
                }}
                onSuccess={(result) => {
                  if (!result.info || typeof result.info === "string") return;
                  const newUrl = result.info.secure_url;
                  const newPid = result.info.public_id;
                  if (!newUrl || !newPid) return;

                  const nextUrls = [...(watch("imageUrls") || []), newUrl];
                  const nextPublicIds = [...(watch("imagePublicIds") || []), newPid];
                  setValue("imageUrls", nextUrls, { shouldValidate: true });
                  setValue("imagePublicIds", nextPublicIds);

                  // Keep existing primary if valid, otherwise assign first
                  const currentPrimary = watch("imageUrl");
                  if (!currentPrimary || !nextUrls.includes(currentPrimary)) {
                    setValue("imageUrl", nextUrls[0], { shouldValidate: true });
                    setValue("imagePublicId", nextPublicIds[0]);
                  }
                  setUploadError(null);
                }}
                onError={() => setUploadError("Cloudinary widget upload failed.")}
              >
                {({ open }) => (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 bg-white rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-brand-red" /> Cloudinary Widget
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>

          {/* Image Upload Progress */}
          {isUploading === "testimonial-image" && uploadProgress && (
            <div className="p-3 bg-red-50/80 border border-brand-red/20 rounded-md space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-800">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-brand-red animate-spin" />
                  Uploading image {uploadProgress.current} of {uploadProgress.total}
                  {uploadProgress.fileName && ` (${uploadProgress.fileName})`}
                </span>
                <span className="text-brand-red font-bold">{uploadProgress.percent}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-brand-red h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Attached Images Grid with Primary Selector */}
          {currentImageUrls.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-200/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700">
                  Attached Images ({currentImageUrls.length}):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setValue("imageUrls", [], { shouldValidate: true });
                    setValue("imagePublicIds", []);
                    setValue("imageUrl", "");
                    setValue("imagePublicId", "");
                  }}
                  className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Images
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {currentImageUrls.map((url, idx) => {
                  const isPrimary =
                    url === currentImageUrl ||
                    (!currentImageUrl && idx === 0) ||
                    (!currentImageUrls.includes(currentImageUrl || "") && idx === 0);

                  return (
                    <div
                      key={idx}
                      className={`relative aspect-video rounded-lg border overflow-hidden group shadow-xs transition-all ${
                        isPrimary
                          ? "border-brand-red ring-2 ring-brand-red/40 bg-neutral-100"
                          : "border-neutral-200 bg-neutral-100 hover:border-neutral-400"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Testimonial media ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Top Badges / Set Primary Button */}
                      {isPrimary ? (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1 bg-brand-red text-white">
                          <CheckCircle2 className="w-3 h-3" /> Primary Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className="absolute top-1.5 left-1.5 text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm bg-neutral-900/80 hover:bg-brand-red text-white transition-colors cursor-pointer flex items-center gap-1 opacity-90 group-hover:opacity-100"
                          title="Click to set this image as the main cover photo"
                        >
                          <Star className="w-3 h-3 text-amber-300" /> Set Primary
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-neutral-900/70 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Bottom position label */}
                      <span className="absolute bottom-1.5 right-1.5 text-[10px] font-mono font-medium text-white/90 bg-black/50 px-1 rounded pointer-events-none">
                        #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Form Upload Error Banner */}
      {uploadError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200 flex items-start justify-between gap-2">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-600 hover:text-red-800 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hidden inputs to keep legacy scalars and arrays synced */}
      <input type="hidden" {...register("videoUrl")} />
      <input type="hidden" {...register("videoPublicId")} />
      <input type="hidden" {...register("imageUrl")} />
      <input type="hidden" {...register("imagePublicId")} />
      <input type="hidden" {...register("thumbnailUrl")} />
      <input type="hidden" {...register("thumbnailPublicId")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Rating</label>
          <div className="flex items-center min-h-[44px] gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setValue("rating", star)}
                className="p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= currentRating
                      ? "fill-brand-yellow text-brand-yellow"
                      : "text-neutral-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
          <input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red font-mono"
          />
        </div>
      </div>

      <div className="flex items-center min-h-[44px]">
        <input
          type="checkbox"
          id="isPublishedTestimonial"
          {...register("isPublished")}
          className="h-5 w-5 text-brand-red rounded border-neutral-300 focus:ring-brand-red cursor-pointer"
        />
        <label
          htmlFor="isPublishedTestimonial"
          className="ml-2.5 text-sm text-neutral-700 font-medium cursor-pointer"
        >
          Published
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || !!isUploading || isUploadingThumbIndex !== null}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!isUploading || isUploadingThumbIndex !== null}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red rounded-md hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Testimonial"
          )}
        </button>
      </div>
    </form>
  );
}
