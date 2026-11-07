"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface FinalCtaProps {
  ctaText?: string;
}

export function FinalCta({ ctaText }: FinalCtaProps) {
  const buttonText = ctaText || "Get Free Quote";

  return (
    <section className="bg-brand-cream py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="relative overflow-hidden rounded-2xl border border-brand-border/70 bg-white/75 p-6 text-brand-text shadow-sm backdrop-blur-sm sm:rounded-3xl sm:p-10 md:p-16">
          <ScrollReveal direction="up" distance={20}>
            <h2 className="relative text-2xl font-serif font-semibold tracking-tight text-brand-text sm:text-4xl md:text-5xl">
              Ready to reimagine your space?
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" distance={18} delay={0.08}>
            <p className="relative mx-auto mb-6 mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:mb-10 sm:text-base md:text-lg">
              Get an instant, transparent estimate for your interior or exterior
              project. No hidden costs.
            </p>
          </ScrollReveal>
          <Link href="/quote" className="inline-block w-full sm:w-auto">
            <Button
              size="lg"
              className="min-h-[48px] w-full border-0 bg-brand-red text-white shadow-md transition-all duration-300 hover:bg-brand-yellow hover:text-brand-dark hover:shadow-lg hover:scale-[1.02] sm:w-auto cursor-pointer"
            >
              {buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
