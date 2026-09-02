"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bhkRoomDefaultsSchema, componentPricingMatrixSchema } from "./schema";

export async function upsertBhkRoomDefaults(
  bhkOptionId: string,
  items: Array<{
    roomGroupKey: string;
    defaultQty: number;
    minQty: number;
    maxQty?: number | null;
    isFixedFloor: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = bhkRoomDefaultsSchema.safeParse({ bhkOptionId, items });
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid BHK room defaults data." };
  }

  const payload = parsed.data;

  try {
    await prisma.$transaction(
      payload.items.map((item) =>
        prisma.bhkRoomDefault.upsert({
          where: {
            bhkOptionId_roomGroupKey: {
              bhkOptionId: payload.bhkOptionId,
              roomGroupKey: item.roomGroupKey,
            },
          },
          create: {
            bhkOptionId: payload.bhkOptionId,
            roomGroupKey: item.roomGroupKey,
            defaultQty: item.defaultQty,
            minQty: item.minQty,
            maxQty: item.maxQty ?? null,
            isFixedFloor: item.isFixedFloor,
          },
          update: {
            defaultQty: item.defaultQty,
            minQty: item.minQty,
            maxQty: item.maxQty ?? null,
            isFixedFloor: item.isFixedFloor,
          },
        })
      )
    );

    revalidatePath("/admin/pricing");
    revalidatePath("/quote");
    return { success: true };
  } catch (error) {
    console.error("Failed to upsert BHK room defaults:", error);
    return { success: false, error: "Failed to save BHK room defaults." };
  }
}

export async function updateComponentPricingMatrix(
  items: Array<{
    componentKey: "kitchen" | "living_room" | "bedroom" | "bathroom";
    tier: "STANDARD" | "PREMIUM" | "LUXURY";
    pricePerUnit: number;
    isActive: boolean;
  }>
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = componentPricingMatrixSchema.safeParse({ items });
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid pricing matrix data." };
  }

  const validatedItems = parsed.data.items;

  try {
    await Promise.all(
      validatedItems.map((item) =>
        prisma.componentPricing.upsert({
          where: {
            componentKey_tier: {
              componentKey: item.componentKey,
              tier: item.tier,
            },
          },
          create: {
            componentKey: item.componentKey,
            tier: item.tier,
            pricePerUnit: item.pricePerUnit,
            isActive: item.isActive,
          },
          update: {
            pricePerUnit: item.pricePerUnit,
            isActive: item.isActive,
          },
        })
      )
    );

    revalidatePath("/admin/pricing");
    revalidatePath("/quote");
    return { success: true };
  } catch (error) {
    console.error("Failed to update component pricing matrix:", error);
    return { success: false, error: "Failed to update component pricing matrix in database." };
  }
}


