import React from "react";
import Image from "next/image";

export interface CertificationData {
  id: string;
  title: string;
  badgeLabel: string;
  issuingBody: string;
  imageUrl?: string | null;
  textureUrl?: string | null;
  certificateUrl?: string | null;
  showCertificateButton?: boolean;
}

interface CertificationsProps {
  certifications: CertificationData[];
}

export const Certifications: React.FC<CertificationsProps> = ({ certifications }) => {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <section className="w-full border-t border-brand-border bg-brand-cream/50 px-4 py-8 sm:px-6 sm:py-10 md:py-12">
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {certifications.map((cert, idx) => {
          const textureFallbacks = [
            "bg-brand-warmWhite",
            "bg-stone-100",
            "bg-brand-cream",
            "bg-stone-50",
            "bg-brand-warmWhite",
            "bg-stone-100",
          ];
          const displayImage = cert.imageUrl && cert.imageUrl.trim() !== "" ? cert.imageUrl : "/images/certifications/cadpro.png";

          return (
            <div
              key={cert.id}
              className={`group relative aspect-[1.55/1] overflow-hidden rounded-lg ${textureFallbacks[idx % textureFallbacks.length]} shadow-sm ring-1 ring-brand-border/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl`}
            >
              {cert.textureUrl && (
                <Image src={cert.textureUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" unoptimized={!cert.textureUrl.includes("res.cloudinary.com")} />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/10 via-brand-dark/15 to-brand-dark/90" />
              <div className="absolute inset-x-0 top-[24%] flex justify-center px-6">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-brand-warmWhite/95 p-2 shadow-md sm:h-14 sm:w-14 sm:p-2.5">
                  <Image src={displayImage} alt={`${cert.title} certification logo`} fill sizes="56px" className="object-contain p-2 sm:p-2.5" unoptimized={!displayImage.includes("res.cloudinary.com")} />
                </div>
              </div>
              <div className="absolute inset-x-2 bottom-2 text-center sm:inset-x-3 sm:bottom-3">
                <h3 className="sr-only">{cert.title}</h3>
                <span className="inline-flex max-w-full rounded-full border border-brand-text/35 bg-white/60 px-2 py-0.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-brand-text sm:px-2.5 sm:text-[8px]">{cert.badgeLabel}</span>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
