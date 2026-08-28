import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

// Updated SVG Brand Icons matching exact official designs & color schemes
const BrandInstagramIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="footer-ig-grad" cx="30%" cy="107%" r="130%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="100%" stopColor="#285AEB" />
      </radialGradient>
      <linearGradient id="footer-ig-shine" x1="4" y1="3" x2="19" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity="0.28" />
        <stop offset="0.42" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <filter id="footer-ig-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
    <rect width="24" height="24" rx="6.5" fill="url(#footer-ig-grad)" filter="url(#footer-ig-shadow)" />
    <rect width="24" height="24" rx="6.5" fill="url(#footer-ig-shine)" />
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="#FFFFFF" />
  </svg>
);

const BrandFacebookIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="footer-facebook-grad" x1="7" y1="2" x2="17" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#42A5F5" />
        <stop offset="0.5" stopColor="#0866FF" />
        <stop offset="1" stopColor="#0052CC" />
      </linearGradient>
      <filter id="footer-facebook-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
    <circle cx="12" cy="12" r="12" fill="url(#footer-facebook-grad)" filter="url(#footer-facebook-shadow)" />
    <path
      d="M13.5 21V12.75H16.25L16.7 9.5H13.5V7.5C13.5 6.6 13.8 6 15.1 6H16.8V3.15C16.5 3.1 15.5 3 14.3 3C11.8 3 10.1 4.5 10.1 7.3V9.5H7.3V12.75H10.1V21H13.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

const BrandYoutubeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="footer-youtube-grad" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FF4B55" />
        <stop offset="0.5" stopColor="#FF0000" />
        <stop offset="1" stopColor="#D90000" />
      </linearGradient>
      <filter id="footer-youtube-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
    <rect x="1" y="4" width="22" height="16" rx="4.5" fill="url(#footer-youtube-grad)" filter="url(#footer-youtube-shadow)" />
    <path d="M9.75 8.25L15.75 12L9.75 15.75V8.25Z" fill="#FFFFFF" />
  </svg>
);

const BrandLinkedinIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="footer-linkedin-grad" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#35A7E8" />
        <stop offset="0.5" stopColor="#0A66C2" />
        <stop offset="1" stopColor="#004182" />
      </linearGradient>
      <filter id="footer-linkedin-shadow" x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="1.2" stdDeviation="0.9" floodColor="#000000" floodOpacity="0.4" />
      </filter>
    </defs>
    <rect width="24" height="24" rx="4.5" fill="url(#footer-linkedin-grad)" filter="url(#footer-linkedin-shadow)" />
    <path
      d="M5.2 8.8H8.3V18.8H5.2V8.8ZM6.75 5.2C5.75 5.2 5 5.95 5 6.95C5 7.95 5.75 8.7 6.75 8.7C7.75 8.7 8.5 7.95 8.5 6.95C8.5 5.95 7.75 5.2 6.75 5.2ZM15.8 8.8C14.1 8.8 13.3 9.7 12.9 10.3V8.8H9.8V18.8H12.9V13.6C12.9 12.2 13.2 11.2 14.8 11.2C16.4 11.2 16.4 12.7 16.4 13.7V18.8H19.5V13.1C19.5 10.3 18.9 8.8 15.8 8.8Z"
      fill="#FFFFFF"
    />
  </svg>
);

export interface SocialLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  linkedinUrl?: string | null;
}

export interface FooterProps {
  socialLinks?: SocialLinks | null;
}

export async function Footer({ socialLinks: propSocialLinks }: FooterProps = {}) {
  let socialLinks = propSocialLinks;

  if (socialLinks === undefined) {
    try {
      const settings = await prisma.siteSettings.findUnique({
        where: { id: "singleton" },
        select: { socialLinks: true },
      });
      socialLinks = (settings?.socialLinks as SocialLinks) ?? null;
    } catch (error) {
      console.error("Error fetching socialLinks in Footer:", error);
      socialLinks = null;
    }
  }

  const instagram = socialLinks?.instagram?.trim();
  const facebook = socialLinks?.facebook?.trim();
  const youtube = socialLinks?.youtube?.trim();
  const linkedin = (socialLinks?.linkedin || socialLinks?.linkedinUrl)?.trim();

  const socialPlatforms = [
    {
      name: "Instagram",
      url: instagram,
      Icon: BrandInstagramIcon,
    },
    {
      name: "Facebook",
      url: facebook,
      Icon: BrandFacebookIcon,
    },
    {
      name: "YouTube",
      url: youtube,
      Icon: BrandYoutubeIcon,
    },
    {
      name: "LinkedIn",
      url: linkedin,
      Icon: BrandLinkedinIcon,
    },
  ].filter((platform) => Boolean(platform.url && platform.url.length > 0));

  return (
    <footer className="bg-brand-dark text-neutral-300 border-t border-white/10 pt-16 pb-10 sm:pt-20 sm:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">

          {/* Company Info */}
          <div className="space-y-6 text-center sm:text-left">
            <Link href="/" className="mx-auto flex w-fit">
              <Image
                src="/images/realspace_logo.png"
                alt="REALSPACE logo"
                width={300}
                height={60}
                sizes="(max-width: 640px) 123px, 154px"
                className="h-16 sm:h-20 w-auto filter brightness-110"
                style={{ width: "auto" }}
              />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-brand-yellow">
              Quick Links
            </h4>
            <ul className="space-y-3.5">
              {["Projects", "About", "FAQ", "Contact", "Get Free Quote"].map((link) => {
                const href = link === "Get Free Quote" ? "/quote" : `/${link.toLowerCase()}`;
                return (
                  <li key={link}>
                    <Link
                      href={href}
                      className="text-sm text-neutral-300 hover:text-brand-yellow transition-all duration-200 inline-block hover:translate-x-1"
                    >
                      {link}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Services */}
          <div className="text-center sm:text-left">
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-brand-yellow">
              Services
            </h4>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/services/interior"
                  className="text-sm text-neutral-300 hover:text-brand-yellow transition-all duration-200 inline-block hover:translate-x-1"
                >
                  Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/exterior"
                  className="text-sm text-neutral-300 hover:text-brand-yellow transition-all duration-200 inline-block hover:translate-x-1"
                >
                  Exterior & Elevation
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-sm text-neutral-300 hover:text-brand-yellow transition-all duration-200 inline-block hover:translate-x-1"
                >
                  View All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-brand-yellow">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm text-neutral-300 max-w-sm mx-auto sm:mx-0">
              <li className="flex items-start justify-center gap-3 sm:justify-start">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-brand-red shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <span className="leading-relaxed text-neutral-400 text-left">
                  Raymond Realty Jekegram<br />
                  Pokhran Road No 1<br />
                  Thane (w), Maharashtra, India - 400606
                </span>
              </li>
              <li className="flex items-center justify-center gap-3 sm:justify-start">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-brand-red shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <span className="text-neutral-300 font-medium">+91 98692 11777</span>
              </li>
              <li className="flex items-center justify-center gap-3 sm:justify-start">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-brand-red shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <span className="text-neutral-300 font-medium">realspace.org@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-xs text-neutral-400 text-center md:text-left">
            &copy; {new Date().getFullYear()} REALSPACE Interiors. All rights reserved.
          </p>
          {socialPlatforms.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {socialPlatforms.map(({ name, url, Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform duration-200 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                  aria-label={name}
                >
                  <span className="sr-only">{name}</span>
                  <Icon className="h-10 w-10" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
