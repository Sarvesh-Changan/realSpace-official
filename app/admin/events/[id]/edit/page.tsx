import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EventForm } from "../../_components/EventForm";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const initialData = {
    id: event.id,
    title: event.title,
    slug: event.slug,
    coverImageUrl: event.coverImageUrl,
    coverImagePublicId: event.coverImagePublicId,
    isPublished: event.isPublished,
    sortOrder: event.sortOrder,
    media: event.media.map((m) => ({
      id: m.id,
      mediaUrl: m.mediaUrl,
      mediaPublicId: m.mediaPublicId,
      mediaType: m.mediaType,
      sortOrder: m.sortOrder,
    })),
  };

  return <EventForm mode="update" eventId={event.id} initialData={initialData} />;
}
