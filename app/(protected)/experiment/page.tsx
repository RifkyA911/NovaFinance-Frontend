"use client";

import React, { useState, useMemo } from "react";
import { Card, Button, Chip } from "@heroui/react";
import {
  Sparkles,
  Copy,
  Download,
  Check,
  Building2,
  LayoutGrid,
  Layers,
  Palette,
  Eye,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Shield,
  ArrowRight,
  TrendingUp,
  Cpu,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { playSoftChime } from "@/app/lib/sound";
import { triggerNovaToast } from "@/app/(protected)/components/NovaToast";

interface LogoVariant {
  id: string;
  name: string;
  codename: string;
  category: "Geometric" | "Monogram" | "AI & Neural" | "Security & Vault" | "Fluid Cashflow";
  description: string;
  symbolism: string[];
  colors: string[];
  renderSvg: (size?: number) => React.ReactElement;
  getRawSvg: () => string;
}

export default function LogoExperimentPage() {
  const { selectedWorkspace, refreshWorkspaces } = useWorkspace();

  // Controls
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [previewBg, setPreviewBg] = useState<"dark" | "light" | "navy" | "checker">("dark");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"gallery" | "comparison" | "lockups">("gallery");

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    playSoftChime();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy SVG to clipboard
  const handleCopySvg = (logo: LogoVariant) => {
    playSoftChime();
    const svgCode = logo.getRawSvg();
    navigator.clipboard.writeText(svgCode);
    setCopiedId(logo.id);
    triggerNovaToast({
      title: "SVG Tersalin!",
      description: `Kode vektor untuk ${logo.name} telah disalin ke clipboard.`,
      type: "success",
    });
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Download SVG file
  const handleDownloadSvg = (logo: LogoVariant) => {
    playSoftChime();
    const svgCode = logo.getRawSvg();
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `novafinance-logo-${logo.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerNovaToast({
      title: "Download Dimulai",
      description: `File novafinance-logo-${logo.id}.svg berhasil diunduh.`,
      type: "info",
    });
  };

  // Apply logo directly to current active workspace
  const handleApplyToWorkspace = async (logo: LogoVariant) => {
    if (!selectedWorkspace?.id) {
      triggerNovaToast({
        title: "Gagal Menerapkan",
        description: "Pilih workspace aktif terlebih dahulu.",
        type: "error",
      });
      return;
    }

    setApplyingId(logo.id);
    playSoftChime();

    try {
      const svgCode = logo.getRawSvg();
      const base64Svg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;

      const res = await fetch(`/api/workspaces/${selectedWorkspace.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customBrandLogo: base64Svg,
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengupdate logo workspace");
      }

      // Update local storage and broadcast
      localStorage.setItem("novajournal_custom_brand_logo", base64Svg);
      window.dispatchEvent(new Event("novajournal_brand_config_changed"));
      await refreshWorkspaces();

      triggerNovaToast({
        title: "Logo Berhasil Diterapkan! ✨",
        description: `${logo.name} kini aktif sebagai logo brand workspace ${selectedWorkspace.name}.`,
        type: "success",
      });
    } catch (err) {
      console.error(err);
      triggerNovaToast({
        title: "Gagal Menerapkan",
        description: "Terjadi kesalahan saat menyimpan logo ke server.",
        type: "error",
      });
    } finally {
      setApplyingId(null);
    }
  };

  // 10 Vector Logo Variants Definition
  const LOGO_VARIANTS: LogoVariant[] = useMemo(
    () => [
      // 1. Nova Quantum Star
      {
        id: "quantum-star",
        name: "Nova Quantum Star",
        codename: "V-01 · COSMIC ALPHA",
        category: "Geometric",
        description:
          "Bintang oktagonal 8-titik poligon geometris bergradien cyan-violet dengan inti emas. Melambangkan kalkulasi akuntansi super-presisi dan akselerasi eksponensial kekayaan.",
        symbolism: ["Precision Accounting", "Explosive Growth", "Guiding North Star"],
        colors: ["#3b82f6", "#8b5cf6", "#f59e0b"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="qs-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="qs-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#0f172a" />
            <path d="M50 12L59 38L85 41L64 58L71 84L50 69L29 84L36 58L15 41L41 38Z" fill="url(#qs-g1)" />
            <path d="M50 24L55 42L72 44L58 55L63 72L50 62L37 72L42 55L28 44L45 42Z" fill="#1e1b4b" opacity="0.4" />
            <circle cx="50" cy="50" r="10" fill="url(#qs-gold)" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="qs-g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
    <linearGradient id="qs-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#0f172a" />
  <path d="M50 12L59 38L85 41L64 58L71 84L50 69L29 84L36 58L15 41L41 38Z" fill="url(#qs-g1)" />
  <circle cx="50" cy="50" r="10" fill="url(#qs-gold)" />
  <circle cx="50" cy="50" r="4" fill="#ffffff" />
</svg>`,
      },

      // 2. Infinity Cashflow Loop
      {
        id: "infinity-loop",
        name: "Infinity Flow Loop",
        codename: "V-02 · PERPETUAL LIQUIDITY",
        category: "Fluid Cashflow",
        description:
          "Pita Möbius tak hingga yang saling mengunci antara arus masuk (inflow hijau emerald) dan arus alokasi (indigo), melambangkan hukum kekekalan kas dan rekonsiliasi berkesinambungan.",
        symbolism: ["Double-Entry Balance", "Continuous Liquidity", "Automated Reconciliation"],
        colors: ["#10b981", "#6366f1", "#06b6d4"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="inf-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#090d16" />
            <path
              d="M32 36C24 36 18 42 18 50C18 58 24 64 32 64C42 64 47 50 53 50C59 50 64 64 74 64C82 64 88 58 88 50C88 42 82 36 74 36C64 36 59 50 53 50C47 50 42 36 32 36Z"
              stroke="url(#inf-g1)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="32" cy="50" r="5" fill="#10b981" />
            <circle cx="68" cy="50" r="5" fill="#6366f1" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="inf-g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#090d16" />
  <path d="M32 36C24 36 18 42 18 50C18 58 24 64 32 64C42 64 47 50 53 50C59 50 64 64 74 64C82 64 88 58 88 50C88 42 82 36 74 36C64 36 59 50 53 50C47 50 42 36 32 36Z" stroke="url(#inf-g1)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="32" cy="50" r="5" fill="#10b981" />
  <circle cx="68" cy="50" r="5" fill="#6366f1" />
</svg>`,
      },

      // 3. Prism Ledger Shield
      {
        id: "prism-shield",
        name: "Prism Ledger Shield",
        codename: "V-03 · ENTERPRISE DEFENSE",
        category: "Security & Vault",
        description:
          "Perisai isometrik bergradasi 3 dimensi berlapis kaca prismatik. Menggambarkan ketahanan modal korporat, enkripsi tingkat bank, dan isolasi ketat antar-entitas bisnis.",
        symbolism: ["Asset Defense", "Granular RBAC", "Bank-Grade Encryption"],
        colors: ["#2563eb", "#38bdf8", "#4f46e5"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ps-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
              <linearGradient id="ps-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#0b1329" />
            <path d="M50 16L82 28V52C82 69 68 82 50 88V16Z" fill="url(#ps-right)" />
            <path d="M50 16L18 28V52C18 69 32 82 50 88V16Z" fill="url(#ps-left)" />
            <path d="M50 30L68 38V52C68 62 60 70 50 74V30Z" fill="#ffffff" fillOpacity="0.25" />
            <path d="M50 30L32 38V52C32 62 40 70 50 74V30Z" fill="#ffffff" fillOpacity="0.4" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ps-left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="ps-right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#4f46e5" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#0b1329" />
  <path d="M50 16L82 28V52C82 69 68 82 50 88V16Z" fill="url(#ps-right)" />
  <path d="M50 16L18 28V52C18 69 32 82 50 88V16Z" fill="url(#ps-left)" />
  <path d="M50 30L68 38V52C68 62 60 70 50 74V30Z" fill="#ffffff" fill-opacity="0.25" />
  <path d="M50 30L32 38V52C32 62 40 70 50 74V30Z" fill="#ffffff" fill-opacity="0.4" />
</svg>`,
      },

      // 4. Nexus Orbital Core
      {
        id: "nexus-orbit",
        name: "Nexus Orbit Holding",
        codename: "V-04 · MULTI-ENTITY CORE",
        category: "Geometric",
        description:
          "Tiga lintasan orbit konsentris mengitari inti kas sentral. Desain bersih ala Linear & Stripe yang mewakili arsitektur holding company dengan puluhan anak perusahaan.",
        symbolism: ["Multi-Workspace Holding", "Orbital Treasury", "Clean Governance"],
        colors: ["#3b82f6", "#a855f7", "#ec4899"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="nex-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#030712" />
            <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(-30 50 50)" stroke="url(#nex-g)" strokeWidth="3.5" opacity="0.8" />
            <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(30 50 50)" stroke="url(#nex-g)" strokeWidth="3.5" opacity="0.8" />
            <circle cx="50" cy="50" r="14" fill="url(#nex-g)" />
            <circle cx="50" cy="50" r="6" fill="#ffffff" />
            <circle cx="24" cy="35" r="4" fill="#60a5fa" />
            <circle cx="76" cy="65" r="4" fill="#ec4899" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nex-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#030712" />
  <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(-30 50 50)" stroke="url(#nex-g)" stroke-width="3.5" opacity="0.8" />
  <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(30 50 50)" stroke="url(#nex-g)" stroke-width="3.5" opacity="0.8" />
  <circle cx="50" cy="50" r="14" fill="url(#nex-g)" />
  <circle cx="50" cy="50" r="6" fill="#ffffff" />
  <circle cx="24" cy="35" r="4" fill="#60a5fa" />
  <circle cx="76" cy="65" r="4" fill="#ec4899" />
</svg>`,
      },

      // 5. Apex Growth Chevron
      {
        id: "apex-growth",
        name: "Apex Growth Chevron",
        codename: "V-05 · ALPHA MOMENTUM",
        category: "Monogram",
        description:
          "Tiga bilah chevron bersudut tajam yang menyatu membentuk monogram huruf 'N'. Simbol akselerasi finansial, keuntungan majemuk, dan kecepatan eksekusi bisnis.",
        symbolism: ["Capital Acceleration", "Negative Space 'N'", "Compound Return"],
        colors: ["#2563eb", "#06b6d4", "#10b981"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="ag-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="ag-g2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#0f172a" />
            {/* Left pillar */}
            <path d="M22 76V24L38 24V76H22Z" fill="url(#ag-g1)" />
            {/* Diagonal surge */}
            <path d="M38 24L64 76H78L48 24H38Z" fill="url(#ag-g1)" />
            {/* Right pillar with arrow head */}
            <path d="M62 76V24L78 24V76H62Z" fill="url(#ag-g2)" />
            {/* Top right apex notch */}
            <polygon points="78,16 90,28 78,28" fill="#10b981" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ag-g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="ag-g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#0f172a" />
  <path d="M22 76V24L38 24V76H22Z" fill="url(#ag-g1)" />
  <path d="M38 24L64 76H78L48 24H38Z" fill="url(#ag-g1)" />
  <path d="M62 76V24L78 24V76H62Z" fill="url(#ag-g2)" />
  <polygon points="78,16 90,28 78,28" fill="#10b981" />
</svg>`,
      },

      // 6. Aether Equilibrium Scales
      {
        id: "aether-scales",
        name: "Aether Balance Scales",
        codename: "V-06 · ALGORITHMIC HARMONY",
        category: "Geometric",
        description:
          "Timbangan keuangan modern bergaya minimalis Swiss. Menggambarkan kesetimbangan neraca aktiva-pasiva serta kepatuhan tata kelola finansial yang bersih.",
        symbolism: ["Debit-Credit Equilibrium", "Swiss Minimalist Grid", "Tax & Audit Purity"],
        colors: ["#3b82f6", "#94a3b8", "#38bdf8"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="24" fill="#111827" />
            <circle cx="50" cy="50" r="34" stroke="#1f2937" strokeWidth="3" />
            {/* Center Fulcrum */}
            <path d="M50 22V78" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            <path d="M24 44H76" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            {/* Left Pan */}
            <path d="M24 44L16 62H32L24 44Z" fill="#3b82f6" fillOpacity="0.8" />
            {/* Right Pan */}
            <path d="M76 44L68 62H84L76 44Z" fill="#60a5fa" fillOpacity="0.8" />
            <circle cx="50" cy="44" r="5" fill="#ffffff" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" rx="24" fill="#111827" />
  <circle cx="50" cy="50" r="34" stroke="#1f2937" stroke-width="3" />
  <path d="M50 22V78" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
  <path d="M24 44H76" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
  <path d="M24 44L16 62H32L24 44Z" fill="#3b82f6" fill-opacity="0.8" />
  <path d="M76 44L68 62H84L76 44Z" fill="#60a5fa" fill-opacity="0.8" />
  <circle cx="50" cy="44" r="5" fill="#ffffff" />
</svg>`,
      },

      // 7. HyperNova Spark
      {
        id: "hypernova-spark",
        name: "HyperNova AI Spark",
        codename: "V-07 · INTELLIGENT AGENT",
        category: "AI & Neural",
        description:
          "Percikan kilau 4-sudut organik yang memancarkan kecerdasan buatan, scanner struk RAG otomatis, dan Copilot finansial proaktif dalam ekosistem NovaFinance.",
        symbolism: ["AI Copilot Intelligence", "Automated OCR Vision", "Proactive Advisory"],
        colors: ["#8b5cf6", "#d946ef", "#38bdf8"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hns-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#0f0728" />
            <path
              d="M50 14C50 34 34 50 14 50C34 50 50 66 50 86C50 66 66 50 86 50C66 50 50 34 50 14Z"
              fill="url(#hns-g)"
            />
            <circle cx="78" cy="22" r="6" fill="#38bdf8" />
            <circle cx="22" cy="78" r="4" fill="#d946ef" />
            <circle cx="50" cy="50" r="7" fill="#ffffff" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hns-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#d946ef" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#0f0728" />
  <path d="M50 14C50 34 34 50 14 50C34 50 50 66 50 86C50 66 66 50 86 50C66 50 50 34 50 14Z" fill="url(#hns-g)" />
  <circle cx="78" cy="22" r="6" fill="#38bdf8" />
  <circle cx="22" cy="78" r="4" fill="#d946ef" />
  <circle cx="50" cy="50" r="7" fill="#ffffff" />
</svg>`,
      },

      // 8. Vertex Vault Hexagon
      {
        id: "vertex-hex",
        name: "Vertex Hex Vault",
        codename: "V-08 · IMMUTABLE LEDGER",
        category: "Security & Vault",
        description:
          "Heksagon sarang lebah dengan kubus isometrik 3D di dalamnya. Merepresentasikan integritas buku besar yang tak dapat dimanipulasi, tahan audit, dan kokoh.",
        symbolism: ["Cryptographic Invariance", "Tamper-Proof Audit Trail", "Vault Fortification"],
        colors: ["#3b82f6", "#1e40af", "#60a5fa"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vh-top" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="vh-left" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="vh-right" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1d4ed8" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#020617" />
            {/* Hexagon border */}
            <polygon
              points="50,12 84,31 84,69 50,88 16,69 16,31"
              stroke="#334155"
              strokeWidth="2.5"
            />
            {/* Nested Isometric Cube */}
            <polygon points="50,26 74,40 50,54 26,40" fill="url(#vh-top)" />
            <polygon points="26,40 50,54 50,78 26,64" fill="url(#vh-left)" />
            <polygon points="50,54 74,40 74,64 50,78" fill="url(#vh-right)" />
            {/* Inner Core */}
            <circle cx="50" cy="54" r="5" fill="#38bdf8" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vh-top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
    <linearGradient id="vh-left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>
    <linearGradient id="vh-right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#020617" />
  <polygon points="50,12 84,31 84,69 50,88 16,69 16,31" stroke="#334155" stroke-width="2.5" />
  <polygon points="50,26 74,40 50,54 26,40" fill="url(#vh-top)" />
  <polygon points="26,40 50,54 50,78 26,64" fill="url(#vh-left)" />
  <polygon points="50,54 74,40 74,64 50,78" fill="url(#vh-right)" />
  <circle cx="50" cy="54" r="5" fill="#38bdf8" />
</svg>`,
      },

      // 9. Dynamic Dual Wave
      {
        id: "dual-wave",
        name: "Dual Wave Treasury",
        codename: "V-09 · CASH FLOW METRICS",
        category: "Fluid Cashflow",
        description:
          "Dua kurva gelombang sinusoidal yang bertemu dan menyatu membentuk lengkungan dinamis. Melambangkan harmonisasi antara pendapatan usaha dan belanja investasi.",
        symbolism: ["Inflow & Outflow Synergy", "Financial Rhythm", "Real-Time Tracking"],
        colors: ["#10b981", "#06b6d4", "#3b82f6"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dw-g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="dw-g2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="#04121d" />
            <path
              d="M18 64C28 64 36 34 50 34C64 34 72 64 82 64"
              stroke="url(#dw-g1)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M18 42C28 42 36 68 50 68C64 68 72 42 82 42"
              stroke="url(#dw-g2)"
              strokeWidth="9"
              strokeLinecap="round"
              opacity="0.8"
            />
            <circle cx="50" cy="51" r="5" fill="#ffffff" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="dw-g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="dw-g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="#04121d" />
  <path d="M18 64C28 64 36 34 50 34C64 34 72 64 82 64" stroke="url(#dw-g1)" stroke-width="9" stroke-linecap="round" />
  <path d="M18 42C28 42 36 68 50 68C64 68 72 42 82 42" stroke="url(#dw-g2)" stroke-width="9" stroke-linecap="round" opacity="0.8" />
  <circle cx="50" cy="51" r="5" fill="#ffffff" />
</svg>`,
      },

      // 10. Monolith Nova Monogram
      {
        id: "monolith-nova",
        name: "Monolith Nova Monogram",
        codename: "V-10 · INSTITUTIONAL TRUST",
        category: "Monogram",
        description:
          "Lambang squircle monolitik dengan huruf 'N' negative-space tebal disertai aksen bintang emas di sudut kanan atas. Sangat tajam dan terbaca jelas bahkan pada ukuran 16px favicon.",
        symbolism: ["Negative Space Clarity", "Favicon Readability", "Institutional Prestige"],
        colors: ["#0f172a", "#3b82f6", "#f59e0b"],
        renderSvg: (size = 48) => (
          <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mn-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="24" fill="url(#mn-g)" />
            {/* Negative space N inside white block */}
            <path
              d="M26 26H40L60 62V26H74V74H60L40 38V74H26V26Z"
              fill="#ffffff"
            />
            {/* Gold Spark */}
            <polygon points="76,14 80,24 90,28 80,32 76,42 72,32 62,28 72,24" fill="#fbbf24" />
          </svg>
        ),
        getRawSvg: () => `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mn-g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#mn-g)" />
  <path d="M26 26H40L60 62V26H74V74H60L40 38V74H26V26Z" fill="#ffffff" />
  <polygon points="76,14 80,24 90,28 80,32 76,42 72,32 62,28 72,24" fill="#fbbf24" />
</svg>`,
      },
    ],
    []
  );

  // Filtered variants
  const filteredVariants = useMemo(() => {
    if (selectedCategory === "ALL") return LOGO_VARIANTS;
    if (selectedCategory === "FAVORITES") return LOGO_VARIANTS.filter((v) => favorites[v.id]);
    return LOGO_VARIANTS.filter((v) => v.category === selectedCategory);
  }, [selectedCategory, LOGO_VARIANTS, favorites]);

  // Categories list
  const categories = ["ALL", "Geometric", "Monogram", "AI & Neural", "Security & Vault", "Fluid Cashflow", "FAVORITES"];

  // Helper background style for preview box
  const getPreviewBgClass = () => {
    switch (previewBg) {
      case "light":
        return "bg-slate-100 border-slate-300";
      case "navy":
        return "bg-slate-900 border-slate-700";
      case "checker":
        return "bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:16px_16px] border-slate-700";
      case "dark":
      default:
        return "bg-[#0b0f19] border-default-800";
    }
  };

  return (
    <div className="min-h-screen bg-default-50/70 dark:bg-gray-950 p-4 md:p-6 lg:p-8 space-y-6 text-foreground">
      {/* ── Header: 1 Row Title, 1 Row Actions ───────────────────────── */}
      <div className="space-y-4 border-b border-default-200/80 dark:border-default-800/80 pb-5">
        {/* Row 1: H1 & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-linear-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-purple-500/20 shrink-0">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                NovaFinance Logo Experiment Lab
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                10 Prototype Varian
              </span>
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Eksplorasi identitas visual SaaS NovaFinance. Uji skalabilitas ukuran, salin kode SVG murni, atau terapkan langsung ke workspace aktif Anda.
            </p>
          </div>
        </div>

        {/* Row 2: Action Buttons & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    playSoftChime();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow-2xs"
                      : "text-default-500 hover:text-foreground"
                  }`}
                >
                  {cat === "FAVORITES" ? `★ Favorit (${Object.values(favorites).filter(Boolean).length})` : cat}
                </button>
              );
            })}
          </div>

          {/* Right Toolbar: View Tabs & Background Selector */}
          <div className="flex items-center gap-2">
            {/* Background Tester */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs">
              <span className="text-[10.5px] font-semibold text-default-400 px-2">BG:</span>
              <button
                type="button"
                onClick={() => setPreviewBg("dark")}
                className={`w-6 h-6 rounded-md bg-[#0b0f19] border cursor-pointer ${
                  previewBg === "dark" ? "ring-2 ring-purple-500 border-white" : "border-default-700"
                }`}
                title="Dark Background"
              />
              <button
                type="button"
                onClick={() => setPreviewBg("light")}
                className={`w-6 h-6 rounded-md bg-slate-100 border cursor-pointer ${
                  previewBg === "light" ? "ring-2 ring-purple-500 border-purple-600" : "border-default-300"
                }`}
                title="Light Background"
              />
              <button
                type="button"
                onClick={() => setPreviewBg("navy")}
                className={`w-6 h-6 rounded-md bg-slate-900 border cursor-pointer ${
                  previewBg === "navy" ? "ring-2 ring-purple-500 border-white" : "border-default-700"
                }`}
                title="Navy Background"
              />
              <button
                type="button"
                onClick={() => setPreviewBg("checker")}
                className={`w-6 h-6 rounded-md bg-checker border cursor-pointer ${
                  previewBg === "checker" ? "ring-2 ring-purple-500 border-white" : "border-default-700"
                }`}
                style={{
                  background: "repeating-conic-gradient(#334155 0% 25%, #0f172a 0% 50%) 50% / 8px 8px",
                }}
                title="Checkerboard Grid"
              />
            </div>

            {/* Active Workspace Pill */}
            {selectedWorkspace && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 text-xs shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-semibold text-foreground truncate max-w-[130px]">
                  {selectedWorkspace.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Gallery Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {filteredVariants.map((logo) => {
          const isFav = favorites[logo.id];
          const isApplying = applyingId === logo.id;

          return (
            <Card
              key={logo.id}
              className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-default-100 dark:border-default-800/80 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-foreground">{logo.name}</h3>
                    <Chip size="sm" variant="soft" color="default" className="text-[10px] font-mono font-bold">
                      {logo.codename}
                    </Chip>
                  </div>
                  <p className="text-xs text-default-500 mt-1 leading-relaxed">{logo.description}</p>
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

              {/* Main Showcase Stage */}
              <div className={`p-6 border-b border-default-100 dark:border-default-800 flex flex-col items-center justify-center min-h-[200px] transition-colors ${getPreviewBgClass()}`}>
                <div className="transition-transform duration-300 hover:scale-105">
                  {logo.renderSvg(96)}
                </div>
                {/* Brand Lockup Text Preview */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-foreground">
                    Nova<span className="text-blue-500">Finance</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
                    SAAS
                  </span>
                </div>
              </div>

              {/* Scalability Testing Row (Favicon 16px, Navbar 24px, Card 40px, Hero 64px) */}
              <div className="p-4 bg-default-50/50 dark:bg-default-900/30 border-b border-default-100 dark:border-default-800/80">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-default-400 block mb-2">
                  Uji Skalabilitas & Ketajaman Resolusi
                </span>
                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-gray-950 border border-default-200/70 dark:border-default-800">
                  {/* 16px Favicon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center p-0.5 shadow-2xs">
                      {logo.renderSvg(16)}
                    </div>
                    <span className="text-[9.5px] font-mono text-default-400">16px Favicon</span>
                  </div>

                  {/* 24px Navbar */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center p-1 shadow-2xs">
                      {logo.renderSvg(24)}
                    </div>
                    <span className="text-[9.5px] font-mono text-default-400">24px Navbar</span>
                  </div>

                  {/* 40px Card */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center p-1 shadow-2xs">
                      {logo.renderSvg(40)}
                    </div>
                    <span className="text-[9.5px] font-mono text-default-400">40px Card</span>
                  </div>

                  {/* 56px App Icon */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center p-1.5 shadow-2xs">
                      {logo.renderSvg(56)}
                    </div>
                    <span className="text-[9.5px] font-mono text-default-400">56px App Icon</span>
                  </div>
                </div>
              </div>

              {/* Symbolism & Action Buttons */}
              <div className="p-4 space-y-3">
                {/* Symbolism Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {logo.symbolism.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded-md text-[10.5px] font-medium bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 border border-default-200/60 dark:border-default-700/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleCopySvg(logo)}
                    className="flex-1 h-8 text-xs font-semibold border-default-200 dark:border-default-700 cursor-pointer shadow-2xs"
                  >
                    {copiedId === logo.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1 text-default-500" />
                        <span>Salin SVG</span>
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => handleDownloadSvg(logo)}
                    className="flex-1 h-8 text-xs font-semibold border-default-200 dark:border-default-700 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1 text-default-500" />
                    <span>Download</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    isDisabled={isApplying}
                    onPress={() => handleApplyToWorkspace(logo)}
                    className="flex-1 h-8 text-xs font-semibold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white cursor-pointer shadow-xs hover:opacity-95 transition-all"
                  >
                    {isApplying ? (
                      <span>Menerapkan...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 mr-1" />
                        <span>Terapkan</span>
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
