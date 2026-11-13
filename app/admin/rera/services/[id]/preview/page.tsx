import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { serviceSlug } from "@/lib/rera/public-service";

export const dynamic = "force-dynamic";

export default async function PreviewReraServicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { id } = await params;
  const service = await prisma.reraService.findUnique({ where: { id } });
  if (!service) notFound();
  const images = Array.isArray(service.contentImages) ? service.contentImages.flatMap((entry, index) => entry && typeof entry === "object" && "url" in entry && typeof entry.url === "string" ? [{ url: entry.url, alt: "altText" in entry && typeof entry.altText === "string" ? entry.altText : service.title, index }] : []) : [];
  const sections = Array.isArray(service.sections) ? service.sections.flatMap((entry, index) => entry && typeof entry === "object" ? [{ heading: "heading" in entry && typeof entry.heading === "string" ? entry.heading : "", body: "body" in entry && typeof entry.body === "string" ? entry.body : "", imageUrl: "imageUrl" in entry && typeof entry.imageUrl === "string" ? entry.imageUrl : "", alt: "imageAlt" in entry && typeof entry.imageAlt === "string" ? entry.imageAlt : "", buttonLabel: "buttonLabel" in entry && typeof entry.buttonLabel === "string" ? entry.buttonLabel : "", buttonUrl: "buttonUrl" in entry && typeof entry.buttonUrl === "string" ? entry.buttonUrl : "", enabled: !("isEnabled" in entry) || entry.isEnabled !== false, index }] : []).filter((entry) => entry.enabled) : [];
  const pageTitle = service.pageHeading || service.title;
  const publicSlug = service.slug || serviceSlug(service.title);
  return <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Private preview · {service.isPublished ? "Published" : "Draft"}</p><h1 className="text-lg font-semibold">{pageTitle}</h1></div><div className="flex gap-2">{service.isPublished && <Link href={`/services/${publicSlug}`} target="_blank" className="inline-flex items-center gap-2 rounded border border-neutral-300 px-3 py-2 text-sm"><ExternalLink className="h-4 w-4" />Public URL</Link>}<Link href={`/admin/rera/services/${service.id}/edit`} className="inline-flex items-center gap-2 rounded bg-neutral-900 px-3 py-2 text-sm text-white"><ArrowLeft className="h-4 w-4" />Back to editor</Link></div></div>
    <section className="relative flex min-h-56 items-end overflow-hidden bg-neutral-800 p-8 text-white sm:min-h-72 sm:p-12">{service.bannerImageUrl && <Image src={service.bannerImageUrl} alt={service.bannerImageAlt || pageTitle} fill className="object-cover opacity-60" unoptimized />}<div className="relative"><p className="text-sm uppercase tracking-[.2em]">REALSPACE</p><h2 className="mt-2 text-3xl font-semibold sm:text-5xl">{pageTitle}</h2></div></section>
    <section className="grid gap-8 rounded-lg bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-8"><div>{images[0] && <div className="relative min-h-64 overflow-hidden bg-neutral-100"><Image src={images[0].url} alt={images[0].alt} fill className="object-cover" unoptimized /></div>}</div><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-red-800">REALSPACE PROPERTY SERVICES</p><h2 className="mt-3 text-2xl font-semibold">{service.title}</h2>{service.shortDescription && <p className="mt-3 text-lg text-neutral-600">{service.shortDescription}</p>}<p className="mt-4 whitespace-pre-wrap leading-7 text-neutral-600">{service.description}</p>{service.highlights.length > 0 && <ul className="mt-4 list-disc space-y-1 pl-5 text-neutral-600">{service.highlights.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>}<span className="mt-6 inline-flex rounded bg-[#990000] px-5 py-3 font-medium text-white">{service.ctaText || "Enquire Now"}</span></div></section>
    {sections.map((section) => <section key={section.index} className="grid items-center gap-8 rounded-lg bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-8">{section.imageUrl && <div className="relative min-h-64 overflow-hidden bg-neutral-100"><Image src={section.imageUrl} alt={section.alt || section.heading} fill className="object-cover" unoptimized /></div>}<div>{section.heading && <h2 className="text-2xl font-semibold">{section.heading}</h2>}<p className="mt-3 whitespace-pre-wrap leading-7 text-neutral-600">{section.body}</p>{section.buttonLabel && <span className="mt-5 inline-flex rounded bg-[#990000] px-4 py-3 text-white">{section.buttonLabel}</span>}</div></section>)}
    {images.length > 1 && <section className="grid gap-4 sm:grid-cols-2">{images.slice(1).map((image) => <div key={image.index} className="relative h-64 overflow-hidden"><Image src={image.url} alt={image.alt} fill className="object-cover" unoptimized /></div>)}</section>}
  </main>;
}
