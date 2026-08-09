import React from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export interface AboutHeroProps {
  headline: string;
  body: string;
  imageUrl?: string;
}

export function AboutHero({ headline, body, imageUrl }: AboutHeroProps) {
  return (
    <section className="py-12 md:py-20 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <SectionHeading title={headline} className="mb-6" />
            <p className="text-lg text-brand-text/80 leading-relaxed">{body}</p>
          </div>
          {imageUrl && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-brand-bgAlt shadow-md">
              <Image
                src={getCloudinaryUrl(imageUrl, { width: 800 })}
                alt="REALSPACE About Studio"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="w-full h-full object-cover"
                unoptimized={!imageUrl.includes("res.cloudinary.com")}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
