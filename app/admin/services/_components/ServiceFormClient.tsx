"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { ServiceForm, type ServiceFormValues } from "./ServiceForm";
import { createService, updateService } from "../actions";

interface ServiceFormClientProps {
  mode: "create" | "update";
  serviceId?: string;
  initialData?: Partial<ServiceFormValues>;
}

export function ServiceFormClient({ mode, serviceId, initialData }: ServiceFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result =
        mode === "create"
          ? await createService(data)
          : await updateService(serviceId!, data);

      if (result.success) {
        router.push("/admin/services");
        router.refresh();
      } else {
        setError(result.error || "Failed to save service.");
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred while saving.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/services");
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3 text-sm text-red-700 max-w-2xl">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ServiceForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
