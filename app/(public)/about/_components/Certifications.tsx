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
    <section className="w-full border-t border-brand-border bg-brand-cream/50 px-4 py-16 sm:px-6 sm:py-20 md:py-28">
      <div className="mx-auto grid max-w-standard grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {certifications.map((cert, idx) => {
          const textureFallbacks = [
            "bg-brand-dark",
            "bg-stone-200",
            "bg-amber-800",
            "bg-stone-300",
            "bg-brand-cream",
            "bg-stone-700",
          ];
          const displayImage = cert.imageUrl && cert.imageUrl.trim() !== "" ? cert.imageUrl : "/images/certifications/cadpro.png";

          return (
            <div
              key={cert.id}
              className={`group relative aspect-[4/5] overflow-hidden ${textureFallbacks[idx % textureFallbacks.length]} shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl`}
            >
              {cert.textureUrl && (
                <Image src={cert.textureUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" unoptimized={!cert.textureUrl.includes("res.cloudinary.com")} />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/10 via-brand-dark/15 to-brand-dark/90" />
              <div className="absolute inset-x-0 top-[24%] flex justify-center px-6">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/70 bg-brand-warmWhite/95 p-5 shadow-xl sm:h-28 sm:w-28 sm:p-6">
                  <Image src={displayImage} alt={`${cert.title} certification logo`} fill sizes="112px" className="object-contain p-5 sm:p-6" unoptimized={!displayImage.includes("res.cloudinary.com")} />
                </div>
              </div>
              <div className="absolute inset-x-5 bottom-6 text-center text-white sm:inset-x-6 sm:bottom-7">
                <h3 className="font-serif text-xl font-bold leading-tight drop-shadow-md sm:text-2xl">{cert.title}</h3>
                <span className="mt-4 inline-flex max-w-full rounded-full border border-white/75 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white drop-shadow-md sm:text-[10px]">{cert.badgeLabel}</span>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
