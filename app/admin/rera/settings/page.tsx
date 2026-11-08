import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ReraSettingsForm } from "./_components/ReraSettingsForm";
import type { ReraSettingsInput } from "./schema";

export const dynamic = "force-dynamic";

export default async function AdminReraSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const settings = await prisma.reraSettings.findUnique({
    where: { id: "singleton" },
  });

  const socialLinks = (settings?.socialLinks ?? {}) as {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };

  const initialData: ReraSettingsInput = {
    brokerName: settings?.brokerName ?? "REALSPACE & Arnav Properties",
    tagline: settings?.tagline ?? "",
    reraRegistrationNo: settings?.reraRegistrationNo ?? "",
    reraRegisteredName: settings?.reraRegisteredName ?? "",
    reraVerifyUrl: settings?.reraVerifyUrl ?? "",
    phone: settings?.phone ?? "",
    altPhone: settings?.altPhone ?? "",
    whatsapp: settings?.whatsapp ?? "",
    email: settings?.email ?? "",
    address: settings?.address ?? "",
    officeHours: settings?.officeHours ?? "",
    instagram: socialLinks.instagram ?? "",
    facebook: socialLinks.facebook ?? "",
    youtube: socialLinks.youtube ?? "",
    linkedin: socialLinks.linkedin ?? "",
    heroHeadline:
      settings?.heroHeadline ?? "Find Your Dream Home in Thane",
    heroSubhead: settings?.heroSubhead ?? "",
    heroImageUrl: settings?.heroImageUrl ?? "",
    heroImagePublicId: settings?.heroImagePublicId ?? "",
    welcomeTitle: settings?.welcomeTitle ?? "",
    welcomeBody: settings?.welcomeBody ?? "",
    aboutTitle: settings?.aboutTitle ?? "",
    aboutBody: settings?.aboutBody ?? "",
    founderName: settings?.founderName ?? "",
    founderRole: settings?.founderRole ?? "",
    founderImageUrl: settings?.founderImageUrl ?? "",
    founderImagePublicId: settings?.founderImagePublicId ?? "",
    yearsExperience: settings?.yearsExperience ?? undefined,
    happyFamilies: settings?.happyFamilies ?? undefined,
    propertiesClosed: settings?.propertiesClosed ?? undefined,
    areasServedRaw: (settings?.areasServed ?? []).join(", "),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          RERA Settings & Compliance
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage business details, MahaRERA registration number, contact
          information, hero presentation, and company profile for the RERA
          sub-site.
        </p>
      </div>

      <ReraSettingsForm initialData={initialData} />
    </div>
  );
}

