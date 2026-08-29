"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { useIdleAttention } from "@/hooks/useIdleAttention";

export interface NavbarProps {
  logoText?: string;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  logoText = "REALSPACE",
  isMobileMenuOpen: controlledIsOpen,
  onToggleMobileMenu: controlledOnToggle,
}) => {
  const pathname = usePathname();
  const [internalIsOpen, setInternalIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const isIdle = useIdleAttention(5000);
  const isHome = pathname === "/";
  const isTransparentHome = isHome && !isScrolled;

  const isMobileMenuOpen = controlledIsOpen ?? internalIsOpen;
  const handleToggle =
    controlledOnToggle ?? (() => setInternalIsOpen((prev) => !prev));

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close mobile menu on route change
  React.useEffect(() => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(false);
    }
  }, [pathname, controlledIsOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Gallery", href: "/gallery" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`${isHome ? "fixed" : "sticky"} top-0 z-50 w-full transition-all duration-300 ${
        isTransparentHome
          ? "border-b border-transparent bg-transparent py-3 sm:py-4"
          : "border-b border-brand-border/60 bg-white/90 py-2 shadow-sm backdrop-blur-md sm:py-3"
      }`}
    >
      <div className="mx-auto max-w-standard px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <Image
                src="/images/realspace_logo.png"
                alt={`${logoText} logo`}
                width={300}
                height={60}
                sizes="(max-width: 640px) 160px, 180px"
                className={`w-auto transition-all duration-300 ${
                  isScrolled ? "h-12 sm:h-14" : "h-14 sm:h-16"
                }`}
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-3 py-2 text-xs lg:text-sm font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    isActive
                      ? isTransparentHome
                        ? "font-bold text-brand-yellow"
                        : "font-bold text-brand-red"
                      : isTransparentHome
                        ? "text-white/90 hover:text-brand-yellow"
                        : "text-brand-text/80 hover:text-brand-red"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className={`absolute bottom-0 left-3 right-3 h-0.5 rounded-full ${isTransparentHome ? "bg-brand-yellow" : "bg-brand-red"}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Link href="/quote" tabIndex={-1} className="relative inline-block">
                {isIdle && (
                  <motion.span
                    initial={{ scale: 1, opacity: 0.75 }}
                    animate={{ scale: 1.12, opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                    className="absolute -inset-1 rounded-lg border-2 border-brand-yellow bg-brand-yellow/20 pointer-events-none z-0"
                  />
                )}
                <Button
                  variant="primary"
                  size="sm"
                  className="relative z-10 font-semibold shadow-sm hover:shadow-md transition-shadow"
                >
                  Get Free Quote
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className={`inline-flex items-center justify-center rounded-lg p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red md:hidden ${isTransparentHome ? "text-white hover:bg-white/10" : "text-brand-text hover:bg-brand-bgAlt"}`}
              onClick={handleToggle}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.75"
                stroke="currentColor"
                aria-hidden="true"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Animated Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`overflow-hidden border-t backdrop-blur-md shadow-lg md:hidden ${isTransparentHome ? "border-white/15 bg-brand-dark/95" : "border-brand-border/60 bg-white/98"}`}
          >
            <div className="space-y-1 px-4 pb-6 pt-3 sm:px-6">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => {
                      if (controlledIsOpen === undefined) setInternalIsOpen(false);
                    }}
                    className={`block rounded-lg px-4 py-3 text-sm font-semibold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                      ? isTransparentHome
                        ? "bg-white/10 font-bold text-brand-yellow"
                        : "bg-brand-red/10 font-bold text-brand-red"
                      : isTransparentHome
                        ? "text-white hover:bg-white/10 hover:text-brand-yellow"
                        : "text-brand-text hover:bg-brand-bgAlt hover:text-brand-red"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 pb-2">
                <Link href="/quote" tabIndex={-1} className="relative block w-full">
                  {isIdle && (
                    <motion.span
                      initial={{ scale: 1, opacity: 0.75 }}
                      animate={{ scale: 1.06, opacity: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute -inset-1 rounded-lg border-2 border-brand-yellow bg-brand-yellow/20 pointer-events-none z-0"
                    />
                  )}
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full relative z-10 font-semibold text-center"
                  >
                    Get Free Quote
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
