import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function ProjectCta() {
  return (
    <section className="bg-brand-bgAlt rounded-2xl p-6 sm:p-10 md:p-16 text-center my-6 sm:my-10 md:my-16 border border-neutral-200/60">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-text mb-3 sm:mb-4">
        Ready to transform your space?
      </h2>
      <p className="text-neutral-600 max-w-2xl mx-auto mb-6 sm:mb-8 text-sm sm:text-base md:text-lg leading-relaxed">
        Get a customized estimate for your next interior or exterior project using our interactive quote calculator.
      </p>
      <Link href="/quote" className="inline-block w-full sm:w-auto">
        <Button size="lg" variant="primary" className="w-full sm:w-auto min-h-[48px] cursor-pointer">
          Calculate Your Quote
        </Button>
      </Link>
    </section>
  );
}
