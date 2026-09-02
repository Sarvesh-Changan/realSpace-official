"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export interface CertificationData {
  id: string;
  title: string;
  badgeLabel: string;
  issuingBody: string;
  imageUrl?: string | null;
  textureUrl?: string | null;
  certificateUrl?: string | null;
  showCertificateButton?: boolean;
}

interface CertificationsProps {
  certifications: CertificationData[];
}

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  const shouldReduceMotion = useReducedMotion();

  if (!certifications || certifications.length === 0) {
    return null;
  }

  // Duplicate items to ensure a continuous, seamless infinite horizontal marquee
  const doubleCertifications = [...certifications, ...certifications, ...certifications];

  return (
    <section className="relative isolate w-full overflow-hidden border-t border-brand-border/40 py-10 sm:py-14 select-none bg-[url('/images/home/behind-project.png')] bg-fixed bg-cover bg-center">
      <div className="absolute inset-0 -z-10 bg-brand-dark/70" />

      {/* Infinite Right-to-Left Moving Marquee Track */}
      <div className="relative w-full overflow-hidden">
        {/* Subtle Edge Fade Overlays for smooth entry/exit */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-brand-dark/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-brand-dark/80 to-transparent" />

        <motion.div
          className="flex w-max items-center gap-8 sm:gap-12 px-4"
          animate={shouldReduceMotion ? {} : { x: ["0%", "-33.333%"] }}
          transition={
            shouldReduceMotion
              ? {}
              : {
                  duration: 25,
                  ease: "linear",
                  repeat: Infinity,
                }
          }
        >
          {doubleCertifications.map((cert, idx) => {
            const displayImage =
              cert.imageUrl && cert.imageUrl.trim() !== ""
                ? cert.imageUrl
                : "/images/certifications/cadpro.png";

            return (
              <div
                key={`${cert.id}-${idx}`}
                className="group flex flex-col items-center justify-center shrink-0 w-36 sm:w-44 text-center cursor-pointer py-2"
              >
                <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/95 p-3 shadow-md transition-transform duration-300 ease-out group-hover:scale-110">
                  <Image
                    src={displayImage}
                    alt={`${cert.title} certification logo`}
                    fill
                    sizes="80px"
                    className="object-contain p-2.5 sm:p-3"
                  />
                </div>
                <h3 className="mt-3 text-xs sm:text-sm font-semibold text-white/90 tracking-wide transition-colors duration-200 group-hover:text-brand-yellow line-clamp-2 max-w-[140px] sm:max-w-[160px]">
                  {cert.title}
                </h3>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

