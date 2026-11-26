import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { PropertiesExplorer } from '@/components/rera/PropertiesExplorer';
import type { ReraPropertyDetailData } from '@/components/rera/PropertyDetailModal';
import ReraHomeMotion from '@/components/rera/ReraHomeMotion';

export const metadata: Metadata = {
  title: 'Properties | REALSPACE',
  description: 'Browse properties listed by REALSPACE and explore their details and locations.',
};

interface PropertiesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedParams = await searchParams;
  let propertiesRaw: Prisma.ReraPropertyGetPayload<{ include: { images: true; category: true } }>[] = [];
  let categories: Array<{ id: string; name: string; slug: string }> = [];
  let settings = null;
  let propertyFetchFailed = false;

  try {
    propertiesRaw = await prisma.reraProperty.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
    });
  } catch (error) {
    console.error('Failed to load published RERA properties:', error);
    propertyFetchFailed = true;
  }

  try {
    categories = await prisma.reraPropertyCategory.findMany({
      where: { isPublished: true, properties: { some: { isPublished: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true },
    });
  } catch (error) {
    console.error('Failed to load published RERA property categories:', error);
  }

  try {
    settings = await prisma.reraSettings.findUnique({ where: { id: 'singleton' } });
  } catch (error) {
    console.error('Failed to load RERA contact settings for properties page:', error);
  }

  const initialProperties = propertiesRaw.map((p): ReraPropertyDetailData & {
    listingType: string;
    isFeatured: boolean;
    sortOrder: number;
    createdAt: string;
  } => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    categoryName: p.category?.isPublished ? p.category.name : null,
    categorySlug: p.category?.isPublished ? p.category.slug : null,
    description: p.description ?? '',
    locality: p.locality,
    city: p.city,
    projectName: p.projectName ?? null,
    builderName: p.builderName ?? null,
    projectReraNo: p.projectReraNo ?? null,
    bhkLabel: p.bhkLabel ?? null,
    amenities: p.amenities ?? [],
    coverImageUrl: p.coverImageUrl || p.images[0]?.url || null,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText ?? '',
      mediaType: img.mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    })),
    listingType: p.listingType,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
  }));

  const distinctLocalities = Array.from(new Set(propertiesRaw.map((p) => p.locality?.trim()).filter((value): value is string => Boolean(value)))).sort();
  const distinctBhkLabels = Array.from(new Set(propertiesRaw.map((p) => p.bhkLabel?.trim()).filter((value): value is string => Boolean(value)))).sort();

  const rawCategory = String(resolvedParams.category || '').toLowerCase();
  const legacyCategoryInterest = ['buy', 'sale', 'rent'].includes(rawCategory) && !categories.some((category) => category.slug === rawCategory)
    ? rawCategory
    : '';
  const rawInterest = String(resolvedParams.interest || resolvedParams.transactionType || legacyCategoryInterest).toLowerCase();
  let initialInterest = 'all';
  if (['buy', 'sale'].includes(rawInterest)) initialInterest = 'buy';
  else if (rawInterest === 'rent') initialInterest = 'rent';

  const rawLocality = String(resolvedParams.locality || resolvedParams.microMarket || '').toLowerCase();
  const initialLocality = distinctLocalities.find((locality) => locality.toLowerCase() === rawLocality) || 'all';
  const initialCategory = categories.find((category) => category.slug === rawCategory)?.slug ?? 'all';

  return (
    <ReraHomeMotion>
    <PropertiesExplorer
      initialProperties={initialProperties}
      categories={categories}
      initialCategory={initialCategory}
      propertyFetchFailed={propertyFetchFailed}
      bannerImageUrl={settings?.heroImageUrl || initialProperties.find((property) => property.coverImageUrl)?.coverImageUrl || null}
      distinctLocalities={distinctLocalities}
      distinctBhkLabels={distinctBhkLabels}
      initialInterest={initialInterest}
      initialLocality={initialLocality}
      phone={settings?.phone ?? null}
      whatsapp={settings?.whatsapp ?? null}
    />
    </ReraHomeMotion>
  );
}
