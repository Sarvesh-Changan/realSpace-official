import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { defaultWebsiteSections } from "@/lib/website-content/read";

export const dynamic = "force-dynamic";

export default async function WebsitePagePreview({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { slug } = await params;
  if (slug !== "home" && slug !== "about") notFound();

  let page = null;
  let sections = defaultWebsiteSections(slug);
  try {
    page = await prisma.websitePage.findUnique({ where: { slug }, include: { sections: { orderBy: { sortOrder: "asc" } } } });
    if (page?.sections.length) sections = page.sections.map((section) => ({ ...section, heading: section.heading ?? "", body: section.body ?? "", buttonLabel: section.buttonLabel ?? "", buttonUrl: section.buttonUrl ?? "", imageUrl: section.imageUrl ?? "", imageAlt: section.imageAlt ?? "", imagePublicId: section.imagePublicId, mediaAssetId: section.mediaAssetId, sortOrder: section.sortOrder }));
  } catch {
    // Use the original RealSpace-branded defaults when the database is unavailable.
  }

  const title = page?.title || (slug === "home" ? "Home" : "About Us");
  const description = page?.description || "";
  return <main className="min-h-screen bg-neutral-100 text-neutral-900">
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-3">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Private preview</p><h1 className="font-semibold">{title}</h1></div>
      <Link href={`/admin/website-content/${slug}`} className="rounded-lg border px-4 py-2 text-sm">Back to editor</Link>
    </header>
    <div className="mx-auto max-w-6xl space-y-5 p-5">
      <section className="rounded-xl bg-white p-8"><p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">{slug === "home" ? "Homepage" : "About Us"}</p><h2 className="text-3xl font-bold">{title}</h2>{description && <p className="mt-3 max-w-3xl text-neutral-600">{description}</p>}</section>
      {sections.filter((section) => section.isEnabled).sort((a, b) => a.sortOrder - b.sortOrder).map((section) => <section key={section.sectionKey} className="grid gap-6 rounded-xl bg-white p-6 md:grid-cols-2 md:items-center">
        <div><p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">{section.sectionKey}</p>{section.heading && <h3 className="text-2xl font-semibold">{section.heading}</h3>}{section.body && <p className="mt-3 whitespace-pre-wrap text-neutral-600">{section.body}</p>}{section.buttonLabel && <span className="mt-5 inline-flex rounded bg-yellow-400 px-4 py-2 font-medium">{section.buttonLabel}</span>}</div>
        {section.imageUrl && <div className="relative h-64 overflow-hidden rounded-lg bg-neutral-100"><Image src={section.imageUrl} alt={section.imageAlt || ""} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" unoptimized={!section.imageUrl.includes("res.cloudinary.com")} /></div>}
      </section>)}
    </div>
  </main>;
}
