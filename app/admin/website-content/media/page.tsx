import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MediaLibrary } from "../_components/MediaLibrary";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  let assets: Awaited<ReturnType<typeof prisma.mediaAsset.findMany>> = [];
  let unavailable = false;
  try { assets = await prisma.mediaAsset.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }] }); }
  catch { unavailable = true; }
  return <div className="space-y-5"><header><Link href="/admin/website-content" className="text-sm text-brand-red">← Website Content</Link><h1 className="mt-2 text-2xl font-bold">Media Library</h1><p className="mt-1 text-sm text-neutral-500">Reusable image assets for page sections. Existing project, gallery, property and service uploads remain in their current modules.</p></header>{unavailable && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">The database or media library migration is unavailable. Uploads cannot be recorded yet.</p>}<MediaLibrary assets={assets} /></div>;
}
