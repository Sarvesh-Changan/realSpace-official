import { Badge } from "@/components/ui/Badge";
import { MapPin, Calendar } from "lucide-react";

interface ProjectHeaderProps {
  title: string;
  category: string;
  designType: "INTERIOR" | "EXTERIOR";
  location: string;
  completionYear?: number;
}

export function ProjectHeader({ title, category, designType, location, completionYear }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 border-b border-neutral-200 pb-6 sm:pb-8">
      <div className="flex flex-wrap gap-2">
        <Badge variant="accent" className="text-xs px-2.5 py-0.5">{designType}</Badge>
        <Badge variant="outline" className="text-xs px-2.5 py-0.5">{category}</Badge>
      </div>
      
      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text tracking-tight leading-tight sm:leading-tight">
        {title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-neutral-600 text-xs sm:text-sm md:text-base">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-brand-red shrink-0" />
          <span>{location}</span>
        </div>
        
        {completionYear && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-brand-red shrink-0" />
            <span>Completed in {completionYear}</span>
          </div>
        )}
      </div>
    </div>
  );
}
