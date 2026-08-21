import prisma from "@/lib/prisma";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { ContactForm } from "./_components/ContactForm";
import { PowderSplashBackground } from "@/components/PowderSplashBackground";

export const revalidate = 60; // Revalidate dynamic contact settings every 60 seconds

export const metadata = {
  title: "Contact Us | REALSPACE Thane",
  description:
    "Get in touch with REALSPACE for your interior and exterior design requirements in Thane and Mumbai.",
};

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
    <div className="flex flex-col pt-24 md:pt-32 pb-16 md:pb-24">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="relative isolate overflow-hidden rounded-3xl p-8 md:p-12 mb-12 md:mb-20 max-w-4xl border border-neutral-100">
          <PowderSplashBackground compact />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-6">
              Let's discuss your space.
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed">
              Whether you are looking for a complete home interior overhaul or a
              striking new building facade, our team is ready to bring your vision
              to life.
            </p>
            <div className="w-20 h-1 bg-brand-yellow rounded-full mt-8"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Left Column: Contact Information */}
          <div className="lg:col-span-2 flex flex-col gap-8 md:pr-8">
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-brand-red">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-text mb-1">
                  Call Us
                </h3>
                <p className="text-neutral-600 mb-2">
                  Mon-Sat from 10am to 7pm.
                </p>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="text-brand-text font-medium hover:text-brand-red transition-colors"
                >
                  {phone}
                </a>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-green-600">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-text mb-1">
                  WhatsApp
                </h3>
                <p className="text-neutral-600 mb-2">
                  Message us for quick queries.
                </p>
                <a
                  href={`https://wa.me/${waNumberClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-text font-medium hover:text-green-600 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-brand-yellow">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-text mb-1">
                  Email
                </h3>
                <p className="text-neutral-600 mb-2">
                  We typically reply within 24 hours.
                </p>
                <a
                  href={`mailto:${email}`}
                  className="text-brand-text font-medium hover:text-brand-yellow transition-colors"
                >
                  {email}
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-brand-bgAlt rounded-full flex items-center justify-center text-neutral-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-brand-text mb-1">
                  Studio Address
                </h3>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-line">
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
