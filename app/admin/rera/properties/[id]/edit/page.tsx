import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { PropertyForm } from "../../_components/PropertyForm";
import { updateProperty } from "../../actions";
import { parseReraPropertyAmenityImages, type ReraPropertyInput } from "../../schema";

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
      sections: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

  const publishedCategories = await prisma.reraPropertyCategory.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, isPublished: true },
  });
  const categories = property.categoryId && !publishedCategories.some((category) => category.id === property.categoryId)
    ? [...publishedCategories, ...(await prisma.reraPropertyCategory.findMany({
        where: { id: property.categoryId },
        select: { id: true, name: true, isPublished: true },
      }))]
    : publishedCategories;

  const initialData: ReraPropertyInput = {
    id: property.id,
    title: property.title,
    tagline: property.tagline ?? "",
    slug: property.slug,
    categoryId: property.categoryId ?? "",
    listingType: property.listingType,
    bhkLabel: property.bhkLabel ?? "",
    locality: property.locality,
    city: property.city,
    projectName: property.projectName ?? "",
    builderName: property.builderName ?? "",
    projectReraNo: property.projectReraNo ?? "",
    description: property.description ?? "",
    coverImageUrl: property.coverImageUrl ?? "",
    coverImagePublicId: property.coverImagePublicId ?? "",
    brochureUrl: property.brochureUrl ?? "",
    brochurePublicId: property.brochurePublicId ?? "",
    isFeatured: property.isFeatured,
    isNewLaunch: property.isNewLaunch,
    isPublished: property.isPublished,
    sortOrder: property.sortOrder,
    amenities: property.amenities,
    amenityImages: parseReraPropertyAmenityImages(property.amenityImages),
    images: [],
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
          Update property details, the cover image overview card, page sections, and RERA registration.
        </p>
      </div>

      <PropertyForm categories={categories} initialData={initialData} initialSections={property.sections} onSubmitAction={handleUpdate} />
    </div>
  );
}

