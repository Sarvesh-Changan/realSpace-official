import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

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
    <div className="flex min-h-screen bg-neutral-50 text-neutral-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AdminTopbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
