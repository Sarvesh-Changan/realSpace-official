import Image from "next/image";

interface MeetFounderProps {
  founderName: string;
  role?: string;
  bio: string;
  imageUrl: string;
}

export function MeetFounder({ founderName, role = "Founder & Principal Designer", bio, imageUrl }: MeetFounderProps) {
  return (
    <section className="py-24 bg-brand-bgAlt border-t border-neutral-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            Meet the Founder
          </h2>
        </div>
        <div className="flex flex-col md:flex-row gap-12 items-center bg-brand-bg p-8 md:p-12 rounded-3xl shadow-sm border border-neutral-100">
          <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 relative rounded-full overflow-hidden border-4 border-brand-bgAlt shadow-sm">
            <Image
              src={imageUrl}
              alt={founderName}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-brand-text">{founderName}</h3>
            <p className="text-brand-red font-medium mb-6">{role}</p>
            <p className="text-brand-text/80 leading-relaxed text-lg">
              {bio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
