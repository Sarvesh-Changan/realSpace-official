import prisma from "@/lib/prisma";
import { ServiceGrid, type ServiceItem } from "../_components/ServiceGrid";
import { ServicesHeader } from "../_components/ServicesHeader";
import { ServicesCta } from "../_components/ServicesCta";
import { getServiceIconComponent } from "../_components/iconMapper";
import {
  Home,
  Building,
  Building2,
  Layers,
  Sun,
  TreePine,
  Store,
  Wrench,
} from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Exterior & Elevation Services | REALSPACE Thane",
  description:
    "Striking architectural facades, 3D elevation designs, and balcony transformations for villas and commercial buildings in Thane.",
};

const defaultExteriorServices: ServiceItem[] = [
  {
    title: "Exterior Architecture",
    description:
      "Striking architectural designs that give your property a distinct and premium identity.",
    icon: Building,
  },
  {
    title: "Building Facade",
    description:
      "Modern facade treatments blending aesthetics, weather resistance, and structural integrity.",
    icon: Building2,
  },
  {
    title: "Elevation Design",
    description:
      "3D elevation planning to visualize and perfect the outward appearance of your home.",
    icon: Layers,
  },
  {
    title: "Balcony/Terrace",
    description:
      "Transform your outdoor extensions into relaxing retreats with smart landscaping and seating.",
    icon: Sun,
  },
  {
    title: "Outdoor Spaces",
    description:
      "Comprehensive planning for patios, gardens, and boundary walls to complement your exteriors.",
    icon: TreePine,
  },
  {
    title: "Villa Exteriors",
    description:
      "Exclusive exterior styling for independent villas, ensuring luxury from the first glance.",
    icon: Home,
  },
  {
    title: "Commercial Exteriors",
    description:
      "Professional and brand-aligned exterior designs for retail spaces and office buildings.",
    icon: Store,
  },
  {
    title: "Exterior Renovation",
    description:
      "Upgrade and modernize aging building exteriors with contemporary materials and finishes.",
    icon: Wrench,
  },
];

export default async function ExteriorServicesPage() {
  let dbServices: Array<{
    id: string;
    title: string;
    description: string;
    iconKey?: string | null;
  }> = [];

  try {
    dbServices = await prisma.service.findMany({
      where: {
        designType: "EXTERIOR",
        isPublished: true,
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch (error) {
    console.error("Error fetching exterior services from Prisma:", error);
  }

  const exteriorServices: ServiceItem[] =
    dbServices.length > 0
      ? dbServices.map((s, idx) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: getServiceIconComponent(s.iconKey, "EXTERIOR", idx),
        }))
      : defaultExteriorServices;

  return (
    <div className="flex flex-col pt-24 md:pt-32">
      <ServicesHeader
        title="Exterior & Elevation Services"
        intro="Architectural elevation, modern facade treatments, and outdoor space design engineered for longevity and curb appeal."
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
            Exterior Solutions
          </h2>
          <div className="w-20 h-1 bg-brand-yellow rounded-full"></div>
        </div>
        <ServiceGrid services={exteriorServices} />
      </div>

      <ServicesCta />
    </div>
  );
}
