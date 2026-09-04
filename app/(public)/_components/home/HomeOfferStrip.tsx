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

  useEffect(() => {
    if (offerList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offerList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [offerList.length]);

  if (offerList.length === 0) {
    return null;
  }

  const currentOffer = offerList[currentIndex] || offerList[0];

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
    <ScrollReveal direction="down" distance={12} duration={0.4} className="w-full bg-brand-red text-white border-b border-brand-red/80 shadow-xs">
      <div className="max-w-standard mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-center sm:text-left text-xs sm:text-sm font-medium">
        <div className="flex items-center justify-center sm:justify-start gap-2.5 truncate w-full sm:w-auto">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 text-white shrink-0">
            <Tag className="w-3 h-3" /> Special Offer {offerList.length > 1 ? `(${currentIndex + 1}/${offerList.length})` : ""}
          </span>
          <span className="truncate transition-opacity duration-300">{textToShow}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={currentOffer.ctaLink || "/contact"}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:text-amber-200 transition-colors group"
          >
            <span>{currentOffer.ctaLabel || "Claim Offer"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          {offerList.length > 1 && (
            <div className="flex items-center gap-1 pl-2 border-l border-white/20">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
                title="Previous Offer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
                title="Next Offer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </ScrollReveal>
  );
}
