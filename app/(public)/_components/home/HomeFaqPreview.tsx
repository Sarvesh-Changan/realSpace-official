"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, HelpCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface HomeFaqItem {
  id: string;
  question: string;
  answer: string;
}

interface HomeFaqPreviewProps {
  faqs: HomeFaqItem[];
}

export function HomeFaqPreview({ faqs }: HomeFaqPreviewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="bg-white py-12 sm:py-16 border-t border-neutral-100">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <ScrollReveal direction="up" distance={16}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cream border border-brand-yellow/30 text-xs font-semibold text-brand-red mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-brand-red" />
              <span>Quick Answers</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Frequently Asked <span className="text-brand-red">Questions</span>
            </h2>
            <div className="mt-3 h-1 w-12 rounded-full bg-brand-yellow mx-auto" />
          </ScrollReveal>
        </div>

        {/* Compact Accordion */}
        <div className="divide-y divide-neutral-200/80 border-y border-neutral-200/80">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.id} className="py-3 sm:py-4 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 rounded-sm group cursor-pointer py-1"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-neutral-900 group-hover:text-brand-red transition-colors pr-4 leading-snug">
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-neutral-100 group-hover:bg-brand-yellow/20 text-neutral-600 group-hover:text-brand-red transition-all duration-200 ${
                      isOpen ? "rotate-180 bg-brand-yellow/20 text-brand-red" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100 pt-2 pb-1" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pr-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            href="/faq"
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border border-brand-red/30 bg-neutral-50 px-6 py-2.5 text-xs sm:text-sm font-semibold text-brand-red transition-all hover:bg-brand-red hover:text-white hover:border-brand-red hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2"
          >
            View More FAQs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
