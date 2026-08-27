import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { ServiceGrid, type ServiceItem } from "./_components/ServiceGrid";
import { ServicesHeader } from "./_components/ServicesHeader";
import { ServicesCta } from "./_components/ServicesCta";
import { getServiceIconComponent } from "./_components/iconMapper";
import {
  Home,
  Utensils,
  Sofa,
  BedDouble,
  Box,
  Briefcase,
  Hammer,
  Key,
  Building,
  Building2,
  Layers,
  Sun,
  TreePine,
  Store,
  Wrench,
} from "lucide-react";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `Interior & Exterior Design Services | ${companyName}`,
    description: `End-to-end interior design, modular kitchens, living rooms, bedrooms, and exterior elevations in Thane by ${companyName}.`,
    path: "/services",
  });
}

// Default fallback services if DB is empty
const defaultInteriorServices: ServiceItem[] = [
  {
    title: "Complete Home Interiors",
    description: "End-to-end interior design and execution for your entire home, tailored to your lifestyle.",
    icon: Home,
  },
  {
    title: "Modular Kitchen",
    description: "Smart, space-efficient, and beautifully crafted modular kitchens designed for modern cooking.",
    icon: Utensils,
  },
  {
    title: "Living Room",
    description: "Inviting and functional living spaces that make a lasting impression on your guests.",
    icon: Sofa,
  },
  {
    title: "Bedroom",
    description: "Personalized bedroom designs focusing on comfort, aesthetics, and optimal storage.",
    icon: BedDouble,
  },
  {
    title: "Wardrobe",
    description: "Custom wardrobe solutions maximizing your storage without compromising on room aesthetics.",
    icon: Box,
  },
  {
    title: "Office Interiors",
    description: "Professional, ergonomic, and inspiring workspaces designed to boost productivity.",
    icon: Briefcase,
  },
  {
    title: "Renovation",
    description: "Breathe new life into your existing spaces with our comprehensive remodeling services.",
    icon: Hammer,
  },
  {
    title: "Turnkey Interiors",
    description: "From concept to handover, we manage everything so you can simply walk into your new space.",
    icon: Key,
  },
];

const defaultExteriorServices: ServiceItem[] = [
  {
    title: "Exterior Architecture",
    description: "Striking architectural designs that give your property a distinct and premium identity.",
    icon: Building,
  },
  {
    title: "Building Facade",
    description: "Modern facade treatments blending aesthetics, weather resistance, and structural integrity.",
    icon: Building2,
  },
  {
    title: "Elevation Design",
    description: "3D elevation planning to visualize and perfect the outward appearance of your home.",
    icon: Layers,
  },
  {
    title: "Balcony/Terrace",
    description: "Transform your outdoor extensions into relaxing retreats with smart landscaping and seating.",
    icon: Sun,
  },
  {
    title: "Outdoor Spaces",
    description: "Comprehensive planning for patios, gardens, and boundary walls to complement your exteriors.",
    icon: TreePine,
  },
  {
    title: "Villa Exteriors",
    description: "Exclusive exterior styling for independent villas, ensuring luxury from the first glance.",
    icon: Home,
  },
  {
    title: "Commercial Exteriors",
    description: "Professional and brand-aligned exterior designs for retail spaces and office buildings.",
    icon: Store,
  },
  {
    title: "Exterior Renovation",
    description: "Upgrade and modernize aging building exteriors with contemporary materials and finishes.",
    icon: Wrench,
  },
];

export default async function ServicesPage() {
  let dbServices: Array<{
    id: string;
    title: string;
    description: string;
    designType: "INTERIOR" | "EXTERIOR";
    iconKey?: string | null;
  }> = [];

  try {
    dbServices = await prisma.service.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    console.error("Error loading services from Prisma:", error);
  }

  let interiorServices: ServiceItem[] = [];
  let exteriorServices: ServiceItem[] = [];

  if (dbServices.length > 0) {
    const interiorDb = dbServices.filter((s) => s.designType === "INTERIOR");
    const exteriorDb = dbServices.filter((s) => s.designType === "EXTERIOR");

    interiorServices = interiorDb.map((s, idx) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      icon: getServiceIconComponent(s.iconKey, "INTERIOR", idx),
    }));

    exteriorServices = exteriorDb.map((s, idx) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      icon: getServiceIconComponent(s.iconKey, "EXTERIOR", idx),
    }));
  } else {
    // Fallback defaults if no service rows are seeded in DB yet
    interiorServices = defaultInteriorServices;
    exteriorServices = defaultExteriorServices;
  }

  return (
    <div className="flex flex-col pt-0">
      <ServicesHeader
        title="Our Services"
        intro="From a compact 1BHK kitchen redesign to a complete 3BHK turnkey transformation, REALSPACE handles every square foot with the same level of care."
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 space-y-16 sm:space-y-24 md:space-y-32">
        <section id="interior-services">
          <div className="mb-7 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red sm:text-xs">
                01 / The foundation
              </p>
              <h2 className="font-serif text-3xl font-bold leading-tight text-brand-text sm:text-4xl md:text-5xl">
                Interior Services
              </h2>
            </div>
          </div>
          <ServiceGrid services={interiorServices} />
        </section>

        <section id="exterior-services">
          <div className="mb-7 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-brand-red sm:text-xs">
                02 / First impression
              </p>
              <h2 className="font-serif text-3xl font-bold leading-tight text-brand-text sm:text-4xl md:text-5xl">
                Exterior Services
              </h2>
            </div>
          </div>
          <ServiceGrid services={exteriorServices} />
        </section>
      </div>

      <ServicesCta />
    </div>
  );
}
