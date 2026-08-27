import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OfferTableClient, type OfferData } from "./_components/OfferTableClient";

export const revalidate = 0;

export default async function AdminOffersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const offers = await prisma.offer.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const formattedOffers: OfferData[] = offers.map((offer) => ({
    id: offer.id,
    title: offer.title,
    description: offer.description,
    ctaLabel: offer.ctaLabel,
    ctaLink: offer.ctaLink,
    startDate: offer.startDate ? offer.startDate.toISOString() : null,
    endDate: offer.endDate ? offer.endDate.toISOString() : null,
    isActive: offer.isActive,
    sortOrder: offer.sortOrder,
  }));

  return <OfferTableClient offers={formattedOffers} />;
}
