import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 70, 75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://res.cloudinary.com https://upload-widget.cloudinary.com https://widget.cloudinary.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: http:; media-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://upload-widget.cloudinary.com https://www.youtube.com https://youtube-nocookie.com; connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com https://*.cloudinary.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
