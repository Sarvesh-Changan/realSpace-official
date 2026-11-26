/** Collect Cloudinary public IDs from a section data payload. */
export function collectSectionAssetPublicIds(data: unknown): string[] {
  const publicIds = new Set<string>();

  function visit(value: unknown): void {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== 'object') return;

    for (const [key, child] of Object.entries(value)) {
      if (key === 'publicId' && typeof child === 'string' && child.trim()) {
        publicIds.add(child.trim());
      } else {
        visit(child);
      }
    }
  }

  visit(data);
  return [...publicIds];
}
