import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function ProjectCta() {
  return (
    <section className="bg-brand-bgAlt rounded-2xl p-8 md:p-16 text-center my-8 md:my-16">
      <h2 className="text-3xl md:text-4xl font-bold text-brand-text mb-4">
        Ready to transform your space?
      </h2>
      <p className="text-neutral-600 max-w-2xl mx-auto mb-8 text-lg">
        Get a customized estimate for your next interior or exterior project using our interactive quote calculator.
      </p>
      <Link href="/quote">
        <Button size="lg" variant="primary">
          Calculate Your Quote
        </Button>
      </Link>
    </section>
  );
}
