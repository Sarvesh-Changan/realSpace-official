export type TransactionType = 'buy' | 'rent' | 'commercial';

export type PropertyCategory = 'residential' | 'commercial' | 'luxury_penthouse' | 'villa';

export interface CompanyInfo {
  name: string;
  brandTagline: string;
  founder: string;
  founderTitle: string;
  reraNumber: string;
  phones: {
    primary: string;
    secondary: string;
    mobile: string;
    whatsapp: string;
  };
  emails: {
    primary: string;
    interiors: string;
    sales: string;
  };
  addresses: {
    title: string;
    line1: string;
    line2: string;
    city: string;
    pin: string;
    landmark?: string;
  }[];
  socials: {
    instagram: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
  };
  rating: {
    score: number;
    totalReviews: number;
    platform: string;
  };
  experienceYears: number;
  propertiesSold: number;
  squareFeetDesigned: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: PropertyCategory;
  transactionType: TransactionType;
  priceNumeric: number; // in INR
  priceDisplay: string;
  maintenanceMonthly?: string;
  configuration: string; // e.g. "2 BHK Luxury", "3 BHK Lake View", "Commercial Bare Shell"
  bedrooms?: number;
  bathrooms?: number;
  carpetAreaSqFt: number;
  superBuiltupSqFt?: number;
  location: string;
  microMarket: 'Ghodbunder Road' | 'Majiwada' | 'Teen Hath Naka' | 'Pokhran Road' | 'Kolshet Road' | 'Wagle Estate' | 'Kasarvadavli';
  reraId: string;
  possessionStatus: 'Ready to Move' | 'Under Construction' | 'Immediate' | 'Dec 2026';
  floor?: string;
  totalFloors?: number;
  furnishing: 'Unfurnished' | 'Semi-Furnished' | 'Fully Furnished Luxury' | 'Bare Shell' | 'Warm Shell';
  heroImage: string;
  gallery: string[];
  amenities: string[];
  specifications: { [key: string]: string };
  highlights: string[];
  featured: boolean;
  developer?: string;
  verified: boolean;
}

export interface MarqueeProject {
  id: string;
  title: string;
  developer: string;
  location: string;
  microMarket: string;
  reraId: string;
  startingPrice: string;
  pricePerSqFt?: string;
  configurations: string[];
  carpetAreaRange: string;
  possessionDate: string;
  totalTowers?: number;
  totalAcres?: string;
  description: string;
  heroImage: string;
  gallery: string[];
  amenities: string[];
  highlights: string[];
  badge?: string;
}

export interface CommercialSpace {
  id: string;
  title: string;
  buildingName: string;
  location: string;
  microMarket: string;
  reraId?: string;
  carpetAreaSqFt: number;
  floorPlate?: string;
  transactionType: 'lease' | 'sale' | 'both';
  ratePerSqFt: string;
  totalPriceDisplay: string;
  suitableFor: string[];
  furnishingStatus: 'Bare Shell' | 'Warm Shell' | 'Fully Furnished IT/Corporate';
  parkingRatio: string;
  image: string;
  featured: boolean;
}

export interface ServiceDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyFeatures: string[];
  deliverables: string[];
  icon: string;
  category: 'real_estate' | 'interior_design' | 'legal_financial';
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  society: string;
  location: string;
  propertyOrProject: string;
  rating: number;
  comment: string;
  serviceType: 'Property Buying' | 'Interior Fitout' | 'Commercial Office' | 'Rental & Lease';
  date: string;
  avatarUrl?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Buying in Thane' | 'MahaRERA & Legal' | 'Interior Architecture' | 'Home Loans & NRI';
}

export interface FilterState {
  transactionType: TransactionType;
  microMarket: string;
  configuration: string;
  propertyType: string;
  budgetRange: [number, number];
  searchQuery: string;
}

// ---------------------------------------------------------------------------
// Shell props — serialisable plain objects fetched server-side in layout.tsx
// ---------------------------------------------------------------------------

export interface ReraBranchProps {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  mapUrl: string | null;
}

export interface ReraShellProps {
  brokerName: string;
  tagline: string | null;
  reraRegistrationNo: string | null; // shown ONLY when non-empty string
  phone: string | null;
  altPhone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  officeHours: string | null;
  socialLinks: {
    instagram?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
  } | null;
  branches: ReraBranchProps[];
}

export interface EMICalculatorData {
  loanAmount: number;
  interestRate: number;
  tenureYears: number;
  monthlyEMI: number;
  totalInterest: number;
  totalPayment: number;
}

