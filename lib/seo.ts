import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    return settings;
  } catch (error) {
    console.error("Error fetching site settings for metadata:", error);
    return null;
  }
}

export async function constructMetadata({
  title,
  description,
  path = "",
}: {
  title?: string;
  description?: string;
  path?: string;
} = {}): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";
  const defaultHeadline = settings?.heroHeadline || "Interior & Exterior Design Studio in Thane";
  const defaultSubhead = settings?.heroSubhead || "Transform your residential or commercial space with REALSPACE.";

  const finalTitle = title
    ? `${title} | ${companyName}`
    : `${companyName} — ${defaultHeadline}`;

  const finalDescription = description || defaultSubhead;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realspace27.com";
  const url = `${baseUrl}${path}`;

  return {
    title: finalTitle,
    description: finalDescription,
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url,
      siteName: companyName,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
    },
  };
}
