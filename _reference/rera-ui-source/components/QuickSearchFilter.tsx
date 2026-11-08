'use client';

import React from 'react';
import { Search, MapPin, Home, IndianRupee, SlidersHorizontal, Check } from 'lucide-react';
import { TransactionType, FilterState } from '@/types';
import { microMarkets, propertyConfigurations } from '@/data/navigation';

interface QuickSearchFilterProps {
  filter: FilterState;
  onFilterChange: (newFilter: FilterState) => void;
  onSearchSubmit: () => void;
  totalResultsCount: number;
}

export const QuickSearchFilter: React.FC<QuickSearchFilterProps> = ({
  filter,
  onFilterChange,
  onSearchSubmit,
  totalResultsCount,
}) => {
  const handleTransactionChange = (type: TransactionType) => {
    onFilterChange({
      ...filter,
      transactionType: type,
    });
  };

  const handleMicroMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filter,
      microMarket: e.target.value,
    });
  };

  const handleConfigurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filter,
      configuration: e.target.value,
    });
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let budgetRange: [number, number] = [0, 1000000000];

    if (val === 'under_80L') budgetRange = [0, 8000000];
    else if (val === '80L_150L') budgetRange = [8000000, 15000000];
    else if (val === '150L_300L') budgetRange = [15000000, 30000000];
    else if (val === 'above_300L') budgetRange = [30000000, 1000000000];

    onFilterChange({
      ...filter,
      budgetRange,
    });
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      searchQuery: e.target.value,
    });
  };

  return (
    <div className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-8">
      <div className="bg-white border border-[#E8E2DA] shadow-xl p-5 sm:p-7">
        {/* Transaction Type Segmented Switcher */}
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#E8E2DA] pb-4">
          <button
            type="button"
            onClick={() => handleTransactionChange('buy')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter.transactionType === 'buy'
                ? 'bg-[#1C1C1C] text-[#C8A96A]'
                : 'text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1]'
            }`}
          >
            Buy Residences
          </button>
          <button
            type="button"
            onClick={() => handleTransactionChange('rent')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter.transactionType === 'rent'
                ? 'bg-[#1C1C1C] text-[#C8A96A]'
                : 'text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1]'
            }`}
          >
            Rent Residences
          </button>
          <button
            type="button"
            onClick={() => handleTransactionChange('commercial')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter.transactionType === 'commercial'
                ? 'bg-[#1C1C1C] text-[#C8A96A]'
                : 'text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1]'
            }`}
          >
            Commercial & IT Parks
          </button>
        </div>

        {/* 4-Column Search Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Micro-Market Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C8A96A]" />
              Thane Micro-Market
            </label>
            <div className="relative">
              <select
                value={filter.microMarket}
                onChange={handleMicroMarketChange}
                className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] appearance-none cursor-pointer"
              >
                {microMarkets.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6D6A66]">
                ▼
              </div>
            </div>
          </div>

          {/* Configuration Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#C8A96A]" />
              Configuration
            </label>
            <div className="relative">
              <select
                value={filter.configuration}
                onChange={handleConfigurationChange}
                className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] appearance-none cursor-pointer"
              >
                {propertyConfigurations.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6D6A66]">
                ▼
              </div>
            </div>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-[#C8A96A]" />
              Budget Bracket
            </label>
            <div className="relative">
              <select
                onChange={handleBudgetChange}
                defaultValue="all"
                className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] appearance-none cursor-pointer"
              >
                <option value="all">All Budgets (Flexible)</option>
                <option value="under_80L">Under ₹80 Lakhs</option>
                <option value="80L_150L">₹80 Lakhs - ₹1.50 Crore</option>
                <option value="150L_300L">₹1.50 Cr - ₹3.00 Crore</option>
                <option value="above_300L">Above ₹3.00 Crore (Luxury)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6D6A66]">
                ▼
              </div>
            </div>
          </div>

          {/* Keyword Search Input & Submit Action */}
          <div className="flex flex-col justify-end">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Builder or project..."
                  value={filter.searchQuery}
                  onChange={handleKeywordChange}
                  className="w-full h-11 pl-9 pr-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                />
                <Search className="w-4 h-4 text-[#6D6A66] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={onSearchSubmit}
                className="h-11 px-5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic active status hint */}
        <div className="mt-4 pt-3 border-t border-[#E8E2DA]/60 flex items-center justify-between text-xs text-[#6D6A66]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1C1C1C]">{totalResultsCount} Verified Listings</span>
            <span>·</span>
            <span>MahaRERA compliant only</span>
          </div>

          <div className="text-[11px] text-[#A39E98] hidden sm:block">
            Need custom assistance? Call <a href="tel:+919869211777" className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]">+91 98692 11777</a>
          </div>
        </div>
      </div>
    </div>
  );
};
