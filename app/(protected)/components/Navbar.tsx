"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Select,
  ListBox,
  Dropdown,
} from "@heroui/react";
import {
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  Settings,
  Building2,
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PieChart,
  Plus,
  ArrowRight,
  Target,
  Workflow,
  Landmark,
  ShieldCheck,
  Zap,
  User,
  Users,
  Lock,
  Check,
  Bell,
  BellRing,
  AlertCircle,
  CheckCheck,
  Clock,
  Palette,
  Globe,
  FileSpreadsheet,
  Calculator,
  FileCheck2,
  LayoutList,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { getEffectiveRole, ROLES } from "@/app/lib/rbac";
import { playNovaThemeSound, playSoftChime, playNovaSpaceSound, playRealisticClick } from "@/app/lib/sound";
import { api } from "@/app/lib/api";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";
import { triggerThemeTransition } from "./ThemeTransitionOverlay";

const NAVBAR_PALETTES = [
  { id: "blue", name: "Modern Blue", hex: "#2563eb" },
  { id: "violet", name: "Cyber Violet", hex: "#7c3aed" },
  { id: "emerald", name: "Emerald Growth", hex: "#059669" },
  { id: "amber", name: "Amber Wealth", hex: "#d97706" },
  { id: "rose", name: "Crimson Alpha", hex: "#e11d48" },
  { id: "slate", name: "Slate Corporate", hex: "#475569" },
] as const;

const CURRENCY_FIAT_MAP: Record<string, { symbol: string; flag: string; name: string }> = {
  IDR: { symbol: "Rp", flag: "🇮🇩", name: "Rupiah" },
  USD: { symbol: "$", flag: "🇺🇸", name: "US Dollar" },
  EUR: { symbol: "€", flag: "🇪🇺", name: "Euro" },
  SGD: { symbol: "S$", flag: "🇸🇬", name: "SG Dollar" },
  JPY: { symbol: "¥", flag: "🇯🇵", name: "Yen" },
};

function getCurrencyFiat(curr?: string) {
  const c = (curr || "IDR").toUpperCase();
  return CURRENCY_FIAT_MAP[c] || { symbol: c, flag: "🌐", name: c };
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "alert" | "finance" | "system";
  timestamp: string;
  unread: boolean;
  actionUrl?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Tagihan Cicilan KPR Rumah",
    description: "Pembayaran cicilan KPR sebesar Rp 5.250.000 jatuh tempo dalam 3 hari (22 Sep 2026).",
    category: "alert",
    timestamp: "10m lalu",
    unread: true,
    actionUrl: "/liabilities",
  },
  {
    id: "notif-2",
    title: "Dividen Saham BBCA Masuk",
    description: "Dividen tunai sebesar Rp 450.000 telah masuk ke RDN Mandiri Sekuritas.",
    category: "finance",
    timestamp: "2 jam lalu",
    unread: true,
    actionUrl: "/portfolio",
  },
  {
    id: "notif-3",
    title: "Peringatan Budget Dining 82%",
    description: "Pengeluaran kategori Makanan & Resto telah mencapai 82% dari pagu budget bulanan Anda.",
    category: "alert",
    timestamp: "5 jam lalu",
    unread: true,
    actionUrl: "/transactions",
  },
  {
    id: "notif-4",
    title: "LPS Guarantee Limit Check",
    description: "Saldo likuiditas di Bank BCA (Rp 84.5jt) aman di bawah plafon penjaminan LPS Rp 2 Miliar.",
    category: "system",
    timestamp: "1 hari lalu",
    unread: false,
    actionUrl: "/wallets",
  },
];

interface NavbarProps {
  onToggleSidebar?: () => void;
}

interface SearchMenuItem {
  id: string;
  label: string;
  path: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const searchMenuItems: SearchMenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    group: "Overview",
    icon: LayoutDashboard,
    description: "Financial metrics, balance & recent activities",
  },
  {
    id: "transactions",
    label: "Transactions",
    path: "/transactions",
    group: "Overview",
    icon: Wallet,
    description: "View, filter and manage transaction records",
  },
  {
    id: "wallets",
    label: "Wallets & Accounts",
    path: "/wallets",
    group: "Overview",
    icon: Landmark,
    description: "Manage bank accounts, e-wallets, cash, and balances",
  },
  {
    id: "new-transaction",
    label: "New Transaction",
    path: "/transactions/new",
    group: "Overview",
    icon: Plus,
    description: "Record new income or expense transaction",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    path: "/workspaces",
    group: "Management",
    icon: Building2,
    description: "Switch, configure and create workspaces",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    path: "/portfolio",
    group: "Management",
    icon: TrendingUp,
    description: "Track investment assets and performance",
  },
  {
    id: "goals",
    label: "Goals & Wishlist",
    path: "/goals",
    group: "Planning",
    icon: Target,
    description: "Financial targets, wishlist and saving plans",
  },
  {
    id: "money-flow",
    label: "Money Flow",
    path: "/money-flow",
    group: "Planning",
    icon: Workflow,
    description: "Interactive visual cashflow and budget allocation flow",
  },
  {
    id: "financial-statement",
    label: "Laporan Keuangan",
    path: "/reports/financial-statement",
    group: "Reporting",
    icon: FileSpreadsheet,
    description: "Laporan laba rugi, neraca keuangan, dan arus kas komprehensif",
  },
  {
    id: "tax-compliance",
    label: "Kepatuhan Pajak (Tax)",
    path: "/reports/tax-compliance",
    group: "Reporting",
    icon: Calculator,
    description: "Rekonsiliasi fiskal, kepatuhan SPT, PPh 21/23, dan PPN",
  },
  {
    id: "budget-variance",
    label: "Varian Realisasi Anggaran",
    path: "/reports/budget-variance",
    group: "Reporting",
    icon: FileCheck2,
    description: "Analisis komparasi anggaran disetujui vs realisasi aktual",
  },
  {
    id: "analytics",
    label: "Analytics",
    path: "/analytics",
    group: "System",
    icon: PieChart,
    description: "Visual charts, income vs expense breakdowns",
  },
  {
    id: "rbac",
    label: "Users & RBAC",
    path: "/users",
    group: "System",
    icon: Users,
    description: "Workspace team members, role privileges, and RBAC matrix",
  },
  {
    id: "settings",
    label: "Settings Hub",
    path: "/settings",
    group: "Settings & Configuration",
    icon: Settings,
    description: "Central preferences, shortcuts and audio settings",
  },
  {
    id: "regional",
    label: "Regional, Currency & Date Format",
    path: "/regional",
    group: "Settings & Configuration",
    icon: Globe,
    description: "Base currency, financial date format, decimal separator, and timezone",
  },
  {
    id: "profile",
    label: "User Profile",
    path: "/profile",
    group: "Settings & Configuration",
    icon: User,
    description: "Avatar crop, bio, professional job title and email",
  },
  {
    id: "brand",
    label: "Company Brand & Identity",
    path: "/brand",
    group: "Settings & Configuration",
    icon: Building2,
    description: "Corporate logo, brand name, sidebar badge, and white-label",
  },
  {
    id: "appearance",
    label: "Appearance & Theme",
    path: "/appearance",
    group: "Settings & Configuration",
    icon: Palette,
    description: "Dark/light mode, custom hex colors, font selector, and UI density",
  },
  {
    id: "content-management",
    label: "Content & Menu Management",
    path: "/content-management",
    group: "Settings & Configuration",
    icon: LayoutList,
    description: "Atur visibilitas hide/show menu, urutan navigasi, dan custom layout",
  },
  {
    id: "ai-hub",
    label: "AI Hub & Copilot",
    path: "/ai-hub",
    group: "Settings & Configuration",
    icon: Zap,
    description: "API keys (Gemini, Groq, DeepSeek, Claude), persona, and TTS voice",
  },
  {
    id: "security",
    label: "Security & Vault",
    path: "/security",
    group: "Settings & Configuration",
    icon: ShieldCheck,
    description: "TLS 1.3 encryption, active sessions, and multi-tenant security",
  },
];

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { workspaces, selectedWorkspace, setSelectedWorkspace, loading, refreshWorkspaces } = useWorkspace();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDarkTheme = mounted && (resolvedTheme === "dark" || theme === "dark");
  const { lang, setLang, t, isId } = useIntlLanguage();

  // Notifications Prototype State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread" | "alert">("all");
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Custom Avatar (supports animated GIF, WebP, PNG)
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const updateAvatar = () => {
      try {
        const av = localStorage.getItem("novajournal_user_avatar");
        setCustomAvatar(av || (user as any)?.image || null);
      } catch {
        setCustomAvatar((user as any)?.image || null);
      }
    };
    updateAvatar();

    // Fetch database profile if not yet cached or to ensure fresh avatar
    api.getUserProfile().then((res) => {
      if (isMounted && res.success && res.data?.image) {
        setCustomAvatar(res.data.image);
        try {
          localStorage.setItem("novajournal_user_avatar", res.data.image);
        } catch {}
      }
    }).catch(() => {});

    window.addEventListener("novajournal_avatar_changed", updateAvatar);
    window.addEventListener("storage", updateAvatar);
    return () => {
      isMounted = false;
      window.removeEventListener("novajournal_avatar_changed", updateAvatar);
      window.removeEventListener("storage", updateAvatar);
    };
  }, [user]);

  // Brand Logo and Custom Name sync
  const [navBrandLogo, setNavBrandLogo] = useState<string | null>(null);
  const [navBrandMode, setNavBrandMode] = useState<"square" | "wide">("square");
  const [navBrandName, setNavBrandName] = useState<string | null>(null);

  useEffect(() => {
    const updateBrand = () => {
      const ws = selectedWorkspace as any;
      const cachedLogo = localStorage.getItem("novajournal_custom_brand_logo");
      const cachedMode = localStorage.getItem("novajournal_brand_logo_mode") as any;
      const cachedName = localStorage.getItem("novajournal_custom_brand_name");
      setNavBrandLogo(cachedLogo || ws?.customBrandLogo || null);
      if (cachedMode === "square" || cachedMode === "wide") setNavBrandMode(cachedMode);
      else if (ws?.customBrandMode === "square" || ws?.customBrandMode === "wide") setNavBrandMode(ws.customBrandMode);
      setNavBrandName(cachedName || ws?.customBrandName || null);
    };
    updateBrand();
    window.addEventListener("novajournal_brand_config_changed", updateBrand);
    window.addEventListener("storage", updateBrand);
    return () => {
      window.removeEventListener("novajournal_brand_config_changed", updateBrand);
      window.removeEventListener("storage", updateBrand);
    };
  }, [selectedWorkspace]);

  // Theme Palette Selection State & Sync
  const [activePalette, setActivePalette] = useState("blue");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("novajournal_theme_palette");
      if (saved) setActivePalette(saved);
    } catch {}

    const onPaletteChanged = (e: any) => {
      if (e.detail) setActivePalette(e.detail);
    };
    window.addEventListener("novajournal_palette_changed", onPaletteChanged);
    return () => window.removeEventListener("novajournal_palette_changed", onPaletteChanged);
  }, []);

  const handleSelectPalette = (palId: string) => {
    playNovaSpaceSound();
    setActivePalette(palId);
    try {
      localStorage.setItem("novajournal_theme_palette", palId);
      document.documentElement.setAttribute("data-palette", palId);
      window.dispatchEvent(new CustomEvent("novajournal_palette_changed", { detail: palId }));
    } catch {}
  };

  const markAllAsRead = () => {
    playSoftChime();
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markOneAsRead = (id: string, url?: string) => {
    playSoftChime();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    if (url) router.push(url);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === "unread") return n.unread;
    if (notifFilter === "alert") return n.category === "alert";
    return true;
  });

  const [activeRole, setActiveRole] = useState<string>("owner");
  useEffect(() => {
    const syncRole = () => {
      const r = getEffectiveRole((selectedWorkspace as any)?.role);
      setActiveRole(r);
    };
    syncRole();
    window.addEventListener("novajournal_role_change", syncRole);
    return () => window.removeEventListener("novajournal_role_change", syncRole);
  }, [selectedWorkspace]);

  const switchLang = (target: "en" | "id") => {
    playRealisticClick(0.3);
    setLang(target);
  };

  // Granular Navbar Appearance States
  const [navbarDensity, setNavbarDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [navbarHeightPx, setNavbarHeightPx] = useState(56);
  const [navbarStickyGlass, setNavbarStickyGlass] = useState(true);
  const [navbarGlassBg, setNavbarGlassBg] = useState(true);
  const [showOnlinePing, setShowOnlinePing] = useState(true);
  const [showRoleBadge, setShowRoleBadge] = useState(true);
  const [showFiatPill, setShowFiatPill] = useState(true);
  const [showLangSwitcher, setShowLangSwitcher] = useState(true);
  const [navbarAvatarSize, setNavbarAvatarSize] = useState<number>(28);

  useEffect(() => {
    const loadNavbarPrefs = () => {
      const den = localStorage.getItem("novajournal_navbar_density") as any;
      if (den === "compact" || den === "comfortable" || den === "spacious") setNavbarDensity(den);
      const navHCustom = localStorage.getItem("novajournal_navbar_height_custom");
      let computedNavH = den === "compact" ? 48 : den === "spacious" ? 64 : 56;
      if (navHCustom) computedNavH = Number(navHCustom) || computedNavH;
      setNavbarHeightPx(computedNavH);

      const sticky = localStorage.getItem("novajournal_navbar_sticky_glass");
      if (sticky !== null) setNavbarStickyGlass(sticky !== "false");

      const glassBg = localStorage.getItem("novajournal_navbar_glass_bg");
      if (glassBg !== null) setNavbarGlassBg(glassBg !== "false");

      const ping = localStorage.getItem("novajournal_navbar_online_ping");
      if (ping !== null) setShowOnlinePing(ping !== "false");

      const role = localStorage.getItem("novajournal_navbar_role_badge");
      if (role !== null) setShowRoleBadge(role !== "false");

      const fiat = localStorage.getItem("novajournal_navbar_fiat_pill");
      if (fiat !== null) setShowFiatPill(fiat !== "false");

      const langSwitch = localStorage.getItem("novajournal_navbar_lang_switcher");
      if (langSwitch !== null) setShowLangSwitcher(langSwitch !== "false");

      const savedAvatarSize = localStorage.getItem("novajournal_navbar_avatar_size");
      if (savedAvatarSize) setNavbarAvatarSize(Number(savedAvatarSize) || 28);
    };
    loadNavbarPrefs();
    window.addEventListener("novajournal_appearance_config_changed", loadNavbarPrefs);
    window.addEventListener("novajournal_navbar_config_changed", loadNavbarPrefs);
    window.addEventListener("novajournal_avatar_changed", loadNavbarPrefs);
    window.addEventListener("storage", loadNavbarPrefs);
    return () => {
      window.removeEventListener("novajournal_appearance_config_changed", loadNavbarPrefs);
      window.removeEventListener("novajournal_navbar_config_changed", loadNavbarPrefs);
      window.removeEventListener("novajournal_avatar_changed", loadNavbarPrefs);
      window.removeEventListener("storage", loadNavbarPrefs);
    };
  }, []);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filtered menu items for search
  const filteredMenuItems = searchQuery.trim() === ""
    ? searchMenuItems
    : searchMenuItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Handle outside click for search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation for search (Ctrl+K, Esc, Arrow keys, Enter)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const navigateToMenu = (path: string) => {
    router.push(path);
    setIsSearchOpen(false);
    setSearchQuery("");
    searchInputRef.current?.blur();
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen && e.key !== "Escape") {
      setIsSearchOpen(true);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev + 1) % Math.max(1, filteredMenuItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSearchIndex((prev) => (prev - 1 + filteredMenuItems.length) % Math.max(1, filteredMenuItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredMenuItems.length > 0 && filteredMenuItems[activeSearchIndex]) {
        navigateToMenu(filteredMenuItems[activeSearchIndex].path);
      }
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: "My Workspace",
          type: "personal",
          currency: "IDR",
        }),
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
      } else {
        console.error("Failed to create workspace:", data.error);
      }
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  return (
    <header
      style={{ height: `var(--navbar-height, ${navbarHeightPx}px)` }}
      className={`${
        navbarStickyGlass ? "sticky top-0 z-40" : "relative"
      } ${
        navbarGlassBg
          ? "backdrop-blur-md bg-white/40 dark:bg-gray-950/40"
          : "bg-white dark:bg-gray-950"
      } ${
        navbarDensity === "compact" ? "px-2.5 md:px-3" : "px-3 md:px-4"
      } border-b border-default-200/60 dark:border-default-800/60 shadow-2xs flex items-center justify-between shrink-0 transition-all`}
    >
      {/* Left - Mobile Sidebar Toggle & HeroUI Workspace Selector (No plus button) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Sidebar Toggle */}
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          onClick={onToggleSidebar}
          className="h-7.5 w-7.5 cursor-pointer md:hidden text-default-600"
          aria-label="Toggle Menu"
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Workspace Selector Dropdown with Fiat Currency & Audio Feedback */}
        <div className="flex items-center">
          {workspaces.length > 0 ? (
            <Dropdown>
              <Dropdown.Trigger
                className="h-9 px-2.5 sm:px-3 rounded-xl border border-default-200/60 dark:border-default-700/60 bg-default-100/60 dark:bg-default-800/40 hover:bg-default-100 dark:hover:bg-default-800/80 shadow-2xs backdrop-blur-sm transition-all flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-left max-w-72 select-none"
                aria-label="Pilih Workspace"
              >
                {/* Brand / Entity Icon (Strict Square Profile) */}
                {navBrandLogo ? (
                  <img
                    src={navBrandLogo}
                    alt="Logo"
                    className="w-5.5 h-5.5 aspect-square rounded-md object-cover shrink-0 border border-default-200/80 dark:border-default-700/80 bg-default-100/80 dark:bg-default-800/80 shadow-2xs"
                  />
                ) : (
                  <div
                    className={`w-5.5 h-5.5 aspect-square rounded-md flex items-center justify-center shrink-0 border shadow-2xs ${
                      selectedWorkspace?.type === "pt" || selectedWorkspace?.type === "BUSINESS"
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20"
                        : selectedWorkspace?.type === "umkm"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    }`}
                  >
                    <Building2 className="w-3 h-3" />
                  </div>
                )}

                {/* Workspace / Brand Name */}
                <span className="truncate text-xs font-semibold text-foreground max-w-[120px] sm:max-w-[160px] tracking-tight">
                  {navBrandName || selectedWorkspace?.name || "Pilih Workspace"}
                </span>

                {/* Clean Currency Badge */}
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0 uppercase tracking-wider">
                  {selectedWorkspace?.currency || "IDR"}
                </span>

                <ChevronDown className="w-3.5 h-3.5 text-default-400 shrink-0 ml-auto transition-transform" />
              </Dropdown.Trigger>

              <Dropdown.Popover className="min-w-72 z-50 p-2 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl border border-default-200/90 dark:border-default-800">
                {/* Header */}
                <div className="px-2.5 py-2 mb-1 border-b border-default-100 dark:border-default-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-bold text-foreground">Workspace & Entitas</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400">
                    {workspaces.length} Entitas
                  </span>
                </div>

                {/* Workspaces List */}
                <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
                  {workspaces.map((ws) => {
                    const isSelected = selectedWorkspace?.id === ws.id;
                    const wsType = (ws.type || "personal").toUpperCase();
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          if (!isSelected) {
                            playSoftChime();
                            setSelectedWorkspace(ws);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all text-left border ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/30 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold"
                            : "border-transparent hover:bg-default-100/70 dark:hover:bg-default-800/70 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {(ws as any)?.customBrandLogo ? (
                            <img
                              src={(ws as any).customBrandLogo}
                              alt={(ws as any)?.customBrandName || ws.name}
                              className={`w-7 h-7 rounded-lg object-cover shrink-0 border shadow-2xs ${
                                isSelected
                                  ? "border-blue-500/40"
                                  : "border-default-200/80 dark:border-default-700/80"
                              }`}
                            />
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? "bg-blue-500 text-white shadow-2xs"
                                  : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-300"
                              }`}
                            >
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-foreground leading-tight">
                              {(ws as any)?.customBrandName || ws.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-default-400 mt-0.5">
                              <span className="font-semibold text-default-500">{wsType}</span>
                              <span>•</span>
                              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                {ws.currency || "IDR"}
                              </span>
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0 ml-2">
                            <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Action: Clean Single-Plus Add Workspace */}
                <div className="mt-2 pt-2 border-t border-default-100 dark:border-default-800 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playSoftChime();
                      router.push("/workspaces");
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Workspace Baru</span>
                  </button>
                </div>
              </Dropdown.Popover>
            </Dropdown>
          ) : (
            <Button
              size="sm"
              className="h-7.5 px-2.5 text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white cursor-pointer shadow-2xs"
              onClick={handleCreateWorkspace}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Workspace
            </Button>
          )}
        </div>
      </div>

      {/* Center - Menu Search with Quick Results Dropdown */}
      <div className="flex-1 max-w-sm mx-3 sm:mx-6 relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-default-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="search"
            name="novajournal-nav-cmd-search"
            id="novajournal-nav-cmd-search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            aria-autocomplete="list"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
              setActiveSearchIndex(0);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleSearchInputKeyDown}
            placeholder="Search menu or page... (Ctrl+K)"
            className="w-full h-7.5 pl-8 pr-12 rounded-lg border border-default-200/80 dark:border-default-700/80 bg-default-100/70 dark:bg-default-800/50 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-default-400 bg-default-200/50 dark:bg-default-700/50 rounded pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Menu Search Dropdown Results */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-xl shadow-xl z-50 overflow-hidden py-1 max-h-80 overflow-y-auto">
            <div className="px-2.5 py-1 text-[10px] font-semibold text-default-400 uppercase tracking-wider border-b border-default-100 dark:border-default-800 flex items-center justify-between">
              <span>Navigation Results</span>
              <span className="text-[9px] font-normal normal-case">
                {filteredMenuItems.length} found
              </span>
            </div>

            {filteredMenuItems.length === 0 ? (
              <div className="py-6 text-center text-default-400 text-xs">
                No matching menu found
              </div>
            ) : (
              <div className="p-1 space-y-0.5">
                {filteredMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === activeSearchIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateToMenu(item.path)}
                      onMouseEnter={() => setActiveSearchIndex(index)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "hover:bg-default-100 dark:hover:bg-default-800 text-foreground"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-500 text-white"
                            : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">{item.label}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-default-200/60 dark:bg-default-800 text-default-500">
                            {item.group}
                          </span>
                        </div>
                        <p className="text-[10px] text-default-400 truncate leading-tight">
                          {item.description}
                        </p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-default-300 opacity-0 group-hover:opacity-100 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right - Online Status, Role Badge, Theme Toggler & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Online Status Indicator Badge */}
        {showOnlinePing && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold select-none shadow-2xs"
            title="Status Akun: Online & Terkoneksi"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] tracking-wide">Online</span>
          </div>
        )}

        {/* Role Type UI Badge */}
        {showRoleBadge &&
          (() => {
            const currentRole = (activeRole || "owner").toUpperCase();
            const isOwner = currentRole === "OWNER";
            const isAdmin = currentRole === "ADMIN";
            const isStaff = currentRole === "STAFF";
            const isViewer = currentRole === "VIEWER";

            return (
              <div
                className={`hidden md:flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border shadow-2xs ${
                  isOwner
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : isAdmin
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                    : isStaff
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    : "bg-default-100 text-default-600 dark:text-default-400 border-default-200 dark:border-default-700"
                }`}
                title={`Role Akses: ${currentRole} (Click Users & RBAC to manage)`}
              >
                {isOwner && <ShieldCheck className="w-3 h-3 text-amber-500" />}
                {isAdmin && <Zap className="w-3 h-3 text-purple-500" />}
                {isStaff && <User className="w-3 h-3 text-blue-500" />}
                {isViewer && <Lock className="w-3 h-3 text-default-400" />}
                <span>{currentRole}</span>
              </div>
            );
          })()}

        {/* Quick Language Switcher */}
        {showLangSwitcher && (
          <div className="flex items-center bg-default-100/80 dark:bg-default-800/60 p-0.5 rounded-lg border border-default-200/60 dark:border-default-700/60 text-[10px] font-bold select-none">
            <button
              type="button"
              onClick={() => switchLang("en")}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                lang === "en"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-default-400 hover:text-foreground"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => switchLang("id")}
              className={`px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                lang === "id"
                  ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-default-400 hover:text-foreground"
              }`}
            >
              ID
            </button>
          </div>
        )}

        {/* Notification Bell Dropdown (Prototype) */}
        <Dropdown>
          <Dropdown.Trigger
            className="h-7.5 w-7.5 relative inline-flex items-center justify-center rounded-lg border border-default-200/80 dark:border-default-700/80 bg-default-100/70 hover:bg-default-200/60 dark:bg-default-800/60 dark:hover:bg-default-700/60 transition-colors cursor-pointer text-default-600 hover:text-foreground outline-none"
            aria-label="Notifikasi Keuangan"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </Dropdown.Trigger>

          <Dropdown.Popover className="w-80 sm:w-96 z-50 p-0 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800 overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-default-100 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BellRing className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Notifikasi Keuangan</h4>
                  <p className="text-[10px] text-default-400 font-mono">
                    {unreadCount} belum dibaca • Prototype
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Tandai Semua</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="p-2 border-b border-default-100 dark:border-default-800 flex items-center gap-1.5 text-[10px]">
              {(["all", "unread", "alert"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setNotifFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    notifFilter === tab
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-default-100 hover:bg-default-200 dark:bg-default-800 text-default-500"
                  }`}
                >
                  {tab === "all" ? "Semua" : tab === "unread" ? "Belum Dibaca" : "Tagihan & Alert"}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-default-100 dark:divide-default-800/60 p-1">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-default-400">
                  Tidak ada notifikasi aktif
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markOneAsRead(n.id, n.actionUrl)}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 ${
                      n.unread
                        ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        : "hover:bg-default-100 dark:hover:bg-default-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.unread ? "bg-blue-500 animate-pulse" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                        <span className="text-[9px] text-default-400 font-mono shrink-0 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-default-500 mt-0.5 leading-snug">
                        {n.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-default-100 dark:border-default-800 text-center bg-default-50/30 dark:bg-default-900/30">
              <span className="text-[10px] text-default-400">
                Notifikasi otomatis terhubung dengan jadwal liabilities & target portfolio.
              </span>
            </div>
          </Dropdown.Popover>
        </Dropdown>

        {/* Quick Theme Switcher */}
        {mounted && (
          <Button
            size="sm"
            variant="ghost"
            isIconOnly
            onClick={() => {
              const nextTheme = (resolvedTheme === "dark" || theme === "dark") ? "light" : "dark";
              triggerThemeTransition(nextTheme);
            }}
            className="h-7.5 w-7.5 cursor-pointer text-default-600 hover:text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
            )}
          </Button>
        )}

        {/* HeroUI User Dropdown */}
        <Dropdown>
          <Dropdown.Trigger
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg bg-default-100/70 hover:bg-default-200/70 dark:bg-default-800/50 dark:hover:bg-default-700/60 transition-colors cursor-pointer text-left outline-none border border-transparent hover:border-default-200 dark:hover:border-default-700"
            aria-label="User account menu"
          >
            {/* Avatar with live green online indicator ring */}
            <div className="relative shrink-0">
              <div
                style={{ width: `${navbarAvatarSize}px`, height: `${navbarAvatarSize}px` }}
                className="rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shadow-2xs overflow-hidden shrink-0 transition-all"
              >
                {customAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={customAvatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              {showOnlinePing && (
                <span
                  style={{
                    width: `${Math.max(6, Math.min(14, Math.round(navbarAvatarSize * 0.25)))}px`,
                    height: `${Math.max(6, Math.min(14, Math.round(navbarAvatarSize * 0.25)))}px`,
                    bottom: `${Math.max(-2, Math.round(navbarAvatarSize * -0.05))}px`,
                    right: `${Math.max(-2, Math.round(navbarAvatarSize * -0.05))}px`,
                  }}
                  className="absolute rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 animate-pulse"
                />
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left max-w-28">
              <span className="text-xs font-semibold text-foreground truncate leading-tight">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] text-default-500 truncate leading-tight">
                {user?.email || "user@example.com"}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-default-400 shrink-0 ml-0.5" />
          </Dropdown.Trigger>
          <Dropdown.Popover className="min-w-64 sm:min-w-72 z-50 p-2 shadow-2xl bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800">
            {/* User Profile Card Header */}
            {(() => {
              const userRoleKey = ((selectedWorkspace as any)?.role || "owner").toLowerCase() as keyof typeof ROLES;
              const roleConfig = ROLES[userRoleKey] || ROLES.owner;

              return (
                <div className="p-3 mb-2 rounded-xl bg-default-100/70 dark:bg-default-800/60 border border-default-200/60 dark:border-default-700/50 space-y-2.5">
                  <div className="flex items-center gap-3">
                    {/* Enlarged 3x Avatar (~w-16 h-16) */}
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 p-0.5 shadow-md shadow-blue-500/20">
                        <div className="w-full h-full rounded-[14px] bg-default-100 dark:bg-default-800 overflow-hidden flex items-center justify-center">
                          {customAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={customAvatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                              {user?.name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                    </div>

                    {/* Name, Email & Role Tag */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-bold text-foreground truncate">{user?.name || "Alexander Vance"}</p>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border uppercase ${roleConfig.badgeBg} ${roleConfig.badgeText} ${roleConfig.badgeBorder}`}>
                          {roleConfig.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-default-500 truncate mt-0.5">{user?.email || "alexander@novafinance.io"}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-[10px] text-default-400 truncate">
                          WS: <strong className="text-foreground">{selectedWorkspace?.name || "Utama"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role Privilege & Capabilities Overview */}
                  <div className="pt-2 border-t border-default-200/50 dark:border-default-700/40 text-[10px] text-default-500 flex items-start gap-1.5 leading-relaxed">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{roleConfig.description}</span>
                  </div>
                </div>
              );
            })()}

            {/* Color Palette Selector in Profile Popup */}
            <div className="p-2.5 mb-1.5 rounded-xl bg-default-100/70 dark:bg-default-800/60 border border-default-200/50 dark:border-default-700/40 select-none space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-theme-primary" />
                  <span>Palet Warna HeroUI</span>
                </span>
                <span className="text-[10px] font-mono uppercase text-default-400 font-semibold">
                  {activePalette}
                </span>
              </div>

              {/* 6 Palette Swatches */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                {NAVBAR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    title={pal.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPalette(pal.id);
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${
                      activePalette === pal.id
                        ? "border-white dark:border-default-100 scale-115 shadow-md shadow-black/20"
                        : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: pal.hex,
                    }}
                  >
                    {activePalette === pal.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>

              {/* Shortcut to Settings Appearance Anchor */}
              <div className="pt-1.5 border-t border-default-200/40 dark:border-default-700/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSoftChime();
                    router.push("/settings#section-appearance");
                  }}
                  className="text-[11px] font-semibold text-theme-primary hover:underline flex items-center gap-1 cursor-pointer w-full justify-between"
                >
                  <span>Atur Tampilan & Mode Gelap</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            <Dropdown.Menu
              aria-label="User actions"
              onAction={(key) => {
                if (key === "profile") router.push("/profile");
                else if (key === "settings") router.push("/settings");
                else if (key === "regional") router.push("/regional");
                else if (key === "workspaces") router.push("/workspaces");
                else if (key === "theme") {
                  const nextTheme = theme === "dark" ? "light" : "dark";
                  playNovaThemeSound(nextTheme === "dark");
                  setTheme(nextTheme);
                } else if (key === "logout") {
                  logout();
                  router.push("/login");
                }
              }}
              className="outline-none space-y-0.5 text-xs"
            >
              <Dropdown.Section>
                <Dropdown.Item
                  id="profile"
                  textValue="Profile & Brand"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <User className="w-3.5 h-3.5 text-default-500" />
                  <span>Profile & Brand</span>
                </Dropdown.Item>
                <Dropdown.Item
                  id="settings"
                  textValue="Settings"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <Settings className="w-3.5 h-3.5 text-default-500" />
                  <span>{isId ? "Pusat Pengaturan" : "Account Settings"}</span>
                </Dropdown.Item>
                <Dropdown.Item
                  id="regional"
                  textValue="Regional & Formats"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <Globe className="w-3.5 h-3.5 text-default-500" />
                  <span>{isId ? "Format Regional & Tanggal" : "Regional & Date Formats"}</span>
                </Dropdown.Item>
                <Dropdown.Item
                  id="workspaces"
                  textValue="Workspaces"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <Building2 className="w-3.5 h-3.5 text-default-500" />
                  <span>Workspaces</span>
                </Dropdown.Item>
                <Dropdown.Item
                  id="theme"
                  textValue="Toggle Theme"
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none"
                >
                  <div className="flex items-center gap-2">
                    {theme === "dark" ? (
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                    ) : (
                      <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                    <span>Theme: {theme === "dark" ? "Dark" : "Light"}</span>
                  </div>
                  <span className="text-[10px] text-default-400 font-mono">Toggle</span>
                </Dropdown.Item>
              </Dropdown.Section>

              <Dropdown.Section>
                <Dropdown.Item
                  id="logout"
                  textValue="Logout"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-danger hover:bg-danger/10 cursor-pointer mt-0.5 outline-none font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-danger" />
                  <span>Logout</span>
                </Dropdown.Item>
              </Dropdown.Section>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
      </div>
    </header>
  );
}
