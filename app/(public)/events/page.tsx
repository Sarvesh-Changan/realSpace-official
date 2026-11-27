import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { EventsClient, type PublicEvent } from "./_components/EventsClient";

export const revalidate = 60; // Revalidate static cache every 60 seconds

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `Events & Exhibition Showcase | ${companyName}`,
    description: `Explore event galleries, interior design exhibitions, workshops, and project handover celebrations by ${companyName}.`,
    path: "/events",
  });
}

export default async function PublicEventsPage() {
  const dbEvents = await prisma.event.findMany({
    where: { isPublished: true },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const events: PublicEvent[] = dbEvents.map((ev) => ({
    id: ev.id,
    title: ev.title,
    slug: ev.slug,
    coverImageUrl: ev.coverImageUrl,
    isPublished: ev.isPublished,
    sortOrder: ev.sortOrder,
    media: ev.media.map((m) => ({
      id: m.id,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      sortOrder: m.sortOrder,
    })),
  }));

  return <EventsClient events={events} />;
}
