"use client";

import React, { useState, useMemo } from "react";
import { Card, Button, Chip } from "@heroui/react";
import {
  Sparkles,
  Copy,
  Download,
  Check,
  Building2,
  Bookmark,
  BookmarkCheck,
  Eye,
  Type,
  Layers,
  Palette,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { playSoftChime } from "@/app/lib/sound";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

type PresentationMode = "all" | "icon" | "mark" | "lockup";
type ThemeMode = "auto" | "dark" | "light" | "nebula";

interface NovaLogoVariant {
  id: string;
  name: string;
  codename: string;
  subtitle: string;
  concept: string;
  primaryGradients: string[];
  renderIcon: (size?: number) => React.ReactElement;
  renderMark: (size?: number) => React.ReactElement;
  renderLockup: (size?: number) => React.ReactElement;
  getRawSvgIcon: () => string;
  getRawSvgMark: () => string;
  getRawSvgLockup: () => string;
}

export default function LogoExperimentPage() {
  const { selectedWorkspace, refreshWorkspaces } = useWorkspace();

  // State
  const [presentationMode, setPresentationMode] = useState<PresentationMode>("all");
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [filterFavorite, setFilterFavorite] = useState(false);

  const toggleFavorite = (id: string) => {
    playSoftChime();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopySvg = (key: string, svgString: string, label: string) => {
    playSoftChime();
    navigator.clipboard.writeText(svgString);
    setCopiedKey(key);
    triggerNovaToast({
      title: "SVG Tersalin! ✨",
      description: `Vektor SVG ${label} telah disalin ke clipboard.`,
      type: "success",
    });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadSvg = (filename: string, svgString: string) => {
    playSoftChime();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerNovaToast({
      title: "Download Berhasil",
      description: `File ${filename}.svg berhasil disimpan.`,
      type: "info",
    });
  };

  const handleApplyToWorkspace = async (logo: NovaLogoVariant) => {
    if (!selectedWorkspace?.id) {
      triggerNovaToast({
        title: "Pilih Workspace",
        description: "Pilih workspace aktif terlebih dahulu di navbar.",
        type: "error",
      });
      return;
    }

    setApplyingId(logo.id);
    playSoftChime();

    try {
      const svgCode = logo.getRawSvgIcon();
      const base64Svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;

      const res = await fetch(`/api/workspaces/${selectedWorkspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customBrandLogo: base64Svg,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengupdate logo workspace");

      localStorage.setItem("novajournal_custom_brand_logo", base64Svg);
      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
      await refreshWorkspaces();

      triggerNovaToast({
        title: "Logo Berhasil Diterapkan! 🚀",
        description: `${logo.name} kini aktif sebagai identitas resmi workspace ${selectedWorkspace.name}.`,
        type: "success",
      });
    } catch (e) {
      console.error(e);
      triggerNovaToast({
        title: "Gagal Menerapkan",
        description: "Terjadi gangguan saat menyimpan ke server.",
        type: "error",
      });
    } finally {
      setApplyingId(null);
    }
  };

  // 10 Fluid, Gradient, Soft, Rounded Nova Star Variants
  const VARIANTS: NovaLogoVariant[] = useMemo(
    () => [
      // 1. Fluid Aurora Nova
      {
        id: "aurora-nova",
        name: "Fluid Aurora Nova",
        codename: "NOVA-01",
        subtitle: "Organic Curved Rays · Soft Aurora Gradient",
        concept:
          "Bintang nova 4-sudut dengan kurva kurvilinear lembut berpadu gradien aurora cyan, indigo, dan violet. Sudut membulat organik tanpa sudut tajam kaku.",
        primaryGradients: ["#38bdf8", "#6366f1", "#a855f7"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="an-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="an-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <filter id="an-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#an-bg)" />
            {/* Ambient Back Glow */}
            <circle cx="50" cy="50" r="28" fill="#6366f1" opacity="0.25" filter="url(#an-glow)" />
            {/* Organic Fluid Star */}
            <path
              d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z"
              fill="url(#an-star)"
            />
            {/* Soft Inner Core */}
            <circle cx="50" cy="50" r="9" fill="#ffffff" opacity="0.9" />
            <circle cx="50" cy="50" r="4" fill="#38bdf8" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="an-m-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <path
              d="M50 14C50 34 34 50 14 50C34 50 50 66 50 86C50 66 66 50 86 50C66 50 50 34 50 14Z"
              fill="url(#an-m-star)"
            />
            <circle cx="50" cy="50" r="10" fill="#ffffff" opacity="0.95" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">{/* Icon at 38px */}
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="an-lk-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                  <linearGradient id="an-lk-star" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="url(#an-lk-bg)" />
                <path d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z" fill="url(#an-lk-star)" />
                <circle cx="50" cy="50" r="9" fill="#ffffff" opacity="0.9" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                AI Financial OS
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="an-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="an-star" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#an-bg)" />
  <path d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z" fill="url(#an-star)" />
  <circle cx="50" cy="50" r="9" fill="#ffffff" opacity="0.9" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="an-m-star" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <path d="M50 14C50 34 34 50 14 50C34 50 50 66 50 86C50 66 66 50 86 50C66 50 50 34 50 14Z" fill="url(#an-m-star)" />
  <circle cx="50" cy="50" r="10" fill="#ffffff" opacity="0.95" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0f172a" />
  <path d="M30 14C30 22 22 30 14 30C22 30 30 38 30 46C30 38 38 30 46 30C38 30 30 22 30 14Z" fill="#38bdf8" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#38bdf8">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">AI FINANCIAL OS</text>
</svg>`,
      },

      // 2. Pulsar Bloom
      {
        id: "pulsar-bloom",
        name: "Pulsar Bloom Nova",
        codename: "NOVA-02",
        subtitle: "Rounded Petal Rays · Mint to Deep Lagoon",
        concept:
          "Bintang nova berbentuk kuncup kelopak membulat yang memancarkan arus kas segar (mint-emerald) dan ketenangan modal likuid.",
        primaryGradients: ["#34d399", "#10b981", "#0284c7"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#042f2e" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="pb-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#pb-bg)" />
            {/* Rounded Petal Star Rays */}
            <path
              d="M50 18C52 32 68 48 82 50C68 52 52 68 50 82C48 68 32 52 18 50C32 48 48 32 50 18Z"
              fill="url(#pb-star)"
            />
            <circle cx="50" cy="50" r="12" fill="#ffffff" opacity="0.9" />
            <circle cx="50" cy="50" r="6" fill="#10b981" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pb-m-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <path
              d="M50 16C52 32 68 48 84 50C68 52 52 68 50 84C48 68 32 52 16 50C32 48 48 32 50 16Z"
              fill="url(#pb-m-star)"
            />
            <circle cx="50" cy="50" r="12" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#042f2e" />
                <path d="M50 18C52 32 68 48 82 50C68 52 52 68 50 82C48 68 32 52 18 50C32 48 48 32 50 18Z" fill="#34d399" />
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Treasury & Liquidity
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#042f2e" />
  <path d="M50 18C52 32 68 48 82 50C68 52 52 68 50 82C48 68 32 52 18 50C32 48 48 32 50 18Z" fill="#34d399" />
  <circle cx="50" cy="50" r="12" fill="#ffffff" opacity="0.9" />
  <circle cx="50" cy="50" r="6" fill="#10b981" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 16C52 32 68 48 84 50C68 52 52 68 50 84C48 68 32 52 16 50C32 48 48 32 50 16Z" fill="#34d399" />
  <circle cx="50" cy="50" r="12" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#042f2e" />
  <path d="M30 14C32 22 38 28 46 30C38 32 32 38 30 46C28 38 22 32 14 30C22 28 28 22 30 14Z" fill="#34d399" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#34d399">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">TREASURY & LIQUIDITY</text>
</svg>`,
      },

      // 3. Cosmic Pearl Nova
      {
        id: "cosmic-pearl",
        name: "Cosmic Pearl Nova",
        codename: "NOVA-03",
        subtitle: "Frosted Glassmorphic Star · Pure Obsidian",
        concept:
          "Bintang nova berkilau mutiara yang melayang di atas dasar squircle obsidian. Lapisan frosted glass berpadu cincin keemasan lembut.",
        primaryGradients: ["#f8fafc", "#e2e8f0", "#fbbf24"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#090d16" />
            <circle cx="50" cy="50" r="30" fill="#3b82f6" opacity="0.15" />
            <path
              d="M50 18C50 33 33 50 18 50C33 50 50 67 50 82C50 67 67 50 82 50C67 50 50 33 50 18Z"
              fill="#ffffff"
            />
            <path
              d="M50 28C50 39 39 50 28 50C39 50 50 61 50 72C50 61 61 50 72 50C61 50 50 39 50 28Z"
              fill="#fbbf24"
              opacity="0.85"
            />
            <circle cx="50" cy="50" r="6" fill="#090d16" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 14C50 33 33 50 14 50C33 50 50 67 50 86C50 67 67 50 86 50C67 50 50 33 50 14Z"
              fill="#ffffff"
            />
            <circle cx="50" cy="50" r="8" fill="#fbbf24" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#090d16" />
                <path d="M50 18C50 33 33 50 18 50C33 50 50 67 50 82C50 67 67 50 82 50C67 50 50 33 50 18Z" fill="#ffffff" />
                <circle cx="50" cy="50" r="6" fill="#fbbf24" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Enterprise Ledger
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#090d16" />
  <path d="M50 18C50 33 33 50 18 50C33 50 50 67 50 82C50 67 67 50 82 50C67 50 50 33 50 18Z" fill="#ffffff" />
  <circle cx="50" cy="50" r="6" fill="#fbbf24" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 14C50 33 33 50 14 50C33 50 50 67 50 86C50 67 67 50 86 50C67 50 50 33 50 14Z" fill="#ffffff" />
  <circle cx="50" cy="50" r="8" fill="#fbbf24" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#090d16" />
  <path d="M30 14C30 22 22 30 14 30C22 30 30 38 30 46C30 38 38 30 46 30C38 30 30 22 30 14Z" fill="#ffffff" />
  <circle cx="30" cy="30" r="4" fill="#fbbf24" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#fbbf24">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">ENTERPRISE LEDGER</text>
</svg>`,
      },

      // 4. Solaris Nova Flare
      {
        id: "solaris-flare",
        name: "Solaris Flare Nova",
        codename: "NOVA-04",
        subtitle: "Sunrise Amber to Velvet Rose · Radiant Warmth",
        concept:
          "Cahaya fajar finansial yang optimis. Perpaduan gradasi sunset amber, rose pink, dan soft violet pada lekukan bintang nova yang dinamis.",
        primaryGradients: ["#f59e0b", "#fb7185", "#8b5cf6"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sf-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#fb7185" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="#180b1e" />
            <path
              d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z"
              fill="url(#sf-star)"
            />
            {/* Small diagonal secondary flare */}
            <circle cx="28" cy="28" r="4" fill="#fb7185" opacity="0.8" />
            <circle cx="72" cy="72" r="4" fill="#f59e0b" opacity="0.8" />
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sf-m-star" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            <path
              d="M50 14C50 34 34 50 14 50C34 50 50 66 50 86C50 66 66 50 86 50C66 50 50 34 50 14Z"
              fill="url(#sf-m-star)"
            />
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#180b1e" />
                <path d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z" fill="#fb7185" />
                <circle cx="50" cy="50" r="8" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Growth Acceleration
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#180b1e" />
  <path d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z" fill="#fb7185" />
  <circle cx="50" cy="50" r="10" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 14C50 34 34 50 14 50C34 50 50 66 50 86C50 66 66 50 86 50C66 50 50 34 50 14Z" fill="#fb7185" />
  <circle cx="50" cy="50" r="10" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#180b1e" />
  <path d="M30 14C30 22 22 30 14 30C22 30 30 38 30 46C30 38 38 30 46 30C38 30 30 22 30 14Z" fill="#fb7185" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#fb7185">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">GROWTH ACCELERATION</text>
</svg>`,
      },

      // 5. Quantum Orbit Star
      {
        id: "quantum-orbit",
        name: "Quantum Orbit Star",
        codename: "NOVA-05",
        subtitle: "Fluid Orbital Rings · Deep Cyan to Royal Blue",
        concept:
          "Inti bintang nova yang dipeluk oleh cincin orbit oval membulat nan mulus. Menyatukan konsep multi-entitas holding yang berotasi selaras.",
        primaryGradients: ["#38bdf8", "#2563eb", "#1d4ed8"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#081026" />
            <ellipse cx="50" cy="50" rx="34" ry="15" transform="rotate(-35 50 50)" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
            <path
              d="M50 20C50 34 34 50 20 50C34 50 50 66 50 80C50 66 66 50 80 50C66 50 50 34 50 20Z"
              fill="#2563eb"
            />
            <circle cx="50" cy="50" r="8" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="50" rx="36" ry="16" transform="rotate(-35 50 50)" stroke="#38bdf8" strokeWidth="4.5" opacity="0.8" />
            <path
              d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z"
              fill="#2563eb"
            />
            <circle cx="50" cy="50" r="9" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#081026" />
                <ellipse cx="50" cy="50" rx="34" ry="15" transform="rotate(-35 50 50)" stroke="#38bdf8" strokeWidth="4" />
                <circle cx="50" cy="50" r="8" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Holding & Ecosystem
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#081026" />
  <ellipse cx="50" cy="50" rx="34" ry="15" transform="rotate(-35 50 50)" stroke="#38bdf8" stroke-width="4" opacity="0.75" />
  <path d="M50 20C50 34 34 50 20 50C34 50 50 66 50 80C50 66 66 50 80 50C66 50 50 34 50 20Z" fill="#2563eb" />
  <circle cx="50" cy="50" r="8" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="50" rx="36" ry="16" transform="rotate(-35 50 50)" stroke="#38bdf8" stroke-width="4.5" opacity="0.8" />
  <path d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z" fill="#2563eb" />
  <circle cx="50" cy="50" r="9" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#081026" />
  <circle cx="30" cy="30" r="6" fill="#38bdf8" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#38bdf8">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">HOLDING & ECOSYSTEM</text>
</svg>`,
      },

      // 6. Celestial Prism Star
      {
        id: "celestial-prism",
        name: "Celestial Prism Star",
        codename: "NOVA-06",
        subtitle: "Layered Translucent Crystals · Octagonal Harmony",
        concept:
          "Dua lapisan bintang 4-sudut yang saling menyilang membentuk bintang 8-sudut lembut. Transparansi gradasi memberikan efek kedalaman optik kelas institusional.",
        primaryGradients: ["#60a5fa", "#a78bfa", "#f472b6"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#0b0f19" />
            {/* Base cross star */}
            <path
              d="M50 18C50 33 33 50 18 50C33 50 50 67 50 82C50 67 67 50 82 50C67 50 50 33 50 18Z"
              fill="#3b82f6"
              opacity="0.8"
            />
            {/* Rotated 45-degree star */}
            <path
              d="M50 24C50 36 36 50 24 50C36 50 50 64 50 76C50 64 64 50 76 50C64 50 50 36 50 24Z"
              transform="rotate(45 50 50)"
              fill="#a855f7"
              opacity="0.75"
            />
            <circle cx="50" cy="50" r="7" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 16C50 33 33 50 16 50C33 50 50 67 50 84C50 67 67 50 84 50C67 50 50 33 50 16Z" fill="#3b82f6" opacity="0.8" />
            <path d="M50 22C50 36 36 50 22 50C36 50 50 64 50 78C50 64 64 50 78 50C64 50 50 36 50 22Z" transform="rotate(45 50 50)" fill="#a855f7" opacity="0.75" />
            <circle cx="50" cy="50" r="8" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#0b0f19" />
                <path d="M50 18C50 33 33 50 18 50C33 50 50 67 50 82C50 67 67 50 82 50C67 50 50 33 50 18Z" fill="#3b82f6" />
                <circle cx="50" cy="50" r="6" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Prism Ledger Core
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#0b0f19" />
  <path d="M50 18C50 33 33 50 18 50C33 50 50 67 50 82C50 67 67 50 82 50C67 50 50 33 50 18Z" fill="#3b82f6" opacity="0.8" />
  <path d="M50 24C50 36 36 50 24 50C36 50 50 64 50 76C50 64 64 50 76 50C64 50 50 36 50 24Z" transform="rotate(45 50 50)" fill="#a855f7" opacity="0.75" />
  <circle cx="50" cy="50" r="7" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 16C50 33 33 50 16 50C33 50 50 67 50 84C50 67 67 50 84 50C67 50 50 33 50 16Z" fill="#3b82f6" opacity="0.8" />
  <circle cx="50" cy="50" r="8" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0b0f19" />
  <circle cx="30" cy="30" r="5" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#60a5fa">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">PRISM LEDGER CORE</text>
</svg>`,
      },

      // 7. Nebula Glow Star
      {
        id: "nebula-glow",
        name: "Nebula Glow Nova",
        codename: "NOVA-07",
        subtitle: "Deep Space Radial Orb · Ambient Luminescence",
        concept:
          "Orb membulat dengan pendaran cahaya difus lembut menyerupai nebula luar angkasa, melindungi bintang putih di pusatnya.",
        primaryGradients: ["#4f46e5", "#7c3aed", "#c084fc"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="ng-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="#0a051b" />
            <circle cx="50" cy="50" r="40" fill="url(#ng-glow)" />
            <path
              d="M50 18C50 34 34 50 18 50C34 50 50 66 50 82C50 66 66 50 82 50C66 50 50 34 50 18Z"
              fill="#ffffff"
            />
            <circle cx="50" cy="50" r="5" fill="#7c3aed" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z"
              fill="#c084fc"
            />
            <circle cx="50" cy="50" r="8" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#0a051b" />
                <path d="M50 18C50 34 34 50 18 50C34 50 50 66 50 82C50 66 66 50 82 50C66 50 50 34 50 18Z" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Autonomous Intelligence
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#0a051b" />
  <path d="M50 18C50 34 34 50 18 50C34 50 50 66 50 82C50 66 66 50 82 50C66 50 50 34 50 18Z" fill="#ffffff" />
  <circle cx="50" cy="50" r="5" fill="#7c3aed" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z" fill="#c084fc" />
  <circle cx="50" cy="50" r="8" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0a051b" />
  <path d="M30 14C30 22 22 30 14 30C22 30 30 38 30 46C30 38 38 30 46 30C38 30 30 22 30 14Z" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#c084fc">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">AUTONOMOUS INTELLIGENCE</text>
</svg>`,
      },

      // 8. Zenith Wave Star
      {
        id: "zenith-wave",
        name: "Zenith Wave Star",
        codename: "NOVA-08",
        subtitle: "Sinusoidal Liquid Ribbons · Emerald Cyan Flow",
        concept:
          "Dua lengkungan kurva sinusoidal yang saling membelit halus membentuk intan bintang di persimpangannya. Mewakili kelincahan aliran kas masuk dan keluar.",
        primaryGradients: ["#10b981", "#06b6d4", "#3b82f6"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#03151e" />
            <path
              d="M18 50C32 28 68 28 82 50C68 72 32 72 18 50Z"
              stroke="#06b6d4"
              strokeWidth="5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M50 18C50 34 34 50 18 50C34 50 50 66 50 82C50 66 66 50 82 50C66 50 50 34 50 18Z"
              fill="#10b981"
            />
            <circle cx="50" cy="50" r="8" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z"
              fill="#10b981"
            />
            <circle cx="50" cy="50" r="9" fill="#06b6d4" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#03151e" />
                <path d="M50 18C50 34 34 50 18 50C34 50 50 66 50 82C50 66 66 50 82 50C66 50 50 34 50 18Z" fill="#10b981" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Dynamic Flow Matrix
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#03151e" />
  <path d="M50 18C50 34 34 50 18 50C34 50 50 66 50 82C50 66 66 50 82 50C66 50 50 34 50 18Z" fill="#10b981" />
  <circle cx="50" cy="50" r="8" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 16C50 34 34 50 16 50C34 50 50 66 50 84C50 66 66 50 84 50C66 50 50 34 50 16Z" fill="#10b981" />
  <circle cx="50" cy="50" r="9" fill="#06b6d4" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#03151e" />
  <path d="M30 14C30 22 22 30 14 30C22 30 30 38 30 46C30 38 38 30 46 30C38 30 30 22 30 14Z" fill="#10b981" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#10b981">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">DYNAMIC FLOW MATRIX</text>
</svg>`,
      },

      // 9. Aether Droplet Star
      {
        id: "aether-droplet",
        name: "Aether Droplet Nova",
        codename: "NOVA-09",
        subtitle: "Liquid Droplet Symbiosis · Violet Indigo",
        concept:
          "Empat tetesan cairan modal yang menyatu secara harmonis membentuk bintang nova di tengahnya. Menghadirkan kesan fluid, soft, dan modern.",
        primaryGradients: ["#818cf8", "#c084fc", "#38bdf8"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#0f0c29" />
            <circle cx="50" cy="28" r="9" fill="#38bdf8" />
            <circle cx="72" cy="50" r="9" fill="#818cf8" />
            <circle cx="50" cy="72" r="9" fill="#c084fc" />
            <circle cx="28" cy="50" r="9" fill="#818cf8" />
            <path
              d="M50 24C50 37 37 50 24 50C37 50 50 63 50 76C50 63 63 50 76 50C63 50 50 37 50 24Z"
              fill="#ffffff"
            />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="26" r="10" fill="#38bdf8" />
            <circle cx="74" cy="50" r="10" fill="#818cf8" />
            <circle cx="50" cy="74" r="10" fill="#c084fc" />
            <circle cx="26" cy="50" r="10" fill="#818cf8" />
            <path d="M50 22C50 37 37 50 22 50C37 50 50 63 50 78C50 63 63 50 78 50C63 50 50 37 50 22Z" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#0f0c29" />
                <path d="M50 24C50 37 37 50 24 50C37 50 50 63 50 76C50 63 63 50 76 50C63 50 50 37 50 24Z" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Fluid Asset Ledger
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#0f0c29" />
  <circle cx="50" cy="28" r="9" fill="#38bdf8" />
  <circle cx="72" cy="50" r="9" fill="#818cf8" />
  <circle cx="50" cy="72" r="9" fill="#c084fc" />
  <circle cx="28" cy="50" r="9" fill="#818cf8" />
  <path d="M50 24C50 37 37 50 24 50C37 50 50 63 50 76C50 63 63 50 76 50C63 50 50 37 50 24Z" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 22C50 37 37 50 22 50C37 50 50 63 50 78C50 63 63 50 78 50C63 50 50 37 50 22Z" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0f0c29" />
  <path d="M30 16C30 23 23 30 16 30C23 30 30 37 30 44C30 37 37 30 44 30C37 30 30 23 30 16Z" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#818cf8">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">FLUID ASSET LEDGER</text>
</svg>`,
      },

      // 10. Lumina Crown Monogram
      {
        id: "lumina-crown",
        name: "Lumina Crown Star",
        codename: "NOVA-10",
        subtitle: "Monogram 'N' + Gold Nova Spark · Executive Prestige",
        concept:
          "Bentuk 'N' lembut berlekuk halus dengan sudut super-elips yang dinobatkan bintang nova emas berkilau. Kombinasi ketegasan brand korporat dan kehangatan modern.",
        primaryGradients: ["#2563eb", "#3b82f6", "#f59e0b"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#0b172e" />
            {/* Soft stylized N curve */}
            <path
              d="M28 72V32C28 29.8 29.8 28 32 28C34.2 28 36 29.8 36 32V68L64 30C65.5 28 68 28 70 29.5C71.3 30.5 72 32 72 33.5V68C72 70.2 70.2 72 68 72C65.8 72 64 70.2 64 68V40L36 78C34.5 80 32 80 30 78.5C28.7 77.5 28 76 28 74V72Z"
              fill="#3b82f6"
            />
            {/* Nova Star Spark at top right */}
            <path
              d="M74 16C74 21 69 26 64 26C69 26 74 31 74 36C74 31 79 26 84 26C79 26 74 21 74 16Z"
              fill="#fbbf24"
            />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M28 72V32C28 29.8 29.8 28 32 28C34.2 28 36 29.8 36 32V68L64 30C65.5 28 68 28 70 29.5C71.3 30.5 72 32 72 33.5V68C72 70.2 70.2 72 68 72C65.8 72 64 70.2 64 68V40L36 78C34.5 80 32 80 30 78.5C28.7 77.5 28 76 28 74V72Z"
              fill="#3b82f6"
            />
            <path
              d="M74 16C74 21 69 26 64 26C69 26 74 31 74 36C74 31 79 26 84 26C79 26 74 21 74 16Z"
              fill="#fbbf24"
            />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#0b172e" />
                <path d="M74 16C74 21 69 26 64 26C69 26 74 31 74 36C74 31 79 26 84 26C79 26 74 21 74 16Z" fill="#fbbf24" />
                <circle cx="48" cy="50" r="10" fill="#3b82f6" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Executive Capital OS
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#0b172e" />
  <path d="M28 72V32C28 29.8 29.8 28 32 28C34.2 28 36 29.8 36 32V68L64 30C65.5 28 68 28 70 29.5C71.3 30.5 72 32 72 33.5V68C72 70.2 70.2 72 68 72C65.8 72 64 70.2 64 68V40L36 78C34.5 80 32 80 30 78.5C28.7 77.5 28 76 28 74V72Z" fill="#3b82f6" />
  <path d="M74 16C74 21 69 26 64 26C69 26 74 31 74 36C74 31 79 26 84 26C79 26 74 21 74 16Z" fill="#fbbf24" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M74 16C74 21 69 26 64 26C69 26 74 31 74 36C74 31 79 26 84 26C79 26 74 21 74 16Z" fill="#fbbf24" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0b172e" />
  <path d="M36 12C36 16 32 20 28 20C32 20 36 24 36 28C36 24 40 20 44 20C40 20 36 16 36 12Z" fill="#fbbf24" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#3b82f6">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">EXECUTIVE CAPITAL OS</text>
</svg>`,
      },
    ],
    []
  );

  // Filtered
  const displayedVariants = useMemo(() => {
    if (!filterFavorite) return VARIANTS;
    return VARIANTS.filter((v) => favorites[v.id]);
  }, [filterFavorite, VARIANTS, favorites]);

  // Stage Background style
  const getStageBgStyle = () => {
    switch (themeMode) {
      case "light":
        return "bg-slate-100/90 border-slate-200 text-slate-900";
      case "dark":
        return "bg-slate-950/95 border-slate-800 text-white";
      case "nebula":
        return "bg-linear-to-br from-indigo-950/90 via-purple-950/80 to-slate-950 border-purple-900/40 text-white";
      case "auto":
      default:
        return "bg-default-50/80 dark:bg-default-900/60 border-default-200/80 dark:border-default-800 text-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-default-50/70 dark:bg-gray-950 p-4 md:p-6 lg:p-8 space-y-6 text-foreground">
      {/* ── Header: 1 Row Title, 1 Row Toolbar ───────────────────────── */}
      <div className="space-y-4 border-b border-default-200/80 dark:border-default-800/80 pb-5">
        {/* Row 1: H1 & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-linear-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                NovaFinance Logo Experiment Lab
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                Fluid & Rounded Nova Stars
              </span>
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              10 varian identitas visual modern SaaS bergradien lembut. Uji mode <strong>Icon Only</strong>, <strong>Logo Tanpa Text</strong>, dan <strong>Logo Dengan Text</strong>.
            </p>
          </div>
        </div>

        {/* Row 2: Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mode Switcher: All, Icon, Mark, Lockup */}
          <div className="flex items-center p-1 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setPresentationMode("all");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                presentationMode === "all"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Semua Mode</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setPresentationMode("icon");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                presentationMode === "icon"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Icon Only</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setPresentationMode("mark");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                presentationMode === "mark"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Logo Tanpa Text</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setPresentationMode("lockup");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                presentationMode === "lockup"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Logo Dengan Text</span>
            </button>
          </div>

          {/* Right Toolbar: Background Theme & Favorite Filter */}
          <div className="flex items-center gap-2">
            {/* Theme Stage Selector */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs">
              <span className="text-[10.5px] font-semibold text-default-400 px-1.5">Theme:</span>
              <button
                type="button"
                onClick={() => setThemeMode("auto")}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  themeMode === "auto" ? "bg-default-200 dark:bg-default-700 text-foreground" : "text-default-400"
                }`}
              >
                Auto Theme
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("light")}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  themeMode === "light" ? "bg-white text-slate-900 shadow-2xs" : "text-default-400"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("dark")}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  themeMode === "dark" ? "bg-slate-900 text-white shadow-2xs" : "text-default-400"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("nebula")}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                  themeMode === "nebula" ? "bg-purple-900 text-white shadow-2xs" : "text-default-400"
                }`}
              >
                Nebula
              </button>
            </div>

            {/* Favorite Filter Button */}
            <button
              type="button"
              onClick={() => {
                playSoftChime();
                setFilterFavorite(!filterFavorite);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-2xs ${
                filterFavorite
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                  : "bg-white dark:bg-gray-900 border-default-200/80 dark:border-default-800 text-default-500 hover:text-foreground"
              }`}
            >
              {filterFavorite ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>Favorit ({Object.values(favorites).filter(Boolean).length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Gallery Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedVariants.map((logo) => {
          const isFav = favorites[logo.id];
          const isApplying = applyingId === logo.id;

          return (
            <Card
              key={logo.id}
              className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Header Info */}
              <div className="p-4 border-b border-default-100 dark:border-default-800/80 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{logo.name}</h3>
                    <Chip size="sm" variant="soft" color="accent" className="text-[10px] font-mono font-bold">
                      {logo.codename}
                    </Chip>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{logo.subtitle}</p>
                  <p className="text-xs text-default-500 mt-1 leading-relaxed">{logo.concept}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFavorite(logo.id)}
                  className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                    isFav
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                      : "bg-default-50 dark:bg-default-800 border-default-200/80 dark:border-default-700 text-default-400 hover:text-foreground"
                  }`}
                  title={isFav ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                >
                  {isFav ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              {/* Showcase Stage */}
              <div className={`p-6 border-b border-default-100 dark:border-default-800 transition-colors ${getStageBgStyle()}`}>
                {presentationMode === "icon" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="transition-transform duration-300 hover:scale-105 shadow-xl rounded-[28px]">
                      {logo.renderIcon(92)}
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-default-400 mt-3">
                      Icon Only (Super-ellipse Squircle)
                    </span>
                  </div>
                )}

                {presentationMode === "mark" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="transition-transform duration-300 hover:scale-105 drop-shadow-lg">
                      {logo.renderMark(92)}
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-default-400 mt-3">
                      Logo Tanpa Text (Organic Star Mark)
                    </span>
                  </div>
                )}

                {presentationMode === "lockup" && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="p-4 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/10 transition-transform duration-300 hover:scale-105">
                      {logo.renderLockup()}
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-default-400 mt-3">
                      Logo Dengan Text (Full Wordmark Lockup)
                    </span>
                  </div>
                )}

                {presentationMode === "all" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center py-2">
                    {/* 1. Icon Only */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/30 dark:bg-black/20 border border-default-200/40 dark:border-default-800/40">
                      <div className="shadow-md rounded-2xl overflow-hidden">
                        {logo.renderIcon(54)}
                      </div>
                      <span className="text-[10px] font-bold text-default-400 mt-2">Icon Only</span>
                    </div>

                    {/* 2. Logo Tanpa Text */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/30 dark:bg-black/20 border border-default-200/40 dark:border-default-800/40">
                      <div className="drop-shadow-sm">
                        {logo.renderMark(54)}
                      </div>
                      <span className="text-[10px] font-bold text-default-400 mt-2">Tanpa Text</span>
                    </div>

                    {/* 3. Logo Dengan Text */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/30 dark:bg-black/20 border border-default-200/40 dark:border-default-800/40">
                      <div className="scale-90 origin-center">
                        {logo.renderLockup()}
                      </div>
                      <span className="text-[10px] font-bold text-default-400 mt-2">Dengan Text</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Scalability Testing: 16px Favicon, 24px Navbar, 40px Card */}
              <div className="p-3.5 bg-default-50/50 dark:bg-default-900/30 border-b border-default-100 dark:border-default-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-default-400 block mb-2">
                  Uji Skalabilitas Downsampling
                </span>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-default-200/70 dark:border-default-800">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center p-0.5">
                      {logo.renderIcon(16)}
                    </div>
                    <span className="text-[9px] font-mono text-default-400">16px Favicon</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center p-0.5">
                      {logo.renderIcon(24)}
                    </div>
                    <span className="text-[9px] font-mono text-default-400">24px Navbar</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center p-1">
                      {logo.renderIcon(36)}
                    </div>
                    <span className="text-[9px] font-mono text-default-400">36px Card</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center p-1.5">
                      {logo.renderIcon(52)}
                    </div>
                    <span className="text-[9px] font-mono text-default-400">52px App Icon</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Copy Icon */}
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleCopySvg(`${logo.id}-icon`, logo.getRawSvgIcon(), `${logo.name} (Icon)`)}
                    className="flex-1 h-8 text-[11px] font-semibold border-default-200 dark:border-default-700 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === `${logo.id}-icon` ? (
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1 text-default-400" />
                    )}
                    <span>Salin Icon</span>
                  </Button>

                  {/* Copy Lockup */}
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleCopySvg(`${logo.id}-lockup`, logo.getRawSvgLockup(), `${logo.name} (Dengan Text)`)}
                    className="flex-1 h-8 text-[11px] font-semibold border-default-200 dark:border-default-700 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === `${logo.id}-lockup` ? (
                      <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1 text-default-400" />
                    )}
                    <span>Salin Text Logo</span>
                  </Button>

                  {/* Download */}
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleDownloadSvg(`novafinance-${logo.id}`, logo.getRawSvgIcon())}
                    className="h-8 px-2.5 text-[11px] font-semibold border-default-200 dark:border-default-700 cursor-pointer shadow-2xs"
                    aria-label="Download SVG File"
                  >
                    <Download className="w-3.5 h-3.5 text-default-400" />
                  </Button>

                  {/* Apply to workspace */}
                  <Button
                    size="sm"
                    variant="primary"
                    isDisabled={isApplying}
                    onPress={() => handleApplyToWorkspace(logo)}
                    className="h-8 px-3 text-[11px] font-semibold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white cursor-pointer shadow-xs hover:opacity-95 transition-all"
                  >
                    {isApplying ? (
                      <span>Menerapkan...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        <span>Terapkan Logo</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
