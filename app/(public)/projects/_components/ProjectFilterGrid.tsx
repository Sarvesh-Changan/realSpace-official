"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export interface ProjectCardData {
  id: string;
  title: string;
  slug: string;
  designType: "INTERIOR" | "EXTERIOR";
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  category: string;
  location: string;
  description: string;
  carpetAreaSqFt?: number | null;
  completionYear?: number | null;
  coverImageUrl?: string;
  altText?: string;
}

interface ProjectFilterGridProps {
  projects: ProjectCardData[];
}

function formatCategoryLabel(cat: string): string {
  return cat
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function ProjectFilterContent({ projects }: ProjectFilterGridProps) {
  const searchParams = useSearchParams();
  const initialTypeParam = searchParams.get("type")?.toUpperCase();

  const [selectedDesignType, setSelectedDesignType] = useState<string>(
    initialTypeParam === "INTERIOR" || initialTypeParam === "EXTERIOR"
      ? initialTypeParam
      : "ALL"
  );
  const [selectedPropertyType, setSelectedPropertyType] =
    useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Derive unique categories available in the dataset
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [projects]);

  // Filter projects based on current selections
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (
        selectedDesignType !== "ALL" &&
        project.designType !== selectedDesignType
      ) {
        return false;
      }
      if (
        selectedPropertyType !== "ALL" &&
        project.propertyType !== selectedPropertyType
      ) {
        return false;
      }
      if (
        selectedCategory !== "ALL" &&
        project.category !== selectedCategory
      ) {
        return false;
      }
      return true;
    });
  }, [projects, selectedDesignType, selectedPropertyType, selectedCategory]);

  const resetFilters = () => {
    setSelectedDesignType("ALL");
    setSelectedPropertyType("ALL");
    setSelectedCategory("ALL");
  };

  return (
    <div className="pb-16 sm:pb-24">
      {/* Editorial portfolio masthead */}
      <section className="relative isolate min-h-[360px] overflow-hidden bg-brand-dark sm:min-h-[430px]">
        <Image
          src="/images/project/project-1.png"
          alt="A REALSPACE architectural design project"
          fill
          priority
          sizes="100vw"
          quality={70}
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-black/25" />
        <div className="mx-auto flex min-h-[360px] max-w-7xl items-center px-4 pb-12 pt-28 sm:min-h-[430px] sm:px-6 sm:pb-16 lg:px-8">
          <div className="relative max-w-4xl text-white">
            <ScrollReveal direction="left" distance={36} delay={0.09}>
              <h1 className="mt-4 max-w-3xl font-serif text-display font-semibold leading-[0.98] tracking-tight text-white">
                OUR PORTFOLIO
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="left" distance={28} delay={0.18}>
              <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <Link
                href="/contact"
                className="group inline-flex shrink-0 items-center gap-2 text-lg font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-brand-yellow"
              >
                Start a project
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filter Controls */}
        <div className="flex flex-col gap-4 rounded-2xl border border-brand-text/10 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:gap-5 sm:p-5">
            {/* Design Type Tabs - Scrollable on small screens */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
              <span className="mr-2 shrink-0 text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-text/60">
                Type:
              </span>
              {[
                { label: "All Projects", value: "ALL" },
                { label: "Interiors", value: "INTERIOR" },
                { label: "Exteriors", value: "EXTERIOR" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedDesignType(tab.value)}
                  className={`shrink-0 rounded-full px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    selectedDesignType === tab.value
                      ? "btn-kunku shadow-md scale-[1.02]"
                      : "bg-transparent text-brand-text/70 hover:text-brand-red hover:bg-brand-cream/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Secondary Filters: Property Type & Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto">
                {/* Property Type Dropdown */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="propertyType"
                    className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-text/60 shrink-0"
                  >
                    Property:
                  </label>
                  <select
                    id="propertyType"
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="min-h-[36px] rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-brand-text focus:border-brand-red focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="ALL">All Properties</option>
                    <option value="RESIDENTIAL">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="category"
                    className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-text/60 shrink-0"
                  >
                    Category:
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="min-h-[36px] rounded-lg border border-brand-border bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-brand-text focus:border-brand-red focus:outline-none cursor-pointer shadow-xs"
                  >
                    <option value="ALL">All Categories</option>
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {formatCategoryLabel(cat)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset & Active Filter Count */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-brand-border/40 sm:border-t-0">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-text/60">
                  Showing {filteredProjects.length} of {projects.length}
                </span>
                {(selectedDesignType !== "ALL" ||
                  selectedPropertyType !== "ALL" ||
                  selectedCategory !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs font-bold text-brand-red hover:bg-brand-red/10 h-9 px-3 cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Projects Grid */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        {filteredProjects.length === 0 ? (
          <div className="py-12 sm:py-20 text-center bg-brand-bgAlt/30 rounded-2xl sm:rounded-3xl border border-dashed border-brand-bgAlt max-w-2xl mx-auto px-4 sm:px-6">
            <h3 className="text-lg sm:text-xl font-bold text-brand-text mb-2">
              No projects found
            </h3>
            <p className="text-brand-text/60 text-xs sm:text-sm mb-6 max-w-md mx-auto">
              We couldn't find any projects matching your current filter selections. Try clearing your filters to view all projects.
            </p>
            <Button variant="secondary" onClick={resetFilters} className="min-h-[44px]">
              Reset Filters
            </Button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20"
          >
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link href={`/projects/${project.slug}`} className="block h-full">
                    <article className="group h-full cursor-pointer">
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-bgAlt">
                        <Image
                          src={getCloudinaryUrl(project.coverImageUrl, { width: 800 })}
                          alt={project.altText || project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/65 via-brand-dark/5 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-x-5 bottom-5 flex translate-y-2 items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <span>View project</span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 sm:pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text/50 sm:text-[11px]">
                          <span className="text-brand-red">{formatCategoryLabel(project.category)}</span>
                          <span>{project.designType} · {project.propertyType}</span>
                        </div>
                        <h3 className="mt-2 line-clamp-2 font-serif text-xl font-bold leading-tight text-brand-text transition-colors group-hover:text-brand-red sm:text-2xl">
                          {project.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-brand-border pt-2 text-xs font-medium text-brand-text/60 sm:text-sm">
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-red" />{project.location}</span>
                          {project.completionYear && <span>{project.completionYear}</span>}
                          {project.carpetAreaSqFt && <span>{project.carpetAreaSqFt.toLocaleString()} sq.ft</span>}
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}

export function ProjectFilterGrid({ projects }: ProjectFilterGridProps) {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-brand-text/50">
          Loading portfolio...
        </div>
      }
    >
      <ProjectFilterContent projects={projects} />
    </Suspense>
  );
}
