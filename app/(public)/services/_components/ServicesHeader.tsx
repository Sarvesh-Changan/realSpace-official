"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { DoorOpen } from "lucide-react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

interface ServicesHeaderProps {
  title: string;
  intro: string;
}

const FRAME_COUNT = 36;
const FRAME_INTERVAL_MS = 1000 / 24;
const FRAME_PATHS = Array.from(
  { length: FRAME_COUNT },
  (_, index) => `/images/swastik/frames/frame-${String(index + 1).padStart(2, "0")}.webp`,
);
const FALLBACK_FRAME_PATH = "/images/swastik-kunku-halad-traditional.svg";

function SwastikIntroMark() {
  const markRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);
  const shouldPlayRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [frameIndex, setFrameIndex] = useState(FRAME_COUNT - 1);
  const [hasFrameAssets, setHasFrameAssets] = useState(true);

  const play = useCallback(() => {
    if (!readyRef.current || shouldReduceMotion) return;

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    let currentFrame = 0;
    let lastFrameTime = 0;

    const renderNextFrame = (timestamp: number) => {
      if (timestamp - lastFrameTime >= FRAME_INTERVAL_MS) {
        lastFrameTime = timestamp;
        currentFrame += 1;

        if (currentFrame >= FRAME_COUNT) {
          animationFrameRef.current = null;
          setFrameIndex(FRAME_COUNT - 1);
          return;
        }

        setFrameIndex(currentFrame);
      }

      animationFrameRef.current = window.requestAnimationFrame(renderNextFrame);
    };

    setFrameIndex(0);
    animationFrameRef.current = window.requestAnimationFrame(renderNextFrame);
  }, [shouldReduceMotion]);

  useEffect(() => {
    const mark = markRef.current;
    if (!mark) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    const preloadFrames = async () => {
      const frameResults = await Promise.all(
        FRAME_PATHS.map(
          (src) =>
            new Promise<boolean>((resolve) => {
              const image = new window.Image();
              image.onload = () => resolve(true);
              image.onerror = () => resolve(false);
              image.src = src;
            }),
        ),
      );

      if (cancelled) return;

      const allFramesLoaded = frameResults.every(Boolean);
      setHasFrameAssets(allFramesLoaded);
      readyRef.current = allFramesLoaded;

      if (allFramesLoaded && shouldPlayRef.current) {
        play();
      }
    };

    preloadFrames();

    if (shouldReduceMotion) {
      return () => {
        cancelled = true;
        if (animationFrameRef.current !== null) {
          window.cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          shouldPlayRef.current = true;
          if (readyRef.current) play();
          observer?.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(mark);

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [play, shouldReduceMotion]);

  return (
    <div ref={markRef} className="relative w-full max-w-[580px] aspect-[580/350]" aria-hidden="true">
      <Image
        src={hasFrameAssets ? FRAME_PATHS[frameIndex] : FALLBACK_FRAME_PATH}
        alt=""
        fill
        sizes="(max-width: 767px) 100vw, 580px"
        className="object-contain"
        priority
        onError={() => setHasFrameAssets(false)}
      />
    </div>
  );
}

export function ServicesHeader({ title, intro }: ServicesHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  const contentTransition: Transition = {
    duration: shouldReduceMotion ? 0.01 : 0.6,
    delay: shouldReduceMotion ? 0 : 0.5,
    ease: "easeOut",
  };

  return (
    <section className="relative isolate w-full py-12 sm:py-16 md:py-24 border-b border-neutral-200 overflow-hidden bg-[#FDFCFA]">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-8 sm:gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={contentTransition}
          className="flex justify-center md:justify-start"
        >
          <SwastikIntroMark />
        </motion.div>

        <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={contentTransition}
          className="flex flex-col items-center text-center md:items-start md:text-left"
      >
        {/* Modest line-art doorway/threshold accent icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/80 border border-brand-red/10 flex items-center justify-center text-brand-red mb-4 sm:mb-5 shadow-sm backdrop-blur-sm">
          <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-text mb-4 sm:mb-6 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl">
          {intro}
        </p>
        </motion.div>
      </div>
    </section>
  );
}
