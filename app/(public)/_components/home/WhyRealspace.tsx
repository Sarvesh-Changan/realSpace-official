"use client";

import React from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface WhyRealspaceItem {
  id: string;
  title: string;
  description: string;
}

const WHY_REALSPACE_ITEMS: WhyRealspaceItem[] = [
  {
    id: "trust",
    title: "27+ Years of Trust",
    description:
      "Since 1989, REALSPACE has been turning homes and commercial spaces across Thane, Mumbai, and Navi Mumbai into lasting, functional designs — built on quality material, professional installation, and rigorous quality checks, within budget.",
  },
  {
    id: "vision",
    title: "Your Vision, Realized",
    description:
      "We believe a space should reflect the person who lives or works in it. We start every project from scratch, working closely with each client to design something that fits their personality as much as their floor plan.",
  },
  {
    id: "expertise",
    title: "Expertise Across Interior and Exterior",
    description:
      "We don't stop at decorating a room. From modular kitchens and full-home interiors to building facades and villa exteriors, our team shapes the complete look and feel of a property, residential or commercial.",
  },
  {
    id: "tailored",
    title: "Tailored to Every Client",
    description:
      "No two projects at REALSPACE look the same. Whether it's a compact 2BHK or a full turnkey villa, our design, execution, and onsite supervision are shaped around what each client actually needs, not a fixed package.",
  },
];

export function WhyRealspace() {
  return (
    <section className="bg-brand-bgAlt px-4 py-16 sm:py-24 border-t border-brand-border/40">
      <div className="mx-auto max-w-standard">
        {/* Section Header */}
        <ScrollReveal direction="up" className="mb-12 sm:mb-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-brand-dark">
            Why REALSPACE
          </h2>
          <div className="mx-auto mt-4 h-0.5 w-16 bg-brand-red rounded-full" />
        </ScrollReveal>

        {/* 2x2 Text-Only Card Grid with Alternating Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {WHY_REALSPACE_ITEMS.map((item, index) => {
            // Alternating card background between white and light neutral per design tokens
            const isEven = index % 2 === 0;
            const bgClass = isEven
              ? "bg-white shadow-sm hover:shadow-md"
              : "bg-brand-cream/60 border border-brand-border/80 hover:shadow-md";

            return (
              <ScrollReveal
                key={item.id}
                direction="up"
                delay={index * 0.08}
                className={`p-6 sm:p-8 rounded-2xl border border-brand-border/60 transition-all duration-300 ${bgClass}`}
              >
                <h3 className="mb-3 text-lg sm:text-xl font-serif font-bold text-brand-dark">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-brand-text/80 font-sans">
                  {item.description}
                </p>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
