"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LeadStatus } from "@prisma/client";

const updateLeadStatusSchema = z.object({
  id: z.string().min(1, "Lead ID is required"),
  status: z.nativeEnum(LeadStatus),
});

const updateLeadNotesSchema = z.object({
  id: z.string().min(1, "Lead ID is required"),
  notes: z.string().nullable().optional(),
});

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = updateLeadStatusSchema.safeParse({ id, status });
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid lead status data." };
  }

  try {
    await prisma.lead.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
      },
    });

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return { success: false, error: "Failed to update lead status in database." };
  }
}

export async function updateLeadNotes(id: string, notes: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized: Admin session required." };
  }

  const parsed = updateLeadNotesSchema.safeParse({ id, notes });
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { success: false, error: errorMsg || "Invalid lead notes data." };
  }

  try {
    await prisma.lead.update({
      where: { id: parsed.data.id },
      data: {
        notes: parsed.data.notes ?? null,
      },
    });

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead notes:", error);
    return { success: false, error: "Failed to update lead notes in database." };
  }
}
