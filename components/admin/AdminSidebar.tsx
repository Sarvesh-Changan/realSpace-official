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
  Images,
  Calculator,
  Tag,
  Users,
  Calendar,
  Settings,
  Building2,
  MapPin,
  Wrench,
  FileText,
  BarChart3,
  Home,
} from "lucide-react";
import clsx from "clsx";

const dashboardItem = { name: "Dashboard", href: "/admin", icon: LayoutDashboard };

const interiorItems = [
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { name: "Certifications", href: "/admin/certifications", icon: Award },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { name: "Home Gallery", href: "/admin/home-gallery", icon: Images },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Pricing", href: "/admin/pricing", icon: Calculator },
  { name: "Offers", href: "/admin/offers", icon: Tag },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const reraItems = [
  { name: "Settings", href: "/admin/rera/settings", icon: Settings },
  { name: "Properties", href: "/admin/rera/properties", icon: Home },
  { name: "Services", href: "/admin/rera/services", icon: Wrench },
  { name: "Configurations", href: "/admin/rera/configurations", icon: Layers },
  { name: "Builder Partners", href: "/admin/rera/builders", icon: Building2 },
  { name: "Gallery", href: "/admin/rera/gallery", icon: ImageIcon },
  { name: "Enquiries", href: "/admin/rera/enquiries", icon: FileText },
];

import { X } from "lucide-react";

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ mobileOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  const renderNavItem = (item: { name: string; href: string; icon: React.ElementType }) => {
    const isActive = isItemActive(item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
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
  };

  const renderNav = () => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {/* Dashboard — always at top */}
      {renderNavItem(dashboardItem)}

      {/* Interior Design group */}
      <div className="pt-4">
        <div className="px-3 pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            Interior Design
          </span>
        </div>
        <div className="space-y-0.5">
          {interiorItems.map(renderNavItem)}
        </div>
      </div>

      {/* RERA Realty group */}
      <div className="pt-4">
        <div className="px-3 pb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            RERA Realty
          </span>
        </div>
        <div className="space-y-0.5">
          {reraItems.map(renderNavItem)}
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on lg screens and up) */}
      <div className="w-64 bg-white border-r border-neutral-200 flex-col hidden lg:flex h-full shrink-0">
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
