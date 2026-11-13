import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ReferencePageBanner } from "../_components/ReferencePageBanner";
import { ReferenceSectionTitle } from "../_components/ReferenceSectionTitle";
import { serviceSlug } from "@/lib/rera/public-service";

export const revalidate = 60;
export const metadata: Metadata = { title: "Services | REALSPACE", description: "Property buying, selling, renting and real estate services from REALSPACE." };

export default async function ServicesPage() {
  let services: Awaited<ReturnType<typeof prisma.reraService.findMany>> = [];
  try {
    services = await prisma.reraService.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  } catch (error) { console.error("Could not load public services", error); }

  return <>
    <ReferencePageBanner title="Our Services" image="/arnav/images/about-banner.jpg" />
    <section className="rs-section"><div className="rs-container">
      <ReferenceSectionTitle eyebrow="What We Do" title="Our Services" />
      {services.length ? <div className="rs-services-grid">{services.map((service) => {
        const slug = service.slug || serviceSlug(service.title);
        const image = service.bannerImageUrl || (service.contentImages && Array.isArray(service.contentImages) && typeof service.contentImages[0] === "object" && service.contentImages[0] && "url" in service.contentImages[0] && typeof service.contentImages[0].url === "string" ? service.contentImages[0].url : "/arnav/images/booking/waiter-right.jpg");
        return <article className="rs-service-card" key={service.id}>
          <Link href={`/services/${slug}`} className="rs-service-card__image"><Image src={image} alt={service.bannerImageAlt || service.title} width={640} height={400} unoptimized /></Link>
          <span className="rs-service-card__icon" aria-hidden="true">{service.iconKey === "keyround" ? "⌑" : service.iconKey === "briefcase" ? "◈" : "⌂"}</span>
          <h2>{service.title}</h2><p>{service.shortDescription || service.description}</p>
          <Link href={`/services/${slug}`}>Read More <span aria-hidden="true">→</span></Link>
        </article>;
      })}</div> : <p className="rs-empty-state">Service information is being updated. Please contact REALSPACE for assistance.</p>}
    </div></section>
    <section className="rs-contact-strip"><div className="rs-container"><div><p>Need help with your next move?</p><h2>Let’s discuss the right property service for you.</h2></div><Link href="/contact" className="rs-button rs-button--light">Contact Us <span>→</span></Link></div></section>
  </>;
}
