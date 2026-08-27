import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import { AboutHero } from "../_components/about/AboutHero";
import { TrustIndicators } from "../_components/about/TrustIndicators";
import { MeetFounder } from "../_components/about/MeetFounder";
import { ProcessTimeline } from "./_components/ProcessTimeline";
import { Certifications, type CertificationData } from "./_components/Certifications";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `About Us | ${companyName} Studio`,
    description: `Learn about ${companyName}, Thane's trusted interior and exterior design studio founded by Vijay Chawan. Discover our design philosophy and 6-step execution process.`,
    path: "/about",
  });
}

const defaultProcessSteps = [
  {
    title: "1. Initial Consultation & Site Visit",
    description: "We meet at your space to assess architectural layout, structural beams, natural light, and understand your lifestyle requirements.",
  },
  {
    title: "2. Space Planning & 3D Visualization",
    description: "Our design team crafts detailed 2D layouts and realistic 3D renderings so you can experience your future home before construction.",
  },
  {
    title: "3. Material Selection & Transparent Quote",
    description: "Select from curated laminates, veneers, hardware, and finishes with a clear, itemized quote — zero hidden charges.",
  },
  {
    title: "4. On-site Execution & Quality Checks",
    description: "Our experienced craftsmen execute civil, electrical, plumbing, and carpentry work under constant site supervision.",
  },
  {
    title: "5. Custom Joinery & Finishing Touches",
    description: "Precision-engineered modular factory units and custom site joinery are installed with strict quality inspections.",
  },
  {
    title: "6. Final Handover & Warranty Walkthrough",
    description: "A thorough deep-cleaning, final polish, joint walkthrough, and key handover along with our post-handover support commitment.",
  },
];

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
      imageUrl: cert.imageUrl || "/images/certifications/cadpro.png",
      certificateUrl: cert.certificateUrl,
      showCertificateButton: cert.showCertificateButton,
    }));
  } catch (error) {
    console.error("Failed to fetch certifications:", error);
  }

  // Pending client confirmation for exact stats
  const trustStats = [
    { label: "Years of Experience", value: "27+" },
    { label: "Client Rating", value: "5★" },
    { value: "Thane, Navi Mumbai", label: "& Mumbai Regions" },
  ];

  return (
    <div className="flex flex-col pt-16 sm:pt-24 md:pt-32">
      <AboutHero
        headline="Design That Knows Your Home Before It Begins"
        body="At REALSPACE, every interior project starts with your space — not a mood board. The founder and the REALSPACE team map your room's every constraint — beam positions, window orientation, natural light — before a single design decision is made. The result is a home that feels inevitable, not imposed."
        imageUrl="/images/placeholder-image.png"
      />

      <TrustIndicators stats={trustStats} />

      <MeetFounder
        founderName="Vijay Chawan"
        bio="As the direct point of contact for every client, I ensure that the vision we agree on is exactly what gets built. By staying personally involved from the first site visit to the final handover, we eliminate the gap between design promise and execution reality."
        imageUrl="/images/owner_image.jpeg"
      />

      <ProcessTimeline title="Our 6-Step Design & Execution Process" steps={defaultProcessSteps} />

      <Certifications certifications={certifications} />
    </div>
  );
}
