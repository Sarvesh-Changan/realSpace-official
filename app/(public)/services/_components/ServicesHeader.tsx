"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Transition } from "framer-motion";

interface ServicesHeaderProps {
  title: string;
  intro?: string;
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
      />
    </motion.div>
  );
}

export function ServicesHeader({ title }: ServicesHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  const contentTransition: Transition = {
    duration: shouldReduceMotion ? 0.01 : 0.6,
    delay: shouldReduceMotion ? 0 : 0.5,
    ease: "easeOut",
  };

  return (
    <section className="relative isolate w-full overflow-hidden border-b border-brand-border bg-gradient-to-br from-brand-warmWhite via-brand-cream to-brand-yellowMuted py-12 sm:py-16 md:py-24">
      <Image
        src="/images/hero-living-room.png"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={70}
        className="object-cover opacity-[0.11]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-warmWhite/85 via-brand-cream/75 to-brand-yellowMuted/70" aria-hidden="true" />
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
        <h1 className="whitespace-nowrap font-serif text-[clamp(2.25rem,5vw,5rem)] font-bold leading-[0.98] tracking-tight text-brand-text">
          {title}
        </h1>
        </motion.div>
      </div>
    </section>
  );
}
