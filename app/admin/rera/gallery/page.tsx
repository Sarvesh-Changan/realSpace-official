import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GalleryTableClient } from "./_components/GalleryTableClient";

export const dynamic = "force-dynamic";

export default async function AdminReraGalleryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const items = await prisma.reraGalleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <GalleryTableClient items={items} />
    </div>
  );
}
