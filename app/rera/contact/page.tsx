import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { ContactForm } from '@/components/rera/ContactForm';
import { reraPath } from '@/lib/rera/routes';

export const metadata: Metadata = {
  title: 'Contact Us | REALSPACE',
  description: 'Contact REALSPACE or send an enquiry.',
};

interface ContactPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedParams = await searchParams;
  const initialPropertySlug = String(resolvedParams.property ?? '').trim();
  const requestedService = String(resolvedParams.service ?? '').trim();

  let settings = null;
  let branches: Array<{
    id: string;
    name: string;
    address: string;
    phone: string | null;
    mapUrl: string | null;
  }> = [];
  let services: Array<{ title: string }> = [];
  let localities: string[] = [];

  try {
    [settings, branches, services, localities] = await Promise.all([
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.reraBranch.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: { id: true, name: true, address: true, phone: true, mapUrl: true },
      }),
      prisma.reraService.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: { title: true },
      }),
      prisma.reraProperty.findMany({
        where: { isPublished: true },
        distinct: ['locality'],
        orderBy: { locality: 'asc' },
        select: { locality: true },
      }).then((rows) => rows.map((row) => row.locality.trim()).filter(Boolean)),
    ]);
  } catch {
    settings = null;
    branches = [];
    services = [];
    localities = [];
  }

  const phone = settings?.phone?.trim() ?? '';
  const altPhone = settings?.altPhone?.trim() ?? '';
  const whatsapp = settings?.whatsapp?.trim() ?? '';
  const email = settings?.email?.trim() ?? '';
  const address = settings?.address?.trim() ?? '';
  const officeHours = settings?.officeHours?.trim() ?? '';
  const initialService = services.some((service) => service.title === requestedService)
    ? requestedService
    : '';
  const reraRegNo =
    settings?.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
      ? settings.reraRegistrationNo
      : null;

  return (
    <div className="w-full bg-[#F8F5F1]">
      <section className="bg-[#1C1C1C] text-white py-14 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#D6D0C8] mb-7">
            <Link href={reraPath('/')} className="hover:text-[#C8A96A] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-white" aria-current="page">Contact</span>
          </nav>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            {reraRegNo ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>MahaRERA Reg. No. {reraRegNo}</span>
              </>
            ) : (
              <span>REALSPACE</span>
            )}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            Contact REALSPACE
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Send us an enquiry using the form below.
          </p>
        </div>
      </section>

      {/* 02. Interactive Form & Quick Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Interactive Contact Form (Wired to Database) */}
          <div className="lg:col-span-7 bg-white border border-[#E8E2DA] p-6 sm:p-10 shadow-sm">
            <ContactForm
              initialPropertySlug={initialPropertySlug}
              initialService={initialService}
              services={services.map((service) => service.title)}
              localities={localities}
              whatsapp={whatsapp}
            />
          </div>

          {/* Configured contact details */}
          <div className="lg:col-span-5 space-y-6">
            {(phone || altPhone || whatsapp || email || address) && (
              <div className="bg-[#1C1C1C] text-white p-6 border border-[#333333]">
                <h2 className="font-heading text-xl font-bold mb-4">REALSPACE Contact Details</h2>
                <div className="space-y-3 text-xs border-t border-[#333333] pt-4">
                {phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#A39E98]">Phone:</span>
                    <a
                      href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                      className="font-semibold text-white hover:text-[#C8A96A] transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                )}
                {whatsapp && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#A39E98]">WhatsApp Direct:</span>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-semibold hover:underline"
                    >
                      {whatsapp}
                    </a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#A39E98]">Email:</span>
                    <a
                      href={`mailto:${email}`}
                      className="text-white hover:text-[#C8A96A] transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                )}
                {altPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#A39E98]">Alternate phone:</span>
                    <a href={`tel:${altPhone.replace(/[^+\d]/g, '')}`} className="font-semibold text-white hover:text-[#C8A96A] transition-colors">{altPhone}</a>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-3 pt-1">
                    <MapPin className="w-4 h-4 text-[#C8A96A] shrink-0 mt-0.5" />
                    <p className="text-white whitespace-pre-line">{address}</p>
                  </div>
                )}
                </div>
              </div>
            )}

            {officeHours && <div className="bg-white border border-[#E8E2DA] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">
                <Clock className="w-4 h-4 text-[#C8A96A]" />
                Operating Hours
              </div>
              <p className="text-sm text-[#1C1C1C]">{officeHours}</p>
            </div>}
          </div>
        </div>
      </section>

      {/* 03. Published Branch Addresses Grid */}
      {branches.length > 0 && (
        <section className="bg-[#EEE6DD] border-t border-[#E8E2DA] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
                <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">Published Branches</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((b, idx) => (
                <div key={b.id} className="bg-white border border-[#E8E2DA] p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C8A96A]">
                    <MapPin className="w-4 h-4" />
                    Branch {idx + 1}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">{b.name}</h3>
                  <div className="text-xs text-[#6D6A66] space-y-1 whitespace-pre-line">
                    {b.address}
                  </div>
                  {b.phone && (
                    <div className="text-xs text-[#A39E98] pt-1">
                      Phone: <a href={`tel:${b.phone.replace(/[^+\d]/g, '')}`} className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]">{b.phone}</a>
                    </div>
                  )}
                  {getSafeMapUrl(b.mapUrl) && (
                    <a href={getSafeMapUrl(b.mapUrl)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold text-[#1C1C1C] hover:text-[#9B743D]">
                      <ExternalLink className="w-3.5 h-3.5" /> View map
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function getSafeMapUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}
