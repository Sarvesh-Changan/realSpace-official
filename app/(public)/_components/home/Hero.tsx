"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Hero3DFallback } from "@/components/3d/Hero3DScene";

// Lazy-load the R3F Canvas without SSR so it never blocks page hydration or text rendering
const Hero3DScene = dynamic(() => import("@/components/3d/Hero3DScene"), {
  ssr: false,
  loading: () => <Hero3DFallback />,
});

export interface HeroProps {
  heroHeadline?: string;
  heroSubhead?: string;
  ctaText?: string;
}

export function Hero({ heroHeadline, heroSubhead, ctaText }: HeroProps) {
  const headline = heroHeadline || "Your Space, Reimagined.";
  const subhead =
    heroSubhead ||
    "Interior and exterior design for Thane homes and offices that begins where your walls, beams, and budget actually are. Personal attention. Exceptional results.";
  const buttonCta = ctaText || "Get Free Quote";

  return (
    <section className="relative overflow-hidden bg-brand-bg pt-16 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Subheadline, CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 text-center lg:text-left space-y-4 sm:space-y-6"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-brand-text leading-tight sm:leading-tight">
              {headline}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-brand-text/75 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {subhead}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 w-full">
              <Link href="/projects" className="w-full sm:w-auto">
                <Button size="lg" className="w-full min-h-[48px] shadow-md cursor-pointer">
                  View Our Work
                </Button>
              </Link>
              <Link href="/quote" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full min-h-[48px] cursor-pointer">
                  {buttonCta}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: 3D Scene Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5 w-full max-w-lg mx-auto lg:max-w-none h-[300px] sm:h-[400px] lg:h-[480px]"
          >
            <Hero3DScene />
          </motion.div>

        </div>
      </div>

      {/* Subtle Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-brand-bgAlt rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-brand-bgAlt rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>
    </section>
  );
}
