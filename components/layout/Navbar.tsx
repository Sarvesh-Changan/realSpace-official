import * as React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";

export interface NavbarProps {
  logoText?: string;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  logoText = "REALSPACE",
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-bgAlt bg-brand-bg/95 backdrop-blur supports-[backdrop-filter]:bg-brand-bg/80 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tighter text-brand-text uppercase flex items-center gap-2 group"
            >
              <span className="w-5 h-5 bg-brand-red rounded-sm inline-block group-hover:bg-brand-yellow transition-colors" />
              {logoText}
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-brand-text/80 hover:text-brand-red transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Link href="/quote" tabIndex={-1}>
                <Button variant="primary" size="sm">
                  Get Free Quote
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            {onToggleMobileMenu && (
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-brand-text hover:bg-brand-bgAlt focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-colors"
                onClick={onToggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-brand-bgAlt bg-brand-bg">
          <div className="space-y-1 px-4 pb-6 pt-4 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block rounded-md px-3 py-3 text-base font-medium text-brand-text hover:bg-brand-bgAlt hover:text-brand-red transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 pb-2">
              <Link href="/quote" tabIndex={-1}>
                <Button variant="primary" size="md" className="w-full">
                  Get Free Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
