export function ProjectDescription({ description }: { description: string }) {
  // Split description by double newlines for basic paragraph formatting
  const paragraphs = description.split('\n\n').filter(Boolean);

  return (
    <div className="prose prose-neutral max-w-none prose-p:text-neutral-700 prose-p:leading-relaxed">
      <h2 className="text-xl sm:text-2xl font-bold text-brand-text mb-3 sm:mb-6">About the Project</h2>
      <div className="space-y-3 sm:space-y-4 text-sm sm:text-base">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, index) => (
            <p key={index} className="leading-relaxed">{para}</p>
          ))
        ) : (
          <p className="leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
