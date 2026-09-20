/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import {
  LayoutList,
  SlidersHorizontal,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Compass,
  BellRing,
  Megaphone,
  ShieldCheck,
  Layers,
  LayoutDashboard,
  Wallet,
  Landmark,
  PieChart,
  Target,
  Scale,
  Workflow,
  TrendingUp,
  Building2,
  FileSpreadsheet,
  Calculator,
  FileCheck2,
  Settings,
  Globe,
  UserCheck,
  Crown,
  Palette,
  Cpu,
  Users,
  ScrollText,
  Search,
} from "lucide-react";
import {
  playNovaThemeSound,
  playSoftChime,
  playNovaSpaceSound,
  playRealisticClick,
} from "@/app/lib/sound";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";
import { triggerNovaToast, NovaToastContainer } from "@/app/(protected)/components/NovaToast";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const CONTENT_SECTIONS = [
  { id: "menu-visibility", name: "Visibilitas Menu Sidebar", shortName: "Menu", icon: Eye, color: "#3b82f6" },
  { id: "navigation-mode", name: "Gaya & Perilaku Navigasi", shortName: "Navigasi", icon: Compass, color: "#8b5cf6" },
  { id: "quick-actions", name: "Aksi Cepat & Shortcut Bar", shortName: "Shortcut", icon: SlidersHorizontal, color: "#06b6d4" },
  { id: "announcement", name: "Banner Pengumuman Workspace", shortName: "Banner", icon: Megaphone, color: "#f59e0b" },
  { id: "role-rules", name: "Hak Akses & Matriks Role", shortName: "Role RBAC", icon: ShieldCheck, color: "#10b981" },
];

interface MenuItemConfig {
  id: string;
  defaultLabel: string;
  customLabel?: string;
  path: string;
  group: string;
  icon: React.ElementType;
  visible: boolean;
  requiredRole?: string;
}

const INITIAL_MENUS: MenuItemConfig[] = [
  // Overview
  { id: "dashboard", defaultLabel: "Dashboard", path: "/dashboard", group: "Overview", icon: LayoutDashboard, visible: true },
  { id: "transactions", defaultLabel: "Transaksi", path: "/transactions", group: "Overview", icon: Wallet, visible: true },
  { id: "wallets", defaultLabel: "Dompet & Rekening", path: "/wallets", group: "Overview", icon: Landmark, visible: true, requiredRole: "Staff+" },
  { id: "analytics", defaultLabel: "Analitik Keuangan", path: "/analytics", group: "Overview", icon: PieChart, visible: true },

  // Planning & Assets
  { id: "goals", defaultLabel: "Target & Impian", path: "/goals", group: "Planning & Assets", icon: Target, visible: true },
  { id: "liabilities", defaultLabel: "Liabilities Matrix", path: "/liabilities", group: "Planning & Assets", icon: Scale, visible: true },
  { id: "moneyflow", defaultLabel: "Topologi Arus Kas", path: "/money-flow", group: "Planning & Assets", icon: Workflow, visible: true },
  { id: "portfolio", defaultLabel: "Portofolio & Saham", path: "/portfolio", group: "Planning & Assets", icon: TrendingUp, visible: true },
  { id: "workspaces", defaultLabel: "Workspaces", path: "/workspaces", group: "Planning & Assets", icon: Building2, visible: true, requiredRole: "Admin" },

  // Reporting & Finance
  { id: "financial-statement", defaultLabel: "Laporan Keuangan", path: "/reports/financial-statement", group: "Reporting & Finance", icon: FileSpreadsheet, visible: true, requiredRole: "Staff+" },
  { id: "tax-compliance", defaultLabel: "Kepatuhan Pajak (Tax)", path: "/reports/tax-compliance", group: "Reporting & Finance", icon: Calculator, visible: true, requiredRole: "Admin" },
  { id: "budget-variance", defaultLabel: "Varian Realisasi Anggaran", path: "/reports/budget-variance", group: "Reporting & Finance", icon: FileCheck2, visible: true, requiredRole: "Staff+" },

  // Settings & Configuration
  { id: "settings", defaultLabel: "Settings Hub", path: "/settings", group: "Settings & Configuration", icon: Settings, visible: true, requiredRole: "Admin" },
  { id: "regional", defaultLabel: "Regional & Format", path: "/regional", group: "Settings & Configuration", icon: Globe, visible: true },
  { id: "profile", defaultLabel: "Profil Pengguna", path: "/profile", group: "Settings & Configuration", icon: UserCheck, visible: true },
  { id: "brand", defaultLabel: "Identitas Brand", path: "/brand", group: "Settings & Configuration", icon: Crown, visible: true, requiredRole: "Admin" },
  { id: "appearance", defaultLabel: "Tampilan & Tema", path: "/appearance", group: "Settings & Configuration", icon: Palette, visible: true },
  { id: "content-management", defaultLabel: "Manajemen Menu & Konten", path: "/content-management", group: "Settings & Configuration", icon: LayoutList, visible: true, requiredRole: "Admin" },
  { id: "aihub", defaultLabel: "AI Hub & Copilot", path: "/ai-hub", group: "Settings & Configuration", icon: Cpu, visible: true },
  { id: "security", defaultLabel: "Keamanan & Vault", path: "/security", group: "Settings & Configuration", icon: ShieldCheck, visible: true },

  // Governance & Access
  { id: "users", defaultLabel: "Users & RBAC", path: "/users", group: "Governance & Access", icon: Users, visible: true, requiredRole: "Admin" },
  { id: "logs", defaultLabel: "Audit Logs", path: "/logs", group: "Governance & Access", icon: ScrollText, visible: true, requiredRole: "Admin" },
];

export default function ContentManagementPage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const { isId } = useIntlLanguage();

  // Folded / Accordion sections state
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    "menu-visibility": false,
    "navigation-mode": false,
    "quick-actions": false,
    "announcement": false,
    "role-rules": false,
  });

  const [activeSectionId, setActiveSectionId] = useState("menu-visibility");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Menu items state
  const [menus, setMenus] = useState<MenuItemConfig[]>(INITIAL_MENUS);

  // Section 2: Navigation Mode State
  const [navGroupingStyle, setNavGroupingStyle] = useState<"accordion" | "flat" | "compact">("accordion");
  const [showUnreadBadges, setShowUnreadBadges] = useState(true);
  const [autoScrollActive, setAutoScrollActive] = useState(true);

  // Section 3: Quick Action Bar State
  const [quickActions, setQuickActions] = useState([
    { id: "new-trans", label: "Catat Transaksi Cepat (+)", enabled: true, icon: "Plus" },
    { id: "export-excel", label: "Ekspor Spreadsheet Cepat", enabled: true, icon: "Download" },
    { id: "ai-copilot", label: "Panggil Nova AI Copilot", enabled: true, icon: "Sparkles" },
    { id: "calc-valas", label: "Konversi Valas & Kurs Real-time", enabled: false, icon: "Calculator" },
  ]);

  // Section 4: Announcement Banner State
  const [enableBanner, setEnableBanner] = useState(false);
  const [bannerType, setBannerType] = useState<"info" | "warning" | "promo" | "success">("info");
  const [bannerText, setBannerText] = useState(
    "Penutupan buku fiskal Q1 berakhir 31 Maret. Harap periksa kepatuhan bukti potong."
  );

  // Load Saved Preferences from LocalStorage on mount
  useEffect(() => {
    try {
      const savedHidden = localStorage.getItem("novajournal_hidden_menus");
      const savedLabels = localStorage.getItem("novajournal_menu_labels");
      const hiddenList: string[] = savedHidden ? JSON.parse(savedHidden) : [];
      const labelMap: Record<string, string> = savedLabels ? JSON.parse(savedLabels) : {};

      setMenus((prev) =>
        prev.map((m) => ({
          ...m,
          visible: !hiddenList.includes(m.path),
          customLabel: labelMap[m.path] || "",
        }))
      );

      const savedGroupStyle = localStorage.getItem("novajournal_nav_grouping_style");
      if (savedGroupStyle) setNavGroupingStyle(savedGroupStyle as any);

      const savedBadges = localStorage.getItem("novajournal_show_unread_badges");
      if (savedBadges !== null) setShowUnreadBadges(savedBadges === "true");

      const savedBanner = localStorage.getItem("novajournal_workspace_banner");
      if (savedBanner) {
        const parsed = JSON.parse(savedBanner);
        setEnableBanner(Boolean(parsed.enabled));
        if (parsed.type) setBannerType(parsed.type);
        if (parsed.text) setBannerText(parsed.text);
      }
    } catch (e) {
      console.error("Error loading content management config:", e);
    }
  }, []);

  const showNotice = (msg: string, isError = false) => {
    triggerNovaToast({
      type: isError ? "error" : "success",
      title: isError ? "Pengaturan Gagal" : "Pengaturan Disimpan",
      description: msg,
    });
  };

  // Toggle Visibility for a Single Menu
  const toggleMenuVisibility = (path: string) => {
    playRealisticClick(0.35);
    setMenus((prev) => {
      const updated = prev.map((m) => (m.path === path ? { ...m, visible: !m.visible } : m));
      const hiddenPaths = updated.filter((m) => !m.visible).map((m) => m.path);
      localStorage.setItem("novajournal_hidden_menus", JSON.stringify(hiddenPaths));
      window.dispatchEvent(new Event("novajournal_menu_config_changed"));
      return updated;
    });
    showNotice("Visibilitas menu diperbarui.");
  };

  // Update Custom Label for a Menu
  const handleCustomLabelChange = (path: string, newLabel: string) => {
    setMenus((prev) => {
      const updated = prev.map((m) => (m.path === path ? { ...m, customLabel: newLabel } : m));
      const labelMap: Record<string, string> = {};
      updated.forEach((m) => {
        if (m.customLabel && m.customLabel.trim()) {
          labelMap[m.path] = m.customLabel.trim();
        }
      });
      localStorage.setItem("novajournal_menu_labels", JSON.stringify(labelMap));
      window.dispatchEvent(new Event("novajournal_menu_config_changed"));
      return updated;
    });
  };

  // Reset Section Handlers
  const handleResetVisibility = () => {
    playSoftChime();
    setMenus(INITIAL_MENUS);
    localStorage.removeItem("novajournal_hidden_menus");
    localStorage.removeItem("novajournal_menu_labels");
    window.dispatchEvent(new Event("novajournal_menu_config_changed"));
    showNotice("Visibilitas seluruh menu dikembalikan ke default.");
  };

  const handleResetNavMode = () => {
    playSoftChime();
    setNavGroupingStyle("accordion");
    setShowUnreadBadges(true);
    setAutoScrollActive(true);
    localStorage.removeItem("novajournal_nav_grouping_style");
    localStorage.removeItem("novajournal_show_unread_badges");
    showNotice("Perilaku navigasi dikembalikan ke default: Accordion.");
  };

  const handleResetQuickActions = () => {
    playSoftChime();
    setQuickActions([
      { id: "new-trans", label: "Catat Transaksi Cepat (+)", enabled: true, icon: "Plus" },
      { id: "export-excel", label: "Ekspor Spreadsheet Cepat", enabled: true, icon: "Download" },
      { id: "ai-copilot", label: "Panggil Nova AI Copilot", enabled: true, icon: "Sparkles" },
      { id: "calc-valas", label: "Konversi Valas & Kurs Real-time", enabled: false, icon: "Calculator" },
    ]);
    showNotice("Bilah aksi cepat dikembalikan ke default.");
  };

  const handleResetBanner = () => {
    playSoftChime();
    setEnableBanner(false);
    setBannerType("info");
    setBannerText("Penutupan buku fiskal Q1 berakhir 31 Maret. Harap periksa kepatuhan bukti potong.");
    localStorage.removeItem("novajournal_workspace_banner");
    showNotice("Banner pengumuman dinonaktifkan.");
  };

  const handleSaveBanner = () => {
    playNovaSpaceSound();
    localStorage.setItem(
      "novajournal_workspace_banner",
      JSON.stringify({ enabled: enableBanner, type: bannerType, text: bannerText })
    );
    window.dispatchEvent(new Event("novajournal_banner_config_changed"));
    showNotice("Konfigurasi banner pengumuman workspace berhasil disimpan!");
  };

  const toggleFold = (id: string) => {
    playRealisticClick(0.3);
    setFoldedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllFolded = Object.values(foldedSections).every(Boolean);
  const toggleAllSections = () => {
    playSoftChime();
    const nextState = !areAllFolded;
    const updated: Record<string, boolean> = {};
    CONTENT_SECTIONS.forEach((s) => {
      updated[s.id] = nextState;
    });
    setFoldedSections(updated);
  };

  const scrollToSection = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({ ...prev, [id]: false }));
    setTimeout(() => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSectionId(id);
      }
    }, 50);
  };

  const activeSec = CONTENT_SECTIONS.find((s) => s.id === activeSectionId) || CONTENT_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  // Filtered menu items for Section 1 search
  const filteredMenus = menus.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.defaultLabel.toLowerCase().includes(q) ||
      m.path.toLowerCase().includes(q) ||
      m.group.toLowerCase().includes(q) ||
      (m.customLabel && m.customLabel.toLowerCase().includes(q))
    );
  });

  const activeCount = menus.filter((m) => m.visible).length;
  const hiddenCount = menus.length - activeCount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 mt-4 sm:mt-6">
      <NovaToastContainer />

      {/* Header Bar */}
      <div className="space-y-2 pb-2 border-b border-default-200 dark:border-default-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-default-500 flex items-center gap-1.5">
            <LayoutList className="w-3.5 h-3.5 text-blue-500" />
            Pengaturan Konten & Navigasi Workspace
          </span>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tersimpan otomatis</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
            <LayoutList className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Manajemen Menu & Navigasi Konten
          </h1>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-bold tracking-wide">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span>Workspace Customizer</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-default-500 max-w-2xl leading-relaxed">
            Sesuaikan susunan menu sidebar, sembunyikan fitur yang belum dibutuhkan, beri nama alias kustom, dan kelola bilah pengumuman workspace untuk seluruh tim.
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={toggleAllSections}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer font-medium transition"
            >
              {areAllFolded ? "Buka Semua" : "Lipat Semua"}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTIONS LIST                                                             */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* ── SEKSI 1: Visibilitas Menu Sidebar ── */}
        <Card id="section-menu-visibility" className="border border-default-200 dark:border-default-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleFold("menu-visibility")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-900/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Eye className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>1. Visibilitas Menu Sidebar</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 border border-blue-500/20 font-mono">
                    {activeCount} Aktif · {hiddenCount} Disembunyikan
                  </span>
                </h2>
                <p className="text-[11px] text-default-500">
                  Aktifkan atau sembunyikan menu tertentu di sidebar sesuai alur kerja workspace Anda.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {foldedSections["menu-visibility"] ? <ChevronDown className="w-4 h-4 text-default-400" /> : <ChevronUp className="w-4 h-4 text-default-400" />}
            </div>
          </div>

          {!foldedSections["menu-visibility"] && (
            <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
              {/* Search & Batch Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Cari nama menu / path..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-900 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      playSoftChime();
                      setMenus((prev) => {
                        const updated = prev.map((m) => ({ ...m, visible: true }));
                        localStorage.removeItem("novajournal_hidden_menus");
                        window.dispatchEvent(new Event("novajournal_menu_config_changed"));
                        return updated;
                      });
                      showNotice("Semua menu telah ditampilkan.");
                    }}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 font-semibold cursor-pointer"
                  >
                    Tampilkan Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playSoftChime();
                      setMenus((prev) => {
                        // Keep core overview menus, hide extended
                        const corePaths = ["/dashboard", "/transactions", "/wallets", "/settings", "/profile"];
                        const updated = prev.map((m) => ({ ...m, visible: corePaths.includes(m.path) }));
                        const hidden = updated.filter((m) => !m.visible).map((m) => m.path);
                        localStorage.setItem("novajournal_hidden_menus", JSON.stringify(hidden));
                        window.dispatchEvent(new Event("novajournal_menu_config_changed"));
                        return updated;
                      });
                      showNotice("Mode Minimalis diterapkan.");
                    }}
                    className="text-[11px] px-2.5 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-800 font-semibold cursor-pointer"
                  >
                    Mode Minimalis
                  </button>
                </div>
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                {filteredMenus.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        item.visible
                          ? "bg-white dark:bg-default-900/40 border-default-200/80 dark:border-default-800"
                          : "bg-default-100/50 dark:bg-default-950/40 border-dashed border-default-300 dark:border-default-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          item.visible ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-default-200 dark:bg-default-800 text-default-400"
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">
                              {item.customLabel || item.defaultLabel}
                            </span>
                            {item.requiredRole && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-default-100 dark:bg-default-800 text-default-500 font-mono">
                                {item.requiredRole}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-default-400 font-mono block truncate">
                            {item.path} · {item.group}
                          </span>
                        </div>
                      </div>

                      {/* Custom Alias Input */}
                      <input
                        type="text"
                        placeholder="Alias..."
                        value={item.customLabel || ""}
                        onChange={(e) => handleCustomLabelChange(item.path, e.target.value)}
                        className="w-20 sm:w-24 h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-[11px] text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        title="Ubah nama tampilan menu di sidebar"
                      />

                      {/* Visibility Toggle Switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.visible}
                        onClick={() => toggleMenuVisibility(item.path)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                          item.visible ? "bg-blue-600" : "bg-default-300 dark:bg-default-700"
                        }`}
                        title={item.visible ? "Sembunyikan menu ini" : "Tampilkan menu ini"}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          item.visible ? "translate-x-4" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Reset Default */}
              <div className="flex justify-end pt-3 border-t border-default-100 dark:border-default-800 mt-3">
                <button
                  type="button"
                  onClick={handleResetVisibility}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Visibilitas Default
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ── SEKSI 2: Gaya & Perilaku Navigasi ── */}
        <Card id="section-navigation-mode" className="border border-default-200 dark:border-default-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleFold("navigation-mode")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-900/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Compass className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  2. Gaya & Perilaku Navigasi
                </h2>
                <p className="text-[11px] text-default-500">
                  Pilih gaya pengelompokan menu dan animasi saat berpindah antar halaman.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {foldedSections["navigation-mode"] ? <ChevronDown className="w-4 h-4 text-default-400" /> : <ChevronUp className="w-4 h-4 text-default-400" />}
            </div>
          </div>

          {!foldedSections["navigation-mode"] && (
            <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
              {/* Grouping Style Selector */}
              <div className="space-y-2 pt-3">
                <label className="text-xs font-semibold text-foreground block">
                  Format Pengelompokan Menu Sidebar
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "accordion" as const, title: "Grup Accordion Ramping", desc: "Dikelompokkan rapi per kategori dengan panah ekspansi." },
                    { id: "flat" as const, title: "Daftar Datar (Flat List)", desc: "Menampilkan semua menu tanpa pemisah folder." },
                    { id: "compact" as const, title: "Katalog Ikon Kompak", desc: "Fokus pada lambang visual dengan tooltip cepat." },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        playRealisticClick(0.3);
                        setNavGroupingStyle(style.id);
                        localStorage.setItem("novajournal_nav_grouping_style", style.id);
                        showNotice(`Format navigasi diubah ke: ${style.title}`);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        navGroupingStyle === style.id
                          ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                          : "border-default-200 dark:border-default-800 bg-white dark:bg-default-900/40 hover:bg-default-50"
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground block mb-1">{style.title}</span>
                      <p className="text-[10px] text-default-500 leading-tight">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Behavior Switches */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Tampilkan Lencana Notifikasi (Unread Count)</span>
                    <span className="text-[11px] text-default-500">Tampilkan titik merah / hitungan angka di samping menu transaksi & log.</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={showUnreadBadges}
                    onClick={() => {
                      const nextVal = !showUnreadBadges;
                      setShowUnreadBadges(nextVal);
                      localStorage.setItem("novajournal_show_unread_badges", String(nextVal));
                      showNotice(nextVal ? "Lencana notifikasi diaktifkan." : "Lencana dinonaktifkan.");
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      showUnreadBadges ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      showUnreadBadges ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Reset Default */}
              <div className="flex justify-end pt-3 border-t border-default-100 dark:border-default-800 mt-3">
                <button
                  type="button"
                  onClick={handleResetNavMode}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Navigasi Default
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ── SEKSI 3: Aksi Cepat & Shortcut Bar ── */}
        <Card id="section-quick-actions" className="border border-default-200 dark:border-default-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleFold("quick-actions")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-900/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  3. Bilah Aksi Cepat (Quick Action Bar)
                </h2>
                <p className="text-[11px] text-default-500">
                  Tentukan tombol pintasan yang dapat diakses langsung dari header bilah navigasi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {foldedSections["quick-actions"] ? <ChevronDown className="w-4 h-4 text-default-400" /> : <ChevronUp className="w-4 h-4 text-default-400" />}
            </div>
          </div>

          {!foldedSections["quick-actions"] && (
            <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
              <div className="space-y-2 pt-3">
                {quickActions.map((qa) => (
                  <div
                    key={qa.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-default-900/40 border border-default-200/80 dark:border-default-800"
                  >
                    <span className="text-xs font-semibold text-foreground">{qa.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={qa.enabled}
                      onClick={() => {
                        playRealisticClick(0.3);
                        setQuickActions((prev) =>
                          prev.map((item) => (item.id === qa.id ? { ...item, enabled: !item.enabled } : item))
                        );
                        showNotice(`Shortcut ${qa.label} ${!qa.enabled ? "diaktifkan" : "dinonaktifkan"}`);
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        qa.enabled ? "bg-cyan-600" : "bg-default-300 dark:bg-default-700"
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        qa.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Reset Default */}
              <div className="flex justify-end pt-3 border-t border-default-100 dark:border-default-800 mt-3">
                <button
                  type="button"
                  onClick={handleResetQuickActions}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Shortcut Default
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ── SEKSI 4: Banner Pengumuman Workspace ── */}
        <Card id="section-announcement" className="border border-default-200 dark:border-default-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleFold("announcement")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-900/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Megaphone className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  4. Banner Pengumuman Workspace
                </h2>
                <p className="text-[11px] text-default-500">
                  Tampilkan pengumuman penting, batas audit fiskal, atau pesan sambutan di atas dasbor.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {foldedSections["announcement"] ? <ChevronDown className="w-4 h-4 text-default-400" /> : <ChevronUp className="w-4 h-4 text-default-400" />}
            </div>
          </div>

          {!foldedSections["announcement"] && (
            <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60 mt-3">
                <div>
                  <span className="text-xs font-bold text-foreground block">Aktifkan Banner Pengumuman</span>
                  <span className="text-[11px] text-default-500">Banner akan tampil di bilah atas aplikasi untuk seluruh anggota.</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enableBanner}
                  onClick={() => setEnableBanner(!enableBanner)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    enableBanner ? "bg-amber-500" : "bg-default-300 dark:bg-default-700"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    enableBanner ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </button>
              </div>

              {enableBanner && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "info" as const, label: "Informasi (Biru)", color: "blue" },
                      { id: "warning" as const, label: "Peringatan (Kuning)", color: "amber" },
                      { id: "promo" as const, label: "Khusus (Ungu)", color: "purple" },
                      { id: "success" as const, label: "Prestasi (Hijau)", color: "emerald" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBannerType(b.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                          bannerType === b.id
                            ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600"
                            : "border-default-200 dark:border-default-800 text-default-600"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-1">Teks Pengumuman</label>
                    <textarea
                      rows={2}
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-amber-500"
                    />
                  </div>

                  {/* Live Preview */}
                  <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{bannerText}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/20 uppercase font-mono">
                      Live Preview
                    </span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onPress={handleSaveBanner}
                      className="h-8.5 px-4 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Simpan Banner
                    </Button>
                  </div>
                </div>
              )}

              {/* Reset Default */}
              <div className="flex justify-end pt-3 border-t border-default-100 dark:border-default-800 mt-3">
                <button
                  type="button"
                  onClick={handleResetBanner}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Banner
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ── SEKSI 5: Hak Akses & Matriks Role ── */}
        <Card id="section-role-rules" className="border border-default-200 dark:border-default-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleFold("role-rules")}
            className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-900/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  5. Hak Akses & Matriks Role (RBAC)
                </h2>
                <p className="text-[11px] text-default-500">
                  Pratinjau hak keterlihatan menu bagi masing-masing tingkatan peran pengguna.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {foldedSections["role-rules"] ? <ChevronDown className="w-4 h-4 text-default-400" /> : <ChevronUp className="w-4 h-4 text-default-400" />}
            </div>
          </div>

          {!foldedSections["role-rules"] && (
            <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800 space-y-4">
              <div className="pt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-default-100/70 dark:bg-default-800/50 border-b border-default-200 dark:border-default-800 text-default-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Grup Navigasi</th>
                      <th className="py-2.5 px-3 text-center">Owner</th>
                      <th className="py-2.5 px-3 text-center">Admin</th>
                      <th className="py-2.5 px-3 text-center">Staff Keuangan</th>
                      <th className="py-2.5 px-3 text-center">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-default-100 dark:divide-default-800">
                    {[
                      { group: "Overview (Dashboard, Transaksi)", owner: "Penuh", admin: "Penuh", staff: "Penuh", viewer: "Read-Only" },
                      { group: "Planning (Target, Arus Kas, Portofolio)", owner: "Penuh", admin: "Penuh", staff: "Terbatas", viewer: "Tutup" },
                      { group: "Reporting & Finance (Laporan Keuangan, Pajak)", owner: "Penuh", admin: "Penuh", staff: "Penuh", viewer: "Tutup" },
                      { group: "Settings & Identitas Brand", owner: "Penuh", admin: "Penuh", staff: "Tutup", viewer: "Tutup" },
                      { group: "Governance (Users, RBAC, Audit Log)", owner: "Penuh", admin: "Penuh", staff: "Tutup", viewer: "Tutup" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-default-50/70 dark:hover:bg-default-800/40 transition">
                        <td className="py-2.5 px-3 font-semibold text-foreground">{row.group}</td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ {row.owner}</td>
                        <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓ {row.admin}</td>
                        <td className="py-2.5 px-3 text-center text-default-600">{row.staff}</td>
                        <td className="py-2.5 px-3 text-center text-default-400">{row.viewer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => router.push("/users")}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Kelola Pengguna & Peran di Menu Users & RBAC →
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING QUICK-JUMP ANCHOR BUTTON & MINI POPUP NAVIGATION */}
      {/* ========================================================================= */}
      <div className="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-40 flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
        {quickJumpOpen && (
          <div className="mb-2 p-3 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-default-200/80 dark:border-default-800 shadow-2xl w-64 space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-1.5">
                <ActiveIcon className="w-4 h-4" style={{ color: activeSec.color }} />
                <span className="text-xs font-bold text-foreground">Navigasi Seksi Konten</span>
              </div>
              <button
                type="button"
                onClick={() => setQuickJumpOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-default-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
              {CONTENT_SECTIONS.map((sec) => {
                const isActive = activeSectionId === sec.id;
                const SecIcon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      scrollToSection(sec.id);
                      setQuickJumpOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "text-white font-bold shadow-xs"
                        : "hover:bg-default-100 dark:hover:bg-default-800 text-default-700 dark:text-default-300 text-xs"
                    }`}
                    style={isActive ? { backgroundColor: sec.color } : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <SecIcon className="w-3.5 h-3.5" />
                      <span className="truncate">{sec.shortName}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            playSoftChime();
            setQuickJumpOpen((prev) => !prev);
          }}
          className="relative flex items-center justify-center w-12 h-12 rounded-2xl hover:scale-105 active:scale-95 text-white shadow-xl transition-all cursor-pointer group"
          style={{
            backgroundColor: activeSec.color,
            boxShadow: `0 8px 24px -4px ${activeSec.color}90`,
          }}
          title={`Lompat Seksi: ${activeSec.name}`}
        >
          <ActiveIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
        </button>
      </div>
    </div>
  );
}
