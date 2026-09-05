"use client";

import React from "react";
import Image from "next/image";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface OwnerPortraitProps {
  portraitUrl?: string | null;
  showOwnerPortrait?: boolean | null;
}

export function OwnerPortrait({ portraitUrl, showOwnerPortrait }: OwnerPortraitProps) {
  const isEnabled = showOwnerPortrait ?? true;
  if (!isEnabled) {
    return null;
  }

  const imgSrc = portraitUrl && portraitUrl.trim() !== "" ? portraitUrl.trim() : "/images/home/owner-onchair.png";
  if (!imgSrc) {
    return null;
  }

  return (
    <section className="relative h-[80dvh] sm:h-[85dvh] lg:h-[90dvh] w-full max-w-full overflow-hidden bg-brand-dark select-none">
      <ScrollReveal direction="none" duration={0.8} className="relative h-full w-full flex items-center justify-center">
        {/* Ambient blurred backdrop to fill aspect ratio gaps */}
        <Image
          src={imgSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30 blur-2xl scale-110 pointer-events-none"
          aria-hidden="true"
          unoptimized={imgSrc.includes("res.cloudinary.com")}
        />
        {/* Main Full Fit Uncropped Image */}
        <Image
          src={imgSrc}
          alt="REALSPACE Principal Designer & Founder"
          fill
          priority={false}
          sizes="100vw"
          className="object-contain object-center z-10 p-2 sm:p-4"
          unoptimized={imgSrc.includes("res.cloudinary.com")}
        />
        {/* Subtle top & bottom vignette for smooth visual transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 pointer-events-none z-10" />
      </ScrollReveal>
    </section>
  );
}
