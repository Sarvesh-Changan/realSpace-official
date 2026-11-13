import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { PropertiesExplorer } from '@/components/rera/PropertiesExplorer';
import type { ReraPropertyDetailData } from '@/components/rera/PropertyDetailModal';

export const metadata: Metadata = {
  title: 'Properties | REALSPACE',
  description: 'Browse properties listed by REALSPACE and explore their details, locations and available specifications.',
};

interface PropertiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedParams = await searchParams;
  let propertiesRaw: Prisma.ReraPropertyGetPayload<{ include: { images: true } }>[] = [];
  let settings = null;
  let propertyFetchFailed = false;

  try {
    propertiesRaw = await prisma.reraProperty.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
  } catch (error) {
    console.error('Failed to load published RERA properties:', error);
    propertyFetchFailed = true;
  }

  try {
    settings = await prisma.reraSettings.findUnique({ where: { id: 'singleton' } });
  } catch (error) {
    console.error('Failed to load RERA contact settings for properties page:', error);
  }

  const initialProperties = propertiesRaw.map((p): ReraPropertyDetailData & {
    listingType: string;
    propertyType: string;
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
  } => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description ?? '',
    priceLabel: p.priceLabel,
    priceAmount: p.priceAmount ?? null,
    locality: p.locality,
    city: p.city,
    projectName: p.projectName ?? null,
    builderName: p.builderName ?? null,
    projectReraNo: p.projectReraNo ?? null,
    possession: p.possession ?? null,
    carpetAreaSqFt: p.carpetAreaSqFt ?? null,
    builtUpAreaSqFt: p.builtUpAreaSqFt ?? null,
    bhkLabel: p.bhkLabel ?? null,
    furnishing: p.furnishing ?? null,
    amenities: p.amenities ?? [],
    specifications: p.specifications as ReraPropertyDetailData['specifications'],
    coverImageUrl: p.coverImageUrl || p.images[0]?.url || null,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText ?? '',
      mediaType: img.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    })),
    listingType: p.listingType,
    propertyType: p.propertyType,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
  }));

  const distinctLocalities = Array.from(new Set(propertiesRaw.map((p) => p.locality?.trim()).filter((value): value is string => Boolean(value)))).sort();
  const distinctBhkLabels = Array.from(new Set(propertiesRaw.map((p) => p.bhkLabel?.trim()).filter((value): value is string => Boolean(value)))).sort();
  const distinctPossessions = Array.from(new Set(propertiesRaw.map((p) => p.possession?.trim()).filter((value): value is string => Boolean(value)))).sort();
  const distinctPropertyTypes = Array.from(new Set(propertiesRaw.map((p) => p.propertyType).filter(Boolean))).sort();

  const rawInterest = String(resolvedParams.interest || resolvedParams.transactionType || resolvedParams.category || '').toLowerCase();
  let initialInterest = 'all';
  if (['buy', 'sale'].includes(rawInterest)) initialInterest = 'buy';
  else if (rawInterest === 'rent') initialInterest = 'rent';

  const rawLocality = String(resolvedParams.locality || resolvedParams.microMarket || '').toLowerCase();
  const initialLocality = distinctLocalities.find((locality) => locality.toLowerCase() === rawLocality) || 'all';
  const rawBudget = String(resolvedParams.budget || '');
  const validBudgets = ['under_80L', '80L_150L', '150L_300L', 'above_300L'];

  return (
    <PropertiesExplorer
      initialProperties={initialProperties}
      propertyFetchFailed={propertyFetchFailed}
      bannerImageUrl={settings?.heroImageUrl || initialProperties.find((property) => property.coverImageUrl)?.coverImageUrl || null}
      distinctLocalities={distinctLocalities}
      distinctBhkLabels={distinctBhkLabels}
      distinctPossessions={distinctPossessions}
      distinctPropertyTypes={distinctPropertyTypes}
      initialInterest={initialInterest}
      initialLocality={initialLocality}
      initialBudget={validBudgets.includes(rawBudget) ? rawBudget : 'all'}
      phone={settings?.phone ?? null}
      whatsapp={settings?.whatsapp ?? null}
    />
  );
}
