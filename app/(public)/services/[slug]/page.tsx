import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { serviceSlug } from "@/lib/rera/public-service";
import { ReferencePageBanner } from "../../_components/ReferencePageBanner";

type Props = { params: Promise<{ slug: string }> };
type ServiceRecord = Awaited<ReturnType<typeof prisma.reraService.findFirst>>;
export const revalidate = 60;

async function findService(slug: string): Promise<ServiceRecord> {
  try {
    const services = await prisma.reraService.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
    return services.find((service) => (service.slug || serviceSlug(service.title)) === slug) || null;
  } catch (error) { console.error("Could not load public service", error); return null; }
}

export async function generateStaticParams() {
  try {
    const services = await prisma.reraService.findMany({ where: { isPublished: true }, select: { title: true, slug: true } });
    return services.map((service) => ({ slug: service.slug || serviceSlug(service.title) }));
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await findService(slug);
  if (!service) return { title: "Service | REALSPACE" };
  return { title: `${service.title} | REALSPACE`, description: service.shortDescription || service.description };
}

function jsonImages(value: unknown): Array<{ url: string; altText: string; sortOrder: number }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => item && typeof item === "object" && "url" in item && typeof item.url === "string"
    ? [{ url: item.url, altText: "altText" in item && typeof item.altText === "string" ? item.altText : "", sortOrder: "sortOrder" in item && typeof item.sortOrder === "number" ? item.sortOrder : index }]
    : []).sort((a, b) => a.sortOrder - b.sortOrder);
}

function jsonSections(value: unknown): Array<{ heading: string; body: string; imageUrl: string; imageAlt: string; buttonLabel: string; buttonUrl: string; isEnabled: boolean; sortOrder: number }> {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => item && typeof item === "object"
    ? [{ heading: "heading" in item && typeof item.heading === "string" ? item.heading : "", body: "body" in item && typeof item.body === "string" ? item.body : "", imageUrl: "imageUrl" in item && typeof item.imageUrl === "string" ? item.imageUrl : "", imageAlt: "imageAlt" in item && typeof item.imageAlt === "string" ? item.imageAlt : "", buttonLabel: "buttonLabel" in item && typeof item.buttonLabel === "string" ? item.buttonLabel : "", buttonUrl: "buttonUrl" in item && typeof item.buttonUrl === "string" ? item.buttonUrl : "", isEnabled: !("isEnabled" in item) || item.isEnabled !== false, sortOrder: "sortOrder" in item && typeof item.sortOrder === "number" ? item.sortOrder : index }]
    : []).sort((a, b) => a.sortOrder - b.sortOrder);
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await findService(slug);
  if (!service) notFound();
  const images = jsonImages(service.contentImages);
  const sections = jsonSections(service.sections).filter((section) => section.isEnabled);
  const banner = service.bannerImageUrl || "/arnav/images/about-banner.jpg";
  const heading = service.pageHeading || service.title;
  const allPublished = await prisma.reraService.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }], select: { title: true, slug: true } }).catch(() => []);
  const related = allPublished.filter((item) => (item.slug || serviceSlug(item.title)) !== slug);

  return <>
    <ReferencePageBanner title={heading} image={banner} />
    <section className="rs-section"><div className="rs-container">
      <div className="rs-service-detail">
        {images[0] && <div className="rs-service-detail__image"><Image src={images[0].url} alt={images[0].altText || service.title} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized /></div>}
        <div><p className="rs-eyebrow">REALSPACE PROPERTY SERVICES</p><h2>{service.title}</h2>{service.shortDescription && <p className="rs-service-lead">{service.shortDescription}</p>}<p>{service.description}</p>
          {service.highlights.length > 0 && <ul className="rs-service-highlights">{service.highlights.map((highlight, index) => <li key={`${highlight}-${index}`}>{highlight}</li>)}</ul>}
          <Link className="rs-button" href={service.ctaUrl || "/contact"}>{service.ctaText || "Enquire Now"} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
      {sections.map((section, index) => <section className={`rs-service-section ${index % 2 ? "rs-service-section--reverse" : ""}`} key={`${section.heading}-${index}`}>
        {section.imageUrl && <div className="rs-service-section__image"><Image src={section.imageUrl} alt={section.imageAlt || section.heading} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized /></div>}
        <div>{section.heading && <h2>{section.heading}</h2>}{section.body && <p>{section.body}</p>}{section.buttonLabel && <Link href={section.buttonUrl || "/contact"} className="rs-button">{section.buttonLabel} <span aria-hidden="true">→</span></Link>}</div>
      </section>)}
      {images.length > 1 && <div className="rs-service-gallery">{images.slice(1).map((image, index) => <Image key={`${image.url}-${index}`} src={image.url} alt={image.altText || `${service.title} ${index + 2}`} width={560} height={360} unoptimized />)}</div>}
    </div></section>
    {related.length > 0 && <section className="rs-section rs-related-services"><div className="rs-container"><h2>Explore More Services</h2><div>{related.map((item) => <Link key={item.slug || item.title} href={`/services/${item.slug || serviceSlug(item.title)}`}>{item.title} <span aria-hidden="true">→</span></Link>)}</div></div></section>}
  </>;
}
