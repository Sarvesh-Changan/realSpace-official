'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, IndianRupee, TrendingUp, Sparkles, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import { thaneMicroMarketRates } from '@/data/valuation';

export const PropertyValuationTool: React.FC = () => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>('majiwada');
  const [carpetArea, setCarpetArea] = useState<number>(750);
  const [propertyType, setPropertyType] = useState<'residential' | 'commercial'>('residential');
  const [furnishingStatus, setFurnishingStatus] = useState<'standard' | 'luxury_interior'>('standard');

  const selectedRate = useMemo(() => {
    return (
      thaneMicroMarketRates.find((m) => m.id === selectedMarketId) ||
      thaneMicroMarketRates[0]
    );
  }, [selectedMarketId]);

  const valuation = useMemo(() => {
    const baseRatePerSqFt =
      propertyType === 'residential'
        ? selectedRate.residentialAvgPerSqFt
        : selectedRate.commercialAvgPerSqFt;

    // Multiplier based on furnishing / REALSPACE luxury finish
    const multiplier = furnishingStatus === 'luxury_interior' ? 1.18 : 1.0;
    const estimatedValue = Math.round(carpetArea * baseRatePerSqFt * multiplier);
    const minValue = Math.round(estimatedValue * 0.95);
    const maxValue = Math.round(estimatedValue * 1.08);

    // Rental estimation based on yield
    const annualRent = Math.round(estimatedValue * (selectedRate.rentalYieldPercent / 100));
    const monthlyRent = Math.round(annualRent / 12);

    return {
      minValue,
      maxValue,
      estimatedValue,
      monthlyRent,
      baseRatePerSqFt: Math.round(baseRatePerSqFt * multiplier),
    };
  }, [selectedRate, carpetArea, propertyType, furnishingStatus]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRequestPhysicalAudit = () => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: {
          interest: `Physical Valuation Inspection for ${carpetArea} sq.ft ${propertyType} at ${selectedRate.name}`,
        },
      })
    );
  };

  return (
    <div className="bg-white border border-[#E8E2DA] p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
        <TrendingUp className="w-4 h-4" />
        Thane Real Estate Intelligence
      </div>
      <h3 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C] mb-2">
        Instant Property Valuation Estimator
      </h3>
      <p className="text-xs sm:text-sm text-[#6D6A66] mb-8 leading-relaxed max-w-2xl">
        Estimate the present resale market price and monthly rental potential of your flat or office in Thane based on real-time transaction benchmarks vetted by Arnav Properties.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Micro-market selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1.5">
              Select Thane Micro-Market
            </label>
            <select
              value={selectedMarketId}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] cursor-pointer"
            >
              {thaneMicroMarketRates.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.annualAppreciation})
                </option>
              ))}
            </select>
          </div>

          {/* Property Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1.5">
                Property Typology
              </label>
              <div className="flex border border-[#E8E2DA]">
                <button
                  type="button"
                  onClick={() => setPropertyType('residential')}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    propertyType === 'residential'
                      ? 'bg-[#1C1C1C] text-[#C8A96A]'
                      : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
                  }`}
                >
                  Residential Flat
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyType('commercial')}
                  className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    propertyType === 'commercial'
                      ? 'bg-[#1C1C1C] text-[#C8A96A]'
                      : 'bg-[#F8F5F1] text-[#6D6A66] hover:text-[#1C1C1C]'
                  }`}
                >
                  Commercial Unit
                </button>
              </div>
            </div>

            {/* Interior Status */}
            <div>
              <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1.5">
                Interior Finish
              </label>
              <select
                value={furnishingStatus}
                onChange={(e) => setFurnishingStatus(e.target.value as any)}
                className="w-full h-10 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
              >
                <option value="standard">Standard / Builder Finish</option>
                <option value="luxury_interior">REALSPACE Luxury Interior (+18% Val)</option>
              </select>
            </div>
          </div>

          {/* Carpet Area Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-semibold text-[#1C1C1C]">
              <span className="uppercase tracking-wider flex items-center gap-1">
                <Home className="w-3.5 h-3.5 text-[#C8A96A]" />
                Carpet Area (RERA Usable)
              </span>
              <span className="font-heading text-lg font-bold text-[#1C1C1C] tabular-nums">
                {carpetArea} Sq.Ft
              </span>
            </div>
            <input
              type="range"
              min={350}
              max={3500}
              step={25}
              value={carpetArea}
              onChange={(e) => setCarpetArea(Number(e.target.value))}
              className="w-full h-2 bg-[#EEE6DD] rounded-lg appearance-none cursor-pointer accent-[#C8A96A]"
            />
            <div className="flex justify-between text-[10px] text-[#A39E98]">
              <span>350 Sq.Ft (1 BHK)</span>
              <span>1,200 Sq.Ft (3 BHK)</span>
              <span>3,500 Sq.Ft (Sky Villa / IT Floor)</span>
            </div>
          </div>
        </div>

        {/* Valuation Result Display Card */}
        <div className="lg:col-span-5 bg-[#F8F5F1] border border-[#E8E2DA] p-6 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#A39E98] font-bold">
              Estimated Market Value Range
            </div>
            <div className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C] tabular-nums mt-1 mb-1">
              {formatCurrency(valuation.minValue)} – {formatCurrency(valuation.maxValue)}
            </div>
            <div className="text-xs text-[#6D6A66]">
              Benchmark Rate: ~₹{valuation.baseRatePerSqFt.toLocaleString('en-IN')} / sq.ft in {selectedRate.name}
            </div>

            <div className="space-y-2.5 pt-4 mt-4 border-t border-[#E8E2DA] text-xs">
              <div className="flex justify-between">
                <span className="text-[#6D6A66]">Estimated Rental Yield:</span>
                <strong className="text-[#1C1C1C]">{selectedRate.rentalYieldPercent}% Annually</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6A66]">Monthly Rental Potential:</span>
                <strong className="text-[#1C1C1C] tabular-nums">
                  ~{formatCurrency(valuation.monthlyRent)} / mo
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6D6A66]">Annual Capital Appreciation:</span>
                <strong className="text-[#0088CC]">{selectedRate.annualAppreciation}</strong>
              </div>
            </div>

            {furnishingStatus === 'luxury_interior' && (
              <div className="mt-4 p-3 bg-white border border-[#C8A96A] text-[11px] text-[#1C1C1C] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C8A96A] shrink-0" />
                <span>Includes ~18% appreciation premium for turnkey Italian joinery & bespoke finish.</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8E2DA]">
            <button
              onClick={handleRequestPhysicalAudit}
              className="w-full py-3 bg-[#1C1C1C] hover:bg-[#C8A96A] text-[#C8A96A] hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Book Complimentary Site Valuation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[10px] text-[#A39E98] text-center mt-2">
              Conducted personally by Vijay Chawan or senior surveyor. Zero commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
