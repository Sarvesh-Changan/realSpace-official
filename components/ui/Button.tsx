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
        "bg-brand-red text-white hover:bg-brand-yellow hover:text-brand-dark shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer",
      secondary:
        "border border-brand-red text-brand-red hover:bg-brand-red hover:text-white bg-transparent hover:shadow-sm hover:scale-[1.02] transition-all duration-300 cursor-pointer",
      ghost:
        "text-brand-text hover:bg-brand-yellow/20 hover:text-brand-dark bg-transparent transition-all duration-300 cursor-pointer",
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
