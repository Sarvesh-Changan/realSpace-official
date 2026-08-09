import Image from "next/image";
import { ProjectImage } from "../page";
import { getCloudinaryUrl } from "@/lib/cloudinary";

export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const thumbnails = images.slice(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden bg-neutral-100">
        <Image
          src={getCloudinaryUrl(mainImage.url, { width: 1600 })}
          alt={mainImage.altText}
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover"
          unoptimized={!mainImage.url?.includes("res.cloudinary.com")}
        />
      </div>

      {thumbnails.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
          {thumbnails.map((img) => (
            <div key={img.id} className="relative w-full aspect-square md:aspect-video rounded-lg overflow-hidden bg-neutral-100">
              <Image
                src={getCloudinaryUrl(img.url, { width: 400 })}
                alt={img.altText}
                fill
                sizes="(max-width: 768px) 25vw, 16vw"
                className="object-cover transition-opacity hover:opacity-80 cursor-pointer"
                unoptimized={!img.url?.includes("res.cloudinary.com")}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
