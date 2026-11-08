export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT US', href: '/about' },
  { label: 'SERVICES', href: '/services' },
  { label: 'PROPERTIES', href: '/properties' },
  { label: 'POST PROPERTY', href: '/post-property' },
  { label: 'CONTACT', href: '/contact' },
];

export const footerQuickLinks: NavLink[] = [
  { label: 'Featured Properties', href: '/properties' },
  { label: 'Post Your Property (Free)', href: '/post-property' },
  { label: 'REALSPACE Luxury Interiors', href: '/interiors' },
  { label: 'Residential Projects', href: '/properties?category=residential' },
  { label: 'Commercial & IT Parks', href: '/properties?category=commercial' },
  { label: 'Interior Cost Estimator', href: '/interiors#cost-estimator' },
  { label: 'EMI Loan Calculator', href: '/services#calculator' },
  { label: 'MahaRERA Compliance', href: '/about#maharera' },
  { label: 'Founder Profile: Vijay Chawan', href: '/about#founder' },
  { label: 'Contact & Branch Offices', href: '/contact' },
];

export const microMarkets = [
  { name: 'All Thane', value: 'all' },
  { name: 'Ghodbunder Road', value: 'Ghodbunder Road' },
  { name: 'Majiwada', value: 'Majiwada' },
  { name: 'Teen Hath Naka', value: 'Teen Hath Naka' },
  { name: 'Pokhran Road', value: 'Pokhran Road' },
  { name: 'Kolshet Road', value: 'Kolshet Road' },
  { name: 'Wagle Estate', value: 'Wagle Estate' },
  { name: 'Kasarvadavli', value: 'Kasarvadavli' },
] as const;

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
