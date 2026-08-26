import React, { useState } from 'react';
import { QuoteState, RoomConstraint, ActiveRoomType } from './types';
import { clsx } from 'clsx';
import { Check, Loader2 } from 'lucide-react';
import { getBhkRoomDefaultsAction } from '@/app/(public)/quote/actions';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
  activeRoomTypes?: ActiveRoomType[];
}

const OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+', 'Commercial & Others'];

function getDefaultRoomConfig(key: string, numBhk: number): RoomConstraint {
  switch (key) {
    case 'kitchens':
      return { defaultQty: 1, minQty: 1, maxQty: 1, isFixedFloor: true };
    case 'livingRooms':
      return { defaultQty: 1, minQty: 1, maxQty: 2, isFixedFloor: true };
    case 'bedrooms':
      return { defaultQty: numBhk, minQty: numBhk, maxQty: null, isFixedFloor: false };
    case 'bathrooms':
      return { defaultQty: numBhk, minQty: numBhk, maxQty: null, isFixedFloor: false };
    default:
      return { defaultQty: 1, minQty: 0, maxQty: null, isFixedFloor: false };
  }
}

export default function Step1BHK({ state, updateState, activeRoomTypes = [] }: Props) {
  const [loadingBhk, setLoadingBhk] = useState<string | null>(null);

  const handleSelectBhk = async (option: string) => {
    updateState({ bhkType: option });

    setLoadingBhk(option);

    try {
      const res = await getBhkRoomDefaultsAction(option);
      const effectiveActiveRooms = res.activeRoomTypes || activeRoomTypes;

      if (option === 'Commercial & Others') {
        const commercialRooms: Record<string, number> = {};
        effectiveActiveRooms.forEach((r) => {
          commercialRooms[r.key] = 0;
        });
        updateState({
          bhkType: option,
          rooms: commercialRooms,
          roomConstraints: {},
        });
        return;
      }

      const numBhk = parseInt(option.charAt(0)) || 1;
      const newRooms: Record<string, number> = {};
      const newConstraints: Record<string, RoomConstraint> = {};

      effectiveActiveRooms.forEach((roomDef) => {
        const baseConfig = getDefaultRoomConfig(roomDef.key, numBhk);
        newRooms[roomDef.key] = baseConfig.defaultQty;
        newConstraints[roomDef.key] = baseConfig;

        if (res.success && res.defaults && res.defaults.length > 0) {
          const dbMatch = res.defaults.find((d: { roomGroupKey: string; defaultQty: number; minQty: number; maxQty: number | null; isFixedFloor: boolean }) => roomDef.groupKeys.includes(d.roomGroupKey));
          if (dbMatch) {
            newRooms[roomDef.key] = dbMatch.defaultQty;
            newConstraints[roomDef.key] = {
              defaultQty: dbMatch.defaultQty,
              minQty: dbMatch.minQty,
              maxQty: dbMatch.maxQty,
              isFixedFloor: dbMatch.isFixedFloor,
            };
          }
        }
      });

      updateState({
        bhkType: option,
        rooms: newRooms,
        roomConstraints: newConstraints,
      });
    } catch (err) {
      console.error('Failed to fetch BHK defaults:', err);
    } finally {
      setLoadingBhk(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">
          What type of property do you have?
        </h2>
        <p className="text-sm sm:text-base text-[#6D6A66]">
          Select your property size to help us estimate the scope of work.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {OPTIONS.map((option) => {
          const isSelected = state.bhkType === option;
          const isLoading = loadingBhk === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectBhk(option)}
              disabled={isLoading}
              className={clsx(
                "relative p-4 sm:p-5 min-h-[56px] rounded-xl border-2 transition-all duration-200 text-left cursor-pointer",
                "hover:shadow-md disabled:opacity-80 flex items-center justify-between w-full",
                isSelected
                  ? "border-[#C8A96A] bg-[#C8A96A]/5"
                  : "border-[#E8E2DA] bg-white hover:border-[#C8A96A]/50"
              )}
            >
              <span className={clsx(
                "font-medium text-base sm:text-lg pr-2",
                isSelected ? "text-[#1C1C1C]" : "text-[#6D6A66]"
              )}>
                {option}
              </span>
              <div className={clsx(
                "w-6 h-6 rounded-full border flex items-center justify-center transition-colors shrink-0",
                isSelected ? "bg-[#C8A96A] border-[#C8A96A]" : "border-[#E8E2DA]"
              )}>
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#C8A96A] animate-spin" />
                ) : (
                  isSelected && <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
