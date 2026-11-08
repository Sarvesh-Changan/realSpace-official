'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, IndianRupee, CheckCircle2, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { interiorPackages, PackageTier } from '@/data/interiors';

export const InteriorCostEstimator: React.FC = () => {
  const [bhkType, setBhkType] = useState<string>('2 BHK');
  const [carpetArea, setCarpetArea] = useState<number>(720);
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(1); // Default: Bespoke Luxury
  const [includeAutomation, setIncludeAutomation] = useState<boolean>(true);
  const [includeBalconyDeck, setIncludeBalconyDeck] = useState<boolean>(false);

  const selectedTier = interiorPackages[selectedTierIndex];

  // Auto-set carpet area defaults when changing BHK
  const handleBhkChange = (type: string) => {
    setBhkType(type);
    if (type === '1 BHK') setCarpetArea(450);
    else if (type === '2 BHK') setCarpetArea(720);
    else if (type === '3 BHK') setCarpetArea(1100);
    else if (type === '4+ BHK / Penthouse') setCarpetArea(1850);
  };

  const calculation = useMemo(() => {
    const baseCost = carpetArea * selectedTier.ratePerSqFt;
    const automationAddon = includeAutomation ? 140000 : 0;
    const balconyDeckAddon = includeBalconyDeck ? 85000 : 0;
    const totalEstimate = baseCost + automationAddon + balconyDeckAddon;

    return {
      baseCost,
      automationAddon,
      balconyDeckAddon,
      totalEstimate,
      timelineDays: carpetArea > 1200 ? 50 : 42,
    };
  }, [carpetArea, selectedTier, includeAutomation, includeBalconyDeck]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleBookConsultation = () => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: {
          interest: `Turnkey Interior Estimate for ${bhkType} (${carpetArea} sq.ft) - ${selectedTier.name} Package`,
        },
      })
    );
  };

  return (
    <div id="cost-estimator" className="bg-white border border-[#E8E2DA] p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
        <Sparkles className="w-4 h-4" />
        Transparent Investment Planning
      </div>
      <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C] mb-2">
        REALSPACE Turnkey Interior Cost Estimator
      </h3>
      <p className="text-xs sm:text-sm text-[#6D6A66] mb-8 leading-relaxed max-w-2xl">
        Estimate your complete interior architecture budget for apartments in Thane. Backed by German joinery pre-fabrication, zero hidden fees, and a 10-year structural warranty.
      </p>

      {/* Package Tier Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {interiorPackages.map((tier, idx) => (
          <button
            key={tier.name}
            type="button"
            onClick={() => setSelectedTierIndex(idx)}
            className={`p-4 text-left border transition-all ${
              selectedTierIndex === idx
                ? 'border-[#C8A96A] bg-[#F8F5F1] shadow-sm'
                : 'border-[#E8E2DA] bg-white hover:border-[#A39E98]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-heading font-bold text-base text-[#1C1C1C]">
                {tier.name}
              </span>
              <span className="text-xs font-bold text-[#C8A96A] tabular-nums">
                ₹{tier.ratePerSqFt}/sq.ft
              </span>
            </div>
            <p className="text-[11px] text-[#6D6A66] leading-tight mb-2">
              {tier.tagline}
            </p>
            <div className="text-[10px] text-[#A39E98] truncate">
              {tier.recommendedFor}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* BHK selector buttons */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-2">
              Select Apartment Configuration
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['1 BHK', '2 BHK', '3 BHK', '4+ BHK / Penthouse'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleBhkChange(type)}
                  className={`py-2.5 px-3 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                    bhkType === type
                      ? 'bg-[#1C1C1C] text-[#C8A96A] border-[#1C1C1C]'
                      : 'bg-[#F8F5F1] text-[#6D6A66] border-[#E8E2DA] hover:text-[#1C1C1C]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Carpet Area Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold text-[#1C1C1C]">
              <span className="uppercase tracking-wider">Carpet Area (RERA Usable)</span>
              <span className="font-heading text-lg font-bold text-[#1C1C1C] tabular-nums">
                {carpetArea} Sq.Ft
              </span>
            </div>
            <input
              type="range"
              min={350}
              max={3000}
              step={20}
              value={carpetArea}
              onChange={(e) => setCarpetArea(Number(e.target.value))}
              className="w-full h-2 bg-[#EEE6DD] rounded-lg appearance-none cursor-pointer accent-[#C8A96A]"
            />
            <div className="flex justify-between text-[10px] text-[#A39E98]">
              <span>350 Sq.Ft</span>
              <span>1,500 Sq.Ft</span>
              <span>3,000 Sq.Ft</span>
            </div>
          </div>

          {/* Add-ons Checkboxes */}
          <div className="pt-2 border-t border-[#E8E2DA] space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#1C1C1C]">
              Optional Custom Add-ons
            </div>
            <label className="flex items-center gap-3 text-xs text-[#444444] cursor-pointer">
              <input
                type="checkbox"
                checked={includeAutomation}
                onChange={(e) => setIncludeAutomation(e.target.checked)}
                className="w-4 h-4 accent-[#C8A96A]"
              />
              <span>Smart Home Automation (Lutron / Legrand App & Voice Lighting Control) — +₹1.40 Lakhs</span>
            </label>
            <label className="flex items-center gap-3 text-xs text-[#444444] cursor-pointer">
              <input
                type="checkbox"
                checked={includeBalconyDeck}
                onChange={(e) => setIncludeBalconyDeck(e.target.checked)}
                className="w-4 h-4 accent-[#C8A96A]"
              />
              <span>Weatherproof Composite Wooden Balcony Deck & Planters — +₹85,000</span>
            </label>
          </div>
        </div>

        {/* Results Estimation Card */}
        <div className="lg:col-span-5 bg-[#F8F5F1] border border-[#E8E2DA] p-6 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#A39E98] font-bold">
              Estimated Turnkey Investment
            </div>
            <div className="font-heading text-3xl sm:text-4xl font-bold text-[#1C1C1C] tabular-nums mt-1 mb-1">
              {formatCurrency(calculation.totalEstimate)}
            </div>
            <div className="text-xs text-[#6D6A66]">
              Package: <strong className="text-[#1C1C1C]">{selectedTier.name}</strong> ({bhkType}, {carpetArea} sq.ft)
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-2 pt-4 mt-4 border-t border-[#E8E2DA] text-xs">
              {selectedTier.features.slice(0, 4).map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-[#444444]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96A] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#E8E2DA] flex items-center justify-between text-xs text-[#6D6A66]">
              <span className="flex items-center gap-1 font-semibold text-[#1C1C1C]">
                <Clock className="w-3.5 h-3.5 text-[#C8A96A]" />
                Handover: {calculation.timelineDays} Days
              </span>
              <span className="flex items-center gap-1 text-[#C8A96A] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                10-Year Warranty
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2DA]">
            <button
              onClick={handleBookConsultation}
              className="w-full py-3.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Schedule 3D Design Session with Vijay Chawan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-[#A39E98] text-center mt-2">
              Held at Lodha Crown Experience Studio (W5-1717, Majiwada) with material swatches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
