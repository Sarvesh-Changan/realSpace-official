import prisma from "@/lib/prisma";

export type WebsitePageData = {
  slug: string;
  title: string;
  description: string;
  sections: Array<{
    sectionKey: string;
    heading: string | null;
    body: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    buttonLabel: string | null;
    buttonUrl: string | null;
    isEnabled: boolean;
    sortOrder: number;
  }>;
};

/** Reads the shared website page records used by the RealSpace CMS. */
export async function getWebsitePage(slug: string): Promise<WebsitePageData | null> {
  if (slug !== "home" && slug !== "about") return null;
  try {
    const page = await prisma.websitePage.findUnique({
      where: { slug },
      include: { sections: { orderBy: { sortOrder: "asc" } } },
    });
    if (!page?.isPublished) return null;
    return {
      slug: page.slug,
      title: page.title,
      description: page.description ?? "",
      sections: page.sections,
    };
  } catch {
    return null;
  }
}
