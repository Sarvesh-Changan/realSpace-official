import type { Metadata } from "next";
import { getSiteSettings, constructMetadata } from "@/lib/seo";
import QuoteCalculator from "@/app/(public)/quote/_components/quote/index";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const companyName = settings?.companyName || "REALSPACE";

  return constructMetadata({
    title: `Get Instant Quote & Cost Estimator | ${companyName}`,
    description: `Calculate your approximate interior and exterior design estimate with our interactive quote calculator for homes and offices in Thane.`,
    path: "/quote",
  });
}

export default function QuotePage() {
  return (
    <main className="min-h-screen bg-[#F8F5F1] py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 pb-12 sm:pb-16">
      <div className="max-w-7xl mx-auto pt-2 sm:pt-6 md:pt-10">
        <div className="text-center mb-6 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-[#1C1C1C] mb-2 sm:mb-4">
            Design Estimate Calculator
          </h1>
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-[#6D6A66] flex items-center justify-center gap-1.5 px-4">
            <span className="font-medium text-[#1C1C1C]">* Note:</span>
            <span>These estimated prices are applicable for  <u>Thane, Mumbai, and Navi Mumbai</u> regions only.</span>
          </div>
        </div>

        <QuoteCalculator />
      </div>
    </main>
  );
}
