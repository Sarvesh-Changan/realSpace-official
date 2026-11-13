import Image from "next/image";
import Link from "next/link";

export interface ReferenceProperty {
  id: string; slug: string; title: string; description?: string | null; locality: string; city: string;
  priceLabel: string; bhkLabel?: string | null; carpetAreaSqFt?: number | null; coverImageUrl?: string | null;
  images?: { url: string; altText?: string | null }[];
}

export function ReferencePropertyCard({ property }: { property: ReferenceProperty }) {
  const image = property.coverImageUrl || property.images?.[0]?.url || "/arnav/images/blog/blog-post1.jpg";
  return (
    <article className="rs-property-card">
      <Link href={`/properties/${property.slug}`} className="rs-property-card__image">
        <Image src={image} alt={property.images?.[0]?.altText || property.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" />
        <span>{property.priceLabel}</span>
      </Link>
      <div className="rs-property-card__body">
        <h3><Link href={`/properties/${property.slug}`}>{property.title}</Link></h3>
        <p>{property.locality}{property.city ? `, ${property.city}` : ""}</p>
        <div className="rs-property-card__meta">{property.bhkLabel || "Residential"}{property.carpetAreaSqFt ? ` · ${property.carpetAreaSqFt} sq. ft.` : ""}</div>
        <Link href={`/properties/${property.slug}`} className="rs-text-link">View Property <span>→</span></Link>
      </div>
    </article>
  );
}
