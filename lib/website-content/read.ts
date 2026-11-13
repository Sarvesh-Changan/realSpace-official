import prisma from "@/lib/prisma";
import { websitePageDefaults, type WebsiteSectionDefault } from "./defaults";

export type WebsiteSection = WebsiteSectionDefault & { imagePublicId?: string | null; mediaAssetId?: string | null; sortOrder: number };
export type WebsitePageContent = { title: string; description: string | null; sections: WebsiteSection[] };

export async function getPublishedWebsitePage(slug: "home" | "about"): Promise<WebsitePageContent | null> {
  try {
    const page = await prisma.websitePage.findUnique({ where: { slug }, select: { title: true, description: true, isPublished: true, publishedContentJson: true } });
    if (!page?.isPublished || !page.publishedContentJson) return null;
    const parsed: unknown = JSON.parse(page.publishedContentJson);
    if (!parsed || typeof parsed !== "object") return null;
    const content = parsed as { title?: unknown; description?: unknown; sections?: unknown };
    const rawSections = Array.isArray(content.sections) ? content.sections : [];
    const sections = rawSections.flatMap((raw, index): WebsiteSection[] => {
      if (!raw || typeof raw !== "object") return [];
      const item = raw as Record<string, unknown>;
      if (typeof item.sectionKey !== "string") return [];
      return [{
        sectionKey: item.sectionKey,
        heading: typeof item.heading === "string" ? item.heading : "",
        body: typeof item.body === "string" ? item.body : "",
        buttonLabel: typeof item.buttonLabel === "string" ? item.buttonLabel : "",
        buttonUrl: typeof item.buttonUrl === "string" ? item.buttonUrl : "",
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : "",
        imageAlt: typeof item.imageAlt === "string" ? item.imageAlt : "",
        imagePublicId: typeof item.imagePublicId === "string" ? item.imagePublicId : null,
        mediaAssetId: typeof item.mediaAssetId === "string" ? item.mediaAssetId : null,
        isEnabled: item.isEnabled !== false,
        sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : index,
      }];
    });
    return { title: typeof content.title === "string" ? content.title : page.title, description: typeof content.description === "string" ? content.description : page.description, sections };
  } catch { return null; }
}

export function defaultWebsiteSections(slug: "home" | "about"): WebsiteSection[] {
  return websitePageDefaults[slug].sections.map((section, sortOrder) => ({ ...section, imagePublicId: null, mediaAssetId: null, sortOrder }));
}
