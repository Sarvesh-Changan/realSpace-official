import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="font-heading text-6xl font-bold text-[#C8A96A] mb-3">404</div>
      <h2 className="font-heading text-2xl font-bold text-[#1C1C1C] mb-2">
        Property or Page Not Found
      </h2>
      <p className="text-xs sm:text-sm text-[#6D6A66] max-w-md mb-6 leading-relaxed">
        The requested page or listing is unavailable or has moved. Explore our active properties or connect directly with our advisory desk.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#1C1C1C] text-white hover:bg-[#C8A96A] hover:text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/properties"
          className="px-5 py-2.5 bg-[#C8A96A] text-[#1C1C1C] text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    </div>
  );
}
