"use client";

import React from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function OwnerPortrait() {
  return (
    <section className="relative h-[80dvh] sm:h-[85dvh] lg:h-[90dvh] w-full max-w-full overflow-hidden bg-brand-dark select-none">
      <ScrollReveal direction="none" duration={0.8} className="relative h-full w-full">
        <Image
          src="/images/home/owner-onchair.png"
          alt="REALSPACE Principal Designer & Founder"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle top & bottom vignette for smooth visual transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
      </ScrollReveal>
    </section>
  );
}
