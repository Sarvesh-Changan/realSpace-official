import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import prisma from "@/lib/prisma";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let siteSettings = null;
  try {
    siteSettings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
  } catch (error) {
    console.error("Error fetching SiteSettings in PublicLayout:", error);
  }

  const companyName = siteSettings?.companyName || "REALSPACE";
  const phone = siteSettings?.phone || "+91 98692 11777";
  const address = siteSettings?.address || "Thane, Maharashtra";
  const email = siteSettings?.email || "realspace.org@gmail.com";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realspace27.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": companyName,
    "image": `${baseUrl}/icon.png`,
    "telephone": phone,
    "email": email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address,
      "addressLocality": "Thane",
      "addressRegion": "Maharashtra",
      "addressCountry": "IN"
    },
    "url": baseUrl,
    "priceRange": "₹₹₹",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "19:00"
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-brand-text">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer socialLinks={siteSettings?.socialLinks as any} />
      <WhatsAppButton phoneNumber={siteSettings?.whatsapp || "9869211777"} />
    </div>
  );
}
