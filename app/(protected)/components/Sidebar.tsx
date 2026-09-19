/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
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
  ChevronDown,
  X,
  Lock,
  Users,
  Scale,
  ScrollText,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  UserRole,
  ROLES,
  hasAccess,
  getEffectiveRole,
} from "@/app/lib/rbac";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  allowedRoles?: UserRole[]; // If undefined, accessible by all roles
  requiredRoleName?: string;
}

interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    id: "overview",
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
      { icon: Wallet, label: "Transactions", path: "/transactions" },
      {
        icon: Landmark,
        label: "Wallets & Accounts",
        path: "/wallets",
        allowedRoles: ["owner", "admin", "staff"],
        requiredRoleName: "Staff+",
      },
    ],
  },
  {
    id: "planning",
    title: "Planning & Goals",
    items: [
      { icon: Target, label: "Goals & Wishlist", path: "/goals" },
      { icon: Scale, label: "Liabilities Matrix", path: "/liabilities" },
      { icon: Workflow, label: "Money Flow", path: "/money-flow" },
      { icon: TrendingUp, label: "Portfolio", path: "/portfolio" },
      {
        icon: Building2,
        label: "Workspaces",
        path: "/workspaces",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
    ],
  },
  {
    id: "system",
    title: "System & Governance",
    items: [
      {
        icon: Users,
        label: "Users & RBAC",
        path: "/users",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
      {
        icon: ScrollText,
        label: "Audit Logs",
        path: "/logs",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
      { icon: PieChart, label: "Analytics", path: "/analytics" },
      {
        icon: Settings,
        label: "Settings",
        path: "/settings",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
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
  const { selectedWorkspace } = useWorkspace();

  // Active Role state (with support for RBAC simulation)
  const [currentRole, setCurrentRole] = useState<UserRole>("owner");

  // Accordion state: track open state per group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    planning: true,
    system: true,
  });

  // Keep active route's group open automatically
  useEffect(() => {
    const activeGroup = menuGroups.find((g) =>
      g.items.some((item) => pathname === item.path || pathname.startsWith(item.path + "/"))
    );
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [pathname]);

  // Sync role and listen for simulation changes
  useEffect(() => {
    const syncRole = () => {
      const r = getEffectiveRole((selectedWorkspace as any)?.role);
      setCurrentRole(r);
    };
    syncRole();
    window.addEventListener("novajournal_role_change", syncRole);
    return () => window.removeEventListener("novajournal_role_change", syncRole);
  }, [selectedWorkspace]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleItemClick = (item: MenuItem, isAllowed: boolean) => {
    if (!isAllowed) {
      alert(
        `Privilege Access Restricted: ${item.label} requires ${item.requiredRoleName || "Admin"} privileges. Your simulated/current role is "${ROLES[currentRole].label}". Switch role in "Users & RBAC" to test.`
      );
      return;
    }
    router.push(item.path);
    onMobileMenuClose?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white/95 dark:bg-gray-900/95 backdrop-blur-md h-screen flex flex-col transition-all duration-300 fixed md:relative z-50 shadow-2xs md:shadow-none border-r border-default-200/60 dark:border-default-800/60 ${
          collapsed ? "w-14" : "w-54"
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-12 px-3 flex items-center justify-between shrink-0 border-b border-default-200/40 dark:border-default-800/40">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-6.5 h-6.5 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  NovaJournal
                </span>
                <span className="text-[9px] text-default-400 font-mono -mt-0.5">
                  PRO FINANCIAL
                </span>
              </div>
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

        {/* Grouped Accordion Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-2.5 overflow-y-auto overflow-x-hidden no-scrollbar">
          {menuGroups.map((group, groupIdx) => {
            const isGroupOpen = openGroups[group.id] !== false;

            return (
              <div key={group.id} className="space-y-0.5">
                {/* Accordion Group Header */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-default-400 dark:text-default-500 hover:text-foreground hover:bg-default-100/50 dark:hover:bg-default-800/40 transition-colors text-left group cursor-pointer select-none"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {group.title}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-default-400 group-hover:text-foreground transition-transform duration-200 ${
                        isGroupOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                ) : (
                  groupIdx > 0 && (
                    <div className="my-1.5 border-t border-default-200/40 dark:border-default-800/40" />
                  )
                )}

                {/* Group Menu Items (Collapsible Accordion Body) */}
                <div
                  className={`space-y-0.5 transition-all duration-200 ${
                    !collapsed && !isGroupOpen
                      ? "max-h-0 opacity-0 overflow-hidden"
                      : "max-h-96 opacity-100"
                  }`}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    const isAllowed = hasAccess(currentRole, item.allowedRoles);

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleItemClick(item, isAllowed)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer relative ${
                          isActive
                            ? "bg-theme-gradient text-white font-semibold shadow-xs"
                            : isAllowed
                            ? "text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 hover:text-foreground font-medium"
                            : "text-default-400/60 dark:text-default-600 hover:bg-default-50/50 dark:hover:bg-default-800/30 opacity-65 cursor-not-allowed"
                        } ${collapsed ? "justify-center px-0 h-8" : ""}`}
                        title={
                          !isAllowed
                            ? `${item.label} (Requires ${item.requiredRoleName || "Admin"})`
                            : collapsed
                            ? item.label
                            : undefined
                        }
                        aria-label={item.label}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />

                        {!collapsed && (
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <span className="truncate">{item.label}</span>

                            {/* RBAC Privilege Indicator Badge */}
                            {!isAllowed && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-default-200/70 dark:bg-default-800 text-default-500 shrink-0">
                                <Lock className="w-2.5 h-2.5" />
                                <span>{item.requiredRoleName}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* RBAC Active Role Pill & Collapse Toggle */}
        <div className="p-2 shrink-0 border-t border-default-200/40 dark:border-default-800/40 space-y-1.5">
          {/* Active Role Indicator */}
          {!collapsed ? (
            <button
              onClick={() => router.push("/users")}
              title="Click to manage users and test RBAC privileges"
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${ROLES[currentRole].badgeBg} ${ROLES[currentRole].badgeBorder} ${ROLES[currentRole].badgeText} hover:opacity-90`}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="capitalize">{ROLES[currentRole].label}</span>
              </div>
              <span className="text-[9px] font-mono uppercase opacity-75">RBAC</span>
            </button>
          ) : (
            <button
              onClick={() => router.push("/users")}
              title={`Role: ${ROLES[currentRole].label} (Click to open Users & RBAC)`}
              className={`w-full h-8 flex items-center justify-center rounded-lg border cursor-pointer ${ROLES[currentRole].badgeBg} ${ROLES[currentRole].badgeBorder} ${ROLES[currentRole].badgeText}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Bottom Collapse Toggle */}
          <button
            onClick={onToggle}
            className={`w-full h-7.5 flex items-center rounded-lg text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition-colors text-xs font-medium cursor-pointer hidden md:flex ${
              collapsed ? "justify-center px-0" : "px-2.5 justify-between"
            }`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {!collapsed ? (
              <>
                <span className="text-[10px] text-default-400 font-medium">Collapse</span>
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
