"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "../schema";
import { createCategory, updateCategory } from "../actions";

interface CategoryFormProps {
    initialData?: CategoryInput;
    onSuccess: () => void;
    onCancel: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const isUpdate = !!initialData?.id;

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CategoryInput>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: initialData?.name || "",
            sortOrder: initialData?.sortOrder ?? 0,
        },
    });

    const onSubmit = async (data: CategoryInput) => {
        setIsSubmitting(true);
        setServerError(null);

        try {
            const result = isUpdate
                ? await updateCategory(initialData.id!, data)
                : await createCategory(data);

            if (result.success) {
                onSuccess();
            } else {
                setServerError("An error occurred while saving.");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Form submission error:", err);
            setServerError("An unexpected error occurred. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900">{isUpdate ? "Edit Category" : "Add Category"}</h3>

            {serverError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
                    {serverError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register("name")}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                        placeholder="e.g. Modern Kitchens"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Sort Order
                    </label>
                    <input
                        type="number"
                        {...register("sortOrder", { valueAsNumber: true })}
                        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red text-neutral-900"
                    />
                    {errors.sortOrder && <p className="mt-1 text-xs text-red-500">{errors.sortOrder.message}</p>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-brand-red text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors"
                >
                    {isSubmitting ? "Saving..." : isUpdate ? "Save Changes" : "Create Category"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-white text-neutral-700 text-sm font-medium rounded-md border border-neutral-300 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
