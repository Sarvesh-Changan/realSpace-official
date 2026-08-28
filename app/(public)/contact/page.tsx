import type { Metadata } from "next";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { Phone, Mail, MapPin } from "lucide-react";
import { ContactForm } from "./_components/ContactForm";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const revalidate = 60; // Revalidate dynamic contact settings every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";
  const phone = settings?.phone || "+91 98692 11777";
  const address = settings?.address || "Thane, Maharashtra";

  return constructMetadata({
    title: `Contact Us | ${companyName} Studio Thane`,
    description: `Get in touch with ${companyName} at ${phone} or visit our studio at ${address} for your interior and exterior design requirements in Thane and Mumbai.`,
    path: "/contact",
  });
}

export default async function ContactPage() {
  let siteSettings = null;

  try {
    siteSettings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
  } catch (error) {
    console.error("Error fetching SiteSettings in Contact page:", error);
  }

  const phone = siteSettings?.phone || "+91 98765 43210";
  const whatsapp = siteSettings?.whatsapp || "+91 98765 43210";
  const email = siteSettings?.email || "realspace.org@gmail.com";
  const address = siteSettings?.address || "Thane, Maharashtra";

  // Format whatsapp URL clean numbers
  const waNumberClean = whatsapp.replace(/[^\d]/g, "");

  return (
    <div className="relative isolate flex flex-col overflow-hidden bg-neutral-950 pt-16 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24">
      <Image
        src="/images/contact/behind-contact.png"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={70}
        className="-z-20 object-cover object-center"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/70 via-black/45 to-black/25"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12 md:mb-20 max-w-2xl">
          <ScrollReveal direction="left" distance={32}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Let's discuss your space.
            </h1>
          </ScrollReveal>
          <div className="w-16 sm:w-20 h-1 bg-brand-yellow rounded-full mt-6 sm:mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8 lg:pr-8">
            {/* Phone */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-white/15 backdrop-blur-sm flex items-center justify-center text-green-400">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <ScrollReveal direction="left" distance={24} delay={0.12} className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5 sm:mb-1">
                  Call Us
                </h3>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-white font-medium text-sm sm:text-base hover:text-brand-yellow transition-colors"
                >
                  {phone}
                </a>
              </ScrollReveal>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-white/15 backdrop-blur-sm flex items-center justify-center text-green-400">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <ScrollReveal direction="left" distance={24} delay={0.18} className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5 sm:mb-1">
                  WhatsApp
                </h3>
                <a
                  href={`https://wa.me/${waNumberClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium text-sm sm:text-base hover:text-green-300 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </ScrollReveal>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-white/15 backdrop-blur-sm flex items-center justify-center text-brand-yellow">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <ScrollReveal direction="left" distance={24} delay={0.24} className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5 sm:mb-1">
                  Email
                </h3>
                <a
                  href={`mailto:${email}`}
                  className="text-white font-medium text-sm sm:text-base hover:text-brand-yellow transition-colors break-all sm:break-normal"
                >
                  {email}
                </a>
              </ScrollReveal>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-white/15 backdrop-blur-sm flex items-center justify-center text-brand-yellow">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <ScrollReveal direction="left" distance={24} delay={0.3} className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5 sm:mb-1">
                  Studio Address
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-line">
                  {address}
                </p>
              </ScrollReveal>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
