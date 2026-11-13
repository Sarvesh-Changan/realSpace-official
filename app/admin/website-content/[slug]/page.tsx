import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { websitePageDefaults } from "@/lib/website-content/defaults";
import { WebsitePageEditor } from "../_components/ArnavPageEditor";

export const dynamic = "force-dynamic";

export default async function EditWebsitePage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const { slug } = await params;
  const fallback = websitePageDefaults[slug];
  if (!fallback) notFound();
  let page = null;
  let media: Array<{ id: string; url: string; cloudinaryId: string | null; altText: string; category: string }> = [];
  let databaseUnavailable = false;
  try {
    [page, media] = await Promise.all([
      prisma.websitePage.findUnique({ where: { slug }, include: { sections: { orderBy: { sortOrder: "asc" } } } }),
      prisma.mediaAsset.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }], select: { id: true, url: true, cloudinaryId: true, altText: true, category: true } }),
    ]);
  } catch { databaseUnavailable = true; }
  const sections = fallback.sections.map((initial) => ({ ...initial, ...(page?.sections.find((item) => item.sectionKey === initial.sectionKey) || {}) }));
  return <>
    {databaseUnavailable && <div role="alert" className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Database is unavailable. This editor shows reference defaults; changes cannot be saved until connectivity and the additive migration are ready.</div>}
    <WebsitePageEditor page={page ? { slug: page.slug, title: page.title, description: page.description, isPublished: page.isPublished } : { slug, title: fallback.title, description: fallback.description, isPublished: false }} sections={sections} media={media} />
  </>;
}
