// TEMPORARY SAMPLE DATA — removed in step D

export interface ReraSampleGalleryItem {
  id: string;
  category: 'RESIDENTIAL' | 'COMMERCIAL' | 'ONGOING' | 'HANDOVER' | 'OTHER';
  mediaType: 'IMAGE' | 'VIDEO';
  url: string;
  thumbnailUrl?: string;
  alt: string;
  caption?: string;
}

export const sampleGalleryItems: ReraSampleGalleryItem[] = [
  {
    id: 'g-1',
    category: 'RESIDENTIAL',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    alt: 'Luxury 3 BHK apartment living room in Thane',
    caption: 'Luxury 3 BHK — Ghodbunder Road, Thane',
  },
  {
    id: 'g-2',
    category: 'RESIDENTIAL',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    alt: 'Premium residential villa exterior',
    caption: 'Premium Villa — Pokhran Road',
  },
  {
    id: 'g-3',
    category: 'RESIDENTIAL',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
    alt: 'Modern 2 BHK apartment interior',
    caption: 'Modern 2 BHK — Majiwada',
  },
  {
    id: 'g-4',
    category: 'COMMERCIAL',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    alt: 'Contemporary office space interior',
    caption: 'Corporate Office — Wagle Estate',
  },
  {
    id: 'g-5',
    category: 'COMMERCIAL',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    alt: 'Commercial IT park building exterior',
    caption: 'IT Park — Kolshet Road',
  },
  {
    id: 'g-6',
    category: 'ONGOING',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    alt: 'Under-construction residential towers',
    caption: 'Ongoing — Premium Towers, Kasarvadavli',
  },
  {
    id: 'g-7',
    category: 'ONGOING',
    mediaType: 'VIDEO',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
    alt: 'Site walkthrough — ongoing residential project',
    caption: 'Site Walkthrough — Teen Hath Naka Project',
  },
  {
    id: 'g-8',
    category: 'HANDOVER',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    alt: 'Key handover ceremony — happy family',
    caption: 'Handover — Sharma Family, Majiwada',
  },
  {
    id: 'g-9',
    category: 'HANDOVER',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    alt: 'Ready-to-move apartment handover',
    caption: 'Handover — 3 BHK, Ghodbunder Road',
  },
  {
    id: 'g-10',
    category: 'HANDOVER',
    mediaType: 'VIDEO',
    url: 'https://www.w3schools.com/html/movie.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    alt: 'Client testimonial video — handover day',
    caption: 'Client Testimonial — Handover Day',
  },
  {
    id: 'g-11',
    category: 'RESIDENTIAL',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&q=80',
    alt: 'Luxury penthouse terrace view',
    caption: 'Luxury Penthouse — Teen Hath Naka',
  },
  {
    id: 'g-12',
    category: 'COMMERCIAL',
    mediaType: 'IMAGE',
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
    alt: 'Modern retail showroom interior',
    caption: 'Showroom — Wagle Estate',
  },
];

