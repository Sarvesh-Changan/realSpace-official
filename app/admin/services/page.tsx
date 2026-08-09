import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ServiceTableWrapper } from "./_components/ServiceTableClient";

export default async function AdminServicesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const services = await prisma.service.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <ServiceTableWrapper services={services} />
    </div>
  );
}

