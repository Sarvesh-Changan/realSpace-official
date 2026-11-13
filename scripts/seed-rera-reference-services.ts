import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { referenceServices } from "../lib/rera/reference-services";
import { serviceSlug } from "../lib/rera/public-service";

const connectionString = process.env.DATABASE_URL?.replace(/sslmode=(require|prefer|verify-ca)/g, "sslmode=verify-full");
if (!connectionString) throw new Error("DATABASE_URL is required to seed REALSPACE services.");

const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const originalSeedCopy: Record<string, string> = {
  "Buying a Property": "Expert guidance to help you find and purchase verified RERA-approved properties in Thane.",
  "Selling a Property": "Seamless assistance to list, market, and sell your property at the best market value.",
  "Renting a Property": "Comprehensive support to find trusted tenants or rent quality residential and commercial spaces.",
};

async function main() {
  for (const item of referenceServices) {
    const existingBySlug = await prisma.reraService.findUnique({ where: { slug: item.slug } });
    if (existingBySlug) {
      console.log(`Preserved existing service and admin content: ${item.slug}`);
      continue;
    }

    const allServices = await prisma.reraService.findMany({ select: { id: true, title: true, slug: true, shortDescription: true, pageHeading: true, bannerImageUrl: true, bannerImageAlt: true, contentImages: true, sections: true, ctaText: true, ctaUrl: true } });
    const legacy = allServices.find((service) => !service.slug && serviceSlug(service.title) === item.slug);
    const images = item.imageUrls.map((url, sortOrder) => ({ url, publicId: "", altText: `${item.title} - image ${sortOrder + 1}`, sortOrder }));

    if (legacy) {
      const isUntouchedStarterRecord = originalSeedCopy[legacy.title] !== undefined;
      await prisma.reraService.update({
        where: { id: legacy.id },
        data: {
          ...(isUntouchedStarterRecord ? { title: item.title, description: item.description } : {}),
          slug: item.slug,
          shortDescription: legacy.shortDescription ?? item.shortDescription,
          pageHeading: legacy.pageHeading ?? item.title,
          bannerImageUrl: legacy.bannerImageUrl ?? item.bannerImageUrl,
          bannerImageAlt: legacy.bannerImageAlt ?? item.bannerImageAlt,
          contentImages: legacy.contentImages ?? images,
          sections: legacy.sections ?? [],
          ctaText: legacy.ctaText ?? "Contact REALSPACE",
          ctaUrl: legacy.ctaUrl ?? "/contact",
        },
      });
      console.log(`Added public page fields to existing RERA service: ${legacy.title} (${item.slug})`);
      continue;
    }

    await prisma.reraService.create({
      data: {
        title: item.title,
        slug: item.slug,
        shortDescription: item.shortDescription,
        description: item.description,
        pageHeading: item.title,
        iconKey: item.iconKey,
        highlights: [...item.highlights],
        bannerImageUrl: item.bannerImageUrl,
        bannerImageAlt: item.bannerImageAlt,
        contentImages: images,
        sections: [],
        ctaText: "Contact REALSPACE",
        ctaUrl: "/contact",
        sortOrder: item.sortOrder,
        isPublished: true,
      },
    });
    console.log(`Created initial service: ${item.title} (${item.slug})`);
  }
}

main()
  .catch((error) => { console.error("REALSPACE service seed failed:", error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
