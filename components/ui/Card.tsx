import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", image, title, description, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-brand-bg border border-brand-bgAlt rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${className}`}
        {...props}
      >
        {image && <div className="w-full overflow-hidden bg-brand-bgAlt">{image}</div>}
        
        <div className="p-6 md:p-8">
          {title && (
            <h3 className="text-xl md:text-2xl font-semibold text-brand-text mb-3">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-brand-text/70 leading-relaxed mb-6">
              {description}
            </p>
          )}
          {children}
        </div>

        {footer && (
          <div className="px-6 md:px-8 py-5 border-t border-brand-bgAlt bg-brand-bgAlt/30">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
