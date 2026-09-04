'use server';

import { z } from 'zod';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { LeadSource, LeadStatus, PricingTier } from '@prisma/client';
import { sendLeadNotification } from '@/lib/email';

const ROOM_MAP = [
  { key: 'kitchens', groupKeys: ['kitchen'], fallbackLabel: 'Kitchens' },
  { key: 'livingRooms', groupKeys: ['hall', 'living_room'], fallbackLabel: 'Living Rooms' },
  { key: 'bedrooms', groupKeys: ['bedroom'], fallbackLabel: 'Bedrooms' },
  { key: 'bathrooms', groupKeys: ['bathroom'], fallbackLabel: 'Bathrooms' },
];

const COMPONENT_MAPPING = [
  { roomKey: 'kitchens', componentKey: 'kitchen', singular: 'Kitchen', plural: 'Kitchens' },
  { roomKey: 'livingRooms', componentKey: 'living_room', singular: 'Living Room', plural: 'Living Rooms' },
  { roomKey: 'bedrooms', componentKey: 'bedroom', singular: 'Bedroom', plural: 'Bedrooms' },
  { roomKey: 'bathrooms', componentKey: 'bathroom', singular: 'Bathroom', plural: 'Bathrooms' },
];

export async function getActiveRoomTypesAction() {
  try {
    const activeComponentPricings = prisma.componentPricing
      ? await prisma.componentPricing.findMany({
          where: { isActive: true },
          select: { componentKey: true },
        })
      : [];

    const activeKeys = new Set(activeComponentPricings.map((cp) => cp.componentKey));

    const activeRoomTypes = ROOM_MAP.filter((roomDef) =>
      roomDef.groupKeys.some((gk) => activeKeys.has(gk))
    ).map((roomDef) => ({
      key: roomDef.key,
      groupKeys: roomDef.groupKeys,
      label: roomDef.fallbackLabel,
    }));

    return { success: true, activeRoomTypes };
  } catch (error) {
    console.error('Error fetching active room types:', error);
    return { success: false, activeRoomTypes: [] };
  }
}

export async function getBhkRoomDefaultsAction(bhkLabel: string) {
  try {
    const activeComponentPricings = prisma.componentPricing
      ? await prisma.componentPricing.findMany({
          where: { isActive: true },
          select: { componentKey: true },
        })
      : [];

    const activeKeys = new Set(activeComponentPricings.map((cp) => cp.componentKey));

    const activeRoomTypes = ROOM_MAP.filter((roomDef) =>
      roomDef.groupKeys.some((gk) => activeKeys.has(gk))
    ).map((roomDef) => ({
      key: roomDef.key,
      groupKeys: roomDef.groupKeys,
      label: roomDef.fallbackLabel,
    }));

    if (!bhkLabel || bhkLabel === 'Commercial & Others') {
      return { success: true, activeRoomTypes, defaults: [] };
    }

    const bhkOpt = await prisma.pricingOption.findFirst({
      where: { groupKey: 'bhk_type', label: bhkLabel },
    });

    if (!bhkOpt) {
      return { success: true, activeRoomTypes, defaults: [] };
    }

    const defaults = await prisma.bhkRoomDefault.findMany({
      where: { bhkOptionId: bhkOpt.id },
    });

    const filteredDefaults = defaults.filter((d: { roomGroupKey: string }) =>
      activeKeys.has(d.roomGroupKey) || (d.roomGroupKey === 'hall' && activeKeys.has('living_room'))
    );

    return {
      success: true,
      activeRoomTypes,
      defaults: filteredDefaults.map((d: { roomGroupKey: string; defaultQty: number; minQty: number; maxQty: number | null; isFixedFloor: boolean }) => ({
        roomGroupKey: d.roomGroupKey,
        defaultQty: d.defaultQty,
        minQty: d.minQty,
        maxQty: d.maxQty,
        isFixedFloor: d.isFixedFloor,
      })),
    };
  } catch (error) {
    console.error('Error fetching BHK room defaults:', error);
    return { success: false, error: 'Failed to load BHK room defaults' };
  }
}

const quoteSelectionSchema = z.object({
  bhkType: z.string().min(1, 'BHK type is required'),
  isCommercialFlow: z.boolean().optional(),
  businessType: z.string().optional(),
  approxAreaSqft: z.number().optional(),
  description: z.string().optional().or(z.literal('')),
  budgetRangeLabel: z.string().optional().or(z.literal('')),
  rooms: z.record(z.string(), z.number().min(0)).optional().default({}),
  spaceDescription: z.string().optional().or(z.literal('')),
  requirements: z.object({
    interior: z.boolean(),
    exterior: z.boolean(),
  }),
  packageTier: z.string().min(1, 'Package tier is required'),
  contact: z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(5, 'Phone number is required'),
    email: z.string().optional().or(z.literal('')),
    location: z.string().optional().or(z.literal('')),
    requirements: z.string().optional().or(z.literal('')),
    verifiedToken: z.string().optional().or(z.literal('')),
    websiteUrl: z.string().optional(), // Honeypot field
  }),
});

type QuoteSelectionInput = z.infer<typeof quoteSelectionSchema>;

type QuoteActionResult = {
  success: boolean;
  error?: string;
  data?: {
    estimatedBudgetLow: number | null;
    estimatedBudgetHigh: number | null;
    breakdown: Array<{ label: string; amount: number }>;
    leadId?: string;
  };
};

export async function submitQuoteAction(rawInput: unknown): Promise<QuoteActionResult> {
  try {
    // 1. Rate Limiting Check
    const headerList = await headers();
    const ip =
      headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
      headerList.get('x-real-ip') ||
      '127.0.0.1';

    const rateLimitResult = checkRateLimit(ip, 5, 15 * 60 * 1000);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too many requests from this IP. Please try again in a few minutes.',
      };
    }

    // 2. Input Validation
    const validation = quoteSelectionSchema.safeParse(rawInput);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || 'Invalid input data.';
      return {
        success: false,
        error: firstError,
      };
    }

    const input = validation.data;

    // 3. Honeypot check for bot submissions
    if (input.contact.websiteUrl && input.contact.websiteUrl.trim() !== '') {
      return {
        success: true,
        data: {
          estimatedBudgetLow: null,
          estimatedBudgetHigh: null,
          breakdown: [],
        },
      };
    }

    // 4. Verify Email OTP token before lead creation (enforced for all flows)
    const submittedEmail = input.contact.email?.trim().toLowerCase();
    const verifiedToken = input.contact.verifiedToken?.trim();

    if (!submittedEmail || !verifiedToken) {
      return {
        success: false,
        error: 'Email verification is required before submitting your quote request.',
      };
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        email: submittedEmail,
        verifiedToken,
      },
    });

    if (
      !otpRecord ||
      !otpRecord.verified ||
      otpRecord.used ||
      Date.now() > otpRecord.expiresAt.getTime()
    ) {
      return {
        success: false,
        error: 'Invalid, expired, or already used email verification token. Please verify your email before submitting.',
      };
    }

    // 5. Check if payload represents a Commercial & Others flow
    const isCommercial =
      input.isCommercialFlow === true || input.bhkType === 'Commercial & Others';

    if (isCommercial) {
      const spaceDesc = input.description || input.spaceDescription || null;
      const requirementsText = [
        spaceDesc ? `Space Details: ${spaceDesc}` : null,
        input.contact.requirements ? `Notes: ${input.contact.requirements}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      const selections = {
        flowType: 'commercial',
        bhkType: input.bhkType,
        businessType: input.businessType || null,
        approxAreaSqft: input.approxAreaSqft || null,
        description: spaceDesc,
        budgetRangeLabel: input.budgetRangeLabel || null,
      };

      const [lead] = await prisma.$transaction([
        prisma.lead.create({
          data: {
            name: input.contact.name,
            phone: input.contact.phone,
            email: submittedEmail,
            location: input.contact.location && input.contact.location.trim() !== '' ? input.contact.location : null,
            requirements: requirementsText || null,
            source: LeadSource.QUOTE_CALCULATOR,
            selections,
            estimatedBudgetLow: null,
            estimatedBudgetHigh: null,
            status: LeadStatus.NEW,
          },
        }),
        prisma.emailOtp.update({
          where: { id: otpRecord.id },
          data: { used: true },
        }),
      ]);

      try {
        await sendLeadNotification(lead);
      } catch (emailErr) {
        console.error('Failed to send lead notification email for commercial quote submission:', emailErr);
      }

      return {
        success: true,
        data: {
          estimatedBudgetLow: null,
          estimatedBudgetHigh: null,
          breakdown: [],
          leadId: lead.id,
        },
      };
    }

    // 6. Residential Flow: Per-component per-tier pricing via ComponentPricing
    const rawTier = (input.packageTier || 'STANDARD').trim().toUpperCase();
    const selectedTier: PricingTier =
      rawTier.includes('PREMIUM') ? 'PREMIUM' :
      rawTier.includes('LUXURY') ? 'LUXURY' : 'STANDARD';

    const componentPricings = prisma.componentPricing
      ? await prisma.componentPricing.findMany({
          where: {
            tier: selectedTier,
            isActive: true,
          },
        })
      : [];

    let totalBase = 0;
    const breakdown: Array<{ label: string; amount: number }> = [];

    const tierDisplayLabel =
      selectedTier === 'PREMIUM' ? 'Premium' :
      selectedTier === 'LUXURY' ? 'Luxury' : 'Standard';

    // Calculate cost for each of the 4 room components
    for (const comp of COMPONENT_MAPPING) {
      const qty = input.rooms[comp.roomKey] || 0;
      if (qty > 0) {
        const pricing = componentPricings.find((p) => p.componentKey === comp.componentKey);
        if (pricing) {
          const unitPrice = Number(pricing.pricePerUnit);
          const lineTotal = qty * unitPrice;
          totalBase += lineTotal;

          const labelName = qty === 1 ? comp.singular : comp.plural;
          breakdown.push({
            label: `${qty} ${labelName} (${tierDisplayLabel})`,
            amount: lineTotal,
          });
        }
      }
    }

    // Calculate low and high range estimates
    const estimatedBudgetLow = Math.round(totalBase * 0.9);
    const estimatedBudgetHigh = Math.round(totalBase * 1.15);

    const requirementsText = [
      input.spaceDescription ? `Space Details: ${input.spaceDescription}` : null,
      input.contact.requirements ? `Notes: ${input.contact.requirements}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    // Create Lead row and mark EmailOtp token as used in a single database transaction
    const [lead] = await prisma.$transaction([
      prisma.lead.create({
        data: {
          name: input.contact.name,
          phone: input.contact.phone,
          email: submittedEmail,
          location: input.contact.location && input.contact.location.trim() !== '' ? input.contact.location : null,
          requirements: requirementsText || null,
          source: LeadSource.QUOTE_CALCULATOR,
          selections: {
            bhkType: input.bhkType,
            rooms: input.rooms,
            spaceDescription: input.spaceDescription,
            requirements: input.requirements,
            packageTier: input.packageTier,
            breakdown,
          },
          estimatedBudgetLow,
          estimatedBudgetHigh,
          status: LeadStatus.NEW,
        },
      }),
      prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { used: true },
      }),
    ]);

    // Send lead notification email to admin (non-blocking)
    try {
      await sendLeadNotification(lead);
    } catch (emailErr) {
      console.error('Failed to send lead notification email for quote submission:', emailErr);
    }

    return {
      success: true,
      data: {
        estimatedBudgetLow,
        estimatedBudgetHigh,
        breakdown,
        leadId: lead.id,
      },
    };
  } catch (error) {
    console.error('Error submitting quote action:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while processing your quote request. Please try again.',
    };
  }
}

