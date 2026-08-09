import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ServiceFormClient } from "../_components/ServiceFormClient";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/services"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Services
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Service</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update service details for &quot;{service.title}&quot;.
        </p>
      </div>

      <ServiceFormClient
        mode="update"
        serviceId={service.id}
        initialData={{
          title: service.title,
          slug: service.slug,
          designType: service.designType,
          description: service.description,
          iconKey: service.iconKey || "",
          sortOrder: service.sortOrder,
          isPublished: service.isPublished,
        }}
      />
    </div>
  );
}
