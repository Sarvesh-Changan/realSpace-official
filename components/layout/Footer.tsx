import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.46 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const YoutubeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
  </svg>
);

export interface SocialLinks {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
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

  const socialPlatforms = [
    { name: "Instagram", url: instagram, Icon: InstagramIcon },
    { name: "Facebook", url: facebook, Icon: FacebookIcon },
    { name: "YouTube", url: youtube, Icon: YoutubeIcon },
  ].filter(
    (platform): platform is { name: string; url: string; Icon: typeof InstagramIcon } =>
      Boolean(platform.url && platform.url.length > 0)
  );

  return (
    <footer className="bg-brand-bgAlt pt-20 pb-10 border-t border-brand-bgAlt/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/realspace_logo.png"
                alt="REALSPACE logo"
                width={250}
                height={50}
                className="h-12 sm:h-14 w-auto"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="text-brand-text/70 text-sm leading-relaxed max-w-sm">
              A premium interior and exterior design studio based in Thane. We create elegant, highly functional spaces tailored to your modern lifestyle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-brand-text uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <ul className="space-y-4">
              {["Projects", "About", "FAQ", "Contact", "Get Free Quote"].map((link) => {
                const href = link === "Get Free Quote" ? "/quote" : `/${link.toLowerCase()}`;
                return (
                  <li key={link}>
                    <Link
                      href={href}
                      className="text-brand-text/70 hover:text-brand-red text-sm transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold text-brand-text uppercase tracking-wider mb-6">
              Services
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/services/interior"
                  className="text-brand-text/70 hover:text-brand-red text-sm transition-colors"
                >
                  Interior Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/exterior"
                  className="text-brand-text/70 hover:text-brand-red text-sm transition-colors"
                >
                  Exterior & Elevation
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-brand-text/70 hover:text-brand-red text-sm transition-colors"
                >
                  View All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-bold text-brand-text uppercase tracking-wider mb-6">
              Contact Us
            </h4>
            <ul className="space-y-5 text-brand-text/70 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>
                  Raymond Realty Jekegram<br />
                  Pokhran Road No 1 <br />
                  Thane (w), Maharashtra, India - 400606
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.25-3.95-6.847-6.847l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span>+91 98692 11777</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-brand-red shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span>realspace.org@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-text/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-text/50 text-xs md:text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} REALSPACE Interiors. All rights reserved.
          </p>
          {socialPlatforms.length > 0 && (
            <div className="flex gap-6">
              {socialPlatforms.map(({ name, url, Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-text/40 hover:text-brand-red transition-colors"
                  aria-label={name}
                >
                  <span className="sr-only">{name}</span>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

