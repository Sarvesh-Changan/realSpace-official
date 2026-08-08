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
    <section className="py-24 md:py-32 bg-brand-bg">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-neutral-900 rounded-3xl p-10 md:p-16 text-neutral-100"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Ready to reimagine your space?
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
            Get an instant, transparent estimate for your interior or exterior
            project. No hidden costs.
          </p>
          <Link href="/quote">
            <Button
              size="lg"
              className="bg-brand-red hover:bg-brand-red/90 text-white border-0"
            >
              {buttonText}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
