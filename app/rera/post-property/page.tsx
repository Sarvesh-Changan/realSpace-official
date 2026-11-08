import React from 'react';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { PostPropertyForm } from '@/components/rera/PostPropertyForm';

export const metadata: Metadata = {
  title: 'Post Your Property (Free) | REALSPACE & Arnav Properties Thane',
  description:
    'List your residential flat, penthouse, or commercial office in Thane directly with our licensed brokerage. Pre-screened buyers and zero upfront marketing fees.',
};

export default async function PostPropertyPage() {
  let settings = null;
  let distinctLocalities: string[] = [];

  try {
    [settings, distinctLocalities] = await Promise.all([
      prisma.reraSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.reraProperty
        .findMany({
          where: { isPublished: true },
          select: { locality: true },
          distinct: ['locality'],
        })
        .then((props) => props.map((p) => p.locality.trim()).filter(Boolean).sort()),
    ]);
  } catch {
    settings = null;
    distinctLocalities = [];
  }

  const reraRegNo =
    settings?.reraRegistrationNo && settings.reraRegistrationNo.trim() !== ''
      ? settings.reraRegistrationNo
      : null;

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Hero Banner */}
      <section className="bg-[#1C1C1C] text-white py-14 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            {reraRegNo ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>MahaRERA: {reraRegNo} · Seller &amp; Landlord Desk</span>
              </>
            ) : (
              <span>Seller &amp; Landlord Advisory Desk</span>
            )}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-normal leading-tight max-w-3xl mb-4">
            List Your Property in Thane with Us.
          </h1>
          <p className="text-xs sm:text-base text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Get your residential flat, penthouse, or commercial space in front of pre-qualified
            buyers and corporate tenants. Zero upfront listing fees and professional legal
            agreement handling.
          </p>
        </div>
      </section>

      {/* 02. Benefits Bar */}
      <section className="border-b border-[#E8E2DA] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>Pre-Screened Qualified Buyers</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>Professional Visual Walkthrough</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>Registered Agreement Legal Desk</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C8A96A] shrink-0" />
              <span>Turnkey Staging to Maximize Value</span>
            </div>
          </div>
        </div>
      </section>

      {/* 03. Property Listing Submission Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-14">
        <div className="bg-white border border-[#E8E2DA] p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          <PostPropertyForm
            distinctLocalities={distinctLocalities}
            whatsapp={settings?.whatsapp ?? null}
          />
        </div>
      </section>
    </div>
  );
}
