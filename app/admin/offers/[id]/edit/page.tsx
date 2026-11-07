import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { OfferForm } from "../../_components/OfferForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOfferPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id },
  });

  if (!offer) {
    notFound();
  }

  const initialData = {
    title: offer.title || "",
    description: offer.description,
    imageUrl: offer.imageUrl || "",
    imagePublicId: offer.imagePublicId || "",
    ctaLabel: offer.ctaLabel,
    ctaLink: offer.ctaLink,
    isActive: offer.isActive,
    showOnHome: offer.showOnHome ?? false,
    startDate: offer.startDate ? offer.startDate.toISOString().split("T")[0] : "",
    endDate: offer.endDate ? offer.endDate.toISOString().split("T")[0] : "",
    sortOrder: offer.sortOrder,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/offers"
          className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Offers
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Edit Offer</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Update promotional details and active dates.
        </p>
      </div>

      <OfferForm mode="update" offerId={offer.id} initialData={initialData} />
    </div>
  );
}
