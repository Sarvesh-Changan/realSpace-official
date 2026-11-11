'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Maximize2,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import { PropertyDetailModal, type ReraPropertyDetailData } from './PropertyDetailModal';
import { QuickSearchFilter } from './QuickSearchFilter';

export interface PropertiesExplorerProps {
  initialProperties: ReraPropertyDetailData[];
  distinctLocalities: string[];
  distinctBhkLabels: string[];
  distinctPossessions: string[];
  initialInterest?: string;
  initialLocality?: string;
  initialBudget?: string;
  phone?: string | null;
  whatsapp?: string | null;
}

export const PropertiesExplorer: React.FC<PropertiesExplorerProps> = ({
  initialProperties,
  distinctLocalities,
  distinctBhkLabels,
  distinctPossessions,
  initialInterest = 'all',
  initialLocality = 'all',
  initialBudget = 'all',
  phone,
  whatsapp,
}) => {
  // Filter States
  const [transactionType, setTransactionType] = useState<string>(initialInterest);
  const [selectedLocality, setSelectedLocality] = useState<string>(initialLocality);
  const [selectedBhk, setSelectedBhk] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>(initialBudget);
  const [selectedPossession, setSelectedPossession] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'area_desc'>('featured');

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<ReraPropertyDetailData | null>(null);

  // Client-side Filtering & Sorting
  const filteredListings = useMemo(() => {
    return initialProperties
      .filter((item) => {
        // 1. Transaction Type (Buy / Rent / Commercial)
        if (transactionType !== 'all') {
          const isCommercial =
            item.title.toLowerCase().includes('commercial') ||
            (item.bhkLabel && item.bhkLabel.toLowerCase().includes('commercial')) ||
            item.description.toLowerCase().includes('office') ||
            item.description.toLowerCase().includes('retail');

          if (transactionType === 'commercial') {
            if (!isCommercial) return false;
          } else if (transactionType === 'buy') {
            if (isCommercial) return false;
          } else if (transactionType === 'rent') {
            if (isCommercial) return false;
          }
        }

        // 2. Locality filter
        if (selectedLocality !== 'all') {
          if (item.locality.toLowerCase() !== selectedLocality.toLowerCase()) {
            return false;
          }
        }

        // 3. BHK filter
        if (selectedBhk !== 'all') {
          if (!item.bhkLabel || !item.bhkLabel.toLowerCase().includes(selectedBhk.toLowerCase())) {
            return false;
          }
        }

        // 4. Budget filter (properties without priceAmount are excluded from budget filters)
        if (selectedBudget !== 'all') {
          if (item.priceAmount == null) return false;
          if (selectedBudget === 'under_80L' && item.priceAmount > 8000000) return false;
          if (
            selectedBudget === '80L_150L' &&
            (item.priceAmount < 8000000 || item.priceAmount > 15000000)
          )
            return false;
          if (
            selectedBudget === '150L_300L' &&
            (item.priceAmount < 15000000 || item.priceAmount > 30000000)
          )
            return false;
          if (selectedBudget === 'above_300L' && item.priceAmount < 30000000) return false;
        }

        // 5. Possession filter
        if (selectedPossession !== 'all') {
          if (!item.possession || !item.possession.toLowerCase().includes(selectedPossession.toLowerCase())) {
            return false;
          }
        }

        // 6. Keyword search over title, locality, projectName and builderName
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesLoc = item.locality.toLowerCase().includes(q);
          const matchesProj = item.projectName?.toLowerCase().includes(q) ?? false;
          const matchesBuilder = item.builderName?.toLowerCase().includes(q) ?? false;
          if (!matchesTitle && !matchesLoc && !matchesProj && !matchesBuilder) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Price sorting: properties without priceAmount sort last
        if (sortBy === 'price_asc') {
          if (a.priceAmount == null && b.priceAmount == null) return 0;
          if (a.priceAmount == null) return 1;
          if (b.priceAmount == null) return -1;
          return a.priceAmount - b.priceAmount;
        }
        if (sortBy === 'price_desc') {
          if (a.priceAmount == null && b.priceAmount == null) return 0;
          if (a.priceAmount == null) return 1;
          if (b.priceAmount == null) return -1;
          return b.priceAmount - a.priceAmount;
        }
        if (sortBy === 'area_desc') {
          const areaA = a.carpetAreaSqFt ?? 0;
          const areaB = b.carpetAreaSqFt ?? 0;
          return areaB - areaA;
        }
        return 0;
      });
  }, [
    initialProperties,
    transactionType,
    selectedLocality,
    selectedBhk,
    selectedBudget,
    selectedPossession,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setTransactionType('all');
    setSelectedLocality('all');
    setSelectedBhk('all');
    setSelectedBudget('all');
    setSelectedPossession('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="w-full bg-[#F8F5F1] min-h-screen">
      {/* 01. Hero Banner */}
      <section className="bg-[#1C1C1C] text-white py-14 px-4 sm:px-8 border-b border-[#333333]">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Statutory Real Estate Portfolio · Thane MMR</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-normal text-white mb-4">
            Curated Thane Properties
          </h1>
          <p className="text-sm sm:text-base text-[#EEE6DD]/90 max-w-2xl leading-relaxed">
            Verified residential developments, luxury penthouses, and prime commercial spaces with
            transparent documentation.
          </p>
        </div>
      </section>

      {/* 02. Interactive Search & Filter Console (Ported QuickSearchFilter) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        <QuickSearchFilter
          transactionType={transactionType}
          onTransactionChange={setTransactionType}
          locality={selectedLocality}
          onLocalityChange={setSelectedLocality}
          bhk={selectedBhk}
          onBhkChange={setSelectedBhk}
          budget={selectedBudget}
          onBudgetChange={setSelectedBudget}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          distinctLocalities={distinctLocalities}
          distinctBhkLabels={distinctBhkLabels}
          totalResultsCount={filteredListings.length}
          phone={phone}
          onReset={handleResetFilters}
        />
      </section>

      {/* 03. Results Header & Sorting Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2DA]">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1C1C1C]">
              {filteredListings.length} {filteredListings.length === 1 ? 'Property' : 'Properties'} Available
            </h2>
            <p className="text-xs text-[#6D6A66] mt-0.5">
              Verified inventory matching your search criteria
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6D6A66] uppercase tracking-wider font-semibold">
              Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 px-3 bg-white border border-[#E8E2DA] text-xs font-semibold text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
            >
              <option value="featured">Featured / Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="area_desc">Carpet Area: Largest First</option>
            </select>
          </div>
        </div>
      </section>

      {/* 04. Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
        {filteredListings.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#E8E2DA] p-8 max-w-xl mx-auto">
            <h3 className="font-heading text-xl font-bold text-[#1C1C1C] mb-2">
              No matching properties found
            </h3>
            <p className="text-xs text-[#6D6A66] mb-6">
              Try adjusting your filters or search keywords to view other available inventory in Thane.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2.5 bg-[#C8A96A] text-[#1C1C1C] hover:bg-[#B78A47] text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredListings.map((property) => (
              <div
                key={property.id}
                className="luxury-card flex flex-col group overflow-hidden bg-white border border-[#E8E2DA] shadow-sm hover:border-[#C8A96A] transition-all"
              >
                {/* Card Media Header */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEE6DD]">
                  {property.coverImageUrl ? (
                    <Link
                      href={`${reraPath('/properties')}/${property.slug}`}
                      className="absolute inset-0"
                      aria-label={`View ${property.title}`}
                    >
                      <Image
                        src={property.coverImageUrl}
                        alt={property.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                  ) : (
                    <Link
                      href={`${reraPath('/properties')}/${property.slug}`}
                      className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-wider text-[#A39E98]"
                      aria-label={`View ${property.title}`}
                    >
                      {property.locality}
                    </Link>
                  )}

                  <div className="pointer-events-none absolute top-3 left-3 bg-[#1C1C1C]/85 backdrop-blur-sm text-[#C8A96A] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                    {property.locality}
                  </div>

                  {property.projectReraNo && (
                    <div className="pointer-events-none absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1C1C1C] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                      RERA: {property.projectReraNo}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedProperty(property)}
                    className="absolute bottom-3 right-3 z-10 p-2 bg-[#1C1C1C]/70 hover:bg-[#C8A96A] text-white hover:text-[#1C1C1C] transition-colors rounded-sm"
                    aria-label={`Preview ${property.title}`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                      <span>
                        {property.builderName ? `${property.builderName} · ` : ''}
                        {property.bhkLabel ?? ''}
                      </span>
                      {property.carpetAreaSqFt && (
                        <span>{property.carpetAreaSqFt} Sq.Ft</span>
                      )}
                    </div>

                    <Link href={`${reraPath('/properties')}/${property.slug}`}>
                      <h3 className="font-heading text-lg font-bold text-[#1C1C1C] leading-snug group-hover:text-[#B78A47] transition-colors">
                        {property.title}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1 text-xs text-[#6D6A66] mt-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                      <span className="truncate">
                        {property.locality}, {property.city}
                      </span>
                    </div>

                    {property.description && (
                      <p className="text-xs text-[#6D6A66] line-clamp-2 leading-relaxed mb-4">
                        {property.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-[#E8E2DA] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#A39E98] font-semibold">
                        Pricing
                      </div>
                      <div className="text-sm font-bold text-[#1C1C1C]">
                        {property.priceLabel}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`${reraPath('/properties')}/${property.slug}`}
                        className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#C8A96A] text-white hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Property Preview Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        phone={phone}
        whatsapp={whatsapp}
      />
    </div>
  );
};
