import React, { useState } from 'react';
import { QuoteState, RoomConstraint } from './types';
import { clsx } from 'clsx';
import { Check, Loader2 } from 'lucide-react';
import { getBhkRoomDefaultsAction } from '@/app/(public)/quote/actions';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
}

const OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+', 'Commercial & Others'];

const ROOM_KEY_MAP: Record<string, keyof QuoteState['rooms']> = {
  kitchen: 'kitchens',
  hall: 'livingRooms',
  bedroom: 'bedrooms',
  bathroom: 'bathrooms',
  wardrobe: 'wardrobes',
};

export default function Step1BHK({ state, updateState }: Props) {
  const [loadingBhk, setLoadingBhk] = useState<string | null>(null);

  const handleSelectBhk = async (option: string) => {
    updateState({ bhkType: option });

    if (option === 'Commercial & Others') {
      updateState({
        bhkType: option,
        rooms: { kitchens: 0, livingRooms: 0, bedrooms: 0, bathrooms: 0, wardrobes: 0 },
        roomConstraints: {},
      });
      return;
    }

    setLoadingBhk(option);

    try {
      const res = await getBhkRoomDefaultsAction(option);

      const numBhk = parseInt(option.charAt(0)) || 1;
      const newRooms: QuoteState['rooms'] = {
        kitchens: 1,
        livingRooms: 1,
        bedrooms: numBhk,
        bathrooms: numBhk,
        wardrobes: 1,
      };

      const newConstraints: Record<string, RoomConstraint> = {
        kitchens: { defaultQty: 1, minQty: 1, maxQty: 1, isFixedFloor: true },
        livingRooms: { defaultQty: 1, minQty: 1, maxQty: 2, isFixedFloor: true },
        bedrooms: { defaultQty: numBhk, minQty: numBhk, maxQty: null, isFixedFloor: false },
        bathrooms: { defaultQty: numBhk, minQty: numBhk, maxQty: null, isFixedFloor: false },
        wardrobes: { defaultQty: 1, minQty: 0, maxQty: null, isFixedFloor: false },
      };

      if (res.success && res.defaults && res.defaults.length > 0) {
        res.defaults.forEach((d) => {
          const roomKey = ROOM_KEY_MAP[d.roomGroupKey];
          if (roomKey) {
            newRooms[roomKey] = d.defaultQty;
            newConstraints[roomKey] = {
              defaultQty: d.defaultQty,
              minQty: d.minQty,
              maxQty: d.maxQty,
              isFixedFloor: d.isFixedFloor,
            };
          }
        });
      }

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
        <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">What type of property do you have?</h2>
        <p className="text-[#6D6A66]">Select your property size to help us estimate the scope of work.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                "relative p-6 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer",
                "hover:shadow-md disabled:opacity-80",
                isSelected
                  ? "border-[#C8A96A] bg-[#C8A96A]/5"
                  : "border-[#E8E2DA] bg-white hover:border-[#C8A96A]/50"
              )}
            >
              <div className="flex justify-between items-center">
                <span className={clsx(
                  "font-medium text-lg",
                  isSelected ? "text-[#1C1C1C]" : "text-[#6D6A66]"
                )}>
                  {option}
                </span>
                <div className={clsx(
                  "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                  isSelected ? "bg-[#C8A96A] border-[#C8A96A]" : "border-[#E8E2DA]"
                )}>
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#C8A96A] animate-spin" />
                  ) : (
                    isSelected && <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
