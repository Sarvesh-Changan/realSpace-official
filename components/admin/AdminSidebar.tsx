"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  MessageSquare,
  Award,
  HelpCircle,
  Calculator,
  Tag,
  Users,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Services", href: "/admin/services", icon: Layers },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { name: "Certifications", href: "/admin/certifications", icon: Award },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { name: "Pricing", href: "/admin/pricing", icon: Calculator },
  { name: "Offers", href: "/admin/offers", icon: Tag },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-neutral-200 flex-col hidden md:flex h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-neutral-200 shrink-0">
        <span className="text-xl font-bold text-neutral-900">REALSPACE</span>
        <span className="ml-2 text-xs font-semibold text-brand-red bg-red-50 px-2 py-0.5 rounded-full">
          Admin
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-red-50 text-brand-red"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <Icon
                className={clsx(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-brand-red" : "text-neutral-400"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
