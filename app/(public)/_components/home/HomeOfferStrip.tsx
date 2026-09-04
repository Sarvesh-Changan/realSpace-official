"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface HomeOfferStripOffer {
  id?: string;
  title?: string | null;
  description?: string | null;
  ctaLabel: string;
  ctaLink: string;
}

interface HomeOfferStripProps {
  offer?: HomeOfferStripOffer | null;
}

export function HomeOfferStrip({ offer }: HomeOfferStripProps) {
  if (!offer) {
    return null;
  }

  // Fallback text: title if present, otherwise truncated description, or default notice
  const textToShow =
    offer.title?.trim() ||
    (offer.description?.trim()
      ? offer.description.trim().length > 90
        ? `${offer.description.trim().substring(0, 90)}...`
        : offer.description.trim()
      : "Special Limited-Time Promotion");

  return (
    <ScrollReveal direction="down" distance={12} duration={0.4} className="w-full bg-brand-red text-white">
      <div className="max-w-standard mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center sm:text-left text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/20 text-white shrink-0">
            <Tag className="w-3 h-3" /> Special Offer
          </span>
          <span className="truncate">{textToShow}</span>
        </div>

        <Link
          href={offer.ctaLink || "/contact"}
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:text-amber-200 transition-colors shrink-0 group"
        >
          <span>{offer.ctaLabel || "Claim Offer"}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </ScrollReveal>
  );
}
