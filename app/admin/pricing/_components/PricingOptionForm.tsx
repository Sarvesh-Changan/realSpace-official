"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const pricingOptionSchema = z.object({
  groupKey: z.string().min(1, "Group key is required"),
  label: z.string().min(1, "Label is required"),
  designType: z.enum(["INTERIOR", "EXTERIOR"]).optional().nullable(),
  basePrice: z.number().min(0, "Must be positive"),
  perUnitPrice: z.number().optional().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

export type PricingConfigFormValues = z.infer<typeof pricingOptionSchema>;

interface PricingConfigFormProps {
  initialData?: Partial<PricingConfigFormValues>;
  onSubmit: (data: PricingConfigFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PricingConfigForm({ initialData, onSubmit, onCancel, isSubmitting }: PricingConfigFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PricingConfigFormValues>({
    resolver: zodResolver(pricingOptionSchema),
    defaultValues: {
      groupKey: initialData?.groupKey || "",
      label: initialData?.label || "",
      designType: initialData?.designType || null,
      basePrice: initialData?.basePrice ?? 0,
      perUnitPrice: initialData?.perUnitPrice ?? null,
      isActive: initialData?.isActive ?? true,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-2xl w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Configuration Group</label>
          <select {...register("groupKey")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm cursor-pointer">
            <option value="">Select group...</option>
            <option value="bhk_type">BHK Type</option>
            <option value="kitchen">Kitchen</option>
            <option value="hall">Hall / Living</option>
            <option value="bedroom">Bedroom</option>
            <option value="wardrobe">Wardrobe</option>
            <option value="interior_package">Interior Package</option>
            <option value="exterior_service">Exterior Service</option>
            <option value="material_tier">Material Tier</option>
            <option value="addon">Additional Service</option>
          </select>
          {errors.groupKey && <p className="mt-1 text-xs text-red-600">{errors.groupKey.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Label Name</label>
          <input {...register("label")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="e.g. Premium Laminate" />
          {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Base Price (₹)</label>
          <input type="number" step="any" {...register("basePrice", { valueAsNumber: true })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm font-mono" placeholder="0.00" />
          {errors.basePrice && <p className="mt-1 text-xs text-red-600">{errors.basePrice.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Per-Unit Price (₹) (Optional)</label>
          <input type="number" step="any" {...register("perUnitPrice", { valueAsNumber: true, setValueAs: (v) => v === "" || isNaN(v) ? null : Number(v) })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm font-mono" placeholder="0.00" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Design Type Filter (Optional)</label>
          <select {...register("designType")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm cursor-pointer">
            <option value="">Applies to Both</option>
            <option value="INTERIOR">Interior Only</option>
            <option value="EXTERIOR">Exterior Only</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
          <input type="number" {...register("sortOrder", { valueAsNumber: true })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm font-mono" />
        </div>
      </div>

      <div className="flex items-center min-h-[44px]">
        <input type="checkbox" id="isActiveOption" {...register("isActive")} className="h-5 w-5 text-brand-red border-neutral-300 rounded focus:ring-brand-red cursor-pointer" />
        <label htmlFor="isActiveOption" className="ml-2.5 text-sm text-neutral-700 cursor-pointer">Active (Visible in Calculator)</label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
        <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red rounded-md hover:bg-brand-red/90 transition-colors disabled:opacity-50 cursor-pointer">
          {isSubmitting ? "Saving..." : "Save Pricing Option"}
        </button>
      </div>
    </form>
  );
}