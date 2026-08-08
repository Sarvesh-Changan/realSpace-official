import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export interface ProcessStep {
  title: string;
  description: string;
}

export interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  return (
    <section className="py-20 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Our Process"
          subtitle="A structured, predictable journey from initial concept to final handover."
          align="center"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="p-8 rounded-2xl bg-brand-bgAlt/30 border border-brand-bgAlt relative"
            >
              <div className="w-10 h-10 rounded-full bg-brand-red text-white font-bold flex items-center justify-center mb-6 text-sm">
                0{index + 1}
              </div>
              <h3 className="text-xl font-bold text-brand-text mb-3">
                {step.title}
              </h3>
              <p className="text-brand-text/70 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
