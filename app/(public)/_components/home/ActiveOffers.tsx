"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

export interface OfferType {
  id: string;
  title?: string | null;
  description?: string | null;
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

  // Auto-advance logic (every 5 seconds)
  useEffect(() => {
    if (!offers || offers.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, offers]);

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
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1000);
  };

  if (!offers || offers.length === 0) {
    return null;
  }

  const getDistance = (i: number) => {
    const length = offers.length;
    let diff = (i - currentIndex) % length;

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
    <section className="w-full bg-brand-cream/40 py-8 sm:py-12 border-b border-brand-border/40 overflow-hidden">
      <div className="max-w-standard mx-auto px-4 sm:px-6 lg:px-8">
        {/* Coverflow Track */}
        <div
          className="relative w-full h-[310px] sm:h-[330px] flex items-center justify-center"
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
                className="absolute left-2 sm:left-6 md:left-12 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 shadow-md border border-brand-borderLight text-brand-text hover:bg-brand-red hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next offer"
                className="absolute right-2 sm:right-6 md:right-12 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 shadow-md border border-brand-borderLight text-brand-text hover:bg-brand-red hover:text-white transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red"
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
              transformClass = "translate-x-0 scale-100 opacity-100 z-30 shadow-xl border-brand-border/80";
            } else if (isLeft) {
              transformClass = "-translate-x-[75%] sm:-translate-x-[80%] scale-90 opacity-70 hover:opacity-90 z-20 shadow-md cursor-pointer";
            } else if (isRight) {
              transformClass = "translate-x-[75%] sm:translate-x-[80%] scale-90 opacity-70 hover:opacity-90 z-20 shadow-md cursor-pointer";
            } else {
              const sign = distance > 0 ? 1 : -1;
              transformClass = `${sign > 0 ? 'translate-x-[160%]' : '-translate-x-[160%]'} scale-75 opacity-0 z-10 pointer-events-none`;
            }

            return (
              <div
                key={offer.id}
                onClick={() => !isActive && setCurrentIndex(index)}
                className={`absolute w-full max-w-[290px] sm:max-w-[320px] h-[290px] sm:h-[310px] bg-white rounded-2xl border border-brand-borderLight flex flex-col transition-all duration-500 ease-in-out will-change-transform overflow-hidden ${transformClass}`}
              >
                {/* Image Banner */}
                <div className="relative w-full h-[210px] sm:h-[225px] bg-brand-bgAlt shrink-0 overflow-hidden">
                  <OptimizedImage
                    src={offer.imageUrl}
                    alt={offer.ctaLabel || "Promotional Offer"}
                    fill
                    sizes="(max-width: 640px) 290px, 320px"
                    className="object-cover"
                    priority={isActive}
                  />
                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-brand-yellow text-brand-dark text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    LIMITED TIME
                  </div>
                </div>

                {/* Bottom CTA Block */}
                <div className="flex flex-col flex-grow p-3.5 sm:p-4 justify-center bg-white">
                  <Link
                    href={offer.ctaLink}
                    className={`inline-flex items-center justify-center w-full min-h-[40px] bg-white border border-brand-red text-brand-red hover:bg-brand-red hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 gap-1.5 group/btn ${
                      isActive ? '' : 'pointer-events-none'
                    }`}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {offer.ctaLabel || "Claim Offer"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Dot Indicators */}
        {offers.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 relative z-40">
            {offers.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to offer ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red ${
                  index === currentIndex
                    ? "w-6 bg-brand-red"
                    : "w-2 bg-brand-red/30 hover:bg-brand-red/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
