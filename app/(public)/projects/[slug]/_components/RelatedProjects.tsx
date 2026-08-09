import Link from "next/link";
import Image from "next/image";
import { RelatedProjectData } from "../page";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export function RelatedProjects({ projects }: { projects: RelatedProjectData[] }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-16 md:py-24 border-t border-neutral-200 mt-12 md:mt-24">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-brand-text">Related Projects</h2>
        <Link 
          href="/projects"
          className="text-brand-red font-medium hover:underline hidden md:block"
        >
          View all projects →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-neutral-100 mb-4">
              <Image
                src={getCloudinaryUrl(project.imageUrl, { width: 600 })}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={!project.imageUrl?.includes("res.cloudinary.com")}
              />
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-brand-text text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                  {project.category}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-brand-text group-hover:text-brand-red transition-colors">
              {project.title}
            </h3>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 text-center md:hidden">
        <Link 
          href="/projects"
          className="text-brand-red font-medium hover:underline"
        >
          View all projects →
        </Link>
      </div>
    </section>
  );
}
