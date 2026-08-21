"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OfferInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(offerSchema) as any,
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      ctaLabel: initialData?.ctaLabel || "Claim Offer",
      ctaLink: initialData?.ctaLink || "/contact",
      isActive: initialData?.isActive ?? true,
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

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
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-neutral-900 mb-1">
            Offer Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register("title")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm"
            placeholder="e.g., Free Modular Kitchen Consultation"
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-neutral-900 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            {...register("description")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm resize-y"
            placeholder="Detailed description of the offer and its benefits..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        {/* Image URL */}
        <div className="md:col-span-2">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-neutral-900 mb-1">
            Image URL (Optional)
          </label>
          <input
            id="imageUrl"
            type="text"
            {...register("imageUrl")}
            className="block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-neutral-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red focus:outline-none text-base sm:text-sm"
            placeholder="https://..."
          />
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
        <div className="flex items-center pt-2 sm:pt-6 min-h-[44px]">
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
            <p className="text-neutral-500 text-xs">If unchecked, this offer is hidden from the public site.</p>
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
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red border border-transparent rounded-md hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Offer" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}