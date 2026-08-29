import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-brand-red text-brand-yellow border-2 border-brand-red hover:bg-brand-yellow hover:text-brand-red hover:border-brand-yellow shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer font-bold",
      secondary:
        "bg-brand-yellow text-brand-red border-2 border-brand-yellow hover:bg-brand-red hover:text-brand-yellow hover:border-brand-red shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer font-bold",
      ghost:
        "bg-transparent text-brand-red border-2 border-brand-red hover:bg-brand-yellow hover:text-brand-red hover:border-brand-yellow shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer font-bold",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-8 text-base",
      lg: "h-14 px-10 text-lg",
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
