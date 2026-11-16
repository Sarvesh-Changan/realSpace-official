import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PartnerForm } from "../../_components/PartnerForm";
import { updatePartner } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditReraPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  const partner = await prisma.reraBuilderPartner.findUnique({ where: { id } });
  if (!partner) notFound();
  const initialData = {
    name: partner.name,
    description: partner.description ?? "",
    logoUrl: partner.logoUrl,
    logoPublicId: partner.logoPublicId ?? "",
    sortOrder: partner.sortOrder,
    isPublished: partner.isPublished,
  };
  return <div className="space-y-5"><div><Link href="/admin/rera/partners" className="mb-2 inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900"><ArrowLeft className="mr-1 h-4 w-4" />Back to Partners</Link><h1 className="text-2xl font-bold text-neutral-900">Edit Partner</h1><p className="mt-1 text-sm text-neutral-500">Update {partner.name} details.</p></div><PartnerForm initialData={initialData} onSubmitAction={updatePartner.bind(null, partner.id)} /></div>;
}
