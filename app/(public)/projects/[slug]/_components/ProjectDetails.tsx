import { Badge } from "@/components/ui/Badge";

interface ProjectDetailsProps {
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  carpetAreaSqFt?: number;
  servicesUsed: string[];
}

export function ProjectDetails({ propertyType, carpetAreaSqFt, servicesUsed }: ProjectDetailsProps) {
  return (
    <div className="bg-brand-bgAlt p-5 sm:p-6 md:p-8 rounded-xl border border-neutral-200/50 flex flex-col gap-6 sm:gap-8">
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h3 className="text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 sm:mb-2">
            Property Type
          </h3>
          <p className="text-base sm:text-lg font-medium text-brand-text capitalize">
            {propertyType.toLowerCase()}
          </p>
        </div>
        
        {carpetAreaSqFt && (
          <div>
            <h3 className="text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 sm:mb-2">
              Carpet Area
            </h3>
            <p className="text-base sm:text-lg font-medium text-brand-text">
              {carpetAreaSqFt.toLocaleString()} sq.ft.
            </p>
          </div>
        )}
      </div>

      {servicesUsed.length > 0 && (
        <div>
          <h3 className="text-[11px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2.5 sm:mb-4">
            Services Provided
          </h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {servicesUsed.map((service, index) => (
              <Badge key={index} variant="default" className="bg-white border border-neutral-200 text-neutral-700 text-xs px-2.5 py-1 font-normal max-w-full cursor-default">
                {service}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
