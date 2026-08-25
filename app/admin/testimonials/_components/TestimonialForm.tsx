"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Star, Upload, Video, X } from "lucide-react";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const testimonialSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientRole: z.string().optional(),
  quote: z.string().min(1, "Quote is required"),
  videoUrl: z.string().optional(),
  videoPublicId: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  thumbnailPublicId: z.string().optional(),
  slug: z.string().optional(),
  location: z.string().optional(),
  projectType: z.string().optional(),
  rating: z.number().min(1).max(5),
  sortOrder: z.number(),
  isPublished: z.boolean(),
}).superRefine((data, context) => {
  if (data.videoUrl && !data.thumbnailUrl) {
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

type UploadKind = "video" | "image";

export function TestimonialForm({ initialData, onSubmit, onCancel, isSubmitting }: TestimonialFormProps) {
  const [isUploading, setIsUploading] = useState<UploadKind | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      clientName: initialData?.clientName || "",
      clientRole: initialData?.clientRole || "",
      quote: initialData?.quote || "",
      videoUrl: initialData?.videoUrl || "",
      videoPublicId: initialData?.videoPublicId || "",
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
  const currentVideoUrl = watch("videoUrl");
  const currentThumbnailUrl = watch("thumbnailUrl");

  const uploadFile = async (file: File, kind: UploadKind) => {
    setUploadError(null);
    if (kind === "video" && (!VIDEO_TYPES.includes(file.type) || file.size > MAX_VIDEO_SIZE)) {
      setUploadError("Video must be MP4, WebM or MOV and no larger than 100MB.");
      return;
    }
    if (kind === "image" && !IMAGE_TYPES.includes(file.type)) {
      setUploadError("Thumbnail must be a JPG, PNG or WebP image.");
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
        setValue("videoUrl", uploadData.secure_url, { shouldValidate: true });
        setValue("videoPublicId", uploadData.public_id);
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

  const clearMedia = (kind: UploadKind) => {
    if (kind === "video") {
      setValue("videoUrl", "");
      setValue("videoPublicId", "");
    } else {
      setValue("thumbnailUrl", "");
      setValue("thumbnailPublicId", "");
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-neutral-200 p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Video Testimonial</label>
          <input type="url" {...register("videoUrl", { onChange: () => setValue("videoPublicId", "") })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md mb-3" placeholder="YouTube or Vimeo URL" />
          <p className="text-xs text-neutral-500 mb-3">Paste an external YouTube/Vimeo URL, or upload a video below.</p>
          <label className="inline-flex items-center gap-2 px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md text-sm font-medium cursor-pointer hover:bg-neutral-50">
            {isUploading === "video" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
            {isUploading === "video" ? `Uploading ${uploadProgress}%` : "Upload video"}
            <input type="file" accept="video/mp4,video/webm,video/quicktime" className="sr-only" disabled={!!isUploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file, "video"); event.target.value = ""; }} />
          </label>
          {currentVideoUrl && <div className="mt-3 flex items-center justify-between gap-2 text-xs text-green-700 bg-green-50 p-2 rounded"><span className="truncate">Video attached</span><button type="button" onClick={() => clearMedia("video")} className="p-1 text-neutral-500 hover:text-red-600" aria-label="Remove video"><X className="w-4 h-4" /></button></div>}
        </div>

        <div className="rounded-md border border-neutral-200 p-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Video Thumbnail</label>
          <p className="text-xs text-neutral-500 mb-3">Upload a JPG, PNG or WebP thumbnail for the video.</p>
          <label className="inline-flex items-center gap-2 px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md text-sm font-medium cursor-pointer hover:bg-neutral-50">
            {isUploading === "image" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading === "image" ? `Uploading ${uploadProgress}%` : "Upload thumbnail"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={!!isUploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file, "image"); event.target.value = ""; }} />
          </label>
          {currentThumbnailUrl && <div className="mt-3 flex items-center justify-between gap-2 text-xs text-green-700 bg-green-50 p-2 rounded"><span className="truncate">Thumbnail attached</span><button type="button" onClick={() => clearMedia("image")} className="p-1 text-neutral-500 hover:text-red-600" aria-label="Remove thumbnail"><X className="w-4 h-4" /></button></div>}
          {errors.thumbnailUrl && <p className="mt-2 text-xs text-red-600">{errors.thumbnailUrl.message}</p>}
        </div>
      </div>
      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      <input type="hidden" {...register("videoPublicId")} />
      <input type="hidden" {...register("thumbnailUrl")} />
      <input type="hidden" {...register("thumbnailPublicId")} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Rating</label>
          <div className="flex items-center min-h-[44px] gap-2">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setValue("rating", star)} className="p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center"><Star className={`w-6 h-6 ${star <= currentRating ? "fill-brand-yellow text-brand-yellow" : "text-neutral-300"}`} /></button>)}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
          <input type="number" {...register("sortOrder", { valueAsNumber: true })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md" />
        </div>
      </div>
      <div className="flex items-center min-h-[44px]"><input type="checkbox" id="isPublishedTestimonial" {...register("isPublished")} className="h-5 w-5 text-brand-red" /><label htmlFor="isPublishedTestimonial" className="ml-2.5 text-sm text-neutral-700">Published</label></div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md">Cancel</button>
        <button type="submit" disabled={isSubmitting || !!isUploading} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red rounded-md disabled:opacity-50">{isSubmitting ? "Saving..." : "Save Testimonial"}</button>
      </div>
    </form>
  );
}
