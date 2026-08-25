import React from 'react';
import { QuoteState, ActiveRoomType } from './types';
import { Minus, Plus, Info } from 'lucide-react';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
  activeRoomTypes?: ActiveRoomType[];
}

export default function Step2Rooms({ state, updateState, activeRoomTypes = [] }: Props) {
  const isCommercial = state.bhkType === 'Commercial & Others';

  const updateRoom = (key: string, increment: number) => {
    const current = state.rooms[key] ?? 0;
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

  // If activeRoomTypes wasn't passed or is empty, fall back to keys in state.rooms
  const displayedRooms = activeRoomTypes.length > 0
    ? activeRoomTypes
    : Object.keys(state.rooms).map((k) => ({ key: k, groupKeys: [k], label: k }));

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">Which spaces need designing?</h2>
        <p className="text-sm sm:text-base text-[#6D6A66]">
          {isCommercial
            ? 'Configure room counts manually and describe your commercial space requirements below.'
            : 'Adjust room counts for your selected property type.'}
        </p>
      </div>

      {/* Room Steppers */}
      <div className="space-y-3.5 sm:space-y-4 max-w-2xl mx-auto">
        {displayedRooms.map(({ key, label }) => {
          const current = state.rooms[key] ?? 0;
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
              className="flex items-center justify-between p-3.5 sm:p-4 bg-white border border-[#E8E2DA] rounded-xl gap-3 min-h-[60px]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 flex-1">
                <span className="font-medium text-[#1C1C1C] text-sm sm:text-base">{label}</span>
                {!isCommercial && isFixed && (
                  <span className="text-[11px] sm:text-xs text-[#C8A96A] bg-[#C8A96A]/10 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shrink-0">
                    <Info className="w-3 h-3" />
                    fixed
                  </span>
                )}
                {!isCommercial && !isFixed && maxQty !== null && (
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

