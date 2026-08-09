"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PricingConfigForm, type PricingConfigFormValues } from "./PricingOptionForm";
import { createPricingOption, updatePricingOption } from "../actions";

interface PricingOptionFormClientProps {
  mode: "create" | "update";
  optionId?: string;
  initialData?: Partial<PricingConfigFormValues>;
}

export function PricingOptionFormClient({
  mode,
  optionId,
  initialData,
}: PricingOptionFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PricingConfigFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result =
        mode === "create"
          ? await createPricingOption(data)
          : await updatePricingOption(optionId!, data);

      if (result.success) {
        router.push("/admin/pricing");
        router.refresh();
      } else {
        setError(result.error || "Failed to save pricing option.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while saving.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/pricing");
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-sm text-red-700 max-w-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <PricingConfigForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
