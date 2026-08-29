"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export interface GallerySliderItem {
  id: string;
  imageUrl: string;
  title?: string;
  altText?: string;
}

export interface GallerySliderProps {
  items?: GallerySliderItem[];
}

const FALLBACK_SLIDES: GallerySliderItem[] = [
  {
    id: "fb-1",
    imageUrl: "/images/home/gallery/living.jpeg",
    altText: "Bespoke REALSPACE living room interior design",
  },
  {
    id: "fb-2",
    imageUrl: "/images/home/gallery/bedroom.jpeg",
    altText: "Luxury REALSPACE master bedroom interior design",
  },
  {
    id: "fb-3",
    imageUrl: "/images/home/gallery/kitchen.jpeg",
    altText: "Modern REALSPACE modular kitchen design",
  },
  {
    id: "fb-4",
    imageUrl: "/images/home/gallery/mandir.jpeg",
    altText: "Elegant REALSPACE mandir and pooja room design",
  },
  {
    id: "fb-5",
    imageUrl: "/images/home/gallery/working.jpeg",
    altText: "Crafted REALSPACE executive home workspace interior",
  },
];

export function GallerySlider({ items = [] }: GallerySliderProps) {
  // Combine provided items with fallbacks to ensure exactly 5 images
  const slides = React.useMemo(() => {
    const validItems = items.filter((item) => Boolean(item.imageUrl?.trim()));
    const merged = [...validItems];

    for (const fallback of FALLBACK_SLIDES) {
      if (merged.length >= 5) break;
      if (!merged.some((m) => m.imageUrl === fallback.imageUrl)) {
        merged.push(fallback);
      }
    }

    return merged.slice(0, 5);
  }, [items]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const shouldReduceMotion = isMounted && Boolean(prefersReducedMotion);

  // Tab visibility tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance timer (disabled on hover, tab hidden, or reduced motion)
  useEffect(() => {
    if (shouldReduceMotion || isHovered || !isTabVisible || slides.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [nextSlide, shouldReduceMotion, isHovered, isTabVisible, slides.length]);

  // Keyboard navigation when focused or hovered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      // Check if mouse is over container or active element inside container
      const isHoveredOrFocused =
        containerRef.current.contains(document.activeElement) ||
        containerRef.current.matches(":hover");

      if (isHoveredOrFocused) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prevSlide();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          nextSlide();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch handlers for manual swipe gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX.current - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const slideVariants = {
    initial: (dir: number) =>
      shouldReduceMotion
        ? { opacity: 0 }
        : {
            opacity: 0,
            scale: 1.06,
          },
    animate: {
      opacity: 1,
      scale: 1.0,
      transition: {
        opacity: { duration: shouldReduceMotion ? 0.3 : 0.9, ease: [0.25, 1, 0.5, 1] as const },
        scale: { duration: shouldReduceMotion ? 0 : 1.2, ease: [0.25, 1, 0.5, 1] as const },
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: shouldReduceMotion ? 0.3 : 0.7,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      aria-label="REALSPACE Gallery Visual Showcase"
      className="relative h-[100dvh] w-full max-w-full overflow-hidden bg-brand-dark select-none focus:outline-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={currentSlide.id || currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 h-full w-full"
        >
          <Image
            src={getCloudinaryUrl(currentSlide.imageUrl, { width: 1920, quality: 85, crop: "fill" })}
            alt={currentSlide.altText || currentSlide.title || "REALSPACE interior design showcase"}
            fill
            priority={currentIndex === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle gradient vignette at top and bottom for smooth blending */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Manual Navigation Controls */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous image"
            className="absolute left-4 sm:left-8 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white/90 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-brand-yellow hover:bg-black/65 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-yellow"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next image"
            className="absolute right-4 sm:right-8 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white/90 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-brand-yellow hover:bg-black/65 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-yellow"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}
