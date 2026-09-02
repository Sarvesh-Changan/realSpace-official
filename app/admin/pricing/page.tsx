import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PricingTabsClient } from "./_components/PricingTabsClient";

export default async function AdminPricingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [rawOptions, rawBhkOptions, rawDefaults, rawComponentPricing] = await Promise.all([
    prisma.pricingOption.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.pricingOption.findMany({
      where: { groupKey: "bhk_type" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.bhkRoomDefault.findMany(),
    prisma.componentPricing.findMany(),
  ]);

  const options = rawOptions.map((opt: any) => ({
    id: opt.id,
    groupKey: opt.groupKey,
    label: opt.label,
    basePrice: Number(opt.basePrice),
    perUnitPrice: opt.perUnitPrice ? Number(opt.perUnitPrice) : null,
    isActive: opt.isActive,
    sortOrder: opt.sortOrder,
  }));

  const bhkOptions = rawBhkOptions.map((bhk: any) => ({
    id: bhk.id,
    label: bhk.label,
  }));

  const initialDefaults = rawDefaults.map((d: any) => ({
    id: d.id,
    bhkOptionId: d.bhkOptionId,
    roomGroupKey: d.roomGroupKey,
    defaultQty: d.defaultQty,
    minQty: d.minQty,
    maxQty: d.maxQty,
    isFixedFloor: d.isFixedFloor,
  }));

  const componentPricing = rawComponentPricing.map((cp: any) => ({
    id: cp.id,
    componentKey: cp.componentKey,
    tier: cp.tier,
    pricePerUnit: Number(cp.pricePerUnit),
    isActive: cp.isActive,
  }));

  return (
    <div className="space-y-6">
      <PricingTabsClient
        options={options}
        bhkOptions={bhkOptions}
        initialDefaults={initialDefaults}
        componentPricing={componentPricing}
      />
    </div>
  );
}

