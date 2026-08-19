import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CertificationForm } from "../_components/CertificationForm";

interface EditCertificationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCertificationPage({ params }: EditCertificationPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const cert = await prisma.certification.findUnique({
    where: { id },
  });

  if (!cert) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/certifications"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Certifications
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Certification</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update certification details for &quot;{cert.title}&quot;.
        </p>
      </div>

      <CertificationForm
        mode="update"
        certId={cert.id}
        initialData={{
          title: cert.title,
          issuingBody: cert.issuingBody,
          certificateType: cert.certificateType,
          issueDate: cert.issueDate ? cert.issueDate.toISOString().split("T")[0] : "",
          validUntil: cert.validUntil ? cert.validUntil.toISOString().split("T")[0] : "",
          badgeLabel: cert.badgeLabel,
          imageUrl: cert.imageUrl || "",
          isPublished: cert.isPublished,
          sortOrder: cert.sortOrder,
        }}
      />
    </div>
  );
}
