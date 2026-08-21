"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export interface FinalCtaProps {
  ctaText?: string;
}

export function FinalCta({ ctaText }: FinalCtaProps) {
  const buttonText = ctaText || "Get Free Quote";

  return (
    <section className="py-12 sm:py-20 md:py-32 bg-brand-bg">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-brand-bgAlt/70 border border-neutral-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-16 text-brand-text shadow-sm backdrop-blur-sm"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-brand-text">
            Ready to reimagine your space?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-neutral-600 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Get an instant, transparent estimate for your interior or exterior
            project. No hidden costs.
          </p>
          <Link href="/quote" className="inline-block w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto min-h-[48px] bg-brand-red hover:bg-brand-red/90 text-white border-0 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {buttonText}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
