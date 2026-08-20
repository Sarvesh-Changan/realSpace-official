"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, X, Filter, Image as ImageIcon, Video } from "lucide-react";
import type { DesignType, MediaType } from "@prisma/client";

// --- Types ---

type BudgetRange = "UNDER_5L" | "5L_10L" | "10L_25L" | "ABOVE_25L";

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  mediaType: MediaType;
  category: string;
  designType: DesignType;
  theme?: string | null;
  approxBudgetLabel?: string | null;
  description?: string | null;
}

interface GalleryClientProps {
  categories: string[];
  images: GalleryItem[];
}

const BUDGET_OPTIONS = [
  { value: "ALL", label: "All Budgets" },
  { value: "UNDER_5L", label: "Under ₹5 Lakhs" },
  { value: "5L_10L", label: "₹5L - ₹10 Lakhs" },
  { value: "10L_25L", label: "₹10L - ₹25 Lakhs" },
  { value: "ABOVE_25L", label: "Above ₹25 Lakhs" },
];

const BRAND_COLORS = {
  kunkuRed: "#990000",
  haladYellow: "#FECC00",
};

function getBudgetRange(label?: string | null): BudgetRange | "ALL" {
  if (!label) return "ALL";
  const text = label.toLowerCase();

  if (text.includes("under 5") || text.includes("< 5") || text.includes("<5") || text.includes("4.") || text.includes("3.") || text.includes("2.")) {
    return "UNDER_5L";
  }

  const nums = text.match(/\d+(\.\d+)?/g)?.map(Number) || [];
  if (nums.length > 0) {
    const val = nums[0];
    if (val < 5) return "UNDER_5L";
    if (val >= 5 && val < 10) return "5L_10L";
    if (val >= 10 && val <= 25) return "10L_25L";
    if (val > 25) return "ABOVE_25L";
  }

  return "ALL";
}

function GalleryContent({ categories, images }: GalleryClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const systemReducedMotion = useReducedMotion();
  const shouldReduceMotion = isMounted ? !!systemReducedMotion : false;

  const initialCategory = useMemo(() => {
    if (categoryParam && categories.includes(categoryParam)) {
      return categoryParam;
    }
    return "All";
  }, [categoryParam, categories]);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeDesignType, setActiveDesignType] = useState<"ALL" | DesignType>("ALL");
  const [activeBudget, setActiveBudget] = useState<string>("ALL");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Close lightbox on Escape key press
  useEffect(() => {
    if (!lightboxItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxItem]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return images.filter((item) => {
      const matchCategory = activeCategory === "All" || item.category === activeCategory;
      const matchDesign = activeDesignType === "ALL" || item.designType === activeDesignType;
      
      let matchBudget = true;
      if (activeBudget !== "ALL") {
        const itemBudgetRange = getBudgetRange(item.approxBudgetLabel);
        matchBudget = itemBudgetRange === activeBudget || itemBudgetRange === "ALL";
      }

      return matchCategory && matchDesign && matchBudget;
    });
  }, [images, activeCategory, activeDesignType, activeBudget]);

  const clearFilters = () => {
    setActiveCategory("All");
    setActiveDesignType("ALL");
    setActiveBudget("ALL");
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#1C1C1C] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.4 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1C1C1C] mb-4">
            Our <span style={{ color: BRAND_COLORS.kunkuRed }}>Gallery</span>
          </h1>
          <p className="text-lg text-[#6D6A66]">
            Explore our curated portfolio of premium interior and exterior transformations across Thane and Mumbai.
          </p>
        </motion.div>

        {/* --- Filters Area --- */}
        <div className="mb-10 space-y-6">
          {/* Row 1: Category Pills */}
          <div className="relative">
            <div className="flex overflow-x-auto pb-4 scrollbar-hide gap-3 snap-x">
              {categories.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                      isActive
                        ? "border-transparent shadow-md"
                        : "bg-white border-[#E8E2DA] text-[#6D6A66] hover:border-[#990000] hover:text-[#990000]"
                    }`}
                    style={
                      isActive
                        ? { backgroundColor: BRAND_COLORS.kunkuRed, color: "#FFFFFF" }
                        : {}
                    }
                  >
                    {category}
                  </button>
                );
              })}
            </div>
            {/* Fade effect for scroll indicator */}
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#F8F5F1] to-transparent pointer-events-none md:hidden" />
          </div>

          {/* Row 2: Secondary Filters (Design Type & Budget) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E8E2DA] shadow-sm">
            {/* Interior / Exterior Toggle */}
            <div className="flex items-center bg-[#F8F5F1] p-1 rounded-lg border border-[#E8E2DA] w-full sm:w-auto">
              {(["ALL", "INTERIOR", "EXTERIOR"] as const).map((type) => {
                const isActive = activeDesignType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveDesignType(type)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-white text-[#1C1C1C] shadow-sm"
                        : "text-[#6D6A66] hover:text-[#1C1C1C]"
                    }`}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>

            {/* Budget Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#6D6A66]" />
              <select
                value={activeBudget}
                onChange={(e) => setActiveBudget(e.target.value)}
                className="w-full sm:w-auto bg-transparent border-none text-sm font-medium text-[#1C1C1C] focus:ring-0 cursor-pointer outline-none"
              >
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* --- Gallery Grid (Masonry using CSS columns) --- */}
        {filteredItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  layout={shouldReduceMotion ? false : "position"}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.01 : 0.35,
                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.04, 0.36),
                    ease: "easeOut",
                  }}
                  key={item.id}
                  className="break-inside-avoid relative group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8E2DA] shadow-sm transition-all duration-400 ease-out motion-safe:lg:hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] motion-safe:lg:hover:border-[#E8E2DA]/50"
                  onClick={() => setLightboxItem(item)}
                >
                  {/* Image/Thumbnail Container */}
                  <div className="relative w-full overflow-hidden bg-[#EEE6DD]">
                    <Image
                      src={item.url}
                      alt={item.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-cover transition-transform duration-400 ease-out motion-safe:lg:group-hover:scale-105"
                    />

                    {/* Dark Overlay on Hover (Gradient) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-400 ease-out motion-safe:lg:group-hover:opacity-100 pointer-events-none" />

                    {/* Video Indicator */}
                    {item.mediaType === "VIDEO" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md bg-white/30 border border-white/50 shadow-lg transition-transform duration-400 ease-out motion-safe:lg:group-hover:scale-110"
                          style={{ color: BRAND_COLORS.haladYellow }}
                        >
                          <Play className="w-6 h-6 fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 transition-transform duration-400 ease-out motion-safe:lg:group-hover:-translate-y-1.5">
                      <span
                        className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-full shadow-sm"
                        style={{ backgroundColor: BRAND_COLORS.kunkuRed }}
                      >
                        {item.category}
                      </span>
                    </div>

                    {/* Media Type Icon (Top Right) */}
                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-md text-[#1C1C1C] transition-transform duration-400 ease-out motion-safe:lg:group-hover:-translate-y-1.5">
                      {item.mediaType === "VIDEO" ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-5 border-t border-[#E8E2DA] bg-white relative z-10">
                    <h3 className="text-lg font-serif font-bold text-[#1C1C1C] mb-2 transition-all duration-400 ease-out group-hover:text-[#990000] motion-safe:lg:group-hover:-translate-y-1">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#6D6A66] transition-transform duration-400 ease-out motion-safe:lg:group-hover:-translate-y-1">
                      {item.theme && (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E8E2DA]" />
                          {item.theme}
                        </span>
                      )}
                      {item.approxBudgetLabel && (
                        <span
                          className="flex items-center gap-1.5 font-medium"
                          style={{ color: BRAND_COLORS.kunkuRed }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: BRAND_COLORS.haladYellow }}
                          />
                          {item.approxBudgetLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 px-4 text-center bg-white rounded-2xl border border-[#E8E2DA] border-dashed"
          >
            <div className="w-16 h-16 bg-[#EEE6DD] rounded-full flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-[#6D6A66]" />
            </div>
            <h3 className="text-xl font-bold text-[#1C1C1C] mb-2">No projects found</h3>
            <p className="text-[#6D6A66] max-w-md mx-auto mb-6">
              We couldn't find any gallery items matching your current filters. Try adjusting your category or budget range.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 rounded-md font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: BRAND_COLORS.kunkuRed }}
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* --- Lightbox Modal --- */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.25 }}
            onClick={() => setLightboxItem(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-sm"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxItem(null);
              }}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-[#1C1C1C] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left/Top: Image/Video Container */}
              <div className="relative w-full md:w-2/3 h-[40vh] md:h-auto min-h-[300px] bg-black flex items-center justify-center">
                {lightboxItem.mediaType === "VIDEO" ? (
                  <video
                    src={lightboxItem.url}
                    controls
                    autoPlay
                    className="w-full h-full object-contain max-h-[75vh]"
                  />
                ) : (
                  <Image
                    src={lightboxItem.url}
                    alt={lightboxItem.title}
                    fill
                    className="object-contain"
                  />
                )}
              </div>

              {/* Right/Bottom: Content Details */}
              <div className="w-full md:w-1/3 bg-white p-6 md:p-8 flex flex-col overflow-y-auto">
                <div className="mb-6 flex gap-2">
                  <span
                    className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white rounded-md"
                    style={{ backgroundColor: BRAND_COLORS.kunkuRed }}
                  >
                    {lightboxItem.category}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#F8F5F1] text-[#6D6A66] rounded-md border border-[#E8E2DA]">
                    {lightboxItem.designType}
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#1C1C1C] mb-4">
                  {lightboxItem.title}
                </h2>

                {lightboxItem.description && (
                  <p className="text-[#6D6A66] leading-relaxed mb-8">
                    {lightboxItem.description}
                  </p>
                )}

                <div className="mt-auto pt-6 border-t border-[#E8E2DA] space-y-4">
                  {lightboxItem.theme && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6D6A66]">Design Theme</span>
                      <span className="font-medium text-[#1C1C1C]">{lightboxItem.theme}</span>
                    </div>
                  )}
                  {lightboxItem.approxBudgetLabel && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#6D6A66]">Est. Budget</span>
                      <span
                        className="font-bold text-lg"
                        style={{ color: BRAND_COLORS.kunkuRed }}
                      >
                        {lightboxItem.approxBudgetLabel}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA inside Modal */}
                <button
                  className="w-full mt-8 py-4 rounded-lg font-bold text-white transition-opacity hover:opacity-90 shadow-md"
                  style={{ backgroundColor: BRAND_COLORS.kunkuRed }}
                  onClick={() => (window.location.href = "/quote")}
                >
                  Get a Free Quote
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GalleryClient(props: GalleryClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F1] pt-24 pb-20" />}>
      <GalleryContent {...props} />
    </Suspense>
  );
}
