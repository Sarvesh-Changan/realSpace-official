"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { certificationSchema, type CertificationInput } from "../schema";
import { createCertification, updateCertification } from "../actions";

interface CertificationFormProps {
    mode: "create" | "update";
    certId?: string;
    initialData?: Partial<CertificationInput>;
}

export function CertificationForm({ mode, certId, initialData }: CertificationFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CertificationInput>({
        resolver: zodResolver(certificationSchema),
        defaultValues: {
            title: initialData?.title || "",
            issuingBody: initialData?.issuingBody || "",
            certificateType: initialData?.certificateType || "COURSE",
            issueDate: initialData?.issueDate || "",
            validUntil: initialData?.validUntil || "",
            badgeLabel: initialData?.badgeLabel || "",
            imageUrl: initialData?.imageUrl || "",
            isPublished: initialData?.isPublished ?? true,
            sortOrder: initialData?.sortOrder ?? 0,
        },
    });

    const onSubmit = async (data: CertificationInput) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            const result =
                mode === "create"
                    ? await createCertification(data)
                    : await updateCertification(certId!, data);

            if (result.success) {
                router.push("/admin/certifications");
                router.refresh();
            } else {
                setServerError(result.error || "An error occurred while saving.");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Form submission error:", err);
            setServerError("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
            {serverError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
                    {serverError}
                </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("title")}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                            placeholder="e.g. Advanced Kitchen Ergonomics"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Issuing Body */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Issuing Body <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("issuingBody")}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                            placeholder="e.g. Institute of Interior Design"
                        />
                        {errors.issuingBody && <p className="mt-1 text-xs text-red-500">{errors.issuingBody.message}</p>}
                    </div>

                    {/* Certificate Type */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Certificate Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register("certificateType")}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 cursor-pointer"
                        >
                            <option value="COURSE">Course</option>
                            <option value="MEMBERSHIP">Membership</option>
                            <option value="REGISTRATION">Registration</option>
                        </select>
                        {errors.certificateType && <p className="mt-1 text-xs text-red-500">{errors.certificateType.message}</p>}
                    </div>

                    {/* Issue Date */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Issue Date (Optional)
                        </label>
                        <input
                            type="date"
                            {...register("issueDate")}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        />
                        {errors.issueDate && <p className="mt-1 text-xs text-red-500">{errors.issueDate.message}</p>}
                    </div>

                    {/* Valid Until */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Valid Until (Optional)
                        </label>
                        <input
                            type="date"
                            {...register("validUntil")}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        />
                        {errors.validUntil && <p className="mt-1 text-xs text-red-500">{errors.validUntil.message}</p>}
                    </div>

                    {/* Badge Label */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Badge Label <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register("badgeLabel")}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                            placeholder="e.g. Certified Professional"
                        />
                        {errors.badgeLabel && <p className="mt-1 text-xs text-red-500">{errors.badgeLabel.message}</p>}
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Sort Order
                        </label>
                        <input
                            type="number"
                            {...register("sortOrder", { valueAsNumber: true })}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900 font-mono"
                        />
                        {errors.sortOrder && <p className="mt-1 text-xs text-red-500">{errors.sortOrder.message}</p>}
                    </div>

                    {/* Image URL */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Image URL (Optional)
                        </label>
                        <input
                            type="text"
                            {...register("imageUrl")}
                            className="w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                            placeholder="https://res.cloudinary.com/..."
                        />
                        {errors.imageUrl && <p className="mt-1 text-xs text-red-500">{errors.imageUrl.message}</p>}
                        <p className="mt-1 text-xs text-neutral-500">
                            Provide a valid URL to the certificate badge or document image.
                        </p>
                    </div>

                    {/* Is Published */}
                    <div className="md:col-span-2 flex items-center pt-2 min-h-[44px]">
                        <input
                            type="checkbox"
                            id="isPublished"
                            {...register("isPublished")}
                            className="h-5 w-5 rounded border-neutral-300 text-brand-red focus:ring-brand-red cursor-pointer"
                        />
                        <label htmlFor="isPublished" className="ml-2.5 block text-sm text-neutral-700 font-medium cursor-pointer">
                            Publish this certification publicly
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                <button
                    type="button"
                    onClick={() => router.push("/admin/certifications")}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-brand-red text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors cursor-pointer"
                >
                    {isSubmitting ? "Saving..." : mode === "create" ? "Create Certification" : "Save Changes"}
                </button>
            </div>
        </form>
    );
}
