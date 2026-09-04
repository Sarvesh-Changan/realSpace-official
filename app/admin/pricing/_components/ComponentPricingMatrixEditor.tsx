"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Loader2, CheckCircle2, AlertCircle, Sparkles, ChefHat, Sofa, Bed, Bath } from "lucide-react";
import { updateComponentPricingMatrix } from "../actions";

// --- Types & Constants ---
export type ComponentKey = "kitchen" | "living_room" | "bedroom" | "bathroom";
export type TierKey = "STANDARD" | "PREMIUM" | "LUXURY";

export interface ComponentPricingRecord {
  id?: string;
  componentKey: ComponentKey;
  tier: TierKey;
  pricePerUnit: number;
  isActive: boolean;
}

export const COMPONENTS: { key: ComponentKey; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: "kitchen", label: "Kitchen", Icon: ChefHat },
  { key: "living_room", label: "Living Room", Icon: Sofa },
  { key: "bedroom", label: "Bedroom", Icon: Bed },
  { key: "bathroom", label: "Bathroom", Icon: Bath },
];

export const TIERS: { key: TierKey; label: string; badgeColor: string }[] = [
  { key: "STANDARD", label: "Standard", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "PREMIUM", label: "Premium", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "LUXURY", label: "Luxury", badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
];

// --- Zod Validation Schema ---
export const componentPricingItemSchema = z.object({
  componentKey: z.enum(["kitchen", "living_room", "bedroom", "bathroom"]),
  tier: z.enum(["STANDARD", "PREMIUM", "LUXURY"]),
  pricePerUnit: z.coerce.number().min(0, "Price must be a positive number"),
  isActive: z.boolean().default(true),
});

export const componentPricingMatrixSchema = z.object({
  items: z.array(componentPricingItemSchema),
});

export type ComponentPricingMatrixFormData = z.infer<typeof componentPricingMatrixSchema>;

interface ComponentPricingMatrixEditorProps {
  initialPricing: ComponentPricingRecord[];
}

export function ComponentPricingMatrixEditor({ initialPricing }: ComponentPricingMatrixEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Build complete 4x3 default matrix if DB rows are missing
  const defaultItems: ComponentPricingRecord[] = [];
  COMPONENTS.forEach((comp) => {
    TIERS.forEach((tier) => {
      const match = initialPricing.find(
        (p) => p.componentKey === comp.key && p.tier === tier.key
      );
      defaultItems.push({
        id: match?.id,
        componentKey: comp.key,
        tier: tier.key,
        pricePerUnit: match ? Number(match.pricePerUnit) : 0,
        isActive: match ? match.isActive : true,
      });
    });
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ComponentPricingMatrixFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(componentPricingMatrixSchema) as any,
    defaultValues: {
      items: defaultItems,
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Helper to check if a component is active (true if any tier item for that component is active)
  const isComponentActive = (compKey: ComponentKey): boolean => {
    const compItems = watchedItems.filter((i) => i.componentKey === compKey);
    return compItems.length > 0 ? compItems.every((i) => i.isActive) : true;
  };

  // Toggle active state for an entire component row (all 3 tiers)
  const handleToggleComponentActive = (compKey: ComponentKey, newActiveState: boolean) => {
    watchedItems.forEach((item, index) => {
      if (item.componentKey === compKey) {
        setValue(`items.${index}.isActive`, newActiveState, { shouldDirty: true });
      }
    });
  };

  // Submit all matrix changes in one single batch action
  const onSubmit = async (data: ComponentPricingMatrixFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const res = await updateComponentPricingMatrix(data.items);
      if (res.success) {
        setSuccessMessage("Component pricing matrix saved successfully!");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setServerError(res.error || "Failed to update pricing matrix.");
      }
    } catch (err: any) {
      console.error("Pricing matrix submit error:", err);
      setServerError("An unexpected error occurred while saving pricing matrix.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-red" /> Component Tier Pricing Matrix
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Configure per-unit prices (₹) across components and material tiers.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer w-full sm:w-auto"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSubmitting ? "Saving Matrix..." : "Save Changes"}
        </button>
      </div>

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          {successMessage}
        </div>
      )}
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Pricing Matrix Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="py-4 px-5 w-1/4">Component</th>
                {TIERS.map((tier) => (
                  <th key={tier.key} className="py-4 px-5 text-center w-1/5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${tier.badgeColor}`}>
                        {tier.label}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="py-4 px-5 text-right w-1/6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {COMPONENTS.map((comp) => {
                const active = isComponentActive(comp.key);

                return (
                  <tr
                    key={comp.key}
                    className={`transition-colors hover:bg-neutral-50/60 ${
                      !active ? "bg-neutral-50/70 opacity-60" : ""
                    }`}
                  >
                    <td className="py-4 px-5 align-middle">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-neutral-100 border border-neutral-200 text-brand-red shrink-0 mt-0.5">
                          <comp.Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900 text-base">{comp.label}</div>
                        </div>
                      </div>
                    </td>

                    {/* 3 Tier Price Cells */}
                    {TIERS.map((tier) => {
                      // Find field index in react-hook-form field array
                      const fieldIndex = fields.findIndex(
                        (f) => f.componentKey === comp.key && f.tier === tier.key
                      );
                      const fieldError = errors.items?.[fieldIndex]?.pricePerUnit;

                      return (
                        <td key={tier.key} className="py-4 px-4 align-middle text-center">
                          <div className="relative max-w-[160px] mx-auto">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none">
                              ₹
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              {...register(`items.${fieldIndex}.pricePerUnit`, {
                                valueAsNumber: true,
                              })}
                              disabled={!active || isSubmitting}
                              className={`w-full pl-8 pr-3 py-2.5 rounded-lg border text-sm font-mono font-medium text-neutral-900 shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red disabled:bg-neutral-100 disabled:text-neutral-400 ${
                                fieldError
                                  ? "border-red-500 bg-red-50/50"
                                  : "border-neutral-300 bg-white hover:border-neutral-400"
                              }`}
                              placeholder="0.00"
                            />
                            {fieldError && (
                              <p className="text-[11px] text-red-500 font-medium mt-1 text-left">
                                {fieldError.message}
                              </p>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Row Active Toggle */}
                    <td className="py-4 px-5 align-middle text-right">
                      <label className="inline-flex items-center justify-end gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={(e) => handleToggleComponentActive(comp.key, e.target.checked)}
                          disabled={isSubmitting}
                          className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer disabled:opacity-50"
                        />
                        <span className={`text-xs font-semibold ${active ? "text-green-700" : "text-neutral-400"}`}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info banner */}
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          {isDirty && (
            <div className="text-amber-700 font-medium flex items-center gap-1">
              ● Unsaved changes in matrix
            </div>
          )}
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-brand-red text-white text-base font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 cursor-pointer w-full sm:w-auto"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSubmitting ? "Saving Matrix Changes..." : "Save All Changes"}
        </button>
      </div>
    </form>
  );
}
