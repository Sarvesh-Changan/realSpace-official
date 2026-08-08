import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-brand-text">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton phoneNumber="919000000000" />
    </div>
  );
}
