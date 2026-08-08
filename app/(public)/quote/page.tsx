import QuoteCalculator from '@/app/(public)/quote/_components/quote/index';

export const metadata = {
  title: 'Get Free Quote | REALSPACE',
  description: 'Calculate your approximate interior design estimate with our interactive quote calculator.',
};

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-[#F8F5F1] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto pt-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-4">Design Estimate Calculator</h1>
          <p className="text-lg text-[#6D6A66] max-w-2xl mx-auto">
            Get an instant approximate estimate for your interior and exterior design requirements.
          </p>
        </div>

        <QuoteCalculator />
      </div>
    </main>
  );
}
