"use client";

import { motion } from "framer-motion";
import { ArrowRight, Home, Building2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function Positioning() {
  return (
    <section className="py-20 md:py-28 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text mb-6">
            Comprehensive Design Solutions
          </h2>
          <div className="h-1 w-16 bg-brand-yellow mx-auto rounded-full mb-6" />
          <p className="text-lg text-brand-text/70 max-w-2xl mx-auto">
            From the initial foundation to the final decorative touches, we transform both the inside and outside of your property.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full group hover:border-brand-red/20 transition-all">
              <div className="p-8 md:p-12">
                <div className="w-14 h-14 bg-brand-bgAlt rounded-xl flex items-center justify-center mb-8 group-hover:bg-brand-red/10 transition-colors">
                  <Home className="w-7 h-7 text-brand-red" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Interior Design</h3>
                <p className="text-brand-text/70 mb-8 leading-relaxed">
                  Bespoke interior solutions that maximize space, elevate aesthetics, and reflect your personal lifestyle. Specializing in Thane and Mumbai apartments.
                </p>
                <Link
                  href="/services/interior"
                  className="inline-flex items-center font-semibold text-brand-red hover:text-brand-red/80 transition-colors"
                >
                  Explore Interiors
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full group hover:border-brand-yellow/30 transition-all">
              <div className="p-8 md:p-12">
                <div className="w-14 h-14 bg-brand-bgAlt rounded-xl flex items-center justify-center mb-8 group-hover:bg-brand-yellow/20 transition-colors">
                  <Building2 className="w-7 h-7 text-brand-yellow" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Exterior Architecture</h3>
                <p className="text-brand-text/70 mb-8 leading-relaxed">
                  Striking facade designs and exterior renovations that enhance curb appeal and structural integrity for residential and commercial properties.
                </p>
                <Link
                  href="/services/exterior"
                  className="inline-flex items-center font-semibold text-brand-text hover:text-brand-yellow transition-colors"
                >
                  Explore Exteriors
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
