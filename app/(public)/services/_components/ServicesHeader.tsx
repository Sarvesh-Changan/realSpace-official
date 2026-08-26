"use client";

import React, { useEffect, useRef } from "react";
import { DoorOpen } from "lucide-react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

interface ServicesHeaderProps {
  title: string;
  intro: string;
}

const ARM_IDS = ["arm-north", "arm-east", "arm-south", "arm-west"] as const;

function SwastikIntroMark() {
  const markRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const mark = markRef.current;
    if (!mark) return;

    const arms = ARM_IDS.map((id) => mark.querySelector<SVGPathElement>(`#${id}`)).filter(
      (path): path is SVGPathElement => path !== null,
    );

    // Measure the rendered paths instead of relying on the SVG's data-length hints.
    arms.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = shouldReduceMotion ? "0" : `${length}`;
      path.style.transition = shouldReduceMotion
        ? "none"
        : "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)";
    });

    if (shouldReduceMotion) return;

    let hasPlayed = false;
    const play = () => {
      if (hasPlayed) return;
      hasPlayed = true;
      arms.forEach((path, index) => {
        window.setTimeout(() => {
          path.style.strokeDashoffset = "0";
        }, index * 110);
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(mark);

    return () => observer.disconnect();
  }, [shouldReduceMotion]);

  return (
    <div ref={markRef} className="w-full max-w-[580px] aspect-[580/350]" aria-hidden="true">
      <svg
        width="580"
        height="350"
        viewBox="0 0 1160 700"
        className="h-full w-full"
        role="img"
        aria-label="Traditional kunku red and halad yellow swastik"
      >
        <defs>
          <filter id="servicesBrushTexture" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045 0.06" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="servicesBrushTextureFine" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08 0.09" numOctaves="2" seed="3" result="noise2" />
            <feDisplacementMap in="SourceGraphic" in2="noise2" scale="8" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        <g filter="url(#servicesBrushTexture)">
          <line x1="70" y1="30" x2="70" y2="670" stroke="#FECC00" strokeWidth="70" strokeLinecap="round" />
          <line x1="185" y1="30" x2="185" y2="670" stroke="#FECC00" strokeWidth="70" strokeLinecap="round" />
          <line x1="975" y1="30" x2="975" y2="670" stroke="#FECC00" strokeWidth="70" strokeLinecap="round" />
          <line x1="1090" y1="30" x2="1090" y2="670" stroke="#FECC00" strokeWidth="70" strokeLinecap="round" />
        </g>
        <g filter="url(#servicesBrushTextureFine)">
          <line x1="70" y1="35" x2="70" y2="665" stroke="#8B0000" strokeWidth="46" strokeLinecap="round" />
          <line x1="185" y1="35" x2="185" y2="665" stroke="#8B0000" strokeWidth="46" strokeLinecap="round" />
          <line x1="975" y1="35" x2="975" y2="665" stroke="#8B0000" strokeWidth="46" strokeLinecap="round" />
          <line x1="1090" y1="35" x2="1090" y2="665" stroke="#8B0000" strokeWidth="46" strokeLinecap="round" />
        </g>
        <g fill="none" stroke="#FECC00" strokeWidth="78" strokeLinecap="round" strokeLinejoin="round" filter="url(#servicesBrushTexture)">
          {ARM_IDS.map((id) => {
            const paths = {
              "arm-north": "M 580 350 L 580 145 L 830 145",
              "arm-east": "M 580 350 L 785 350 L 785 555",
              "arm-south": "M 580 350 L 580 555 L 330 555",
              "arm-west": "M 580 350 L 375 350 L 375 145",
            } as const;
            return <path key={`base-${id}`} d={paths[id]} />;
          })}
        </g>
        <g fill="none" stroke="#8B0000" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" filter="url(#servicesBrushTextureFine)">
          <path id="arm-north" data-length="440" d="M 580 350 L 580 145 L 830 145" />
          <path id="arm-east" data-length="440" d="M 580 350 L 785 350 L 785 555" />
          <path id="arm-south" data-length="440" d="M 580 350 L 580 555 L 330 555" />
          <path id="arm-west" data-length="440" d="M 580 350 L 375 350 L 375 145" />
        </g>
        <g filter="url(#servicesBrushTextureFine)" fill="#8B0000">
          <circle cx="580" cy="145" r="10" />
          <circle cx="785" cy="350" r="10" />
          <circle cx="580" cy="555" r="10" />
          <circle cx="375" cy="350" r="10" />
        </g>
      </svg>
    </div>
  );
}

export function ServicesHeader({ title, intro }: ServicesHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  const contentTransition: Transition = {
    duration: shouldReduceMotion ? 0.01 : 0.6,
    delay: shouldReduceMotion ? 0 : 0.5,
    ease: "easeOut",
  };

  return (
    <section className="relative isolate w-full py-12 sm:py-16 md:py-24 border-b border-neutral-200 overflow-hidden bg-[#FDFCFA]">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-8 sm:gap-12 md:gap-16 items-center">
        <motion.div
          initial={{ opacity: shouldReduceMotion ? 1 : 0, x: shouldReduceMotion ? 0 : -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={contentTransition}
          className="flex justify-center md:justify-start"
        >
          <SwastikIntroMark />
        </motion.div>

        <motion.div
        initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={contentTransition}
          className="flex flex-col items-center text-center md:items-start md:text-left"
      >
        {/* Modest line-art doorway/threshold accent icon */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/80 border border-brand-red/10 flex items-center justify-center text-brand-red mb-4 sm:mb-5 shadow-sm backdrop-blur-sm">
          <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-brand-text mb-4 sm:mb-6 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl">
          {intro}
        </p>
        </motion.div>
      </div>
    </section>
  );
}
