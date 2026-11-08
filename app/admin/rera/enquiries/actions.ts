"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  updateEnquirySchema,
  updateEnquiryStatusSchema,
  type UpdateEnquiryInput,
} from "./schema";
import type { LeadStatus } from "@prisma/client";

export async function updateEnquiryStatus(
  id: string,
  status: LeadStatus
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = updateEnquiryStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid status.",
    };
  }

  try {
    await prisma.reraEnquiry.update({
      where: { id: parsed.data.id },
      data: { status: parsed.data.status },
    });

    revalidatePath("/admin/rera/enquiries");
    revalidatePath(`/admin/rera/enquiries/${id}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to update enquiry status:", error);
    return { success: false, error: "Failed to update enquiry status." };
  }
}

export async function updateEnquiry(
  data: UpdateEnquiryInput
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = updateEnquirySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid enquiry update data.",
    };
  }

  try {
    await prisma.reraEnquiry.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        notes: parsed.data.notes ?? null,
      },
    });

    revalidatePath("/admin/rera/enquiries");
    revalidatePath(`/admin/rera/enquiries/${parsed.data.id}`);
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("Failed to update enquiry:", error);
    return { success: false, error: "Failed to update enquiry in database." };
  }
}

