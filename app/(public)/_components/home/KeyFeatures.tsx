"use client";

import React from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface KeyFeatureItem {
  id: string;
  alt: string;
  imageSrc: string;
}

const KEY_FEATURES: KeyFeatureItem[] = [
  {
    id: "2d3d",
    alt: "2D and 3D Visualization",
    imageSrc: "/images/home/feature/2d3d.png",
  },
  {
    id: "turnkey",
    alt: "Turnkey Interior Projects",
    imageSrc: "/images/home/feature/turnkey.png",
  },
  {
    id: "execution",
    alt: "Quality Execution",
    imageSrc: "/images/home/feature/execution.png",
  },
  {
    id: "onsite",
    alt: "Onsite Supervision",
    imageSrc: "/images/home/feature/onsite.png",
  },
  {
    id: "finishing",
    alt: "Finishing & Detailing",
    imageSrc: "/images/home/feature/finishing.png",
  },
  {
    id: "handover",
    alt: "Timely Project Handover",
    imageSrc: "/images/home/feature/handover.png",
  },
];

export function KeyFeatures() {
  return (
    <section className="bg-white px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Section Header */}
        <ScrollReveal direction="up" className="mb-6 sm:mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-brand-dark">
            Key Features
          </h2>
          <p className="mt-2 text-sm sm:text-base font-sans font-semibold text-brand-text/80">
            Unlock the most creative ideas for your house!
          </p>
          <div className="mx-auto mt-3 h-0.5 w-12 bg-brand-yellow rounded-full" />
        </ScrollReveal>

        {/* 2-row x 3-column Image Grid (1-col mobile, 2-col tablet, 3-col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {KEY_FEATURES.map((feature, index) => {
            return (
              <ScrollReveal
                key={feature.id}
                direction="up"
                delay={index * 0.08}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-brand-border/60 bg-white p-2 sm:p-3 shadow-sm hover:border-brand-yellow/80 hover:shadow-md transition-all duration-300"
              >
                <Image
                  src={feature.imageSrc}
                  alt={feature.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-1"
                />
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
