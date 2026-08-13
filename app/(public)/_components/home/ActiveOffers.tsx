import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface OfferType {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  ctaLabel: string;
  ctaLink: string;
}

interface ActiveOffersProps {
  offers: OfferType[];
}

export function ActiveOffers({ offers }: ActiveOffersProps) {
  // Zero-offers variant: render nothing
  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-12 md:py-16 border-b border-neutral-100">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1C1C1C]">
            Special <span className="text-[#D6342C]">Offers</span>
          </h2>
          <div className="w-16 h-1 bg-[#F2B705] rounded-full mt-3"></div>
        </div>
        
        <div 
          className={`grid grid-cols-1 gap-6 ${
            offers.length === 1 
              ? 'md:grid-cols-1 max-w-md mx-auto' 
              : offers.length === 2 
              ? 'md:grid-cols-2 max-w-4xl mx-auto' 
              : 'md:grid-cols-3'
          }`}
        >
          {offers.map((offer) => (
            <div 
              key={offer.id} 
              className="flex flex-col bg-[#F8F5F1] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#E8E2DA]"
            >
              {/* Image Container */}
              <div className="relative w-full h-48 bg-[#EEE6DD]">
                <Image
                  src={offer.imageUrl || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800"}
                  alt={offer.title}
                  fill
                  className="object-cover"
                />
                {/* Accent Badge */}
                <div className="absolute top-4 left-4 bg-[#F2B705] text-[#1C1C1C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Limited Time
                </div>
              </div>
              
              {/* Content Block */}
              <div className="flex flex-col flex-grow p-6">
                <h3 className="text-xl font-bold text-[#1C1C1C] mb-2">{offer.title}</h3>
                <p className="text-[#6D6A66] mb-6 flex-grow line-clamp-3">
                  {offer.description}
                </p>
                
                {/* Prominent CTA */}
                <Link
                  href={offer.ctaLink}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D6342C] text-white font-medium rounded-md hover:bg-red-700 transition-colors mt-auto group"
                >
                  {offer.ctaLabel}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}