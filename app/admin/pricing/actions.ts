"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { PricingConfigFormValues } from "./_components/PricingOptionForm";
import { pricingOptionSchema, bhkRoomDefaultsSchema } from "./schema";

export async function createPricingOption(data: PricingConfigFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = pricingOptionSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid pricing option data." };
  }

  const optionData = parsed.data;

  try {
    const option = await prisma.pricingOption.create({
      data: {
        groupKey: optionData.groupKey,
        label: optionData.label,
        designType: optionData.designType || null,
        basePrice: optionData.basePrice,
        perUnitPrice: optionData.perUnitPrice ?? null,
        isActive: optionData.isActive,
        sortOrder: optionData.sortOrder,
      },
    });

    revalidatePath("/admin/pricing");
    revalidatePath("/quote");
    return { success: true, id: option.id };
  } catch (error) {
    console.error("Failed to create pricing option:", error);
    return { success: false, error: "Failed to create pricing option in database." };
  }
}

export async function updatePricingOption(id: string, data: PricingConfigFormValues) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = pricingOptionSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid pricing option data." };
  }

  const optionData = parsed.data;

  try {
    await prisma.pricingOption.update({
      where: { id },
      data: {
        groupKey: optionData.groupKey,
        label: optionData.label,
        designType: optionData.designType || null,
        basePrice: optionData.basePrice,
        perUnitPrice: optionData.perUnitPrice ?? null,
        isActive: optionData.isActive,
        sortOrder: optionData.sortOrder,
      },
    });

    revalidatePath("/admin/pricing");
    revalidatePath(`/admin/pricing/${id}`);
    revalidatePath("/quote");
    return { success: true };
  } catch (error) {
    console.error("Failed to update pricing option:", error);
    return { success: false, error: "Failed to update pricing option in database." };
  }
}

export async function deletePricingOption(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.pricingOption.delete({
      where: { id },
    });

    revalidatePath("/admin/pricing");
    revalidatePath("/quote");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete pricing option:", error);
    return { success: false, error: "Failed to delete pricing option." };
  }
}

export async function togglePricingOptionActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  try {
    await prisma.pricingOption.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath("/admin/pricing");
    revalidatePath("/quote");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle pricing option active:", error);
    return { success: false, error: "Failed to update active state." };
  }
}

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
