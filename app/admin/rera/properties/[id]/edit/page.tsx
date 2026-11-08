import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PropertyForm } from "../../_components/PropertyForm";
import { updateProperty } from "../../actions";
import type {
  ReraPropertyInput,
  PropertySpecificationInput,
} from "../../schema";

export const dynamic = "force-dynamic";

export default async function EditReraPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const property = await prisma.reraProperty.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const specifications: PropertySpecificationInput[] = Array.isArray(
    property.specifications
  )
    ? (property.specifications as unknown as PropertySpecificationInput[])
    : [];

  const initialData: ReraPropertyInput = {
    id: property.id,
    title: property.title,
    slug: property.slug,
    listingType: property.listingType,
    propertyType: property.propertyType,
    bhkLabel: property.bhkLabel ?? "",
    priceLabel: property.priceLabel,
    priceAmount: property.priceAmount ?? null,
    carpetAreaSqFt: property.carpetAreaSqFt ?? null,
    builtUpAreaSqFt: property.builtUpAreaSqFt ?? null,
    furnishing: property.furnishing ?? "",
    locality: property.locality,
    city: property.city,
    projectName: property.projectName ?? "",
    builderName: property.builderName ?? "",
    projectReraNo: property.projectReraNo ?? "",
    possession: property.possession ?? "",
    description: property.description ?? "",
    coverImageUrl: property.coverImageUrl ?? "",
    coverImagePublicId: property.coverImagePublicId ?? "",
    isFeatured: property.isFeatured,
    isNewLaunch: property.isNewLaunch,
    isPublished: property.isPublished,
    sortOrder: property.sortOrder,
    amenities: property.amenities,
    specifications,
    images: property.images.map((img) => ({
      id: img.id,
      url: img.url,
      publicId: img.publicId,
      mediaType: img.mediaType,
      altText: img.altText,
      sortOrder: img.sortOrder,
    })),
  };

  const handleUpdate = async (data: ReraPropertyInput) => {
    "use server";
    return updateProperty(id, data);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/rera/properties"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          Edit Property: {property.title}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update property specifications, pricing, gallery media, and RERA registration.
        </p>
      </div>

      <PropertyForm initialData={initialData} onSubmitAction={handleUpdate} />
    </div>
  );
}

