"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  if (!faqs || faqs.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto py-16 text-center text-neutral-500 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
        <p className="text-base font-medium">
          No FAQs published at the moment.
        </p>
        <p className="text-sm text-neutral-400 mt-1">
          Please reach out to us directly via our Contact page for any queries.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3 sm:space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={faq.id || index}
            className="border-b border-neutral-200 last:border-0"
          >
            <button
              type="button"
              onClick={() => toggleItem(index)}
              className="w-full min-h-[48px] flex items-start sm:items-center justify-between py-4 sm:py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6342C] focus-visible:ring-offset-2 rounded-sm group cursor-pointer"
              aria-expanded={isOpen}
            >
              <span className="text-base sm:text-lg font-medium text-neutral-900 group-hover:text-[#D6342C] transition-colors duration-200 pr-3 sm:pr-6 leading-snug">
                {faq.question}
              </span>
              <span
                className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-neutral-50 group-hover:bg-[#F2B705]/20 text-neutral-500 group-hover:text-[#D6342C] transition-all duration-300 mt-0.5 sm:mt-0 ${
                  isOpen ? "rotate-180 bg-[#F2B705]/20 text-[#D6342C]" : ""
                }`}
              >
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-4 sm:pb-6 text-xs sm:text-sm md:text-base text-neutral-600 leading-relaxed pr-2 sm:pr-12">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
