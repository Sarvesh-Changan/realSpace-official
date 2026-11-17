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
import ReraHomeMotion from '@/components/rera/ReraHomeMotion';

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
    <ReraHomeMotion>
    <div className="w-full bg-[#F8F5F1]">
      <section
        className="relative z-10 bg-[#EFF5FB] pb-12 text-white md:pb-16"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[410px] bg-[#1C1C1C] bg-cover bg-center md:h-[460px]"
          style={{
            backgroundImage: "linear-gradient(90deg, rgba(8, 18, 39, 0.88), rgba(13, 34, 83, 0.78)), url('/arnav/images/events/events-bg.jpg')",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 pt-12 sm:pt-16 lg:col-span-5 lg:pt-[125px] lg:pr-8">
            <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-white/90">
              <Link href={reraPath('/')} className="!text-white transition-colors hover:!text-[#C8A96A]">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-white/75" aria-hidden="true" />
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
            <h1 className="max-w-full font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-white font-normal leading-[1.05] mb-6">
              <span className="block">Contact</span>
              <span className="block">REALSPACE</span>
            </h1>
            <p className="max-w-md text-base sm:text-lg text-white leading-relaxed font-body">
              Send us an enquiry using the form below.
            </p>
          </div>

          <div className="rera-motion-card border border-[#D7E3EF] bg-white p-5 text-[#172B50] shadow-[0_18px_45px_rgba(0,0,0,0.22)] sm:p-8 lg:col-span-7 lg:mt-[60px]">
            <ContactForm
              initialPropertySlug={initialPropertySlug}
              initialService={initialService}
              services={services.map((service) => service.title)}
              localities={localities}
              whatsapp={whatsapp}
            />
          </div>
        </div>
      </section>

      {/* 02. Interactive Form & Quick Contact Grid */}
      {(phone || altPhone || whatsapp || email || address || officeHours) && <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-6 items-start">
          {/* Configured contact details */}
          <div className="space-y-6">
            {(phone || altPhone || whatsapp || email || address) && (
              <div className="rera-motion-card bg-[#1C1C1C] text-white p-6 border border-[#333333]">
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

            {officeHours && <div className="rera-motion-card bg-white border border-[#E8E2DA] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">
                <Clock className="w-4 h-4 text-[#C8A96A]" />
                Operating Hours
              </div>
              <p className="text-sm text-[#1C1C1C]">{officeHours}</p>
            </div>}
          </div>
        </div>
      </section>}

      {/* 03. Published Branch Addresses Grid */}
      {branches.length > 0 && (
        <section className="bg-[#EEE6DD] border-t border-[#E8E2DA] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
                <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">Published Branches</h2>
            </div>

            <div className="rera-motion-grid grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((b, idx) => (
                <div key={b.id} className="rera-motion-card bg-white border border-[#E8E2DA] p-6 space-y-3">
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
    </ReraHomeMotion>
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
