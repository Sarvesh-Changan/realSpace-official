"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Play, X, Filter, Image as ImageIcon, Video, ArrowLeft, ArrowRight, Folder, Grid } from "lucide-react";
import type { DesignType, MediaType } from "@prisma/client";
import { getVideoThumbnailUrl } from "@/lib/cloudinary";

// --- Types ---

type BudgetRange = "UNDER_5L" | "5L_10L" | "10L_25L" | "ABOVE_25L";

export interface CategoryFolder {
  id: string;
  name: string;
  count: number;
  coverUrl: string;
  coverMediaType: "IMAGE" | "VIDEO";
}

export interface GalleryItem {
  id: string;
  title: string;
  url: string;
  mediaType: MediaType;
  categoryId: string;
  category: string;
  designType: DesignType;
  theme?: string | null;
  approxBudgetLabel?: string | null;
  description?: string | null;
  isCategoryCover?: boolean;
}

interface GalleryClientProps {
  categoryFolders: CategoryFolder[];
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

function GalleryContent({ categoryFolders, images }: GalleryClientProps) {
  const searchParams = useSearchParams();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const systemReducedMotion = useReducedMotion();
  const shouldReduceMotion = isMounted ? !!systemReducedMotion : false;

  const [selectedFolder, setSelectedFolder] = useState<CategoryFolder | null>(null);
  const [activeDesignType, setActiveDesignType] = useState<"ALL" | DesignType>("ALL");
  const [activeBudget, setActiveBudget] = useState<string>("ALL");
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Helper for shallow URL updates without full page reloads
  const updateUrl = (catId?: string | null, imgId?: string | null) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (catId) params.set("category", catId);
    if (imgId) params.set("image", imgId);
    const newUrl = params.toString() ? `/gallery?${params.toString()}` : "/gallery";
    window.history.pushState(null, "", newUrl);
  };

  // Sync state on direct page load or browser URL change
  useEffect(() => {
    const catParam = searchParams.get("category");
    const imgParam = searchParams.get("image");

    if (catParam) {
      const foundFolder = categoryFolders.find(
        (f) => f.id === catParam || f.name.toLowerCase() === catParam.toLowerCase()
      );
      if (foundFolder) {
        setSelectedFolder(foundFolder);

        if (imgParam) {
          const foundImg = images.find(
            (i) => i.id === imgParam || i.title.toLowerCase() === imgParam.toLowerCase()
          );
          if (foundImg && foundImg.categoryId === foundFolder.id) {
            setLightboxItem(foundImg);
          } else {
            setLightboxItem(null);
          }
        } else {
          setLightboxItem(null);
        }
      } else {
        setSelectedFolder(null);
        setLightboxItem(null);
      }
    } else {
      setSelectedFolder(null);
      setLightboxItem(null);
    }
  }, [searchParams, categoryFolders, images]);

  // Handle selecting a category folder
  const handleSelectFolder = (folder: CategoryFolder) => {
    setSelectedFolder(folder);
    setActiveDesignType("ALL");
    setActiveBudget("ALL");
    setLightboxItem(null);
    updateUrl(folder.id, null);
  };

  // Handle returning to category grid view
  const handleBackToFolders = () => {
    setSelectedFolder(null);
    setActiveDesignType("ALL");
    setActiveBudget("ALL");
    setLightboxItem(null);
    updateUrl(null, null);
  };

  // Handle opening lightbox
  const handleOpenLightbox = (item: GalleryItem) => {
    setLightboxItem(item);
    updateUrl(selectedFolder?.id || item.categoryId, item.id);
  };

  // Handle closing lightbox
  const handleCloseLightbox = () => {
    setLightboxItem(null);
    updateUrl(selectedFolder?.id || null, null);
  };

  // Close lightbox on Escape key press
  useEffect(() => {
    if (!lightboxItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseLightbox();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxItem, selectedFolder]);

  // Filter Items within the selected category
  const categoryItems = useMemo(() => {
    if (!selectedFolder) return [];
    return images.filter((item) => item.categoryId === selectedFolder.id);
  }, [images, selectedFolder]);

  const filteredItems = useMemo(() => {
    return categoryItems.filter((item) => {
      const matchDesign = activeDesignType === "ALL" || item.designType === activeDesignType;
      
      let matchBudget = true;
      if (activeBudget !== "ALL") {
        const itemBudgetRange = getBudgetRange(item.approxBudgetLabel);
        matchBudget = itemBudgetRange === activeBudget || itemBudgetRange === "ALL";
      }

      return matchDesign && matchBudget;
    });
  }, [categoryItems, activeDesignType, activeBudget]);

  const clearDetailFilters = () => {
    setActiveDesignType("ALL");
    setActiveBudget("ALL");
  };

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#1C1C1C] pt-20 sm:pt-24 pb-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* VIEW 1: TOP-LEVEL CATEGORY FOLDERS GRID (DEFAULT / LANDING VIEW)         */}
        {/* ========================================================================= */}
        {!selectedFolder ? (
          <div>
            {/* Header Section */}
            <motion.div
              className="text-center max-w-3xl mx-auto mb-10 sm:mb-14"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.4 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#1C1C1C] mb-3 sm:mb-4">
                Design <span style={{ color: BRAND_COLORS.kunkuRed }}>Gallery</span>
              </h1>
              <p className="text-sm sm:text-base text-[#6D6A66] max-w-xl mx-auto">
                Explore our curated portfolio categories of interior & exterior design inspirations. Click any category to view full project photos and videos.
              </p>
            </motion.div>

            {/* Category Folders Grid */}
            {categoryFolders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {categoryFolders.map((folder, index) => {
                  const coverSrc = folder.coverUrl && folder.coverUrl.trim() !== "" ? folder.coverUrl : "/images/placeholder-image.png";

                  return (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0.01 : 0.35,
                        delay: shouldReduceMotion ? 0 : Math.min(index * 0.05, 0.4),
                      }}
                      onClick={() => handleSelectFolder(folder)}
                      className="group relative flex flex-col cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8E2DA] shadow-sm hover:shadow-xl transition-all duration-300 ease-out"
                    >
                      {/* Thumbnail Container (4:3 Aspect Ratio) */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#EEE6DD]">
                        <Image
                          src={getVideoThumbnailUrl(coverSrc, folder.coverMediaType)}
                          alt={folder.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          unoptimized={folder.coverMediaType === "VIDEO"}
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Top Right: Photo Count Badge */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                          <span className="px-3 py-1 text-xs font-semibold text-white bg-black/50 backdrop-blur-md rounded-full border border-white/20 shadow-sm flex items-center gap-1.5">
                            <Folder className="w-3.5 h-3.5 text-[#FECC00]" />
                            {folder.count} {folder.count === 1 ? "photo" : "photos"}
                          </span>
                        </div>

                        {/* Bottom Overlay Text: Category Name & Explore Link */}
                        <div className="absolute bottom-0 inset-x-0 p-5 text-white z-10 flex flex-col justify-end">
                          <h3 className="text-xl sm:text-2xl font-serif font-bold group-hover:text-[#FECC00] transition-colors leading-tight">
                            {folder.name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 font-medium mt-1.5 group-hover:translate-x-1 transition-transform">
                            <span>Browse Collection</span>
                            <ArrowRight className="w-4 h-4 text-[#FECC00]" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E8E2DA] p-8">
                <Grid className="w-12 h-12 text-[#6D6A66] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#1C1C1C]">No categories available</h3>
                <p className="text-sm text-[#6D6A66] mt-1">Please check back soon for updated design inspiration.</p>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: CATEGORY DETAIL VIEW (IMAGES GRID + FILTERS + BACK BUTTON)       */
          /* ========================================================================= */
          <div>
            {/* Navigation / Breadcrumb Header */}
            <motion.div
              className="mb-6 sm:mb-8"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3 }}
            >
              <button
                type="button"
                onClick={handleBackToFolders}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#6D6A66] bg-white border border-[#E8E2DA] rounded-full hover:border-[#990000] hover:text-[#990000] transition-colors shadow-xs mb-4 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Categories
              </button>

              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#E8E2DA] pb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#1C1C1C]">
                    {selectedFolder.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#6D6A66] mt-1">
                    Displaying {filteredItems.length} of {selectedFolder.count} published designs in this category.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Secondary Filters Bar (Interior/Exterior Toggle & Budget Filter ONLY within Detail View) */}
            <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-4 rounded-xl border border-[#E8E2DA] shadow-sm">
              {/* Interior / Exterior Toggle */}
              <div className="flex items-center bg-[#F8F5F1] p-1 rounded-lg border border-[#E8E2DA] w-full sm:w-auto">
                {(["ALL", "INTERIOR", "EXTERIOR"] as const).map((type) => {
                  const isActive = activeDesignType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveDesignType(type)}
                      className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[38px] cursor-pointer ${
                        isActive
                          ? "bg-white text-[#1C1C1C] shadow-sm font-semibold"
                          : "text-[#6D6A66] hover:text-[#1C1C1C]"
                      }`}
                    >
                      {type === "ALL" ? "All Designs" : type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>

              {/* Budget Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto bg-[#F8F5F1] sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg sm:rounded-none border sm:border-none border-[#E8E2DA] min-h-[40px]">
                <Filter className="w-4 h-4 text-[#6D6A66] shrink-0" />
                <select
                  value={activeBudget}
                  onChange={(e) => setActiveBudget(e.target.value)}
                  className="w-full sm:w-auto bg-transparent border-none text-xs sm:text-sm font-medium text-[#1C1C1C] focus:ring-0 cursor-pointer outline-none"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Images Grid */}
            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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
                      className="relative flex flex-col group cursor-pointer bg-white rounded-2xl overflow-hidden border border-[#E8E2DA] shadow-sm transition-all duration-400 ease-out motion-safe:lg:hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.12)] motion-safe:lg:hover:border-[#E8E2DA]/50 h-full"
                      onClick={() => handleOpenLightbox(item)}
                    >
                      {/* Image/Thumbnail Container (Fixed 4:3 Aspect Ratio) */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#EEE6DD]">
                        <Image
                          src={getVideoThumbnailUrl(item.url, item.mediaType)}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-400 ease-out motion-safe:lg:group-hover:scale-105"
                          unoptimized={item.mediaType === "VIDEO"}
                        />

                        {/* Dark Overlay on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 transition-opacity duration-400 ease-out motion-safe:lg:group-hover:opacity-100 pointer-events-none" />

                        {/* Video Indicator */}
                        {item.mediaType === "VIDEO" && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center backdrop-blur-md bg-white/30 border border-white/50 shadow-lg transition-transform duration-400 ease-out motion-safe:lg:group-hover:scale-110"
                              style={{ color: BRAND_COLORS.haladYellow }}
                            >
                              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                            </div>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 transition-transform duration-400 ease-out motion-safe:lg:group-hover:-translate-y-1.5">
                          <span
                            className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white rounded-full shadow-sm"
                            style={{ backgroundColor: BRAND_COLORS.kunkuRed }}
                          >
                            {item.category}
                          </span>
                          {item.isCategoryCover && (
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1C1C1C] bg-[#FECC00] rounded-full shadow-sm">
                              Cover
                            </span>
                          )}
                        </div>

                        {/* Media Type Icon (Top Right) */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-md text-[#1C1C1C] transition-transform duration-400 ease-out motion-safe:lg:group-hover:-translate-y-1.5">
                          {item.mediaType === "VIDEO" ? (
                            <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          )}
                        </div>
                      </div>

                      {/* Card Content Footer */}
                      <div className="p-4 sm:p-5 border-t border-[#E8E2DA] bg-white relative z-10 flex-1 flex flex-col justify-between">
                        <h3 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C] line-clamp-2 transition-all duration-400 ease-out group-hover:text-[#990000] motion-safe:lg:group-hover:-translate-y-1">
                          {item.title}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty Detail State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 text-center bg-white rounded-2xl border border-[#E8E2DA] border-dashed"
              >
                <div className="w-14 h-14 bg-[#EEE6DD] rounded-full flex items-center justify-center mb-4">
                  <Filter className="w-7 h-7 text-[#6D6A66]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-[#1C1C1C] mb-2">No matching photos found</h3>
                <p className="text-xs sm:text-sm text-[#6D6A66] max-w-md mx-auto mb-6">
                  There are no media items in &quot;{selectedFolder.name}&quot; matching your active design or budget filters.
                </p>
                <button
                  type="button"
                  onClick={clearDetailFilters}
                  className="px-5 py-2.5 min-h-[44px] text-xs sm:text-sm rounded-md font-medium text-white transition-colors hover:opacity-90 cursor-pointer"
                  style={{ backgroundColor: BRAND_COLORS.kunkuRed }}
                >
                  Reset Category Filters
                </button>
              </motion.div>
            )}
          </div>
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
            onClick={handleCloseLightbox}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-4 md:p-8 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseLightbox();
              }}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center bg-black/60 sm:bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl bg-[#1C1C1C] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[88vh] sm:max-h-[90vh]"
            >
              {/* Media Container */}
              <div className="relative w-full md:w-2/3 h-[32vh] sm:h-[45vh] md:h-auto min-h-[220px] bg-black flex items-center justify-center shrink-0">
                {lightboxItem.mediaType === "VIDEO" ? (
                  <video
                    src={lightboxItem.url}
                    controls
                    autoPlay
                    playsInline
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

              {/* Content Details */}
              <div className="w-full md:w-1/3 bg-white p-5 sm:p-6 md:p-8 flex flex-col justify-center overflow-y-auto flex-1">
                <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
                  <span
                    className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white rounded-md"
                    style={{ backgroundColor: BRAND_COLORS.kunkuRed }}
                  >
                    {lightboxItem.category}
                  </span>
                  <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-[#F8F5F1] text-[#6D6A66] rounded-md border border-[#E8E2DA]">
                    {lightboxItem.designType}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#1C1C1C]">
                  {lightboxItem.title}
                </h2>
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
