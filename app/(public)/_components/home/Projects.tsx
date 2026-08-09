"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export interface ProjectType {
  id: string;
  title: string;
  location: string;
  category: string;
  imageUrl: string;
  slug?: string;
}

export interface ProjectsProps {
  title: string;
  subtitle?: string;
  projects: ProjectType[];
  viewAllLink: string;
}

export function Projects({
  title,
  subtitle,
  projects,
  viewAllLink,
}: ProjectsProps) {
  return (
    <section className="py-20 bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <SectionHeading
            title={title}
            subtitle={subtitle}
            className="mb-0 md:mb-0"
          />
          <Link href={viewAllLink} className="hidden md:block">
            <Button variant="ghost">View All Projects</Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="py-16 text-center text-brand-text/50 bg-brand-bgAlt/30 rounded-2xl border border-dashed border-brand-bgAlt">
            <p className="text-base font-medium">
              No featured projects available at the moment.
            </p>
            <p className="text-sm text-brand-text/40 mt-1">
              Check back soon to explore our latest showcase.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  href={`/projects/${project.slug || project.id}`}
                  className="block h-full"
                >
                  <Card className="h-full group cursor-pointer border-transparent hover:border-brand-bgAlt">
                    <div className="aspect-[4/3] w-full relative overflow-hidden bg-brand-bgAlt">
                      <Image
                        src={getCloudinaryUrl(project.imageUrl, { width: 800 })}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={!project.imageUrl?.includes("res.cloudinary.com")}
                      />
                      <div className="absolute top-4 left-4 z-10">
                        <Badge
                          variant="default"
                          className="bg-white/90 backdrop-blur shadow-sm"
                        >
                          {project.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-brand-red transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-brand-text/60 text-sm">
                        {project.location}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link href={viewAllLink}>
            <Button variant="secondary" className="w-full">
              View All Projects
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
