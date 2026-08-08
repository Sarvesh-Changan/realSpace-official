"use server";

import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { contactFormSchema } from "./schema";

export async function submitContactForm(data: unknown) {
  // 1. Zod input validation
  const parsed = contactFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid form fields",
    };
  }

  const { fullName, phone, email, service, message, honeypot } = parsed.data;

  // 2. Honeypot check for spam bots
  if (honeypot && honeypot.length > 0) {
    // Silent success for bots
    return { success: true };
  }

  // 3. Rate limiting check (max 5 submissions per 15 min per IP)
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  const rateCheck = checkRateLimit(`contact_${ip}`, 5, 15 * 60 * 1000);
  if (!rateCheck.allowed) {
    const minutesLeft = Math.ceil(
      (rateCheck.resetTime - Date.now()) / (60 * 1000)
    );
    return {
      success: false,
      error: `Too many submissions. Please try again after ${minutesLeft} minute(s).`,
    };
  }

  try {
    // 4. Create Lead in Prisma
    await prisma.lead.create({
      data: {
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        requirements: `[Service Interested: ${service}]\n${message.trim()}`,
        source: "CONTACT_FORM",
        status: "NEW",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating Lead for contact form:", error);
    return {
      success: false,
      error: "Unable to save your message right now. Please try again shortly.",
    };
  }
}
