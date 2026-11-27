import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { PropertyEnquiryForm } from "../../_components/PropertyEnquiryForm";
import { ReferencePageBanner } from "../../_components/ReferencePageBanner";

type Props = { params: Promise<{ slug: string }> };
type PropertySpecification = { label: string; value: string };

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    return (await prisma.reraProperty.findMany({
      where: { isPublished: true },
      select: { slug: true },
    })).map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await prisma.reraProperty.findUnique({
      where: { slug },
      select: { title: true, description: true, isPublished: true },
    });
    if (property?.isPublished) {
      return {
        title: `${property.title} | REALSPACE`,
        description: property.description || `Explore ${property.title} with REALSPACE.`,
      };
    }
  } catch {
    // The public property page shows not-found when the database is unavailable.
  }
  return { title: "Property | REALSPACE" };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  let property = null;
  try {
    property = await prisma.reraProperty.findUnique({
      where: { slug },
      include: {
        images: {
          where: { mediaType: "IMAGE" },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch {
    property = null;
  }
  if (!property || !property.isPublished) notFound();

  const photos = property.images.length
    ? property.images
    : property.coverImageUrl
      ? [{ id: "cover", url: property.coverImageUrl, altText: property.title }]
      : [];
  const rawSpecs: unknown = property.specifications;
  const specifications: PropertySpecification[] = Array.isArray(rawSpecs)
    ? rawSpecs.flatMap((item): PropertySpecification[] => {
        if (!item || typeof item !== "object") return [];
        const record = item as Record<string, unknown>;
        return typeof record.label === "string" && typeof record.value === "string"
          ? [{ label: record.label, value: record.value }]
          : [];
      })
    : rawSpecs && typeof rawSpecs === "object"
      ? Object.entries(rawSpecs as Record<string, unknown>).flatMap(([label, value]) =>
          typeof value === "string" || typeof value === "number"
            ? [{ label, value: String(value) }]
            : [],
        )
      : [];

  return (
    <>
      <ReferencePageBanner title={property.title} image={photos[0]?.url || "/arnav/images/page-title-bg.jpg"} />
      <section className="rs-section">
        <div className="rs-container rs-property-detail">
          <div className="rs-property-detail__main">
            {photos.length > 0 && (
              <div className="rs-property-detail__gallery">
                {photos.map((photo, index) => (
                  <div
                    className={index === 0 ? "rs-property-detail__photo rs-property-detail__photo--main" : "rs-property-detail__photo"}
                    key={photo.id}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.altText || property.title}
                      fill
                      sizes={index === 0 ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 50vw, 30vw"}
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            )}
            <p className="rs-eyebrow">{property.propertyType.replaceAll("_", " ")} · {property.listingType}</p>
            <h1>{property.title}</h1>
            <p className="rs-property-detail__location">{property.locality}, {property.city}</p>
            <p className="rs-property-detail__price">{property.priceLabel}</p>
            <p className="rs-property-detail__description">{property.description || `Contact REALSPACE for more details about ${property.title}.`}</p>
            {(property.bhkLabel || property.carpetAreaSqFt || property.builtUpAreaSqFt || property.projectReraNo || property.possession) && (
              <>
                <h2>Property Details</h2>
                <dl className="rs-specifications">
                  {property.bhkLabel && <div><dt>Configuration</dt><dd>{property.bhkLabel}</dd></div>}
                  {property.carpetAreaSqFt && <div><dt>Carpet Area</dt><dd>{property.carpetAreaSqFt} sq. ft.</dd></div>}
                  {property.builtUpAreaSqFt && <div><dt>Built-up Area</dt><dd>{property.builtUpAreaSqFt} sq. ft.</dd></div>}
                  {property.projectReraNo && <div><dt>Project RERA No.</dt><dd>{property.projectReraNo}</dd></div>}
                  {property.possession && <div><dt>Possession</dt><dd>{property.possession}</dd></div>}
                </dl>
              </>
            )}
            {property.amenities.length > 0 && (
              <>
                <h2>Features &amp; Amenities</h2>
                <ul className="rs-amenities">{property.amenities.map((amenity) => <li key={amenity}>{amenity}</li>)}</ul>
              </>
            )}
            {specifications.length > 0 && (
              <>
                <h2>Configurations &amp; Specifications</h2>
                <dl className="rs-specifications">{specifications.map((spec, index) => <div key={`${spec.label}-${index}`}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
              </>
            )}
          </div>
          <aside className="rs-property-detail__aside">
            <p>Interested in this property?</p>
            <h2>Talk to REALSPACE</h2>
            <p>Send an enquiry about {property.title} to the REALSPACE team.</p>
            <PropertyEnquiryForm slug={property.slug} title={property.title} />
          </aside>
        </div>
      </section>
    </>
  );
}
