import { Badge } from "@/components/ui/Badge";

interface ProjectDetailsProps {
  propertyType: "RESIDENTIAL" | "COMMERCIAL";
  carpetAreaSqFt?: number;
  servicesUsed: string[];
}

export function ProjectDetails({ propertyType, carpetAreaSqFt, servicesUsed }: ProjectDetailsProps) {
  return (
    <div className="bg-brand-bgAlt p-6 md:p-8 rounded-xl flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
            Property Type
          </h3>
          <p className="text-lg font-medium text-brand-text capitalize">
            {propertyType.toLowerCase()}
          </p>
        </div>
        
        {carpetAreaSqFt && (
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Carpet Area
            </h3>
            <p className="text-lg font-medium text-brand-text">
              {carpetAreaSqFt.toLocaleString()} sq.ft.
            </p>
          </div>
        )}
      </div>

      {servicesUsed.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
            Services Provided
          </h3>
          <div className="flex flex-wrap gap-2">
            {servicesUsed.map((service, index) => (
              <Badge key={index} variant="default" className="bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 cursor-default">
                {service}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
