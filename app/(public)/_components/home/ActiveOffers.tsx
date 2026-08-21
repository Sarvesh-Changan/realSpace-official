"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag, ChevronLeft, ChevronRight } from "lucide-react";

export interface OfferType {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  ctaLabel: string;
  ctaLink: string;
}

interface ActiveOffersProps {
  offers: OfferType[];
}

export function ActiveOffers({ offers }: ActiveOffersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance logic (every 4 seconds)
  useEffect(() => {
    if (!offers || offers.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, offers]);

  // Hover / Touch interaction handling with delay
  const handlePause = () => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
  };

  const handleResume = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    // Short delay before resuming auto-advance
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1000);
  };

  // Zero-offers variant: render nothing
  if (!offers || offers.length === 0) {
    return null;
  }

  // Calculate relative distance for coverflow effect
  const getDistance = (i: number) => {
    const length = offers.length;
    let diff = (i - currentIndex) % length;

    // Adjust diff to handle circular wrapping correctly
    if (diff > Math.floor(length / 2)) {
      diff -= length;
    } else if (diff < -Math.floor(length / 2)) {
      diff += length;
    }

    return diff;
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  };

  return (
    <section className="w-full bg-[#F8F5F1] py-12 sm:py-16 md:py-24 overflow-hidden border-b border-[#E8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex items-center gap-3 mb-8 sm:mb-12">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#990000]/10 rounded-full flex items-center justify-center text-[#990000]">
            <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1C1C]">
            Active Offers
          </h2>
        </div>

        {/* Coverflow Carousel Track */}
        <div
          className="relative w-full h-[420px] sm:h-[460px] md:h-[500px] flex items-center justify-center"
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        >
          {/* Navigation Arrows */}
          {offers.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous offer"
                className="absolute left-1 sm:left-2 md:left-4 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 shadow-md border border-[#E8E2DA] text-[#1C1C1C] hover:bg-[#990000] hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#990000]"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next offer"
                className="absolute right-1 sm:right-2 md:right-4 z-40 p-3 rounded-full bg-white/90 shadow-md border border-[#E8E2DA] text-[#1C1C1C] hover:bg-[#990000] hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#990000]"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {offers.map((offer, index) => {
            const distance = getDistance(index);
            const isActive = distance === 0;
            const isLeft = distance === -1;
            const isRight = distance === 1;

            let transformClass = "";
            if (isActive) {
              transformClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-2xl";
            } else if (isLeft) {
              transformClass = "-translate-x-[102%] md:-translate-x-[85%] lg:-translate-x-[95%] scale-90 md:scale-75 opacity-70 hover:opacity-95 z-20 shadow-md cursor-pointer";
            } else if (isRight) {
              transformClass = "translate-x-[102%] md:translate-x-[85%] lg:translate-x-[95%] scale-90 md:scale-75 opacity-70 hover:opacity-95 z-20 shadow-md cursor-pointer";
            } else {
              const sign = distance > 0 ? 1 : -1;
              transformClass = `${sign > 0 ? 'translate-x-[180%]' : '-translate-x-[180%]'} scale-50 opacity-0 z-10 pointer-events-none`;
            }

            return (
              <div
                key={offer.id}
                onClick={() => !isActive && setCurrentIndex(index)}
                className={`absolute w-full max-w-[300px] sm:max-w-md lg:max-w-[480px] h-[420px] sm:h-[460px] md:h-[500px] bg-white rounded-2xl border border-[#E8E2DA] flex flex-col transition-all duration-700 ease-in-out will-change-transform overflow-hidden ${transformClass}`}
              >
                {/* Dynamic Image Container */}
                <div
                  className={`relative w-full shrink-0 transition-all duration-700 ease-in-out bg-[#EEE6DD] overflow-hidden ${
                    isActive ? 'h-[190px] sm:h-[220px] md:h-[240px]' : 'h-[420px] sm:h-[460px] md:h-[500px]'
                  }`}
                >
                  <Image
                    src={offer.imageUrl || "/images/placeholder-image.png"}
                    alt={offer.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={isActive}
                  />
                  {/* Accent Badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#FECC00] text-[#1C1C1C] text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wider">
                    Limited Time
                  </div>
                </div>

                {/* Content Block */}
                <div
                  className={`flex flex-col flex-grow transition-all duration-700 ease-in-out ${
                    isActive ? 'max-h-[300px] opacity-100 p-4 sm:p-6' : 'max-h-0 opacity-0 px-4 sm:px-6 py-0 overflow-hidden'
                  }`}
                >
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1C1C1C] mb-2 sm:mb-3 line-clamp-2">
                    {offer.title}
                  </h3>
                  <p className="text-[#6D6A66] mb-4 sm:mb-6 flex-grow line-clamp-3 text-xs sm:text-sm leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Prominent Clickable CTA */}
                  <Link
                    href={offer.ctaLink}
                    className={`mt-auto inline-flex items-center justify-center w-full min-h-[44px] bg-white border border-[#990000] text-[#990000] py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#990000] hover:text-white transition-colors duration-300 gap-2 group/btn ${
                      isActive ? '' : 'pointer-events-none'
                    }`}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {offer.ctaLabel}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Dot Indicators */}
        {offers.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8 md:mt-12 relative z-40">
            {offers.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to offer ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#990000] ${
                  index === currentIndex
                    ? "w-8 bg-[#990000]"
                    : "w-2.5 bg-[#990000]/30 hover:bg-[#990000]/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
