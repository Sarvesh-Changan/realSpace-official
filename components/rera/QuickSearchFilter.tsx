'use client';

import React from 'react';
import { Search, MapPin, Home, IndianRupee, RotateCcw } from 'lucide-react';

export interface QuickSearchFilterProps {
  transactionType: string;
  onTransactionChange: (type: string) => void;
  locality: string;
  onLocalityChange: (loc: string) => void;
  bhk: string;
  onBhkChange: (bhk: string) => void;
  budget: string;
  onBudgetChange: (budget: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  distinctLocalities: string[];
  distinctBhkLabels: string[];
  distinctPossessions: string[];
  distinctPropertyTypes: string[];
  possession: string;
  onPossessionChange: (value: string) => void;
  propertyType: string;
  onPropertyTypeChange: (value: string) => void;
  totalResultsCount: number;
  phone?: string | null;
  onReset?: () => void;
}

export const QuickSearchFilter: React.FC<QuickSearchFilterProps> = ({
  transactionType,
  onTransactionChange,
  locality,
  onLocalityChange,
  bhk,
  onBhkChange,
  budget,
  onBudgetChange,
  searchQuery,
  onSearchChange,
  distinctLocalities,
  distinctBhkLabels,
  distinctPossessions,
  distinctPropertyTypes,
  possession,
  onPossessionChange,
  propertyType,
  onPropertyTypeChange,
  totalResultsCount,
  phone,
  onReset,
}) => {
  return (
    <div className="bg-white border border-[#E8E2DA] shadow-xl p-5 sm:p-7 space-y-5">
      {/* Transaction Type Segmented Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2DA] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onTransactionChange('all')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              transactionType === 'all'
                ? 'bg-[#1C1C1C] text-[#C8A96A]'
                : 'text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1]'
            }`}
          >
            All Inventory
          </button>
          <button
            type="button"
            onClick={() => onTransactionChange('buy')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              transactionType === 'buy'
                ? 'bg-[#1C1C1C] text-[#C8A96A]'
                : 'text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1]'
            }`}
          >
            Buy Residences
          </button>
          <button
            type="button"
            onClick={() => onTransactionChange('rent')}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              transactionType === 'rent'
                ? 'bg-[#1C1C1C] text-[#C8A96A]'
                : 'text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1]'
            }`}
          >
            Rent Residences
          </button>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[#6D6A66] hover:text-[#1C1C1C] flex items-center gap-1.5 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* 4/5-Column Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Locality (from distinct localities of published properties) */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#C8A96A]" />
            Thane Locality
          </label>
          <div className="relative">
            <select
              value={locality}
              onChange={(e) => onLocalityChange(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] appearance-none cursor-pointer"
            >
              <option value="all">All Localities</option>
              {distinctLocalities.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6D6A66]">
              ▼
            </div>
          </div>
        </div>

        {distinctPropertyTypes.length > 0 && (
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#C8A96A]" />
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(event) => onPropertyTypeChange(event.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] cursor-pointer"
            >
              <option value="all">All Property Types</option>
              {distinctPropertyTypes.map((type) => (
                <option key={type} value={type}>{type.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>
              ))}
            </select>
          </div>
        )}

        {distinctPossessions.length > 0 && (
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66]">
              Possession
            </label>
            <select
              value={possession}
              onChange={(event) => onPossessionChange(event.target.value)}
              className="h-11 w-full cursor-pointer border border-[#E8E2DA] bg-[#F8F5F1] px-3.5 text-xs font-medium text-[#1C1C1C] focus:border-[#C8A96A] focus:outline-none"
            >
              <option value="all">Any possession</option>
              {distinctPossessions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        )}

        {/* BHK (from bhkLabel) */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-[#C8A96A]" />
            Configuration
          </label>
          <div className="relative">
            <select
              value={bhk}
              onChange={(e) => onBhkChange(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A] appearance-none cursor-pointer"
            >
              <option value="all">All BHKs</option>
              {distinctBhkLabels.length > 0 ? (
                distinctBhkLabels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))
              ) : (
                <>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4+ BHK / Penthouse</option>
                </>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#6D6A66]">
              ▼
            </div>
          </div>
        </div>

        {/* Budget Bracket */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-[#C8A96A]" />
            Budget Bracket
          </label>
          <div className="relative">
            <select
              value={budget}
              onChange={(e) => onBudgetChange(e.target.value)}
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

        {/* Keyword Search */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#C8A96A]" />
            Keyword Search
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Title, city, locality, description..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-11 pl-9 pr-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            />
            <Search className="w-4 h-4 text-[#6D6A66] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Dynamic Status Strip */}
      <div className="pt-3 border-t border-[#E8E2DA]/60 flex items-center justify-between text-xs text-[#6D6A66]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1C1C1C]">{totalResultsCount} Listings</span>
          <span>·</span>
          <span>REALSPACE RERA</span>
        </div>

        {phone && (
          <div className="text-[11px] text-[#A39E98] hidden sm:block">
            Need custom assistance? Call{' '}
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]">
              {phone}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
