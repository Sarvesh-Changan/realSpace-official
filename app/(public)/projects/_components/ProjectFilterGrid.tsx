"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
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

  const resetFilters = () => {
    setSelectedDesignType("ALL");
    setSelectedPropertyType("ALL");
    setSelectedCategory("ALL");
  };

  return (
    <div className="pb-16 sm:pb-24">
      {/* Header Section */}
      <section className="bg-brand-bg pt-20 sm:pt-28 pb-8 sm:pb-12 border-b border-brand-bgAlt/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Our Portfolio"
            subtitle="Explore our curated interior & exterior design projects across Thane & Mumbai."
            align="left"
          />

          {/* Filter Controls */}
          <div className="mt-6 sm:mt-8 flex flex-col gap-4 sm:gap-6">
            {/* Design Type Tabs - Scrollable on small screens */}
            <div className="flex items-center gap-2 border-b border-brand-bgAlt pb-3 sm:pb-4 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-text/50 mr-1 shrink-0">
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
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-colors shrink-0 min-h-[38px] cursor-pointer ${
                    selectedDesignType === tab.value
                      ? "bg-brand-red text-white shadow-sm"
                      : "bg-brand-bgAlt/60 text-brand-text/70 hover:bg-brand-bgAlt hover:text-brand-text"
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
                    className="w-full sm:w-auto rounded-lg border border-brand-bgAlt bg-brand-bg px-3 py-2 min-h-[44px] text-xs sm:text-sm font-medium text-brand-text shadow-sm focus:border-brand-red focus:outline-none cursor-pointer"
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
                    className="w-full sm:w-auto rounded-lg border border-brand-bgAlt bg-brand-bg px-3 py-2 min-h-[44px] text-xs sm:text-sm font-medium text-brand-text shadow-sm focus:border-brand-red focus:outline-none cursor-pointer"
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
                <span className="text-xs text-brand-text/50 font-medium">
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
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
                    <Card className="h-full group cursor-pointer border border-brand-bgAlt hover:border-brand-text/20 transition-all">
                      <div className="aspect-[4/3] w-full relative overflow-hidden bg-brand-bgAlt">
                        <Image
                          src={getCloudinaryUrl(project.coverImageUrl, { width: 800 })}
                          alt={project.altText || project.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized={!project.coverImageUrl?.includes("res.cloudinary.com")}
                        />
                        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 z-10">
                          <Badge
                            variant="default"
                            className="bg-white/95 backdrop-blur shadow-sm text-brand-text font-semibold text-xs"
                          >
                            {formatCategoryLabel(project.category)}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-brand-text/50 font-medium mb-1.5 uppercase tracking-wider">
                          <span>{project.designType}</span>
                          <span>{project.propertyType}</span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 group-hover:text-brand-red transition-colors text-brand-text line-clamp-2">
                          {project.title}
                        </h3>
                        <p className="text-brand-text/60 text-xs sm:text-sm mb-3">
                          {project.location}
                        </p>
                        {project.carpetAreaSqFt && (
                          <div className="text-xs font-semibold text-brand-text/70 pt-2.5 border-t border-brand-bgAlt">
                            Area: {project.carpetAreaSqFt.toLocaleString()} sq.ft
                          </div>
                        )}
                      </div>
                    </Card>
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
