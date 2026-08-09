"use client";

import { useEffect, useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { faqSchema, type FaqFormValues } from "../schema";

export interface FaqItemData {
    id?: string;
    question: string;
    answer: string;
    sortOrder: number;
    isPublished: boolean;
}

interface FaqFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FaqFormValues) => Promise<void>;
    initialData?: FaqItemData | null;
    title: string;
}

export function FaqFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    title,
}: FaqFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FaqFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(faqSchema) as any,
        defaultValues: {
            question: "",
            answer: "",
            sortOrder: 0,
            isPublished: true,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    question: initialData.question,
                    answer: initialData.answer,
                    sortOrder: initialData.sortOrder,
                    isPublished: initialData.isPublished,
                });
            } else {
                reset({
                    question: "",
                    answer: "",
                    sortOrder: 0,
                    isPublished: true,
                });
            }
        }
    }, [isOpen, initialData, reset]);

    if (!isOpen) return null;

    const handleFormSubmit = async (data: FieldValues) => {
        setIsSubmitting(true);
        setErrorMsg(null);
        try {
            await onSubmit({
                question: data.question as string,
                answer: data.answer as string,
                sortOrder: Number(data.sortOrder) || 0,
                isPublished: Boolean(data.isPublished),
            });
        } catch (err: unknown) {
            console.error("Form submit error:", err);
            setErrorMsg("An unexpected error occurred while saving.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div
                className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
                    <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="flex-1 overflow-y-auto p-6 space-y-5"
                >
                    {errorMsg && (
                        <div className="p-3.5 bg-red-50 border border-red-200 rounded-md text-xs text-brand-red font-medium">
                            {errorMsg}
                        </div>
                    )}

                    {/* Question Field */}
                    <div>
                        <label htmlFor="faq-question" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                            Question <span className="text-brand-red">*</span>
                        </label>
                        <input
                            id="faq-question"
                            type="text"
                            {...register("question")}
                            placeholder="e.g. What is the approximate cost of a 2BHK interior in Thane?"
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red text-neutral-900 placeholder:text-neutral-400"
                        />
                        {errors.question && (
                            <p className="mt-1 text-xs text-brand-red font-medium">
                                {errors.question.message}
                            </p>
                        )}
                    </div>

                    {/* Answer Field */}
                    <div>
                        <label htmlFor="faq-answer" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                            Answer <span className="text-brand-red">*</span>
                        </label>
                        <textarea
                            id="faq-answer"
                            rows={5}
                            {...register("answer")}
                            placeholder="e.g. The cost varies based on material selection and scope of work..."
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red text-neutral-900 placeholder:text-neutral-400 leading-relaxed"
                        />
                        {errors.answer && (
                            <p className="mt-1 text-xs text-brand-red font-medium">
                                {errors.answer.message}
                            </p>
                        )}
                    </div>

                    {/* Sort Order & Publish Switch Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                        <div>
                            <label htmlFor="faq-sortOrder" className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                                Sort Order
                            </label>
                            <input
                                id="faq-sortOrder"
                                type="number"
                                {...register("sortOrder")}
                                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md shadow-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red text-neutral-900 font-mono"
                            />
                            <p className="mt-1 text-[11px] text-neutral-400">
                                Lower numbers appear first on the FAQ page.
                            </p>
                            {errors.sortOrder && (
                                <p className="mt-1 text-xs text-brand-red font-medium">
                                    {errors.sortOrder.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <span className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
                                Visibility Status
                            </span>
                            <label className="inline-flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("isPublished")}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                                <span className="text-xs font-medium text-neutral-800">
                                    Published on website
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-brand-red hover:bg-brand-red/90 rounded-md transition-colors shadow-xs disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {initialData ? "Save Changes" : "Create FAQ"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
