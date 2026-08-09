"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { TestimonialForm, type TestimonialFormValues } from "./TestimonialForm";
import { createTestimonial, updateTestimonial } from "../actions";

interface TestimonialFormClientProps {
  mode: "create" | "update";
  testimonialId?: string;
  initialData?: Partial<TestimonialFormValues>;
}

export function TestimonialFormClient({
  mode,
  testimonialId,
  initialData,
}: TestimonialFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TestimonialFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result =
        mode === "create"
          ? await createTestimonial(data)
          : await updateTestimonial(testimonialId!, data);

      if (result.success) {
        router.push("/admin/testimonials");
        router.refresh();
      } else {
        setError(result.error || "Failed to save testimonial.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while saving.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/testimonials");
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-sm text-red-700 max-w-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <TestimonialForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
