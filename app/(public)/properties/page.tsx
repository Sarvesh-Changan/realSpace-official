import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ReferencePageBanner } from "../_components/ReferencePageBanner";
import { ReferenceSectionTitle } from "../_components/ReferenceSectionTitle";
import { ReferencePropertyCard } from "../_components/ReferencePropertyCard";

export const revalidate = 60;
export const metadata: Metadata = { title: "Properties | REALSPACE", description: "Explore properties available through REALSPACE." };

export default async function PropertiesPage() {
  let properties: Awaited<ReturnType<typeof prisma.reraProperty.findMany>> = [];
  try { properties = await prisma.reraProperty.findMany({ where: { isPublished: true }, orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }], include: { images: { where: { mediaType: "IMAGE" }, orderBy: { sortOrder: "asc" } } } }); } catch { properties = []; }
  return <><ReferencePageBanner title="Properties" image="/arnav/images/about-banner.jpg" /><section className="rs-section"><div className="rs-container"><ReferenceSectionTitle eyebrow="Find Your Property" title="Properties" /><div className="rs-property-grid">{properties.map((property) => <ReferencePropertyCard key={property.id} property={property} />)}</div>{!properties.length && <div className="rs-empty-state"><h2>Properties are being updated</h2><p>Contact our team and we’ll help you explore available options.</p><Link className="rs-button" href="/contact">Contact Us</Link></div>}</div></section></>;
}
