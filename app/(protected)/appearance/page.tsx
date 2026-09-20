/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
  Sparkles,
  Sliders,
  SlidersHorizontal,
  Type,
  Maximize2,
  CheckCircle2,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  playNovaThemeSound,
  playSoftChime,
  playNovaSpaceSound,
  playRealisticClick,
} from "@/app/lib/sound";
import { useIntlLanguage, DICTIONARY } from "@/app/lib/intl";
import { triggerThemeTransition } from "@/app/(protected)/components/ThemeTransitionOverlay";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

const PALETTES = [
  { id: "blue", name: "Modern Blue", hex: "#2563eb", bgClass: "bg-blue-600" },
  { id: "violet", name: "Cyber Violet", hex: "#7c3aed", bgClass: "bg-purple-600" },
  { id: "emerald", name: "Emerald Growth", hex: "#059669", bgClass: "bg-emerald-600" },
  { id: "amber", name: "Amber Wealth", hex: "#d97706", bgClass: "bg-amber-600" },
  { id: "rose", name: "Crimson Alpha", hex: "#e11d48", bgClass: "bg-rose-600" },
  { id: "slate", name: "Slate Corporate", hex: "#475569", bgClass: "bg-slate-600" },
];

const FONTS = [
  { id: "sans", name: "Geist Sans", desc: "Modern, clean, ultra-legible", family: "var(--font-geist-sans), sans-serif" },
  { id: "inter", name: "Inter Display", desc: "Corporate standard & balanced", family: "Inter, sans-serif" },
  { id: "jakarta", name: "Plus Jakarta", desc: "Geometric & energetic fintech", family: "'Plus Jakarta Sans', sans-serif" },
  { id: "outfit", name: "Outfit Modern", desc: "Soft rounded premium tech", family: "Outfit, sans-serif" },
  { id: "fira", name: "Fira Code Mono", desc: "Developer & ledger precision", family: "'Fira Code', monospace" },
  { id: "grotesk", name: "Space Grotesk", desc: "Futuristic & distinct identity", family: "'Space Grotesk', sans-serif" },
];

const APPEARANCE_SECTIONS = [
  { id: "mode", name: "Mode Tema", shortName: "Mode", icon: Sun, color: "#f59e0b" },
  { id: "palette", name: "Palet Warna", shortName: "Palet", icon: Palette, color: "#8b5cf6" },
  { id: "density", name: "Kepadatan & W×H", shortName: "Kepadatan", icon: Sliders, color: "#3b82f6" },
  { id: "fonts", name: "Tipografi Font", shortName: "Font", icon: Type, color: "#ec4899" },
  { id: "background", name: "Latar Nebula & Glass", shortName: "Latar", icon: Sparkles, color: "#10b981" },
];

export default function AppearancePage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { lang, t, isId } = useIntlLanguage();

  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const showNotice = (msg: string, isError = false) => {
    triggerNovaToast({
      type: isError ? "error" : "success",
      title: isError ? (isId ? "Peringatan Tampilan" : "Appearance Notice") : (isId ? "Tampilan Diperbarui" : "Appearance Updated"),
      description: msg,
    });
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Anchor & Folding State
  const [activeSectionId, setActiveSectionId] = useState("mode");
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);
  const [foldedSections, setFoldedSections] = useState<Record<string, boolean>>({
    mode: false,
    palette: false,
    density: false,
    fonts: false,
    background: false,
  });

  const toggleFold = (id: string) => {
    playSoftChime();
    setFoldedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllFolded = Object.values(foldedSections).every(Boolean);
  const toggleAllSections = () => {
    playSoftChime();
    const nextState = !areAllFolded;
    setFoldedSections({
      mode: nextState,
      palette: nextState,
      density: nextState,
      fonts: nextState,
      background: nextState,
    });
  };

  // Scroll listener for Section Anchor highlighting
  useEffect(() => {
    const getScrollContainer = () =>
      document.getElementById("main-scroll-container") || document.querySelector("main") || window;

    const handleScroll = () => {
      const container = getScrollContainer();
      const isWindow = container === window;
      const scrollPos = isWindow ? window.scrollY + 180 : (container as HTMLElement).scrollTop + 180;

      let currentSecId = APPEARANCE_SECTIONS[0].id;
      for (const sec of APPEARANCE_SECTIONS) {
        const el = document.getElementById(`section-${sec.id}`);
        if (el) {
          const top = el.offsetTop;
          if (scrollPos >= top) {
            currentSecId = sec.id;
          }
        }
      }

      const scrollHeight = isWindow ? document.documentElement.scrollHeight : (container as HTMLElement).scrollHeight;
      const clientHeight = isWindow ? window.innerHeight : (container as HTMLElement).clientHeight;
      const currentScroll = isWindow ? window.scrollY : (container as HTMLElement).scrollTop;

      if (currentScroll + clientHeight >= scrollHeight - 60) {
        currentSecId = APPEARANCE_SECTIONS[APPEARANCE_SECTIONS.length - 1].id;
      }

      setActiveSectionId(currentSecId);
    };

    const container = getScrollContainer();
    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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

  const activeSec = APPEARANCE_SECTIONS.find((s) => s.id === activeSectionId) || APPEARANCE_SECTIONS[0];
  const ActiveIcon = activeSec.icon;

  // Appearance States
  const [themePalette, setThemePalette] = useState<string>("blue");
  const [customHexColor, setCustomHexColor] = useState("#2563eb");
  const [uiDensity, setUiDensity] = useState<"compact" | "standard" | "spacious">("standard");
  const [customDensityWidth, setCustomDensityWidth] = useState(100);
  const [customDensityHeight, setCustomDensityHeight] = useState(100);
  const [fontFamily, setFontFamily] = useState("sans");
  const [backgroundStyle, setBackgroundStyle] = useState<"fluid" | "plain">("fluid");
  const [enableNebulaGlow, setEnableNebulaGlow] = useState(true);
  const [enableBackdropGlass, setEnableBackdropGlass] = useState(true);

  // Granular Sidebar & Navbar Appearance States
  const [sidebarDensity, setSidebarDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [sidebarWidthCustom, setSidebarWidthCustom] = useState<number>(224);
  const [navbarDensity, setNavbarDensity] = useState<"compact" | "comfortable" | "spacious">("comfortable");
  const [navbarHeightCustom, setNavbarHeightCustom] = useState<number>(56);
  const [sidebarBackdrop, setSidebarBackdrop] = useState<"glass" | "solid" | "minimal" | "accent">("glass");
  const [sidebarIndicator, setSidebarIndicator] = useState<"pill" | "line" | "glow">("pill");
  const [sidebarBorderless, setSidebarBorderless] = useState(false);
  const [sidebarShadow, setSidebarShadow] = useState<"none" | "subtle" | "elevated">("none");
  const [navbarStickyGlass, setNavbarStickyGlass] = useState(true);
  const [navbarGlassBg, setNavbarGlassBg] = useState(true);
  const [showOnlinePing, setShowOnlinePing] = useState(true);
  const [showRoleBadge, setShowRoleBadge] = useState(true);
  const [showFiatPill, setShowFiatPill] = useState(true);
  const [showLangSwitcher, setShowLangSwitcher] = useState(true);

  // Custom Scale & Preview Modal State
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [modalScaleW, setModalScaleW] = useState(100);
  const [modalScaleH, setModalScaleH] = useState(100);

  // Autosave Status
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autosaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);
    const pal = localStorage.getItem("novajournal_theme_palette") || "blue";
    setThemePalette(pal);

    const savedHex = localStorage.getItem("novajournal_custom_hex");
    if (savedHex) setCustomHexColor(savedHex);

    const den = localStorage.getItem("novajournal_ui_density") as any;
    if (den) setUiDensity(den);

    const customW = localStorage.getItem("novajournal_density_w");
    if (customW) {
      setCustomDensityWidth(Number(customW));
      setModalScaleW(Number(customW));
    }

    const customH = localStorage.getItem("novajournal_density_h");
    if (customH) {
      setCustomDensityHeight(Number(customH));
      setModalScaleH(Number(customH));
    }

    const fnt = localStorage.getItem("novajournal_font_family") || "sans";
    setFontFamily(fnt);
    const foundFnt = FONTS.find((f) => f.id === fnt);
    if (foundFnt) {
      document.documentElement.style.fontFamily = foundFnt.family;
      document.documentElement.setAttribute("data-font", fnt);
    }

    const bg = localStorage.getItem("novajournal_bg_style") as any;
    if (bg) setBackgroundStyle(bg);

    const neb = localStorage.getItem("novajournal_nebula_glow");
    if (neb !== null) setEnableNebulaGlow(neb !== "false");

    const glass = localStorage.getItem("novajournal_backdrop_glass");
    if (glass !== null) setEnableBackdropGlass(glass !== "false");

    const sDen = localStorage.getItem("novajournal_sidebar_density") as any;
    if (sDen === "compact" || sDen === "comfortable" || sDen === "spacious") setSidebarDensity(sDen);

    const sWCustom = localStorage.getItem("novajournal_sidebar_width_custom");
    if (sWCustom) setSidebarWidthCustom(Number(sWCustom));

    const nDen = localStorage.getItem("novajournal_navbar_density") as any;
    if (nDen === "compact" || nDen === "comfortable" || nDen === "spacious") setNavbarDensity(nDen);

    const nHCustom = localStorage.getItem("novajournal_navbar_height_custom");
    if (nHCustom) setNavbarHeightCustom(Number(nHCustom));

    const sBack = localStorage.getItem("novajournal_sidebar_backdrop") as any;
    if (sBack) setSidebarBackdrop(sBack);

    const sInd = localStorage.getItem("novajournal_sidebar_indicator") as any;
    if (sInd) setSidebarIndicator(sInd);

    const sBorderless = localStorage.getItem("novajournal_sidebar_borderless");
    if (sBorderless !== null) setSidebarBorderless(sBorderless === "true");

    const sShadow = localStorage.getItem("novajournal_sidebar_shadow") as any;
    if (sShadow === "none" || sShadow === "subtle" || sShadow === "elevated") setSidebarShadow(sShadow);

    const nSticky = localStorage.getItem("novajournal_navbar_sticky_glass");
    if (nSticky !== null) setNavbarStickyGlass(nSticky !== "false");

    const nGlassBg = localStorage.getItem("novajournal_navbar_glass_bg");
    if (nGlassBg !== null) setNavbarGlassBg(nGlassBg !== "false");

    const nPing = localStorage.getItem("novajournal_navbar_online_ping");
    if (nPing !== null) setShowOnlinePing(nPing !== "false");

    const nRole = localStorage.getItem("novajournal_navbar_role_badge");
    if (nRole !== null) setShowRoleBadge(nRole !== "false");

    const nFiat = localStorage.getItem("novajournal_navbar_fiat_pill");
    if (nFiat !== null) setShowFiatPill(nFiat !== "false");

    const nLang = localStorage.getItem("novajournal_navbar_lang_switcher");
    if (nLang !== null) setShowLangSwitcher(nLang !== "false");

    setIsInitialized(true);
  }, []);

  // Debounced Autosave for Appearance
  useEffect(() => {
    if (!isInitialized) return;

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);

    setSaveStatus("saving");
    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("novajournal_theme_palette", themePalette);
        localStorage.setItem("novajournal_custom_hex", customHexColor);
        localStorage.setItem("novajournal_ui_density", uiDensity);
        localStorage.setItem("novajournal_density_w", String(customDensityWidth));
        localStorage.setItem("novajournal_density_h", String(customDensityHeight));
        localStorage.setItem("novajournal_font_family", fontFamily);
        localStorage.setItem("novajournal_bg_style", backgroundStyle);
        localStorage.setItem("novajournal_nebula_glow", String(enableNebulaGlow));
        localStorage.setItem("novajournal_backdrop_glass", String(enableBackdropGlass));

        localStorage.setItem("novajournal_sidebar_density", sidebarDensity);
        localStorage.setItem("novajournal_sidebar_width_custom", String(sidebarWidthCustom));
        localStorage.setItem("novajournal_navbar_density", navbarDensity);
        localStorage.setItem("novajournal_navbar_height_custom", String(navbarHeightCustom));
        localStorage.setItem("novajournal_sidebar_backdrop", sidebarBackdrop);
        localStorage.setItem("novajournal_sidebar_indicator", sidebarIndicator);
        localStorage.setItem("novajournal_sidebar_borderless", String(sidebarBorderless));
        localStorage.setItem("novajournal_sidebar_shadow", sidebarShadow);
        localStorage.setItem("novajournal_navbar_sticky_glass", String(navbarStickyGlass));
        localStorage.setItem("novajournal_navbar_glass_bg", String(navbarGlassBg));
        localStorage.setItem("novajournal_navbar_online_ping", String(showOnlinePing));
        localStorage.setItem("novajournal_navbar_role_badge", String(showRoleBadge));
        localStorage.setItem("novajournal_navbar_fiat_pill", String(showFiatPill));
        localStorage.setItem("novajournal_navbar_lang_switcher", String(showLangSwitcher));

        document.documentElement.style.setProperty("--navbar-height", `${navbarHeightCustom}px`);
        document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidthCustom}px`);

        window.dispatchEvent(new Event("novajournal_appearance_config_changed"));
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    }, 500);

    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    themePalette,
    customHexColor,
    uiDensity,
    customDensityWidth,
    customDensityHeight,
    fontFamily,
    backgroundStyle,
    enableNebulaGlow,
    enableBackdropGlass,
    sidebarDensity,
    sidebarWidthCustom,
    navbarDensity,
    navbarHeightCustom,
    sidebarBackdrop,
    sidebarIndicator,
    sidebarBorderless,
    sidebarShadow,
    navbarStickyGlass,
    navbarGlassBg,
    showOnlinePing,
    showRoleBadge,
    showFiatPill,
    showLangSwitcher,
    isInitialized,
  ]);

  const handleThemeMode = (mode: "light" | "dark" | "system") => {
    if (mode === "light" || mode === "dark") {
      triggerThemeTransition(mode);
    } else {
      playNovaThemeSound(false);
      setTheme(mode);
    }
    showNotice(isId ? `Mode tema diubah ke ${mode.toUpperCase()}!` : `Display mode set to ${mode.toUpperCase()}!`);
  };

  const handlePaletteChange = (pal: string) => {
    playNovaSpaceSound();
    setThemePalette(pal);
    try {
      localStorage.setItem("novajournal_theme_palette", pal);
      document.documentElement.setAttribute("data-palette", pal);
      window.dispatchEvent(new CustomEvent("novajournal_palette_changed", { detail: pal }));
      showNotice(isId ? `Palet warna diubah ke ${pal.toUpperCase()}!` : `Color palette changed to ${pal.toUpperCase()}!`);
    } catch {}
  };

  const handleCustomHexApply = () => {
    playSoftChime();
    try {
      localStorage.setItem("novajournal_custom_hex", customHexColor);
      document.documentElement.style.setProperty("--primary-color", customHexColor);
      document.documentElement.style.setProperty("--primary-hover", customHexColor);
      showNotice(isId ? `Warna custom ${customHexColor} berhasil diterapkan!` : `Custom color ${customHexColor} applied!`);
    } catch {}
  };

  const handleFontChange = (fontId: string) => {
    playSoftChime();
    setFontFamily(fontId);
    try {
      localStorage.setItem("novajournal_font_family", fontId);
      document.documentElement.setAttribute("data-font", fontId);
      const foundFnt = FONTS.find((f) => f.id === fontId);
      if (foundFnt) {
        document.documentElement.style.fontFamily = foundFnt.family;
      }
      showNotice(isId ? `Font antarmuka diubah ke ${foundFnt?.name || fontId.toUpperCase()}!` : `UI font set to ${foundFnt?.name || fontId.toUpperCase()}!`);
    } catch {}
  };

  const handleBgStyleChange = (style: "fluid" | "plain") => {
    playSoftChime();
    setBackgroundStyle(style);
    try {
      localStorage.setItem("novajournal_bg_style", style);
      document.documentElement.setAttribute("data-bg-style", style);
      window.dispatchEvent(new CustomEvent("novajournal_bg_style_changed", { detail: style }));
      showNotice(isId ? `Gaya latar belakang diubah ke ${style === "fluid" ? "Fluid Cosmic Wave" : "Polosan Minimalist"}!` : `Background style updated to ${style}!`);
    } catch {}
  };

  const handleDensityChange = (density: "compact" | "standard" | "spacious") => {
    playSoftChime();
    setUiDensity(density);
    try {
      localStorage.setItem("novajournal_ui_density", density);
      document.documentElement.setAttribute("data-density", density);
      showNotice(isId ? `Kepadatan UI diubah ke ${density.toUpperCase()}!` : `UI density set to ${density.toUpperCase()}!`);
    } catch {}
  };

  const handleCustomDensityApply = () => {
    playSoftChime();
    try {
      localStorage.setItem("novajournal_density_w", String(customDensityWidth));
      localStorage.setItem("novajournal_density_h", String(customDensityHeight));
      document.documentElement.style.setProperty("--custom-card-w", `${customDensityWidth}%`);
      document.documentElement.style.setProperty("--custom-card-h", `${customDensityHeight}%`);
      showNotice(isId ? `Dimensi card kustom ${customDensityWidth}% W × ${customDensityHeight}% H diterapkan!` : `Custom card scale ${customDensityWidth}% W × ${customDensityHeight}% H applied!`);
    } catch {}
  };

  /* ========================================================================= */
  /* PER-SECTION RESET HANDLERS                                                */
  /* ========================================================================= */
  const handleResetMode = () => {
    playSoftChime();
    setTheme("system");
    showNotice(isId ? "Mode tema dikembalikan ke default: Ikuti Sistem OS." : "Display mode reset to default: System OS.");
  };

  const handleResetPalette = () => {
    playSoftChime();
    setThemePalette("blue");
    setCustomHexColor("#2563eb");
    try {
      localStorage.removeItem("novajournal_theme_palette");
      localStorage.removeItem("novajournal_custom_hex");
      document.documentElement.removeAttribute("data-palette");
      document.documentElement.style.removeProperty("--primary-color");
      document.documentElement.style.removeProperty("--primary-hover");
      window.dispatchEvent(new CustomEvent("novajournal_palette_changed", { detail: "blue" }));
    } catch {}
    showNotice(isId ? "Palet warna dikembalikan ke default: Modern Blue." : "Color palette reset to default: Modern Blue.");
  };

  const handleResetDensity = () => {
    playSoftChime();
    setSidebarDensity("comfortable");
    setSidebarWidthCustom(224);
    setNavbarDensity("comfortable");
    setNavbarHeightCustom(56);
    setUiDensity("standard");
    setCustomDensityWidth(100);
    setCustomDensityHeight(100);
    setModalScaleW(100);
    setModalScaleH(100);
    try {
      localStorage.removeItem("novajournal_sidebar_density");
      localStorage.removeItem("novajournal_sidebar_width_custom");
      localStorage.removeItem("novajournal_navbar_density");
      localStorage.removeItem("novajournal_navbar_height_custom");
      localStorage.removeItem("novajournal_ui_density");
      localStorage.removeItem("novajournal_density_w");
      localStorage.removeItem("novajournal_density_h");
      document.documentElement.style.setProperty("--navbar-height", "56px");
      document.documentElement.style.setProperty("--sidebar-width", "224px");
      document.documentElement.removeAttribute("data-density");
      document.documentElement.style.removeProperty("--custom-card-w");
      document.documentElement.style.removeProperty("--custom-card-h");
      window.dispatchEvent(new Event("novajournal_appearance_config_changed"));
    } catch {}
    showNotice(isId ? "Kepadatan navbar & sidebar dikembalikan ke default." : "Navbar & sidebar density reset to default.");
  };

  const handleResetFonts = () => {
    playSoftChime();
    setFontFamily("sans");
    try {
      localStorage.removeItem("novajournal_font_family");
      document.documentElement.removeAttribute("data-font");
      document.documentElement.style.fontFamily = "var(--font-geist-sans), sans-serif";
    } catch {}
    showNotice(isId ? "Font antarmuka dikembalikan ke default: Geist Sans." : "Interface font reset to default: Geist Sans.");
  };

  const handleResetBackground = () => {
    playSoftChime();
    setBackgroundStyle("fluid");
    setEnableNebulaGlow(true);
    setEnableBackdropGlass(true);
    setNavbarGlassBg(true);
    try {
      localStorage.removeItem("novajournal_bg_style");
      localStorage.removeItem("novajournal_nebula_glow");
      localStorage.removeItem("novajournal_backdrop_glass");
      localStorage.removeItem("novajournal_navbar_glass_bg");
      document.documentElement.removeAttribute("data-bg-style");
      window.dispatchEvent(new Event("novajournal_background_style_changed"));
      window.dispatchEvent(new Event("novajournal_appearance_config_changed"));
    } catch {}
    showNotice(isId ? "Efek visual latar belakang & tema dikembalikan ke default." : "Background visual effects & theme reset to default.");
  };

  const handleResetDefaults = () => {
    playSoftChime();
    setTheme("system");
    setThemePalette("blue");
    setCustomHexColor("#2563eb");
    setSidebarDensity("comfortable");
    setSidebarWidthCustom(224);
    setNavbarDensity("comfortable");
    setNavbarHeightCustom(56);
    setUiDensity("standard");
    setCustomDensityWidth(100);
    setCustomDensityHeight(100);
    setModalScaleW(100);
    setModalScaleH(100);
    setFontFamily("sans");
    setBackgroundStyle("fluid");
    setEnableNebulaGlow(true);
    setEnableBackdropGlass(true);
    setNavbarGlassBg(true);

    try {
      localStorage.removeItem("novajournal_theme_palette");
      localStorage.removeItem("novajournal_custom_hex");
      localStorage.removeItem("novajournal_sidebar_density");
      localStorage.removeItem("novajournal_sidebar_width_custom");
      localStorage.removeItem("novajournal_navbar_density");
      localStorage.removeItem("novajournal_navbar_height_custom");
      localStorage.removeItem("novajournal_ui_density");
      localStorage.removeItem("novajournal_density_w");
      localStorage.removeItem("novajournal_density_h");
      localStorage.removeItem("novajournal_font_family");
      localStorage.removeItem("novajournal_bg_style");
      localStorage.removeItem("novajournal_nebula_glow");
      localStorage.removeItem("novajournal_backdrop_glass");
      localStorage.removeItem("novajournal_navbar_glass_bg");

      document.documentElement.removeAttribute("data-palette");
      document.documentElement.removeAttribute("data-density");
      document.documentElement.removeAttribute("data-font");
      document.documentElement.removeAttribute("data-bg-style");
      document.documentElement.style.fontFamily = "var(--font-geist-sans), sans-serif";
      document.documentElement.style.setProperty("--navbar-height", "56px");
      document.documentElement.style.setProperty("--sidebar-width", "224px");
      document.documentElement.style.removeProperty("--primary-color");
      document.documentElement.style.removeProperty("--primary-hover");
      document.documentElement.style.removeProperty("--custom-card-w");
      document.documentElement.style.removeProperty("--custom-card-h");
      window.dispatchEvent(new Event("novajournal_appearance_config_changed"));
      window.dispatchEvent(new CustomEvent("novajournal_palette_changed", { detail: "blue" }));
    } catch {}

    showNotice(isId ? "Seluruh tampilan berhasil dikembalikan ke pengaturan default!" : "All appearance settings restored to default!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 mt-6 sm:mt-8 pt-2">
      {/* Toast Notice */}
      {noticeMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Clean 3-Tier Professional Header */}
      <div className="space-y-3 pb-3 border-b border-default-200/80 dark:border-default-800">
        {/* Tier 1: Top Navigation & Status Bar */}
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="ghost"
            onPress={() => router.push("/settings")}
            className="text-xs cursor-pointer h-8 px-3 rounded-xl font-semibold bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-200 dark:hover:bg-default-700 transition"
          >
            &larr; {isId ? "Kembali ke Settings Hub" : "Back to Settings Hub"}
          </Button>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold animate-pulse border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>{isId ? "Menyimpan otomatis..." : "Autosaving..."}</span>
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isId ? "Tersimpan otomatis" : "Autosaved"}</span>
              </span>
            )}
          </div>
        </div>

        {/* Tier 2: Title in 1 Full Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Palette className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {t(DICTIONARY.appearance.title)}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-[10px] font-bold tracking-wide">
            {t(DICTIONARY.appearance.badge)}
          </span>
        </div>

        {/* Tier 3: Description on left, Actions on right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <p className="text-xs text-default-500 max-w-xl leading-relaxed">
            {t(DICTIONARY.appearance.desc)}
          </p>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={toggleAllSections}
              className="text-xs px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-700 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              {areAllFolded ? (
                <>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-500" />
                  <span>{t(DICTIONARY.common.openAll)}</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-purple-500" />
                  <span>{t(DICTIONARY.common.foldAll)}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 dark:hover:bg-default-700 transition cursor-pointer font-semibold flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <RotateCcw className="w-3 h-3 text-default-400" />
              <span>{t(DICTIONARY.appearance.resetAll)}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STICKY SECTION ANCHOR NAVIGATION BAR */}
      {/* ========================================================================= */}
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-background/80 backdrop-blur-xl border-b border-default-200/60 dark:border-default-800/60 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-foreground">{isId ? "Seksi:" : "Section:"}</span>
          <div className="flex items-center gap-1">
            {APPEARANCE_SECTIONS.map((sec) => {
              const isActive = activeSectionId === sec.id;
              const SecIcon = sec.icon;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "text-white shadow-xs font-bold"
                      : "text-default-600 hover:bg-default-100 dark:hover:bg-default-800"
                  }`}
                  style={isActive ? { backgroundColor: sec.color } : undefined}
                >
                  <SecIcon className="w-3 h-3" />
                  <span>{sec.shortName || sec.name}</span>
                  {foldedSections[sec.id] && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Tergulung (Folded)" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleAllSections}
            className="text-[11px] px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 hover:bg-default-50 cursor-pointer transition font-medium"
          >
            {areAllFolded ? "Buka Semua" : "Lipat Semua"}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. Mode Tema (Light / Dark / System) (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-mode"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("mode")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                1. Mode Tampilan Sistem
              </h2>
              <p className="text-[11px] text-default-400">
                Pilih antara mode cerah dengan kontras tajam atau mode gelap kosmik hemat energi.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono uppercase">
              {theme || "system"}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.mode ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.mode && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="grid grid-cols-3 gap-3 pt-3">
              {[
                { id: "light" as const, label: "Terang (Light)", icon: Sun, desc: "Kontras bersih untuk siang hari" },
                { id: "dark" as const, label: "Gelap (Dark)", icon: Moon, desc: "Warna kosmik hemat daya layar" },
                { id: "system" as const, label: "Sistem Otomatis", icon: Monitor, desc: "Mengikuti preferensi OS Anda" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleThemeMode(item.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    theme === item.id || (!["light", "dark"].includes(theme || "") && item.id === "system")
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                      : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <item.icon className={`w-4 h-4 ${theme === item.id ? "text-purple-600" : "text-default-500"}`} />
                    {(theme === item.id || (!["light", "dark"].includes(theme || "") && item.id === "system")) && (
                      <Check className="w-3.5 h-3.5 text-purple-600" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground block">{item.label}</span>
                  <p className="text-[10px] text-default-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>

            {/* Per-Section Reset */}
            <div className="flex justify-end pt-3 mt-3 border-t border-default-100 dark:border-default-800">
              <button
                type="button"
                onClick={handleResetMode}
                className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-default-400" />
                <span>{t(DICTIONARY.appearance.resetSection)}: Mode Tema</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 2. Palet Warna Aksen & Custom Hex (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-palette"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("palette")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                2. Palet Warna Aksen Antarmuka
              </h2>
              <p className="text-[11px] text-default-400">
                Pilih palet terkalibrasi atau masukkan kode Hex kustom untuk tombol dan status finansial.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono uppercase">
              {themePalette}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.palette ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.palette && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-4 pt-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => handlePaletteChange(pal.id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      themePalette === pal.id
                        ? "ring-2 shadow-md"
                        : "border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                    }`}
                    style={
                      themePalette === pal.id
                        ? {
                            borderColor: pal.hex,
                            boxShadow: `0 0 0 3px ${pal.hex}25`,
                            backgroundColor: `${pal.hex}0a`,
                          }
                        : undefined
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-full shadow-xs flex items-center justify-center text-white"
                      style={{ backgroundColor: pal.hex }}
                    >
                      {themePalette === pal.id && <Check className="w-4 h-4" />}
                    </div>
                    <span className="text-[11px] font-bold text-foreground text-center">
                      {pal.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Hex Row */}
              <div className="p-3.5 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/80 dark:border-default-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-foreground block">Custom Hex Color:</span>
                  <span className="text-[10px] text-default-500">Pilih warna primer kustom spesifik sesuai identitas Anda</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customHexColor}
                    onChange={(e) => setCustomHexColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-default-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customHexColor}
                    onChange={(e) => setCustomHexColor(e.target.value)}
                    placeholder="#2563eb"
                    className="w-24 h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <Button
                    size="sm"
                    onPress={handleCustomHexApply}
                    className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                  >
                    Terapkan
                  </Button>
                </div>
              </div>

              {/* Per-Section Reset */}
              <div className="flex justify-end pt-3 mt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={handleResetPalette}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3 text-default-400" />
                  <span>{t(DICTIONARY.appearance.resetSection)}: Palet Warna</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 3. Kepadatan Antarmuka & Custom Scaling (W & H) (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-density"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("density")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                3. Kepadatan Antarmuka & Ukuran Presisi (W × H)
              </h2>
              <p className="text-[11px] text-default-400">
                Atur spasi baris tabel data transaksi serta penskalaan persentase card horizontal & vertikal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono">
              {uiDensity} · {customDensityWidth}%×{customDensityHeight}%
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.density ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.density && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-4 pt-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { id: "compact" as const, label: "Compact", desc: "Padding rapat untuk data padat" },
                  { id: "standard" as const, label: "Standard", desc: "Keseimbangan seimbang & nyaman" },
                  { id: "spacious" as const, label: "Spacious", desc: "Ruang lega dengan padding luas" },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleDensityChange(d.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      uiDensity === d.id
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                        : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{d.label}</span>
                      {uiDensity === d.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </div>
                    <p className="text-[10px] text-default-500">{d.desc}</p>
                  </button>
                ))}

                {/* 4th Button: Custom Scale & Interactive Live Visual Preview */}
                <button
                  type="button"
                  onClick={() => {
                    playSoftChime();
                    setModalScaleW(customDensityWidth);
                    setModalScaleH(customDensityHeight);
                    setIsScaleModalOpen(true);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isScaleModalOpen
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                      : "border-purple-300/80 dark:border-purple-800/80 bg-purple-50/20 dark:bg-purple-950/20 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold text-foreground">Kustom & Preview</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 font-mono font-bold">
                      {customDensityWidth}%×{customDensityHeight}%
                    </span>
                  </div>
                  <p className="text-[10px] text-default-500">Popup slider presisi & live preview interaktif kartu neraca</p>
                </button>
              </div>

              {/* Granular Sidebar & Navbar Density */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sidebar Density & Width */}
                <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Kepadatan & Lebar Sidebar</span>
                      <span className="text-[10px] text-default-500">Lebar bilah navigasi vertikal</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                      {sidebarWidthCustom}px ({sidebarDensity})
                    </span>
                  </div>

                  {/* 3 Presets */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "compact" as const, label: "Rapat", px: 200 },
                      { id: "comfortable" as const, label: "Standar", px: 224 },
                      { id: "spacious" as const, label: "Lega", px: 260 },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playSoftChime();
                          setSidebarDensity(p.id);
                          setSidebarWidthCustom(p.px);
                        }}
                        className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                          sidebarDensity === p.id && sidebarWidthCustom === p.px
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                        }`}
                      >
                        <span className="block">{p.label}</span>
                        <span className="text-[9px] opacity-80 font-mono block">{p.px}px</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Width Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-default-500">
                      <span>Kustom Lebar Slider:</span>
                      <span className="font-mono font-bold text-foreground">{sidebarWidthCustom}px</span>
                    </div>
                    <input
                      type="range"
                      min="180"
                      max="320"
                      step="4"
                      value={sidebarWidthCustom}
                      onChange={(e) => {
                        const nextW = Number(e.target.value);
                        setSidebarWidthCustom(nextW);
                        if (nextW <= 200) setSidebarDensity("compact");
                        else if (nextW >= 250) setSidebarDensity("spacious");
                        else setSidebarDensity("comfortable");
                      }}
                      className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>

                {/* Navbar Density & Height */}
                <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Kepadatan & Tinggi Navbar</span>
                      <span className="text-[10px] text-default-500">Tinggi header horizontal (selaras dengan sidebar)</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                      {navbarHeightCustom}px ({navbarDensity})
                    </span>
                  </div>

                  {/* 3 Presets */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "compact" as const, label: "Rapat", px: 48 },
                      { id: "comfortable" as const, label: "Standar", px: 56 },
                      { id: "spacious" as const, label: "Lega", px: 64 },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          playSoftChime();
                          setNavbarDensity(p.id);
                          setNavbarHeightCustom(p.px);
                        }}
                        className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                          navbarDensity === p.id && navbarHeightCustom === p.px
                            ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                            : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                        }`}
                      >
                        <span className="block">{p.label}</span>
                        <span className="text-[9px] opacity-80 font-mono block">{p.px}px</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom Height Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-default-500">
                      <span>Kustom Tinggi Slider:</span>
                      <span className="font-mono font-bold text-foreground">{navbarHeightCustom}px</span>
                    </div>
                    <input
                      type="range"
                      min="44"
                      max="80"
                      step="2"
                      value={navbarHeightCustom}
                      onChange={(e) => {
                        const nextH = Number(e.target.value);
                        setNavbarHeightCustom(nextH);
                        if (nextH <= 50) setNavbarDensity("compact");
                        else if (nextH >= 62) setNavbarDensity("spacious");
                        else setNavbarDensity("comfortable");
                      }}
                      className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                  <p className="text-[9px] text-default-400">
                    💡 Tinggi header logo pada sidebar otomatis diselaraskan secara presisi dengan tinggi navbar.
                  </p>
                </div>
              </div>

              {/* Custom Width & Height Scaling */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Skala Dimensi Card Kustom (Width % × Height %)
                    </span>
                    <p className="text-[11px] text-default-500 mt-0.5">
                      Sesuaikan lebar horizontal dan tinggi card konten secara granular.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                    <span>{customDensityWidth}% W</span>
                    <span>×</span>
                    <span>{customDensityHeight}% H</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-default-500">
                      <span>Lebar Horizontal (W)</span>
                      <span className="font-mono">{customDensityWidth}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="120"
                      step="5"
                      value={customDensityWidth}
                      onChange={(e) => setCustomDensityWidth(Number(e.target.value))}
                      className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-default-500">
                      <span>Tinggi Vertikal (H)</span>
                      <span className="font-mono">{customDensityHeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="120"
                      step="5"
                      value={customDensityHeight}
                      onChange={(e) => setCustomDensityHeight(Number(e.target.value))}
                      className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onPress={handleCustomDensityApply}
                    className="h-7.5 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95"
                  >
                    Terapkan Dimensi Kustom
                  </Button>
                </div>
              </div>

              {/* Per-Section Reset */}
              <div className="flex justify-end pt-3 mt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={handleResetDensity}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3 text-default-400" />
                  <span>{t(DICTIONARY.appearance.resetSection)}: Kepadatan & Skala</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 4. Tipografi Font (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-fonts"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("fonts")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold shrink-0">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                4. Pilihan Tipografi & Font Antarmuka
              </h2>
              <p className="text-[11px] text-default-400">
                Pilih karakter font yang nyaman untuk pembacaan angka neraca finansial.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono uppercase">
              {fontFamily}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.fonts ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.fonts && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
              {FONTS.map((fnt) => (
                <button
                  key={fnt.id}
                  type="button"
                  onClick={() => handleFontChange(fnt.id)}
                  style={{ fontFamily: fnt.family }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    fontFamily === fnt.id
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30 shadow-xs"
                      : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100 dark:hover:bg-default-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{fnt.name}</span>
                    {fontFamily === fnt.id && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <p className="text-[10px] text-default-500 font-sans">{fnt.desc}</p>
                  <div
                    className="mt-2.5 p-2 rounded-lg bg-white dark:bg-default-800/80 border border-default-200/60 dark:border-default-700/60 shadow-2xs space-y-0.5"
                    style={{ fontFamily: fnt.family }}
                  >
                    <div className="text-xs font-bold text-foreground tracking-tight">
                      Rp 148.520.000
                    </div>
                    <div className="text-[10px] text-default-400">
                      Cashflow +18.4% · {fnt.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Per-Section Reset */}
            <div className="flex justify-end pt-3 mt-3 border-t border-default-100 dark:border-default-800">
              <button
                type="button"
                onClick={handleResetFonts}
                className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95 shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-default-400" />
                <span>{t(DICTIONARY.appearance.resetSection)}: Tipografi Font</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 5. Latar Belakang Kosmik & Efek Glass (Foldable) */}
      {/* ========================================================================= */}
      <Card
        id="section-background"
        className="scroll-mt-14 border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden"
      >
        <div
          onClick={() => toggleFold("background")}
          className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-default-50/50 dark:hover:bg-default-800/30 transition select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                5. Latar Belakang Kosmik Nebula & Efek Kaca Glass
              </h2>
              <p className="text-[11px] text-default-400">
                Atur efek gelombang kosmik fluid dan blur backdrop kartu dashboard.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-500 font-mono uppercase">
              {backgroundStyle}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-default-400 hover:text-foreground">
              {foldedSections.background ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </div>

        {!foldedSections.background && (
          <div className="p-4 sm:p-5 pt-0 border-t border-default-100 dark:border-default-800">
            <div className="space-y-5 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleBgStyleChange("fluid")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    backgroundStyle === "fluid"
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                      : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground">Fluid Cosmic Wave</span>
                    {backgroundStyle === "fluid" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <p className="text-[11px] text-default-500 leading-relaxed">
                    Latar belakang gelombang kosmik nebula halus dengan gradasi estetik dan efek modern.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleBgStyleChange("plain")}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    backgroundStyle === "plain"
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purple-500/30"
                      : "border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground">Polosan Minimalist</span>
                    {backgroundStyle === "plain" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </div>
                  <p className="text-[11px] text-default-500 leading-relaxed">
                    Latar belakang bersih tanpa gelombang gradient untuk fokus maksimal pada data angka.
                  </p>
                </button>
              </div>

              {/* Toggles */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Glow Nebula Halus</span>
                    <span className="text-[10px] text-default-500">Pendaran cahaya lembut di sudut antarmuka</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableNebulaGlow}
                    onClick={() => {
                      const nextVal = !enableNebulaGlow;
                      setEnableNebulaGlow(nextVal);
                      localStorage.setItem("novajournal_nebula_glow", String(nextVal));
                      playSoftChime();
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      enableNebulaGlow ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                        enableNebulaGlow ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Backdrop Glass Effect</span>
                    <span className="text-[10px] text-default-500">Efek kaca buram (blur) transparan pada kartu</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enableBackdropGlass}
                    onClick={() => {
                      const nextVal = !enableBackdropGlass;
                      setEnableBackdropGlass(nextVal);
                      localStorage.setItem("novajournal_backdrop_glass", String(nextVal));
                      document.documentElement.setAttribute("data-backdrop-glass", String(nextVal));
                      playSoftChime();
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      enableBackdropGlass ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                        enableBackdropGlass ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Detailed Sidebar Styling Card */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-3">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Gaya Bilah Samping (Sidebar Customization)
                  </span>
                  <p className="text-[11px] text-default-500 mt-0.5">
                    Pilih material latar belakang sidebar dan gaya indikator menu navigasi yang sedang aktif.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Backdrop Style */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">Material Latar Sidebar:</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "glass" as const, label: "Glass" },
                        { id: "solid" as const, label: "Solid" },
                        { id: "minimal" as const, label: "Minimal" },
                        { id: "accent" as const, label: "Accent" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            playSoftChime();
                            setSidebarBackdrop(item.id);
                          }}
                          className={`p-1.5 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                            sidebarBackdrop === item.id
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Indicator Style */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">Indikator Menu Aktif:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "pill" as const, label: "Pill Box" },
                        { id: "line" as const, label: "Line Border" },
                        { id: "glow" as const, label: "Glow Pendar" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            playSoftChime();
                            setSidebarIndicator(item.id);
                          }}
                          className={`p-1.5 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                            sidebarIndicator === item.id
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Borderless Style */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">Garis Batas (Border):</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { val: false, label: "Bergaris (Bordered)" },
                        { val: true, label: "Tanpa Garis (Borderless)" },
                      ].map((item) => (
                        <button
                          key={String(item.val)}
                          type="button"
                          onClick={() => {
                            playSoftChime();
                            setSidebarBorderless(item.val);
                          }}
                          className={`p-1.5 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                            sidebarBorderless === item.val
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Shadow / Elevation */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-foreground">Bayangan Sidebar (Elevation):</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "none" as const, label: "Rata (Flat)" },
                        { id: "subtle" as const, label: "Halus (Subtle)" },
                        { id: "elevated" as const, label: "Melayang (Elevated)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            playSoftChime();
                            setSidebarShadow(item.id);
                          }}
                          className={`p-1.5 rounded-lg border text-center text-xs font-semibold cursor-pointer transition ${
                            sidebarShadow === item.id
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : "bg-white dark:bg-default-900 border-default-200 dark:border-default-700 text-default-600"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Navbar Styling Card */}
              <div className="p-4 rounded-xl border border-default-200/80 dark:border-default-700/80 bg-default-50/60 dark:bg-default-800/40 space-y-3">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Gaya Bilah Atas & Elemen Cepat (Navbar Customization)
                  </span>
                  <p className="text-[11px] text-default-500 mt-0.5">
                    Atur efek sticky melayang header dan sembunyikan atau tampilkan widget navigasi cepat.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sticky Glass Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-default-900/60 border border-default-200/60 dark:border-default-700/60">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Sticky Melayang</span>
                      <span className="text-[10px] text-default-500">Header tetap di atas saat scroll</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={navbarStickyGlass}
                      onClick={() => {
                        playSoftChime();
                        setNavbarStickyGlass(!navbarStickyGlass);
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        navbarStickyGlass ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          navbarStickyGlass ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Glass Background Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-default-900/60 border border-default-200/60 dark:border-default-700/60">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Latar Kaca (Glass Blur)</span>
                      <span className="text-[10px] text-default-500">Backdrop blur tembus pandang</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={navbarGlassBg}
                      onClick={() => {
                        playSoftChime();
                        const next = !navbarGlassBg;
                        setNavbarGlassBg(next);
                        try {
                          localStorage.setItem("novajournal_navbar_glass_bg", String(next));
                          window.dispatchEvent(new Event("novajournal_appearance_config_changed"));
                        } catch {}
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        navbarGlassBg ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          navbarGlassBg ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Online Ping Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-default-900/60 border border-default-200/60 dark:border-default-700/60">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Lampu Status Online</span>
                      <span className="text-[10px] text-default-500">Pill & ring hijau status aktif</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showOnlinePing}
                      onClick={() => {
                        playSoftChime();
                        setShowOnlinePing(!showOnlinePing);
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        showOnlinePing ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          showOnlinePing ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Role Badge Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-default-900/60 border border-default-200/60 dark:border-default-700/60">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Badge Role RBAC</span>
                      <span className="text-[10px] text-default-500">Pill privilege Owner/Admin/Staff</span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showRoleBadge}
                      onClick={() => {
                        playSoftChime();
                        setShowRoleBadge(!showRoleBadge);
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        showRoleBadge ? "bg-purple-600" : "bg-default-300 dark:bg-default-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                          showRoleBadge ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Fiat Pill & Lang Switcher Toggles */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-default-900/60 border border-default-200/60 dark:border-default-700/60">
                    <div>
                      <span className="text-xs font-bold text-foreground block">Pill Mata Uang & Bahasa</span>
                      <span className="text-[10px] text-default-500">Pill IDR/USD & tombol switch EN/ID</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        title="Toggle Fiat Pill"
                        onClick={() => {
                          playSoftChime();
                          setShowFiatPill(!showFiatPill);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                          showFiatPill
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-default-100 text-default-500 border-default-200 dark:border-default-700"
                        }`}
                      >
                        Fiat
                      </button>
                      <button
                        type="button"
                        title="Toggle Language Switcher"
                        onClick={() => {
                          playSoftChime();
                          setShowLangSwitcher(!showLangSwitcher);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                          showLangSwitcher
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-default-100 text-default-500 border-default-200 dark:border-default-700"
                        }`}
                      >
                        EN/ID
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-Section Reset */}
              <div className="flex justify-end pt-3 mt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={handleResetBackground}
                  className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-600 dark:text-default-400 hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer font-semibold active:scale-95 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3 text-default-400" />
                  <span>{t(DICTIONARY.appearance.resetSection)}: Efek Latar & Nebula</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* FLOATING QUICK-JUMP ANCHOR BUTTON & MINI POPUP NAVIGATION */}
      {/* ========================================================================= */}
      <div className="fixed right-4 sm:right-6 bottom-20 sm:bottom-24 z-40 flex flex-col items-end animate-in fade-in slide-in-from-bottom-4 duration-300">
        {quickJumpOpen && (
          <div className="mb-2 p-3 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-default-200/80 dark:border-default-800 shadow-2xl w-64 space-y-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-1.5">
                <ActiveIcon className="w-4 h-4" style={{ color: activeSec.color }} />
                <span className="text-xs font-bold text-foreground">Navigasi Seksi Cepat</span>
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
              {APPEARANCE_SECTIONS.map((sec) => {
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
                    {foldedSections[sec.id] && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-default-200 dark:bg-default-700 text-default-500 font-mono">
                        Folded
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-1.5 border-t border-default-100 dark:border-default-800 flex justify-between items-center text-[10px] text-default-400">
              <span>{APPEARANCE_SECTIONS.length} Seksi Tersedia</span>
              <button
                type="button"
                onClick={toggleAllSections}
                className="text-[10px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 font-medium hover:bg-default-200 cursor-pointer"
              >
                {areAllFolded ? "Buka Semua" : "Tutup Semua"}
              </button>
            </div>
          </div>
        )}

        {/* Minimalist Icon-Only Floating Sticky Anchor Button (Solid Fill, No Dark Stroke) */}
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
          <ActiveIcon className={`w-5 h-5 text-white transition-transform duration-300 ${quickJumpOpen ? "rotate-45" : "group-hover:scale-110"}`} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4TH BUTTON MODAL: CUSTOM SCALE & LIVE INTERACTIVE VISUAL PREVIEW          */}
      {/* ========================================================================= */}
      {isScaleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsScaleModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl p-5 w-full max-w-lg space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Kustom Skala & Preview Interaktif</h3>
                  <p className="text-[10px] text-default-400">Sesuaikan dimensi kartu neraca dan tinjau tampilannya secara live</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScaleModalOpen(false)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 p-3 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Lebar Horizontal (W)</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{modalScaleW}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="125"
                  step="5"
                  value={modalScaleW}
                  onChange={(e) => setModalScaleW(Number(e.target.value))}
                  className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-default-50/60 dark:bg-default-800/40 border border-default-200/60 dark:border-default-700/60">
                <div className="flex justify-between text-xs font-semibold text-foreground">
                  <span>Tinggi Vertikal (H)</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{modalScaleH}%</span>
                </div>
                <input
                  type="range"
                  min="75"
                  max="125"
                  step="5"
                  value={modalScaleH}
                  onChange={(e) => setModalScaleH(Number(e.target.value))}
                  className="w-full h-1.5 bg-default-200 dark:bg-default-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-default-400 font-medium mr-1">Preset Cepat:</span>
              {[
                { label: "85% Compact", w: 85, h: 85 },
                { label: "100% Standar", w: 100, h: 100 },
                { label: "115% Spacious", w: 115, h: 115 },
              ].map((pr) => (
                <button
                  key={pr.label}
                  type="button"
                  onClick={() => {
                    playRealisticClick();
                    setModalScaleW(pr.w);
                    setModalScaleH(pr.h);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition ${
                    modalScaleW === pr.w && modalScaleH === pr.h
                      ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                      : "border-default-200 dark:border-default-700 text-default-600 bg-white dark:bg-default-900 hover:bg-default-100"
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>

            {/* Live Interactive Preview Card */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-default-600 block">Preview Interaktif Live:</span>
              <div className="p-4 rounded-xl border border-default-200 dark:border-default-700 bg-default-50/50 dark:bg-default-900/50 flex items-center justify-center overflow-hidden min-h-[150px]">
                <div
                  className="border border-default-200/80 dark:border-default-700/80 bg-white dark:bg-gray-800 rounded-xl shadow-xs transition-all duration-150 space-y-2"
                  style={{
                    width: `${Math.round(270 * (modalScaleW / 100))}px`,
                    padding: `${Math.round(14 * (modalScaleH / 100))}px ${Math.round(16 * (modalScaleW / 100))}px`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider">Kas & Likuiditas</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">+14.2%</span>
                  </div>
                  <div className="text-base font-black text-foreground font-mono">
                    Rp 148.500.000
                  </div>
                  <div className="w-full bg-default-100 dark:bg-default-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-default-100 dark:border-default-800">
              <button
                type="button"
                onClick={() => {
                  setModalScaleW(100);
                  setModalScaleH(100);
                }}
                className="text-xs text-default-500 hover:text-foreground cursor-pointer font-medium"
              >
                Reset ke 100%
              </button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={() => setIsScaleModalOpen(false)}
                  className="text-xs h-8 cursor-pointer font-semibold"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onPress={() => {
                    playSoftChime();
                    setCustomDensityWidth(modalScaleW);
                    setCustomDensityHeight(modalScaleH);
                    setIsScaleModalOpen(false);
                    handleCustomDensityApply();
                  }}
                  className="text-xs h-8 bg-purple-600 text-white font-semibold cursor-pointer shadow-xs hover:bg-purple-700"
                >
                  Terapkan Skala ({modalScaleW}% × {modalScaleH}%)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
