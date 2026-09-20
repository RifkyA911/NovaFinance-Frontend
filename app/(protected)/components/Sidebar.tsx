/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
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
  Crown,
  Sparkles,
  UserCheck,
  Palette,
  Cpu,
  Globe,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { queryKeys, queryFunctions } from "@/app/lib/queries";
import {
  UserRole,
  ROLES,
  hasAccess,
  getEffectiveRole,
} from "@/app/lib/rbac";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  allowedRoles?: UserRole[]; // If undefined, accessible by all roles
  requiredRoleName?: string;
  disabled?: boolean;
  badge?: string;
}

interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Wallet,
  Landmark,
  PieChart,
  Target,
  Scale,
  Workflow,
  TrendingUp,
  Building2,
  Settings,
  Globe,
  UserCheck,
  Crown,
  Palette,
  Cpu,
  ShieldCheck,
  Users,
  ScrollText,
};

const DEFAULT_MENU_GROUPS: MenuGroup[] = [
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
      { icon: PieChart, label: "Analytics", path: "/analytics" },
    ],
  },
  {
    id: "planning",
    title: "Planning & Assets",
    items: [
      { icon: Target, label: "Goals & Wishlist", path: "/goals" },
      { icon: Scale, label: "Liabilities & Debt", path: "/liabilities" },
      { icon: Workflow, label: "Money Flow Matrix", path: "/money-flow" },
      { icon: TrendingUp, label: "Portfolio & Growth", path: "/portfolio" },
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
    id: "governance",
    title: "Governance",
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
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    items: [
      {
        icon: Settings,
        label: "Settings Hub",
        path: "/settings",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
      {
        icon: Globe,
        label: "Regional & Format",
        path: "/regional",
      },
      {
        icon: UserCheck,
        label: "User Profile",
        path: "/profile",
      },
      {
        icon: Crown,
        label: "Company Brand",
        path: "/brand",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
      {
        icon: Palette,
        label: "Appearance",
        path: "/appearance",
      },
      {
        icon: Cpu,
        label: "AI Hub & Copilot",
        path: "/ai-hub",
      },
      {
        icon: ShieldCheck,
        label: "Security & Vault",
        path: "/security",
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

  const { lang, t } = useIntlLanguage();

  // Dynamic menus fetched from DB
  const { data: dbMenusData } = useQuery({
    queryKey: queryKeys.menus(selectedWorkspace?.id),
    queryFn: () => queryFunctions.menus(selectedWorkspace!.id),
    enabled: !!selectedWorkspace?.id,
    staleTime: 60000,
  });

  const menuGroups = useMemo<MenuGroup[]>(() => {
    const groupTitles: Record<string, string> = {
      overview: t(DICTIONARY.sidebar.groupOverview),
      planning: t(DICTIONARY.sidebar.groupPlanning),
      governance: t(DICTIONARY.sidebar.groupGovernance),
      configuration: t(DICTIONARY.sidebar.groupSettings),
    };

    const MENU_TRANSLATIONS: Record<string, { id: string; en: string }> = {
      "/dashboard": DICTIONARY.sidebar.menuDashboard,
      "/transactions": DICTIONARY.sidebar.menuTransactions,
      "/wallets": DICTIONARY.sidebar.menuWallets,
      "/analytics": DICTIONARY.sidebar.menuAnalytics,
      "/goals": DICTIONARY.sidebar.menuGoals,
      "/liabilities": DICTIONARY.sidebar.menuLiabilities,
      "/money-flow": DICTIONARY.sidebar.menuMoneyFlow,
      "/portfolio": DICTIONARY.sidebar.menuPortfolio,
      "/workspaces": DICTIONARY.sidebar.menuWorkspaces,
      "/users": DICTIONARY.sidebar.menuUsers,
      "/logs": DICTIONARY.sidebar.menuLogs,
      "/settings": DICTIONARY.sidebar.menuSettings,
      "/regional": DICTIONARY.sidebar.menuRegional,
      "/profile": DICTIONARY.sidebar.menuProfile,
      "/brand": DICTIONARY.sidebar.menuBrand,
      "/appearance": DICTIONARY.sidebar.menuAppearance,
      "/ai-hub": DICTIONARY.sidebar.menuAiHub,
      "/security": DICTIONARY.sidebar.menuSecurity,
    };

    const getTranslatedLabel = (item: any) => {
      if (MENU_TRANSLATIONS[item.path]) {
        return t(MENU_TRANSLATIONS[item.path]);
      }
      return (lang === "id" ? item.labelId : item.labelEn) || item.label || item.name;
    };

    if (!dbMenusData?.data || !Array.isArray(dbMenusData.data) || dbMenusData.data.length === 0) {
      return DEFAULT_MENU_GROUPS.map((g) => ({
        ...g,
        title: groupTitles[g.id] || g.title,
        items: g.items.map((it) => ({
          ...it,
          label: getTranslatedLabel(it),
        })),
      }));
    }

    // Organize database menus by their group
    const groups: Record<string, MenuItem[]> = {
      overview: [],
      planning: [],
      configuration: [],
      governance: [],
    };

    const PATH_TO_GROUP: Record<string, string> = {
      "/dashboard": "overview",
      "/transactions": "overview",
      "/wallets": "overview",
      "/analytics": "overview",

      "/goals": "planning",
      "/liabilities": "planning",
      "/money-flow": "planning",
      "/portfolio": "planning",
      "/workspaces": "planning",

      "/settings": "configuration",
      "/regional": "configuration",
      "/profile": "configuration",
      "/brand": "configuration",
      "/appearance": "configuration",
      "/ai-hub": "configuration",
      "/security": "configuration",

      "/users": "governance",
      "/logs": "governance",
    };

    for (const item of dbMenusData.data) {
      let g = item.group;
      if (!g || (g === "overview" && PATH_TO_GROUP[item.path] && PATH_TO_GROUP[item.path] !== "overview")) {
        g = PATH_TO_GROUP[item.path] || g || "overview";
      }
      if (!groups[g]) groups[g] = [];
      const IconComponent = (item.icon && ICON_MAP[item.icon]) ? ICON_MAP[item.icon] : LayoutDashboard;

      const requiresAdmin = ["/settings", "/brand", "/workspaces", "/users", "/logs"].includes(item.path);
      const requiresStaff = ["/wallets"].includes(item.path);

      groups[g].push({
        icon: IconComponent,
        label: getTranslatedLabel(item),
        path: item.path || "/dashboard",
        allowedRoles: requiresAdmin ? ["owner", "admin"] : requiresStaff ? ["owner", "admin", "staff"] : undefined,
        requiredRoleName: requiresAdmin ? "Admin" : requiresStaff ? "Staff+" : undefined,
      });
    }

    const ORDERED_GROUP_KEYS = ["overview", "planning", "governance", "configuration"];
    const result = ORDERED_GROUP_KEYS
      .filter((k) => groups[k] && groups[k].length > 0)
      .map((k) => ({
        id: k,
        title: groupTitles[k] || k.toUpperCase(),
        items: groups[k],
      }));

    return result.length > 0 ? result : DEFAULT_MENU_GROUPS;
  }, [dbMenusData, lang, t]);

  // Active Role state (with support for RBAC simulation)
  const [currentRole, setCurrentRole] = useState<UserRole>("owner");

  // Accordion state: track open state per group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    planning: true,
    configuration: true,
    governance: true,
  });

  // Keep active route's group open automatically
  useEffect(() => {
    const activeGroup = menuGroups.find((g) =>
      g.items.some((item) => pathname === item.path || pathname.startsWith(item.path + "/"))
    );
    if (activeGroup) {
      setOpenGroups((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [pathname, menuGroups]);

  // Sidebar Company Brand Badge & Display Mode preferences
  const [brandBadgeVisible, setBrandBadgeVisible] = useState(true);
  const [brandDisplayMode, setBrandDisplayMode] = useState<"full" | "icon">("full");
  const [brandBadgeStyle, setBrandBadgeStyle] = useState<"full" | "icon-only">("full");
  const [brandDisplayFormat, setBrandDisplayFormat] = useState<"logo-and-text" | "logo-only" | "full-banner">("logo-and-text");
  const [brandLogoOverride, setBrandLogoOverride] = useState<string | null>(null);
  const [brandModeOverride, setBrandModeOverride] = useState<"square" | "wide" | null>(null);
  const [brandNameOverride, setBrandNameOverride] = useState<string | null>(null);
  const [brandLogoWidth, setBrandLogoWidth] = useState(140);
  const [brandLogoPlacement, setBrandLogoPlacement] = useState<"left" | "center" | "right">("left");

  // Granular Sidebar Appearance Preferences
  const [sidebarDensity, setSidebarDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [sidebarWidthPx, setSidebarWidthPx] = useState(224);
  const [navbarHeightPx, setNavbarHeightPx] = useState(56);
  const [sidebarBackdrop, setSidebarBackdrop] = useState<"glass" | "solid" | "minimal" | "accent">("glass");
  const [sidebarIndicator, setSidebarIndicator] = useState<"pill" | "line" | "glow" | "subtle">("pill");
  const [sidebarBorderless, setSidebarBorderless] = useState(false);
  const [sidebarShadow, setSidebarShadow] = useState<"none" | "subtle" | "elevated">("none");
  const [navbarGlassBg, setNavbarGlassBg] = useState(true);

  const loadBrandPrefs = React.useCallback(() => {
    const ws = selectedWorkspace as any;
    const wsId = ws?.id;

    const scopedLogo = wsId ? localStorage.getItem(`novajournal_custom_brand_logo_${wsId}`) : null;
    const scopedName = wsId ? localStorage.getItem(`novajournal_custom_brand_name_${wsId}`) : null;
    const scopedBrandMode = wsId ? localStorage.getItem(`novajournal_brand_logo_mode_${wsId}`) : null;
    const scopedFormat = wsId ? localStorage.getItem(`novajournal_brand_display_format_${wsId}`) : null;
    const scopedWidth = wsId ? localStorage.getItem(`novajournal_brand_logo_width_${wsId}`) : null;
    const scopedPlacement = wsId ? localStorage.getItem(`novajournal_brand_logo_placement_${wsId}`) : null;

    // Scoped brand logo: ws.customBrandLogo takes highest precedence, followed by scoped local storage
    const effLogo = ws?.customBrandLogo || scopedLogo || null;
    setBrandLogoOverride(effLogo);

    const effName = ws?.customBrandName || scopedName || null;
    setBrandNameOverride(effName);

    const effMode = (ws?.customBrandMode || scopedBrandMode || "square").toLowerCase();
    if (effMode === "square" || effMode === "wide") setBrandModeOverride(effMode as any);

    const effFormat = (ws?.customBrandDisplay || scopedFormat || "logo-and-text").toLowerCase();
    if (effFormat === "logo-and-text" || effFormat === "logo-only" || effFormat === "full-banner") {
      setBrandDisplayFormat(effFormat as any);
    }

    if (scopedWidth) {
      setBrandLogoWidth(Number(scopedWidth) || 140);
    } else {
      const savedLogoWidth = localStorage.getItem("novajournal_brand_logo_width");
      if (savedLogoWidth) setBrandLogoWidth(Number(savedLogoWidth) || 140);
      else setBrandLogoWidth(140);
    }

    if (scopedPlacement === "left" || scopedPlacement === "center" || scopedPlacement === "right") {
      setBrandLogoPlacement(scopedPlacement as any);
    } else {
      const savedLogoPlacement = localStorage.getItem("novajournal_brand_logo_placement") as any;
      if (savedLogoPlacement === "left" || savedLogoPlacement === "center" || savedLogoPlacement === "right") {
        setBrandLogoPlacement(savedLogoPlacement);
      } else {
        setBrandLogoPlacement("left");
      }
    }

    const glassBg = localStorage.getItem("novajournal_navbar_glass_bg");
    if (glassBg !== null) setNavbarGlassBg(glassBg !== "false");

    const savedBorderless = localStorage.getItem("novajournal_sidebar_borderless");
    if (savedBorderless !== null) setSidebarBorderless(savedBorderless === "true");

    const savedShadow = localStorage.getItem("novajournal_sidebar_shadow") as any;
    if (savedShadow) setSidebarShadow(savedShadow);

    const savedBadge = localStorage.getItem("novajournal_sidebar_brand_badge");
    if (savedBadge !== null) setBrandBadgeVisible(savedBadge !== "false");
    const savedMode = localStorage.getItem("novajournal_sidebar_brand_mode");
    if (savedMode === "icon" || savedMode === "full") setBrandDisplayMode(savedMode);
    const savedStyle = localStorage.getItem("novajournal_brand_badge_style");
    if (savedStyle === "icon-only" || savedStyle === "full") setBrandBadgeStyle(savedStyle);

    const savedDensity = localStorage.getItem("novajournal_sidebar_density") as any;
    if (savedDensity === "compact" || savedDensity === "comfortable" || savedDensity === "spacious") {
      setSidebarDensity(savedDensity);
    }
    const sideWCustom = localStorage.getItem("novajournal_sidebar_width_custom");
    let computedW = savedDensity === "compact" ? 200 : savedDensity === "spacious" ? 260 : 224;
    if (sideWCustom) computedW = Number(sideWCustom) || computedW;
    setSidebarWidthPx(computedW);

    const navDen = localStorage.getItem("novajournal_navbar_density") as any;
    const navHCustom = localStorage.getItem("novajournal_navbar_height_custom");
    let computedNavH = navDen === "compact" ? 48 : navDen === "spacious" ? 64 : 56;
    if (navHCustom) computedNavH = Number(navHCustom) || computedNavH;
    setNavbarHeightPx(computedNavH);

    const savedBackdrop = localStorage.getItem("novajournal_sidebar_backdrop") as any;
    if (savedBackdrop) setSidebarBackdrop(savedBackdrop);

    const savedIndicator = localStorage.getItem("novajournal_sidebar_indicator") as any;
    if (savedIndicator) setSidebarIndicator(savedIndicator);
  }, [selectedWorkspace]);

  useEffect(() => {
    loadBrandPrefs();
    window.addEventListener("novajournal_brand_config_changed", loadBrandPrefs);
    window.addEventListener("novajournal_appearance_config_changed", loadBrandPrefs);
    window.addEventListener("storage", loadBrandPrefs);
    return () => {
      window.removeEventListener("novajournal_brand_config_changed", loadBrandPrefs);
      window.removeEventListener("novajournal_appearance_config_changed", loadBrandPrefs);
      window.removeEventListener("storage", loadBrandPrefs);
    };
  }, [loadBrandPrefs]);

  // Sync role, workspace brand identity and listen for simulation changes
  useEffect(() => {
    const syncRole = () => {
      const r = getEffectiveRole((selectedWorkspace as any)?.role);
      setCurrentRole(r);
    };
    syncRole();
    loadBrandPrefs();
    window.addEventListener("novajournal_role_change", syncRole);
    return () => window.removeEventListener("novajournal_role_change", syncRole);
  }, [selectedWorkspace, loadBrandPrefs]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleItemClick = (item: MenuItem, isAllowed: boolean) => {
    if (item.disabled) {
      triggerNovaToast({
        type: "warning",
        title: "Fitur Dinonaktifkan",
        description: "Menu ini sedang dalam pengembangan dan dinonaktifkan sementara.",
      });
      return;
    }
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

      {/* Sidebar Container - Borderless Joint with Navbar */}
      <aside
        style={!collapsed ? { width: `var(--sidebar-width, ${sidebarWidthPx}px)` } : undefined}
        className={`${
          sidebarBackdrop === "solid"
            ? "bg-white dark:bg-zinc-900"
            : sidebarBackdrop === "minimal"
            ? "bg-default-50/90 dark:bg-zinc-900/90 backdrop-blur-xs"
            : sidebarBackdrop === "accent"
            ? "bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-md"
            : "bg-white/75 dark:bg-zinc-900/75 backdrop-blur-md"
        } ${
          sidebarBorderless
            ? "border-r-0"
            : "border-r border-default-200/70 dark:border-default-800/70"
        } ${
          sidebarShadow === "elevated"
            ? "shadow-2xl md:shadow-xl"
            : sidebarShadow === "subtle"
            ? "shadow-md md:shadow-sm"
            : "shadow-2xs md:shadow-none"
        } h-screen flex flex-col transition-all duration-300 fixed md:relative z-50 overflow-hidden ${
          collapsed ? "w-14" : ""
        } ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Brand Header - Joint continuation with Navbar */}
        {(() => {
          const ws = selectedWorkspace as any;
          const wsId = ws?.id;
          const scopedLogo = wsId ? localStorage.getItem(`novajournal_custom_brand_logo_${wsId}`) : null;
          const scopedName = wsId ? localStorage.getItem(`novajournal_custom_brand_name_${wsId}`) : null;
          const customBrandLogo = ws?.customBrandLogo || scopedLogo || brandLogoOverride;
          const customBrandName = ws?.customBrandName || scopedName || brandNameOverride;
          const customBrandJargon = ws?.customBrandJargon;
          const customBrandMode = (brandModeOverride || ws?.customBrandMode || "square").toLowerCase();
          const effectiveDisplayFormat = (brandDisplayFormat || ws?.customBrandDisplay || "logo-and-text").toLowerCase();
          const hasCustomBrand = Boolean(customBrandName || customBrandLogo);
          const planTier = (ws?.planTier || "pro").toLowerCase() as "basic" | "pro" | "enterprise";

          return (
            <div
              style={{ height: `var(--navbar-height, ${navbarHeightPx}px)` }}
              className={`px-3.5 flex items-center justify-between shrink-0 ${
                sidebarBorderless
                  ? "border-b-0"
                  : "border-b border-default-200/60 dark:border-default-800/60"
              } ${
                navbarGlassBg
                  ? "backdrop-blur-md bg-white/40 dark:bg-zinc-900/40"
                  : "bg-white dark:bg-zinc-900"
              } relative z-10 overflow-hidden transition-colors`}
            >
              {!collapsed ? (
                <div className="flex items-center justify-between w-full min-w-0 pr-0.5">
                  {/* Brand Display Layout */}
                  {effectiveDisplayFormat === "full-banner" && customBrandLogo ? (
                    <div className={`flex-1 flex items-center min-w-0 pr-1 ${
                      brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                    }`}>
                      <img
                        key={customBrandLogo}
                        src={customBrandLogo}
                        alt="Corporate Banner"
                        style={{ maxWidth: `${brandLogoWidth}px` }}
                        className="max-h-11 w-auto object-contain transition-all"
                      />
                    </div>
                  ) : effectiveDisplayFormat === "logo-only" && customBrandLogo ? (
                    <div className={`flex-1 flex items-center min-w-0 ${
                      brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                    }`}>
                      <img
                        key={customBrandLogo}
                        src={customBrandLogo}
                        alt="Corporate Logo"
                        style={customBrandMode === "wide" ? { maxWidth: `${brandLogoWidth}px` } : undefined}
                        className={
                          customBrandMode === "wide"
                            ? "max-h-11 w-auto object-contain transition-all"
                            : "w-8 h-8 rounded-xl object-cover shadow-2xs border border-default-200/60 dark:border-default-700/60"
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {hasCustomBrand ? (
                        customBrandLogo ? (
                          <img
                            key={customBrandLogo}
                            src={customBrandLogo}
                            alt="Company Logo"
                            style={customBrandMode === "wide" ? { maxWidth: `${brandLogoWidth}px` } : undefined}
                            className={
                              customBrandMode === "wide"
                                ? "h-10 w-auto object-contain shrink-0 transition-all"
                                : "w-7 h-7 rounded-lg object-cover shadow-2xs shrink-0 border border-default-200/60 dark:border-default-700/60"
                            }
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-2xs shrink-0">
                            {customBrandName?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                        )
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0">
                          <Wallet className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      {brandDisplayMode !== "icon" && (
                        <div className="flex flex-col min-w-0 leading-tight">
                          <span className="text-xs font-bold text-foreground truncate">
                            {hasCustomBrand ? customBrandName : "NovaFinance"}
                          </span>
                          <span className="text-[9px] text-default-400 font-medium truncate">
                            {hasCustomBrand ? (customBrandJargon || ws?.name || "Corporate Treasury") : "Pro Financial"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tierlist Sleek Icon Badge (Show/Hide controlled by brandBadgeVisible & brandBadgeStyle) */}
                  {brandBadgeVisible && (
                    <div className="shrink-0 ml-1">
                      {planTier === "enterprise" && (
                        <span
                          className={`flex items-center ${
                            brandBadgeStyle === "icon-only" ? "p-1 rounded-md" : "gap-1 px-1.5 py-0.5 rounded-md"
                          } bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30 text-[9.5px] font-bold tracking-tight select-none`}
                          title="Enterprise Tier"
                        >
                          <Crown className="w-2.5 h-2.5 text-violet-500 shrink-0" />
                          {brandBadgeStyle !== "icon-only" && <span>Enterprise</span>}
                        </span>
                      )}
                      {planTier === "pro" && (
                        <span
                          className={`flex items-center ${
                            brandBadgeStyle === "icon-only" ? "px-1 py-0.5 rounded-md" : "gap-1 px-1.5 py-0.5 rounded-md"
                          } bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9.5px] font-bold tracking-tight select-none`}
                          title="Pro Tier"
                        >
                          {brandBadgeStyle === "icon-only" ? (
                            <Sparkles className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          ) : (
                            <span>PRO</span>
                          )}
                        </span>
                      )}
                      {planTier === "basic" && (
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 border border-default-200 dark:border-default-700 text-[9.5px] font-medium tracking-tight select-none"
                          title="Basic Tier"
                        >
                          <span>Basic</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  {hasCustomBrand && customBrandLogo ? (
                    <img
                      src={customBrandLogo}
                      alt="Logo"
                      className="w-7 h-7 rounded-lg object-cover shadow-2xs"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0">
                      <Wallet className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Close Button */}
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onClick={onMobileMenuClose}
                className="h-7 w-7 md:hidden cursor-pointer text-default-500 hover:text-foreground shrink-0"
                aria-label="Close Mobile Menu"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        })()}

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
                      className={`w-3 h-3 text-default-400 group-hover:text-foreground transition-transform duration-200 ${isGroupOpen ? "rotate-0" : "-rotate-90"
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
                  className={`space-y-0.5 transition-all duration-200 ${!collapsed && !isGroupOpen
                      ? "max-h-0 opacity-0 overflow-hidden"
                      : "max-h-96 opacity-100"
                    }`}
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path + "/"));
                    const isAllowed = !item.allowedRoles || item.allowedRoles.includes(currentRole);
                    const densityCls = sidebarDensity === "compact" ? "gap-2 px-2 py-1 text-[11px]" : "gap-2.5 px-2.5 py-1.5 text-xs";
                    const activeCls =
                      sidebarIndicator === "line"
                        ? "bg-default-100 dark:bg-default-800 text-foreground font-semibold border-l-3 border-blue-500 rounded-l-none pl-2 shadow-2xs"
                        : sidebarIndicator === "glow"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                        : "bg-theme-gradient text-white font-semibold shadow-xs";

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleItemClick(item, isAllowed)}
                        className={`w-full flex items-center ${densityCls} rounded-lg transition-all cursor-pointer relative ${
                          isActive
                            ? activeCls
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
                          <div className="flex-1 flex items-center justify-between min-w-0 gap-1.5">
                            <span className="truncate">{item.label}</span>

                            {item.disabled ? (
                              <span className="inline-flex items-center text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shrink-0">
                                {item.badge || "Disabled"}
                              </span>
                            ) : !isAllowed && (
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
          {/* Relocated NovaFinance Brand (when company custom brand is active at the top) */}
          {(() => {
            const ws = selectedWorkspace as any;
            const hasCustomBrand = Boolean(ws?.customBrandName || ws?.customBrandLogo);
            if (!hasCustomBrand) return null;

            return !collapsed ? (
              <div className="px-2 py-1.5 rounded-xl bg-default-100/70 dark:bg-default-800/40 border border-default-200/40 dark:border-default-700/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0">
                    <Wallet className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      NovaFinance
                    </span>
                    <span className="text-[8px] text-default-400 font-mono">
                      Pro Financial
                    </span>
                  </div>
                </div>
                <span className="text-[8px] font-mono uppercase px-1 py-0.2 rounded bg-default-200/60 dark:bg-default-700/60 text-default-500">
                  Core Engine
                </span>
              </div>
            ) : (
              <div className="flex justify-center py-0.5">
                <div className="w-6 h-6 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs" title="Powered by NovaFinance">
                  <Wallet className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            );
          })()}

          {/* Bottom Collapse Toggle */}
          <button
            onClick={onToggle}
            className={`w-full h-7.5 flex items-center rounded-lg text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition-colors text-xs font-medium cursor-pointer hidden md:flex ${collapsed ? "justify-center px-0" : "px-2.5 justify-between"
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
