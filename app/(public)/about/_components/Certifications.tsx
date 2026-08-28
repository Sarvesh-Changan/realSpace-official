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
    <section className="relative isolate w-full overflow-hidden border-t border-brand-border px-4 py-10 sm:px-6 sm:py-14 md:py-16">
      <Image src="/images/about/behind-certificates.png" alt="Warm interior design studio behind the certifications" fill sizes="100vw" className="-z-20 object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-brand-dark/45" />
      <div className="relative mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {certifications.map((cert, idx) => {
          const displayImage = cert.imageUrl && cert.imageUrl.trim() !== "" ? cert.imageUrl : "/images/certifications/cadpro.png";

          return (
            <div
              key={cert.id}
              className="group relative aspect-[1.1/1] overflow-hidden [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)] border border-white/65 bg-gradient-to-br from-white/35 via-white/15 to-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:from-white/45 hover:shadow-[0_16px_36px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.9)]"
            >
              <div className="pointer-events-none absolute inset-2 [clip-path:polygon(5%_0,100%_0,95%_100%,0_100%)] border border-white/30 shadow-[inset_0_0_18px_rgba(255,255,255,0.14)] sm:inset-3" />
              {cert.textureUrl && (
                <Image src={cert.textureUrl} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" unoptimized={!cert.textureUrl.includes("res.cloudinary.com")} />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-brand-dark/10 to-brand-dark/55" />
              <div className="absolute inset-x-0 top-[19%] flex justify-center px-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/80 bg-brand-warmWhite/95 p-2 shadow-[0_5px_15px_rgba(0,0,0,0.22)] sm:h-24 sm:w-24 sm:p-2.5">
                  <div className="pointer-events-none absolute inset-1 rounded-full border border-brand-text/15" />
                  <Image src={displayImage} alt={`${cert.title} certification logo`} fill sizes="96px" className="object-contain p-3 sm:p-3.5" unoptimized={!displayImage.includes("res.cloudinary.com")} />
                </div>
              </div>
              <div className="absolute inset-x-2 bottom-4 text-center sm:inset-x-3 sm:bottom-5">
                <h3 className="sr-only">{cert.title}</h3>
                <span className="inline-flex max-w-full rounded-full border border-brand-yellow bg-brand-yellow/90 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-dark shadow-[0_3px_10px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105 sm:px-5 sm:text-[11px]">{cert.badgeLabel}</span>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};
