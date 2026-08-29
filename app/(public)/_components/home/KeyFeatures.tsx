"use client";

import React from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface KeyFeatureItem {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
}

const KEY_FEATURES: KeyFeatureItem[] = [
  {
    id: "3d-vis",
    title: "3D Visualization",
    description:
      "Preview your space before a single wall is touched. We build detailed 3D walkthroughs so you can see color, layout, and finishes exactly as they'll look, and refine the design with confidence before execution begins.",
    imageSrc: "/images/home/features/3d.png",
  },
  {
    id: "turnkey",
    title: "Turnkey Projects",
    description:
      "From concept to handover, we manage the complete build — material specifications, execution schedules, site measurements, and quality checks — so you deal with one team, not a dozen contractors.",
    imageSrc: "/images/home/features/turn-key.png",
  },
  {
    id: "execution",
    title: "Execution",
    description:
      "Our in-house team of craftsmen brings every design to life, from false ceilings and modular kitchens to custom wardrobes and furniture, built to the exact specification agreed at sign-off.",
    imageSrc: "/images/home/features/execution.png",
  },
  {
    id: "supervision",
    title: "Onsite Supervision",
    description:
      "A dedicated project manager oversees every site visit and milestone, keeping your project on schedule and giving you a single point of contact from foundation to finishing.",
    imageSrc: "/images/home/features/onsite-supervision.png",
  },
];

export function KeyFeatures() {
  return (
    <section className="bg-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-standard">
        {/* Section Header */}
        <ScrollReveal direction="up" className="mb-12 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-dark">
            Key Features
          </h2>
          <p className="mt-3 text-base sm:text-lg font-sans font-semibold text-brand-text/80">
            Unlock the most creative ideas for your house!
          </p>
          <div className="mx-auto mt-4 h-0.5 w-16 bg-brand-yellow rounded-full" />
        </ScrollReveal>

        {/* 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {KEY_FEATURES.map((feature, index) => {
            return (
              <ScrollReveal
                key={feature.id}
                direction="up"
                delay={index * 0.08}
                className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6 p-6 sm:p-8 rounded-2xl border border-brand-border/60 bg-white hover:border-brand-yellow/80 hover:shadow-md transition-all duration-300"
              >
                {/* Bordered Square Icon Box */}
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center rounded-xl border border-brand-yellow/80 bg-brand-bgAlt/50 p-3">
                  <Image
                    src={feature.imageSrc}
                    alt={feature.title}
                    width={56}
                    height={56}
                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="mb-2 text-lg sm:text-xl font-bold uppercase tracking-wider text-brand-yellow">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-brand-text/80 font-sans">
                    {feature.description}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
