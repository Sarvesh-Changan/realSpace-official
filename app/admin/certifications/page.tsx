import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CertificationTableClient } from "./_components/CertificationTableClient";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const certifications = await prisma.certification.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const formattedCertifications = certifications.map((cert) => ({
    id: cert.id,
    title: cert.title,
    issuingBody: cert.issuingBody,
    certificateType: cert.certificateType,
    badgeLabel: cert.badgeLabel,
    isPublished: cert.isPublished,
    sortOrder: cert.sortOrder,
  }));

  return <CertificationTableClient certifications={formattedCertifications} />;
}
