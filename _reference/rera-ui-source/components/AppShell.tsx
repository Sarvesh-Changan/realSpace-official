'use client';

import React, { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Footer } from './Footer';
import { ConsultationModal } from './ConsultationModal';
import { MessageCircle, Phone } from 'lucide-react';
import { companyData } from '@/data/company';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInterest, setModalInterest] = useState('VIP Consultation & Site Visit');

  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ interest?: string }>;
      if (customEvent.detail?.interest) {
        setModalInterest(customEvent.detail.interest);
      }
      setIsModalOpen(true);
    };

    window.addEventListener('open-consultation-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-consultation-modal', handleOpenModal);
    };
  }, []);

  const openModal = (interest?: string) => {
    if (interest) setModalInterest(interest);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F1] text-[#1C1C1C]">
      {/* Persistent Navigation Header */}
      <TopBar onOpenConsultation={() => openModal('VIP Consultation with Vijay Chawan')} />

      {/* Page Content */}
      <div className="flex-1">{children}</div>

      {/* Floating Action WhatsApp & Phone Bar */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
        <a
          href={`https://wa.me/${companyData.phones.whatsapp}?text=Hello%20Arnav%20Properties%20and%20REALSPACE%2C%20I%20would%20like%20to%20inquire%20about%20properties%20and%20interiors%20in%20Thane.`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
        <a
          href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
          className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#C8A96A] border border-[#C8A96A] flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          aria-label="Call Founder Vijay Chawan"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* Global Consultation & Booking Modal */}
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultInterest={modalInterest}
      />

      {/* Persistent Global Footer */}
      <Footer />
    </div>
  );
};
