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
    <section className="py-24 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            {title}
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-12 sm:pl-20 py-4 group">
              {/* Vertical Line connecting steps */}
              {index !== steps.length - 1 && (
                <div className="absolute left-[23px] sm:left-[39px] top-14 bottom-[-16px] w-px bg-neutral-200" />
              )}
              
              {/* Step Marker */}
              <div className="absolute left-0 sm:left-4 top-4 flex items-center justify-center w-12 h-12 rounded-full bg-brand-bg border-2 border-brand-red text-brand-red font-bold text-lg shadow-sm z-10">
                {index + 1}
              </div>
              
              {/* Content */}
              <div>
                <h3 className="mb-2 font-bold text-xl text-brand-text pt-2">{step.title}</h3>
                <p className="text-brand-text/80 leading-relaxed mt-2">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
