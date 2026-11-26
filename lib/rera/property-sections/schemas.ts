import { z } from 'zod';

const plainText = (max: number) => z.string().trim().max(max);

export const assetSchema = z.object({
  url: z.string().trim().url().refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'res.cloudinary.com';
    } catch {
      return false;
    }
  }, 'Image URL must be an HTTPS res.cloudinary.com URL'),
  publicId: z.string().trim().min(1),
  alt: z.string().trim().min(1).max(200),
});

const linesSchema = z.array(plainText(200)).max(30);

export const infoCardsDataSchema = z.object({
  cards: z.array(z.object({
    title: plainText(80),
    lines: linesSchema,
    body: plainText(1000).optional(),
    image: assetSchema.optional(),
  })).min(1).max(6),
});

export const phaseCardsDataSchema = z.object({
  subtitle: plainText(120).optional(),
  cards: z.array(z.object({
    title: plainText(80),
    subtitle: plainText(120).optional(),
    lines: linesSchema,
    image: assetSchema.optional(),
  })).min(1).max(8),
});

export const unitTypesDataSchema = z.object({
  units: z.array(z.object({
    title: plainText(80),
    planImages: z.array(assetSchema).max(2),
    fields: z.array(z.object({
      label: plainText(40),
      value: plainText(120),
    })).max(10),
  })).min(1).max(30),
});

const safeHrefSchema = z.string().trim().refine((value) => {
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}, 'Link must be an HTTPS URL or an internal path');

export const textBlockDataSchema = z.object({
  subtitle: plainText(120).optional(),
  body: plainText(5000),
  align: z.enum(['left', 'center']),
  cta: z.object({ label: plainText(40), href: safeHrefSchema }).optional(),
});

export const reraPropertySectionSchema = z.discriminatedUnion('type', [
  z.object({
    id: z.string().optional(),
    type: z.literal('INFO_CARDS'),
    title: z.string().trim().max(120).nullable().optional(),
    data: infoCardsDataSchema,
    sortOrder: z.number().int().optional(),
    isPublished: z.boolean().optional(),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal('PHASE_CARDS'),
    title: z.string().trim().max(120).nullable().optional(),
    data: phaseCardsDataSchema,
    sortOrder: z.number().int().optional(),
    isPublished: z.boolean().optional(),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal('UNIT_TYPES'),
    title: z.string().trim().max(120).nullable().optional(),
    data: unitTypesDataSchema,
    sortOrder: z.number().int().optional(),
    isPublished: z.boolean().optional(),
  }),
  z.object({
    id: z.string().optional(),
    type: z.literal('TEXT_BLOCK'),
    title: z.string().trim().max(120).nullable().optional(),
    data: textBlockDataSchema,
    sortOrder: z.number().int().optional(),
    isPublished: z.boolean().optional(),
  }),
]);

export type Asset = z.infer<typeof assetSchema>;
export type InfoCardsData = z.infer<typeof infoCardsDataSchema>;
export type PhaseCardsData = z.infer<typeof phaseCardsDataSchema>;
export type UnitTypesData = z.infer<typeof unitTypesDataSchema>;
export type TextBlockData = z.infer<typeof textBlockDataSchema>;
export type ReraPropertySectionData = z.infer<typeof reraPropertySectionSchema>;
