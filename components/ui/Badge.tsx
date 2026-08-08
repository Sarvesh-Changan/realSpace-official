import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors uppercase tracking-wider";

    const variants = {
      default: "bg-brand-bgAlt text-brand-text",
      accent: "bg-brand-yellow text-brand-text",
      outline: "border border-brand-bgAlt text-brand-text bg-transparent",
    };

    const classes = `${baseStyles} ${variants[variant]} ${className}`;

    return (
      <span ref={ref} className={classes} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
