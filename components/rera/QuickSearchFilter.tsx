'use client';

import React from 'react';
import { Search, Home, RotateCcw } from 'lucide-react';
import { LocationCascade } from './LocationCascade';

export interface QuickSearchFilterProps {
  transactionType: string;
  onTransactionChange: (type: string) => void;
  region: string;
  onRegionChange: (region: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  locality: string;
  onLocalityChange: (loc: string) => void;
  bhk: string;
  onBhkChange: (bhk: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  distinctLocalities: string[];
  distinctBhkLabels: string[];
  totalResultsCount: number;
  phone?: string | null;
  onReset?: () => void;
}

export const QuickSearchFilter: React.FC<QuickSearchFilterProps> = ({
  transactionType,
  onTransactionChange,
  region,
  onRegionChange,
  city,
  onCityChange,
  locality,
  onLocalityChange,
  bhk,
  onBhkChange,
  searchQuery,
  onSearchChange,
  distinctLocalities,
  distinctBhkLabels,
  totalResultsCount,
  phone,
  onReset,
}) => (
  <div className="space-y-5 border border-[#E8E2DA] bg-white p-5 shadow-xl sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E2DA] pb-4">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: 'all', label: 'All Inventory' },
          { value: 'buy', label: 'Buy Residences' },
          { value: 'rent', label: 'Rent Residences' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onTransactionChange(option.value)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${transactionType === option.value ? 'bg-[#1C1C1C] text-[#C8A96A]' : 'text-[#6D6A66] hover:bg-[#F8F5F1] hover:text-[#1C1C1C]'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {onReset && (
        <button type="button" onClick={onReset} className="flex items-center gap-1.5 text-xs font-medium text-[#6D6A66] transition-colors hover:text-[#1C1C1C]">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Filters</span>
        </button>
      )}
    </div>

    <LocationCascade
      variant="filter"
      region={region}
      city={city}
      locality={locality}
      onRegionChange={onRegionChange}
      onCityChange={onCityChange}
      onLocalityChange={onLocalityChange}
      additionalLocalities={distinctLocalities}
      includeAllRegions
      includeAllCities
      includeAllLocalities
    />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="rera-bhk-filter" className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66]">
          <Home className="h-3.5 w-3.5 text-[#C8A96A]" />
          Configuration
        </label>
        <select
          id="rera-bhk-filter"
          value={bhk}
          onChange={(event) => onBhkChange(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none border border-[#E8E2DA] bg-[#F8F5F1] px-3.5 text-xs font-medium text-[#1C1C1C] focus:border-[#C8A96A] focus:outline-none"
        >
          <option value="all">All BHKs</option>
          {distinctBhkLabels.length > 0 ? distinctBhkLabels.map((item) => <option key={item} value={item}>{item}</option>) : (
            <>
              <option value="1 BHK">1 BHK</option>
              <option value="2 BHK">2 BHK</option>
              <option value="3 BHK">3 BHK</option>
              <option value="4 BHK">4+ BHK / Penthouse</option>
            </>
          )}
        </select>
      </div>

      <div>
        <label htmlFor="rera-keyword-search" className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66]">
          <Search className="h-3.5 w-3.5 text-[#C8A96A]" />
          Keyword Search
        </label>
        <div className="relative">
          <input
            id="rera-keyword-search"
            type="search"
            placeholder="Title, city, locality, description..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full border border-[#E8E2DA] bg-[#F8F5F1] pl-9 pr-3 text-xs text-[#1C1C1C] focus:border-[#C8A96A] focus:outline-none"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6D6A66]" />
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between border-t border-[#E8E2DA]/60 pt-3 text-xs text-[#6D6A66]">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#1C1C1C]">{totalResultsCount} Listings</span>
        <span aria-hidden="true">·</span>
        <span>REALSPACE RERA</span>
      </div>
      {phone && (
        <div className="hidden text-[11px] text-[#A39E98] sm:block">
          Need custom assistance? Call{' '}
          <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-semibold text-[#1C1C1C] hover:text-[#C8A96A]">{phone}</a>
        </div>
      )}
    </div>
  </div>
);
