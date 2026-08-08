import Image from "next/image";
import { ProjectImage } from "../page";

export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  if (!images || images.length === 0) return null;

  const mainImage = images[0];
  const thumbnails = images.slice(1);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden bg-neutral-100">
        <Image
          src={mainImage.url}
          alt={mainImage.altText}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      
      {thumbnails.length > 0 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-4">
          {thumbnails.map((img) => (
            <div key={img.id} className="relative w-full aspect-square md:aspect-video rounded-lg overflow-hidden bg-neutral-100">
              <Image
                src={img.url}
                alt={img.altText}
                fill
                className="object-cover transition-opacity hover:opacity-80 cursor-pointer"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
