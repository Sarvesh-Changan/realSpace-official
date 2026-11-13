// TEMPORARY SAMPLE DATA — removed in step D
import { reraPath } from '@/lib/rera/routes';
export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'HOME', href: reraPath('/') },
  { label: 'ABOUT US', href: reraPath('/about') },
  { label: 'SERVICES', href: reraPath('/services') },
  { label: 'PROPERTIES', href: reraPath('/properties') },
  { label: 'GALLERY', href: reraPath('/gallery') },
  { label: 'CONTACT', href: reraPath('/contact') },
];

export const footerQuickLinks: NavLink[] = [
  { label: 'Featured Properties', href: reraPath('/properties') },
  { label: 'REALSPACE Luxury Interiors', href: '/' },
  { label: 'Residential Projects', href: reraPath('/properties?category=residential') },
  { label: 'Commercial & IT Parks', href: reraPath('/properties?category=commercial') },
  { label: 'Interior Cost Estimator', href: '/' },
  { label: 'EMI Loan Calculator', href: reraPath('/services#calculator') },
  { label: 'MahaRERA Compliance', href: reraPath('/about#maharera') },
  { label: 'Founder Profile: Vijay Chawan', href: reraPath('/about#founder') },
  { label: 'Contact & Branch Offices', href: reraPath('/contact') },
];


export const propertyConfigurations = [
  { label: 'All Configurations', value: 'all' },
  { label: '1 BHK', value: '1 BHK' },
  { label: '2 BHK', value: '2 BHK' },
  { label: '3 BHK', value: '3 BHK' },
  { label: '4+ BHK / Penthouse', value: '4 BHK' },
  { label: 'Commercial Office / Retail', value: 'Commercial' },
] as const;

export const companyHighlights = [
  { value: '18+', label: 'Years Advisory & Design Excellence' },
  { value: 'A51700001581', label: 'MahaRERA Registered Broker' },
  { value: '850+', label: 'Families & Firms Housed' },
  { value: '420,000+', label: 'Sq.Ft Luxury Interiors Handed Over' },
  { value: '4.8 / 5', label: 'Average Client Rating' },
];
