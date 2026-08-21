import Image from "next/image";

interface MeetFounderProps {
  founderName: string;
  role?: string;
  bio: string;
  imageUrl: string;
}

export function MeetFounder({ founderName, role = "Founder & Principal Designer", bio, imageUrl }: MeetFounderProps) {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-brand-bgAlt border-t border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-brand-text">
            Meet the Founder
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-brand-yellow rounded-full mt-3" />
        </div>
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10 md:gap-12 items-center text-center md:text-left bg-brand-bg p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100">
          <div className="w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 shrink-0 relative rounded-full overflow-hidden border-4 border-brand-bgAlt shadow-sm">
            <Image
              src={imageUrl}
              alt={founderName}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-brand-text">{founderName}</h3>
            <p className="text-brand-red font-medium text-sm sm:text-base mb-3 sm:mb-6">{role}</p>
            <p className="text-brand-text/80 leading-relaxed text-sm sm:text-base md:text-lg">
              {bio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
