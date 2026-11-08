import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BulkUploadForm } from "../_components/BulkUploadForm";

export const dynamic = "force-dynamic";

export default async function NewReraGalleryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/gallery"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Gallery
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Bulk Upload Gallery Media
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Upload multiple project photos and walkthrough videos at once with shared metadata.
        </p>
      </div>

      <BulkUploadForm />
    </div>
  );
}

