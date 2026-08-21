"use client";

import React from "react";
import { DoorOpen } from "lucide-react";
import { motion, useReducedMotion, type Transition } from "framer-motion";
import { PowderSplashBackground } from "@/components/PowderSplashBackground";

interface ServicesHeaderProps {
  title: string;
  intro: string;
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
      {/* Exact Kunku Red & Halad Yellow powder splash background */}
      <PowderSplashBackground />

      <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={contentTransition}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center"
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
    </section>
  );
}
