"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star } from "lucide-react";

const testimonialSchema = z.object({
    clientName: z.string().min(1, "Client name is required"),
    clientRole: z.string().optional(),
    quote: z.string().min(1, "Quote is required"),
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

export function TestimonialForm({ initialData, onSubmit, onCancel, isSubmitting }: TestimonialFormProps) {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TestimonialFormValues>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
            clientName: initialData?.clientName || "",
            clientRole: initialData?.clientRole || "",
            quote: initialData?.quote || "",
            projectType: initialData?.projectType || "",
            rating: initialData?.rating || 5,
            sortOrder: initialData?.sortOrder ?? 0,
            isPublished: initialData?.isPublished ?? true,
        },
    });

    const currentRating = watch("rating");

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-4 sm:p-6 md:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-2xl w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Client Name</label>
                    <input {...register("clientName")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="e.g. Rahul Sharma" />
                    {errors.clientName && <p className="mt-1 text-xs text-red-600">{errors.clientName.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Client Role (Optional)</label>
                    <input {...register("clientRole")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="e.g. Homeowner, Majiwada" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Project Type (Optional)</label>
                    <input {...register("projectType")} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="e.g. 3BHK Interior" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Rating</label>
                    <div className="flex items-center min-h-[44px] gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setValue("rating", star)} className="focus:outline-none p-1.5 min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer">
                                <Star className={`w-6 h-6 ${star <= currentRating ? "fill-brand-yellow text-brand-yellow" : "text-neutral-300"}`} />
                            </button>
                        ))}
                    </div>
                    {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Quote</label>
                <textarea {...register("quote")} rows={4} className="w-full px-3 py-2.5 border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" placeholder="Client's testimonial quote..." />
                {errors.quote && <p className="mt-1 text-xs text-red-600">{errors.quote.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Sort Order</label>
                    <input type="number" {...register("sortOrder", { valueAsNumber: true })} className="w-full px-3 py-2.5 min-h-[44px] border border-neutral-300 rounded-md focus:ring-brand-red focus:border-brand-red text-base sm:text-sm" />
                </div>
                <div className="flex items-center mt-2 sm:mt-6 min-h-[44px]">
                    <input type="checkbox" id="isPublishedTestimonial" {...register("isPublished")} className="h-5 w-5 text-brand-red border-neutral-300 rounded focus:ring-brand-red cursor-pointer" />
                    <label htmlFor="isPublishedTestimonial" className="ml-2.5 text-sm text-neutral-700 cursor-pointer">Published</label>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-100">
                <button type="button" onClick={onCancel} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-brand-red rounded-md hover:bg-brand-red/90 transition-colors disabled:opacity-50 cursor-pointer">
                    {isSubmitting ? "Saving..." : "Save Testimonial"}
                </button>
            </div>
        </form>
    );
}