import React, { useEffect } from 'react';
import { QuoteState } from './types';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  state: QuoteState;
  updateState: (updates: Partial<QuoteState>) => void;
}

const PACKAGES = [
  { id: 'Standard', label: 'Standard', desc: 'Essential materials, functional design, cost-effective finish.' },
  { id: 'Premium', label: 'Premium', desc: 'High-quality materials, customized finishes, balanced luxury.' },
  { id: 'Luxury', label: 'Luxury', desc: 'Premium imported materials, bespoke elements, high-end finish.' }
];

export default function Step3Package({ state, updateState }: Props) {
  const isCommercialFlow =
    (state as any).isCommercialFlow ?? (state.bhkType === 'Commercial & Others');

  useEffect(() => {
    if (isCommercialFlow) {
      if (!state.packageTier) {
        updateState({ packageTier: 'Commercial Custom' });
      }
    } else if (state.packageTier === 'Commercial Custom') {
      updateState({ packageTier: '' });
    }
  }, [isCommercialFlow, state.packageTier, updateState]);

  if (isCommercialFlow) {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">
            Material & Finish Package
          </h2>
          <p className="text-sm sm:text-base text-[#6D6A66]">
            Material and package selection will be discussed with our team based on your project scope.
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-[#F8F5F1] border border-[#E8E2DA] rounded-2xl text-center space-y-3">
          <p className="text-sm sm:text-base text-[#1C1C1C] font-medium leading-relaxed">
            Commercial and specialty spaces require customized material standards, durability specifications, and custom layouts tailored to your business operations.
          </p>
          <p className="text-xs sm:text-sm text-[#6D6A66]">
            Click &ldquo;Next Step&rdquo; to submit your contact details and receive a customized consultation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">Select your material package</h2>
        <p className="text-sm sm:text-base text-[#6D6A66]">Choose the level of finish for your space.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {PACKAGES.map((pkg) => {
          const isSelected = state.packageTier === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => updateState({ packageTier: pkg.id })}
              className={clsx(
                "relative p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left flex flex-col h-full cursor-pointer",
                "hover:shadow-md",
                isSelected 
                  ? "border-[#C8A96A] bg-[#C8A96A]/5" 
                  : "border-[#E8E2DA] bg-white hover:border-[#C8A96A]/50"
              )}
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                <span className={clsx(
                  "font-bold text-base sm:text-lg",
                  isSelected ? "text-[#1C1C1C]" : "text-[#6D6A66]"
                )}>
                  {pkg.label}
                </span>
                <div className={clsx(
                  "w-6 h-6 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                  isSelected ? "bg-[#C8A96A] border-[#C8A96A]" : "border-[#E8E2DA]"
                )}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#6D6A66] leading-relaxed mt-auto">
                {pkg.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}


