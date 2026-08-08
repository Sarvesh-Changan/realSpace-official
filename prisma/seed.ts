import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed SiteSettings (singleton)
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      companyName: "REALSPACE",
      phone: "+91 98692 11777",
      whatsapp: "+91 98692 11777",
      email: "test@example.com",
      address: "Thane, Maharashtra",
      heroHeadline: "Your Space, Reimagined.",
      heroSubhead: "Interior and exterior design for Thane homes and offices.",
      ctaText: "Get Free Quote",
    },
    create: {
      id: "singleton",
      companyName: "REALSPACE",
      phone: "+91 98692 11777",
      whatsapp: "+91 98692 11777",
      email: "test@example.com",
      address: "Thane, Maharashtra",
      heroHeadline: "Your Space, Reimagined.",
      heroSubhead: "Interior and exterior design for Thane homes and offices.",
      ctaText: "Get Free Quote",
    },
  });

  console.log("Seeded SiteSettings:", siteSettings.id);

  // 2. Seed PricingOptions for groupKey "bhk_type"
  const bhkOptions = [
    { label: "1 BHK", basePrice: 150000, sortOrder: 1 },
    { label: "2 BHK", basePrice: 250000, sortOrder: 2 },
    { label: "3 BHK", basePrice: 350000, sortOrder: 3 },
    { label: "4 BHK", basePrice: 450000, sortOrder: 4 },
    { label: "5 BHK+", basePrice: 600000, sortOrder: 5 },
  ];

  for (const option of bhkOptions) {
    const existing = await prisma.pricingOption.findFirst({
      where: { groupKey: "bhk_type", label: option.label },
    });

    if (!existing) {
      await prisma.pricingOption.create({
        data: {
          groupKey: "bhk_type",
          label: option.label,
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    } else {
      await prisma.pricingOption.update({
        where: { id: existing.id },
        data: {
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    }
  }

  console.log(`Seeded ${bhkOptions.length} BHK pricing options.`);

  // 3. Seed PricingOptions for groupKey "material_tier"
  const materialOptions = [
    { label: "Standard", basePrice: 100000, sortOrder: 1 },
    { label: "Premium", basePrice: 250000, sortOrder: 2 },
    { label: "Luxury", basePrice: 500000, sortOrder: 3 },
  ];

  for (const option of materialOptions) {
    const existing = await prisma.pricingOption.findFirst({
      where: { groupKey: "material_tier", label: option.label },
    });

    if (!existing) {
      await prisma.pricingOption.create({
        data: {
          groupKey: "material_tier",
          label: option.label,
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    } else {
      await prisma.pricingOption.update({
        where: { id: existing.id },
        data: {
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    }
  }

  console.log(`Seeded ${materialOptions.length} material tier pricing options.`);

  // 4. Seed PricingOptions for room types
  const roomOptions = [
    { groupKey: "kitchen", label: "Kitchen", basePrice: 0, perUnitPrice: 150000, sortOrder: 1 },
    { groupKey: "hall", label: "Living Room / Hall", basePrice: 0, perUnitPrice: 100000, sortOrder: 2 },
    { groupKey: "bedroom", label: "Bedroom", basePrice: 0, perUnitPrice: 120000, sortOrder: 3 },
    { groupKey: "bathroom", label: "Bathroom", basePrice: 0, perUnitPrice: 80000, sortOrder: 4 },
    { groupKey: "wardrobe", label: "Wardrobe", basePrice: 0, perUnitPrice: 50000, sortOrder: 5 },
  ];

  for (const option of roomOptions) {
    const existing = await prisma.pricingOption.findFirst({
      where: { groupKey: option.groupKey, label: option.label },
    });

    if (!existing) {
      await prisma.pricingOption.create({
        data: {
          groupKey: option.groupKey,
          label: option.label,
          basePrice: option.basePrice,
          perUnitPrice: option.perUnitPrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    } else {
      await prisma.pricingOption.update({
        where: { id: existing.id },
        data: {
          basePrice: option.basePrice,
          perUnitPrice: option.perUnitPrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    }
  }

  // 5. Seed PricingOptions for exterior service
  const exteriorOptions = [
    { groupKey: "exterior_service", label: "Exterior Architecture Base", basePrice: 200000, sortOrder: 1 },
  ];

  for (const option of exteriorOptions) {
    const existing = await prisma.pricingOption.findFirst({
      where: { groupKey: option.groupKey, label: option.label },
    });

    if (!existing) {
      await prisma.pricingOption.create({
        data: {
          groupKey: option.groupKey,
          label: option.label,
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    } else {
      await prisma.pricingOption.update({
        where: { id: existing.id },
        data: {
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    }
  }

  // 6. Seed PricingOptions for addons
  const addonOptions = [
    { label: "False Ceiling", basePrice: 60000, sortOrder: 1 },
    { label: "Painting & Textures", basePrice: 80000, sortOrder: 2 },
    { label: "Plumbing", basePrice: 40000, sortOrder: 3 },
    { label: "Electrical & Lighting", basePrice: 50000, sortOrder: 4 },
    { label: "Smart Home Automation", basePrice: 150000, sortOrder: 5 },
    { label: "Custom Furniture", basePrice: 120000, sortOrder: 6 },
  ];

  for (const option of addonOptions) {
    const existing = await prisma.pricingOption.findFirst({
      where: { groupKey: "addon", label: option.label },
    });

    if (!existing) {
      await prisma.pricingOption.create({
        data: {
          groupKey: "addon",
          label: option.label,
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    } else {
      await prisma.pricingOption.update({
        where: { id: existing.id },
        data: {
          basePrice: option.basePrice,
          sortOrder: option.sortOrder,
          isActive: true,
        },
      });
    }
  }

  console.log("Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
