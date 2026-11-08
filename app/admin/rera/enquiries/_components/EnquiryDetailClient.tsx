"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { updateEnquiry } from "../actions";
import type { LeadStatus } from "@prisma/client";

export interface EnquiryDetailData {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  interestedIn: "BUY" | "SELL" | "RENT" | "OTHER";
  budgetLabel?: string | null;
  locality?: string | null;
  message?: string | null;
  source: "CONTACT_FORM" | "CALLBACK" | "PROPERTY_ENQUIRY" | "POST_PROPERTY" | "SITE_VISIT";
  property?: {
    id: string;
    title: string;
    slug: string;
    locality: string;
    priceLabel: string;
  } | null;
  status: LeadStatus;
  notes?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const SOURCE_NAMES: Record<string, string> = {
  CONTACT_FORM: "Contact Form",
  CALLBACK: "Callback Request",
  PROPERTY_ENQUIRY: "Property Enquiry",
  POST_PROPERTY: "Post Property Submission",
  SITE_VISIT: "Site Visit Booking",
};

function formatKey(key: string): string {
  // Convert camelCase or snake_case to Title Case (e.g. preferredSlot -> Preferred Slot)
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

export function EnquiryDetailClient({ enquiry }: { enquiry: EnquiryDetailData }) {
  const router = useRouter();
  const [status, setStatus] = useState<LeadStatus>(enquiry.status);
  const [notes, setNotes] = useState<string>(enquiry.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setServerError(null);
    setSaveSuccess(false);

    const res = await updateEnquiry({
      id: enquiry.id,
      status,
      notes,
    });

    if (res.success) {
      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      setServerError(res.error || "Failed to update enquiry.");
    }
    setIsSubmitting(false);
  };

  const detailsObj =
    enquiry.details && typeof enquiry.details === "object" && !Array.isArray(enquiry.details)
      ? enquiry.details
      : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/rera/enquiries"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to All Enquiries
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold text-neutral-900">
            Enquiry from {enquiry.name}
          </h1>
          <span className="text-xs text-neutral-500 font-mono">
            ID: {enquiry.id}
          </span>
        </div>
      </div>

      {serverError && (
        <div className="flex items-start gap-3 p-4 rounded-md border border-red-300 bg-red-50 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">{serverError}</div>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-md border border-green-200 bg-green-50 text-green-800 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>Status and notes updated successfully.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Read-Only Client & Enquiry Overview */}
        <div className="md:col-span-2 space-y-6">
          {/* Client Contact Info Box */}
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-medium text-neutral-500">Name</span>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  {enquiry.name}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500">Phone</span>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="inline-flex items-center gap-1.5 text-neutral-900 hover:text-blue-600 font-mono"
                  >
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    {enquiry.phone}
                  </a>
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500">Email</span>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  {enquiry.email ? (
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="inline-flex items-center gap-1.5 text-neutral-900 hover:text-blue-600"
                    >
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      {enquiry.email}
                    </a>
                  ) : (
                    <span className="text-neutral-400 font-normal">Not provided</span>
                  )}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500">Source</span>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  {SOURCE_NAMES[enquiry.source] || enquiry.source}
                </p>
              </div>
            </div>
          </div>

          {/* Preferences & Requirements */}
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Interest & Requirements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs font-medium text-neutral-500">Interested In</span>
                <p className="font-semibold text-neutral-900 mt-0.5 uppercase">
                  {enquiry.interestedIn}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500">Budget</span>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  {enquiry.budgetLabel || "—"}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-neutral-500">Preferred Locality</span>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  {enquiry.locality || "—"}
                </p>
              </div>
            </div>

            {enquiry.message && (
              <div className="pt-2">
                <span className="text-xs font-medium text-neutral-500">Client Message</span>
                <div className="mt-1 p-3 bg-neutral-50 rounded-md border border-neutral-200 text-sm text-neutral-800 whitespace-pre-wrap">
                  {enquiry.message}
                </div>
              </div>
            )}
          </div>

          {/* Readable Rendering of Details JSON */}
          {detailsObj && Object.keys(detailsObj).length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4">
              <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-600" />
                Additional Submission Details
              </h2>
              <div className="divide-y divide-neutral-100 text-sm">
                {Object.entries(detailsObj).map(([key, val]) => (
                  <div key={key} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-medium text-neutral-500">
                      {formatKey(key)}
                    </span>
                    <span className="font-medium text-neutral-900 text-sm">
                      {typeof val === "object" ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Property Card */}
          {enquiry.property && (
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-3">
              <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-200 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-neutral-600" /> Linked Property
              </h2>
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-neutral-900">
                    {enquiry.property.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {enquiry.property.locality}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-neutral-800">
                      {enquiry.property.priceLabel}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/rera/properties/${enquiry.property.id}/edit`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-100 transition-colors shadow-xs"
                  >
                    Edit Property
                  </Link>
                  <Link
                    href={`/rera/properties/${enquiry.property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-300 rounded-md transition-colors shadow-xs"
                    title="View live listing"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Editable Status & Internal Notes */}
        <div className="space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-white p-6 rounded-lg border border-neutral-200 shadow-xs space-y-4"
          >
            <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-200 pb-2">
              Status & Notes
            </h2>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Pipeline Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 bg-white"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONVERTED">Converted</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Internal Notes
              </label>
              <textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log follow-up calls, client budget discussions, visit slots scheduled, or site visit feedback..."
                className="block w-full rounded-md border border-neutral-300 p-3 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white font-medium text-sm rounded-md hover:bg-neutral-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Saving..." : "Save Status & Notes"}
            </button>
          </form>

          {/* Submission Timestamp Card */}
          <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 space-y-1 font-mono">
            <div className="flex items-center gap-1.5 text-neutral-700 font-semibold">
              <Calendar className="w-3.5 h-3.5" /> Submission History
            </div>
            <p>Created: {new Date(enquiry.createdAt).toLocaleString("en-IN")}</p>
            <p>Updated: {new Date(enquiry.updatedAt).toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

