import React from "react";
import { DoorOpen } from "lucide-react";

interface ServicesHeaderProps {
  title: string;
  intro: string;
}

export function ServicesHeader({ title, intro }: ServicesHeaderProps) {
  return (
    <section className="relative w-full bg-brand-bgAlt py-16 md:py-24 border-b border-neutral-200 overflow-hidden">
      {/* Soft overlapping Kunku Red and Halad Yellow background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 -z-0 overflow-hidden"
      >
        <div className="absolute left-[35%] top-[10%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#990000]/15 blur-3xl transform -translate-x-1/2" />
        <div className="absolute left-[60%] top-[25%] w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#FECC00]/20 blur-3xl transform -translate-x-1/2" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Modest line-art doorway/threshold accent icon */}
        <div className="w-12 h-12 rounded-2xl bg-white/80 border border-brand-red/10 flex items-center justify-center text-brand-red mb-5 shadow-sm backdrop-blur-sm">
          <DoorOpen className="w-6 h-6 stroke-[1.75]" />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text mb-6 tracking-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl">
          {intro}
        </p>
      </div>
    </section>
  );
}
