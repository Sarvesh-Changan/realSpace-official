import React from 'react';
import type { Metadata } from 'next';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { ContactForm } from '@/components/rera/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | REALSPACE & Arnav Properties Thane',
  description:
    'Get in touch with our senior real estate advisory team for property purchases, site visits, and commercial leasing in Thane.',
};

interface ContactPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedParams = await searchParams;
  const initialPropertySlug = String(resolvedParams.property ?? '').trim();
  const initialService = String(resolvedParams.service ?? 'Property Purchase & Site Visit').trim();

  let settings = null;
  let branches: Array<{
    id: string;
    name: string;
    address: string;
    phone: string | null;
  }> = [];

  try {
    [settings, branches] = await Promise.all([
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.reraBranch.findMany({
        where: { isPublished: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        select: { id: true, name: true, address: true, phone: true },
      }),
    ]);
  } catch {
    settings = null;
    branches = [];
  }

  const phone = settings?.phone ?? '';
  const altPhone = settings?.altPhone ?? '';
  const whatsapp = settings?.whatsapp ?? '';
  const email = settings?.email ?? '';
  const phoneClean = phone.replace(/\s+/g, '');
  const reraRegNo =
    settings?.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
      ? settings.reraRegistrationNo
      : null;

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Contact Hero */}
      <section className="bg-[#1C1C1C] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            {reraRegNo ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>MahaRERA Reg. No. {reraRegNo} · Direct Access</span>
              </>
            ) : (
              <span>Direct Real Estate Advisory</span>
            )}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            Get in Touch with Our Advisory Team.
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Visit our offices across Thane or send us your requirements online for immediate
            coordination.
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
              whatsapp={whatsapp}
            />
          </div>

          {/* Right Column: Direct Contacts & Hours */}
          <div className="lg:col-span-5 space-y-6">
            {/* Principal Contact Block */}
            <div className="bg-[#1C1C1C] text-white p-6 border border-[#333333]">
              <div className="text-[10px] uppercase font-bold text-[#C8A96A] tracking-wider mb-1">
                Direct Advisory Desk
              </div>
              <h3 className="font-heading text-xl font-bold mb-1">
                {settings?.founderName || settings?.brokerName || 'REALSPACE & Arnav Properties'}
              </h3>
              <div className="text-xs text-[#A39E98] mb-4">
                {settings?.founderRole || 'Real Estate Advisory & Consultation'}
              </div>

              <div className="space-y-3 text-xs border-t border-[#333333] pt-4">
                {phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#A39E98]">Direct Mobile:</span>
                    <a
                      href={`tel:${phoneClean}`}
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
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] font-semibold hover:underline"
                    >
                      +{whatsapp}
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
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white border border-[#E8E2DA] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">
                <Clock className="w-4 h-4 text-[#C8A96A]" />
                Operating Hours
              </div>
              <div className="text-xs text-[#6D6A66] space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span>Working Hours:</span>
                  <strong className="text-[#1C1C1C]">
                    {settings?.officeHours || '09:30 AM – 08:30 PM (Mon - Sat)'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="text-[#1C1C1C] font-medium">By Prior Appointment Only</span>
                </div>
              </div>
            </div>

            {/* Additional Contact Lines */}
            {(altPhone || email) && (
              <div className="bg-white border border-[#E8E2DA] p-6 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[#1C1C1C]">
                  <Phone className="w-4 h-4 text-[#C8A96A]" />
                  Additional Advisory Lines
                </div>
                <div className="space-y-1.5 text-[#6D6A66] pt-1">
                  {altPhone && (
                    <div className="flex justify-between">
                      <span>Alternate Line:</span>
                      <a
                        href={`tel:${altPhone.replace(/\s+/g, '')}`}
                        className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]"
                      >
                        {altPhone}
                      </a>
                    </div>
                  )}
                  {email && (
                    <div className="flex justify-between">
                      <span>Support Email:</span>
                      <a
                        href={`mailto:${email}`}
                        className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]"
                      >
                        {email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 03. Published Branch Addresses Grid */}
      {branches.length > 0 && (
        <section className="bg-[#EEE6DD] border-t border-[#E8E2DA] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">
                Visit Our Branches in Thane
              </h2>
              <p className="text-xs text-[#6D6A66] mt-1">
                Drop by any of our physical office locations or schedule a guided visit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {branches.map((b, idx) => (
                <div key={b.id} className="bg-white border border-[#E8E2DA] p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C8A96A]">
                    <MapPin className="w-4 h-4" />
                    Branch 0{idx + 1}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">{b.name}</h3>
                  <div className="text-xs text-[#6D6A66] space-y-1 whitespace-pre-line">
                    {b.address}
                  </div>
                  {b.phone && (
                    <div className="text-xs text-[#A39E98] pt-1">
                      Phone: <span className="text-[#1C1C1C] font-semibold">{b.phone}</span>
                    </div>
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
