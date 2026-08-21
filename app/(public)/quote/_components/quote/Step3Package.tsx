import React from 'react';
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

const ADDITIONAL_SERVICES = [
  'False Ceiling',
  'Painting & Textures',
  'Plumbing',
  'Electrical & Lighting',
  'Smart Home Automation',
  'Custom Furniture'
];

export default function Step3Package({ state, updateState }: Props) {
  const toggleService = (service: string) => {
    const current = state.additionalServices;
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    updateState({ additionalServices: updated });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-serif text-[#1C1C1C] mb-2">Select your material package</h2>
        <p className="text-sm sm:text-base text-[#6D6A66]">Choose the level of finish and any extra services you need.</p>
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

      <div className="mt-6 sm:mt-8 border-t border-[#E8E2DA] pt-6 sm:pt-8">
        <h3 className="text-base sm:text-lg font-medium text-[#1C1C1C] mb-3 sm:mb-4">Additional Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {ADDITIONAL_SERVICES.map((service) => {
            const isSelected = state.additionalServices.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => toggleService(service)}
                className={clsx(
                  "flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition-all text-left cursor-pointer min-h-[48px]",
                  isSelected ? "border-[#C8A96A] bg-white shadow-sm" : "border-[#E8E2DA] bg-white/50"
                )}
              >
                <div className={clsx(
                  "w-5 h-5 rounded border flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-[#C8A96A] border-[#C8A96A]" : "border-[#E8E2DA]"
                )}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className="text-sm font-medium text-[#1C1C1C]">{service}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
