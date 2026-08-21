"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const serviceSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    designType: z.enum(["INTERIOR", "EXTERIOR"]),
    description: z.string().min(1, "Description is required"),
    iconKey: z.string().optional(),
    sortOrder: z.number(),
    isPublished: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

const ICONS = ["Home", "Building", "Sofa", "Utensils", "Sun", "TreePine"]; // Placeholder icon list

interface ServiceFormProps {
    initialData?: Partial<ServiceFormValues>;
    onSubmit: (data: ServiceFormValues) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export function ServiceForm({ initialData, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
    const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: {
            title: initialData?.title || "",
            slug: initialData?.slug || "",
            designType: initialData?.designType || "INTERIOR",
            description: initialData?.description || "",
            iconKey: initialData?.iconKey || "",
            sortOrder: initialData?.sortOrder ?? 0,
            isPublished: initialData?.isPublished ?? true,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-2xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                    <input {...register("title")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="e.g. Modular Kitchen" />
                    {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Slug</label>
                    <input {...register("slug")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="e.g. modular-kitchen" />
                    {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Design Type</label>
                    <select {...register("designType")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm cursor-pointer">
                        <option value="INTERIOR">Interior</option>
                        <option value="EXTERIOR">Exterior</option>
                    </select>
                    {errors.designType && <p className="mt-1 text-xs text-red-600">{errors.designType.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Icon</label>
                    <select {...register("iconKey")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm cursor-pointer">
                        <option value="">Select an icon...</option>
                        {ICONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <textarea {...register("description")} rows={4} className="w-full px-3 py-2.5 border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="Service description..." />
                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
                    <input type="number" {...register("sortOrder", { valueAsNumber: true })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" />
                </div>
                <div className="flex items-center mt-2 sm:mt-6 min-h-[44px]">
                    <input type="checkbox" id="isPublished" {...register("isPublished")} className="h-5 w-5 text-brand-red border-neutral-300 rounded focus:ring-brand-red cursor-pointer" />
                    <label htmlFor="isPublished" className="ml-2.5 text-sm text-neutral-700 cursor-pointer">Published</label>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
                <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red rounded-md hover:bg-brand-red/90 transition-colors disabled:opacity-50 cursor-pointer">
                    {isSubmitting ? "Saving..." : "Save Service"}
                </button>
            </div>
        </form>
    );
}