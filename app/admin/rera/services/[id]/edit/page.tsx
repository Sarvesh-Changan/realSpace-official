import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ServiceForm } from "../../_components/ServiceForm";
import { updateService } from "../../actions";
import type { ReraServiceInput } from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditReraServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const service = await prisma.reraService.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  const initialData: ReraServiceInput = {
    id: service.id,
    title: service.title,
    description: service.description,
    iconKey: service.iconKey ?? "building2",
    highlights: service.highlights,
    sortOrder: service.sortOrder,
    isPublished: service.isPublished,
    slug: service.slug ?? "",
    shortDescription: service.shortDescription ?? "",
    pageHeading: service.pageHeading ?? "",
    bannerImageUrl: service.bannerImageUrl ?? "",
    bannerImagePublicId: service.bannerImagePublicId ?? "",
    bannerImageAlt: service.bannerImageAlt ?? "",
    contentImages: Array.isArray(service.contentImages) ? service.contentImages as ReraServiceInput["contentImages"] : [],
    sections: Array.isArray(service.sections) ? service.sections as ReraServiceInput["sections"] : [],
    ctaText: service.ctaText ?? "Contact Us",
    ctaUrl: service.ctaUrl ?? "/contact",
  };

  const handleUpdate = async (data: ReraServiceInput) => {
    "use server";
    return updateService(id, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/services"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Services
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Edit Service: {service.title}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update service offerings, icon, deliverables, and publication status.
        </p>
      </div>

      <ServiceForm initialData={initialData} onSubmitAction={handleUpdate} />
    </div>
  );
}

