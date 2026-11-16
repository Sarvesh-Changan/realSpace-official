import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PartnerForm } from "../_components/PartnerForm";
import { createPartner } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewReraPartnerPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return <div className="space-y-5"><div><Link href="/admin/rera/partners" className="mb-2 inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900"><ArrowLeft className="mr-1 h-4 w-4" />Back to Partners</Link><h1 className="text-2xl font-bold text-neutral-900">Add Partner</h1><p className="mt-1 text-sm text-neutral-500">Add a partner logo and the content shown on the RERA homepage.</p></div><PartnerForm onSubmitAction={createPartner} /></div>;
}
