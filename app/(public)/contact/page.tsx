import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "./_components/ContactForm";

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
    <div className="flex flex-col pt-16 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12 md:mb-20 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-text mb-4 sm:mb-6 leading-tight">
            Let's discuss your space.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
            Whether you are looking for a complete home interior overhaul or a
            striking new building facade, our team is ready to bring your vision
            to life.
          </p>
          <div className="w-16 sm:w-20 h-1 bg-brand-yellow rounded-full mt-6 sm:mt-8"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-8">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8 lg:pr-8">
            {/* Phone */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-brand-red">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-brand-text mb-0.5 sm:mb-1">
                  Call Us
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mb-1 sm:mb-2">
                  Mon-Sat from 10am to 7pm.
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-brand-text font-medium text-sm sm:text-base hover:text-brand-red transition-colors"
                >
                  {phone}
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-green-600">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-brand-text mb-0.5 sm:mb-1">
                  WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mb-1 sm:mb-2">
                  Message us for quick queries.
                </p>
                <a
                  href={`https://wa.me/${waNumberClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-text font-medium text-sm sm:text-base hover:text-green-600 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-brand-yellow">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-brand-text mb-0.5 sm:mb-1">
                  Email
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 mb-1 sm:mb-2">
                  We typically reply within 24 hours.
                </p>
                <a
                  href={`mailto:${email}`}
                  className="text-brand-text font-medium text-sm sm:text-base hover:text-brand-yellow transition-colors break-all sm:break-normal"
                >
                  {email}
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-neutral-700">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-brand-text mb-0.5 sm:mb-1">
                  Studio Address
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {address}
                </p>
              </div>
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
