'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Maximize2,
  ArrowUpRight,
} from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import { PropertyDetailModal, type ReraPropertyDetailData } from './PropertyDetailModal';
import { QuickSearchFilter } from './QuickSearchFilter';

type PropertyListingData = ReraPropertyDetailData & {
  listingType: string;
  propertyType: string;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
};

export interface PropertiesExplorerProps {
  initialProperties: PropertyListingData[];
  propertyFetchFailed?: boolean;
  bannerImageUrl?: string | null;
  distinctLocalities: string[];
  distinctBhkLabels: string[];
  distinctPossessions: string[];
  distinctPropertyTypes: string[];
  initialInterest?: string;
  initialLocality?: string;
  initialBudget?: string;
  phone?: string | null;
  whatsapp?: string | null;
}

export const PropertiesExplorer: React.FC<PropertiesExplorerProps> = ({
  initialProperties,
  propertyFetchFailed = false,
  bannerImageUrl,
  distinctLocalities,
  distinctBhkLabels,
  distinctPossessions,
  distinctPropertyTypes,
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
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'area_desc'>('featured');

  // Modal State
  const [selectedProperty, setSelectedProperty] = useState<PropertyListingData | null>(null);

  // Client-side Filtering & Sorting
  const filteredListings = useMemo(() => {
    return initialProperties
      .filter((item) => {
        if (transactionType === 'buy' && item.listingType !== 'SALE') return false;
        if (transactionType === 'rent' && item.listingType !== 'RENT') return false;

        if (selectedPropertyType !== 'all' && item.propertyType !== selectedPropertyType) return false;

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

        // Search all public-facing identifying text without relying on hidden metadata.
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const searchable = [item.title, item.locality, item.city, item.description, item.projectName, item.builderName]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!searchable.includes(q)) return false;
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
        return Number(b.isFeatured) - Number(a.isFeatured) ||
          a.sortOrder - b.sortOrder ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    initialProperties,
    transactionType,
    selectedLocality,
    selectedBhk,
    selectedBudget,
    selectedPossession,
    selectedPropertyType,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setTransactionType('all');
    setSelectedLocality('all');
    setSelectedBhk('all');
    setSelectedBudget('all');
    setSelectedPossession('all');
    setSelectedPropertyType('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="w-full bg-[#F8F5F1] min-h-screen">
      {/* 01. Hero Banner */}
      <section className="relative isolate overflow-hidden bg-[#24211d] text-white">
        {bannerImageUrl && <Image src={bannerImageUrl} alt="REALSPACE property listings" fill priority sizes="100vw" className="z-0 object-cover" />}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/75 via-black/50 to-black/25" />
        <div className="relative z-10 mx-auto flex min-h-[230px] max-w-7xl flex-col justify-end px-4 pb-9 pt-16 sm:min-h-[290px] sm:px-8 sm:pb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#FECC00]">REALSPACE RERA</p>
          <h1 className="font-heading text-3xl font-normal sm:text-4xl lg:text-5xl">Properties</h1>
          <nav aria-label="Breadcrumb" className="mt-4 text-xs text-white/80">
            <Link href={reraPath('/')} className="transition-colors hover:text-[#FECC00]">Home</Link>
            <span className="px-2 text-white/50">/</span>
            <span aria-current="page" className="text-white">Properties</span>
          </nav>
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
          distinctPossessions={distinctPossessions}
          distinctPropertyTypes={distinctPropertyTypes}
          possession={selectedPossession}
          onPossessionChange={setSelectedPossession}
          propertyType={selectedPropertyType}
          onPropertyTypeChange={setSelectedPropertyType}
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
              Browse available listings and use the filters to narrow your search.
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
        {propertyFetchFailed ? (
          <div role="alert" className="mx-auto max-w-xl border border-red-200 bg-white p-8 py-16 text-center">
            <h3 className="font-heading mb-2 text-xl font-bold text-[#1C1C1C]">Properties are temporarily unavailable</h3>
            <p className="text-sm text-[#6D6A66]">We could not load the property listings right now. Please try again in a little while.</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#E8E2DA] p-8 max-w-xl mx-auto">
            <h3 className="font-heading text-xl font-bold text-[#1C1C1C] mb-2">
              {initialProperties.length === 0 ? 'No properties are currently listed' : 'No matching properties found'}
            </h3>
            <p className="text-xs text-[#6D6A66] mb-6">
              {initialProperties.length === 0 ? 'Please check back later for available properties.' : 'Try adjusting your filters or search keywords.'}
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
                    <div className="pt-3 border-t border-[#E8E2DA] flex flex-wrap items-center justify-between gap-3">
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
                        href={`${reraPath('/contact')}?property=${encodeURIComponent(property.slug)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#C8A96A] text-[#1C1C1C] hover:bg-[#F8F5F1] text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        Enquire <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
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
