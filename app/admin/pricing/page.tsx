import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PricingConfigTableWrapper } from "./_components/PricingTableClient";

export default async function AdminPricingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const rawOptions = await prisma.pricingOption.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const options = rawOptions.map((opt) => ({
    id: opt.id,
    groupKey: opt.groupKey,
    label: opt.label,
    basePrice: Number(opt.basePrice),
    perUnitPrice: opt.perUnitPrice ? Number(opt.perUnitPrice) : null,
    isActive: opt.isActive,
    sortOrder: opt.sortOrder,
  }));

  return (
    <div className="space-y-6">
      <PricingConfigTableWrapper options={options} />
    </div>
  );
}

