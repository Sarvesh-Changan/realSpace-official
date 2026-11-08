"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { reraFaqSchema, type ReraFaqInput } from "../schema";

export function FaqForm({
  initialData,
  onSubmitAction,
}: {
  initialData?: ReraFaqInput;
  onSubmitAction: (
    data: ReraFaqInput
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReraFaqInput>({
    resolver: zodResolver(reraFaqSchema),
    defaultValues: initialData || {
      question: "",
      answer: "",
      sortOrder: 0,
      isPublished: true,
    },
  });

  const onSubmit = async (data: ReraFaqInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const result = await onSubmitAction(data);

    if (result.success) {
      router.push("/admin/rera/faqs");
      router.refresh();
    } else {
      setServerError(result.error || "Failed to save FAQ.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-3xl"
    >
      {serverError && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-red-300 bg-red-50 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{serverError}</div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Question <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("question")}
          placeholder="e.g. How does REALSPACE verify MahaRERA registration of builders?"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.question && (
          <p className="mt-1 text-xs text-red-500">{errors.question.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Answer <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          {...register("answer")}
          placeholder="Provide a thorough, informative answer addressing customer questions..."
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.answer && (
          <p className="mt-1 text-xs text-red-500">{errors.answer.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center pt-2">
        <div>
          <label className="block text-xs font-medium text-neutral-600">
            Sort Order (0 = highest)
          </label>
          <input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="mt-1 block w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>

        <div className="sm:pt-5">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-sm text-neutral-800 select-none">
            <input
              type="checkbox"
              {...register("isPublished")}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer h-4 w-4"
            />
            <span>Published on website</span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-neutral-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/rera/faqs")}
          className="px-5 py-2.5 min-h-[44px] bg-white border border-neutral-300 text-neutral-700 font-medium text-sm rounded-md hover:bg-neutral-50 transition-colors shadow-xs cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Saving FAQ..." : "Save FAQ"}
        </button>
      </div>
    </form>
  );
}

