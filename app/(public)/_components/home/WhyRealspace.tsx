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
    id: "reputation",
    title: "Our Reputation Precedes Us",
    description:
      "We have been transforming homes into masterpieces and managing turnkey projects with exceptional results since 1989. Our commitment to excellence has earned us a loyal following of clients who trust us with their most treasured possession – their homes.",
  },
  {
    id: "perfection",
    title: "Our Goal is to Achieve Perfection",
    description:
      "At REALSPACE, we believe a home should express its owner's personality. That's why we work closely with our clients to create living spaces that capture their unique style and surpass their expectations.",
  },
  {
    id: "expertise",
    title: "Our Area of Expertise is Expansive",
    description:
      "We do not limit ourselves to just decorating your home. Instead, we go a step ahead to ensure your house exhibits a personality of its own. Whether it's a cozy apartment or a luxurious villa, our team is dedicated to delivering the highest quality of service for every project, making us an expert in bringing out the soul of your living space.",
  },
  {
    id: "tailored",
    title: "Tailored Offerings to meet our Client's Needs",
    description:
      "Our offerings are as exceptional as our services. We offer a wide range of quality interior design solutions, including home renovation, turnkey project management, and interior styling. Our team has a passion for designing spaces that are not only beautiful but also practical and perfectly tailored to our client's needs. We believe that a great design can stand the test of time, which is why we specialize in creating timeless interiors.",
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

        {/* 2x2 Text-Only Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {WHY_REALSPACE_ITEMS.map((item, index) => {
            return (
              <ScrollReveal
                key={item.id}
                direction="up"
                delay={index * 0.08}
                className="p-6 sm:p-8 rounded-2xl border border-brand-border/60 bg-white shadow-sm hover:shadow-md transition-all duration-300"
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
