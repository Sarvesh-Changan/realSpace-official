import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EventForm } from "../_components/EventForm";

export default async function NewEventPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  return <EventForm mode="create" />;
}
