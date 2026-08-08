import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Allow unauthenticated access strictly to /admin/login
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Real server-side auth check for all protected admin routes
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      {children}
    </div>
  );
}
