'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { faqData } from '@/data/faq';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="bg-white border-t border-[#E8E2DA] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C8A96A] mb-1">
            <HelpCircle className="w-4 h-4" />
            Advisory & Legal Clarity
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1C1C1C]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6A66] mt-1.5 leading-relaxed">
            Essential guidelines for homebuyers, investors, and homeowners navigating property acquisition and luxury interior design in Thane.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqData.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id}
                className="border border-[#E8E2DA] bg-[#F8F5F1] transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-[#C8A96A]">
                      0{idx + 1}
                    </span>
                    <span className="font-heading text-sm sm:text-base font-bold text-[#1C1C1C]">
                      {faq.question}
                    </span>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-[#6D6A66] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#C8A96A]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#444444] leading-relaxed border-t border-[#E8E2DA]/60 bg-white">
                    <p>{faq.answer}</p>
                    <div className="mt-3 pt-2 text-[11px] text-[#A39E98] uppercase tracking-wider font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C8A96A]" />
                      Category: {faq.category}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
