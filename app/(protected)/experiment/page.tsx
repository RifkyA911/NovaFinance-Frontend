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
  Type,
  Layers,
  Palette,
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
  renderLockup: () => React.ReactElement;
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

  // 10 Fluid, Gradient, Soft, Rounded Nova Star Variants (ZERO SHARP TIPS)
  const VARIANTS: NovaLogoVariant[] = useMemo(
    () => [
      // 1. Metaball Fluid Nova
      {
        id: "metaball-nova",
        name: "Metaball Fluid Nova",
        codename: "BUBBLE-01",
        subtitle: "Organic Metaball Nodes · Cyan to Royal Violet",
        concept:
          "Empat gelembung cairan organik yang menyatu secara plastis dengan jembatan kurva metaball lembut mengitari inti cahaya putih. Tanpa sudut lancip sama sekali.",
        primaryGradients: ["#06b6d4", "#3b82f6", "#8b5cf6"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#080e1e" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="mb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#mb-bg)" />
            {/* Fluid metaball shape with zero sharp points */}
            <path
              d="M50 20C54 20 58 24 58 32C58 40 60 42 68 42C76 42 80 46 80 50C80 54 76 58 68 58C60 58 58 60 58 68C58 76 54 80 50 80C46 80 42 76 42 68C42 60 40 58 32 58C24 58 20 54 20 50C20 46 24 42 32 42C40 42 42 40 42 32C42 24 46 20 50 20Z"
              fill="url(#mb-grad)"
            />
            {/* Soft inner pearl */}
            <circle cx="50" cy="50" r="11" fill="#ffffff" opacity="0.95" />
            <circle cx="50" cy="50" r="5" fill="#06b6d4" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mb-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <path
              d="M50 18C55 18 60 23 60 32C60 40 60 40 68 40C77 40 82 45 82 50C82 55 77 60 68 60C60 60 60 60 60 68C60 77 55 82 50 82C45 82 40 77 40 68C40 60 40 60 32 60C23 60 18 55 18 50C18 45 23 40 32 40C40 40 40 40 40 32C40 23 45 18 50 18Z"
              fill="url(#mb-m-grad)"
            />
            <circle cx="50" cy="50" r="12" fill="#ffffff" opacity="0.95" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#080e1e" />
                <path d="M50 20C54 20 58 24 58 32C58 40 60 42 68 42C76 42 80 46 80 50C80 54 76 58 68 58C60 58 58 60 58 68C58 76 54 80 50 80C46 80 42 76 42 68C42 60 40 58 32 58C24 58 20 54 20 50C20 46 24 42 32 42C40 42 42 40 42 32C42 24 46 20 50 20Z" fill="#3b82f6" />
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
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
                AI Financial OS
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mb-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080e1e" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="mb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#mb-bg)" />
  <path d="M50 20C54 20 58 24 58 32C58 40 60 42 68 42C76 42 80 46 80 50C80 54 76 58 68 58C60 58 58 60 58 68C58 76 54 80 50 80C46 80 42 76 42 68C42 60 40 58 32 58C24 58 20 54 20 50C20 46 24 42 32 42C40 42 42 40 42 32C42 24 46 20 50 20Z" fill="url(#mb-grad)" />
  <circle cx="50" cy="50" r="11" fill="#ffffff" opacity="0.95" />
  <circle cx="50" cy="50" r="5" fill="#06b6d4" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mb-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <path d="M50 18C55 18 60 23 60 32C60 40 60 40 68 40C77 40 82 45 82 50C82 55 77 60 68 60C60 60 60 60 60 68C60 77 55 82 50 82C45 82 40 77 40 68C40 60 40 60 32 60C23 60 18 55 18 50C18 45 23 40 32 40C40 40 40 40 40 32C40 23 45 18 50 18Z" fill="url(#mb-m-grad)" />
  <circle cx="50" cy="50" r="12" fill="#ffffff" opacity="0.95" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#080e1e" />
  <path d="M30 15C32 15 34 17 34 21C34 25 35 26 39 26C43 26 45 28 45 30C45 32 43 34 39 34C35 34 34 35 34 39C34 43 32 45 30 45C28 45 26 43 26 39C26 35 25 34 21 34C17 34 15 32 15 30C15 28 17 26 21 26C25 26 26 25 26 21C26 17 28 15 30 15Z" fill="#3b82f6" />
  <circle cx="30" cy="30" r="5" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#38bdf8">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">AI FINANCIAL OS</text>
</svg>`,
      },

      // 2. Soft Cloud Puff Nova
      {
        id: "cloud-puff",
        name: "Cloud Puff Nova",
        codename: "BUBBLE-02",
        subtitle: "Marshmallow Petals · Sunset Peach to Amber",
        concept:
          "Empat kelopak gelembung awan membulat tebal yang saling bertumpuk lembut seperti marshmallow dengan gradasi sunset rose ke golden amber.",
        primaryGradients: ["#fb7185", "#f43f5e", "#f59e0b"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cp-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a091c" />
                <stop offset="100%" stopColor="#2e081d" />
              </linearGradient>
              <linearGradient id="cp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#cp-bg)" />
            {/* 4 Overlapping pillowy bubbles */}
            <circle cx="50" cy="32" r="16" fill="url(#cp-grad)" opacity="0.9" />
            <circle cx="68" cy="50" r="16" fill="url(#cp-grad)" opacity="0.9" />
            <circle cx="50" cy="68" r="16" fill="url(#cp-grad)" opacity="0.9" />
            <circle cx="32" cy="50" r="16" fill="url(#cp-grad)" opacity="0.9" />
            <circle cx="50" cy="50" r="14" fill="#ffffff" />
            <circle cx="50" cy="50" r="6" fill="#f43f5e" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="30" r="18" fill="#fb7185" />
            <circle cx="70" cy="50" r="18" fill="#f43f5e" />
            <circle cx="50" cy="70" r="18" fill="#f59e0b" />
            <circle cx="30" cy="50" r="18" fill="#fb7185" />
            <circle cx="50" cy="50" r="14" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#1a091c" />
                <circle cx="50" cy="34" r="14" fill="#fb7185" />
                <circle cx="66" cy="50" r="14" fill="#f43f5e" />
                <circle cx="50" cy="66" r="14" fill="#f59e0b" />
                <circle cx="34" cy="50" r="14" fill="#fb7185" />
                <circle cx="50" cy="50" r="10" fill="#ffffff" />
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
  <rect width="100" height="100" rx="28" fill="#1a091c" />
  <circle cx="50" cy="32" r="16" fill="#fb7185" />
  <circle cx="68" cy="50" r="16" fill="#f43f5e" />
  <circle cx="50" cy="68" r="16" fill="#f59e0b" />
  <circle cx="32" cy="50" r="16" fill="#fb7185" />
  <circle cx="50" cy="50" r="14" fill="#ffffff" />
  <circle cx="50" cy="50" r="6" fill="#f43f5e" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="30" r="18" fill="#fb7185" />
  <circle cx="70" cy="50" r="18" fill="#f43f5e" />
  <circle cx="50" cy="70" r="18" fill="#f59e0b" />
  <circle cx="30" cy="50" r="18" fill="#fb7185" />
  <circle cx="50" cy="50" r="14" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#1a091c" />
  <circle cx="30" cy="22" r="7" fill="#fb7185" />
  <circle cx="38" cy="30" r="7" fill="#f43f5e" />
  <circle cx="30" cy="38" r="7" fill="#f59e0b" />
  <circle cx="22" cy="30" r="7" fill="#fb7185" />
  <circle cx="30" cy="30" r="5" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#fb7185">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">GROWTH ACCELERATION</text>
</svg>`,
      },

      // 3. Liquid Pearl Orbit
      {
        id: "pearl-orbit",
        name: "Liquid Pearl Orbit",
        codename: "BUBBLE-03",
        subtitle: "Glossy Droplet Satellite · Mint to Deep Lagoon",
        concept:
          "Satu gelembung mutiara sentral dikelilingi oleh empat gelembung likuid melayang yang terhubung oleh cincin halus. Mewakili kas likuid yang beredar bebas.",
        primaryGradients: ["#34d399", "#10b981", "#0284c7"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="po-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="#041f1e" />
            <circle cx="50" cy="50" r="26" stroke="#10b981" strokeWidth="3" strokeDasharray="4 4" opacity="0.4" />
            <circle cx="50" cy="24" r="9" fill="url(#po-grad)" />
            <circle cx="76" cy="50" r="9" fill="url(#po-grad)" />
            <circle cx="50" cy="76" r="9" fill="url(#po-grad)" />
            <circle cx="24" cy="50" r="9" fill="url(#po-grad)" />
            <circle cx="50" cy="50" r="14" fill="#ffffff" />
            <circle cx="50" cy="50" r="7" fill="#10b981" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="22" r="10" fill="#34d399" />
            <circle cx="78" cy="50" r="10" fill="#10b981" />
            <circle cx="50" cy="78" r="10" fill="#0284c7" />
            <circle cx="22" cy="50" r="10" fill="#34d399" />
            <circle cx="50" cy="50" r="16" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#041f1e" />
                <circle cx="50" cy="24" r="8" fill="#34d399" />
                <circle cx="76" cy="50" r="8" fill="#10b981" />
                <circle cx="50" cy="76" r="8" fill="#0284c7" />
                <circle cx="24" cy="50" r="8" fill="#34d399" />
                <circle cx="50" cy="50" r="12" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
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
  <rect width="100" height="100" rx="28" fill="#041f1e" />
  <circle cx="50" cy="24" r="9" fill="#34d399" />
  <circle cx="76" cy="50" r="9" fill="#10b981" />
  <circle cx="50" cy="76" r="9" fill="#0284c7" />
  <circle cx="24" cy="50" r="9" fill="#34d399" />
  <circle cx="50" cy="50" r="14" fill="#ffffff" />
  <circle cx="50" cy="50" r="7" fill="#10b981" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="22" r="10" fill="#34d399" />
  <circle cx="78" cy="50" r="10" fill="#10b981" />
  <circle cx="50" cy="78" r="10" fill="#0284c7" />
  <circle cx="22" cy="50" r="10" fill="#34d399" />
  <circle cx="50" cy="50" r="16" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#041f1e" />
  <circle cx="30" cy="18" r="4" fill="#34d399" />
  <circle cx="42" cy="30" r="4" fill="#10b981" />
  <circle cx="30" cy="42" r="4" fill="#0284c7" />
  <circle cx="18" cy="30" r="4" fill="#34d399" />
  <circle cx="30" cy="30" r="6" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#34d399">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">TREASURY & LIQUIDITY</text>
</svg>`,
      },

      // 4. Pill Capsule Nova
      {
        id: "pill-capsule",
        name: "Pill Capsule Nova",
        codename: "BUBBLE-04",
        subtitle: "Rounded Pill Bars · Electric Indigo & Cyan",
        concept:
          "Empat kapsul membulat halus berujung setengah lingkaran (pill capsule) yang beririsan membentuk bintang plus modern nan dinamis khas Linear.",
        primaryGradients: ["#6366f1", "#38bdf8", "#818cf8"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#0b1026" />
            {/* Vertical Pill Capsule */}
            <rect x="42" y="18" width="16" height="64" rx="8" fill="#6366f1" />
            {/* Horizontal Pill Capsule */}
            <rect x="18" y="42" width="64" height="16" rx="8" fill="#38bdf8" opacity="0.85" />
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="42" y="16" width="16" height="68" rx="8" fill="#6366f1" />
            <rect x="16" y="42" width="68" height="16" rx="8" fill="#38bdf8" opacity="0.85" />
            <circle cx="50" cy="50" r="11" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#0b1026" />
                <rect x="42" y="18" width="16" height="64" rx="8" fill="#6366f1" />
                <rect x="18" y="42" width="64" height="16" rx="8" fill="#38bdf8" />
                <circle cx="50" cy="50" r="8" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Modular Platform
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#0b1026" />
  <rect x="42" y="18" width="16" height="64" rx="8" fill="#6366f1" />
  <rect x="18" y="42" width="64" height="16" rx="8" fill="#38bdf8" opacity="0.85" />
  <circle cx="50" cy="50" r="10" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="42" y="16" width="16" height="68" rx="8" fill="#6366f1" />
  <rect x="16" y="42" width="68" height="16" rx="8" fill="#38bdf8" opacity="0.85" />
  <circle cx="50" cy="50" r="11" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0b1026" />
  <rect x="26" y="15" width="8" height="30" rx="4" fill="#6366f1" />
  <rect x="15" y="26" width="30" height="8" rx="4" fill="#38bdf8" />
  <circle cx="30" cy="30" r="4" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#38bdf8">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">MODULAR PLATFORM</text>
</svg>`,
      },

      // 5. Jelly Glass Bubble
      {
        id: "jelly-bubble",
        name: "Jelly Glass Nova",
        codename: "BUBBLE-05",
        subtitle: "Translucent Refraction · Violet, Rose & Ice Blue",
        concept:
          "Gelembung cairan jelly transparan dengan pembiasan spekular putih dan kurva squircle membal lembut menyerupai desain visual Apple Intelligence.",
        primaryGradients: ["#a855f7", "#ec4899", "#38bdf8"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="jb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="#140728" />
            <circle cx="50" cy="50" r="30" fill="url(#jb-grad)" opacity="0.85" />
            {/* Soft inner bubble reflection */}
            <ellipse cx="44" cy="40" rx="14" ry="8" transform="rotate(-30 44 40)" fill="#ffffff" opacity="0.5" />
            <circle cx="62" cy="58" r="5" fill="#ffffff" opacity="0.4" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="34" fill="#a855f7" />
            <ellipse cx="42" cy="38" rx="16" ry="9" transform="rotate(-30 42 38)" fill="#ffffff" opacity="0.55" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#140728" />
                <circle cx="50" cy="50" r="28" fill="#a855f7" />
                <ellipse cx="44" cy="40" rx="12" ry="7" transform="rotate(-30 44 40)" fill="#ffffff" opacity="0.6" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Fluid Copilot Intelligence
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#140728" />
  <circle cx="50" cy="50" r="30" fill="#a855f7" />
  <ellipse cx="44" cy="40" rx="14" ry="8" transform="rotate(-30 44 40)" fill="#ffffff" opacity="0.5" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="34" fill="#a855f7" />
  <ellipse cx="42" cy="38" rx="16" ry="9" transform="rotate(-30 42 38)" fill="#ffffff" opacity="0.55" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#140728" />
  <circle cx="30" cy="30" r="14" fill="#a855f7" />
  <ellipse cx="27" cy="25" rx="6" ry="3.5" transform="rotate(-30 27 25)" fill="#ffffff" opacity="0.6" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#a855f7">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">FLUID COPILOT INTELLIGENCE</text>
</svg>`,
      },

      // 6. Clover Bubble Core
      {
        id: "clover-bubble",
        name: "Clover Bubble Core",
        codename: "BUBBLE-06",
        subtitle: "Organic 4-Leaf Bubble Petals · Sapphire to Violet",
        concept:
          "Empat tetesan gelembung membulat berbentuk daun semanggi keberuntungan finansial yang bersentuhan lembut di pusat logo.",
        primaryGradients: ["#1d4ed8", "#3b82f6", "#7c3aed"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#060f26" />
            <circle cx="36" cy="36" r="14" fill="#3b82f6" />
            <circle cx="64" cy="36" r="14" fill="#7c3aed" />
            <circle cx="64" cy="64" r="14" fill="#3b82f6" />
            <circle cx="36" cy="64" r="14" fill="#1d4ed8" />
            <circle cx="50" cy="50" r="8" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="16" fill="#3b82f6" />
            <circle cx="64" cy="36" r="16" fill="#7c3aed" />
            <circle cx="64" cy="64" r="16" fill="#3b82f6" />
            <circle cx="36" cy="64" r="16" fill="#1d4ed8" />
            <circle cx="50" cy="50" r="9" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#060f26" />
                <circle cx="38" cy="38" r="12" fill="#3b82f6" />
                <circle cx="62" cy="38" r="12" fill="#7c3aed" />
                <circle cx="62" cy="62" r="12" fill="#3b82f6" />
                <circle cx="38" cy="62" r="12" fill="#1d4ed8" />
                <circle cx="50" cy="50" r="6" fill="#ffffff" />
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
                Capital Ledger Hub
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#060f26" />
  <circle cx="36" cy="36" r="14" fill="#3b82f6" />
  <circle cx="64" cy="36" r="14" fill="#7c3aed" />
  <circle cx="64" cy="64" r="14" fill="#3b82f6" />
  <circle cx="36" cy="64" r="14" fill="#1d4ed8" />
  <circle cx="50" cy="50" r="8" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="36" cy="36" r="16" fill="#3b82f6" />
  <circle cx="64" cy="36" r="16" fill="#7c3aed" />
  <circle cx="64" cy="64" r="16" fill="#3b82f6" />
  <circle cx="36" cy="64" r="16" fill="#1d4ed8" />
  <circle cx="50" cy="50" r="9" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#060f26" />
  <circle cx="24" cy="24" r="6" fill="#3b82f6" />
  <circle cx="36" cy="24" r="6" fill="#7c3aed" />
  <circle cx="36" cy="36" r="6" fill="#3b82f6" />
  <circle cx="24" cy="36" r="6" fill="#1d4ed8" />
  <circle cx="30" cy="30" r="3.5" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#3b82f6">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">CAPITAL LEDGER HUB</text>
</svg>`,
      },

      // 7. Dual Droplet Yin-Yang
      {
        id: "dual-droplet",
        name: "Dual Droplet Flow",
        codename: "BUBBLE-07",
        subtitle: "Sinusoidal Liquid Swirl · Coral Rose to Fuchsia",
        concept:
          "Dua lengan cairan melengkung halus yang saling melingkar memeluk satu sama lain, melambangkan siklus debit dan kredit yang tak pernah terputus.",
        primaryGradients: ["#f43f5e", "#d946ef", "#a855f7"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#1a0720" />
            <path
              d="M50 20C66 20 80 34 80 50C80 66 66 80 50 80C34 80 34 66 50 66C60 66 66 60 66 50C66 40 58 34 50 34C34 34 20 48 20 50C20 34 34 20 50 20Z"
              fill="#f43f5e"
            />
            <circle cx="50" cy="50" r="9" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 18C68 18 82 32 82 50C82 68 68 82 50 82C32 82 32 66 50 66C60 66 68 60 68 50C68 40 60 34 50 34C32 34 18 48 18 50C18 32 32 18 50 18Z"
              fill="#f43f5e"
            />
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#1a0720" />
                <path d="M50 20C66 20 80 34 80 50C80 66 66 80 50 80C34 80 34 66 50 66C60 66 66 60 66 50C66 40 58 34 50 34C34 34 20 48 20 50C20 34 34 20 50 20Z" fill="#f43f5e" />
                <circle cx="50" cy="50" r="7" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Perpetual Cash Flow
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#1a0720" />
  <path d="M50 20C66 20 80 34 80 50C80 66 66 80 50 80C34 80 34 66 50 66C60 66 66 60 66 50C66 40 58 34 50 34C34 34 20 48 20 50C20 34 34 20 50 20Z" fill="#f43f5e" />
  <circle cx="50" cy="50" r="9" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 18C68 18 82 32 82 50C82 68 68 82 50 82C32 82 32 66 50 66C60 66 68 60 68 50C68 40 60 34 50 34C32 34 18 48 18 50C18 32 32 18 50 18Z" fill="#f43f5e" />
  <circle cx="50" cy="50" r="10" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#1a0720" />
  <circle cx="30" cy="30" r="6" fill="#f43f5e" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#f43f5e">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">PERPETUAL CASH FLOW</text>
</svg>`,
      },

      // 8. Torus Bubble Ring
      {
        id: "torus-bubble",
        name: "Torus Bubble Ring",
        codename: "BUBBLE-08",
        subtitle: "Liquid Donut Loops · Neon Lime to Aqua",
        concept:
          "Cincin donat cair tebal dengan empat simpul gelembung membulat dan inti air mengambang. Sangat segar, cerah, dan berorientasi masa depan.",
        primaryGradients: ["#84cc16", "#06b6d4", "#3b82f6"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#081816" />
            <circle cx="50" cy="50" r="28" stroke="#06b6d4" strokeWidth="12" />
            <circle cx="50" cy="22" r="7" fill="#84cc16" />
            <circle cx="78" cy="50" r="7" fill="#84cc16" />
            <circle cx="50" cy="78" r="7" fill="#84cc16" />
            <circle cx="22" cy="50" r="7" fill="#84cc16" />
            <circle cx="50" cy="50" r="8" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="30" stroke="#06b6d4" strokeWidth="14" />
            <circle cx="50" cy="50" r="9" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#081816" />
                <circle cx="50" cy="50" r="24" stroke="#06b6d4" strokeWidth="10" />
                <circle cx="50" cy="50" r="6" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-lime-400 to-cyan-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Automated Liquidity
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#081816" />
  <circle cx="50" cy="50" r="28" stroke="#06b6d4" stroke-width="12" />
  <circle cx="50" cy="22" r="7" fill="#84cc16" />
  <circle cx="78" cy="50" r="7" fill="#84cc16" />
  <circle cx="50" cy="78" r="7" fill="#84cc16" />
  <circle cx="22" cy="50" r="7" fill="#84cc16" />
  <circle cx="50" cy="50" r="8" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="30" stroke="#06b6d4" stroke-width="14" />
  <circle cx="50" cy="50" r="9" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#081816" />
  <circle cx="30" cy="30" r="12" stroke="#06b6d4" stroke-width="6" />
  <circle cx="30" cy="30" r="4" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#06b6d4">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">AUTOMATED LIQUIDITY</text>
</svg>`,
      },

      // 9. TearDrop Bloom
      {
        id: "teardrop-bloom",
        name: "TearDrop Bloom Nova",
        codename: "BUBBLE-09",
        subtitle: "Curved Droplet Petals · Royal Purple to Cobalt",
        concept:
          "Empat tetesan kurva berujung bulat cembung yang mekar lembut dari titik pusat putih. Simbol kebangkitan dan perluasan aset bisnis secara organik.",
        primaryGradients: ["#7c3aed", "#2563eb", "#38bdf8"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#0c0721" />
            {/* 4 Soft Teardrops */}
            <path d="M50 20C56 20 60 26 60 34C60 42 56 46 50 50C44 46 40 42 40 34C40 26 44 20 50 20Z" fill="#7c3aed" />
            <path d="M80 50C80 56 74 60 66 60C58 60 54 56 50 50C54 44 58 40 66 40C74 40 80 44 80 50Z" fill="#2563eb" />
            <path d="M50 80C44 80 40 74 40 66C40 58 44 54 50 50C56 54 60 58 60 66C60 74 56 80 50 80Z" fill="#7c3aed" />
            <path d="M20 50C20 44 26 40 34 40C42 40 46 44 50 50C46 56 42 60 34 60C26 60 20 56 20 50Z" fill="#2563eb" />
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 18C56 18 62 26 62 34C62 42 56 46 50 50C44 46 38 42 38 34C38 26 44 18 50 18Z" fill="#7c3aed" />
            <path d="M82 50C82 56 74 62 66 62C58 62 54 56 50 50C54 44 58 38 66 38C74 38 82 44 82 50Z" fill="#2563eb" />
            <path d="M50 82C44 82 38 74 38 66C38 58 44 54 50 50C56 54 62 58 62 66C62 74 56 82 50 82Z" fill="#7c3aed" />
            <path d="M18 50C18 44 26 38 34 38C42 38 46 44 50 50C46 56 42 62 34 62C26 62 18 56 18 50Z" fill="#2563eb" />
            <circle cx="50" cy="50" r="11" fill="#ffffff" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#0c0721" />
                <circle cx="50" cy="50" r="16" fill="#7c3aed" />
                <circle cx="50" cy="50" r="8" fill="#ffffff" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Asset Growth Engine
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="28" fill="#0c0721" />
  <path d="M50 20C56 20 60 26 60 34C60 42 56 46 50 50C44 46 40 42 40 34C40 26 44 20 50 20Z" fill="#7c3aed" />
  <path d="M80 50C80 56 74 60 66 60C58 60 54 56 50 50C54 44 58 40 66 40C74 40 80 44 80 50Z" fill="#2563eb" />
  <path d="M50 80C44 80 40 74 40 66C40 58 44 54 50 50C56 54 60 58 60 66C60 74 56 80 50 80Z" fill="#7c3aed" />
  <path d="M20 50C20 44 26 40 34 40C42 40 46 44 50 50C46 56 42 60 34 60C26 60 20 56 20 50Z" fill="#2563eb" />
  <circle cx="50" cy="50" r="10" fill="#ffffff" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 18C56 18 62 26 62 34C62 42 56 46 50 50C44 46 38 42 38 34C38 26 44 18 50 18Z" fill="#7c3aed" />
  <path d="M82 50C82 56 74 62 66 62C58 62 54 56 50 50C54 44 58 38 66 38C74 38 82 44 82 50Z" fill="#2563eb" />
  <path d="M50 82C44 82 38 74 38 66C38 58 44 54 50 50C56 54 62 58 62 66C62 74 56 82 50 82Z" fill="#7c3aed" />
  <path d="M18 50C18 44 26 38 34 38C42 38 46 44 50 50C46 56 42 62 34 62C26 62 18 56 18 50Z" fill="#2563eb" />
  <circle cx="50" cy="50" r="11" fill="#ffffff" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0c0721" />
  <circle cx="30" cy="30" r="9" fill="#7c3aed" />
  <circle cx="30" cy="30" r="4.5" fill="#ffffff" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#7c3aed">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">ASSET GROWTH ENGINE</text>
</svg>`,
      },

      // 10. Bubble Monogram "N"
      {
        id: "bubble-monogram",
        name: "Bubble Monogram N",
        codename: "BUBBLE-10",
        subtitle: "Rounded Tube 'N' + Floating Gold Bubble · Executive Core",
        concept:
          "Monogram huruf 'N' yang dibentuk dari tabung gelembung tebal berujung membulat sempurna (`stroke-linecap='round'`), dinobatkan mutiara emas cair di sudut kanan atas.",
        primaryGradients: ["#2563eb", "#3b82f6", "#fbbf24"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="28" fill="#09142b" />
            {/* Smooth rounded tube N */}
            <path
              d="M32 70V30L68 70V30"
              stroke="#3b82f6"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Floating Gold Bubble Spark */}
            <circle cx="76" cy="22" r="7" fill="#fbbf24" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M32 72V28L68 72V28"
              stroke="#3b82f6"
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="78" cy="20" r="8" fill="#fbbf24" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={38} height={38} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="28" fill="#09142b" />
                <path d="M34 68V32L66 68V32" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="72" cy="24" r="5" fill="#fbbf24" />
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
  <rect width="100" height="100" rx="28" fill="#09142b" />
  <path d="M32 70V30L68 70V30" stroke="#3b82f6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="76" cy="22" r="7" fill="#fbbf24" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M32 72V28L68 72V28" stroke="#3b82f6" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="78" cy="20" r="8" fill="#fbbf24" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#09142b" />
  <path d="M22 36V22L36 36V22" stroke="#3b82f6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="39" cy="18" r="3" fill="#fbbf24" />
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
                Fluid Bubble Nova · Zero Sharp Edges
              </span>
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Koleksi 10 varian logo fluid bubble nova membulat lembut dengan gradien premium. Uji mode <strong>Icon Only</strong>, <strong>Logo Tanpa Text</strong>, dan <strong>Logo Dengan Text</strong>.
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
                      Logo Tanpa Text (Fluid Bubble Mark)
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
