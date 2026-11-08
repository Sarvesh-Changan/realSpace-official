import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  EnquiryDetailClient,
  type EnquiryDetailData,
} from "../_components/EnquiryDetailClient";

export const dynamic = "force-dynamic";

export default async function AdminReraEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const rawEnquiry = await prisma.reraEnquiry.findUnique({
    where: { id },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          slug: true,
          locality: true,
          priceLabel: true,
        },
      },
    },
  });

  if (!rawEnquiry) {
    notFound();
  }

  const enquiry: EnquiryDetailData = {
    id: rawEnquiry.id,
    name: rawEnquiry.name,
    phone: rawEnquiry.phone,
    email: rawEnquiry.email,
    interestedIn: rawEnquiry.interestedIn,
    budgetLabel: rawEnquiry.budgetLabel,
    locality: rawEnquiry.locality,
    message: rawEnquiry.message,
    source: rawEnquiry.source,
    property: rawEnquiry.property,
    status: rawEnquiry.status,
    notes: rawEnquiry.notes,
    details: rawEnquiry.details as Record<string, unknown> | null,
    createdAt: rawEnquiry.createdAt,
    updatedAt: rawEnquiry.updatedAt,
  };

  return <EnquiryDetailClient enquiry={enquiry} />;
}

