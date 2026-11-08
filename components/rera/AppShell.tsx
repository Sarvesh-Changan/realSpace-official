'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { ConsultationModal } from './ConsultationModal';
import { MessageCircle, Phone } from 'lucide-react';
import type { ReraShellProps } from '@/types/rera';

interface AppShellProps {
  children: React.ReactNode;
  shellProps: ReraShellProps;
}

export const AppShell: React.FC<AppShellProps> = ({ children, shellProps }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInterest, setModalInterest] = useState('VIP Consultation & Site Visit');
  const [modalPropertySlug, setModalPropertySlug] = useState('');
  const [modalSource, setModalSource] = useState<'SITE_VISIT' | 'PROPERTY_ENQUIRY'>('SITE_VISIT');

  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<{
        interest?: string;
        propertySlug?: string;
        source?: 'SITE_VISIT' | 'PROPERTY_ENQUIRY';
      }>;
      if (customEvent.detail?.interest) {
        setModalInterest(customEvent.detail.interest);
      }
      if (customEvent.detail?.propertySlug) {
        setModalPropertySlug(customEvent.detail.propertySlug);
      } else {
        setModalPropertySlug('');
      }
      if (customEvent.detail?.source) {
        setModalSource(customEvent.detail.source);
      } else {
        setModalSource('SITE_VISIT');
      }
      setIsModalOpen(true);
    };

    window.addEventListener('open-consultation-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-consultation-modal', handleOpenModal);
    };
  }, []);

  const openModal = (interest?: string, propertySlug?: string, source?: 'SITE_VISIT' | 'PROPERTY_ENQUIRY') => {
    if (interest) setModalInterest(interest);
    setModalPropertySlug(propertySlug || '');
    setModalSource(source || 'SITE_VISIT');
    setIsModalOpen(true);
  };

  const phone = shellProps.phone ?? '';
  const whatsapp = shellProps.whatsapp ?? '';
  const phoneClean = phone.replace(/\s+/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F1] text-[#1C1C1C]">
      {/* Persistent Navigation Header */}
      <TopBar
        shellProps={shellProps}
        onOpenConsultation={() => openModal('VIP Consultation')}
      />

      {/* Page Content */}
      <div className="flex-1">{children}</div>

      {/* Floating Action WhatsApp & Phone Bar */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20properties%20in%20Thane.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        )}
        {phoneClean && (
          <a
            href={`tel:${phoneClean}`}
            className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#C8A96A] border border-[#C8A96A] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            aria-label="Call us"
          >
            <Phone className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Global Consultation & Booking Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultInterest={modalInterest}
        propertySlug={modalPropertySlug}
        source={modalSource}
        phone={phone}
        whatsapp={whatsapp}
        reraRegistrationNo={shellProps.reraRegistrationNo}
      />

      {/* Persistent Global Footer */}
      <Footer shellProps={shellProps} />
    </div>
  );
};
