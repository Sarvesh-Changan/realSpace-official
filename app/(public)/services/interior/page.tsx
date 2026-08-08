import prisma from "@/lib/prisma";
import { ServiceGrid, type ServiceItem } from "../_components/ServiceGrid";
import { ServicesHeader } from "../_components/ServicesHeader";
import { ServicesCta } from "../_components/ServicesCta";
import { getServiceIconComponent } from "../_components/iconMapper";
import {
  Home,
  Utensils,
  Sofa,
  BedDouble,
  Box,
  Briefcase,
  Hammer,
  Key,
} from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Interior Design Services | REALSPACE Thane",
  description:
    "Bespoke interior design services for homes and offices across Thane and Mumbai. Modular kitchens, living rooms, bedrooms, and full turnkey interiors.",
};

const defaultInteriorServices: ServiceItem[] = [
  {
    title: "Complete Home Interiors",
    description:
      "End-to-end interior design and execution for your entire home, tailored to your lifestyle.",
    icon: Home,
  },
  {
    title: "Modular Kitchen",
    description:
      "Smart, space-efficient, and beautifully crafted modular kitchens designed for modern cooking.",
    icon: Utensils,
  },
  {
    title: "Living Room",
    description:
      "Inviting and functional living spaces that make a lasting impression on your guests.",
    icon: Sofa,
  },
  {
    title: "Bedroom",
    description:
      "Personalized bedroom designs focusing on comfort, aesthetics, and optimal storage.",
    icon: BedDouble,
  },
  {
    title: "Wardrobe",
    description:
      "Custom wardrobe solutions maximizing your storage without compromising on room aesthetics.",
    icon: Box,
  },
  {
    title: "Office Interiors",
    description:
      "Professional, ergonomic, and inspiring workspaces designed to boost productivity.",
    icon: Briefcase,
  },
  {
    title: "Renovation",
    description:
      "Breathe new life into your existing spaces with our comprehensive remodeling services.",
    icon: Hammer,
  },
  {
    title: "Turnkey Interiors",
    description:
      "From concept to handover, we manage everything so you can simply walk into your new space.",
    icon: Key,
  },
];

export default async function InteriorServicesPage() {
  let dbServices: Array<{
    id: string;
    title: string;
    description: string;
    iconKey?: string | null;
  }> = [];

  try {
    dbServices = await prisma.service.findMany({
      where: {
        designType: "INTERIOR",
        isPublished: true,
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    console.error("Error fetching interior services from Prisma:", error);
  }

  const interiorServices: ServiceItem[] =
    dbServices.length > 0
      ? dbServices.map((s, idx) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: getServiceIconComponent(s.iconKey, "INTERIOR", idx),
        }))
      : defaultInteriorServices;

  return (
    <div className="flex flex-col pt-24 md:pt-32">
      <ServicesHeader
        title="Interior Design Services"
        intro="Transforming apartments and villas into elegant, highly functional living environments tailored to your personal aesthetic and budget."
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Interior Solutions
          </h2>
          <div className="w-20 h-1 bg-brand-red rounded-full"></div>
        </div>
        <ServiceGrid services={interiorServices} />
      </div>

      <ServicesCta />
    </div>
  );
}
