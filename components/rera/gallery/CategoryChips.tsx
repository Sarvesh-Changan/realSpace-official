'use client';

export type GalleryCategoryFilter =
  | 'ALL'
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'ONGOING'
  | 'HANDOVER'
  | 'OTHER';

export interface ReraGalleryDisplayItem {
  id: string;
  title: string;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'ONGOING' | 'HANDOVER' | 'OTHER';
  mediaType: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string | null;
  altText: string;
}

interface CategoryChipsProps {
  active: GalleryCategoryFilter;
  onChange: (cat: GalleryCategoryFilter) => void;
}

const CHIPS: { label: string; value: GalleryCategoryFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Residential', value: 'RESIDENTIAL' },
  { label: 'Commercial', value: 'COMMERCIAL' },
  { label: 'Ongoing Projects', value: 'ONGOING' },
  { label: 'Handovers', value: 'HANDOVER' },
];

export default function CategoryChips({ active, onChange }: CategoryChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => (
        <button
          key={chip.value}
          onClick={() => onChange(chip.value)}
          className={
            active === chip.value
              ? 'px-4 py-2 rounded-full text-sm font-medium transition-colors bg-[#1C1C1C] text-[#C8A96A]'
              : 'px-4 py-2 rounded-full text-sm font-medium transition-colors border border-[#E8E2DA] text-[#6D6A66] hover:border-[#C8A96A] hover:text-[#1C1C1C]'
          }
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
