"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
    <div className="pb-24">
      {/* Header Section */}
      <section className="bg-brand-bg pt-28 pb-12 border-b border-brand-bgAlt/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Our Portfolio"
            subtitle="Explore our curated interior & exterior design projects across Thane & Mumbai."
            align="left"
          />

          {/* Filter Controls */}
          <div className="mt-8 flex flex-col gap-6">
            {/* Design Type Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-brand-bgAlt pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-text/50 mr-2">
                Type:
              </span>
              {[
                { label: "All Projects", value: "ALL" },
                { label: "Interiors", value: "INTERIOR" },
                { label: "Exteriors", value: "EXTERIOR" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSelectedDesignType(tab.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Property Type Dropdown */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="propertyType"
                    className="text-xs font-bold uppercase tracking-wider text-brand-text/50"
                  >
                    Property:
                  </label>
                  <select
                    id="propertyType"
                    value={selectedPropertyType}
                    onChange={(e) => setSelectedPropertyType(e.target.value)}
                    className="rounded-md border border-brand-bgAlt bg-brand-bg px-3 py-1.5 text-sm font-medium text-brand-text shadow-sm focus:border-brand-red focus:outline-none"
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
                    className="text-xs font-bold uppercase tracking-wider text-brand-text/50"
                  >
                    Category:
                  </label>
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-md border border-brand-bgAlt bg-brand-bg px-3 py-1.5 text-sm font-medium text-brand-text shadow-sm focus:border-brand-red focus:outline-none"
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
              <div className="flex items-center gap-3">
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
                    className="text-xs text-brand-red hover:bg-brand-red/10 h-8 px-3"
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center bg-brand-bgAlt/30 rounded-3xl border border-dashed border-brand-bgAlt max-w-2xl mx-auto px-6">
            <h3 className="text-xl font-bold text-brand-text mb-2">
              No projects found
            </h3>
            <p className="text-brand-text/60 text-sm mb-6 max-w-md mx-auto">
              We couldn't find any projects matching your current filter selections. Try clearing your filters to view all projects.
            </p>
            <Button variant="secondary" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                          style={{
                            backgroundImage: `url(${
                              project.coverImageUrl ||
                              "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800"
                            })`,
                          }}
                        />
                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                          <Badge
                            variant="default"
                            className="bg-white/95 backdrop-blur shadow-sm text-brand-text font-semibold"
                          >
                            {formatCategoryLabel(project.category)}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between text-xs text-brand-text/50 font-medium mb-2 uppercase tracking-wider">
                          <span>{project.designType}</span>
                          <span>{project.propertyType}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-brand-red transition-colors text-brand-text">
                          {project.title}
                        </h3>
                        <p className="text-brand-text/60 text-sm mb-4">
                          {project.location}
                        </p>
                        {project.carpetAreaSqFt && (
                          <div className="text-xs font-semibold text-brand-text/70 pt-3 border-t border-brand-bgAlt">
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
