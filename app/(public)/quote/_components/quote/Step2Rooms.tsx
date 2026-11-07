import React from 'react';
import { z } from 'zod';
import { QuoteState, ActiveRoomType } from './types';
import { Minus, Plus, Info } from 'lucide-react';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
  activeRoomTypes?: ActiveRoomType[];
}

const BUSINESS_TYPES = [
  'Retail Shop',
  'Restaurant/Café',
  'Gym/Fitness Studio',
  'Office',
  'Clinic/Healthcare',
  'Salon/Spa',
  'Warehouse',
  'Other',
] as const;

const BUDGET_RANGES = [
  'Not sure yet',
  'Under ₹5L',
  '₹5L–15L',
  '₹15L–30L',
  '₹30L+',
] as const;

const commercialSchema = z.object({
  businessType: z.string().min(1, 'Please select a business/space type'),
  approxAreaSqft: z
    .number({ message: 'Approximate area is required' })
    .positive('Approximate area must be a positive number'),
  description: z.string().trim().min(1, 'Description is required'),
  budgetRangeLabel: z.string().optional(),
});

export default function Step2Rooms({ state, updateState, activeRoomTypes = [] }: Props) {
  const isCommercialFlow =
    (state as any).isCommercialFlow ?? (state.bhkType === 'Commercial & Others');

  if (isCommercialFlow) {
    const businessType = (state as any).businessType || '';
    const rawArea = (state as any).approxAreaSqft;
    const approxAreaSqft =
      rawArea !== undefined && rawArea !== null && rawArea !== '' && !isNaN(Number(rawArea))
        ? Number(rawArea)
        : undefined;
    const description = state.spaceDescription || (state as any).description || '';
    const budgetRangeLabel = (state as any).budgetRangeLabel || '';

    const validationResult = commercialSchema.safeParse({
      businessType,
      approxAreaSqft,
      description,
      budgetRangeLabel,
    });

    const errors: Record<string, string> = {};
    if (!validationResult.success) {
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errors[issue.path[0].toString()] = issue.message;
        }
      });
    }

    const handleFieldChange = (field: string, value: any) => {
      const newBusinessType = field === 'businessType' ? value : businessType;
      const newRawArea = field === 'approxAreaSqft' ? value : rawArea;
      const newApproxAreaSqft =
        newRawArea !== undefined && newRawArea !== null && newRawArea !== '' && !isNaN(Number(newRawArea))
          ? Number(newRawArea)
          : undefined;
      const newDescription = field === 'description' ? value : description;
      const newBudgetRangeLabel = field === 'budgetRangeLabel' ? value : budgetRangeLabel;

      const check = commercialSchema.safeParse({
        businessType: newBusinessType,
        approxAreaSqft: newApproxAreaSqft,
        description: newDescription,
        budgetRangeLabel: newBudgetRangeLabel,
      });

      updateState({
        businessType: newBusinessType,
        approxAreaSqft: newRawArea === '' ? undefined : newApproxAreaSqft,
        description: newDescription,
        spaceDescription: check.success ? newDescription : '',
        budgetRangeLabel: newBudgetRangeLabel,
      } as Partial<QuoteState>);
    };

    return (
      <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">
            Tell us about your commercial space
          </h2>
          <p className="text-sm sm:text-base text-[#6D6A66]">
            Provide details about your property so our design team can prepare a custom qualification and proposal.
          </p>
        </div>

        <div className="space-y-5 bg-white p-5 sm:p-7 border border-[#E8E2DA] rounded-2xl shadow-sm">
          {/* Business / Space Type */}
          <div className="space-y-1.5">
            <label htmlFor="businessType" className="block text-sm font-medium text-[#1C1C1C]">
              Business / Space Type <span className="text-red-500">*</span>
            </label>
            <select
              id="businessType"
              value={businessType}
              onChange={(e) => handleFieldChange('businessType', e.target.value)}
              className="w-full p-3.5 border border-[#E8E2DA] rounded-xl text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A] bg-white cursor-pointer"
            >
              <option value="">Select space type...</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.businessType && businessType !== '' && (
              <p className="text-xs text-red-500 font-medium">{errors.businessType}</p>
            )}
          </div>

          {/* Approximate Area (sq ft) */}
          <div className="space-y-1.5">
            <label htmlFor="approxAreaSqft" className="block text-sm font-medium text-[#1C1C1C]">
              Approximate Area (sq ft) <span className="text-red-500">*</span>
            </label>
            <input
              id="approxAreaSqft"
              type="number"
              min="1"
              value={rawArea ?? ''}
              onChange={(e) => handleFieldChange('approxAreaSqft', e.target.value)}
              placeholder="e.g. 1500"
              className="w-full p-3.5 border border-[#E8E2DA] rounded-xl text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A] bg-white"
            />
            {errors.approxAreaSqft && rawArea !== undefined && rawArea !== '' && (
              <p className="text-xs text-red-500 font-medium">{errors.approxAreaSqft}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-[#1C1C1C]">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Tell us about your space and what you're looking for"
              className="w-full p-3.5 border border-[#E8E2DA] rounded-xl text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A] bg-white resize-y"
            />
            {errors.description && description !== '' && (
              <p className="text-xs text-red-500 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Rough Budget Range (optional) */}
          <div className="space-y-1.5">
            <label htmlFor="budgetRangeLabel" className="block text-sm font-medium text-[#1C1C1C]">
              Rough Budget Range <span className="text-xs text-[#6D6A66] font-normal">(optional)</span>
            </label>
            <select
              id="budgetRangeLabel"
              value={budgetRangeLabel}
              onChange={(e) => handleFieldChange('budgetRangeLabel', e.target.value)}
              className="w-full p-3.5 border border-[#E8E2DA] rounded-xl text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A] bg-white cursor-pointer"
            >
              <option value="">Select budget range...</option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Residential Flow
  const updateRoom = (key: string, increment: number) => {
    const current = state.rooms[key] ?? 0;
    const constraint = state.roomConstraints?.[key];

    const minQty = constraint?.minQty ?? 0;
    const isFixed = constraint?.isFixedFloor ?? false;
    const maxQty = isFixed ? constraint?.defaultQty ?? current : constraint?.maxQty ?? null;

    const next = current + increment;

    if (increment < 0 && next < minQty) return;
    if (increment > 0 && maxQty !== null && next > maxQty) return;

    updateState({
      rooms: { ...state.rooms, [key]: next },
    });
  };

  const displayedRooms =
    activeRoomTypes.length > 0
      ? activeRoomTypes
      : Object.keys(state.rooms).map((k) => ({ key: k, groupKeys: [k], label: k }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">Which spaces need designing?</h2>
        <p className="text-sm sm:text-base text-[#6D6A66]">
          Adjust room counts for your selected property type.
        </p>
      </div>

      {/* Room Steppers */}
      <div className="space-y-3.5 sm:space-y-4 max-w-2xl mx-auto">
        {displayedRooms.map(({ key, label }) => {
          const current = state.rooms[key] ?? 0;
          const constraint = state.roomConstraints?.[key];

          const minQty = constraint?.minQty ?? 0;
          const isFixed = constraint?.isFixedFloor ?? false;
          const maxQty = isFixed ? constraint?.defaultQty ?? current : constraint?.maxQty ?? null;

          const canDecrement = current > minQty;
          const canIncrement = !isFixed && (maxQty === null || current < maxQty);

          return (
            <div
              key={key}
              className="flex items-center justify-between p-3.5 sm:p-4 bg-white border border-[#E8E2DA] rounded-xl gap-3 min-h-[60px]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 flex-1">
                <span className="font-medium text-[#1C1C1C] text-sm sm:text-base">{label}</span>
                {isFixed && (
                  <span className="text-[11px] sm:text-xs text-[#C8A96A] bg-[#C8A96A]/10 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shrink-0">
                    <Info className="w-3 h-3" />
                    fixed
                  </span>
                )}
                {!isFixed && maxQty !== null && (
                  <span className="text-xs text-[#6D6A66] shrink-0">(max {maxQty})</span>
                )}
              </div>

              <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => updateRoom(key, -1)}
                  disabled={!canDecrement}
                  className="w-10 h-10 rounded-full border border-[#E8E2DA] flex items-center justify-center text-[#6D6A66] hover:bg-[#F8F5F1] active:bg-[#E8E2DA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-6 text-center font-medium text-[#1C1C1C] text-base">{current}</span>

                <button
                  type="button"
                  onClick={() => updateRoom(key, 1)}
                  disabled={!canIncrement}
                  className="w-10 h-10 rounded-full border border-[#E8E2DA] flex items-center justify-center text-[#6D6A66] hover:bg-[#F8F5F1] active:bg-[#E8E2DA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


