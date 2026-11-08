'use client';

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  Instagram,
  ArrowRight,
  Building,
} from 'lucide-react';
import { companyData } from '@/data/company';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('Property Purchase & Site Visit');
  const [locality, setLocality] = useState('Ghodbunder Road');
  const [budget, setBudget] = useState('₹75 Lakhs - ₹1.5 Cr');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setIsSubmitted(true);
  };

  return (
    <div className="w-full bg-[#F8F5F1]">
      {/* 01. Contact Hero */}
      <section className="bg-[#1C1C1C] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C8A96A] mb-3 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            MahaRERA: {companyData.reraNumber} · Direct Access
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-tight max-w-3xl mb-6">
            Get in Touch with Vijay Chawan & Advisory Team.
          </h1>
          <p className="text-base sm:text-lg text-[#EEE6DD]/90 max-w-2xl leading-relaxed font-body">
            Visit our experience center at Lodha Crown, Majiwada or our brokerage offices at Teen Hath Naka and Castle Mill. We are available Monday through Saturday.
          </p>
        </div>
      </section>

      {/* 02. Interactive Form & Quick Contact Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7 bg-white border border-[#E8E2DA] p-6 sm:p-10 shadow-sm">
            {isSubmitted ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-[#EEE6DD] text-[#C8A96A] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#1C1C1C] mb-2">
                  Inquiry Dispatched Successfully
                </h3>
                <p className="text-xs sm:text-sm text-[#6D6A66] max-w-md mx-auto mb-6 leading-relaxed">
                  Thank you, <span className="font-semibold text-[#1C1C1C]">{name}</span>. Founder Vijay Chawan and the senior advisory desk have received your requirements for <strong className="text-[#1C1C1C]">{service}</strong>. We will contact you at <strong className="text-[#1C1C1C]">{phone}</strong> shortly.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={`https://wa.me/${companyData.phones.whatsapp}?text=Hi%20Vijay%2C%20I%20have%20submitted%20my%20contact%20form%20for%20${encodeURIComponent(service)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Instant WhatsApp Follow-up</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName('');
                      setPhone('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="px-6 py-3 border border-[#E8E2DA] text-[#1C1C1C] hover:bg-[#F8F5F1] text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    Send Another Note
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="border-b border-[#E8E2DA] pb-4 mb-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C8A96A]">
                    Direct Directives
                  </span>
                  <h2 className="font-heading text-2xl font-bold text-[#1C1C1C]">
                    Send us your Property or Interior Brief
                  </h2>
                  <p className="text-xs text-[#6D6A66] mt-1">
                    Fill in the form below and an advisor will coordinate a chauffeured site visit or project consultation.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98XXX XXXXX"
                        className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full h-11 px-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Service Required
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      >
                        <option value="Property Purchase & Site Visit">Property Purchase & Site Visit</option>
                        <option value="REALSPACE Turnkey Luxury Interiors">REALSPACE Turnkey Luxury Interiors</option>
                        <option value="Commercial Office / Retail Lease">Commercial Office / Retail Lease</option>
                        <option value="Home Loan Financing Assistance">Home Loan Financing Assistance</option>
                        <option value="Resale & Property Management">Resale & Property Management</option>
                        <option value="MahaRERA Due Diligence">MahaRERA Due Diligence</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Preferred Thane Micro-Market
                      </label>
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      >
                        <option value="Ghodbunder Road">Ghodbunder Road</option>
                        <option value="Majiwada / Lodha Crown">Majiwada / Lodha Crown</option>
                        <option value="Teen Hath Naka / LBS Marg">Teen Hath Naka / LBS Marg</option>
                        <option value="Pokhran Road 1 & 2">Pokhran Road 1 & 2</option>
                        <option value="Kolshet Road">Kolshet Road</option>
                        <option value="Wagle Industrial Estate">Wagle Industrial Estate</option>
                        <option value="Kasarvadavli Lake">Kasarvadavli Lake</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                        Estimated Budget
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full h-11 px-3 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                      >
                        <option value="Under ₹80 Lakhs">Under ₹80 Lakhs</option>
                        <option value="₹75 Lakhs - ₹1.5 Cr">₹75 Lakhs - ₹1.50 Cr</option>
                        <option value="₹1.5 Cr - ₹3.0 Cr">₹1.50 Cr - ₹3.00 Cr</option>
                        <option value="Above ₹3.0 Cr (Luxury)">Above ₹3.00 Cr (Luxury)</option>
                        <option value="Commercial Lease (Monthly)">Commercial Lease (Monthly)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1C1C1C] uppercase tracking-wider mb-1">
                      Project Details or Notes
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please mention specific towers, floor preferences, or interior design questions..."
                      className="w-full p-3.5 bg-[#F8F5F1] border border-[#E8E2DA] text-xs text-[#1C1C1C] focus:outline-none focus:border-[#C8A96A]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 bg-[#C8A96A] hover:bg-[#B78A47] text-[#1C1C1C] hover:text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to Vijay Chawan</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Direct Contacts & Hours */}
          <div className="lg:col-span-5 space-y-6">
            {/* Founder Contact Block */}
            <div className="bg-[#1C1C1C] text-white p-6 border border-[#333333]">
              <div className="text-[10px] uppercase font-bold text-[#C8A96A] tracking-wider mb-1">
                Direct Principal Contact
              </div>
              <h3 className="font-heading text-xl font-bold mb-1">
                Vijay Chawan
              </h3>
              <div className="text-xs text-[#A39E98] mb-4">
                Founder & Principal Architectural Consultant
              </div>

              <div className="space-y-3 text-xs border-t border-[#333333] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#A39E98]">Direct Mobile:</span>
                  <a
                    href={`tel:${companyData.phones.primary.replace(/\s+/g, '')}`}
                    className="font-semibold text-white hover:text-[#C8A96A] transition-colors"
                  >
                    {companyData.phones.primary}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A39E98]">WhatsApp Direct:</span>
                  <a
                    href={`https://wa.me/${companyData.phones.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] font-semibold hover:underline"
                  >
                    +91 98692 11777
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A39E98]">Interior Studio Email:</span>
                  <a
                    href={`mailto:${companyData.emails.interiors}`}
                    className="text-white hover:text-[#C8A96A] transition-colors"
                  >
                    {companyData.emails.interiors}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A39E98]">Instagram:</span>
                  <a
                    href={companyData.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#C8A96A] hover:underline"
                  >
                    @realspace_27
                  </a>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white border border-[#E8E2DA] p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1C1C]">
                <Clock className="w-4 h-4 text-[#C8A96A]" />
                Studio Working Hours
              </div>
              <div className="text-xs text-[#6D6A66] space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span>Monday - Saturday:</span>
                  <strong className="text-[#1C1C1C]">09:30 AM – 08:30 PM</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="text-[#1C1C1C] font-medium">By Prior Appointment Only</span>
                </div>
              </div>
            </div>

            {/* Advisory Desks */}
            <div className="bg-white border border-[#E8E2DA] p-6 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[#1C1C1C]">
                <Phone className="w-4 h-4 text-[#C8A96A]" />
                Additional Advisory Lines
              </div>
              <div className="space-y-1.5 text-[#6D6A66] pt-1">
                <div className="flex justify-between">
                  <span>Advisory Desk 1:</span>
                  <a href="tel:+919833636699" className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]">
                    +91 98336 36699
                  </a>
                </div>
                <div className="flex justify-between">
                  <span>Advisory Desk 2:</span>
                  <a href="tel:+919892936599" className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]">
                    +91 98929 36599
                  </a>
                </div>
                <div className="flex justify-between">
                  <span>Sales Email:</span>
                  <a href="mailto:sales@arnavproperties.com" className="text-[#1C1C1C] font-semibold hover:text-[#C8A96A]">
                    sales@arnavproperties.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03. All 3 Branch Addresses Grid */}
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
            {companyData.addresses.map((addr, idx) => (
              <div key={idx} className="bg-white border border-[#E8E2DA] p-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C8A96A]">
                  <MapPin className="w-4 h-4" />
                  Branch 0{idx + 1}
                </div>
                <h3 className="font-heading text-lg font-bold text-[#1C1C1C]">
                  {addr.title}
                </h3>
                <div className="text-xs text-[#6D6A66] space-y-1">
                  <div>{addr.line1}</div>
                  <div>{addr.line2}</div>
                  <div>{addr.city} - {addr.pin}</div>
                  {addr.landmark && (
                    <div className="text-[#A39E98] text-[11px] pt-1">
                      Landmark: {addr.landmark}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
