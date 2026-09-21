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
  FileSpreadsheet,
  Calculator,
  FileCheck2,
  LayoutList,
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
  FileSpreadsheet,
  Calculator,
  FileCheck2,
  LayoutList,
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
    id: "reporting",
    title: "Reporting & Finance",
    items: [
      {
        icon: FileSpreadsheet,
        label: "Laporan Keuangan",
        path: "/reports/financial-statement",
        allowedRoles: ["owner", "admin", "staff"],
        requiredRoleName: "Staff+",
      },
      {
        icon: Calculator,
        label: "Kepatuhan Pajak (Tax)",
        path: "/reports/tax-compliance",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
      {
        icon: FileCheck2,
        label: "Varian Realisasi Anggaran",
        path: "/reports/budget-variance",
        allowedRoles: ["owner", "admin", "staff"],
        requiredRoleName: "Staff+",
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
        icon: LayoutList,
        label: "Manajemen Menu",
        path: "/content-management",
        allowedRoles: ["owner", "admin"],
        requiredRoleName: "Admin",
      },
      {
        icon: Cpu,
        label: "Nova AI",
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

  const [hiddenMenus, setHiddenMenus] = useState<string[]>([]);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMenuConfig = () => {
      try {
        const savedHidden = localStorage.getItem("novajournal_hidden_menus");
        if (savedHidden) setHiddenMenus(JSON.parse(savedHidden));
        else setHiddenMenus([]);

        const savedLabels = localStorage.getItem("novajournal_menu_labels");
        if (savedLabels) setCustomLabels(JSON.parse(savedLabels));
        else setCustomLabels({});
      } catch {}
    };
    loadMenuConfig();
    window.addEventListener("novajournal_menu_config_changed", loadMenuConfig);
    return () => window.removeEventListener("novajournal_menu_config_changed", loadMenuConfig);
  }, []);

  const menuGroups = useMemo<MenuGroup[]>(() => {
    const groupTitles: Record<string, string> = {
      overview: t(DICTIONARY.sidebar.groupOverview),
      planning: t(DICTIONARY.sidebar.groupPlanning),
      reporting: lang === "id" ? "Laporan & Kepatuhan" : "Reports & Compliance",
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
      "/content-management": { id: "Manajemen Menu", en: "Menu Management" },
      "/ai-hub": DICTIONARY.sidebar.menuAiHub,
      "/security": DICTIONARY.sidebar.menuSecurity,
    };

    const getTranslatedLabel = (item: any) => {
      if (customLabels[item.path]) return customLabels[item.path];
      if (MENU_TRANSLATIONS[item.path]) {
        return t(MENU_TRANSLATIONS[item.path]);
      }
      return (lang === "id" ? item.labelId : item.labelEn) || item.label || item.name;
    };

    const filterAndLabelItems = (items: MenuItem[]) => {
      return items
        .filter((it) => pathname === it.path || !hiddenMenus.includes(it.path))
        .map((it) => ({
          ...it,
          label: customLabels[it.path] || getTranslatedLabel(it),
        }));
    };

    // Build complete groups starting with DEFAULT_MENU_GROUPS
    const groups: Record<string, MenuItem[]> = {
      overview: [],
      planning: [],
      reporting: [],
      governance: [],
      configuration: [],
    };

    // Pre-populate with all default system menu items
    for (const defGroup of DEFAULT_MENU_GROUPS) {
      if (groups[defGroup.id]) {
        groups[defGroup.id] = defGroup.items.map((it) => ({ ...it }));
      }
    }

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

      "/reports/financial-statement": "reporting",
      "/reports/tax-compliance": "reporting",
      "/reports/budget-variance": "reporting",

      "/settings": "configuration",
      "/regional": "configuration",
      "/profile": "configuration",
      "/brand": "configuration",
      "/appearance": "configuration",
      "/content-management": "configuration",
      "/ai-hub": "configuration",
      "/security": "configuration",

      "/users": "governance",
      "/logs": "governance",
    };

    // If database returned menus, merge them (updating existing or appending new)
    if (dbMenusData?.data && Array.isArray(dbMenusData.data) && dbMenusData.data.length > 0) {
      for (const item of dbMenusData.data) {
        let g = item.group;
        if (!g || (g === "overview" && PATH_TO_GROUP[item.path] && PATH_TO_GROUP[item.path] !== "overview")) {
          g = PATH_TO_GROUP[item.path] || g || "overview";
        }
        if (!groups[g]) groups[g] = [];

        // Check if this item is disabled or inactive
        if (item.isActive === false) {
          groups[g] = groups[g].filter((existing) => existing.path !== item.path);
          continue;
        }

        const IconComponent = (item.icon && ICON_MAP[item.icon]) ? ICON_MAP[item.icon] : LayoutDashboard;
        const requiresAdmin = ["/settings", "/brand", "/workspaces", "/users", "/logs", "/reports/tax-compliance", "/content-management"].includes(item.path);
        const requiresStaff = ["/wallets", "/reports/financial-statement", "/reports/budget-variance"].includes(item.path);

        const existingIdx = groups[g].findIndex((existing) => existing.path === item.path);
        const menuItemData: MenuItem = {
          icon: IconComponent,
          label: getTranslatedLabel(item),
          path: item.path || "/dashboard",
          allowedRoles: requiresAdmin ? ["owner", "admin"] : requiresStaff ? ["owner", "admin", "staff"] : undefined,
          requiredRoleName: requiresAdmin ? "Admin" : requiresStaff ? "Staff+" : undefined,
        };

        if (existingIdx >= 0) {
          groups[g][existingIdx] = menuItemData;
        } else {
          groups[g].push(menuItemData);
        }
      }
    }

    const ORDERED_GROUP_KEYS = ["overview", "planning", "reporting", "governance", "configuration"];
    const result = ORDERED_GROUP_KEYS
      .filter((k) => groups[k] && groups[k].length > 0)
      .map((k) => ({
        id: k,
        title: groupTitles[k] || k.toUpperCase(),
        items: filterAndLabelItems(groups[k]),
      }))
      .filter((g) => g.items.length > 0);

    return result.length > 0 ? result : DEFAULT_MENU_GROUPS;
  }, [dbMenusData, lang, t, hiddenMenus, customLabels, pathname]);

  // Active Role state (with support for RBAC simulation)
  const [currentRole, setCurrentRole] = useState<UserRole>("owner");

  // Accordion state: track open state per group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    planning: true,
    reporting: true,
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
  const [brandBadgeStyle, setBrandBadgeStyle] = useState<"full" | "icon-only" | "dot">("full");
  const [brandDisplayFormat, setBrandDisplayFormat] = useState<"logo-and-text" | "logo-only" | "full-banner">("logo-and-text");
  const [brandLogoOverride, setBrandLogoOverride] = useState<string | null>(null);
  const [brandModeOverride, setBrandModeOverride] = useState<"square" | "wide" | null>(null);
  const [brandNameOverride, setBrandNameOverride] = useState<string | null>(null);
  const [brandLogoWidth, setBrandLogoWidth] = useState(100);
  const [brandLogoUnit, setBrandLogoUnit] = useState<"percent" | "px">("percent");
  const [brandLogoPlacement, setBrandLogoPlacement] = useState<"left" | "center" | "right">("left");
  const [brandSubtextMode, setBrandSubtextMode] = useState<"jargon" | "entity" | "none">("jargon");
  const [brandLogoFrame, setBrandLogoFrame] = useState<"none" | "bordered" | "card" | "contrast">("none");
  const [brandVersion, setBrandVersion] = useState(0);
  const [logoAspectRatio, setLogoAspectRatio] = useState<number>(3);

  // Measure natural aspect ratio of brand logo for accurate symmetrical image-percentage scaling
  useEffect(() => {
    const ws = selectedWorkspace as any;
    const wsId = ws?.id;
    const scopedLogo = wsId ? localStorage.getItem(`novajournal_custom_brand_logo_${wsId}`) : null;
    const targetLogo = scopedLogo || brandLogoOverride || ws?.customBrandLogo;
    if (!targetLogo) return;
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setLogoAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = targetLogo;
  }, [brandLogoOverride, selectedWorkspace, brandVersion]);

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
    const globalLogo = localStorage.getItem("novajournal_custom_brand_logo");
    const scopedName = wsId ? localStorage.getItem(`novajournal_custom_brand_name_${wsId}`) : null;
    const scopedBrandMode = wsId ? localStorage.getItem(`novajournal_brand_logo_mode_${wsId}`) : null;
    const scopedFormat = wsId ? localStorage.getItem(`novajournal_brand_display_format_${wsId}`) : null;
    const scopedWidth = wsId ? localStorage.getItem(`novajournal_brand_logo_width_${wsId}`) : null;
    const scopedUnit = wsId ? localStorage.getItem(`novajournal_brand_logo_unit_${wsId}`) : null;
    const scopedPlacement = wsId ? localStorage.getItem(`novajournal_brand_logo_placement_${wsId}`) : null;
    const scopedSubtext = wsId ? localStorage.getItem(`novajournal_brand_subtext_mode_${wsId}`) : null;
    const scopedFrame = wsId ? localStorage.getItem(`novajournal_brand_logo_frame_${wsId}`) : null;

    // Fresh scoped/local logo takes highest precedence over in-memory ws object for instant reactivity
    const effLogo = scopedLogo || globalLogo || ws?.customBrandLogo || null;
    setBrandLogoOverride(effLogo);
    setBrandVersion((v) => v + 1);

    const effName = scopedName || localStorage.getItem("novajournal_custom_brand_name") || ws?.customBrandName || null;
    setBrandNameOverride(effName);

    const effSubtext = (scopedSubtext || localStorage.getItem("novajournal_brand_subtext_mode") || "jargon") as "jargon" | "entity" | "none";
    setBrandSubtextMode(effSubtext);

    const effFrame = (scopedFrame || localStorage.getItem("novajournal_brand_logo_frame") || "none") as "none" | "bordered" | "card" | "contrast";
    setBrandLogoFrame(effFrame);

    const effMode = (scopedBrandMode || localStorage.getItem("novajournal_brand_logo_mode") || ws?.customBrandMode || "square").toLowerCase();
    if (effMode === "square" || effMode === "wide") setBrandModeOverride(effMode as any);

    const effFormat = (scopedFormat || localStorage.getItem("novajournal_brand_display_format") || ws?.customBrandDisplay || "logo-and-text").toLowerCase();
    if (effFormat === "logo-and-text" || effFormat === "logo-only" || effFormat === "full-banner") {
      setBrandDisplayFormat(effFormat as any);
    }

    const effUnit = (scopedUnit || localStorage.getItem("novajournal_brand_logo_unit") || "percent") as "percent" | "px";
    setBrandLogoUnit(effUnit);

    const defaultWidth = effUnit === "percent" ? 100 : 140;
    if (scopedWidth) {
      setBrandLogoWidth(Number(scopedWidth) || defaultWidth);
    } else {
      const savedLogoWidth = localStorage.getItem("novajournal_brand_logo_width");
      if (savedLogoWidth) setBrandLogoWidth(Number(savedLogoWidth) || defaultWidth);
      else setBrandLogoWidth(defaultWidth);
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
          const planTier = (ws?.planTier || "pro").toLowerCase() as "basic" | "pro" | "enterprise";
          const hasEnterpriseTrial = wsId ? localStorage.getItem(`novajournal_enterprise_trial_${wsId}`) === "true" : false;
          const isEnterprise = Boolean(planTier === "enterprise" || hasEnterpriseTrial || localStorage.getItem("novajournal_enterprise_override") === "true");

          const scopedLogo = wsId ? localStorage.getItem(`novajournal_custom_brand_logo_${wsId}`) : null;
          const scopedName = wsId ? localStorage.getItem(`novajournal_custom_brand_name_${wsId}`) : null;
          const customBrandLogo = isEnterprise ? (scopedLogo || brandLogoOverride || ws?.customBrandLogo) : null;
          const customBrandName = isEnterprise ? (scopedName || brandNameOverride || ws?.customBrandName) : null;
          const customBrandJargon = isEnterprise ? ws?.customBrandJargon : null;
          const customBrandMode = (brandModeOverride || ws?.customBrandMode || "square").toLowerCase();
          const effectiveDisplayFormat = isEnterprise ? (brandDisplayFormat || ws?.customBrandDisplay || "logo-and-text").toLowerCase() : "logo-and-text";
          const hasCustomBrand = Boolean(isEnterprise && (customBrandName || customBrandLogo));
          const objectPosClass = brandLogoPlacement === "center" ? "object-center" : brandLogoPlacement === "right" ? "object-right" : "object-left";

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
                  {(() => {
                    const fullBannerH = 38;
                    const logoOnlyH = 38;
                    const logoAndTextH = 32;

                    // Compute true natural width of image based on measured aspect ratio
                    const safeRatio = Math.max(0.5, Math.min(10, logoAspectRatio || 3));
                    const fullBannerNatW = Math.round(fullBannerH * safeRatio);
                    const logoOnlyNatW = Math.round(logoOnlyH * safeRatio);
                    const logoAndTextNatW = Math.round(logoAndTextH * safeRatio);

                    // Compute container width:
                    // When unit is percent, calculate percent of the image's natural width!
                    // Symmetrical crop is achieved because the img is centered (left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2)
                    const getScaledContainerW = (natW: number, maxSpace: number) => {
                      if (brandLogoUnit === "percent") {
                        const scaled = Math.round(natW * (brandLogoWidth / 100));
                        return Math.min(maxSpace, Math.max(24, scaled));
                      } else {
                        return Math.min(maxSpace, Math.max(24, brandLogoWidth));
                      }
                    };

                    const fullBannerContainerW = getScaledContainerW(fullBannerNatW, 190);
                    const logoOnlyContainerW = getScaledContainerW(logoOnlyNatW, 190);
                    const logoAndTextContainerW = getScaledContainerW(logoAndTextNatW, 115);

                    const frameClass = brandLogoFrame === "bordered"
                      ? "border border-default-300 dark:border-default-700 p-0.5"
                      : brandLogoFrame === "card"
                      ? "bg-default-100/70 dark:bg-default-800/70 p-1 shadow-2xs"
                      : brandLogoFrame === "contrast"
                      ? "bg-white dark:bg-zinc-800 p-1 shadow-xs border border-default-200/60 dark:border-default-700/60"
                      : "";

                    const effectiveSubtext = brandSubtextMode === "none"
                      ? null
                      : brandSubtextMode === "entity"
                      ? (ws?.entityType || ws?.type?.toUpperCase() || "PT")
                      : (customBrandJargon || ws?.name || "Corporate Treasury");

                    return effectiveDisplayFormat === "full-banner" && customBrandLogo ? (
                      <div className={`flex-1 flex items-center min-w-0 pr-1 ${
                        brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                      }`}>
                        <div
                          style={{ width: `${fullBannerContainerW}px` }}
                          className={`relative h-10 shrink-0 overflow-hidden rounded-none select-none ${frameClass}`}
                        >
                          <img
                            key={`${customBrandLogo}-${brandVersion}`}
                            src={customBrandLogo}
                            alt="Corporate Banner"
                            style={{
                              width: `${fullBannerNatW}px`,
                              minWidth: `${fullBannerNatW}px`,
                              maxWidth: "none",
                              height: `${fullBannerH}px`,
                            }}
                            className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          />
                        </div>
                      </div>
                    ) : effectiveDisplayFormat === "logo-only" && customBrandLogo ? (
                      <div className={`flex-1 flex items-center min-w-0 ${
                        brandLogoPlacement === "center" ? "justify-center" : brandLogoPlacement === "right" ? "justify-end" : "justify-start"
                      }`}>
                        {customBrandMode === "wide" ? (
                          <div
                            style={{ width: `${logoOnlyContainerW}px` }}
                            className={`relative h-10 shrink-0 overflow-hidden rounded-none select-none ${frameClass}`}
                          >
                            <img
                              key={`${customBrandLogo}-${brandVersion}`}
                              src={customBrandLogo}
                              alt="Corporate Logo"
                              style={{
                                width: `${logoOnlyNatW}px`,
                                minWidth: `${logoOnlyNatW}px`,
                                maxWidth: "none",
                                height: `${logoOnlyH}px`,
                              }}
                              className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                            />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 shrink-0 overflow-hidden rounded-none shadow-2xs border border-default-200/60 dark:border-default-700/60 ${frameClass}`}>
                            <img
                              key={`${customBrandLogo}-${brandVersion}`}
                              src={customBrandLogo}
                              alt="Corporate Logo"
                              className="w-full h-full object-cover rounded-none select-none pointer-events-none"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {hasCustomBrand ? (
                          customBrandLogo ? (
                            customBrandMode === "wide" ? (
                              <div
                                style={{ width: `${logoAndTextContainerW}px` }}
                                className={`relative h-8.5 shrink-0 overflow-hidden rounded-none select-none ${frameClass}`}
                              >
                                <img
                                  key={`${customBrandLogo}-${brandVersion}`}
                                  src={customBrandLogo}
                                  alt="Company Logo"
                                  style={{
                                    width: `${logoAndTextNatW}px`,
                                    minWidth: `${logoAndTextNatW}px`,
                                    maxWidth: "none",
                                    height: `${logoAndTextH}px`,
                                  }}
                                  className="rounded-none select-none pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                />
                              </div>
                            ) : (
                              <div className={`w-7 h-7 shrink-0 overflow-hidden rounded-none shadow-2xs border border-default-200/60 dark:border-default-700/60 ${frameClass}`}>
                                <img
                                  key={`${customBrandLogo}-${brandVersion}`}
                                  src={customBrandLogo}
                                  alt="Company Logo"
                                  className="w-full h-full object-cover rounded-none select-none pointer-events-none"
                                />
                              </div>
                            )
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
                            {hasCustomBrand ? (
                              <span className="text-xs font-bold text-foreground truncate">
                                {customBrandName}
                              </span>
                            ) : (
                              <span className="text-xs font-extrabold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent truncate tracking-tight">
                                NovaFinance
                              </span>
                            )}
                            {effectiveSubtext && (
                              <span className="text-[9px] text-default-400 font-medium truncate">
                                {hasCustomBrand ? effectiveSubtext : "ProFinancial"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Tierlist Sleek Icon Badge (Show/Hide controlled by brandBadgeVisible & brandBadgeStyle) */}
                  {brandBadgeVisible && (
                    <div className="shrink-0 ml-1">
                      {isEnterprise ? (
                        <span
                          className={`flex items-center ${
                            brandBadgeStyle === "icon-only"
                              ? "p-1 rounded-md"
                              : brandBadgeStyle === "dot"
                              ? "p-1 rounded-full"
                              : "gap-1 px-1.5 py-0.5 rounded-md"
                          } bg-gradient-to-r from-violet-500/15 to-purple-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30 text-[9.5px] font-bold tracking-tight select-none shadow-2xs`}
                          title="Enterprise Tier Verified"
                        >
                          {brandBadgeStyle === "dot" ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.8)]" />
                          ) : (
                            <>
                              <Crown className="w-2.5 h-2.5 text-violet-500 shrink-0" />
                              {brandBadgeStyle !== "icon-only" && <span>Enterprise</span>}
                            </>
                          )}
                        </span>
                      ) : planTier === "pro" ? (
                        <span
                          className={`flex items-center ${
                            brandBadgeStyle === "icon-only"
                              ? "p-1 rounded-md"
                              : brandBadgeStyle === "dot"
                              ? "p-1 rounded-full"
                              : "gap-1 px-1.5 py-0.5 rounded-md"
                          } bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9.5px] font-bold tracking-tight select-none`}
                          title="Pro Tier"
                        >
                          {brandBadgeStyle === "dot" ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                          ) : brandBadgeStyle === "icon-only" ? (
                            <Sparkles className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                          ) : (
                            <>
                              <Sparkles className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                              <span>PRO</span>
                            </>
                          )}
                        </span>
                      ) : (
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
                      className="w-7 h-7 rounded-none object-contain shadow-2xs"
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
          {/* Corporate Brand Entity Header Strip above Overview */}
          {!collapsed && (
            <div className="mx-1 mb-2 px-2.5 py-1.5 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/60 dark:bg-default-900/40 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-3 h-3" />
                </div>
                <div className="min-w-0 leading-tight">
                  <span className="text-[11px] font-bold text-foreground truncate block">
                    {brandNameOverride || (selectedWorkspace as any)?.customBrandName || "PT Nova Solusi Finansial"}
                  </span>
                  <span className="text-[9px] text-default-400 truncate block">
                    {(selectedWorkspace as any)?.entityType || "Corporate Entity"} · {selectedWorkspace?.name || "Utama"}
                  </span>
                </div>
              </div>
              <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase shrink-0">
                {selectedWorkspace?.type || "PT"}
              </span>
            </div>
          )}

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
          {/* Relocated NovaFinance Brand (ONLY when custom enterprise brand is active at the top) */}
          {(() => {
            const ws = selectedWorkspace as any;
            const wsId = ws?.id;
            const planTier = (ws?.planTier || "pro").toLowerCase() as "basic" | "pro" | "enterprise";
            const hasEnterpriseTrial = wsId ? localStorage.getItem(`novajournal_enterprise_trial_${wsId}`) === "true" : false;
            const isEnterprise = Boolean(planTier === "enterprise" || hasEnterpriseTrial || localStorage.getItem("novajournal_enterprise_override") === "true");

            const scopedLogo = wsId ? localStorage.getItem(`novajournal_custom_brand_logo_${wsId}`) : null;
            const scopedName = wsId ? localStorage.getItem(`novajournal_custom_brand_name_${wsId}`) : null;
            const customBrandLogo = isEnterprise ? (scopedLogo || brandLogoOverride || ws?.customBrandLogo) : null;
            const customBrandName = isEnterprise ? (scopedName || brandNameOverride || ws?.customBrandName) : null;
            const hasCustomBrandTop = Boolean(isEnterprise && (customBrandName || customBrandLogo));

            // If top is already displaying NovaFinance, hide bottom Core Engine block
            if (!hasCustomBrandTop) return null;

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
