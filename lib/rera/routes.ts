/**
 * Helper to generate scoped RERA route paths.
 * Guarantees all RERA navigation stays under /rera.
 */
export function reraPath(path: string): string {
  if (!path) return "/rera";
  
  // External or protocol links
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("tel:") || path.startsWith("mailto:") || path.startsWith("whatsapp:")) {
    return path;
  }

  // Already prefixed
  if (path === "/rera" || path.startsWith("/rera/")) {
    return path;
  }

  // Pure anchor
  if (path.startsWith("#")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") {
    return "/rera";
  }

  return `/rera${cleanPath}`;
}

export interface ReraNavLink {
  label: string;
  href: string;
}

export const navLinks: ReraNavLink[] = [
  { label: 'HOME', href: reraPath('/') },
  { label: 'ABOUT US', href: reraPath('/about') },
  { label: 'SERVICES', href: reraPath('/services') },
  { label: 'PROPERTIES', href: reraPath('/properties') },
  { label: 'GALLERY', href: reraPath('/gallery') },
  { label: 'POST PROPERTY', href: reraPath('/post-property') },
  { label: 'CONTACT', href: reraPath('/contact') },
];


