"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, X, Loader2, AlertTriangle, Building2, Sparkles, Briefcase, ShieldCheck, Calculator, KeyRound } from "lucide-react";
import { reraServiceSchema, type ReraServiceInput, SERVICE_ICONS } from "../schema";

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  building2: Building2,
  sparkles: Sparkles,
  briefcase: Briefcase,
  shieldcheck: ShieldCheck,
  calculator: Calculator,
  keyround: KeyRound,
};

export function ServiceForm({
  initialData,
  onSubmitAction,
}: {
  initialData?: ReraServiceInput;
  onSubmitAction: (
    data: ReraServiceInput
  ) => Promise<{ success: boolean; id?: string; error?: string }>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReraServiceInput>({
    resolver: zodResolver(reraServiceSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      iconKey: "building2",
      highlights: [],
      sortOrder: 0,
      isPublished: true,
    },
  });

  const watchedHighlights = watch("highlights") || [];
  const watchedIconKey = watch("iconKey") || "building2";

  const handleAddHighlight = () => {
    const trimmed = highlightInput.trim();
    if (trimmed && !watchedHighlights.includes(trimmed)) {
      setValue("highlights", [...watchedHighlights, trimmed], {
        shouldDirty: true,
        shouldValidate: true,
      });
      setHighlightInput("");
    }
  };

  const handleRemoveHighlight = (tag: string) => {
    setValue(
      "highlights",
      watchedHighlights.filter((h) => h !== tag),
      { shouldDirty: true, shouldValidate: true }
    );
  };

  const onSubmit = async (data: ReraServiceInput) => {
    setIsSubmitting(true);
    setServerError(null);

    const result = await onSubmitAction(data);

    if (result.success) {
      router.push("/admin/rera/services");
      router.refresh();
    } else {
      setServerError(result.error || "Failed to save service.");
      setIsSubmitting(false);
    }
  };

  const SelectedIcon = ICON_COMPONENTS[watchedIconKey] || Building2;

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
          Service Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("title")}
          placeholder="e.g. Verified Property Buying & Advisory"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          {...register("description")}
          placeholder="Describe what this service entails and how you help property buyers/sellers..."
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Icon Key Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Service Icon
        </label>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-md bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-800 shrink-0">
            <SelectedIcon className="w-6 h-6" />
          </div>
          <select
            {...register("iconKey")}
            className="flex-1 rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 bg-white"
          >
            {SERVICE_ICONS.map((icon) => (
              <option key={icon.key} value={icon.key}>
                {icon.label} ({icon.key})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Highlights (Tag Input) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">
          Key Highlights / Deliverables
        </label>
        <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-neutral-50 rounded-md border border-neutral-200">
          {watchedHighlights.length > 0 ? (
            watchedHighlights.map((hl) => (
              <span
                key={hl}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-neutral-300 rounded-full text-xs font-medium text-neutral-800 shadow-xs"
              >
                {hl}
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(hl)}
                  className="text-neutral-400 hover:text-red-500 cursor-pointer"
                  aria-label={`Remove ${hl}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-neutral-400 self-center">
              No highlights added yet. Type below and press Enter (e.g. &quot;Title Deed Verification&quot;, &quot;Zero Brokerage on New Launches&quot;).
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddHighlight();
              }
            }}
            placeholder="Type a highlight and press Enter"
            className="flex-1 rounded-md border border-neutral-300 px-3.5 py-2 min-h-[40px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <button
            type="button"
            onClick={handleAddHighlight}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Highlight
          </button>
        </div>
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
          onClick={() => router.push("/admin/rera/services")}
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
          {isSubmitting ? "Saving Service..." : "Save Service"}
        </button>
      </div>
    </form>
  );
}

