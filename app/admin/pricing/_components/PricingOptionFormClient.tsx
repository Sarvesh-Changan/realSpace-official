"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { PricingConfigForm, type PricingConfigFormValues } from "./PricingOptionForm";

interface PricingOptionFormClientProps {
  mode: "create" | "update";
  optionId?: string;
  initialData?: Partial<PricingConfigFormValues>;
}

export function PricingOptionFormClient({
  initialData,
}: PricingOptionFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    router.push("/admin/pricing");
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
