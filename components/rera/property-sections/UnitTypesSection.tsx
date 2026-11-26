import Image from 'next/image';
import type { UnitTypesData } from '@/lib/rera/property-sections/schemas';

export function UnitTypesSection({ data, title }: { data: UnitTypesData; title?: string | null }) {
  return (
    <section className="space-y-5">
      {title && <h2 className="whitespace-pre-line font-heading text-xl sm:text-2xl font-bold text-[#1C1C1C]">{title}</h2>}
      <div className="space-y-4">
        {data.units.map((unit, index) => (
          <article key={`${unit.title}-${index}`} className={`grid grid-cols-1 gap-4 ${unit.planImages.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
            {unit.planImages.length > 0 && <div className={`grid gap-3 ${unit.planImages.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {unit.planImages.map((image, imageIndex) => <div key={`${image.publicId}-${imageIndex}`} className="relative min-h-48 aspect-[4/3] bg-white border border-[#E8E2DA]">
                <Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-3" />
              </div>)}
            </div>}
            <div className="border border-[#E8E2DA] bg-white p-5 text-center">
              <h3 className="whitespace-pre-line font-heading text-lg font-bold text-[#1C1C1C]">{unit.title}</h3>
              {unit.fields.length > 0 && <dl className="mt-4 divide-y divide-[#E8E2DA]">
                {unit.fields.map((field, fieldIndex) => <div key={`${field.label}-${fieldIndex}`} className="flex flex-col items-center gap-1 py-2 text-center text-sm sm:flex-row sm:justify-center sm:gap-3">
                  <dt className="whitespace-pre-line font-semibold text-[#6D6A66]">{field.label}</dt>
                  <dd className="whitespace-pre-line text-[#1C1C1C]">{field.value}</dd>
                </div>)}
              </dl>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
