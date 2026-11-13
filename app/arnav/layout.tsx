import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { ArnavHeader, ArnavFooter } from "./site-chrome";
import "./arnav.css";

export const metadata: Metadata = {
  title: "Arnav Properties | Property Dealers in Thane",
  description: "Buy, sell and rent properties in Thane with Arnav Properties.",
  icons: { icon: "/arnav/images/favicon.png" },
};

export default async function ArnavLayout({ children }: { children: React.ReactNode }) {
  let setting: { brokerName: string; phone: string | null; altPhone: string | null; email: string | null; address: string | null } | null = null;
  try {
    setting = await prisma.reraSettings.findUnique({ where: { id: "singleton" }, select: { brokerName: true, phone: true, altPhone: true, email: true, address: true } });
  } catch {}
  return (
    <div className="arnav-site">
      <link rel="stylesheet" href="/arnav/libraries/lib.css" />
      <link rel="stylesheet" href="/arnav/css/plugins.css" />
      <link rel="stylesheet" href="/arnav/css/navigation-menu.css" />
      <link rel="stylesheet" href="/arnav/style.css" />
      <link rel="stylesheet" href="/arnav/css/shortcodes.css" />
      <ArnavHeader settings={setting} />
      <main>{children}</main>
      <ArnavFooter settings={setting} />
    </div>
  );
}
