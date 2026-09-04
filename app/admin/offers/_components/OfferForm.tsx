"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { offerSchema, type OfferInput } from "../schema";
import { createOffer, updateOffer } from "../actions";

interface OfferFormProps {
  mode: "create" | "update";
  offerId?: string;
  initialData?: Partial<OfferInput>;
}

export function OfferForm({ mode, offerId, initialData }: OfferFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OfferInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(offerSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      imagePublicId: initialData?.imagePublicId || "",
      ctaLabel: initialData?.ctaLabel || "Claim Offer",
      ctaLink: initialData?.ctaLink || "/contact",
      isActive: initialData?.isActive ?? true,
      showOnHome: initialData?.showOnHome ?? false,
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const currentImageUrl = watch("imageUrl");

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setServerError(null);

    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "realspace-offers" }),
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

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${targetCloud}/image/upload`,
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

      setValue("imageUrl", uploadData.secure_url || uploadData.url);
      setValue("imagePublicId", uploadData.public_id);
    } catch (err: any) {
      console.error("Direct upload error:", err);
      setServerError(err.message || "Failed to upload image to Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setValue("imageUrl", "");
    setValue("imagePublicId", "");
  };

  const onSubmit = async (data: OfferInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result =
        mode === "create"
          ? await createOffer(data)
          : await updateOffer(offerId!, data);

      if (!result.success) {
        setServerError(result.error || "Failed to save offer");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/offers");
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      setServerError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 max-w-4xl">
      {serverError && (
        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200 text-red-800 text-sm">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Image Upload / Preview Section */}
        <div className="md:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-neutral-900 mb-1">
            Offer Image (Optional)
          </label>

          {currentImageUrl ? (
            <div className="p-4 border border-neutral-200 rounded-lg bg-neutral-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-32 h-24 rounded-md overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100">
                <Image
                  src={currentImageUrl}
                  alt="Offer Preview"
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized={!currentImageUrl.includes("res.cloudinary.com")}
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploading || isSubmitting}
                  className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] bg-white border border-red-200 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Remove Image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? "Uploading Image..." : "Upload File"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDirectFileUpload}
                  disabled={isUploading || isSubmitting}
                  className="sr-only"
                />
              </label>

            </div>
          )}

          <input type="hidden" {...register("imageUrl")} />
          <input type="hidden" {...register("imagePublicId")} />
          {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl.message}</p>}
        </div>

        {/* CTA Label */}
        <div>
          <label htmlFor="ctaLabel" className="block text-sm font-medium text-neutral-900 mb-1">
            Button Label <span className="text-red-500">*</span>
          </label>
          <input
            id="ctaLabel"
            type="text"
            {...register("ctaLabel")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm"
            placeholder="e.g., Claim Offer"
          />
          {errors.ctaLabel && <p className="mt-1 text-xs text-red-500">{errors.ctaLabel.message}</p>}
        </div>

        {/* CTA Link */}
        <div>
          <label htmlFor="ctaLink" className="block text-sm font-medium text-neutral-900 mb-1">
            Button Link / URL <span className="text-red-500">*</span>
          </label>
          <input
            id="ctaLink"
            type="text"
            {...register("ctaLink")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm"
            placeholder="/contact or https://..."
          />
          {errors.ctaLink && <p className="mt-1 text-xs text-red-500">{errors.ctaLink.message}</p>}
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-neutral-900 mb-1">
            Start Date (Optional)
          </label>
          <input
            id="startDate"
            type="date"
            {...register("startDate")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm"
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-neutral-900 mb-1">
            End Date (Optional)
          </label>
          <input
            id="endDate"
            type="date"
            {...register("endDate")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm"
          />
          {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-neutral-900 mb-1">
            Sort Order
          </label>
          <input
            id="sortOrder"
            type="number"
            {...register("sortOrder")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm font-mono"
          />
          <p className="mt-1 text-xs text-neutral-500">Lower numbers appear first.</p>
        </div>
        
        {/* Is Active Toggle */}
        <div className="flex flex-col sm:flex-row gap-6 pt-2 sm:pt-6">
          <div className="flex items-center min-h-[44px]">
            <div className="flex items-center h-5">
              <input
                id="isActive"
                type="checkbox"
                {...register("isActive")}
                className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="isActive" className="font-medium text-neutral-900 cursor-pointer">
                Active Status
              </label>
              <p className="text-neutral-500 text-xs">If unchecked, this offer is hidden from all public sites.</p>
            </div>
          </div>

          <div className="flex items-center min-h-[44px]">
            <div className="flex items-center h-5">
              <input
                id="showOnHome"
                type="checkbox"
                {...register("showOnHome")}
                className="h-5 w-5 rounded border-neutral-300 text-amber-600 focus:ring-amber-600 cursor-pointer"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="showOnHome" className="font-medium text-neutral-900 cursor-pointer">
                Show on Home Page Strip
              </label>
              <p className="text-neutral-500 text-xs">If checked, featured on the top announcement strip on Home page.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-neutral-100">
        <Link
          href="/admin/offers"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red border border-transparent rounded-md hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading Image...
            </>
          ) : isSubmitting ? (
            "Saving..."
          ) : mode === "create" ? (
            "Create Offer"
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
