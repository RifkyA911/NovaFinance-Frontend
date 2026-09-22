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

  // 10 Asymmetric Core + Surrounding Nova Variants (ZERO SHARP TIPS, ZERO PLUS/CROSS SHAPES)
  const VARIANTS: NovaLogoVariant[] = useMemo(
    () => [
      // 1. Spiral Orbital Nova
      {
        id: "asym-spiral-nova",
        name: "Spiral Orbital Nova",
        codename: "ASYM-01",
        subtitle: "Luminous Core Nucleus · Asymmetric Spiral Bubbles",
        concept:
          "Inti energi bulat bercahaya di pusat, dikelilingi konstelasi 5 gelembung nova asimetris yang melayang mengitari gravitasi inti dengan jejak orbit lembut. Bebas dari bentuk simetris tanda tambah.",
        primaryGradients: ["#06b6d4", "#3b82f6", "#8b5cf6"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as1-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#080e1e" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="as1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as1-bg)" />
            <path
              d="M22 42C26 22 65 20 76 36C85 49 82 72 60 80C40 86 22 72 28 54"
              stroke="url(#as1-grad)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              opacity="0.35"
            />
            <circle cx="48" cy="50" r="17" fill="url(#as1-grad)" />
            <circle cx="43" cy="45" r="6" fill="#ffffff" opacity="0.45" />
            <circle cx="48" cy="50" r="4" fill="#ffffff" opacity="0.9" />
            <circle cx="72" cy="32" r="9" fill="url(#as1-grad)" />
            <circle cx="70" cy="30" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="82" cy="62" r="6.5" fill="url(#as1-grad)" />
            <circle cx="30" cy="74" r="8" fill="url(#as1-grad)" />
            <circle cx="19" cy="44" r="5" fill="url(#as1-grad)" />
            <circle cx="34" cy="24" r="4.5" fill="url(#as1-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as1-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <path
              d="M22 42C26 22 65 20 76 36C85 49 82 72 60 80C40 86 22 72 28 54"
              stroke="url(#as1-m-grad)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
              opacity="0.4"
            />
            <circle cx="48" cy="50" r="18" fill="url(#as1-m-grad)" />
            <circle cx="43" cy="45" r="6.5" fill="#ffffff" opacity="0.45" />
            <circle cx="48" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
            <circle cx="73" cy="31" r="9.5" fill="url(#as1-m-grad)" />
            <circle cx="71" cy="29" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="83" cy="63" r="7" fill="url(#as1-m-grad)" />
            <circle cx="29" cy="75" r="8.5" fill="url(#as1-m-grad)" />
            <circle cx="18" cy="43" r="5.5" fill="url(#as1-m-grad)" />
            <circle cx="33" cy="23" r="5" fill="url(#as1-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as1-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#080e1e" />
                <circle cx="48" cy="50" r="16" fill="url(#as1-l-grad)" />
                <circle cx="44" cy="46" r="5" fill="#ffffff" opacity="0.5" />
                <circle cx="72" cy="32" r="8" fill="url(#as1-l-grad)" />
                <circle cx="82" cy="62" r="6" fill="url(#as1-l-grad)" />
                <circle cx="30" cy="74" r="7" fill="url(#as1-l-grad)" />
                <circle cx="20" cy="44" r="4.5" fill="url(#as1-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Modern Financial Engine
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as1-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080e1e" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="as1-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as1-bg)" />
  <circle cx="48" cy="50" r="17" fill="url(#as1-grad)" />
  <circle cx="43" cy="45" r="6" fill="#ffffff" opacity="0.45" />
  <circle cx="48" cy="50" r="4" fill="#ffffff" opacity="0.9" />
  <circle cx="72" cy="32" r="9" fill="url(#as1-grad)" />
  <circle cx="82" cy="62" r="6.5" fill="url(#as1-grad)" />
  <circle cx="30" cy="74" r="8" fill="url(#as1-grad)" />
  <circle cx="19" cy="44" r="5" fill="url(#as1-grad)" />
  <circle cx="34" cy="24" r="4.5" fill="url(#as1-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as1-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <circle cx="48" cy="50" r="18" fill="url(#as1-m-grad)" />
  <circle cx="43" cy="45" r="6.5" fill="#ffffff" opacity="0.45" />
  <circle cx="48" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
  <circle cx="73" cy="31" r="9.5" fill="url(#as1-m-grad)" />
  <circle cx="83" cy="63" r="7" fill="url(#as1-m-grad)" />
  <circle cx="29" cy="75" r="8.5" fill="url(#as1-m-grad)" />
  <circle cx="18" cy="43" r="5.5" fill="url(#as1-m-grad)" />
  <circle cx="33" cy="23" r="5" fill="url(#as1-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as1-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#080e1e" />
  <circle cx="28" cy="30" r="8" fill="url(#as1-l-grad)" />
  <circle cx="40" cy="21" r="4" fill="url(#as1-l-grad)" />
  <circle cx="44" cy="36" r="3" fill="url(#as1-l-grad)" />
  <circle cx="19" cy="41" r="3.5" fill="url(#as1-l-grad)" />
  <circle cx="14" cy="27" r="2.5" fill="url(#as1-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#06b6d4">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">MODERN FINANCIAL ENGINE</text>
</svg>`,
      },

      // 2. Solar Flare Nova
      {
        id: "asym-solar-flare",
        name: "Solar Flare Nova",
        codename: "ASYM-02",
        subtitle: "Off-Center Warm Core · Ascending Flare Train",
        concept:
          "Inti emas hangat melayang organik di kiri-bawah, melontarkan rentetan semburan gelembung nova fluid yang naik secara asimetris ke arah kanan atas seperti komet fajar.",
        primaryGradients: ["#ff6b6b", "#f97316", "#fbbf24"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as2-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1f1105" />
                <stop offset="100%" stopColor="#431407" />
              </linearGradient>
              <linearGradient id="as2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="45%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as2-bg)" />
            <circle cx="44" cy="54" r="18" fill="url(#as2-grad)" />
            <circle cx="40" cy="50" r="7" fill="#ffffff" opacity="0.4" />
            <circle cx="44" cy="54" r="4.5" fill="#ffffff" opacity="0.9" />
            <circle cx="67" cy="42" r="10" fill="url(#as2-grad)" />
            <circle cx="65" cy="40" r="3" fill="#ffffff" opacity="0.45" />
            <circle cx="80" cy="27" r="7" fill="url(#as2-grad)" />
            <circle cx="87" cy="16" r="4" fill="url(#as2-grad)" />
            <circle cx="68" cy="74" r="5.5" fill="url(#as2-grad)" />
            <circle cx="26" cy="36" r="4.5" fill="url(#as2-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as2-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b6b" />
                <stop offset="45%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <circle cx="44" cy="54" r="19" fill="url(#as2-m-grad)" />
            <circle cx="40" cy="50" r="7.5" fill="#ffffff" opacity="0.45" />
            <circle cx="44" cy="54" r="5" fill="#ffffff" opacity="0.95" />
            <circle cx="68" cy="41" r="10.5" fill="url(#as2-m-grad)" />
            <circle cx="81" cy="26" r="7.5" fill="url(#as2-m-grad)" />
            <circle cx="88" cy="15" r="4.5" fill="url(#as2-m-grad)" />
            <circle cx="69" cy="75" r="6" fill="url(#as2-m-grad)" />
            <circle cx="25" cy="35" r="5" fill="url(#as2-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as2-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#1f1105" />
                <circle cx="44" cy="54" r="16" fill="url(#as2-l-grad)" />
                <circle cx="66" cy="42" r="9" fill="url(#as2-l-grad)" />
                <circle cx="79" cy="27" r="6.5" fill="url(#as2-l-grad)" />
                <circle cx="86" cy="17" r="3.5" fill="url(#as2-l-grad)" />
                <circle cx="67" cy="73" r="5" fill="url(#as2-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-rose-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Dynamic Growth Platform
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as2-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1f1105" />
      <stop offset="100%" stop-color="#431407" />
    </linearGradient>
    <linearGradient id="as2-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b6b" />
      <stop offset="45%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as2-bg)" />
  <circle cx="44" cy="54" r="18" fill="url(#as2-grad)" />
  <circle cx="40" cy="50" r="7" fill="#ffffff" opacity="0.4" />
  <circle cx="44" cy="54" r="4.5" fill="#ffffff" opacity="0.9" />
  <circle cx="67" cy="42" r="10" fill="url(#as2-grad)" />
  <circle cx="80" cy="27" r="7" fill="url(#as2-grad)" />
  <circle cx="87" cy="16" r="4" fill="url(#as2-grad)" />
  <circle cx="68" cy="74" r="5.5" fill="url(#as2-grad)" />
  <circle cx="26" cy="36" r="4.5" fill="url(#as2-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as2-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b6b" />
      <stop offset="45%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <circle cx="44" cy="54" r="19" fill="url(#as2-m-grad)" />
  <circle cx="40" cy="50" r="7.5" fill="#ffffff" opacity="0.45" />
  <circle cx="44" cy="54" r="5" fill="#ffffff" opacity="0.95" />
  <circle cx="68" cy="41" r="10.5" fill="url(#as2-m-grad)" />
  <circle cx="81" cy="26" r="7.5" fill="url(#as2-m-grad)" />
  <circle cx="88" cy="15" r="4.5" fill="url(#as2-m-grad)" />
  <circle cx="69" cy="75" r="6" fill="url(#as2-m-grad)" />
  <circle cx="25" cy="35" r="5" fill="url(#as2-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as2-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff6b6b" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#1f1105" />
  <circle cx="24" cy="32" r="8" fill="url(#as2-l-grad)" />
  <circle cx="36" cy="24" r="5" fill="url(#as2-l-grad)" />
  <circle cx="43" cy="16" r="3.5" fill="url(#as2-l-grad)" />
  <circle cx="37" cy="41" r="3" fill="url(#as2-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#f97316">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">DYNAMIC GROWTH PLATFORM</text>
</svg>`,
      },

      // 3. Quantum Pearl Orbit
      {
        id: "asym-quantum-pearl",
        name: "Quantum Pearl Orbit",
        codename: "ASYM-03",
        subtitle: "Luminous Orb · Tilted Elliptical Bubble Satellite",
        concept:
          "Mutiara cairan di pusat dikelilingi oleh cincin busur orbital miring rounded asimetris dengan 3 stasiun gelembung nova mengorbit dinamis.",
        primaryGradients: ["#1d4ed8", "#06b6d4", "#10b981"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#031526" />
                <stop offset="100%" stopColor="#062e3d" />
              </linearGradient>
              <linearGradient id="as3-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as3-bg)" />
            <ellipse
              cx="50"
              cy="50"
              rx="37"
              ry="18"
              transform="rotate(-32 50 50)"
              fill="none"
              stroke="url(#as3-grad)"
              strokeWidth="3.5"
              opacity="0.65"
            />
            <circle cx="50" cy="50" r="16.5" fill="url(#as3-grad)" />
            <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.45" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
            <circle cx="76" cy="33" r="9" fill="url(#as3-grad)" />
            <circle cx="74" cy="31" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="24" cy="67" r="7.5" fill="url(#as3-grad)" />
            <circle cx="34" cy="22" r="5" fill="url(#as3-grad)" />
            <circle cx="64" cy="78" r="5.5" fill="url(#as3-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as3-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <ellipse
              cx="50"
              cy="50"
              rx="37"
              ry="18"
              transform="rotate(-32 50 50)"
              fill="none"
              stroke="url(#as3-m-grad)"
              strokeWidth="4"
              opacity="0.75"
            />
            <circle cx="50" cy="50" r="17.5" fill="url(#as3-m-grad)" />
            <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
            <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
            <circle cx="77" cy="33" r="9.5" fill="url(#as3-m-grad)" />
            <circle cx="23" cy="67" r="8" fill="url(#as3-m-grad)" />
            <circle cx="34" cy="21" r="5.5" fill="url(#as3-m-grad)" />
            <circle cx="65" cy="79" r="6" fill="url(#as3-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as3-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1d4ed8" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#031526" />
                <ellipse cx="50" cy="50" rx="35" ry="17" transform="rotate(-32 50 50)" fill="none" stroke="url(#as3-l-grad)" strokeWidth="3" opacity="0.6" />
                <circle cx="50" cy="50" r="15" fill="url(#as3-l-grad)" />
                <circle cx="75" cy="33" r="7.5" fill="url(#as3-l-grad)" />
                <circle cx="25" cy="67" r="6.5" fill="url(#as3-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-blue-600 via-cyan-500 to-emerald-400 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Quantum Capital Protocol
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#031526" />
      <stop offset="100%" stop-color="#062e3d" />
    </linearGradient>
    <linearGradient id="as3-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as3-bg)" />
  <ellipse cx="50" cy="50" rx="37" ry="18" transform="rotate(-32 50 50)" fill="none" stroke="url(#as3-grad)" stroke-width="3.5" opacity="0.65" />
  <circle cx="50" cy="50" r="16.5" fill="url(#as3-grad)" />
  <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.45" />
  <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
  <circle cx="76" cy="33" r="9" fill="url(#as3-grad)" />
  <circle cx="24" cy="67" r="7.5" fill="url(#as3-grad)" />
  <circle cx="34" cy="22" r="5" fill="url(#as3-grad)" />
  <circle cx="64" cy="78" r="5.5" fill="url(#as3-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as3-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>
  <ellipse cx="50" cy="50" rx="37" ry="18" transform="rotate(-32 50 50)" fill="none" stroke="url(#as3-m-grad)" stroke-width="4" opacity="0.75" />
  <circle cx="50" cy="50" r="17.5" fill="url(#as3-m-grad)" />
  <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
  <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
  <circle cx="77" cy="33" r="9.5" fill="url(#as3-m-grad)" />
  <circle cx="23" cy="67" r="8" fill="url(#as3-m-grad)" />
  <circle cx="34" cy="21" r="5.5" fill="url(#as3-m-grad)" />
  <circle cx="65" cy="79" r="6" fill="url(#as3-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as3-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#031526" />
  <ellipse cx="30" cy="30" rx="18" ry="9" transform="rotate(-32 30 30)" fill="none" stroke="url(#as3-l-grad)" stroke-width="2" opacity="0.7" />
  <circle cx="30" cy="30" r="7.5" fill="url(#as3-l-grad)" />
  <circle cx="42" cy="22" r="4" fill="url(#as3-l-grad)" />
  <circle cx="18" cy="38" r="3.5" fill="url(#as3-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#06b6d4">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">QUANTUM CAPITAL PROTOCOL</text>
</svg>`,
      },

      // 4. Crescent Gravity Nova
      {
        id: "asym-crescent-gravity",
        name: "Crescent Gravity Nova",
        codename: "ASYM-04",
        subtitle: "Anchored Center Core · Half-Moon Bubble Shield",
        concept:
          "Inti bulat solid di tengah yang dilindungi oleh formasi gelembung nova sabit melengkung asimetris di satu sisi, memberikan siluet elegan dan futuristik.",
        primaryGradients: ["#f43f5e", "#d946ef", "#6366f1"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as4-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1a0b2e" />
                <stop offset="100%" stopColor="#2e081e" />
              </linearGradient>
              <linearGradient id="as4-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as4-bg)" />
            <circle cx="42" cy="50" r="18" fill="url(#as4-grad)" />
            <circle cx="37" cy="45" r="7" fill="#ffffff" opacity="0.4" />
            <circle cx="42" cy="50" r="4.5" fill="#ffffff" opacity="0.9" />
            <circle cx="64" cy="27" r="8.5" fill="url(#as4-grad)" />
            <circle cx="78" cy="48" r="11.5" fill="url(#as4-grad)" />
            <circle cx="75" cy="46" r="3.5" fill="#ffffff" opacity="0.5" />
            <circle cx="68" cy="73" r="8.5" fill="url(#as4-grad)" />
            <circle cx="48" cy="82" r="5" fill="url(#as4-grad)" />
            <circle cx="20" cy="30" r="3.5" fill="url(#as4-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as4-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="50%" stopColor="#d946ef" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <circle cx="42" cy="50" r="19" fill="url(#as4-m-grad)" />
            <circle cx="37" cy="45" r="7.5" fill="#ffffff" opacity="0.45" />
            <circle cx="42" cy="50" r="5" fill="#ffffff" opacity="0.95" />
            <circle cx="65" cy="26" r="9" fill="url(#as4-m-grad)" />
            <circle cx="79" cy="48" r="12" fill="url(#as4-m-grad)" />
            <circle cx="69" cy="74" r="9" fill="url(#as4-m-grad)" />
            <circle cx="48" cy="83" r="5.5" fill="url(#as4-m-grad)" />
            <circle cx="20" cy="29" r="4" fill="url(#as4-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as4-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#1a0b2e" />
                <circle cx="42" cy="50" r="16" fill="url(#as4-l-grad)" />
                <circle cx="64" cy="27" r="7.5" fill="url(#as4-l-grad)" />
                <circle cx="77" cy="48" r="10" fill="url(#as4-l-grad)" />
                <circle cx="67" cy="72" r="7.5" fill="url(#as4-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Intelligent Financial Pulse
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as4-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0b2e" />
      <stop offset="100%" stop-color="#2e081e" />
    </linearGradient>
    <linearGradient id="as4-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#d946ef" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as4-bg)" />
  <circle cx="42" cy="50" r="18" fill="url(#as4-grad)" />
  <circle cx="37" cy="45" r="7" fill="#ffffff" opacity="0.4" />
  <circle cx="42" cy="50" r="4.5" fill="#ffffff" opacity="0.9" />
  <circle cx="64" cy="27" r="8.5" fill="url(#as4-grad)" />
  <circle cx="78" cy="48" r="11.5" fill="url(#as4-grad)" />
  <circle cx="68" cy="73" r="8.5" fill="url(#as4-grad)" />
  <circle cx="48" cy="82" r="5" fill="url(#as4-grad)" />
  <circle cx="20" cy="30" r="3.5" fill="url(#as4-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as4-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#d946ef" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <circle cx="42" cy="50" r="19" fill="url(#as4-m-grad)" />
  <circle cx="37" cy="45" r="7.5" fill="#ffffff" opacity="0.45" />
  <circle cx="42" cy="50" r="5" fill="#ffffff" opacity="0.95" />
  <circle cx="65" cy="26" r="9" fill="url(#as4-m-grad)" />
  <circle cx="79" cy="48" r="12" fill="url(#as4-m-grad)" />
  <circle cx="69" cy="74" r="9" fill="url(#as4-m-grad)" />
  <circle cx="48" cy="83" r="5.5" fill="url(#as4-m-grad)" />
  <circle cx="20" cy="29" r="4" fill="url(#as4-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as4-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#1a0b2e" />
  <circle cx="24" cy="30" r="8" fill="url(#as4-l-grad)" />
  <circle cx="35" cy="19" r="4" fill="url(#as4-l-grad)" />
  <circle cx="42" cy="30" r="5.5" fill="url(#as4-l-grad)" />
  <circle cx="37" cy="41" r="4" fill="url(#as4-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#f43f5e">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">INTELLIGENT FINANCIAL PULSE</text>
</svg>`,
      },

      // 5. Eclipse Corona Nova
      {
        id: "asym-eclipse-corona",
        name: "Eclipse Corona Nova",
        codename: "ASYM-05",
        subtitle: "Deep Nucleus · Asymmetric Solar Corona Clusters",
        concept:
          "Inti nova pekat di pusat dengan semburan korona cairan asimetris yang membuncah ke kiri-atas dan kanan-bawah dalam fluiditas ungu dan biru es.",
        primaryGradients: ["#581c87", "#8b5cf6", "#38bdf8"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as5-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0b071e" />
                <stop offset="100%" stopColor="#1e1040" />
              </linearGradient>
              <linearGradient id="as5-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#581c87" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as5-bg)" />
            <circle cx="50" cy="50" r="16.5" fill="url(#as5-grad)" />
            <circle cx="50" cy="50" r="11" fill="#ffffff" opacity="0.3" />
            <circle cx="47" cy="47" r="5" fill="#ffffff" opacity="0.9" />
            <circle cx="28" cy="26" r="11" fill="url(#as5-grad)" />
            <circle cx="17" cy="38" r="6" fill="url(#as5-grad)" />
            <circle cx="75" cy="68" r="9.5" fill="url(#as5-grad)" />
            <circle cx="85" cy="58" r="5" fill="url(#as5-grad)" />
            <circle cx="76" cy="34" r="6" fill="url(#as5-grad)" />
            <circle cx="38" cy="78" r="4.5" fill="url(#as5-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as5-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#581c87" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="17.5" fill="url(#as5-m-grad)" />
            <circle cx="50" cy="50" r="11.5" fill="#ffffff" opacity="0.35" />
            <circle cx="47" cy="47" r="5.5" fill="#ffffff" opacity="0.95" />
            <circle cx="28" cy="25" r="11.5" fill="url(#as5-m-grad)" />
            <circle cx="16" cy="37" r="6.5" fill="url(#as5-m-grad)" />
            <circle cx="76" cy="69" r="10" fill="url(#as5-m-grad)" />
            <circle cx="86" cy="58" r="5.5" fill="url(#as5-m-grad)" />
            <circle cx="77" cy="33" r="6.5" fill="url(#as5-m-grad)" />
            <circle cx="37" cy="79" r="5" fill="url(#as5-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as5-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#0b071e" />
                <circle cx="50" cy="50" r="15" fill="url(#as5-l-grad)" />
                <circle cx="30" cy="28" r="9" fill="url(#as5-l-grad)" />
                <circle cx="74" cy="67" r="8" fill="url(#as5-l-grad)" />
                <circle cx="75" cy="35" r="5" fill="url(#as5-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-purple-500 via-violet-400 to-sky-400 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Enterprise Cloud Matrix
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as5-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b071e" />
      <stop offset="100%" stop-color="#1e1040" />
    </linearGradient>
    <linearGradient id="as5-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#581c87" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as5-bg)" />
  <circle cx="50" cy="50" r="16.5" fill="url(#as5-grad)" />
  <circle cx="50" cy="50" r="11" fill="#ffffff" opacity="0.3" />
  <circle cx="47" cy="47" r="5" fill="#ffffff" opacity="0.9" />
  <circle cx="28" cy="26" r="11" fill="url(#as5-grad)" />
  <circle cx="17" cy="38" r="6" fill="url(#as5-grad)" />
  <circle cx="75" cy="68" r="9.5" fill="url(#as5-grad)" />
  <circle cx="76" cy="34" r="6" fill="url(#as5-grad)" />
  <circle cx="38" cy="78" r="4.5" fill="url(#as5-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as5-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#581c87" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="17.5" fill="url(#as5-m-grad)" />
  <circle cx="50" cy="50" r="11.5" fill="#ffffff" opacity="0.35" />
  <circle cx="47" cy="47" r="5.5" fill="#ffffff" opacity="0.95" />
  <circle cx="28" cy="25" r="11.5" fill="url(#as5-m-grad)" />
  <circle cx="16" cy="37" r="6.5" fill="url(#as5-m-grad)" />
  <circle cx="76" cy="69" r="10" fill="url(#as5-m-grad)" />
  <circle cx="77" cy="33" r="6.5" fill="url(#as5-m-grad)" />
  <circle cx="37" cy="79" r="5" fill="url(#as5-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as5-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#38bdf8" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#0b071e" />
  <circle cx="30" cy="30" r="8" fill="url(#as5-l-grad)" />
  <circle cx="18" cy="18" r="5" fill="url(#as5-l-grad)" />
  <circle cx="42" cy="40" r="4.5" fill="url(#as5-l-grad)" />
  <circle cx="43" cy="20" r="3" fill="url(#as5-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#8b5cf6">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">ENTERPRISE CLOUD MATRIX</text>
</svg>`,
      },

      // 6. Nebula Swarm Nova
      {
        id: "asym-nebula-swarm",
        name: "Nebula Swarm Nova",
        codename: "ASYM-06",
        subtitle: "Central Core · Asymmetric Constellation Swarm",
        concept:
          "Inti bercahaya di tengah dikelilingi kawanan 6 gelembung nova fluid dengan ukuran bertingkat dalam alur diagonal organik. Menampilkan energi likuiditas kosmik.",
        primaryGradients: ["#fb7185", "#ea580c", "#f59e0b"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as6-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e0c08" />
                <stop offset="100%" stopColor="#3d1406" />
              </linearGradient>
              <linearGradient id="as6-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as6-bg)" />
            <circle cx="50" cy="50" r="16.5" fill="url(#as6-grad)" />
            <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.45" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
            <circle cx="68" cy="24" r="8.5" fill="url(#as6-grad)" />
            <circle cx="82" cy="42" r="6" fill="url(#as6-grad)" />
            <circle cx="72" cy="76" r="5" fill="url(#as6-grad)" />
            <circle cx="50" cy="80" r="4" fill="url(#as6-grad)" />
            <circle cx="26" cy="68" r="10" fill="url(#as6-grad)" />
            <circle cx="24" cy="66" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="20" cy="38" r="5.5" fill="url(#as6-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as6-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="17.5" fill="url(#as6-m-grad)" />
            <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
            <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
            <circle cx="69" cy="23" r="9" fill="url(#as6-m-grad)" />
            <circle cx="83" cy="41" r="6.5" fill="url(#as6-m-grad)" />
            <circle cx="73" cy="77" r="5.5" fill="url(#as6-m-grad)" />
            <circle cx="50" cy="81" r="4.5" fill="url(#as6-m-grad)" />
            <circle cx="25" cy="68" r="10.5" fill="url(#as6-m-grad)" />
            <circle cx="19" cy="37" r="6" fill="url(#as6-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as6-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#1e0c08" />
                <circle cx="50" cy="50" r="15" fill="url(#as6-l-grad)" />
                <circle cx="68" cy="26" r="7.5" fill="url(#as6-l-grad)" />
                <circle cx="81" cy="44" r="5" fill="url(#as6-l-grad)" />
                <circle cx="27" cy="67" r="8.5" fill="url(#as6-l-grad)" />
                <circle cx="22" cy="38" r="4.5" fill="url(#as6-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Fluid Capital Ecosystem
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as6-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e0c08" />
      <stop offset="100%" stop-color="#3d1406" />
    </linearGradient>
    <linearGradient id="as6-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185" />
      <stop offset="50%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as6-bg)" />
  <circle cx="50" cy="50" r="16.5" fill="url(#as6-grad)" />
  <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.45" />
  <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
  <circle cx="68" cy="24" r="8.5" fill="url(#as6-grad)" />
  <circle cx="82" cy="42" r="6" fill="url(#as6-grad)" />
  <circle cx="72" cy="76" r="5" fill="url(#as6-grad)" />
  <circle cx="50" cy="80" r="4" fill="url(#as6-grad)" />
  <circle cx="26" cy="68" r="10" fill="url(#as6-grad)" />
  <circle cx="20" cy="38" r="5.5" fill="url(#as6-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as6-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185" />
      <stop offset="50%" stop-color="#ea580c" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="17.5" fill="url(#as6-m-grad)" />
  <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
  <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
  <circle cx="69" cy="23" r="9" fill="url(#as6-m-grad)" />
  <circle cx="83" cy="41" r="6.5" fill="url(#as6-m-grad)" />
  <circle cx="73" cy="77" r="5.5" fill="url(#as6-m-grad)" />
  <circle cx="25" cy="68" r="10.5" fill="url(#as6-m-grad)" />
  <circle cx="19" cy="37" r="6" fill="url(#as6-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as6-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb7185" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#1e0c08" />
  <circle cx="30" cy="30" r="8" fill="url(#as6-l-grad)" />
  <circle cx="40" cy="18" r="4" fill="url(#as6-l-grad)" />
  <circle cx="18" cy="38" r="4.5" fill="url(#as6-l-grad)" />
  <circle cx="42" cy="38" r="3" fill="url(#as6-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#ea580c">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">FLUID CAPITAL ECOSYSTEM</text>
</svg>`,
      },

      // 7. Planetary Saturnian Nova
      {
        id: "asym-saturnian-flow",
        name: "Planetary Saturnian Nova",
        codename: "ASYM-07",
        subtitle: "Spherical Core · Diagonal Fluid Ribbon Halo",
        concept:
          "Inti bola planet di tengah dengan pita cincin cairan rounded asimetris melintang diagonal, dihiasi satelit gelembung dengan kontras neon lime dan aqua.",
        primaryGradients: ["#84cc16", "#10b981", "#06b6d4"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as7-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#031a14" />
                <stop offset="100%" stopColor="#042f2c" />
              </linearGradient>
              <linearGradient id="as7-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#84cc16" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as7-bg)" />
            <path
              d="M16 66C24 50 48 38 76 30C82 28 86 32 84 36C76 52 52 64 24 72C18 74 14 70 16 66Z"
              fill="url(#as7-grad)"
              opacity="0.8"
            />
            <circle cx="50" cy="50" r="17" fill="url(#as7-grad)" />
            <circle cx="46" cy="45" r="6" fill="#ffffff" opacity="0.45" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
            <circle cx="78" cy="20" r="7.5" fill="url(#as7-grad)" />
            <circle cx="76" cy="18" r="2.5" fill="#ffffff" opacity="0.5" />
            <circle cx="22" cy="82" r="5" fill="url(#as7-grad)" />
            <circle cx="28" cy="28" r="6" fill="url(#as7-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as7-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#84cc16" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path
              d="M16 66C24 50 48 38 76 30C82 28 86 32 84 36C76 52 52 64 24 72C18 74 14 70 16 66Z"
              fill="url(#as7-m-grad)"
              opacity="0.85"
            />
            <circle cx="50" cy="50" r="18" fill="url(#as7-m-grad)" />
            <circle cx="46" cy="45" r="6.5" fill="#ffffff" opacity="0.5" />
            <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
            <circle cx="79" cy="19" r="8" fill="url(#as7-m-grad)" />
            <circle cx="21" cy="83" r="5.5" fill="url(#as7-m-grad)" />
            <circle cx="27" cy="27" r="6.5" fill="url(#as7-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as7-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#84cc16" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#031a14" />
                <path d="M18 64C24 50 48 38 74 30C80 28 84 32 82 36C74 50 50 62 26 70C20 72 16 68 18 64Z" fill="url(#as7-l-grad)" opacity="0.8" />
                <circle cx="50" cy="50" r="15" fill="url(#as7-l-grad)" />
                <circle cx="76" cy="22" r="6.5" fill="url(#as7-l-grad)" />
                <circle cx="24" cy="78" r="4.5" fill="url(#as7-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-lime-500 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Sustainable Liquidity Grid
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as7-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#031a14" />
      <stop offset="100%" stop-color="#042f2c" />
    </linearGradient>
    <linearGradient id="as7-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#84cc16" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as7-bg)" />
  <path d="M16 66C24 50 48 38 76 30C82 28 86 32 84 36C76 52 52 64 24 72C18 74 14 70 16 66Z" fill="url(#as7-grad)" opacity="0.8" />
  <circle cx="50" cy="50" r="17" fill="url(#as7-grad)" />
  <circle cx="46" cy="45" r="6" fill="#ffffff" opacity="0.45" />
  <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
  <circle cx="78" cy="20" r="7.5" fill="url(#as7-grad)" />
  <circle cx="22" cy="82" r="5" fill="url(#as7-grad)" />
  <circle cx="28" cy="28" r="6" fill="url(#as7-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as7-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#84cc16" />
      <stop offset="50%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <path d="M16 66C24 50 48 38 76 30C82 28 86 32 84 36C76 52 52 64 24 72C18 74 14 70 16 66Z" fill="url(#as7-m-grad)" opacity="0.85" />
  <circle cx="50" cy="50" r="18" fill="url(#as7-m-grad)" />
  <circle cx="46" cy="45" r="6.5" fill="#ffffff" opacity="0.5" />
  <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
  <circle cx="79" cy="19" r="8" fill="url(#as7-m-grad)" />
  <circle cx="21" cy="83" r="5.5" fill="url(#as7-m-grad)" />
  <circle cx="27" cy="27" r="6.5" fill="url(#as7-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as7-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#84cc16" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#031a14" />
  <circle cx="30" cy="30" r="8" fill="url(#as7-l-grad)" />
  <circle cx="41" cy="17" r="4" fill="url(#as7-l-grad)" />
  <circle cx="18" cy="41" r="3" fill="url(#as7-l-grad)" />
  <circle cx="18" cy="20" r="3.5" fill="url(#as7-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#10b981">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">SUSTAINABLE LIQUIDITY GRID</text>
</svg>`,
      },

      // 8. Pulsar Bubble Jet
      {
        id: "asym-pulsar-jet",
        name: "Pulsar Bubble Jet",
        codename: "ASYM-08",
        subtitle: "High-Energy Nucleus · Directional Bubble Ejection",
        concept:
          "Inti bulat padat di tengah dengan jet gelembung asimetris yang meluncur deras ke satu arah dan gelembung satelit penyeimbang di sisi berlawanan.",
        primaryGradients: ["#1e40af", "#6366f1", "#c084fc"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as8-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#080c26" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id="as8-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as8-bg)" />
            <circle cx="50" cy="50" r="16.5" fill="url(#as8-grad)" />
            <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.5" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
            <circle cx="68" cy="35" r="9" fill="url(#as8-grad)" />
            <circle cx="66" cy="33" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="82" cy="23" r="6.5" fill="url(#as8-grad)" />
            <circle cx="91" cy="14" r="3.5" fill="url(#as8-grad)" />
            <circle cx="30" cy="67" r="8" fill="url(#as8-grad)" />
            <circle cx="52" cy="78" r="4.5" fill="url(#as8-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as8-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e40af" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="17.5" fill="url(#as8-m-grad)" />
            <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
            <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
            <circle cx="69" cy="34" r="9.5" fill="url(#as8-m-grad)" />
            <circle cx="83" cy="22" r="7" fill="url(#as8-m-grad)" />
            <circle cx="92" cy="13" r="4" fill="url(#as8-m-grad)" />
            <circle cx="29" cy="68" r="8.5" fill="url(#as8-m-grad)" />
            <circle cx="52" cy="79" r="5" fill="url(#as8-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as8-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#080c26" />
                <circle cx="50" cy="50" r="15" fill="url(#as8-l-grad)" />
                <circle cx="68" cy="35" r="8" fill="url(#as8-l-grad)" />
                <circle cx="82" cy="23" r="5.5" fill="url(#as8-l-grad)" />
                <circle cx="32" cy="66" r="7" fill="url(#as8-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-blue-600 via-indigo-500 to-purple-400 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Real-Time Ledger Engine
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as8-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080c26" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="as8-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as8-bg)" />
  <circle cx="50" cy="50" r="16.5" fill="url(#as8-grad)" />
  <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.5" />
  <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
  <circle cx="68" cy="35" r="9" fill="url(#as8-grad)" />
  <circle cx="82" cy="23" r="6.5" fill="url(#as8-grad)" />
  <circle cx="91" cy="14" r="3.5" fill="url(#as8-grad)" />
  <circle cx="30" cy="67" r="8" fill="url(#as8-grad)" />
  <circle cx="52" cy="78" r="4.5" fill="url(#as8-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as8-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="17.5" fill="url(#as8-m-grad)" />
  <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
  <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
  <circle cx="69" cy="34" r="9.5" fill="url(#as8-m-grad)" />
  <circle cx="83" cy="22" r="7" fill="url(#as8-m-grad)" />
  <circle cx="92" cy="13" r="4" fill="url(#as8-m-grad)" />
  <circle cx="29" cy="68" r="8.5" fill="url(#as8-m-grad)" />
  <circle cx="52" cy="79" r="5" fill="url(#as8-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as8-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#080c26" />
  <circle cx="28" cy="30" r="8" fill="url(#as8-l-grad)" />
  <circle cx="39" cy="20" r="4.5" fill="url(#as8-l-grad)" />
  <circle cx="17" cy="39" r="4" fill="url(#as8-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#6366f1">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">REAL-TIME LEDGER ENGINE</text>
</svg>`,
      },

      // 9. Genesis Nucleus Nova
      {
        id: "asym-genesis-spores",
        name: "Genesis Nucleus Nova",
        codename: "ASYM-09",
        subtitle: "Egg-Shaped Smooth Core · Spore Bubble Constellation",
        concept:
          "Inti sel telur kosmik rounded yang dikelilingi oleh 5 spora gelembung nova asimetris dengan formasi konstelasi spiral gradasi emas dan kecubung mewah.",
        primaryGradients: ["#f59e0b", "#e11d48", "#701a75"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as9-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#21081a" />
                <stop offset="100%" stopColor="#3b0827" />
              </linearGradient>
              <linearGradient id="as9-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#701a75" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as9-bg)" />
            <circle cx="48" cy="52" r="17.5" fill="url(#as9-grad)" />
            <circle cx="44" cy="48" r="6" fill="#ffffff" opacity="0.45" />
            <circle cx="48" cy="52" r="4" fill="#ffffff" opacity="0.9" />
            <circle cx="74" cy="32" r="9.5" fill="url(#as9-grad)" />
            <circle cx="72" cy="30" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="26" cy="30" r="7" fill="url(#as9-grad)" />
            <circle cx="80" cy="68" r="5.5" fill="url(#as9-grad)" />
            <circle cx="34" cy="78" r="6.5" fill="url(#as9-grad)" />
            <circle cx="56" cy="84" r="3.5" fill="url(#as9-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as9-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#701a75" />
              </linearGradient>
            </defs>
            <circle cx="48" cy="52" r="18.5" fill="url(#as9-m-grad)" />
            <circle cx="44" cy="48" r="6.5" fill="#ffffff" opacity="0.5" />
            <circle cx="48" cy="52" r="4.5" fill="#ffffff" opacity="0.95" />
            <circle cx="75" cy="31" r="10" fill="url(#as9-m-grad)" />
            <circle cx="25" cy="29" r="7.5" fill="url(#as9-m-grad)" />
            <circle cx="81" cy="69" r="6" fill="url(#as9-m-grad)" />
            <circle cx="33" cy="79" r="7" fill="url(#as9-m-grad)" />
            <circle cx="56" cy="85" r="4" fill="url(#as9-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as9-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#701a75" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#21081a" />
                <circle cx="48" cy="52" r="15" fill="url(#as9-l-grad)" />
                <circle cx="73" cy="33" r="8" fill="url(#as9-l-grad)" />
                <circle cx="27" cy="31" r="6" fill="url(#as9-l-grad)" />
                <circle cx="35" cy="77" r="5.5" fill="url(#as9-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-amber-500 via-rose-500 to-fuchsia-600 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Genesis Asset Architecture
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as9-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#21081a" />
      <stop offset="100%" stop-color="#3b0827" />
    </linearGradient>
    <linearGradient id="as9-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#701a75" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as9-bg)" />
  <circle cx="48" cy="52" r="17.5" fill="url(#as9-grad)" />
  <circle cx="44" cy="48" r="6" fill="#ffffff" opacity="0.45" />
  <circle cx="48" cy="52" r="4" fill="#ffffff" opacity="0.9" />
  <circle cx="74" cy="32" r="9.5" fill="url(#as9-grad)" />
  <circle cx="26" cy="30" r="7" fill="url(#as9-grad)" />
  <circle cx="80" cy="68" r="5.5" fill="url(#as9-grad)" />
  <circle cx="34" cy="78" r="6.5" fill="url(#as9-grad)" />
  <circle cx="56" cy="84" r="3.5" fill="url(#as9-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as9-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#e11d48" />
      <stop offset="100%" stop-color="#701a75" />
    </linearGradient>
  </defs>
  <circle cx="48" cy="52" r="18.5" fill="url(#as9-m-grad)" />
  <circle cx="44" cy="48" r="6.5" fill="#ffffff" opacity="0.5" />
  <circle cx="48" cy="52" r="4.5" fill="#ffffff" opacity="0.95" />
  <circle cx="75" cy="31" r="10" fill="url(#as9-m-grad)" />
  <circle cx="25" cy="29" r="7.5" fill="url(#as9-m-grad)" />
  <circle cx="81" cy="69" r="6" fill="url(#as9-m-grad)" />
  <circle cx="33" cy="79" r="7" fill="url(#as9-m-grad)" />
  <circle cx="56" cy="85" r="4" fill="url(#as9-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as9-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#701a75" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#21081a" />
  <circle cx="26" cy="30" r="8" fill="url(#as9-l-grad)" />
  <circle cx="40" cy="20" r="4" fill="url(#as9-l-grad)" />
  <circle cx="16" cy="18" r="3" fill="url(#as9-l-grad)" />
  <circle cx="21" cy="41" r="3" fill="url(#as9-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#f59e0b">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">GENESIS ASSET ARCHITECTURE</text>
</svg>`,
      },

      // 10. Kinetic Vortex Nova
      {
        id: "asym-kinetic-vortex",
        name: "Kinetic Vortex Nova",
        codename: "ASYM-10",
        subtitle: "Center Power Orb · Multi-Node Gravitational Swirl",
        concept:
          "Inti pusaran energi di tengah dengan lengan pusaran cairan rounded melilit secara asimetris dari kiri-bawah memutari inti ke kanan-atas.",
        primaryGradients: ["#06b6d4", "#0ea5e9", "#312e81"],
        renderIcon: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as10-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#041226" />
                <stop offset="100%" stopColor="#0a2046" />
              </linearGradient>
              <linearGradient id="as10-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="28" fill="url(#as10-bg)" />
            <path
              d="M30 68C18 52 24 30 46 22C68 14 84 28 80 44C76 60 58 66 46 60"
              fill="none"
              stroke="url(#as10-grad)"
              strokeWidth="2.5"
              strokeDasharray="4 5"
              opacity="0.4"
            />
            <circle cx="50" cy="50" r="16" fill="url(#as10-grad)" />
            <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.5" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
            <circle cx="28" cy="68" r="9" fill="url(#as10-grad)" />
            <circle cx="18" cy="46" r="6" fill="url(#as10-grad)" />
            <circle cx="34" cy="24" r="7.5" fill="url(#as10-grad)" />
            <circle cx="62" cy="19" r="6" fill="url(#as10-grad)" />
            <circle cx="82" cy="30" r="9" fill="url(#as10-grad)" />
            <circle cx="80" cy="28" r="3" fill="#ffffff" opacity="0.5" />
            <circle cx="76" cy="64" r="7" fill="url(#as10-grad)" />
          </svg>
        ),
        renderMark: (size = 64) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="as10-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#0ea5e9" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
            </defs>
            <path
              d="M30 68C18 52 24 30 46 22C68 14 84 28 80 44C76 60 58 66 46 60"
              fill="none"
              stroke="url(#as10-m-grad)"
              strokeWidth="3"
              strokeDasharray="4 5"
              opacity="0.45"
            />
            <circle cx="50" cy="50" r="17" fill="url(#as10-m-grad)" />
            <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
            <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
            <circle cx="27" cy="69" r="9.5" fill="url(#as10-m-grad)" />
            <circle cx="17" cy="45" r="6.5" fill="url(#as10-m-grad)" />
            <circle cx="33" cy="23" r="8" fill="url(#as10-m-grad)" />
            <circle cx="63" cy="18" r="6.5" fill="url(#as10-m-grad)" />
            <circle cx="83" cy="29" r="9.5" fill="url(#as10-m-grad)" />
            <circle cx="77" cy="65" r="7.5" fill="url(#as10-m-grad)" />
          </svg>
        ),
        renderLockup: () => (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <svg width={40} height={40} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="as10-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
                <rect width="100" height="100" rx="28" fill="#041226" />
                <circle cx="50" cy="50" r="15" fill="url(#as10-l-grad)" />
                <circle cx="28" cy="68" r="8" fill="url(#as10-l-grad)" />
                <circle cx="34" cy="24" r="6.5" fill="url(#as10-l-grad)" />
                <circle cx="82" cy="30" r="8" fill="url(#as10-l-grad)" />
                <circle cx="76" cy="64" r="6" fill="url(#as10-l-grad)" />
              </svg>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-extrabold tracking-tight text-foreground">Nova</span>
                <span className="text-base font-extrabold tracking-tight bg-linear-to-r from-cyan-400 via-sky-500 to-blue-600 bg-clip-text text-transparent">
                  Finance
                </span>
              </div>
              <p className="text-[10px] font-medium text-default-400 -mt-0.5 tracking-wider uppercase">
                Kinetic Treasury Protocol
              </p>
            </div>
          </div>
        ),
        getRawSvgIcon: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as10-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#041226" />
      <stop offset="100%" stop-color="#0a2046" />
    </linearGradient>
    <linearGradient id="as10-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="28" fill="url(#as10-bg)" />
  <circle cx="50" cy="50" r="16" fill="url(#as10-grad)" />
  <circle cx="46" cy="46" r="6" fill="#ffffff" opacity="0.5" />
  <circle cx="50" cy="50" r="4" fill="#ffffff" opacity="0.9" />
  <circle cx="28" cy="68" r="9" fill="url(#as10-grad)" />
  <circle cx="18" cy="46" r="6" fill="url(#as10-grad)" />
  <circle cx="34" cy="24" r="7.5" fill="url(#as10-grad)" />
  <circle cx="62" cy="19" r="6" fill="url(#as10-grad)" />
  <circle cx="82" cy="30" r="9" fill="url(#as10-grad)" />
  <circle cx="76" cy="64" r="7" fill="url(#as10-grad)" />
</svg>`,
        getRawSvgMark: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as10-m-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="50%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="17" fill="url(#as10-m-grad)" />
  <circle cx="46" cy="46" r="6.5" fill="#ffffff" opacity="0.5" />
  <circle cx="50" cy="50" r="4.5" fill="#ffffff" opacity="0.95" />
  <circle cx="27" cy="69" r="9.5" fill="url(#as10-m-grad)" />
  <circle cx="17" cy="45" r="6.5" fill="url(#as10-m-grad)" />
  <circle cx="33" cy="23" r="8" fill="url(#as10-m-grad)" />
  <circle cx="63" cy="18" r="6.5" fill="url(#as10-m-grad)" />
  <circle cx="83" cy="29" r="9.5" fill="url(#as10-m-grad)" />
  <circle cx="77" cy="65" r="7.5" fill="url(#as10-m-grad)" />
</svg>`,
        getRawSvgLockup: () => `<svg width="260" height="60" viewBox="0 0 260 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="as10-l-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#0ea5e9" />
    </linearGradient>
  </defs>
  <rect width="48" height="48" x="6" y="6" rx="14" fill="#041226" />
  <circle cx="30" cy="30" r="8" fill="url(#as10-l-grad)" />
  <circle cx="18" cy="39" r="4" fill="url(#as10-l-grad)" />
  <circle cx="22" cy="19" r="3.5" fill="url(#as10-l-grad)" />
  <circle cx="42" cy="21" r="4" fill="url(#as10-l-grad)" />
  <circle cx="40" cy="39" r="3" fill="url(#as10-l-grad)" />
  <text x="66" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff">Nova<tspan fill="#0ea5e9">Finance</tspan></text>
  <text x="67" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#94a3b8" letter-spacing="1.5">KINETIC TREASURY PROTOCOL</text>
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
