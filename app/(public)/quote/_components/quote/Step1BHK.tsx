import React from 'react';
import { QuoteState } from './types';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
}

const OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK+'];

export default function Step1BHK({ state, updateState }: Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif text-[#1C1C1C] mb-2">What type of property do you have?</h2>
        <p className="text-[#6D6A66]">Select your property size to help us estimate the scope of work.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {OPTIONS.map((option) => {
          const isSelected = state.bhkType === option;
          return (
            <button
              key={option}
              onClick={() => updateState({ bhkType: option })}
              className={clsx(
                "relative p-6 rounded-xl border-2 transition-all duration-200 text-left",
                "hover:shadow-md",
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
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
