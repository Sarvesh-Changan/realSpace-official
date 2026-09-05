import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SiteSettingsForm } from "./_components/SiteSettingsForm";
import { ChangePasswordForm } from "./_components/ChangePasswordForm";
import type { SiteSettingsInput } from "./schema";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  const socialLinks = (settings?.socialLinks ?? {}) as {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };

  const initialData: SiteSettingsInput = {
    companyName: settings?.companyName ?? "REALSPACE",
    email: settings?.email ?? "",
    phone: settings?.phone ?? "",
    whatsapp: settings?.whatsapp ?? "",
    address: settings?.address ?? "",
    heroHeadline: settings?.heroHeadline ?? "",
    heroSubhead: settings?.heroSubhead ?? "",
    ctaText: settings?.ctaText ?? "",
    instagram: socialLinks.instagram ?? "",
    facebook: socialLinks.facebook ?? "",
    youtube: socialLinks.youtube ?? "",
    linkedin: socialLinks.linkedin ?? "",
    ownerPortraitUrl: settings?.ownerPortraitUrl ?? "",
    ownerPortraitPublicId: settings?.ownerPortraitPublicId ?? "",
    showOwnerPortrait: settings?.showOwnerPortrait ?? true,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Site Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your company details, hero content, and social links.
        </p>
      </div>
      <SiteSettingsForm initialData={initialData} />
      <ChangePasswordForm />
    </div>
  );
}
