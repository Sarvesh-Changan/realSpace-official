'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Building,
  MapPin,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Home,
  IndianRupee,
  Sparkles,
  Maximize2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { propertiesData } from '@/data/properties';
import { microMarkets, propertyConfigurations } from '@/data/navigation';
import { Property, TransactionType } from '@/types';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialMarket = searchParams.get('microMarket') || 'all';

  // State Management
  const [transactionType, setTransactionType] = useState<string>(
    initialCategory === 'commercial' ? 'commercial' : 'all'
  );
  const [selectedMarket, setSelectedMarket] = useState<string>(initialMarket);
  const [selectedConfig, setSelectedConfig] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [selectedPossession, setSelectedPossession] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'area_desc'>('featured');

  // Selected Property for Modal
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const openVisitModal = (title: string) => {
    window.dispatchEvent(
      new CustomEvent('open-consultation-modal', {
        detail: { interest: `Site Visit for ${title}` },
      })
    );
  };

  // Filter Computation
  const filteredListings = useMemo(() => {
    return propertiesData.filter((item) => {
      // Transaction type
      if (transactionType !== 'all') {
        if (transactionType === 'commercial') {
          if (item.category !== 'commercial' && item.transactionType !== 'commercial') return false;
        } else if (item.transactionType !== transactionType) {
          return false;
        }
      }

      // Micro-market
      if (selectedMarket !== 'all' && item.microMarket !== selectedMarket) {
        return false;
      }

      // Configuration
      if (selectedConfig !== 'all') {
        if (!item.configuration.toLowerCase().includes(selectedConfig.toLowerCase())) {
          return false;
        }
      }

      // Budget
      if (selectedBudget === 'under_80L' && item.priceNumeric > 8000000) return false;
      if (selectedBudget === '80L_150L' && (item.priceNumeric < 8000000 || item.priceNumeric > 15000000)) return false;
      if (selectedBudget === '150L_300L' && (item.priceNumeric < 15000000 || item.priceNumeric > 30000000)) return false;
      if (selectedBudget === 'above_300L' && item.priceNumeric < 30000000) return false;

      // Possession Status
      if (selectedPossession !== 'all' && item.possessionStatus !== selectedPossession) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesDev = item.developer?.toLowerCase().includes(q) ?? false;
        if (!matchesTitle && !matchesLoc && !matchesDev) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.priceNumeric - b.priceNumeric;
      if (sortBy === 'price_desc') return b.priceNumeric - a.priceNumeric;
      if (sortBy === 'area_desc') return b.carpetAreaSqFt - a.carpetAreaSqFt;
      // Default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [
    transactionType,
    selectedMarket,
    selectedConfig,
    selectedBudget,
    selectedPossession,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setTransactionType('all');
    setSelectedMarket('all');
    setSelectedConfig('all');
    setSelectedBudget('all');
    setSelectedPossession('all');
    setSearchQuery('');
    setSortBy('featured');
  };

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Properties Hero Banner */}
      <section className="bg-[#1C1C1C] text-white py-14 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            MahaRERA Registered Listings · Thane MMR
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal leading-tight max-w-3xl mb-4">
            Curated Real Estate Portfolio in Thane
          </h1>
          <p className="text-xs sm:text-base text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Explore verified luxury apartments, penthouses, lake-facing towers, and commercial IT spaces across Ghodbunder Road, Majiwada, and Teen Hath Naka.
          </p>
        </div>
      </section>

      {/* 02. Filter Console */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 relative z-20">
        <div className="bg-white border border-[#E8E2DA] p-5 sm:p-7 shadow-lg">
          {/* Segmented Transaction Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-[#E8E2DA] pb-4">
            {[
              { label: 'All Listings', value: 'all' },
              { label: 'Buy Residences', value: 'buy' },
              { label: 'Rent Residences', value: 'rent' },
              { label: 'Commercial & IT', value: 'commercial' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTransactionType(tab.value)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  transactionType === tab.value
                    ? 'bg-[#1C1C1C] text-[#C8A96A]'
                    : 'text-[#6D6A66] hover:text-[#1C1C1C] hover:bg-[#F8F5F1]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 5-Column Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. Micro-Market */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1">
                Thane Locality
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
              >
                {microMarkets.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Configuration */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1">
                Configuration
              </label>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
              >
                {propertyConfigurations.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Budget */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1">
                Budget Bracket
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
              >
                <option value="all">All Budgets</option>
                <option value="under_80L">Under ₹80 Lakhs</option>
                <option value="80L_150L">₹80L - ₹1.50 Cr</option>
                <option value="150L_300L">₹1.50 Cr - ₹3.00 Cr</option>
                <option value="above_300L">Above ₹3.00 Cr</option>
              </select>
            </div>

            {/* 4. Possession */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1">
                Possession Status
              </label>
              <select
                value={selectedPossession}
                onChange={(e) => setSelectedPossession(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs font-medium text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
              >
                <option value="all">All Timelines</option>
                <option value="Ready to Move">Ready to Move (OC Received)</option>
                <option value="Immediate">Immediate Possession</option>
                <option value="Dec 2026">Dec 2026 (Under Con)</option>
              </select>
            </div>

            {/* 5. Search Keyword */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#6D6A66] mb-1">
                Keyword or Builder
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. ACE, Lodha, Godrej..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-8 pr-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                />
                <Search className="w-3.5 h-3.5 text-[#6D6A66] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Results Status Bar */}
          <div className="mt-4 pt-3 border-t border-[#E8E2DA] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#6D6A66]">
              <span className="font-bold text-[#1C1C1C]">
                {filteredListings.length} Verified Properties Found
              </span>
              <span>·</span>
              <span>MahaRERA A51700001581</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#6D6A66]">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-semibold text-[#1C1C1C] focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="area_desc">Carpet Area: Largest</option>
                </select>
              </div>

              <button
                onClick={handleResetFilters}
                className="text-xs text-[#6D6A66] hover:text-[#1C1C1C] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Properties Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        {filteredListings.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E8E2DA]">
            <Building className="w-12 h-12 text-[#C8A96A] mx-auto mb-3" />
            <h3 className="font-heading text-xl font-bold text-[#1C1C1C] mb-2">
              No properties matched your current criteria
            </h3>
            <p className="text-xs text-[#6D6A66] max-w-md mx-auto mb-6 leading-relaxed">
              Arnav Properties holds private developer allocations and exclusive resale inventories in Thane not published online. Contact Vijay Chawan for off-market options.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 border border-[#1C1C1C] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Reset All Filters
              </button>
              <button
                onClick={() => openVisitModal('Off-Market Inventory Request')}
                className="px-5 py-2.5 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Inquire Off-Market Units
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredListings.map((property) => (
              <div
                key={property.id}
                className="luxury-card flex flex-col group overflow-hidden bg-white border border-[#E8E2DA]"
              >
                {/* Hero Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EEE6DD]">
                  <Image
                    src={property.heroImage}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#1C1C1C]/85 backdrop-blur-sm text-[#C8A96A] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                    {property.microMarket}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#1C1C1C] text-[10px] font-semibold uppercase tracking-wider px-2 py-1">
                    RERA: {property.reraId}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#C8A96A] uppercase tracking-wider mb-1">
                      <span>{property.configuration}</span>
                      <span className="text-[#6D6A66]">{property.carpetAreaSqFt} Sq.Ft</span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[#1C1C1C] leading-snug group-hover:text-[#B78A47] transition-colors mb-1">
                      {property.title}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-[#6D6A66] mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#C8A96A] shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </div>

                    <p className="text-xs text-[#6D6A66] line-clamp-2 leading-relaxed mb-4">
                      {property.subtitle}
                    </p>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                      <span className="px-2 py-0.5 bg-[#F8F5F1] text-[#444444] border border-[#E8E2DA]">
                        {property.possessionStatus}
                      </span>
                      <span className="px-2 py-0.5 bg-[#F8F5F1] text-[#444444] border border-[#E8E2DA]">
                        {property.furnishing}
                      </span>
                      {property.developer && (
                        <span className="px-2 py-0.5 bg-[#F8F5F1] text-[#444444] border border-[#E8E2DA]">
                          {property.developer}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-3 border-t border-[#E8E2DA] flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#A39E98]">
                        Price
                      </div>
                      <div className="text-sm font-bold text-[#1C1C1C]">
                        {property.priceDisplay}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProperty(property)}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C1C1C] border border-[#E8E2DA] hover:border-[#C8A96A] transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => openVisitModal(property.title)}
                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white transition-colors"
                      >
                        Visit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onBookVisit={openVisitModal}
      />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
