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
  Image as ImageIcon,
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
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Pricing", href: "/admin/pricing", icon: Calculator },
  { name: "Offers", href: "/admin/offers", icon: Tag },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

import { X } from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const renderNav = () => (
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
            onClick={onClose}
            className={clsx(
              "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]",
              isActive
                ? "bg-red-50 text-brand-red font-semibold"
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
  );

  return (
    <>
      {/* Desktop Sidebar (visible on lg screens and up) */}
      <div className="w-64 bg-white border-r border-neutral-200 flex-col hidden lg:flex h-screen sticky top-0 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 shrink-0">
          <span className="text-xl font-bold text-neutral-900">REALSPACE</span>
          <span className="ml-2 text-xs font-semibold text-brand-red bg-red-50 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </div>
        {renderNav()}
      </div>

      {/* Mobile Off-canvas Drawer (visible on < lg screens when mobileOpen is true) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200 shrink-0">
              <div className="flex items-center">
                <span className="text-xl font-bold text-neutral-900">REALSPACE</span>
                <span className="ml-2 text-xs font-semibold text-brand-red bg-red-50 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-neutral-500 hover:text-neutral-800 rounded-lg"
                aria-label="Close Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderNav()}
          </div>
        </div>
      )}
    </>
  );
}
