import React from 'react';
import { QuoteState } from './types';
import { Minus, Plus, Info } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
}

const ROOM_TYPES = [
  { key: 'kitchens', label: 'Kitchens' },
  { key: 'livingRooms', label: 'Living Rooms / Halls' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'wardrobes', label: 'Wardrobes' },
] as const;

export default function Step2Rooms({ state, updateState }: Props) {
  const isCommercial = state.bhkType === 'Commercial & Others';

  const updateRoom = (key: keyof QuoteState['rooms'], increment: number) => {
    const current = state.rooms[key];
    const constraint = state.roomConstraints?.[key];

    const minQty = isCommercial ? 0 : constraint?.minQty ?? 0;
    const isFixed = isCommercial ? false : constraint?.isFixedFloor ?? false;
    const maxQty = isCommercial
      ? null
      : isFixed
      ? constraint?.defaultQty ?? current
      : constraint?.maxQty ?? null;

    const next = current + increment;

    if (increment < 0 && next < minQty) return;
    if (increment > 0 && maxQty !== null && next > maxQty) return;

    updateState({
      rooms: { ...state.rooms, [key]: next },
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">Which spaces need designing?</h2>
        <p className="text-[#6D6A66]">
          {isCommercial
            ? 'Configure room counts manually and describe your commercial space requirements below.'
            : 'Adjust room counts for your selected property type.'}
        </p>
      </div>

      {/* Room Steppers */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {ROOM_TYPES.map(({ key, label }) => {
          const current = state.rooms[key];
          const constraint = state.roomConstraints?.[key];

          const minQty = isCommercial ? 0 : constraint?.minQty ?? 0;
          const isFixed = isCommercial ? false : constraint?.isFixedFloor ?? false;
          const maxQty = isCommercial
            ? null
            : isFixed
            ? constraint?.defaultQty ?? current
            : constraint?.maxQty ?? null;

          const canDecrement = current > minQty;
          const canIncrement = !isFixed && (maxQty === null || current < maxQty);

          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-[#E8E2DA] rounded-xl gap-3"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-[#1C1C1C]">{label}</span>
                {!isCommercial && isFixed && (
                  <span className="text-xs text-[#C8A96A] bg-[#C8A96A]/10 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    fixed by BHK selection
                  </span>
                )}
                {!isCommercial && !isFixed && maxQty !== null && (
                  <span className="text-xs text-[#6D6A66]">(max {maxQty})</span>
                )}
              </div>

              <div className="flex items-center gap-4 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => updateRoom(key, -1)}
                  disabled={!canDecrement}
                  className="w-8 h-8 rounded-full border border-[#E8E2DA] flex items-center justify-center text-[#6D6A66] hover:bg-[#F8F5F1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-6 text-center font-medium text-[#1C1C1C]">{current}</span>

                <button
                  type="button"
                  onClick={() => updateRoom(key, 1)}
                  disabled={!canIncrement}
                  className="w-8 h-8 rounded-full border border-[#E8E2DA] flex items-center justify-center text-[#6D6A66] hover:bg-[#F8F5F1] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Free-text field for Commercial & Others mode */}
      {isCommercial && (
        <div className="mt-8 space-y-2 max-w-2xl mx-auto pt-4 border-t border-[#E8E2DA]">
          <label className="block text-sm font-semibold text-[#1C1C1C]">
            Describe your space & special requirements
          </label>
          <textarea
            rows={4}
            value={state.spaceDescription || ''}
            onChange={(e) => updateState({ spaceDescription: e.target.value })}
            placeholder="Describe your commercial layout, square footage, executive cabins, conference rooms, studio spaces, or custom design needs..."
            className="w-full p-4 border border-[#E8E2DA] rounded-xl text-sm text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#C8A96A] bg-white resize-y"
          />
          <p className="text-xs text-[#6D6A66]">
            Our commercial design team will customize your layout and estimate based on these details.
          </p>
        </div>
      )}
    </div>
  );
}
