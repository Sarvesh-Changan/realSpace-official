"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

export interface OfferType {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  ctaLabel: string;
  ctaLink: string;
}

interface ActiveOffersProps {
  offers: OfferType[];
}

export function ActiveOffers({ offers }: ActiveOffersProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [itemsPerView, setItemsPerView] = useState(1);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle responsiveness
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Ensure index is within bounds when resizing
  const maxIndex = Math.max(0, offers ? offers.length - itemsPerView : 0);
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex]);

  // Auto-advance logic
  useEffect(() => {
    if (!offers || offers.length <= itemsPerView || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused, itemsPerView, offers, maxIndex]);

  // Zero-offers variant: render nothing
  if (!offers || offers.length === 0) {
    return null;
  }

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

  // Calculate total dots
  const totalDots = maxIndex + 1;

  return (
    <section className="w-full bg-[#F8F5F1] py-16 md:py-24 overflow-hidden border-b border-[#E8E2DA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#D6342C]/10 rounded-full flex items-center justify-center text-[#D6342C]">
            <Tag className="w-5 h-5" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1C1C1C]">
            Active Offers
          </h2>
        </div>

        <div
          className="relative w-full"
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
          onTouchStart={handlePause}
          onTouchEnd={handleResume}
        >
          {/* Carousel Track */}
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3 pb-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-[#E8E2DA] overflow-hidden h-full flex flex-col group hover:shadow-md transition-all duration-300">
                  {/* Image Container */}
                  <div className="relative w-full h-56 bg-[#EEE6DD] overflow-hidden">
                    <Image
                      src={offer.imageUrl || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800"}
                      alt={offer.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Accent Badge */}
                    <div className="absolute top-4 left-4 bg-[#F2B705] text-[#1C1C1C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Limited Time
                    </div>
                  </div>

                  {/* Content Block */}
                  <div className="flex flex-col flex-grow p-6">
                    <h3 className="text-xl font-bold text-[#1C1C1C] mb-3 line-clamp-2">
                      {offer.title}
                    </h3>
                    <p className="text-[#6D6A66] mb-6 flex-grow line-clamp-3 text-sm leading-relaxed">
                      {offer.description}
                    </p>

                    {/* Prominent CTA */}
                    <Link
                      href={offer.ctaLink}
                      className="mt-auto inline-flex items-center justify-center w-full bg-white border border-[#D6342C] text-[#D6342C] py-3 px-6 rounded-lg font-semibold hover:bg-[#D6342C] hover:text-white transition-colors duration-300 gap-2 group/btn"
                    >
                      {offer.ctaLabel}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          {totalDots > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalDots }).map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === currentIndex
                      ? "w-8 bg-[#D6342C]"
                      : "w-2 bg-[#D6342C]/20"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 