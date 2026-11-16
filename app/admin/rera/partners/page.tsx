import Image from "next/image";
import Link from "next/link";
import { Handshake, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PartnerActions, PartnerVisibility } from "./_components/PartnerActions";

export const dynamic = "force-dynamic";

export default async function ReraPartnersPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const partners = await prisma.reraBuilderPartner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold text-neutral-900"><Handshake className="h-6 w-6" /> Partners</h1><p className="mt-1 text-sm text-neutral-500">Manage partner logos and descriptions shown on the RERA homepage.</p></div>
      <Link href="/admin/rera/partners/new" className="inline-flex items-center gap-2 self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"><Plus className="h-4 w-4" /> Add Partner</Link>
    </div>
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
      {partners.length === 0 ? <div className="px-4 py-14 text-center"><Handshake className="mx-auto mb-3 h-10 w-10 text-neutral-300" /><h2 className="font-semibold text-neutral-900">No partners yet</h2><p className="mt-1 text-sm text-neutral-500">Add a partner to show it above the RERA website footer.</p></div> :
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500"><th className="px-4 py-3">Partner</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-neutral-100">{partners.map((partner) => <tr key={partner.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-12 w-20 shrink-0 overflow-hidden rounded border bg-white"><Image src={partner.logoUrl} alt={`${partner.name} logo`} fill sizes="80px" className="object-contain p-1" /></div><span className="font-medium text-neutral-900">{partner.name}</span></div></td><td className="max-w-sm px-4 py-3 text-neutral-600"><span className="line-clamp-2">{partner.description || "—"}</span></td><td className="px-4 py-3 text-neutral-600">{partner.sortOrder}</td><td className="px-4 py-3"><PartnerVisibility id={partner.id} isPublished={partner.isPublished} /></td><td className="px-4 py-3"><PartnerActions id={partner.id} name={partner.name} /></td></tr>)}</tbody></table></div>}
    </div>
  </div>;
}
