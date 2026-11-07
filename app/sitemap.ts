import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://realspace27.com";

  // Static routes and fixed locality landing pages
  const staticPaths = [
    "",
    "/projects",
    "/about",
    "/contact",
    "/faq",
    "/quote",
    "/gallery",
    "/majiwada",
    "/ghodbunder-road",
    "/kolshet-road",
    "/hiranandani-estate",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.8,
  }));

  // Fetch published projects for dynamic sitemap entries
  let projectEntries: MetadataRoute.Sitemap = [];
  try {
    const projects = await prisma.project.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });

    projectEntries = projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating project sitemap entries:", error);
  }

  return [...staticEntries, ...projectEntries];
}
