// TEMPORARY SAMPLE DATA — removed in step D
import { CompanyInfo } from '@/types/rera';

export const companyData: CompanyInfo = {
  name: 'REALSPACE & Arnav Properties',
  brandTagline: 'Premier Real Estate Consultancy & Bespoke Luxury Interiors in Thane',
  founder: 'Vijay Chawan',
  founderTitle: 'Founder & Principal Architectural Consultant',
  reraNumber: 'A51700001581',
  phones: {
    primary: '+91 98692 11777',
    secondary: '+91 98336 36699',
    mobile: '+91 98929 36599',
    whatsapp: '919869211777',
  },
  emails: {
    primary: 'realspaceinteriors@hotmail.com',
    interiors: 'realspaceinteriors@hotmail.com',
    sales: 'sales@arnavproperties.com',
  },
  addresses: [
    {
      title: 'Studio Headquarters & Design Experience Suite',
      line1: 'W5-1717, Lodha Crown, Majiwada',
      line2: 'Off Eastern Express Highway',
      city: 'Thane West, Mumbai MMR',
      pin: '400608',
      landmark: 'Near Majiwada Flyover / Viviana Mall',
    },
    {
      title: 'Real Estate Advisory & Transaction Branch',
      line1: 'Shop No. 3, Highway Darshan Society',
      line2: 'Teen Hath Naka, LBS Marg',
      city: 'Thane West',
      pin: '400604',
      landmark: 'Opposite Nitin Company Junction',
    },
    {
      title: 'Consultancy Office',
      line1: 'Shop No. 9, Sai Anand Plaza',
      line2: 'Near Sameer Hotel, Castle Mill, LBS Marg',
      city: 'Thane West',
      pin: '400601',
      landmark: 'Castle Mill Naka',
    },
  ],
  socials: {
    instagram: 'https://instagram.com/realspace_27',
    facebook: 'https://facebook.com/arnavproperties',
    linkedin: 'https://linkedin.com/company/realspace-interiors',
  },
  rating: {
    score: 4.8,
    totalReviews: 184,
    platform: 'Google Verified Reviews',
  },
  experienceYears: 18,
  propertiesSold: 850,
  squareFeetDesigned: 420000,
};
