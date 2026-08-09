/**
 * Helper to get Cloudinary-optimized responsive transformation URLs or fallback URLs.
 */
export function getCloudinaryUrl(
  urlOrPublicId: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  if (!urlOrPublicId) {
    return "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800";
  }

  const { width, height, crop = "limit", quality = "auto", format = "auto" } = options;

  // If it's a full Cloudinary URL
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    if (urlOrPublicId.includes("/upload/f_auto") || urlOrPublicId.includes("/upload/q_auto")) {
      return urlOrPublicId;
    }
    const transformParts = [`f_${format}`, `q_${quality}`];
    if (crop) transformParts.push(`c_${crop}`);
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    const transformString = transformParts.join(",");

    return urlOrPublicId.replace("/upload/", `/upload/${transformString}/`);
  }

  // If it's a public_id (not starting with http/https)
  if (!urlOrPublicId.startsWith("http://") && !urlOrPublicId.startsWith("https://")) {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME ||
      "dipeupebc";

    const transformParts = [`f_${format}`, `q_${quality}`];
    if (crop) transformParts.push(`c_${crop}`);
    if (width) transformParts.push(`w_${width}`);
    if (height) transformParts.push(`h_${height}`);
    const transformString = transformParts.join(",");

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${urlOrPublicId}`;
  }

  // Fallback for non-Cloudinary external URLs (e.g. Unsplash)
  return urlOrPublicId;
}
