"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { faqSchema, type FaqFormValues } from "../schema";
import { createFaq, updateFaq } from "../actions";

interface FaqFormProps {
  mode: "create" | "update";
  faqId?: string;
  initialData?: FaqFormValues;
}

export function FaqForm({ mode, faqId, initialData }: FaqFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FaqFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(faqSchema) as any,
    defaultValues: initialData || {
      question: "",
      answer: "",
      sortOrder: 0,
      isPublished: true,
    },
  });

  const onSubmit = async (values: FaqFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      let result;
      if (mode === "update" && faqId) {
        result = await updateFaq(faqId, values);
      } else {
        result = await createFaq(values);
      }

      if (!result.success) {
        setServerError(result.error || "Failed to save FAQ.");
      } else {
        router.push("/admin/faqs");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Form submit error:", err);
      setServerError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="faq-question" className="block text-sm font-semibold text-neutral-800 mb-1">
          Question <span className="text-brand-red">*</span>
        </label>
        <input
          id="faq-question"
          type="text"
          {...register("question")}
          placeholder="e.g. What is the approximate cost of a 2BHK interior in Thane?"
          className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none text-neutral-900"
        />
        {errors.question && (
          <p className="mt-1 text-xs text-brand-red font-medium">{errors.question.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="faq-answer" className="block text-sm font-semibold text-neutral-800 mb-1">
          Answer <span className="text-brand-red">*</span>
        </label>
        <textarea
          id="faq-answer"
          rows={6}
          {...register("answer")}
          placeholder="e.g. The cost depends on space optimization, finish, and custom woodwork..."
          className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none resize-y text-neutral-900"
        />
        {errors.answer && (
          <p className="mt-1 text-xs text-brand-red font-medium">{errors.answer.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-neutral-100">
        <div>
          <label htmlFor="faq-sortOrder" className="block text-sm font-semibold text-neutral-800 mb-1">
            Sort Order
          </label>
          <input
            id="faq-sortOrder"
            type="number"
            {...register("sortOrder")}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm font-mono focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none text-neutral-900"
          />
          <p className="mt-1 text-xs text-neutral-400">Lower numbers appear first.</p>
          {errors.sortOrder && (
            <p className="mt-1 text-xs text-brand-red font-medium">{errors.sortOrder.message}</p>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <span className="block text-sm font-semibold text-neutral-800 mb-2">Visibility Status</span>
          <label className="inline-flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("isPublished")}
              className="sr-only peer"
            />
            <div className="relative w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="text-xs font-medium text-neutral-800">
              Published on website
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
        <button
          type="button"
          onClick={() => router.push("/admin/faqs")}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-brand-red hover:bg-brand-red/90 rounded-md transition-colors shadow-xs disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "update" ? "Save Changes" : "Create FAQ"}
        </button>
      </div>
    </form>
  );
}
