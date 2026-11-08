// TEMPORARY SAMPLE DATA — removed in step D
import { ServiceDetail } from '@/types/rera';

export const servicesData: ServiceDetail[] = [
  {
    id: 'service-residential-advisory',
    title: 'Luxury Residential Advisory',
    subtitle: 'Zero-bias property acquisition across Thane’s top gated developments',
    description:
      'We represent buyers and investors across Thane micro-markets including Ghodbunder Road, Majiwada, Teen Hath Naka, and Pokhran Road. From initial property scouting, floor plan feasibility, and developer negotiations to final registration, our MahaRERA-certified advisors guarantee complete transparency.',
    keyFeatures: [
      'Verified RERA registration and title search verification',
      'Exclusive builder pricing with zero brokerage on select developer projects',
      'Direct developer site visits with chauffeured pickup & inspection assistance',
      'Vastu compliance audit and carpet efficiency analysis',
    ],
    deliverables: [
      'Comparative Market Analysis (CMA) report',
      'Pricing breakdown including stamp duty & registration',
      'End-to-end documentation & sub-registrar signing support',
    ],
    icon: 'Building2',
    category: 'real_estate',
  },
  {
    id: 'service-turnkey-interiors',
    title: 'REALSPACE Bespoke Turnkey Interiors',
    subtitle: 'High-end interior architecture and execution led by Vijay Chawan',
    description:
      'With over 18 years of excellence and 420,000+ sq.ft transformed, REALSPACE delivers turnkey interior architecture for luxury apartments, penthouses, and executive villas. We craft bespoke spatial narratives with Italian marble, fluted veneers, concealed acoustic doors, and smart ambient lighting.',
    keyFeatures: [
      'Complete 3D photorealistic architectural renders & moodboards',
      'In-house German joinery manufacturing & factory-finish modular cabinetry',
      'Strict 45-day guaranteed handover timeline with dedicated site supervisor',
      '10-year structural warranty on all woodwork and hardware',
    ],
    deliverables: [
      'Customized 2D/3D layout elevations & MEP drawings',
      'Material swatch palette (Italian marble, veneers, fabric, metals)',
      'Weekly progress tracking with video walkthroughs',
    ],
    icon: 'Sparkles',
    category: 'interior_design',
  },
  {
    id: 'service-commercial-leasing',
    title: 'Commercial Leasing & Office Fitouts',
    subtitle: 'Corporate spaces, IT parks, and retail frontage in Wagle Estate',
    description:
      'From Grade-A IT offices in Wagle Estate to high-footfall retail showrooms on LBS Marg, we handle corporate leasing, pre-leased investment opportunities, tenant onboarding, and commercial fitouts tailored for MNCs, medical practices, and fast-growing tech enterprises.',
    keyFeatures: [
      'Access to bare shell, warm shell, and fully furnished corporate floor plates',
      'Long-term institutional lease structuring (5 to 9-year terms with lock-ins)',
      'Pre-leased commercial assets yielding 7.5% - 9.2% annual net returns',
      'Comprehensive fire NOC, MEP infrastructure, and load feasibility audits',
    ],
    deliverables: [
      'Floor plate efficiency study and density calculator',
      'Comprehensive lease deed drafting and stamp duty registration',
      'Turnkey office fitout coordination via REALSPACE commercial division',
    ],
    icon: 'Briefcase',
    category: 'real_estate',
  },
  {
    id: 'service-maharera-legal',
    title: 'MahaRERA Due Diligence & Legal Support',
    subtitle: 'Safe, secure, and fully verified real estate transactions in Maharashtra',
    description:
      'Our in-house legal and RERA advisory panel verifies encumbrance certificates, Commencement Certificates (CC), Occupancy Certificates (OC), title search reports, and developer track records so you invest with complete peace of mind.',
    keyFeatures: [
      'Verification against MahaRERA public registry (No. A51700001581)',
      'Scrutiny of land title history, litigation checks, and builder compliance',
      'Online e-registration of agreement for sale and leave & license',
      'NRI property management and power of attorney execution',
    ],
    deliverables: [
      '30-Year Title Search verification summary',
      'Detailed RERA project milestone audit',
      'Taxation and TDS on property purchase assistance (Form 26QB)',
    ],
    icon: 'ShieldCheck',
    category: 'legal_financial',
  },
  {
    id: 'service-home-loan-advisory',
    title: 'Home Loan & Financial Structuring',
    subtitle: 'Competitive interest rates with pre-approved banking consortiums',
    description:
      'We partner with India’s leading public and private banks (SBI, HDFC Bank, ICICI Bank, Axis Bank, Bank of Baroda) to secure preferential interest rates, fast-track sanctions, and optimal tax-efficient loan structuring for residential and commercial purchases.',
    keyFeatures: [
      'Pre-approved project files for instant loan sanction within 72 hours',
      'Maximum funding eligibility evaluation based on combined household income',
      'Doorstep document collection and dedicated relationship manager',
      'Subvention scheme and step-up EMI structuring advice',
    ],
    deliverables: [
      'Customized EMI comparison across 6+ tier-1 lenders',
      'Zero-processing fee waivers on select partner projects',
      'Sanction letter dispatch and legal technical clearance',
    ],
    icon: 'Calculator',
    category: 'legal_financial',
  },
  {
    id: 'service-property-management',
    title: 'Resale, Leasing & Property Care',
    subtitle: 'End-to-end management for local homeowners and NRI investors',
    description:
      'Maximize your property yield without lifting a finger. Arnav Properties provides comprehensive asset management including tenant screening, police verification, rent collection, routine maintenance, and resale marketing.',
    keyFeatures: [
      'Strict background checks and corporate tenant matching',
      'Bi-annual physical property inspection with photographic reports',
      'Timely rent collection and maintenance fee disbursals',
      'Professional cleaning, painting, and touch-ups between tenancies',
    ],
    deliverables: [
      'Registered Leave & License agreement execution',
      'Quarterly financial asset health report',
      'Rapid tenant replacement with average vacancy under 18 days',
    ],
    icon: 'KeyRound',
    category: 'real_estate',
  },
];
