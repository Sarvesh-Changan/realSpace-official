"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getCloudinaryUrl } from "@/lib/cloudinary";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

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

export function Projects({ title, subtitle, projects, viewAllLink }: ProjectsProps) {
  // TODO: home-3 is a temporary static placeholder pending real per-project photography.
  const backgroundSrc = "/images/home/home-3.png";

  return (
    <section className="relative isolate overflow-hidden bg-brand-dark py-16 sm:py-20 md:py-24">
      <Image
        src={backgroundSrc}
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover"
        priority={false}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-black/55" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-black/45" />

      <div className="mx-auto max-w-standard px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 text-white sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <ScrollReveal direction="left" distance={28} className="text-eyebrow text-brand-yellow">
              Selected work · REALSPACE
            </ScrollReveal>
            <ScrollReveal direction="left" distance={32} delay={0.08}>
              <h2 className="mt-4 font-serif text-h2 font-semibold tracking-tight text-white">{title}</h2>
            </ScrollReveal>
            {subtitle && (
              <ScrollReveal direction="left" distance={28} delay={0.16}>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{subtitle}</p>
              </ScrollReveal>
            )}
          </div>
          <ScrollReveal direction="right" distance={28} delay={0.12}>
            <Link
              href={viewAllLink}
              className="inline-flex min-h-11 w-fit items-center gap-2 border-b border-brand-yellow pb-2 text-sm font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:text-brand-yellow"
            >
              View All Projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>
        </div>

        {projects.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/25 bg-black/30 p-8 text-center text-white/75 backdrop-blur-sm">
            <p className="text-sm font-medium">No featured projects available at the moment.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug || project.id}`}
                className={`group/project rounded-2xl border border-white/35 bg-black/35 p-3 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-brand-yellow/80 hover:bg-black/50 ${index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-24 sm:w-28">
                      <Image
                        src={getCloudinaryUrl(project.imageUrl, { width: 360 })}
                        alt={project.title}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 group-hover/project:scale-105"
                        unoptimized={project.imageUrl.includes("res.cloudinary.com")}
                      />
                    </div>
                    <div className="min-w-0 py-1">
                      <ScrollReveal direction={index === 0 ? "left" : index === projects.length - 1 ? "right" : "up"} distance={20} delay={0.06}>
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-yellow">{project.category}</p>
                      </ScrollReveal>
                      <ScrollReveal direction={index === 0 ? "left" : index === projects.length - 1 ? "right" : "up"} distance={22} delay={0.12}>
                        <h3 className="mt-2 line-clamp-2 font-serif text-lg font-semibold leading-tight text-white">{project.title}</h3>
                      </ScrollReveal>
                      <ScrollReveal direction={index === 0 ? "left" : index === projects.length - 1 ? "right" : "up"} distance={18} delay={0.18}>
                        <p className="mt-2 truncate text-sm text-white/65">{project.location}</p>
                      </ScrollReveal>
                    </div>
                  </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
