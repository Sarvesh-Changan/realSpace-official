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
    <section className="relative isolate w-full overflow-hidden border-t border-brand-border/40 py-12 sm:py-16 select-none bg-[url('/images/home/behind-project.png')] bg-fixed bg-cover bg-center">
      <div className="absolute inset-0 -z-10 bg-brand-dark/60" />

      {/* Infinite Right-to-Left Moving Marquee Track */}
      <div className="relative w-full overflow-hidden">
        {/* Subtle Edge Fade Overlays for smooth entry/exit */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-brand-dark/80 to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 sm:w-24 bg-gradient-to-l from-brand-dark/80 to-transparent" />

        <motion.div
          className="flex w-max gap-6 sm:gap-8 px-4"
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
                className="group relative h-48 w-60 sm:h-56 sm:w-72 shrink-0 overflow-hidden [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)] border border-white/65 bg-gradient-to-br from-white/35 via-white/15 to-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:from-white/45 hover:shadow-[0_16px_36px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.9)]"
              >
                <div className="pointer-events-none absolute inset-2 [clip-path:polygon(5%_0,100%_0,95%_100%,0_100%)] border border-white/30 shadow-[inset_0_0_18px_rgba(255,255,255,0.14)] sm:inset-3" />
                {cert.textureUrl && (
                  <Image
                    src={cert.textureUrl}
                    alt=""
                    fill
                    sizes="288px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-brand-dark/10 to-brand-dark/55" />
                <div className="absolute inset-x-0 top-[18%] flex justify-center px-4">
                  <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-white/80 bg-brand-warmWhite/95 p-2 shadow-[0_5px_15px_rgba(0,0,0,0.22)]">
                    <div className="pointer-events-none absolute inset-1 rounded-full border border-brand-text/15" />
                    <Image
                      src={displayImage}
                      alt={`${cert.title} certification logo`}
                      fill
                      sizes="80px"
                      className="object-contain p-2 sm:p-2.5"
                    />
                  </div>
                </div>
                <div className="absolute inset-x-2 bottom-3.5 text-center sm:inset-x-3 sm:bottom-4">
                  <h3 className="sr-only">{cert.title}</h3>
                  <span className="inline-flex max-w-[92%] truncate rounded-full border border-brand-yellow bg-brand-yellow/90 px-3 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.08em] text-brand-dark shadow-[0_3px_10px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105">
                    {cert.badgeLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
