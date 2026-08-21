import React from "react";
import Image from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export interface MeetFounderProps {
  founderName: string;
  bio: string;
  imageUrl?: string;
}

export function MeetFounder({
  founderName,
  bio,
  imageUrl,
}: MeetFounderProps) {
  return (
    <section className="py-20 bg-brand-bgAlt/30 border-t border-brand-bgAlt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-brand-bg p-8 md:p-12 rounded-3xl border border-brand-bgAlt shadow-sm grid md:grid-cols-3 gap-8 items-center">
          {imageUrl && (
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-brand-bgAlt group">
              <Image
                src={getCloudinaryUrl(imageUrl, { width: 500 })}
                alt={founderName}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                unoptimized={!imageUrl.includes("res.cloudinary.com")}
              />
            </div>
          )}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-brand-text mb-2">
              Meet {founderName}
            </h3>
            <p className="text-xs uppercase font-bold text-brand-red tracking-wider mb-4">
              Founder Since 1989
            </p>
            <p className="text-brand-text/80 leading-relaxed text-sm md:text-base">
              {bio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
