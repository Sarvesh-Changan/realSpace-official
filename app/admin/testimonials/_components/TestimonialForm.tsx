"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Star, Upload, Video, X, Plus, Film, Image as ImageIcon, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  slug: z.string().optional(),
  location: z.string().optional(),
  projectType: z.string().optional(),
  rating: z.number().min(1).max(5),
  sortOrder: z.number(),
  isPublished: z.boolean(),
}).superRefine((data, context) => {
  const hasVideo = data.videoUrl || data.videoUrls.length > 0;
  if (hasVideo && !data.thumbnailUrl) {
    context.addIssue({ code: "custom", path: ["thumbnailUrl"], message: "A thumbnail is required when a video is provided." });
  }
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

interface TestimonialFormProps {
  initialData?: Partial<TestimonialFormValues>;
  onSubmit: (data: TestimonialFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type UploadKind = "video" | "image" | "testimonial-image";

export function TestimonialForm({ initialData, onSubmit, onCancel, isSubmitting }: TestimonialFormProps) {
  const [isUploading, setIsUploading] = useState<UploadKind | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newVideoInputUrl, setNewVideoInputUrl] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<z.input<typeof testimonialSchema>, unknown, TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: initialData?.clientName || "",
      clientRole: initialData?.clientRole || "",
      quote: initialData?.quote || "",
      imageUrl: initialData?.imageUrl || "",
      imagePublicId: initialData?.imagePublicId || "",
      imageUrls: initialData?.imageUrls?.length ? initialData.imageUrls : initialData?.imageUrl ? [initialData.imageUrl] : [],
      imagePublicIds: initialData?.imagePublicIds?.length ? initialData.imagePublicIds : initialData?.imagePublicId ? [initialData.imagePublicId] : [],
      videoUrl: initialData?.videoUrl || "",
      videoPublicId: initialData?.videoPublicId || "",
      videoUrls: initialData?.videoUrls?.length ? initialData.videoUrls : initialData?.videoUrl ? [initialData.videoUrl] : [],
      videoPublicIds: initialData?.videoPublicIds?.length ? initialData.videoPublicIds : initialData?.videoPublicId ? [initialData.videoPublicId] : [],
      thumbnailUrl: initialData?.thumbnailUrl || "",
      thumbnailPublicId: initialData?.thumbnailPublicId || "",
      slug: initialData?.slug || "",
      location: initialData?.location || "",
      projectType: initialData?.projectType || "",
      rating: initialData?.rating || 5,
      sortOrder: initialData?.sortOrder ?? 0,
      isPublished: initialData?.isPublished ?? true,
    },
  });

  const currentRating = watch("rating");
  const currentImageUrls = watch("imageUrls");
  const currentImagePublicIds = watch("imagePublicIds");
  const currentVideoUrls = watch("videoUrls");
  const currentVideoPublicIds = watch("videoPublicIds");
  const currentThumbnailUrl = watch("thumbnailUrl");

  const uploadFile = async (file: File, kind: UploadKind) => {
    setUploadError(null);
    if (kind === "video" && (!VIDEO_TYPES.includes(file.type) || file.size > MAX_VIDEO_SIZE)) {
      setUploadError("Video must be MP4, WebM or MOV and no larger than 100MB.");
      return;
    }
    if ((kind === "image" || kind === "testimonial-image") && !IMAGE_TYPES.includes(file.type)) {
      setUploadError("Image must be a JPG, PNG or WebP image.");
      return;
    }

    setIsUploading(kind);
    setUploadProgress(0);
    try {
      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "testimonials", resourceType: kind === "video" ? "video" : "image" }),
      });
      const signatureData = await signResponse.json().catch(() => ({}));
      if (!signResponse.ok) throw new Error(signatureData.error || "Failed to prepare Cloudinary upload.");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signatureData.apiKey);
      formData.append("timestamp", String(signatureData.timestamp));
      formData.append("signature", signatureData.signature);
      formData.append("folder", signatureData.folder);

      const cloudName = signatureData.cloudName;
      const resourceType = signatureData.resourceType || (kind === "video" ? "video" : "image");
      const uploadData = await new Promise<{ secure_url?: string; public_id?: string }>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
        request.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
        });
        request.addEventListener("load", () => {
          const response = JSON.parse(request.responseText) as { secure_url?: string; public_id?: string; error?: { message?: string } };
          if (request.status >= 200 && request.status < 300) resolve(response);
          else reject(new Error(response.error?.message || "Cloudinary upload failed."));
        });
        request.addEventListener("error", () => reject(new Error("Cloudinary upload failed.")));
        request.send(formData);
      });

      if (!uploadData.secure_url || !uploadData.public_id) throw new Error("Cloudinary returned an incomplete upload response.");

      if (kind === "video") {
        const nextVideoUrls = [...(currentVideoUrls || []), uploadData.secure_url];
        const nextVideoPublicIds = [...(currentVideoPublicIds || []), uploadData.public_id];
        setValue("videoUrl", nextVideoUrls[0], { shouldValidate: true });
        setValue("videoPublicId", nextVideoPublicIds[0]);
        setValue("videoUrls", nextVideoUrls, { shouldValidate: true });
        setValue("videoPublicIds", nextVideoPublicIds);
      } else if (kind === "testimonial-image") {
        const nextImageUrls = [...(currentImageUrls || []), uploadData.secure_url];
        const nextImagePublicIds = [...(currentImagePublicIds || []), uploadData.public_id];
        setValue("imageUrl", nextImageUrls[0], { shouldValidate: true });
        setValue("imagePublicId", nextImagePublicIds[0]);
        setValue("imageUrls", nextImageUrls, { shouldValidate: true });
        setValue("imagePublicIds", nextImagePublicIds);
      } else {
        setValue("thumbnailUrl", uploadData.secure_url, { shouldValidate: true });
        setValue("thumbnailPublicId", uploadData.public_id);
      }
      setUploadProgress(100);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(null);
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

    const nextVideoUrls = [...(currentVideoUrls || []), newVideoInputUrl.trim()];
    const nextVideoPublicIds = [...(currentVideoPublicIds || []), ""];
    setValue("videoUrl", nextVideoUrls[0], { shouldValidate: true });
    setValue("videoPublicId", nextVideoPublicIds[0]);
    setValue("videoUrls", nextVideoUrls, { shouldValidate: true });
    setValue("videoPublicIds", nextVideoPublicIds);
    setNewVideoInputUrl("");
    setUploadError(null);
  };

  const removeImage = (index: number) => {
    const nextUrls = (currentImageUrls || []).filter((_, i) => i !== index);
    const nextPublicIds = (currentImagePublicIds || []).filter((_, i) => i !== index);
    setValue("imageUrls", nextUrls, { shouldValidate: true });
    setValue("imagePublicIds", nextPublicIds);
    setValue("imageUrl", nextUrls[0] || "");
    setValue("imagePublicId", nextPublicIds[0] || "");
  };

  const removeVideo = (index: number) => {
    const nextUrls = (currentVideoUrls || []).filter((_, i) => i !== index);
    const nextPublicIds = (currentVideoPublicIds || []).filter((_, i) => i !== index);
    setValue("videoUrls", nextUrls, { shouldValidate: true });
    setValue("videoPublicIds", nextPublicIds);
    setValue("videoUrl", nextUrls[0] || "");
    setValue("videoPublicId", nextPublicIds[0] || "");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-3xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Client Name</label>
          <input {...register("clientName")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md" placeholder="e.g. Rahul Sharma" />
          {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Location / Area</label>
          <input {...register("location")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md" placeholder="e.g. Majiwada, Thane" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Client Role (Optional)</label>
          <input {...register("clientRole")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md" placeholder="e.g. Homeowner" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Project Type (Optional)</label>
          <input {...register("projectType")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md" placeholder="e.g. 3BHK Interior" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-700 mb-1">Custom Slug (Optional)</label>
          <input {...register("slug")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md" placeholder="rahul-sharma-kitchen" />
          <p className="mt-1 text-xs text-neutral-500">Leave blank to generate a unique slug from the client name.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Quote</label>
        <textarea {...register("quote")} rows={4} className="w-full px-3 py-2.5 border border-neutral-300 rounded-md" placeholder="Client's testimonial quote..." />
        {errors.quote && <p className="mt-1 text-xs text-red-600">{errors.quote.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* MULTIPLE VIDEOS SECTION */}
        <div className="rounded-md border border-neutral-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-red" /> Video Testimonials (Multiple Allowed)
            </label>
            <p className="text-xs text-neutral-500">
              Add YouTube / Vimeo links or upload direct MP4/WebM videos.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={newVideoInputUrl}
              onChange={(e) => setNewVideoInputUrl(e.target.value)}
              placeholder="Paste YouTube, Vimeo or MP4 URL"
              className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-md"
            />
            <button
              type="button"
              onClick={handleAddVideoUrl}
              className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-md hover:bg-black transition-colors"
            >
              Add URL
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] border border-neutral-300 rounded-md text-xs font-medium cursor-pointer hover:bg-neutral-50">
              {isUploading === "video" ? <Loader2 className="w-4 h-4 animate-spin text-brand-red" /> : <Video className="w-4 h-4" />}
              {isUploading === "video" ? `Uploading Video ${uploadProgress}%` : "Upload Video File"}
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="sr-only"
                disabled={!!isUploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadFile(file, "video");
                  event.target.value = "";
                }}
              />
            </label>
          </div>

          {/* Video List */}
          {currentVideoUrls && currentVideoUrls.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700">Attached Videos ({currentVideoUrls.length}):</span>
              <div className="space-y-1.5">
                {currentVideoUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded-md text-xs">
                    <span className="truncate flex items-center gap-1.5 font-mono text-neutral-800">
                      <Film className="w-3.5 h-3.5 text-brand-red shrink-0" />
                      #{idx + 1}: {url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MULTIPLE IMAGES SECTION */}
        <div className="rounded-md border border-neutral-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brand-red" /> Testimonial Images (Multiple Allowed)
            </label>
            <p className="text-xs text-neutral-500">
              Upload project photos or client pictures (JPG, PNG, WebP).
            </p>
          </div>

          <CldUploadWidget
            signatureEndpoint="/api/cloudinary/sign"
            options={{
              sources: ["local"],
              folder: "testimonials",
              resourceType: "image",
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
              maxFiles: 20,
            }}
            onSuccess={(result) => {
              if (!result.info || typeof result.info === "string") return;
              const nextUrls = [...(watch("imageUrls") || []), result.info.secure_url];
              const nextPublicIds = [...(watch("imagePublicIds") || []), result.info.public_id];
              setValue("imageUrl", nextUrls[0], { shouldValidate: true });
              setValue("imagePublicId", nextPublicIds[0]);
              setValue("imageUrls", nextUrls, { shouldValidate: true });
              setValue("imagePublicIds", nextPublicIds);
              setUploadError(null);
            }}
            onError={() => setUploadError("Testimonial image upload failed.")}
          >
            {({ open }) => (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => open()}
                  className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] border border-neutral-300 rounded-md text-xs font-medium hover:bg-neutral-50"
                >
                  <Upload className="w-4 h-4" /> Cloudinary Widget
                </button>
                <label className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] border border-neutral-300 rounded-md text-xs font-medium cursor-pointer hover:bg-neutral-50">
                  {isUploading === "testimonial-image" ? <Loader2 className="w-4 h-4 animate-spin text-brand-red" /> : <Upload className="w-4 h-4" />}
                  {isUploading === "testimonial-image" ? `Uploading Image ${uploadProgress}%` : "Upload Image File"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={!!isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void uploadFile(file, "testimonial-image");
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
            )}
          </CldUploadWidget>

          {/* Image List */}
          {currentImageUrls && currentImageUrls.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700">Attached Images ({currentImageUrls.length}):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {currentImageUrls.map((url, idx) => (
                  <div key={idx} className="relative aspect-video bg-neutral-100 border border-neutral-200 rounded-md overflow-hidden group">
                    <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-sm"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* THUMBNAIL SECTION */}
        <div className="rounded-md border border-neutral-200 p-4">
          <label className="block text-sm font-semibold text-neutral-900 mb-1">Video Thumbnail</label>
          <p className="text-xs text-neutral-500 mb-3">Upload a preview thumbnail image for video playback cards.</p>
          <label className="inline-flex items-center gap-2 px-3 py-2 min-h-[40px] border border-neutral-300 rounded-md text-xs font-medium cursor-pointer hover:bg-neutral-50">
            {isUploading === "image" ? <Loader2 className="w-4 h-4 animate-spin text-brand-red" /> : <Upload className="w-4 h-4" />}
            {isUploading === "image" ? `Uploading ${uploadProgress}%` : "Upload Thumbnail"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={!!isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadFile(file, "image");
                event.target.value = "";
              }}
            />
          </label>
          {currentThumbnailUrl && (
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-green-700 bg-green-50 p-2 rounded">
              <span className="truncate">Thumbnail attached</span>
              <button
                type="button"
                onClick={() => {
                  setValue("thumbnailUrl", "");
                  setValue("thumbnailPublicId", "");
                }}
                className="p-1 text-neutral-500 hover:text-red-600"
                aria-label="Remove thumbnail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {errors.thumbnailUrl && <p className="mt-2 text-xs text-red-600">{errors.thumbnailUrl.message}</p>}
        </div>
      </div>

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

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
                className="p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <Star className={`w-6 h-6 ${star <= currentRating ? "fill-brand-yellow text-brand-yellow" : "text-neutral-300"}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
          <input type="number" {...register("sortOrder", { valueAsNumber: true })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md" />
        </div>
      </div>

      <div className="flex items-center min-h-[44px]">
        <input type="checkbox" id="isPublishedTestimonial" {...register("isPublished")} className="h-5 w-5 text-brand-red" />
        <label htmlFor="isPublishedTestimonial" className="ml-2.5 text-sm text-neutral-700">Published</label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md">Cancel</button>
        <button type="submit" disabled={isSubmitting || !!isUploading} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red rounded-md disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Testimonial"}</button>
      </div>
    </form>
  );
}
