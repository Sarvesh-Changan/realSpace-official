import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PricingTabsClient } from "./_components/PricingTabsClient";

export default async function AdminPricingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [rawBhkOptions, rawDefaults, rawComponentPricing] = await Promise.all([
    prisma.pricingOption.findMany({
      where: { groupKey: "bhk_type" },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.bhkRoomDefault.findMany(),
    prisma.componentPricing ? prisma.componentPricing.findMany() : Promise.resolve([]),
  ]);

  const bhkOptions = rawBhkOptions
    .filter((bhk: any) => bhk.label !== "Commercial & Others")
    .map((bhk: any) => ({
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
        bhkOptions={bhkOptions}
        initialDefaults={initialDefaults}
        componentPricing={componentPricing}
      />
    </div>
  );
}

