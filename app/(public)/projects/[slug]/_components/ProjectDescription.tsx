export function ProjectDescription({ description }: { description: string }) {
  // Split description by double newlines for basic paragraph formatting
  const paragraphs = description.split('\n\n').filter(Boolean);

  return (
    <div className="prose prose-neutral max-w-none prose-p:text-neutral-700 prose-p:leading-relaxed">
      <h2 className="text-2xl font-bold text-brand-text mb-6">About the Project</h2>
      <div className="space-y-4">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))
        ) : (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
}
