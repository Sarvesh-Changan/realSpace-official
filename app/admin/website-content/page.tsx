import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

const editors = [
  { title: "Homepage", href: "/admin/website-content/home", detail: "Hero slides, homepage sections, text, images and calls to action." },
  { title: "About Us", href: "/admin/website-content/about", detail: "Page banner, introduction, content, images and contact call to action." },
  { title: "Services", href: "/admin/rera/services", detail: "Create and manage published services and their detail pages." },
  { title: "Media Library", href: "/admin/website-content/media", detail: "Upload, organize, preview and select reusable Cloudinary images." },
  { title: "Website Settings", href: "/admin/settings", detail: "Branding, contact details, social links, navigation and footer." },
];

export default async function WebsiteContentAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  let ready = true;
  try { await prisma.websitePage.count(); } catch { ready = false; }
  return <div className="max-w-5xl space-y-6">
    <header><h1 className="text-2xl font-bold">Website Content</h1><p className="mt-1 text-sm text-neutral-500">Manage the public REALSPACE site using the existing page, services, settings and property modules.</p></header>
    {!ready && <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">Website content storage is unavailable. Check database connectivity and apply the reviewed additive migration before saving.</div>}
    <div className="grid gap-4 sm:grid-cols-2">{editors.map((item) => <Link key={item.href} href={item.href} className="rounded-xl border bg-white p-5 transition hover:border-brand-red"><h2 className="font-semibold">{item.title}</h2><p className="mt-2 text-sm text-neutral-600">{item.detail}</p><span className="mt-4 inline-block text-sm font-medium text-brand-red">Open editor →</span></Link>)}</div>
    <div className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Properties</h2><p className="mt-1 text-sm text-neutral-600">Property records, publication, images and galleries stay in the existing RERA property manager.</p><Link className="mt-3 inline-block text-sm font-medium text-brand-red" href="/admin/rera/properties">Manage properties →</Link></div>
  </div>;
}
