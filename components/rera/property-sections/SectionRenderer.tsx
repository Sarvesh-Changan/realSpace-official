import type { ReraPropertySectionData } from '@/lib/rera/property-sections/schemas';
import { InfoCardsSection } from './InfoCardsSection';
import { PhaseCardsSection } from './PhaseCardsSection';
import { TextBlockSection } from './TextBlockSection';
import { UnitTypesSection } from './UnitTypesSection';

export function SectionRenderer({ section }: { section: ReraPropertySectionData }) {
  switch (section.type) {
    case 'INFO_CARDS': return <InfoCardsSection data={section.data} title={section.title} />;
    case 'PHASE_CARDS': return <PhaseCardsSection data={section.data} title={section.title} />;
    case 'UNIT_TYPES': return <UnitTypesSection data={section.data} title={section.title} />;
    case 'TEXT_BLOCK': return <TextBlockSection data={section.data} title={section.title} />;
  }
}
