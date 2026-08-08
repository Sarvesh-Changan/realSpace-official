import React from 'react';
import { QuoteState } from './types';
import { Minus, Plus } from 'lucide-react';
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
  const updateRoom = (key: keyof QuoteState['rooms'], increment: number) => {
    const current = state.rooms[key];
    const next = Math.max(0, current + increment);
    updateState({
      rooms: { ...state.rooms, [key]: next }
    });
  };

  const toggleRequirement = (key: keyof QuoteState['requirements']) => {
    updateState({
      requirements: { ...state.requirements, [key]: !state.requirements[key] }
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">Which spaces need designing?</h2>
        <p className="text-[#6D6A66]">Add the number of rooms you want us to design.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button
          onClick={() => toggleRequirement('interior')}
          className={clsx(
            "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-between",
            state.requirements.interior ? "border-[#C8A96A] bg-[#C8A96A]/5" : "border-[#E8E2DA] bg-white"
          )}
        >
          <span className="font-medium text-[#1C1C1C]">Interior Design</span>
          <div className={clsx("w-5 h-5 rounded border flex items-center justify-center", state.requirements.interior ? "bg-[#C8A96A] border-[#C8A96A]" : "border-[#E8E2DA]")}>
            {state.requirements.interior && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
          </div>
        </button>
        <button
          onClick={() => toggleRequirement('exterior')}
          className={clsx(
            "flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-between",
            state.requirements.exterior ? "border-[#C8A96A] bg-[#C8A96A]/5" : "border-[#E8E2DA] bg-white"
          )}
        >
          <span className="font-medium text-[#1C1C1C]">Exterior / Architecture</span>
          <div className={clsx("w-5 h-5 rounded border flex items-center justify-center", state.requirements.exterior ? "bg-[#C8A96A] border-[#C8A96A]" : "border-[#E8E2DA]")}>
            {state.requirements.exterior && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
          </div>
        </button>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {ROOM_TYPES.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between p-4 bg-white border border-[#E8E2DA] rounded-xl">
            <span className="font-medium text-[#1C1C1C]">{label}</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => updateRoom(key, -1)}
                disabled={state.rooms[key] === 0}
                className="w-8 h-8 rounded-full border border-[#E8E2DA] flex items-center justify-center text-[#6D6A66] hover:bg-[#F8F5F1] disabled:opacity-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-medium text-[#1C1C1C]">{state.rooms[key]}</span>
              <button
                onClick={() => updateRoom(key, 1)}
                className="w-8 h-8 rounded-full border border-[#E8E2DA] flex items-center justify-center text-[#6D6A66] hover:bg-[#F8F5F1] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
