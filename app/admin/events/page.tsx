import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EventsTableClient, type EventItem } from "./_components/EventsTableClient";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: { media: true },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const formattedEvents: EventItem[] = events.map((ev) => ({
    id: ev.id,
    title: ev.title,
    slug: ev.slug,
    coverImageUrl: ev.coverImageUrl,
    coverImagePublicId: ev.coverImagePublicId,
    mediaCount: ev._count.media,
    isPublished: ev.isPublished,
    sortOrder: ev.sortOrder,
    createdAt: ev.createdAt.toISOString(),
  }));

  return <EventsTableClient events={formattedEvents} />;
}
