export function ReferenceSectionTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return <div className="rs-section-title">{eyebrow && <p>{eyebrow}</p>}<h2>{title}</h2>{children && <div className="rs-section-title__copy">{children}</div>}<span aria-hidden="true" /> </div>;
}
