import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { AboutHero } from "../_components/about/AboutHero";
import { TrustIndicators } from "../_components/about/TrustIndicators";
import { MeetFounder } from "../_components/about/MeetFounder";
import { Certifications, type CertificationData } from "./_components/Certifications";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About REALSPACE | Design That Knows Your Home",
  description: "Learn about the REALSPACE design philosophy and our proven process.",
};

export default async function AboutPage() {
  let certifications: CertificationData[] = [];

  try {
    const dbCertifications = await prisma.certification.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: "asc" },
    });

    certifications = dbCertifications.map((cert) => ({
      id: cert.id,
      title: cert.title,
      badgeLabel: cert.badgeLabel,
      issuingBody: cert.issuingBody,
      description: `${cert.badgeLabel} issued by ${cert.issuingBody}.`,
      imageUrl: cert.imageUrl || "",
    }));
  } catch (error) {
    console.error("Failed to fetch certifications:", error);
  }

  // TODO: Pending client confirmation for exact stats
  const trustStats = [
    { label: "Years of Experience", value: "8+" },
    { label: "Projects Completed", value: "150+" },
    { label: "Client Rating", value: "4.5★" },
  ];

  return (
    <div className="flex flex-col pt-24 md:pt-32">
      <AboutHero
        headline="Design That Knows Your Home Before It Begins"
        body="At REALSPACE, every interior project starts with your space — not a mood board. The founder and the REALSPACE team map your room's every constraint — beam positions, window orientation, natural light — before a single design decision is made. The result is a home that feels inevitable, not imposed."
        imageUrl="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200"
      />

      <TrustIndicators stats={trustStats} />

      <MeetFounder
        // TODO: Replace placeholder name and bio with actual founder details
        founderName="Vijay Chawan"
        bio="As the direct point of contact for every client, I ensure that the vision we agree on is exactly what gets built. By staying personally involved from the first site visit to the final handover, we eliminate the gap between design promise and execution reality."
        imageUrl="/images/owner_image.jpeg"
      />

      <Certifications certifications={certifications} />
    </div>
  );
}
