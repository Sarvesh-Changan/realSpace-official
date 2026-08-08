import prisma from "@/lib/prisma";
import { FaqAccordion, type FaqItem } from "./_components/FaqAccordion";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata = {
  title: "Frequently Asked Questions | REALSPACE Thane",
  description:
    "Answers to common questions about interior design costs, timelines, 3D visualization, and execution at REALSPACE.",
};

const defaultFaqs: FaqItem[] = [
  {
    question: "What is the approximate cost of a 2BHK interior in Thane?",
    answer:
      "The cost varies significantly based on material selection and scope of work, starting approximately from ₹6 Lakhs to ₹12 Lakhs for a standard premium finish.",
  },
  {
    question: "How long does a full home interior project take?",
    answer:
      "A complete home interior project typically takes between 45 to 90 days from the date of design approval, depending on the complexity of the execution.",
  },
  {
    question: "Do you design as per Vastu?",
    answer:
      "Yes, our design team can carefully integrate Vastu Shastra principles into your space planning and material selection upon request.",
  },
  {
    question: "Do you handle both design and execution?",
    answer:
      "Absolutely, we are a turnkey studio providing complete end-to-end services from initial 3D concept designs to final on-site execution and handover.",
  },
  {
    question: "Can I see 3D visualizations before committing?",
    answer:
      "Yes, we provide hyper-realistic 3D rendered views so you can visualize exactly what your space will look like before any physical execution begins.",
  },
  {
    question: "Which areas of Thane do you service?",
    answer:
      "We primarily service all major localities across Thane (including Majiwada, Ghodbunder Road, Kolshet), as well as wider Mumbai and Navi Mumbai regions.",
  },
];

export default async function FaqPage() {
  let fetchedFaqs: FaqItem[] = [];

  try {
    const rawFaqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });

    if (rawFaqs.length > 0) {
      fetchedFaqs = rawFaqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
      }));
    } else {
      fetchedFaqs = defaultFaqs;
    }
  } catch (error) {
    console.error("Error loading FAQs from Prisma:", error);
    fetchedFaqs = defaultFaqs;
  }

  return (
    <div className="flex flex-col pt-24 md:pt-32 pb-16 md:pb-24 bg-white min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1F1F1F] mb-6">
            Frequently Asked <span className="text-[#D6342C]">Questions</span>
          </h1>
          <p className="text-lg text-neutral-600">
            Everything you need to know about our process, pricing, and how we
            bring your dream space to life.
          </p>
        </div>

        {/* Accordion Component */}
        <FaqAccordion faqs={fetchedFaqs} />
      </div>
    </div>
  );
}
