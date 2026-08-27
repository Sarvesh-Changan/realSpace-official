"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCloudinaryUrl } from "@/lib/cloudinary";

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

  const interiorCount = projects.filter((project) => project.designType === "INTERIOR").length;
  const exteriorCount = projects.filter((project) => project.designType === "EXTERIOR").length;

  const resetFilters = () => {
    setSelectedDesignType("ALL");
    setSelectedPropertyType("ALL");
    setSelectedCategory("ALL");
  };

  return (
    <div className="pb-16 sm:pb-24">
      {/* Editorial portfolio masthead */}
      <section className="relative overflow-hidden bg-brand-cream pt-24 pb-10 sm:pt-32 sm:pb-14 lg:pt-40">
        <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full border border-brand-yellow/30 sm:h-96 sm:w-96" />
        <div className="pointer-events-none absolute -right-8 top-28 h-40 w-40 rounded-full border border-brand-red/10 sm:h-60 sm:w-60" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-4xl">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.32em] text-brand-red sm:text-xs">
              Selected work · Est. 1989
            </p>
            <h1 className="max-w-3xl font-serif text-4xl font-bold leading-[0.98] tracking-tight text-brand-text sm:text-6xl lg:text-7xl">
              Spaces with a point of view.
            </h1>
            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-sm leading-7 text-brand-muted sm:text-base">
                Explore our curated interior and exterior design projects across Thane, Mumbai, and Navi Mumbai—each shaped around the people who live and work there.
              </p>
              <Link
                href="/contact"
                className="group inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-text transition-colors hover:text-brand-red"
              >
                Start a project
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-brand-text/15 pt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-text/55 sm:mt-12">
              <span>{projects.length} projects</span>
              <span>{interiorCount} interiors</span>
              <span>{exteriorCount} exteriors</span>
              <span>Residential · Commercial · Turnkey</span>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mt-12 flex flex-col gap-5 border-t border-brand-text/15 pt-5 sm:mt-16 sm:gap-6">
            {/* Design Type Tabs - Scrollable on small screens */}
            <div className="flex items-center gap-5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <span className="mr-1 shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text/45">
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
                    className={`relative shrink-0 min-h-[38px] px-0 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                      selectedDesignType === tab.value
                        ? "text-brand-red after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-brand-red"
                        : "text-brand-text/60 hover:text-brand-text"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Secondary Filters: Property Type & Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Property Type Dropdown */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="propertyType"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text/50 shrink-0 min-w-[70px] sm:min-w-0"
                  >
                    Property:
                  </label>
                  <select
                    id="propertyType"
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="w-full sm:w-auto min-h-[44px] rounded-none border-0 border-b border-brand-text/20 bg-transparent px-0 py-2 text-xs font-medium text-brand-text focus:border-brand-red focus:outline-none cursor-pointer"
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
                    className="text-xs font-bold uppercase tracking-wider text-brand-text/50 shrink-0 min-w-[70px] sm:min-w-0"
                  >
                    Category:
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto min-h-[44px] rounded-none border-0 border-b border-brand-text/20 bg-transparent px-0 py-2 text-xs font-medium text-brand-text focus:border-brand-red focus:outline-none cursor-pointer"
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
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-brand-bgAlt sm:border-t-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-text/50">
                  Showing {filteredProjects.length} of {projects.length}
                </span>
                {(selectedDesignType !== "ALL" ||
                  selectedPropertyType !== "ALL" ||
                  selectedCategory !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs text-brand-red hover:bg-brand-red/10 h-8 px-2.5 cursor-pointer"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-16 lg:px-8">
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
                      <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-bgAlt">
                        <Image
                          src={getCloudinaryUrl(project.coverImageUrl, { width: 800 })}
                          alt={project.altText || project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                          unoptimized={!project.coverImageUrl?.includes("res.cloudinary.com")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/65 via-brand-dark/5 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-100" />
                        <div className="absolute inset-x-5 bottom-5 flex translate-y-2 items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                          <span>View project</span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70">
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                      <div className="pt-5 sm:pt-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-text/50 sm:text-[11px]">
                          <span className="text-brand-red">{formatCategoryLabel(project.category)}</span>
                          <span>{project.designType} · {project.propertyType}</span>
                        </div>
                        <h3 className="mt-4 line-clamp-2 font-serif text-2xl font-bold leading-tight text-brand-text transition-colors group-hover:text-brand-red sm:text-3xl">
                          {project.title}
                        </h3>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-brand-border pt-3 text-xs font-medium text-brand-text/60 sm:text-sm">
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
