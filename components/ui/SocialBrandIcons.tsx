import * as React from "react";

export type SocialPlatform = "Instagram" | "Facebook" | "YouTube" | "LinkedIn";

interface SocialBrandIconProps {
  platform: SocialPlatform;
  className?: string;
  idPrefix?: string;
}

export function SocialBrandIcon({ platform, className = "h-10 w-10", idPrefix = "social" }: SocialBrandIconProps) {
  if (platform === "Instagram") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id={`${idPrefix}-instagram`} cx="30%" cy="107%" r="130%">
            <stop offset="0%" stopColor="#fdf497" />
            <stop offset="45%" stopColor="#fd5949" />
            <stop offset="60%" stopColor="#d6249f" />
            <stop offset="100%" stopColor="#285AEB" />
          </radialGradient>
        </defs>
        <rect width="24" height="24" rx="6.5" fill={`url(#${idPrefix}-instagram)`} />
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="white" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4.2" stroke="white" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1.1" fill="white" />
      </svg>
    );
  }

  if (platform === "Facebook") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${idPrefix}-facebook`} x1="7" y1="2" x2="17" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#42A5F5" />
            <stop offset="0.5" stopColor="#0866FF" />
            <stop offset="1" stopColor="#0052CC" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="12" fill={`url(#${idPrefix}-facebook)`} />
        <path fill="white" d="M13.5 21v-8.25h2.75l.45-3.25H13.5V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.15c-.3-.05-1.3-.15-2.5-.15-2.5 0-4.2 1.5-4.2 4.3V9.5H7.3v3.25h2.8V21h3.4Z" />
      </svg>
    );
  }

  if (platform === "YouTube") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${idPrefix}-youtube`} x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF4B55" />
            <stop offset="0.5" stopColor="#FF0000" />
            <stop offset="1" stopColor="#D90000" />
          </linearGradient>
        </defs>
        <rect x="1" y="4" width="22" height="16" rx="4.5" fill={`url(#${idPrefix}-youtube)`} />
        <path fill="white" d="m9.75 8.25 6 3.75-6 3.75v-7.5Z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${idPrefix}-linkedin`} x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#35A7E8" />
          <stop offset="0.5" stopColor="#0A66C2" />
          <stop offset="1" stopColor="#004182" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="4.5" fill={`url(#${idPrefix}-linkedin)`} />
      <path fill="white" d="M5.2 8.8h3.1v10H5.2v-10ZM6.75 5.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM15.8 8.8c-1.7 0-2.5.9-2.9 1.5V8.8H9.8v10h3.1v-5.2c0-1.4.3-2.4 1.9-2.4 1.6 0 1.6 1.5 1.6 2.5v5.1h3.1v-5.7c0-2.8-.6-4.3-3.7-4.3Z" />
    </svg>
  );
}
