'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendReraEnquiryNotification } from '@/lib/email';
import { ReraInterest, ReraEnquirySource, Prisma } from '@prisma/client';

const reraEnquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be between 2 and 80 characters' })
    .max(80, { message: 'Name must be between 2 and 80 characters' }),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => {
        // Digits, spaces, +, -, (, ) allowed, must contain 8–15 digits
        if (!/^[\d\s+()-]+$/.test(val)) return false;
        const digits = val.replace(/\D/g, '');
        return digits.length >= 8 && digits.length <= 15;
      },
      { message: 'Phone must contain 8 to 15 digits' }
    ),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address' })
    .optional()
    .or(z.literal('')),
  interestedIn: z
    .enum(['BUY', 'SELL', 'RENT', 'OTHER'])
    .default('BUY'),
  budgetLabel: z.string().trim().max(100).optional().or(z.literal('')),
  locality: z.string().trim().max(100).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .max(1000, { message: 'Message cannot exceed 1000 characters' })
    .optional()
    .or(z.literal('')),
  propertySlug: z.string().trim().max(200).optional().or(z.literal('')),
  source: z
    .enum([
      'CONTACT_FORM',
      'CALLBACK',
      'PROPERTY_ENQUIRY',
      'POST_PROPERTY',
      'SITE_VISIT',
    ])
    .default('CONTACT_FORM'),
  details: z.record(z.string(), z.string().max(500)).optional(),
  honeypot: z.string().optional(),
});

export type SubmitReraEnquiryInput = z.infer<typeof reraEnquirySchema>;

export interface SubmitReraEnquiryResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function submitReraEnquiry(
  rawInput: unknown
): Promise<SubmitReraEnquiryResult> {
  try {
    // 1. Honeypot check: bot-detection (if non-empty, silently return success without saving)
    if (typeof rawInput === 'object' && rawInput !== null) {
      const hp = (rawInput as Record<string, unknown>).honeypot;
      if (hp && typeof hp === 'string' && hp.trim().length > 0) {
        return { success: true };
      }
    }

    // 2. Per-IP Rate Limiting (5 attempts per 15 minutes)
    const headerList = await headers();
    const ip =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rateLimit = checkRateLimit(`rera_enquiry_${ip}`, 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: 'Too many submissions. Please try again in a few minutes.',
      };
    }

    // 3. Zod validation
    const parsed = reraEnquirySchema.safeParse(rawInput);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      return {
        success: false,
        error: 'Please correct the highlighted fields and try again.',
        fieldErrors: flattened.fieldErrors,
      };
    }

    const data = parsed.data;

    // Double-check honeypot inside parsed data
    if (data.honeypot && data.honeypot.trim().length > 0) {
      return { success: true };
    }

    // 4. Link property by slug if valid and published (ignore unknown slugs)
    let propertyId: string | null = null;
    let linkedPropertyTitle: string | null = null;
    if (data.propertySlug && data.propertySlug.trim() !== '') {
      const property = await prisma.reraProperty.findUnique({
        where: { slug: data.propertySlug.trim() },
        select: { id: true, title: true, isPublished: true },
      });
      if (property && property.isPublished) {
        propertyId = property.id;
        linkedPropertyTitle = property.title;
      }
    }

    // 5. Create ReraEnquiry row in database
    const enquiry = await prisma.reraEnquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email && data.email.trim() !== '' ? data.email.trim() : null,
        interestedIn: data.interestedIn as ReraInterest,
        budgetLabel: data.budgetLabel && data.budgetLabel.trim() !== '' ? data.budgetLabel.trim() : null,
        locality: data.locality && data.locality.trim() !== '' ? data.locality.trim() : null,
        message: data.message && data.message.trim() !== '' ? data.message.trim() : null,
        source: data.source as ReraEnquirySource,
        propertyId,
        details:
          data.details && Object.keys(data.details).length > 0
            ? (data.details as Prisma.InputJsonValue)
            : undefined,
      },
    });

    // 6. Send email notification in try/catch (email failure never loses the enquiry)
    try {
      await sendReraEnquiryNotification({
        name: enquiry.name,
        phone: enquiry.phone,
        email: enquiry.email,
        interestedIn: enquiry.interestedIn,
        budgetLabel: enquiry.budgetLabel,
        locality: enquiry.locality,
        message: enquiry.message,
        source: enquiry.source,
        propertyTitle: linkedPropertyTitle,
        details: data.details,
        createdAt: enquiry.createdAt,
      });
    } catch {
      // Intentionally omit personal data when logging
      console.error('Failed to dispatch RERA notification email');
    }

    return { success: true };
  } catch (error) {
    // Never log submitted personal data
    console.error('RERA enquiry submission error:', error instanceof Error ? error.message : 'Unknown error');
    return {
      success: false,
      error: 'Unable to submit your request at this time. Please try again or contact us directly.',
    };
  }
}

