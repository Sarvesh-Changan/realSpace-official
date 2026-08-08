import * as React from "react";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  showAccent?: boolean;
}

export const SectionHeading = React.forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ className = "", title, subtitle, align = "left", showAccent = true, ...props }, ref) => {
    const alignments = {
      left: "text-left items-start",
      center: "text-center items-center flex flex-col",
    };

    return (
      <div ref={ref} className={`mb-12 md:mb-16 ${alignments[align]} ${className}`} {...props}>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text tracking-tight">
          {title}
        </h2>
        
        {showAccent && (
          <div
            className={`h-1 w-16 bg-brand-yellow mt-6 rounded-full ${
              align === "center" ? "mx-auto" : ""
            }`}
          />
        )}
        
        {subtitle && (
          <p className="mt-6 text-lg md:text-xl text-brand-text/70 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    );
  }
);

SectionHeading.displayName = "SectionHeading";
