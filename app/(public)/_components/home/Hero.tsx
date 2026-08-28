"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useIdleAttention } from "@/hooks/useIdleAttention";

export interface HeroProps {
  heroHeadline?: string;
  heroSubhead?: string;
  ctaText?: string;
}

export function Hero({ heroHeadline, heroSubhead, ctaText }: HeroProps) {
  const isIdle = useIdleAttention(5000);
  const shouldReduceMotion = useReducedMotion();
  const headline = heroHeadline || "Your Space, Reimagined.";
  const subhead =
    heroSubhead ||
    "Interior and exterior design for Thane homes and offices that begins where your walls, beams, and budget actually are. Personal attention. Exceptional results.";
  const buttonCta = ctaText || "Get Free Quote";

  return (
    <section className="group relative isolate min-h-[680px] overflow-hidden bg-brand-dark sm:min-h-[740px]">
      <div className="absolute inset-0 -z-20">
        <Image
          src="/images/home/home-1.png"
          alt="A refined REALSPACE interior design project"
          fill
          priority
          sizes="100vw"
          className="object-cover transition-transform duration-[1400ms] ease-out motion-safe:group-hover:scale-[1.03]"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

      <div className="mx-auto flex min-h-[680px] max-w-standard items-end px-4 pb-16 pt-32 sm:min-h-[740px] sm:px-6 sm:pb-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl text-white"
        >
          <p className="text-eyebrow text-brand-yellow">EST. 1989 · THANE · MUMBAI</p>
          <h1 className="mt-5 max-w-3xl font-serif text-display font-semibold tracking-tight text-white">
            {headline}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl">
            {subhead}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/projects" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="min-h-[50px] w-full border border-brand-yellow bg-brand-yellow px-8 font-semibold text-brand-dark shadow-lg hover:border-white hover:bg-white sm:w-auto"
              >
                View Our Work
              </Button>
            </Link>
            <Link href="/quote" className="relative w-full sm:w-auto">
              {isIdle && !shouldReduceMotion && (
                <motion.span
                  initial={{ scale: 1, opacity: 0.65 }}
                  animate={{ scale: 1.08, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="pointer-events-none absolute -inset-1 rounded-md border border-white/80"
                />
              )}
              <Button
                variant="secondary"
                size="lg"
                className="relative z-10 min-h-[50px] w-full border-white bg-white/10 px-8 font-semibold text-white backdrop-blur-sm hover:border-brand-yellow hover:bg-brand-yellow hover:text-brand-dark sm:w-auto"
              >
                {buttonCta}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
