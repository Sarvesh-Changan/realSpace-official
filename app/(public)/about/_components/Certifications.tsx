import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";

export interface CertificationData {
  id: string;
  title: string;
  badgeLabel: string;
  issuingBody: string;
  imageUrl?: string | null;
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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 border-t border-neutral-100">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1F1F1F] mb-3 sm:mb-4">
          Certifications & Credentials
        </h2>
        <div className="w-16 sm:w-20 h-1 bg-[#990000] mx-auto rounded-full mb-4 sm:mb-6"></div>
        <p className="text-sm sm:text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
          Recognized by leading authorities for our commitment to quality, safety, and professional excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {certifications.map((cert, idx) => {
          const isRedAccent = idx % 2 === 0;
          const accentColor = isRedAccent ? "border-[#990000]" : "border-[#FECC00]";
          const badgeBg = isRedAccent ? "bg-[#990000]/10 text-[#990000]" : "bg-[#FECC00]/20 text-[#1F1F1F]";
          const displayImage = cert.imageUrl && cert.imageUrl.trim() !== "" ? cert.imageUrl : "/images/certifications/cadpro.png";

          return (
            <div
              key={cert.id}
              className="group relative flex flex-col items-center text-center p-6 sm:p-8 bg-white border border-neutral-100 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out cursor-default"
            >
              {/* Logo frame */}
              <div className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-50 border-2 ${accentColor} flex items-center justify-center mb-4 sm:mb-6 overflow-hidden group-hover:scale-105 transition-transform duration-300 ease-out shadow-sm p-2`}>
                <Image
                  src={displayImage}
                  alt={`${cert.title} logo`}
                  fill
                  className="object-contain p-3 sm:p-4"
                  sizes="(max-width: 768px) 100vw, 96px"
                  unoptimized={!displayImage.includes("res.cloudinary.com")}
                />
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg font-bold text-[#1F1F1F] mb-2 leading-tight">
                {cert.title}
              </h3>

              {/* Badge */}
              <span className={`inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-3 ${badgeBg}`}>
                {cert.badgeLabel}
              </span>

              {/* Issuing Body */}
              <p className="text-xs sm:text-sm text-neutral-500 font-medium">
                Issued by {cert.issuingBody}
              </p>

              {/* View Certificate Button */}
              {cert.showCertificateButton && cert.certificateUrl && cert.certificateUrl.trim() !== "" && (
                <a
                  href={cert.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#990000] border border-[#990000]/30 rounded-lg bg-white hover:bg-[#990000] hover:text-white hover:border-[#990000] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  View Certificate
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
