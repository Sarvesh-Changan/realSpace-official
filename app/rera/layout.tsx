import type { Metadata } from 'next';
import { AppShell } from '@/components/rera/AppShell';
import type { ReraShellProps, ReraBranchProps } from '@/types/rera';
import prisma from '@/lib/prisma';
import './rera.css';

// ---------------------------------------------------------------------------
// DB helpers — never throw; fall back to nulls so the layout never crashes.
// ---------------------------------------------------------------------------

async function fetchShellProps(): Promise<ReraShellProps> {
  try {
    const [settings, rawBranches] = await Promise.all([
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.reraBranch.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, address: true, phone: true, mapUrl: true },
      }),
    ]);

    const branches: ReraBranchProps[] = rawBranches.map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      phone: b.phone,
      mapUrl: b.mapUrl,
    }));

    if (!settings) {
      return {
        brokerName: '',
        tagline: null,
        reraRegistrationNo: null,
        phone: null,
        altPhone: null,
        whatsapp: null,
        email: null,
        address: null,
        officeHours: null,
        socialLinks: null,
        branches,
      };
    }

    // socialLinks is Json? in the schema — parse safely
    let socialLinks: ReraShellProps['socialLinks'] = null;
    if (settings.socialLinks && typeof settings.socialLinks === 'object') {
      const raw = settings.socialLinks as Record<string, unknown>;
      socialLinks = {
        instagram: typeof raw.instagram === 'string' ? raw.instagram : null,
        facebook: typeof raw.facebook === 'string' ? raw.facebook : null,
        youtube: typeof raw.youtube === 'string' ? raw.youtube : null,
        linkedin: typeof raw.linkedin === 'string' ? raw.linkedin : null,
      };
    }

    return {
      brokerName: settings.brokerName ?? '',
      tagline: settings.tagline ?? null,
      reraRegistrationNo:
        settings.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
          ? settings.reraRegistrationNo
          : null,
      phone: settings.phone ?? null,
      altPhone: settings.altPhone ?? null,
      whatsapp: settings.whatsapp ?? null,
      email: settings.email ?? null,
      address: settings.address ?? null,
      officeHours: settings.officeHours ?? null,
      socialLinks,
      branches,
    };
  } catch {
    // DB unreachable during build / cold start — return empty shell
    return {
      brokerName: '',
      tagline: null,
      reraRegistrationNo: null,
      phone: null,
      altPhone: null,
      whatsapp: null,
      email: null,
      address: null,
      officeHours: null,
      socialLinks: null,
      branches: [],
    };
  }
}

// ---------------------------------------------------------------------------
// generateMetadata — uses brokerName from DB when present
// ---------------------------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: {
      template: '%s | REALSPACE',
      default: 'REALSPACE',
    },
    description: 'REALSPACE real estate website.',
    robots: {
      index: false,
      follow: false,
    },
  };
}

// ---------------------------------------------------------------------------
// Layout (Server Component)
// ---------------------------------------------------------------------------

export default async function ReraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shellProps = await fetchShellProps();

  return (
    <div
      className="rera-root rera-blue-theme min-h-screen flex flex-col bg-[#F8F5F1] text-[#1C1C1C]"
    >
      <AppShell shellProps={shellProps}>{children}</AppShell>
    </div>
  );
}
