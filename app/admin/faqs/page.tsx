import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FaqTableClient } from "./_components/FaqTableClient";

export const revalidate = 0;

export default async function AdminFaqsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const faqs = await prisma.fAQ.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const formattedFaqs = faqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    sortOrder: faq.sortOrder,
    isPublished: faq.isPublished,
    createdAt: faq.createdAt,
    updatedAt: faq.updatedAt,
  }));

  return <FaqTableClient faqs={formattedFaqs} />;
}
