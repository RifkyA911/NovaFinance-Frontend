"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import {
  LayoutDashboard,
  Wallet,
  Building2,
  TrendingUp,
  Target,
  Workflow,
  Landmark,
  PieChart,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: Wallet, label: "Transactions", path: "/transactions" },
      { icon: Landmark, label: "Wallets & Accounts", path: "/wallets" },
    ],
  },
  {
    title: "Planning & Goals",
    items: [
      { icon: Target, label: "Goals & Wishlist", path: "/goals" },
      { icon: Workflow, label: "Money Flow", path: "/money-flow" },
      { icon: TrendingUp, label: "Portfolio", path: "/portfolio" },
      { icon: Building2, label: "Workspaces", path: "/workspaces" },
    ],
  },
  {
    title: "System",
    items: [
      { icon: ShieldCheck, label: "Roles & RBAC", path: "/settings#rbac" },
      { icon: PieChart, label: "Analytics", path: "/analytics" },
      { icon: Settings, label: "Settings", path: "/settings" },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export default function Sidebar({
  collapsed = false,
  onToggle,
  isMobileMenuOpen = false,
  onMobileMenuClose,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar Container (Matches Navbar background, blur, and borderless design) */}
      <aside
        className={`bg-white/90 dark:bg-gray-900/90 backdrop-blur-md h-screen flex flex-col transition-all duration-300 fixed md:relative z-50 shadow-2xs md:shadow-none ${
          collapsed ? "w-14" : "w-52"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-12 px-3.5 flex items-center justify-between shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-6.5 h-6.5 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                NovaJournal
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-6.5 h-6.5 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}

          {/* Mobile Close Button */}
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onClick={onMobileMenuClose}
            className="h-7 w-7 md:hidden cursor-pointer text-default-500 hover:text-foreground"
            aria-label="Close Mobile Menu"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Grouped Navigation */}
        <nav className="flex-1 px-2.5 py-2 space-y-3.5 overflow-y-auto overflow-x-hidden">
          {menuGroups.map((group, groupIdx) => (
            <div key={group.title} className="space-y-1">
              {/* Group Title (Hidden when collapsed) */}
              {!collapsed ? (
                <div className="px-2 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-default-400 dark:text-default-500 select-none">
                  {group.title}
                </div>
              ) : (
                groupIdx > 0 && <div className="my-1.5 border-t border-default-200/40 dark:border-default-800/40" />
              )}

              {/* Group Menu Items */}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      onMobileMenuClose?.();
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isActive
                        ? "bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-2xs"
                        : "text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 hover:text-foreground font-medium"
                    } ${collapsed ? "justify-center px-0 h-8" : ""}`}
                    title={collapsed ? item.label : undefined}
                    aria-label={item.label}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Collapse Toggle (Borderless, matching Navbar tone) */}
        <div className="p-2.5 shrink-0 hidden md:block">
          <button
            onClick={onToggle}
            className={`w-full h-8 flex items-center rounded-lg text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition-colors text-xs font-medium cursor-pointer ${
              collapsed ? "justify-center px-0" : "px-2.5 justify-between"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!collapsed ? (
              <>
                <span className="text-[11px] text-default-500 font-medium">Collapse</span>
                <ChevronLeft className="w-3.5 h-3.5 text-default-400" />
              </>
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-default-400" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
