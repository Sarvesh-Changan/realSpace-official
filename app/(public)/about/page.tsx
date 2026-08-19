import { AboutHero } from "../_components/about/AboutHero";
import { TrustIndicators } from "../_components/about/TrustIndicators";
import { ProcessTimeline } from "../_components/about/ProcessTimeline";
import { MeetFounder } from "../_components/about/MeetFounder";

export const metadata = {
  title: "About REALSPACE | Design That Knows Your Home",
  description: "Learn about the REALSPACE design philosophy and our proven process.",
};

export default function AboutPage() {
  // TODO: Pending client confirmation for exact stats
  const trustStats = [
    { label: "Years of Experience", value: "8+" },
    { label: "Projects Completed", value: "150+" },
    { label: "Client Rating", value: "4.5★" },
  ];

  const processSteps = [
    {
      title: "Consultation",
      description: "Free site visit and brief understanding of your requirements and lifestyle needs.",
    },
    {
      title: "Space Analysis",
      description: "Detailed measurement and constraint mapping (beam positions, window orientation, natural light).",
    },
    {
      title: "Concept Design",
      description: "Mood board creation, layout proposal, and initial material selection for your space.",
    },
    {
      title: "3D Visualization",
      description: "Client approval of hyper-realistic rendered views before any execution begins.",
    },
    {
      title: "Execution",
      description: "On-site coordination with rigorous quality checks by our dedicated project managers.",
    },
    {
      title: "Handover",
      description: "Punch-list completion, final touches, and reliable post-handover support.",
    },
  ];

  return (
    <div className="flex flex-col pt-24 md:pt-32">
      <AboutHero
        headline="Design That Knows Your Home Before It Begins"
        body="At REALSPACE, every interior project starts with your space — not a mood board. The founder and the REALSPACE team map your room's every constraint — beam positions, window orientation, natural light — before a single design decision is made. The result is a home that feels inevitable, not imposed."
        imageUrl="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200"
      />

      <TrustIndicators stats={trustStats} />

      <ProcessTimeline steps={processSteps} />

      <MeetFounder
        // TODO: Replace placeholder name and bio with actual founder details
        founderName="Vijay Chawan"
        bio="As the direct point of contact for every client, I ensure that the vision we agree on is exactly what gets built. By staying personally involved from the first site visit to the final handover, we eliminate the gap between design promise and execution reality."
        imageUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
      />
    </div>
  );
}
