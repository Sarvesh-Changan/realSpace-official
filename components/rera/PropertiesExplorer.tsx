'use client';

import React, { useMemo, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, SlidersHorizontal, X } from 'lucide-react';
import { reraPath } from '@/lib/rera/routes';
import {
  ALL_CITIES_VALUE,
  ALL_LOCALITIES_VALUE,
  ALL_REGIONS_VALUE,
  cityMatchesLocation,
  getRegionForCity,
} from '@/lib/rera/locations';
import type { ReraPropertyDetailData } from './PropertyDetailModal';
import { QuickSearchFilter } from './QuickSearchFilter';

type PropertyListingData = ReraPropertyDetailData & {
  listingType: string;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
};

const FALLBACK_BANNER_IMAGE = '/images/home/behind-project-exterior.png';

export interface PropertiesExplorerProps {
  initialProperties: PropertyListingData[];
  categories: Array<{ id: string; name: string; slug: string }>;
  initialCategory: string;
  propertyFetchFailed?: boolean;
  bannerImageUrl?: string | null;
  distinctBhkLabels: string[];
  initialInterest?: string;
  initialRegion?: string;
  initialCity?: string;
  initialLocality?: string;
  phone?: string | null;
  whatsapp?: string | null;
}

export const PropertiesExplorer: React.FC<PropertiesExplorerProps> = ({
  initialProperties,
  categories,
  initialCategory,
  propertyFetchFailed = false,
  bannerImageUrl,
  distinctBhkLabels,
  initialInterest = 'all',
  initialRegion = ALL_REGIONS_VALUE,
  initialCity = ALL_CITIES_VALUE,
  initialLocality = ALL_LOCALITIES_VALUE,
  phone,
  whatsapp,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [transactionType, setTransactionType] = useState<string>(initialInterest);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedLocality, setSelectedLocality] = useState<string>(initialLocality);
  const [selectedBhk, setSelectedBhk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [activeBannerImage, setActiveBannerImage] = useState(bannerImageUrl || FALLBACK_BANNER_IMAGE);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(media.matches);
    updateViewport();
    media.addEventListener('change', updateViewport);
    return () => media.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [filtersOpen]);

  useEffect(() => {
    const queryCategory = searchParams.get('category') || '';
    const matchingCategory = categories.find((category) => category.slug === queryCategory);
    setSelectedCategory(matchingCategory?.slug ?? 'all');
    if (queryCategory && !matchingCategory) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('category');
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [categories, pathname, router, searchParams]);

  const selectCategory = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    const params = new URLSearchParams(searchParams.toString());
    if (categorySlug === 'all') params.delete('category');
    else params.set('category', categorySlug);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const updateLocationParams = (next: { region: string; city: string; locality: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.region === ALL_REGIONS_VALUE) params.delete('region');
    else params.set('region', next.region);
    if (next.city === ALL_CITIES_VALUE) params.delete('city');
    else params.set('city', next.city);
    if (next.locality === ALL_LOCALITIES_VALUE) params.delete('locality');
    else params.set('locality', next.locality);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const selectRegion = (region: string) => {
    const nextRegion = region || ALL_REGIONS_VALUE;
    const next = { region: nextRegion, city: ALL_CITIES_VALUE, locality: ALL_LOCALITIES_VALUE };
    setSelectedRegion(next.region);
    setSelectedCity(next.city);
    setSelectedLocality(next.locality);
    updateLocationParams(next);
  };

  const selectCity = (city: string) => {
    const nextCity = city || ALL_CITIES_VALUE;
    const next = { region: selectedRegion, city: nextCity, locality: ALL_LOCALITIES_VALUE };
    setSelectedCity(next.city);
    setSelectedLocality(next.locality);
    updateLocationParams(next);
  };

  const selectLocality = (locality: string) => {
    const nextLocality = locality || ALL_LOCALITIES_VALUE;
    setSelectedLocality(nextLocality);
    updateLocationParams({ region: selectedRegion, city: selectedCity, locality: nextLocality });
  };

  useEffect(() => {
    setActiveBannerImage(bannerImageUrl || FALLBACK_BANNER_IMAGE);
  }, [bannerImageUrl]);

  // Modal State

  // Client-side Filtering & Sorting
  const filteredListings = useMemo(() => {
    return initialProperties
      .filter((item) => {
        if (transactionType === 'buy' && item.listingType !== 'SALE') return false;
        if (transactionType === 'rent' && item.listingType !== 'RENT') return false;

        if (selectedCategory !== 'all' && item.categorySlug !== selectedCategory) return false;

        if (selectedRegion !== ALL_REGIONS_VALUE && getRegionForCity(item.city) !== selectedRegion) return false;

        if (selectedCity !== ALL_CITIES_VALUE && !cityMatchesLocation(item.city, selectedCity)) return false;

        // 2. Locality filter
        if (selectedLocality !== ALL_LOCALITIES_VALUE && selectedLocality !== 'all') {
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
        return Number(b.isFeatured) - Number(a.isFeatured) ||
          a.sortOrder - b.sortOrder ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    initialProperties,
    selectedCategory,
    selectedRegion,
    selectedCity,
    transactionType,
    selectedLocality,
    selectedBhk,
    searchQuery,
  ]);

  const handleResetFilters = () => {
    setTransactionType('all');
    setSelectedRegion(ALL_REGIONS_VALUE);
    setSelectedCity(ALL_CITIES_VALUE);
    setSelectedLocality(ALL_LOCALITIES_VALUE);
    setSelectedBhk('all');
    setSelectedCategory('all');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('region');
    params.delete('city');
    params.delete('locality');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    setSearchQuery('');
  };

  const filterControls = (
    <>
      <div className="mb-3 flex items-center justify-between md:hidden">
        <h2 className="font-heading text-lg font-semibold text-[#1C1C1C]">Filters</h2>
        <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E2DA] text-[#1C1C1C]"><X className="h-5 w-5" /></button>
      </div>
      <QuickSearchFilter
        transactionType={transactionType}
        onTransactionChange={setTransactionType}
        region={selectedRegion}
        onRegionChange={selectRegion}
        city={selectedCity}
        onCityChange={selectCity}
        locality={selectedLocality}
        onLocalityChange={selectLocality}
        bhk={selectedBhk}
        onBhkChange={setSelectedBhk}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        distinctLocalities={selectedCity === ALL_CITIES_VALUE
          ? []
          : Array.from(new Set(initialProperties.filter((property) => cityMatchesLocation(property.city, selectedCity)).map((property) => property.locality).filter(Boolean)))}
        distinctBhkLabels={distinctBhkLabels}
        totalResultsCount={filteredListings.length}
        phone={phone}
        onReset={handleResetFilters}
      />
      <button type="button" onClick={() => setFiltersOpen(false)} className="mt-4 min-h-11 w-full bg-[#1C1C1C] px-5 py-3 text-sm font-semibold text-white md:hidden">Apply Filters ({filteredListings.length})</button>
    </>
  );

  const activeFilterCount = [
    transactionType !== 'all',
    selectedCategory !== 'all',
    selectedRegion !== ALL_REGIONS_VALUE,
    selectedCity !== ALL_CITIES_VALUE,
    selectedLocality !== ALL_LOCALITIES_VALUE && selectedLocality !== 'all',
    selectedBhk !== 'all',
    Boolean(searchQuery.trim()),
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-[#F8F5F1] min-h-screen">
      {/* 01. Hero Banner */}
      <section className="relative isolate overflow-hidden bg-[#24211d] text-white">
        {activeBannerImage && <Image
          key={activeBannerImage}
          src={activeBannerImage}
          alt="REALSPACE property listings"
          fill
          priority
          sizes="100vw"
          className="z-0 object-cover"
          onError={() => {
            if (activeBannerImage !== FALLBACK_BANNER_IMAGE) {
              setActiveBannerImage(FALLBACK_BANNER_IMAGE);
            }
          }}
        />}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/75 via-black/50 to-black/25" />
        <div className="relative z-10 mx-auto flex min-h-[230px] max-w-7xl flex-col justify-end px-4 pb-9 pt-16 sm:min-h-[290px] sm:px-8 sm:pb-12">
          <h1 className="font-heading text-3xl font-normal sm:text-4xl lg:text-5xl">Properties</h1>
          <nav aria-label="Breadcrumb" className="rera-properties-breadcrumb mt-4 text-xs text-white/80">
            <Link href={reraPath('/')} className="transition-colors hover:text-[#FECC00]">Home</Link>
            <span className="px-2 text-white/50">/</span>
            <span aria-current="page" className="text-white">Properties</span>
          </nav>
        </div>
      </section>

      {/* 02. Interactive Search & Filter Console (Ported QuickSearchFilter) */}
      <section className="relative z-20 mx-auto mt-4 max-w-7xl px-4 sm:-mt-6 sm:px-8">
        <div className="inline-flex max-w-full flex-col items-start gap-3">
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="rera-property-filters"
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex min-h-11 items-center gap-2 border border-[#E8E2DA] bg-white px-4 py-2 text-sm font-semibold text-[#1C1C1C] shadow-lg transition-colors hover:border-[#C8A96A] hover:text-[#8D6A2F]"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>{filtersOpen ? 'Hide Filters' : 'Filters'}</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1C1C1C] px-1 text-[11px] text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          {filtersOpen && !isMobileViewport && (
            <div id="rera-property-filters" className="w-full min-w-0 md:min-w-[min(100%,720px)]">
              {filterControls}
            </div>
          )}
        </div>
      </section>

      {filtersOpen && isMobileViewport && typeof document !== 'undefined' && createPortal(
        <>
          <button type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)} className="fixed inset-0 z-40 bg-black/45" />
          <div id="rera-property-filters" className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] min-w-0 overflow-y-auto rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            {filterControls}
          </div>
        </>,
        document.body
      )}

      {categories.length > 0 && (
        <nav aria-label="Filter properties by category" className="max-w-7xl mx-auto flex gap-2 overflow-x-auto px-4 pt-8 sm:px-8">
          <button type="button" onClick={() => selectCategory('all')} aria-pressed={selectedCategory === 'all'} className={`min-h-11 shrink-0 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${selectedCategory === 'all' ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white' : 'border-[#E8E2DA] bg-white text-[#6D6A66] hover:border-[#C8A96A]'}`}>All</button>
          {categories.map((category) => (
            <button key={category.id} type="button" onClick={() => selectCategory(category.slug)} aria-pressed={selectedCategory === category.slug} className={`min-h-11 shrink-0 border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${selectedCategory === category.slug ? 'border-[#1C1C1C] bg-[#1C1C1C] text-white' : 'border-[#E8E2DA] bg-white text-[#6D6A66] hover:border-[#C8A96A]'}`}>
              {category.name}
            </button>
          ))}
        </nav>
      )}

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
          <div className="rera-motion-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredListings.map((property) => (
              <div
                key={property.id}
                className="rera-motion-card luxury-card flex flex-col group overflow-hidden bg-white border border-[#D5E3F2] shadow-sm transition-all"
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

                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                  <div className="flex flex-1 flex-col items-center">
                    <Link href={`${reraPath('/properties')}/${property.slug}`}>
                      <h3 className="line-clamp-3 break-words font-heading text-lg font-bold uppercase text-[#1C1C1C] leading-snug group-hover:text-[#B78A47] transition-colors">
                        {property.title}
                      </h3>
                    </Link>

                    {property.description && (
                      <p className="mt-4 max-w-sm text-sm leading-6 text-[#6D6A66] line-clamp-3">
                        {property.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-5">
                    <Link
                      href={`${reraPath('/properties')}/${property.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] transition-colors hover:text-[#1769AA]"
                    >
                      Know More <ArrowRight className="h-4 w-4 text-[#36A8D2]" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
