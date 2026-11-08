import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  EnquiryTableClient,
  type EnquiryRow,
} from "./_components/EnquiryTableClient";

export const dynamic = "force-dynamic";

export default async function AdminReraEnquiriesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const rawEnquiries = await prisma.reraEnquiry.findMany({
    include: {
      property: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enquiries: EnquiryRow[] = rawEnquiries.map((e) => ({
    id: e.id,
    name: e.name,
    phone: e.phone,
    email: e.email,
    interestedIn: e.interestedIn,
    budgetLabel: e.budgetLabel,
    locality: e.locality,
    message: e.message,
    source: e.source,
    property: e.property,
    status: e.status,
    notes: e.notes,
    createdAt: e.createdAt,
  }));

  return (
    <div className="space-y-6">
      <EnquiryTableClient enquiries={enquiries} />
    </div>
  );
}
