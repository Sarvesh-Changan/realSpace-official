import React from "react";
import Image, { type ImageProps } from "next/image";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export interface OptimizedImageProps extends Omit<ImageProps, "src" | "alt" | "quality"> {
  src: string | null | undefined;
  alt: string; // Enforce alt requirement per CODING_STANDARDS.md §7
  crop?: string;
  quality?: number | `${number}` | "auto";
  format?: string;
  aspectRatio?: string; // e.g. "16/9", "4/3", "1/1"
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  className = "",
  crop = "limit",
  quality = "auto",
  format = "auto",
  aspectRatio,
  objectFit = "cover",
  containerClassName = "",
  unoptimized,
  ...props
}: OptimizedImageProps) {
  const transformedSrc = getCloudinaryUrl(src, {
    width: typeof width === "number" ? width : undefined,
    height: typeof height === "number" ? height : undefined,
    crop,
    quality,
    format,
  });

  const isCloudinary = typeof transformedSrc === "string" && transformedSrc.includes("res.cloudinary.com");
  const isLocal = typeof transformedSrc === "string" && transformedSrc.startsWith("/");
  const shouldSkipOptimization = unoptimized ?? (!isCloudinary && !isLocal);
  const nextImageQuality = typeof quality === "number" || (typeof quality === "string" && quality !== "auto") ? quality : undefined;

  const imageElement = (
    <Image
      src={transformedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={nextImageQuality}
      unoptimized={shouldSkipOptimization}
      className={`${fill ? `object-${objectFit}` : ""} ${className}`}
      {...props}
    />
  );

  if (aspectRatio) {
    return (
      <div
        className={`relative overflow-hidden ${containerClassName}`}
        style={{ aspectRatio }}
      >
        {imageElement}
      </div>
    );
  }

  return imageElement;
}
