export interface InteriorProject {
  id: string;
  title: string;
  clientLocation: string;
  society: string;
  carpetAreaSqFt: number;
  timelineDays: number;
  style: string;
  palette: string[];
  materials: string[];
  coverImage: string;
  gallery: string[];
  description: string;
  highlights: string[];
}

export interface MaterialSwatch {
  id: string;
  name: string;
  category: 'Marble & Stone' | 'Veneers & Wood' | 'Metals & Trims' | 'Fabrics & Leather';
  origin: string;
  finish: string;
  description: string;
  imageUrl: string;
}

export const interiorProjectsData: InteriorProject[] = [
  {
    id: 'sheth-avalon-sky-villa',
    title: 'The Botticino Duplex Penthouse',
    clientLocation: 'Viviana Mall Junction, Eastern Express Highway, Thane',
    society: 'Ashwin Sheth Avalon',
    carpetAreaSqFt: 2150,
    timelineDays: 45,
    style: 'Contemporary European Minimalism with Warm Brass',
    palette: ['#F8F5F1', '#1C1C1C', '#C8A96A', '#6D6A66'],
    materials: ['Italian Botticino Marble', 'Smoked French Oak Veneer', 'Brushed Champagne Brass', 'Acoustic Fluted Panels'],
    coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'A masterclass in spatial volume and restrained luxury. Featuring a double-height living pavilion, concealed floor-to-ceiling pivot doors, recessed architectural cove lighting, and custom German modular kitchen cabinetry.',
    highlights: [
      'Bookmatched Italian marble feature wall in formal dining',
      'Lutron smart ambient circadian lighting controls',
      'Walk-in wardrobe with bronze fluted glass and sensor illumination',
    ],
  },
  {
    id: 'godrej-alive-panchpakhadi',
    title: 'The Yeoor Hills Sanctuary',
    clientLocation: 'LBS Marg, Teen Hath Naka, Thane West',
    society: 'Godrej Alive',
    carpetAreaSqFt: 1420,
    timelineDays: 42,
    style: 'Organic Modernist with Biophilic Balcony Lounges',
    palette: ['#EEE6DD', '#2C3E50', '#C8A96A', '#4A5568'],
    materials: ['Statuary White Marble', 'American Walnut Joinery', 'Brushed Black Aluminum', 'Textured Travertine'],
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Designed to frame the uninterrupted views of Yeoor Hills. Includes a cantilevered wooden balcony breakfast bar, sound-isolated private study, and seamless micro-cement bathroom walls.',
    highlights: [
      'Zero-threshold sliding glass integration between living and deck',
      'Acoustic wall paneling isolating the home theater suite',
      'Custom quartz kitchen island with integrated induction hob',
    ],
  },
  {
    id: 'lodha-crown-majiwada',
    title: 'The Urban Executive Residence',
    clientLocation: 'Lodha Crown, Majiwada Junction, Thane',
    society: 'Lodha Crown',
    carpetAreaSqFt: 690,
    timelineDays: 38,
    style: 'High-Density Space Optimization with Japandi Warmth',
    palette: ['#F8F5F1', '#333333', '#C8A96A', '#E8E2DA'],
    materials: ['Glazed Vitrified Italian Tiles', 'Natural Birch Plywood', 'Matte Black Hardware', 'Linen Textiles'],
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    ],
    description:
      'Engineered for maximum usable space without sacrificing elegance. Includes hidden bed storage systems, a convertible home-office workstation, and a minimalist modular kitchen with Häfele soft-closing systems.',
    highlights: [
      'Custom wall unit with concealed study table and bar cabinet',
      'Multi-tiered ceiling with indirect anti-glare warm LED strip',
      'Anti-stain nano-coated fabric upholstery on bespoke sofa',
    ],
  },
];

export const materialSwatchesData: MaterialSwatch[] = [
  {
    id: 'swatch-botticino',
    name: 'Italian Botticino Classico Marble',
    category: 'Marble & Stone',
    origin: 'Brescia, Italy',
    finish: 'Mirror Polished with Epoxy Sealant',
    description: 'Warm ivory background with subtle golden veins, providing unmatched timeless grandeur in living rooms.',
    imageUrl: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'swatch-smoked-oak',
    name: 'Smoked French Quarter-Cut Oak',
    category: 'Veneers & Wood',
    origin: 'Burgundy, France',
    finish: 'Matte PU 5% Gloss Finish',
    description: 'Deep warm charcoal-brown graining with linear pore structure, ideal for luxury acoustic wall claddings.',
    imageUrl: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'swatch-champagne-brass',
    name: 'Brushed Champagne Brass Alloy',
    category: 'Metals & Trims',
    origin: 'Munich, Germany',
    finish: 'Electrophoretic Anti-Tarnish Coating',
    description: 'Refined warm metallic accents for profile handles, fluted divider inlays, and custom mirror frames.',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'swatch-travertine',
    name: 'Roman Silver Cross-Cut Travertine',
    category: 'Marble & Stone',
    origin: 'Tivoli, Italy',
    finish: 'Honed & Filled Velvet Texture',
    description: 'Architectural stone with characteristic linear natural cavities, creating dramatic tactile feature walls.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
];

export interface PackageTier {
  name: string;
  tagline: string;
  ratePerSqFt: number;
  features: string[];
  recommendedFor: string;
}

export const interiorPackages: PackageTier[] = [
  {
    name: 'Signature Turnkey',
    tagline: 'Refined functionality and contemporary elegance',
    ratePerSqFt: 1800,
    features: [
      'Full Modular Kitchen with Marine-Grade BWP Ply & Häfele hardware',
      'Designer Gypsum False Ceiling with Philips LED warm strip lights',
      'Custom Master Bedroom Wardrobe with floor-to-ceiling lofts',
      'Royale Luxury Emulsion Wall Paint with accent texture wall',
      'Dedicated Site Supervisor & 45-Day Handover',
    ],
    recommendedFor: '1 & 2 BHK Residences at Lodha Crown, Raymond Ten X & ACE Homes',
  },
  {
    name: 'Bespoke Luxury',
    tagline: 'High-craft Italian joinery and architectural lighting schemas',
    ratePerSqFt: 2600,
    features: [
      'Everything in Signature Turnkey +',
      'Italian Botticino / Statuary Marble flooring polishing & crystallization',
      'Smoked Natural Oak Wall Panelling with acoustic dampening',
      'Walk-in Wardrobe with Bronze tinted glass & sensor LED bars',
      'Lutron / Legrand Smart Home Automation for lighting and drapes',
      'Custom Vanity Counters with Kohler / Grohe chrome fittings',
    ],
    recommendedFor: '2 & 3 BHK Premium Units at Godrej Alive & Kalpataru Parkcity',
  },
  {
    name: 'Connoisseur Penthouse',
    tagline: 'Couture interior architecture crafted for luxury estates',
    ratePerSqFt: 3800,
    features: [
      'Everything in Bespoke Luxury +',
      'Imported Monolithic Stone Dining & Bar Countertops',
      'Concealed Flush Pivot Doors with German magnetic locks',
      'Private Home Theater Room with 7.1.4 Dolby Atmos Acoustic Paneling',
      'Motorized European Balcony Louver Decks and Outdoor Bar',
      'Direct Personal Supervision & Styling by Vijay Chawan',
    ],
    recommendedFor: 'Duplex Penthouses & Sky Villas at Sheth Avalon & Raymond Ten X',
  },
];
