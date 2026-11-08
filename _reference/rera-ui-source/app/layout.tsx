import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'REALSPACE & Arnav Properties | Luxury Real Estate & Interior Design Studio Thane',
  description:
    'Premier real estate consultancy & bespoke luxury interior design in Thane & Mumbai. MahaRERA registered broker A51700001581. Luxury residences, commercial spaces, and turnkey interior design by Vijay Chawan.',
  keywords: [
    'Arnav Properties Thane',
    'Realspace Interior Design',
    'Vijay Chawan Interior Designer',
    'MahaRERA Registered Broker Thane A51700001581',
    'Luxury Apartments Ghodbunder Road Thane',
    'Properties in Majiwada Thane',
    'Commercial Office Spaces Wagle Estate',
    'ACE Homes Thane Kasarvadavli',
    'Turnkey Interior Designer Lodha Crown Thane',
    'Godrej Alive Thane',
    'Lodha Splendora Real Estate Broker',
  ],
  authors: [{ name: 'Vijay Chawan - REALSPACE & Arnav Properties' }],
  metadataBase: new URL(
    process.env.APP_URL && process.env.APP_URL.startsWith('http')
      ? process.env.APP_URL
      : 'https://arnavproperties.com'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'REALSPACE & Arnav Properties | Luxury Real Estate & Interior Studio Thane',
    description:
      'MahaRERA A51700001581. Discover hand-picked luxury residences, prime commercial offices, and bespoke turnkey interior design in Thane & Mumbai.',
    type: 'website',
    url: '/',
    siteName: 'REALSPACE & Arnav Properties',
    locale: 'en_IN',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Luxury Real Estate and Interior Architecture Thane Mumbai',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REALSPACE & Arnav Properties | Thane Luxury Real Estate & Interiors',
    description:
      'Premier MahaRERA registered advisory (A51700001581) & bespoke turnkey interior design studio in Thane, Mumbai.',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateAgent',
        '@id': 'https://arnavproperties.com/#agent',
        name: 'Arnav Properties',
        alternateName: 'REALSPACE Interior Studio',
        founder: {
          '@type': 'Person',
          name: 'Vijay Chawan',
          jobTitle: 'Principal Founder & Interior Architect',
        },
        description:
          'MahaRERA-registered real estate advisory and luxury interior design studio operating in Thane and Mumbai Metropolitan Region.',
        telephone: ['+919869211777', '+919833636699', '+919892936599'],
        email: ['realspaceinteriors@hotmail.com', 'sales@arnavproperties.com'],
        address: [
          {
            '@type': 'PostalAddress',
            streetAddress: 'W5-1717, Lodha Crown, Majiwada',
            addressLocality: 'Thane',
            addressRegion: 'Maharashtra',
            postalCode: '400608',
            addressCountry: 'IN',
          },
          {
            '@type': 'PostalAddress',
            streetAddress: 'Shop No. 3, Highway Darshan Society, Theen Hath Naka, LBS Marg',
            addressLocality: 'Thane',
            addressRegion: 'Maharashtra',
            postalCode: '400604',
            addressCountry: 'IN',
          },
        ],
        taxID: 'MahaRERA: A51700001581',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '184',
          bestRating: '5',
          worstRating: '1',
        },
        priceRange: '₹₹₹₹',
        currenciesAccepted: 'INR',
        paymentAccepted: 'Bank Transfer, Cheque, UPI',
        openingHours: 'Mo,Tu,We,Th,Fr,Sa 09:30-20:30',
      },
      {
        '@type': 'HomeAndConstructionBusiness',
        '@id': 'https://arnavproperties.com/#interiors',
        name: 'REALSPACE Luxury Interior Studio',
        telephone: '+919869211777',
        email: 'realspaceinteriors@hotmail.com',
        founder: 'Vijay Chawan',
        areaServed: 'Thane, Mumbai, Navi Mumbai',
        serviceType: [
          'Luxury Residential Interior Design',
          'Turnkey Fitouts',
          'Modular Kitchens & Italian Joinery',
          'Commercial Office Architecture',
          'MahaRERA Legal Due Diligence',
        ],
      },
    ],
  };

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaStructuredData) }}
        />
      </head>
      <body className="min-h-screen bg-[#F8F5F1] text-[#1C1C1C] font-body selection:bg-[#C8A96A] selection:text-white" suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
