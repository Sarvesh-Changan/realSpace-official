"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, X, Loader2, AlertTriangle, Building2, Sparkles, Briefcase, ShieldCheck, Calculator, KeyRound, ImagePlus } from "lucide-react";
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
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const uploadScrollContainer = useRef<HTMLElement | null>(null);
  const uploadScrollTop = useRef<number | null>(null);

  const captureUploadScroll = (input: HTMLInputElement) => {
    const scrollContainer = input.closest<HTMLElement>("main");
    uploadScrollContainer.current = scrollContainer;
    uploadScrollTop.current = scrollContainer?.scrollTop ?? null;
  };

  const restoreUploadScroll = () => {
    const scrollContainer = uploadScrollContainer.current;
    const scrollTop = uploadScrollTop.current;
    if (!scrollContainer || scrollTop === null) return;

    scrollContainer.scrollTop = scrollTop;
    requestAnimationFrame(() => {
      scrollContainer.scrollTop = scrollTop;
      requestAnimationFrame(() => {
        scrollContainer.scrollTop = scrollTop;
      });
    });
  };

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
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
      slug: "",
      shortDescription: "",
      pageHeading: "",
      bannerImageUrl: "",
      bannerImagePublicId: "",
      bannerImageAlt: "",
      contentImages: [],
      sections: [],
      ctaText: "Contact Us",
      ctaUrl: "/contact",
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

  const uploadImages = async (files: File[] | FileList | null, mode: "banner" | "gallery" | "loan-partner") => {
    if (!files?.length) return;
    setUploading(true);
    setServerError(null);
    try {
      const currentImages = [...(watch("contentImages") ?? [])];
      for (const file of Array.from(files)) {
        const signRes = await fetch("/api/cloudinary/sign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder: "rera-services", resourceType: "image" }) });
        if (!signRes.ok) throw new Error("Could not prepare Cloudinary upload.");
        const sign = await signRes.json();
        const body = new FormData();
        body.append("file", file);
        body.append("api_key", sign.apiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
        body.append("timestamp", String(sign.timestamp));
        body.append("signature", sign.signature);
        body.append("folder", sign.folder || "rera-services");
        const cloud = sign.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const upload = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body });
        const result = await upload.json();
        if (!upload.ok) throw new Error(result.error?.message || "Image upload failed.");
        if (mode === "banner") {
          setValue("bannerImageUrl", result.secure_url, { shouldDirty: true });
          setValue("bannerImagePublicId", result.public_id, { shouldDirty: true });
          setValue("bannerImageAlt", file.name.replace(/\.[^.]+$/, ""), { shouldDirty: true });
          // Validate only after all upload fields are updated. This prevents an
          // earlier validation run from leaving a stale URL error behind.
          await trigger(["bannerImageUrl", "bannerImagePublicId", "bannerImageAlt"]);
        } else currentImages.push({ url: result.secure_url, publicId: result.public_id, alt: file.name.replace(/\.[^.]+$/, ""), order: currentImages.length, ...(mode === "loan-partner" ? { placement: "loan-partner" as const } : { placement: "content" as const }) });
      }
      if (mode === "gallery" || mode === "loan-partner") {
        setValue("contentImages", currentImages, { shouldDirty: true });
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
      restoreUploadScroll();
    }
  };

  const handleUploadSelection = (input: HTMLInputElement, mode: "banner" | "gallery" | "loan-partner") => {
    const files = input.files ? Array.from(input.files) : [];
    input.value = "";
    // The admin form scrolls inside its main element, not the window. Blur the
    // visually hidden input and restore that container after the picker closes.
    input.blur();
    restoreUploadScroll();
    void uploadImages(files, mode);
  };

  const onSubmit = async (formData: ReraServiceInput) => {
    if (uploading) {
      setServerError("Please wait for the image upload to finish before saving.");
      return;
    }
    setIsSubmitting(true);
    setServerError(null);
    setSaveMessage(null);
    try {
      const result = await onSubmitAction(formData);
      if (!result.success) {
        setServerError(result.error || "Failed to save service.");
        return;
      }

      setSaveMessage("Service saved successfully.");
      router.refresh();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not save service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInvalid = (formErrors: typeof errors) => {
    const messages = Object.entries(formErrors)
      .map(([field, error]) => {
        const message = error && "message" in error ? error.message : undefined;
        return typeof message === "string" ? `${field}: ${message}` : null;
      })
      .filter((message): message is string => Boolean(message));
    setServerError(messages.length ? `Please correct the highlighted fields: ${messages.join("; ")}` : "Please correct the highlighted fields before saving.");
    const firstInvalid = document.querySelector<HTMLElement>("[aria-invalid='true']");
    firstInvalid?.focus();
  };

  const SelectedIcon = ICON_COMPONENTS[watchedIconKey] || Building2;
  const isLoanService = /loan/i.test(`${watch("title") ?? ""} ${watch("slug") ?? ""}`) || watchedIconKey === "calculator";
  const contentImages = (watch("contentImages") ?? []).filter((image) => image.placement !== "loan-partner");
  const loanPartnerLogos = (watch("contentImages") ?? []).filter((image) => image.placement === "loan-partner");

  const removeLoanPartnerLogo = (url: string) => {
    setValue("contentImages", (watch("contentImages") ?? []).filter((image) => image.url !== url), { shouldDirty: true, shouldValidate: true });
  };

  const updateLoanPartnerAlt = (url: string, alt: string) => {
    setValue("contentImages", (watch("contentImages") ?? []).map((image) => image.url === url ? { ...image, alt } : image), { shouldDirty: true });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, handleInvalid)}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 shadow-sm max-w-3xl"
      style={{ overflowAnchor: "none" }}
    >
      {serverError && (
        <div role="alert" aria-live="assertive" className="flex items-start gap-3 p-4 rounded-md border border-red-300 bg-red-50 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{serverError}</div>
        </div>
      )}
      {saveMessage && <div role="status" className="rounded-md border border-green-300 bg-green-50 px-4 py-3 text-sm font-medium text-green-900">{saveMessage}</div>}

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Service Title <span className="text-red-500">*</span>
        </label>
          <input
          type="text"
            aria-invalid={Boolean(errors.title)}
          {...register("title")}
          placeholder="e.g. Verified Property Buying & Advisory"
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3.5 py-2.5 min-h-[44px] text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
        )}
      </div>

      {isLoanService && (
        <section className="space-y-3 rounded-md border border-neutral-200 p-4 sm:p-5" aria-labelledby="loan-partner-logos-title">
          <div>
            <h3 id="loan-partner-logos-title" className="font-semibold text-neutral-900">Home loan bank logos</h3>
            <p className="mt-1 text-xs text-neutral-500">These logos appear in a horizontal strip below the Services cards. Use the Calculator / Home Loans icon or include “loan” in the service title or slug to enable this panel.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-neutral-300 px-3 py-2 text-sm">
            <ImagePlus className="h-4 w-4" />{uploading ? "Uploading…" : "Upload bank logos"}
            <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onClick={(event) => captureUploadScroll(event.currentTarget)} onChange={(event) => handleUploadSelection(event.currentTarget, "loan-partner")} />
          </label>
          {loanPartnerLogos.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {loanPartnerLogos.map((image) => (
                <li key={image.url} className="rounded border border-neutral-200 p-2">
                  <Image src={image.url} alt={image.alt || "Bank logo preview"} width={240} height={120} unoptimized className="h-20 w-full object-contain" />
                  <label className="mt-2 block text-xs text-neutral-600">Accessible name
                    <input value={image.alt ?? ""} onChange={(event) => updateLoanPartnerAlt(image.url, event.target.value)} className="mt-1 w-full rounded border border-neutral-300 px-2 py-1.5" maxLength={120} required />
                  </label>
                  <button type="button" onClick={() => removeLoanPartnerLogo(image.url)} className="mt-2 text-xs font-medium text-red-700 hover:underline">Remove logo</button>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-neutral-500">No bank logos added yet.</p>}
        </section>
      )}

      <details open className="rounded-md border border-neutral-200 p-4 sm:p-5">
        <summary className="cursor-pointer font-semibold text-neutral-900">Public service page content</summary>
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">Page slug <span className="text-red-500">*</span><input aria-invalid={Boolean(errors.slug)} {...register("slug")} placeholder="buying" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2.5" />{errors.slug && <span className="mt-1 block text-xs text-red-600">{errors.slug.message}</span>}</label>
            <label className="text-sm font-medium text-neutral-700">Page heading<input {...register("pageHeading")} placeholder="Buying Property" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2.5" /></label>
          </div>
          <label className="block text-sm font-medium text-neutral-700">Short introduction<textarea rows={3} {...register("shortDescription")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2.5" /></label>
          <section id="service-banner-image" className="scroll-mt-24 space-y-2" aria-label="Banner image">
          <label className="block text-sm font-medium text-neutral-700">Banner image URL<input aria-invalid={Boolean(errors.bannerImageUrl)} {...register("bannerImageUrl")} placeholder="Upload or paste an image URL" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2.5" /></label>
          {errors.bannerImageUrl && <p className="text-xs text-red-600">{errors.bannerImageUrl.message}</p>}
          <div className="flex min-h-16 flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-neutral-300 px-3 py-2 text-sm"><ImagePlus className="h-4 w-4" />{uploading ? "Uploading…" : "Upload banner"}<input type="file" accept="image/*" className="sr-only" disabled={uploading} onClick={(event) => captureUploadScroll(event.currentTarget)} onChange={(event) => handleUploadSelection(event.currentTarget, "banner")} /></label>
            {watch("bannerImageUrl") && <Image src={watch("bannerImageUrl") || ""} alt={watch("bannerImageAlt") || "Banner preview"} width={112} height={64} unoptimized className="h-16 w-28 rounded object-cover" />}
          </div>
          <label className="block text-sm font-medium text-neutral-700">Banner alt text<input aria-invalid={Boolean(errors.bannerImageAlt)} {...register("bannerImageAlt")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2.5" /></label>
          {errors.bannerImageAlt && <p className="text-xs text-red-600">{errors.bannerImageAlt.message}</p>}
          </section>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">CTA label<input {...register("ctaText")} className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2.5" /></label>
            <label className="text-sm font-medium text-neutral-700">CTA destination<input {...register("ctaUrl")} placeholder="/contact" className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2.5" /></label>
          </div>
          {!isLoanService && (
          <div>
            <label className="block text-sm font-medium text-neutral-700">Main content images</label>
            <p className="mt-1 text-xs text-neutral-500">Upload images to add them to this service page.</p>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded border border-neutral-300 px-3 py-2 text-sm"><ImagePlus className="h-4 w-4" />{uploading ? "Uploading…" : "Upload gallery images"}<input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onClick={(event) => captureUploadScroll(event.currentTarget)} onChange={(event) => handleUploadSelection(event.currentTarget, "gallery")} /></label>
            {contentImages.length > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {contentImages.map((image, index) => (
                  <li key={`${image.publicId ?? image.url}-${index}`} className="overflow-hidden rounded border border-neutral-200">
                    <Image src={image.url} alt={image.alt || "Service content image"} width={320} height={180} unoptimized className="h-28 w-full object-cover" />
                    <p className="truncate px-2 py-1 text-xs text-neutral-600">{image.alt || "Service content image"}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          )}
        </div>
      </details>

      <div>
        <label className="block text-sm font-medium text-neutral-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          aria-invalid={Boolean(errors.description)}
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
          disabled={isSubmitting || uploading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 min-h-[44px] bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {(isSubmitting || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {uploading ? "Uploading image..." : isSubmitting ? "Saving Service..." : "Save Service"}
        </button>
      </div>
    </form>
  );
}

