interface Step {
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  title?: string;
  steps: Step[];
}

export function ProcessTimeline({ title = "Our Process", steps }: ProcessTimelineProps) {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-bg border-t border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-brand-text">
            {title}
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-brand-red mx-auto rounded-full mt-3 sm:mt-4" />
        </div>
        
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-12 sm:pl-20 py-3 sm:py-4 group">
              {/* Vertical Line connecting steps */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[19px] sm:left-[39px] top-12 bottom-[-16px] w-0.5 bg-neutral-200" />
              )}
              
              {/* Step Marker */}
              <div className="absolute left-0 sm:left-4 top-3 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-bg border-2 border-brand-red text-brand-red font-bold text-base sm:text-lg shadow-sm z-10">
                {index + 1}
              </div>
              
              {/* Content */}
              <div>
                <h3 className="mb-1 sm:mb-2 font-bold text-lg sm:text-xl text-brand-text pt-1.5 sm:pt-2">{step.title}</h3>
                <p className="text-brand-text/80 text-sm sm:text-base leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
