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
      primary: "btn-kunku rounded-xl font-bold cursor-pointer shadow-md hover:shadow-xl",
      secondary: "btn-halad rounded-xl font-bold cursor-pointer shadow-md hover:shadow-xl",
      ghost:
        "bg-transparent text-[#990000] border-2 border-[#990000] hover:bg-[#FECC00] hover:text-[#990000] hover:border-[#FECC00] rounded-xl font-bold cursor-pointer",
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
