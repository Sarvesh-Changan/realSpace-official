import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { reraPath } from "@/lib/rera/routes";

type ContentImage = { url: string; publicId?: string; alt?: string; altText?: string; order?: number; sortOrder?: number };
type SectionItem = { title?: string; description?: string; imageUrl?: string; imageAlt?: string };
type ContentSection = { heading?: string; description?: string; imageUrl?: string; imageAlt?: string; items?: SectionItem[] };
const asImages = (value: unknown): ContentImage[] => Array.isArray(value) ? value.filter((x): x is ContentImage => !!x && typeof x === "object" && typeof (x as ContentImage).url === "string").sort((a, b) => (a.order ?? a.sortOrder ?? 0) - (b.order ?? b.sortOrder ?? 0)) : [];
const asSections = (value: unknown): ContentSection[] => Array.isArray(value) ? value.filter((x): x is ContentSection => !!x && typeof x === "object") : [];

export const dynamic = "force-dynamic";

export default async function ReraServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let service;
  let related: { id: string; title: string; slug: string | null }[] = [];
  try {
    service = await prisma.reraService.findFirst({ where: { slug, isPublished: true } });
    if (!service) notFound();
    related = await prisma.reraService.findMany({ where: { isPublished: true, slug: { not: null }, id: { not: service.id } }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], select: { id: true, title: true, slug: true } });
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    console.error("Could not load RERA service detail", error);
    notFound();
  }

  const images = asImages(service.contentImages);
  const sections = asSections(service.sections);
  const heading = service.pageHeading?.trim() || service.title;
  const intro = service.shortDescription?.trim() || service.description;
  const ctaUrl = service.ctaUrl?.trim() || "/contact";
  const ctaHref = ctaUrl.startsWith("http") || ctaUrl.startsWith("tel:") || ctaUrl.startsWith("mailto:") ? ctaUrl : reraPath(ctaUrl);

  return (
    <main className="min-h-screen bg-[#F8F5F1] text-[#1C1C1C]">
      <section className="relative isolate flex min-h-[270px] items-end overflow-hidden bg-[#24201C] sm:min-h-[340px] lg:min-h-[390px]">
        {service.bannerImageUrl && <Image src={service.bannerImageUrl} alt={service.bannerImageAlt || ""} fill priority sizes="100vw" className="-z-20 object-cover object-center" unoptimized={!service.bannerImageUrl.includes("res.cloudinary.com")} />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-10 pt-24 sm:px-8 sm:pb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#FECC00]">REALSPACE RERA · SERVICES</p>
          <h1 className="font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl">{heading}</h1>
          <nav aria-label="Breadcrumb" className="mt-4 text-sm text-white/85"><ol className="flex flex-wrap items-center gap-2"><li><Link href={reraPath("/")} className="hover:text-[#FECC00]">Home</Link></li><li aria-hidden="true">/</li><li><Link href={reraPath("/services")} className="hover:text-[#FECC00]">Services</Link></li><li aria-hidden="true">/</li><li aria-current="page">{service.title}</li></ol></nav>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[.82fr_1.18fr] lg:gap-12 lg:py-20">
        <div className="self-center">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#990000]">{service.title}</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{service.pageHeading || service.title}</h2>
          <div className="mt-5 whitespace-pre-line text-sm leading-7 text-[#5D5852] sm:text-base sm:leading-8">{intro}</div>
          {service.highlights.length > 0 && <ul className="mt-6 space-y-3">{service.highlights.map((item, i) => <li key={`${service.id}-h-${i}`} className="flex gap-3 text-sm leading-6 text-[#4F4A44]"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#990000]" />{item}</li>)}</ul>}
          <Link href={ctaHref} className="mt-7 inline-flex min-h-12 items-center gap-2 bg-[#990000] px-6 py-3 text-xs font-bold uppercase tracking-[.12em] text-white transition-colors hover:bg-[#1C1C1C]">{service.ctaText || "Enquire About This Service"}<ArrowRight className="h-4 w-4" /></Link>
        </div>
        {images.length > 0 ? <div className="grid grid-cols-2 gap-3 sm:gap-4">{images.map((image, index) => <div key={`${image.publicId || image.url}-${index}`} className={`relative min-h-44 overflow-hidden bg-[#E8E2DA] sm:min-h-64 ${index === 0 ? "col-span-2" : ""}`}><Image src={image.url} alt={image.alt || image.altText || `${service.title} image ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition-transform duration-500 hover:scale-[1.03]" unoptimized={!image.url.includes("res.cloudinary.com")} /></div>)}</div> : service.bannerImageUrl ? <div className="relative min-h-64 overflow-hidden bg-[#E8E2DA] sm:min-h-96"><Image src={service.bannerImageUrl} alt={service.bannerImageAlt || ""} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover" unoptimized={!service.bannerImageUrl.includes("res.cloudinary.com")} /></div> : null}
      </section>

      {sections.map((section, index) => <section key={`${section.heading || "section"}-${index}`} className={`px-5 py-12 sm:px-8 sm:py-16 ${index % 2 ? "bg-white" : "bg-[#EEE6DD]"}`}><div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">{section.heading && <h2 className="font-heading text-2xl font-semibold sm:text-3xl">{section.heading}</h2>}{section.description && <p className="mt-3 text-sm leading-7 text-[#625D57] sm:text-base">{section.description}</p>}</div>
        {section.imageUrl && <div className="relative mx-auto mt-8 aspect-[16/7] max-w-5xl overflow-hidden bg-[#E8E2DA]"><Image src={section.imageUrl} alt={section.imageAlt || section.heading || ""} fill sizes="90vw" className="object-cover" unoptimized={!section.imageUrl.includes("res.cloudinary.com")} /></div>}
        {(section.items?.length ?? 0) > 0 && <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{section.items?.map((item, itemIndex) => <article key={`${item.title || "item"}-${itemIndex}`} className="overflow-hidden border border-[#E2D9CE] bg-white">{item.imageUrl && <div className="relative aspect-[4/3] bg-[#E8E2DA]"><Image src={item.imageUrl} alt={item.imageAlt || item.title || ""} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" unoptimized={!item.imageUrl.includes("res.cloudinary.com")} /></div>}<div className="p-5">{item.title && <h3 className="font-heading text-lg font-semibold">{item.title}</h3>}{item.description && <p className="mt-2 text-sm leading-6 text-[#625D57]">{item.description}</p>}</div></article>)}</div>}
      </div></section>)}

      {related.length > 0 && <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><h2 className="font-heading text-2xl font-semibold sm:text-3xl">Other Services</h2><div className="mt-5 flex flex-wrap gap-3">{related.map((item) => <Link key={item.id} href={reraPath(`/services/${item.slug}`)} className="inline-flex min-h-11 items-center gap-2 border border-[#D7CFC4] bg-white px-4 py-3 text-sm font-semibold hover:border-[#990000] hover:text-[#990000]">{item.title}<ArrowRight className="h-4 w-4" /></Link>)}</div></section>}
    </main>
  );
}
