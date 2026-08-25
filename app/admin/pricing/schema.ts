import { z } from "zod";

export const pricingOptionSchema = z.object({
  groupKey: z.string().min(1, "Group key is required").refine((val) => val !== "addon", { message: "Additional Services ('addon') are no longer supported." }),
  label: z.string().min(1, "Label is required"),
  designType: z.enum(["INTERIOR", "EXTERIOR"]).optional().nullable(),
  basePrice: z.coerce.number().min(0, "Must be positive"),
  perUnitPrice: z.coerce.number().optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

export const bhkRoomDefaultItemSchema = z.object({
  roomGroupKey: z.string().min(1, "roomGroupKey is required"),
  defaultQty: z.number().int().min(0, "defaultQty must be non-negative"),
  minQty: z.number().int().min(0, "minQty must be non-negative"),
  maxQty: z.number().int().min(0).optional().nullable(),
  isFixedFloor: z.boolean().default(false),
});

export const bhkRoomDefaultsSchema = z.object({
  bhkOptionId: z.string().min(1, "bhkOptionId is required"),
  items: z.array(bhkRoomDefaultItemSchema),
});

export type BhkRoomDefaultsInput = z.infer<typeof bhkRoomDefaultsSchema>;
