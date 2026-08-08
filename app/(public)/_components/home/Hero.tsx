"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

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
    <section className="relative overflow-hidden bg-brand-bg pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-brand-text mb-6">
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-brand-text/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subhead}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/projects" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                View Our Work
              </Button>
            </Link>
            <Link href="/quote" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                {buttonCta}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Subtle Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-bgAlt rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-bgAlt rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>
    </section>
  );
}
