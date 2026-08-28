"use client";

import Image from "next/image";
import { DoorOpen } from "lucide-react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

interface ServicesHeaderProps {
  title: string;
  intro: string;
}

const SWASTIK_IMAGE_PATH = "/images/service/swastik.png";

function SwastikIntroMark() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 1, scale: 1, clipPath: "circle(100% at 50% 50%)" }
          : { opacity: 0, scale: 0, clipPath: "circle(0% at 50% 50%)" }
      }
      animate={{ opacity: 1, scale: 1, clipPath: "circle(100% at 50% 50%)" }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "center" }}
      className="relative aspect-[632/395] w-full max-w-[580px]"
      aria-hidden="true"
    >
      <Image
        src={SWASTIK_IMAGE_PATH}
        alt=""
        fill
        sizes="(max-width: 767px) 100vw, 580px"
        className="object-contain"
        priority
      />
    </motion.div>
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
    <section className="relative isolate w-full overflow-hidden border-b border-brand-border bg-brand-cream py-12 sm:py-16 md:py-24">
      <Image
        src="/images/hero-living-room.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.14]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-brand-cream/75" aria-hidden="true" />
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
