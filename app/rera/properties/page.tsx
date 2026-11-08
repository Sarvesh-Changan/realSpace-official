import React from 'react';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import {
  PropertiesExplorer,
} from '@/components/rera/PropertiesExplorer';
import type { ReraPropertyDetailData } from '@/components/rera/PropertyDetailModal';

export const metadata: Metadata = {
  title: 'Curated Properties in Thane | REALSPACE',
  description:
    'Explore verified luxury apartments, penthouses, and commercial spaces across Ghodbunder Road, Majiwada, and prime Thane micro-markets.',
};

interface PropertiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedParams = await searchParams;

  let propertiesRaw: any[] = [];
  let settings = null;

  try {
    [propertiesRaw, settings] = await Promise.all([
      prisma.reraProperty.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
    ]);
  } catch {
    propertiesRaw = [];
    settings = null;
  }

  // Serialized property data for client
  const initialProperties: ReraPropertyDetailData[] = propertiesRaw.map((p) => ({
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
    specifications: p.specifications as any,
    coverImageUrl: p.coverImageUrl || p.images[0]?.url || null,
    images: p.images.map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText ?? '',
      mediaType: img.mediaType ?? 'IMAGE',
    })),
  }));

  // Distinct localities from published properties
  const distinctLocalities = Array.from(
    new Set(propertiesRaw.map((p) => p.locality?.trim()).filter(Boolean))
  ).sort();

  // Distinct BHK labels
  const distinctBhkLabels = Array.from(
    new Set(propertiesRaw.map((p) => p.bhkLabel?.trim()).filter(Boolean))
  ).sort();

  // Distinct possession statuses
  const distinctPossessions = Array.from(
    new Set(propertiesRaw.map((p) => p.possession?.trim()).filter(Boolean))
  ).sort();

  // Validate initial filter state from search params
  const rawInterest = String(
    resolvedParams.interest || resolvedParams.transactionType || resolvedParams.category || ''
  ).toLowerCase();
  let initialInterest = 'all';
  if (['buy', 'sale'].includes(rawInterest)) initialInterest = 'buy';
  else if (rawInterest === 'rent') initialInterest = 'rent';
  else if (rawInterest === 'commercial') initialInterest = 'commercial';

  const rawLocality = String(resolvedParams.locality || resolvedParams.microMarket || '').toLowerCase();
  const matchedLocality = distinctLocalities.find(
    (l) => l.toLowerCase() === rawLocality
  );
  const initialLocality = matchedLocality || 'all';

  const rawBudget = String(resolvedParams.budget || '');
  const validBudgets = ['under_80L', '80L_150L', '150L_300L', 'above_300L'];
  const initialBudget = validBudgets.includes(rawBudget) ? rawBudget : 'all';

  return (
    <PropertiesExplorer
      initialProperties={initialProperties}
      distinctLocalities={distinctLocalities}
      distinctBhkLabels={distinctBhkLabels}
      distinctPossessions={distinctPossessions}
      initialInterest={initialInterest}
      initialLocality={initialLocality}
      initialBudget={initialBudget}
      phone={settings?.phone ?? null}
      whatsapp={settings?.whatsapp ?? null}
    />
  );
}
