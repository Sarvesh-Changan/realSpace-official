"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface HomeOfferStripOffer {
  id?: string;
  title?: string | null;
  description?: string | null;
  ctaLabel: string;
  ctaLink: string;
}

interface HomeOfferStripProps {
  offers?: HomeOfferStripOffer[] | HomeOfferStripOffer | null;
}

export function HomeOfferStrip({ offers }: HomeOfferStripProps) {
  const offerList: HomeOfferStripOffer[] = Array.isArray(offers)
    ? offers
    : offers
    ? [offers]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || offerList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offerList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isMounted, offerList.length]);

  if (offerList.length === 0) {
    return null;
  }

  const activeIndex = isMounted ? currentIndex : 0;
  const currentOffer = offerList[activeIndex] || offerList[0];

  const textToShow =
    currentOffer.title?.trim() ||
    (currentOffer.description?.trim()
      ? currentOffer.description.trim().length > 90
        ? `${currentOffer.description.trim().substring(0, 90)}...`
        : currentOffer.description.trim()
      : "Special Limited-Time Promotion");

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + offerList.length) % offerList.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offerList.length);
  };

  return (
    <ScrollReveal
      direction="down"
      distance={12}
      duration={0.4}
      className="relative w-full overflow-hidden bg-gradient-to-r from-brand-red via-red-700 to-brand-redHover text-white border-b border-brand-red/80 shadow-md"
    >
      <div className="relative z-10 max-w-standard mx-auto px-4 py-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-center sm:text-left text-sm sm:text-base font-bold">
        <div className="flex items-center justify-center sm:justify-start gap-2.5 truncate w-full sm:w-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white shrink-0 shadow-xs border border-white/20">
            <Tag className="w-3.5 h-3.5 text-amber-300" /> Special Offer {offerList.length > 1 ? `(${activeIndex + 1}/${offerList.length})` : ""}
          </span>
          <span className="truncate font-bold text-white tracking-wide transition-all duration-300">
            {textToShow}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={currentOffer.ctaLink || "/contact"}
            className="inline-flex items-center gap-1.5 font-bold underline underline-offset-4 hover:text-amber-300 hover:scale-105 transition-all group duration-200"
          >
            <span className="group-hover:tracking-wider transition-all">{currentOffer.ctaLabel || "Claim Offer"}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {offerList.length > 1 && (
            <div className="flex items-center gap-1 pl-2 border-l border-white/30">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 hover:bg-white/25 active:scale-95 rounded transition-all cursor-pointer"
                title="Previous Offer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 hover:bg-white/25 active:scale-95 rounded transition-all cursor-pointer"
                title="Next Offer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}
