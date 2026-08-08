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
    <div className="flex flex-col gap-4 md:gap-6 border-b border-neutral-200 pb-8">
      <div className="flex flex-wrap gap-2">
        <Badge variant="accent">{designType}</Badge>
        <Badge variant="outline">{category}</Badge>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-text tracking-tight">
        {title}
      </h1>
      
      <div className="flex flex-wrap gap-6 text-neutral-600 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-brand-red" />
          <span>{location}</span>
        </div>
        
        {completionYear && (
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-red" />
            <span>Completed in {completionYear}</span>
          </div>
        )}
      </div>
    </div>
  );
}
