import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL?.replace(
  /sslmode=(require|prefer|verify-ca)/g,
  "sslmode=verify-full",
);
if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed reference properties.");
}

const pool = new pg.Pool({ connectionString });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const properties = [
  {
    slug: "godrej-alive",
    title: "Godrej Alive",
    projectName: "Godrej Alive",
    builderName: "Godrej Properties Limited",
    locality: "Thane",
    bhkLabel: "2, 3 & 4 BHK",
    priceLabel: "From ₹1.66 Cr",
    priceAmount: 16600000,
    carpetAreaSqFt: 787,
    description:
      "Godrej Alive offers 2 BHK, 3 BHK and 4 BHK residences in Thane. The reference lists carpet areas from 787 to 1,469 sq. ft. and shows prices from ₹1.66 Cr. Contact REALSPACE to confirm current availability and pricing.",
    coverImageUrl: "/arnav/images/blog/blog-post10.jpg",
    isFeatured: true,
    specifications: [
      { label: "2 BHK Premium", value: "787 sq. ft. carpet · ₹1.66 Cr" },
      { label: "3 BHK Premium", value: "1,052 sq. ft. carpet · ₹2.21 Cr" },
      { label: "3 BHK Luxury", value: "1,079 sq. ft. carpet · ₹2.45 Cr" },
      { label: "3 BHK Luxury", value: "1,195 sq. ft. carpet · ₹2.68 Cr" },
      { label: "4 BHK Ultra Luxury", value: "1,469 sq. ft. carpet · ₹3.65 Cr" },
      { label: "Booking", value: "₹5 Lakh (as shown in the reference)" },
      { label: "Prices", value: "Reference lists price per sq. m. as on request; prices shown are source-listed amounts." },
    ],
    imageFiles: ["blog-post10.jpg", "blog-post1.jpg", "blog-post2.jpg", "blog-post3.jpg", "blog-post4.jpg", "blog-post5.jpg"],
  },
  {
    slug: "ace-homes",
    title: "ACE Homes",
    projectName: "ACE Homes",
    builderName: "ACE",
    locality: "Behind Kasarvadavli Post Office, near Kasarvadavli Lake, Off Ghodbunder Road, Thane West, Maharashtra 400615",
    bhkLabel: "1 & 2 BHK",
    priceLabel: "From ₹50 Lakhs",
    priceAmount: 5000000,
    carpetAreaSqFt: 434,
    description:
      "ACE Homes is described in the reference as a lake-side residential project with 1 BHK and 2 BHK garden-facing and lake-facing apartments. Reference prices start at ₹50 Lakhs for 1 BHK and ₹67 Lakhs for 2 BHK. Prices and availability should be confirmed.",
    coverImageUrl: "/arnav/images/blog/blog-post11.jpg",
    isFeatured: true,
    amenities: ["Park", "Car parking", "Lake-facing apartments", "Garden-facing apartments"],
    specifications: [
      { label: "1 BHK Garden Facing", value: "434 sq. ft. carpet · ₹50,00,000" },
      { label: "1 BHK Garden Facing", value: "450 sq. ft. carpet · ₹52,00,000" },
      { label: "1 BHK Lake Facing", value: "450 sq. ft. carpet · ₹53,00,000" },
      { label: "2 BHK Garden Facing", value: "581 sq. ft. carpet · ₹67,00,000" },
      { label: "2 BHK Lake Facing", value: "581 sq. ft. carpet · ₹68,00,000" },
      { label: "Booking offer", value: "Gift voucher on booking (as shown in the reference)" },
    ],
    imageFiles: ["blog-post11.jpg", "blog-post12.jpg", "blog-post13.jpg", "blog-post6.jpg", "blog-post7.jpg", "blog-post8.jpg"],
  },
  {
    slug: "courtyard-thane",
    title: "Courtyard",
    projectName: "Courtyard",
    builderName: null,
    locality: "Opp. Glaxo Smith Kline Ltd., Pokhran Road No. 2, Pawar Nagar, Thane West 400610",
    bhkLabel: "2 & 3 BHK",
    priceLabel: "From ₹1.08 Cr",
    priceAmount: 10800000,
    carpetAreaSqFt: 519,
    description:
      "The reference describes Courtyard as a residential project on Pokhran Road No. 2, designed to provide natural sunlight. The listed outdoor amenities include a lawn, party area, kids’ pool and play zone, and herb garden. Reference prices start at ₹1.08 Cr for 2 BHK and ₹2.57 Cr for 3 BHK.",
    coverImageUrl: "/arnav/images/blog/blog-post14.jpg",
    isFeatured: true,
    amenities: ["Lawn area", "Party area", "Kids’ pool", "Kids’ play zone", "Herb garden"],
    specifications: [
      { label: "2 BHK Petite", value: "519 sq. ft. carpet · ₹1.08 Cr" },
      { label: "2 BHK Smart", value: "706 sq. ft. carpet · Starting ₹1.46 Cr" },
      { label: "2 BHK Luxury", value: "762 sq. ft. carpet · Starting ₹1.62 Cr" },
      { label: "3 BHK Community Park Facing", value: "1,080 sq. ft. carpet · Starting ₹2.57 Cr" },
      { label: "3 BHK Club House Facing", value: "1,208 sq. ft. carpet · Starting ₹2.88 Cr" },
      { label: "Garden-facing apartments", value: "Reference lists an additional ₹3 Lakhs for garden-facing apartments." },
      { label: "Booking", value: "Open (as shown in the reference)" },
    ],
    imageFiles: ["blog-post14.jpg", "blog-post17.jpg", "blog-post15.jpg", "blog-post16.jpg", "blog-post18.jpg", "blog-post19.jpg"],
  },
  {
    slug: "lodha-splendora",
    title: "Lodha Splendora",
    projectName: "Lodha Splendora",
    builderName: "Lodha",
    locality: "Thane",
    bhkLabel: "2 & 3 BHK",
    priceLabel: "From ₹94 Lakhs",
    priceAmount: 9400000,
    carpetAreaSqFt: 610,
    description:
      "The reference describes Lodha Splendora as a residential development with landscaped grounds and lists 2 BHK and 3 BHK configurations. It lists prices from ₹94 Lakhs. Contact REALSPACE to confirm current availability and pricing.",
    coverImageUrl: "/arnav/images/blog/blog1.jpg",
    isFeatured: false,
    specifications: [
      { label: "2 BHK Petite · Vivant B", value: "610 sq. ft. carpet · ₹94 Lakhs" },
      { label: "2 BHK Luxury · Vivant C, D, E, F, G", value: "770 sq. ft. carpet · ₹1.08 Cr" },
      { label: "3 BHK Petite · Ciello C", value: "993 sq. ft. carpet · ₹1.20 Cr" },
      { label: "3 BHK Luxury · Ciello D", value: "1,161 sq. ft. carpet" },
      { label: "Booking", value: "Available (as shown in the reference)" },
    ],
    imageFiles: ["blog1.jpg", "blog-post20.jpg", "blog-post21.jpg", "blog-post22.jpg", "blog-post23.jpg"],
  },
  {
    slug: "godrej-emerald",
    title: "Godrej Emerald",
    projectName: "Godrej Emerald",
    builderName: "Godrej Properties",
    locality: "Gaimukh Gaon, Ghodbunder Road, Bhayandarpada, Thane West",
    bhkLabel: "1.5, 2 & 3 BHK",
    priceLabel: "From ₹81 Lakhs (reference listing)",
    priceAmount: 8100000,
    carpetAreaSqFt: 512,
    possession: "Dec 2022 (as stated in the reference)",
    description:
      "Godrej Emerald offers 1.5 BHK, 2 BHK and 3 BHK residences. The downloaded reference lists a sales office at Gaimukh Gaon, Ghodbunder Road, Bhayandarpada, Thane West, and gives Dec 2022 as the possession date. Its pricing and possession details are reproduced from the source and may be outdated.",
    coverImageUrl: "/arnav/images/blog/blog-post24.jpg",
    isFeatured: false,
    amenities: ["Swimming pool", "Squash court", "Floating skywalk"],
    specifications: [
      { label: "Amenities", value: "40+ listed in the reference" },
      { label: "Reference offer", value: "Own a home at ₹9,999 per month till OC (source-listed offer; confirm current terms)" },
      { label: "Landmark", value: "Very close to Vedant Hospital" },
      { label: "1.5 BHK", value: "512 sq. ft. carpet · ₹81 Lakhs" },
      { label: "2 BHK", value: "720 sq. ft. carpet · ₹1.12 Cr" },
      { label: "3 BHK", value: "920 sq. ft. carpet · ₹1.41 Cr" },
      { label: "Possession", value: "Dec 2022 (reference listing)" },
    ],
    imageFiles: ["blog-post24.jpg", "blog-post25.jpg", "blog-post26.jpg", "blog-post27.jpg"],
  },
  {
    slug: "narang-privado",
    title: "Narang Privado",
    projectName: "Narang Privado",
    builderName: "Narang Realty",
    locality: "Off Pokhran Road 1, Thane West",
    bhkLabel: "2, 3 & 4 BHK",
    priceLabel: "From ₹1.21 Cr (reference listing)",
    priceAmount: 12100000,
    carpetAreaSqFt: 479,
    possession: "Multiple tower dates: Aug 2026, Dec 2026 and Dec 2027 (reference listing)",
    description:
      "The reference describes Narang Privado as a 7-acre residential development off Pokhran Road 1, Thane West, and lists multiple towers with different possession dates and configurations. Prices and availability are reproduced from the downloaded source and should be confirmed.",
    coverImageUrl: "/arnav/images/blog/blog-post28.jpg",
    isFeatured: false,
    amenities: ["Padel court", "Rock climbing wall", "Arena"],
    specifications: [
      { label: "Project highlights", value: "7 acres · 5 towers" },
      { label: "Reference offers", value: "Zero stamp duty · No negotiation policy" },
      { label: "Tower A", value: "G+41 storeys · possession Dec 2027" },
      { label: "Tower B", value: "G+38 storeys · possession Dec 2026" },
      { label: "Tower C", value: "G+38 storeys · possession Aug 2026" },
      { label: "Other listed features", value: "32+ amenities · 10.5 ft floor-to-floor height · 5 lifts per tower · 4 ft 11 in balcony" },
      { label: "Tower A · 2 BHK Smart", value: "479 sq. ft. · ₹1.21 Cr · 28th floor" },
      { label: "Tower A · 2 BHK Luxury", value: "800 sq. ft. · ₹1.85 Cr · 1st floor" },
      { label: "Tower A · 3 BHK Royale", value: "903 sq. ft. · ₹2.06 Cr · 1st floor" },
      { label: "Tower A · 3 BHK Regal", value: "1,128 sq. ft. · ₹2.68 Cr · 1st floor" },
      { label: "Tower A · 3 BHK Luxury", value: "1,295 sq. ft. · ₹3.06 Cr · 1st floor" },
      { label: "Tower A · 4 BHK Elite", value: "1,619 sq. ft. · ₹4.21 Cr · 32nd floor" },
      { label: "Tower B · 2 BHK Regal", value: "737 sq. ft. · ₹1.78 Cr · 12th floor" },
      { label: "Tower B · 2 BHK Luxury", value: "800 sq. ft. · ₹2.08 Cr · sold out in reference" },
      { label: "Tower B · 3 BHK Regal", value: "1,128 sq. ft. · ₹2.74 Cr · 2nd floor" },
      { label: "Tower B · 3 BHK Luxury", value: "1,295 sq. ft. · ₹3.59 Cr · 29th floor" },
      { label: "Tower B · 4 BHK Imperial", value: "1,486 sq. ft. · ₹3.84 Cr · 31st floor" },
      { label: "Tower B · 4 BHK Elite", value: "1,616 sq. ft. · ₹4.28 Cr · 33rd floor" },
      { label: "Tower C · 2 BHK Regal", value: "737 sq. ft. · ₹1.70 Cr · 1st floor" },
      { label: "Tower C · 2 BHK Luxury", value: "800 sq. ft. · ₹1.88 Cr · 1st floor" },
      { label: "Tower C · 3 BHK Regal", value: "1,070 sq. ft. · ₹2.55 Cr · 4th floor" },
      { label: "Tower C · 3 BHK Regal", value: "1,128 sq. ft. · ₹2.72 Cr · 1st floor" },
      { label: "Tower C · 3 BHK Luxury", value: "1,295 sq. ft. · ₹3.16 Cr · 1st floor" },
      { label: "Tower C · 4 BHK Imperial", value: "1,486 sq. ft. · ₹3.84 Cr · 31st floor" },
      { label: "Tower C · 4 BHK Elite", value: "1,616 sq. ft. · ₹4.26 Cr · 31st floor" },
    ],
    imageFiles: ["blog-post28.jpg", "blog-post32.jpg", "blog-post33.jpg", "blog-post29.jpg", "blog-post30.jpg", "blog-post31.jpg"],
  },
  {
    slug: "belicia-house-of-hiranandani",
    title: "Belicia - House of Hiranandani",
    projectName: "Belicia",
    builderName: "House of Hiranandani",
    locality: "Nitin Junction, Panchpakhadi, Thane West",
    bhkLabel: "2, 3 & 4.5 BHK",
    priceLabel: "From ₹2.25 Cr (reference listing)",
    priceAmount: 22500000,
    carpetAreaSqFt: 778,
    possession: "June 2028 (as stated in the reference)",
    projectReraNo: "P51700050457",
    description:
      "The reference describes Belicia as a 53-storey tower at Nitin Junction, Panchpakhadi, Thane West, with 1 basement parking level, 4 podium parking levels, amenities on the 5th podium, and 48 residential floors. It lists 2 BHK, 3 BHK and 4.5 BHK residences. Pricing and possession information is reproduced from the source and may change.",
    coverImageUrl: "/arnav/images/blog/blog-post34.jpg",
    isFeatured: false,
    amenities: ["Kids’ play area", "Yoga deck", "Badminton court", "Business centre", "Games room", "Mini party hall", "Multipurpose hall", "Landscape areas", "Squash court", "Mini theatre", "Cricket pitch", "Skating rink", "Rooftop gymnasium", "Rooftop swimming pool", "Kids’ pool"],
    specifications: [
      { label: "Tower", value: "53 storeys · 1 basement parking level · 4 podium parking levels · 48 residential floors" },
      { label: "Floor plan highlights", value: "8 signature balcony apartments per floor · air-conditioned residences" },
      { label: "2 BHK (S)", value: "778 sq. ft. RERA carpet" },
      { label: "2 BHK (L)", value: "782 sq. ft. RERA carpet" },
      { label: "3 BHK (S)", value: "1,090 sq. ft. RERA carpet" },
      { label: "3 BHK (L)", value: "1,178 sq. ft. RERA carpet" },
      { label: "4.5 BHK", value: "1,546 sq. ft. RERA carpet" },
      { label: "Project RERA", value: "P51700050457 (as listed in the reference)" },
      { label: "Possession", value: "June 2028 (as listed in the reference)" },
      { label: "Construction status", value: "Work in progress for 27th slab (as stated in the reference)" },
      { label: "Booking", value: "Open (as shown in the reference)" },
      { label: "Location", value: "Opp. Kaushalya Hospital, Almeda Road, Panchpakhadi Junction, Thane West" },
    ],
    imageFiles: ["blog-post34.jpg"],
  },
].map((property, index) => ({
  ...property,
  city: "Thane",
  sortOrder: index,
  listingType: "SALE" as const,
  propertyType: "APARTMENT" as const,
  isNewLaunch: false,
  isPublished: true,
  amenities: property.amenities ?? [],
  specifications: property.specifications ?? [],
  images: property.imageFiles.map((file, sortOrder) => ({
    url: `/arnav/images/blog/${file}`,
    altText: `${property.title} property image ${sortOrder + 1}`,
    sortOrder,
  })),
}));

async function main() {
  for (const property of properties) {
    const { imageFiles, images, ...fields } = property;
    void imageFiles;
    const existing = await prisma.reraProperty.findUnique({
      where: { slug: property.slug },
      select: { id: true },
    });

    if (existing) {
      console.log(`Preserved existing property: ${property.title} (${property.slug})`);
      continue;
    }

    await prisma.reraProperty.create({
      data: {
        ...fields,
        images: { create: images },
      },
    });
    console.log(`Created reference property: ${property.title} (${property.slug})`);
  }
}

main()
  .catch((error) => {
    console.error("Reference property seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
