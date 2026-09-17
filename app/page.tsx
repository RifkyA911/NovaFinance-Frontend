/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button, Card } from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Globe,
  PieChart,
  BarChart3,
  Layers,
  CheckCircle2,
  Lock,
  Cpu,
  Coins,
  Scale,
  Target,
  Sun,
  Moon,
  Receipt,
  FileSpreadsheet,
  Building2,
  Users,
  User,
  HelpCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import gsap from "gsap";

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Active showcase tab
  const [activeShowcase, setActiveShowcase] = useState<"dashboard" | "moneyflow" | "portfolio" | "ai">("dashboard");

  // Active FAQ item
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // GSAP animation refs
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroPreviewRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // GSAP Intro Timeline
    const ctx = gsap.context(() => {
      // Floating glowing orbs animation
      if (orb1Ref.current && orb2Ref.current) {
        gsap.to(orb1Ref.current, {
          x: 40,
          y: -30,
          scale: 1.15,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to(orb2Ref.current, {
          x: -35,
          y: 35,
          scale: 1.1,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // Hero content staggered entrance
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        heroBadgeRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.1 }
      )
        .fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.5"
        )
        .fromTo(
          heroDescRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          heroCtaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          heroPreviewRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power4.out" },
          "-=0.4"
        );
    });

    return () => ctx.revert();
  }, []);

  // 3D Card tilt effect on mouse move over hero preview
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroPreviewRef.current) return;
    const rect = heroPreviewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(heroPreviewRef.current, {
      rotationY: x * 0.015,
      rotationX: -y * 0.015,
      transformPerspective: 1000,
      ease: "power1.out",
      duration: 0.5,
    });
  };

  const handleMouseLeave = () => {
    if (!heroPreviewRef.current) return;
    gsap.to(heroPreviewRef.current, {
      rotationY: 0,
      rotationX: 0,
      ease: "power2.out",
      duration: 0.7,
    });
  };

  const FAQS = [
    {
      q: "Apakah NovaJournal benar-benar gratis?",
      a: "Ya, NovaJournal 100% gratis digunakan baik untuk keuangan individu maupun pembukuan UMKM. Tidak ada batasan jumlah transaksi, rekening, maupun fitur terkunci.",
    },
    {
      q: "Bagaimana integrasi Multi-Provider AI bekerja?",
      a: "NovaJournal terintegrasi langsung dengan penyedia LLM gratis dan cepat kelas dunia: Google Gemini Studio dan Groq Cloud (Llama 3.3). Anda cukup memasukkan API Key gratis di halaman Settings, dan AI dapat mengekstrak struk belanja, mengaudit kebocoran pengeluaran, serta mensimulasikan kelayakan target finansial secara instan.",
    },
    {
      q: "Apakah NovaJournal mendukung multi-rekening dan investasi?",
      a: "Tentu! Anda dapat mengelola beragam dompet likuiditas (Bank BCA, Mandiri, GoPay, OVO, Cash) sekaligus memantau portofolio investasi global dengan IHSG (IDX) sebagai default, S&P 500, Kripto (BTC/ETH), Surat Berharga Negara (SBN), dan Emas Antam.",
    },
    {
      q: "Apa itu fitur Visualisasi Money Flow?",
      a: "Money Flow adalah visualizer topologi arus kas (mirip diagram Sankey) yang secara grafis memetakan dari mana pendapatan Anda mengalir, disimpan ke rekening dompet mana, hingga terdistribusikan ke pos-pos pengeluaran apa saja secara transparan.",
    },
    {
      q: "Apakah data keuangan saya aman?",
      a: "Sangat aman. NovaJournal menerapkan arsitektur isolasi multi-tenant yang ketat, enkripsi sesi, dan tidak pernah menjual atau membagikan data finansial Anda ke pihak ketiga manapun. Anda juga dapat menjalankan NovaJournal secara mandiri (self-hosted) via Docker.",
    },
    {
      q: "Bisakah digunakan untuk pembukuan tim atau bisnis UMKM?",
      a: "Bisa! Anda dapat membuat beberapa Workspace terpisah (Personal, UMKM, PT) dan mengundang anggota tim dengan kontrol akses Role-Based (Owner, Admin, Staff, Viewer).",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Animated Gradient Blobs (GSAP Target) */}
      <div
        ref={orb1Ref}
        className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10"
      />
      <div
        ref={orb2Ref}
        className="absolute top-1/3 -right-32 w-[550px] h-[550px] bg-gradient-to-bl from-emerald-500/10 via-blue-500/10 to-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
      />

      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "NovaJournal",
            operatingSystem: "Web, Progressive Web App (PWA)",
            applicationCategory: "FinanceApplication",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "IDR",
            },
            description:
              "Platform manajemen keuangan pribadi, pembukuan UMKM, visualisasi money flow, dan portofolio investasi terintegrasi AI.",
          }),
        }}
      />

      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-default-200/60 dark:border-default-800/80 bg-white/70 dark:bg-gray-950/70 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NovaJournal
              </span>
              <span className="text-[10px] font-bold text-default-400 -mt-1 tracking-wider uppercase">
                Financial OS v0.2.0
              </span>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-default-600 dark:text-default-400">
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Fitur Unggulan
            </a>
            <a href="#showcase" className="hover:text-blue-600 transition-colors">
              Live Preview
            </a>
            <a href="#workspaces" className="hover:text-blue-600 transition-colors">
              Solusi UMKM & Personal
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8.5 h-8.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50 dark:bg-default-900/60 flex items-center justify-center text-default-600 dark:text-default-300 hover:border-default-300 transition-all cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <Button
              size="sm"
              variant="secondary"
              className="text-xs font-semibold h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 hidden sm:inline-flex"
              onPress={() => router.push("/login")}
            >
              Sign In
            </Button>

            <Button
              size="sm"
              variant="primary"
              className="text-xs font-bold h-8.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all cursor-pointer"
              onPress={() => router.push("/dashboard")}
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center space-y-8">
        {/* Animated Badge */}
        <div ref={heroBadgeRef} className="inline-block">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Rilis Terbaru v0.2.0: Multi-Provider AI & Global Wealth Portfolio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
        </div>

        {/* Hero Title */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1
            ref={heroTitleRef}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]"
          >
            Satu Platform untuk Seluruh{" "}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Arus Kas & Kekayaan
            </span>{" "}
            Masa Depan.
          </h1>

          <p
            ref={heroDescRef}
            className="text-base sm:text-lg lg:text-xl text-default-600 dark:text-default-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Pencatatan keuangan cerdas dengan integrasi Multi-Provider AI (Groq & Gemini),
            visualisasi topologi <b>Money Flow</b>, manajemen rekening likuiditas, dan pelacak portofolio
            investasi pasar modal <b>IHSG & Global</b>.
          </p>
        </div>

        {/* Hero CTA Buttons */}
        <div ref={heroCtaRef} className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Button
            size="lg"
            variant="primary"
            className="h-12 px-7 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
            onPress={() => router.push("/dashboard")}
          >
            <span>Mulai Sekarang — Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-6 rounded-2xl border border-default-200 dark:border-default-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-foreground font-semibold text-sm hover:bg-default-100 dark:hover:bg-default-800 transition-all flex items-center gap-2 cursor-pointer"
            onPress={() => router.push("/login")}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Login Akun Demo</span>
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-default-400 pt-2 font-mono">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Tanpa Kartu Kredit
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Multi-Tenant Personal & UMKM
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            PWA Offline-Ready
          </span>
        </div>

        {/* 3. Hero Interactive Mockup Showcase (GSAP 3D Interactive) */}
        <div
          ref={heroPreviewRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative max-w-5xl mx-auto pt-6 transition-transform will-change-transform"
        >
          <div className="rounded-3xl p-2.5 sm:p-3 bg-gradient-to-b from-blue-500/20 via-indigo-500/10 to-transparent border border-default-200/80 dark:border-default-700/80 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 overflow-hidden shadow-inner">
              {/* Mockup Browser Window Header */}
              <div className="px-4 py-3 border-b border-default-100 dark:border-default-800 bg-default-50/70 dark:bg-gray-950/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-[11px] font-mono text-default-400 ml-2 hidden sm:inline">
                    https://novajournal.app/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>LIVE WORKSPACE: Personal / PT Nova</span>
                </div>
              </div>

              {/* Mockup Content Grid */}
              <div className="p-4 sm:p-6 space-y-4 bg-default-50/30 dark:bg-gray-900/40 text-left">
                {/* Mini Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border border-default-200/60 dark:border-default-800 bg-white dark:bg-gray-900">
                    <span className="text-[10px] uppercase font-bold text-default-400">Total Saldo</span>
                    <p className="text-base sm:text-lg font-black font-mono text-foreground mt-0.5">
                      Rp 185.450.000
                    </p>
                    <span className="text-[10px] text-emerald-500 font-bold">+12.4% vs bln lalu</span>
                  </div>

                  <div className="p-3 rounded-xl border border-default-200/60 dark:border-default-800 bg-white dark:bg-gray-900">
                    <span className="text-[10px] uppercase font-bold text-default-400">Pemasukan</span>
                    <p className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Rp 35.000.000
                    </p>
                    <span className="text-[10px] text-default-400">Bulan berjalan</span>
                  </div>

                  <div className="p-3 rounded-xl border border-default-200/60 dark:border-default-800 bg-white dark:bg-gray-900">
                    <span className="text-[10px] uppercase font-bold text-default-400">Pengeluaran</span>
                    <p className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                      Rp 14.200.000
                    </p>
                    <span className="text-[10px] text-default-400">Rasio hemat: 59%</span>
                  </div>

                  <div className="p-3 rounded-xl border border-default-200/60 dark:border-default-800 bg-white dark:bg-gray-900">
                    <span className="text-[10px] uppercase font-bold text-default-400">Portofolio</span>
                    <p className="text-base sm:text-lg font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                      Rp 128.500.000
                    </p>
                    <span className="text-[10px] text-emerald-500 font-bold">IHSG Benchmark 🇮🇩</span>
                  </div>
                </div>

                {/* Mockup Quick Operation Hub */}
                <div className="p-3 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-foreground">Aksi Cepat:</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      + Catat Income
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold">
                      - Catat Expense
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                      Dompet & Rekening
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold">
                      Money Flow Viz
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Global Index Market Ticker Marquee */}
      <div className="w-full border-y border-default-200/60 dark:border-default-800 bg-default-50/60 dark:bg-gray-950/60 py-2.5 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-xs font-mono">
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span>🇮🇩 IHSG (IDX)</span>
            <span className="text-emerald-500">7,850.45 (+1.24%)</span>
          </span>
          <span className="text-default-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span>🇺🇸 S&P 500</span>
            <span className="text-emerald-500">5,751.13 (+0.42%)</span>
          </span>
          <span className="text-default-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span>🇺🇸 NASDAQ</span>
            <span className="text-emerald-500">20,008.62 (+0.83%)</span>
          </span>
          <span className="text-default-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span>🇯🇵 Nikkei 225</span>
            <span className="text-rose-500">38,720.15 (-0.65%)</span>
          </span>
          <span className="text-default-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span>🪙 Gold XAU/USD</span>
            <span className="text-emerald-500">$2,618.50 (+0.62%)</span>
          </span>
          <span className="text-default-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span>⚡ Bitcoin BTC</span>
            <span className="text-emerald-500">Rp 990M (+2.75%)</span>
          </span>
          <span className="text-default-300">•</span>
          <span className="flex items-center gap-1.5 font-bold text-foreground">
            <span>🇭🇰 Hang Seng</span>
            <span className="text-emerald-500">18,258.74 (+1.88%)</span>
          </span>
        </div>
      </div>

      {/* 5. Interactive Feature Showcase / Tabbed Walkthrough */}
      <section id="showcase" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            Interactive Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Dirancang Sempurna untuk Kebutuhan Finansial Riil
          </h2>
          <p className="text-sm sm:text-base text-default-500">
            Jelajahi alur kerja canggih yang telah terintegrasi di dalam NovaJournal.
          </p>

          {/* Interactive Switcher Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setActiveShowcase("dashboard")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcase === "dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                  : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
              }`}
            >
              1. Dashboard Multi-Skala
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcase("moneyflow")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcase === "moneyflow"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/25"
                  : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
              }`}
            >
              2. Money Flow Topology
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcase("portfolio")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcase === "portfolio"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                  : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
              }`}
            >
              3. Portofolio IHSG & Heatmap
            </button>
            <button
              type="button"
              onClick={() => setActiveShowcase("ai")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeShowcase === "ai"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
              }`}
            >
              4. Multi-Provider AI Copilot
            </button>
          </div>
        </div>

        {/* Dynamic Showcase Card */}
        <Card className="rounded-3xl border border-default-200/80 dark:border-default-800 p-6 sm:p-8 bg-white dark:bg-gray-900 shadow-xl">
          {activeShowcase === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Cashflow Performance dengan 6 Skala Waktu
                </h3>
                <p className="text-xs sm:text-sm text-default-500 leading-relaxed">
                  Pantau arus masuk dan keluar dengan fleksibilitas skala: <b>1 Hari, 1 Minggu, 1 Bulan, 1 Tahun, 5 Tahun, hingga Custom range</b>. Dilengkapi perincian likuiditas rekening dalam 3 mode (Donut, Bar, dan List) serta Quick Action Hub.
                </p>
                <ul className="space-y-2 text-xs font-medium text-default-600 dark:text-default-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Asset Breakdown dengan kalkulasi likuiditas instan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Expense Breakdown rapi tanpa vertical stretching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    Goals Quick Widget langsung di sisi pos pengeluaran
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-7 p-4 rounded-2xl bg-default-50 dark:bg-default-900/60 border border-default-200/60 dark:border-default-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-default-200 dark:border-default-800">
                  <span className="font-bold text-foreground">CASHFLOW_TIMEFRAME_SELECTOR</span>
                  <span className="text-blue-500 font-bold">[1D | 1W | 1M | 1Y | 5Y | CUSTOM]</span>
                </div>
                <div className="h-44 w-full flex items-end justify-between gap-2 pt-4">
                  {[45, 65, 55, 80, 70, 95, 85, 110, 90, 120, 105, 140].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-500 transition-all hover:brightness-125"
                        style={{ height: `${val}px` }}
                      />
                      <span className="text-[9px] text-default-400">M{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeShowcase === "moneyflow" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Aliran Arus Kas Visual (Topological Flow)
                </h3>
                <p className="text-xs sm:text-sm text-default-500 leading-relaxed">
                  Lihat secara visual bagaimana setiap rupiah mengalir dari <b>Sumber Pemasukan</b> (Gaji, Bisnis, Dividen) ➔ didistribusikan ke <b>Dompet Rekening</b> (BCA, Mandiri, E-Wallet) ➔ dialirkan ke <b>Pos Belanja</b> (Makan, Tagihan, Cicilan).
                </p>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                  Membantu mendeteksi kebocoran dana dan mengoptimalkan saldo idle.
                </div>
              </div>

              <div className="lg:col-span-7 p-5 rounded-2xl bg-default-50 dark:bg-default-900/60 border border-default-200/60 dark:border-default-800 space-y-4 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] text-default-400 font-sans">
                  <span>INCOME SOURCES (Rp 35M)</span>
                  <span>WALLETS (Rp 185M)</span>
                  <span>EXPENSES (Rp 14.2M)</span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-bold">
                    Gaji & Bisnis
                  </div>
                  <ArrowRight className="w-4 h-4 text-default-400" />
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 font-bold">
                    BCA Tahapan & GoPay
                  </div>
                  <ArrowRight className="w-4 h-4 text-default-400" />
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold">
                    Kebutuhan & Investasi
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcase === "portfolio" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Portofolio Investasi dengan Tolok Ukur IHSG 🇮🇩
                </h3>
                <p className="text-xs sm:text-sm text-default-500 leading-relaxed">
                  Pantau aset investasi lintas instrumen: <b>Saham IHSG, Saham Global US, SBN Obligasi Negara, Emas Antam, hingga Kripto</b>.
                  Dilengkapi **Finviz Heatmap**, **Monte Carlo Wealth Projector**, dan **Smart Rebalancing Calculator**.
                </p>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <Scale className="w-4 h-4" />
                  <span>Modern Portfolio Theory & Ray Dalio All-Weather</span>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-emerald-600/90 text-white border border-emerald-500">
                  <div className="flex justify-between">
                    <b>BBCA</b>
                    <span>+12.0%</span>
                  </div>
                  <p className="text-[10px] text-emerald-100">Rp 102.5M (26%)</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-700/90 text-white border border-emerald-500">
                  <div className="flex justify-between">
                    <b>BBRI</b>
                    <span>+11.4%</span>
                  </div>
                  <p className="text-[10px] text-emerald-100">Rp 80.2M (20%)</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-600/80 text-white border border-emerald-500">
                  <div className="flex justify-between">
                    <b>SBN FR0097</b>
                    <span>+3.5%</span>
                  </div>
                  <p className="text-[10px] text-emerald-100">Rp 51.7M (13%)</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-600/90 text-white border border-emerald-500">
                  <div className="flex justify-between">
                    <b>BITCOIN</b>
                    <span>+16.4%</span>
                  </div>
                  <p className="text-[10px] text-emerald-100">Rp 84.1M (21%)</p>
                </div>
              </div>
            </div>
          )}

          {activeShowcase === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Multi-Provider AI Copilot: Groq, Gemini & Claude
                </h3>
                <p className="text-xs sm:text-sm text-default-500 leading-relaxed">
                  Tidak bergantung pada satu AI tunggal. Anda dapat memilih mesin utama di `/settings` (Google Gemini, Groq Llama 3.3, DeepSeek, atau Anthropic Claude) dengan fallback cadangan jika kuota gratis habis.
                </p>
                <div className="space-y-1.5 text-xs text-default-600 dark:text-default-300">
                  <p className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Ekstraksi Struk Belanja Otomatis (OCR AI)
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Audit Kebocoran Anggaran & Deteksi Anomali
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Prediksi Kelayakan Target Tabungan Masa Depan
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 p-4 rounded-2xl bg-default-50 dark:bg-default-900/60 border border-default-200/60 dark:border-default-800 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-sans">
                  <b>AI Auditor Feedback:</b> "Pengeluaran belanja makanan Anda meningkat 28% minggu ini. Anda dapat menghemat Rp 850.000 dengan mengalihkan pesanan online ke anggaran mingguan terkontrol."
                </div>
                <div className="flex items-center justify-between text-[11px] text-default-400 pt-1">
                  <span>Engine: Groq Llama-3.3-70B</span>
                  <span className="text-emerald-500 font-bold">Latency: 280ms (Ultra-Fast)</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* 6. Bento Grid: 8 Core Pillars */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            Comprehensive Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            8 Fondasi Finansial Terkuat
          </h2>
          <p className="text-sm sm:text-base text-default-500">
            Seluruh kebutuhan pencatatan, pembukuan, visualisasi, dan investasi dalam satu ekosistem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-blue-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Multi-Provider AI</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Integrasi Gemini, Groq, DeepSeek, dan Claude untuk audit dan pembacaan struk instan.
            </p>
          </Card>

          {/* Card 2 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-purple-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Money Flow Topology</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Visualisasi alur arus kas dari pemasukan ➔ rekening ➔ pos pengeluaran.
            </p>
          </Card>

          {/* Card 3 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-emerald-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Portofolio IHSG & Global</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Benchmark indeks dunia, Heatmap pasar, wealth projector, dan kalkulator rebalancing.
            </p>
          </Card>

          {/* Card 4 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-amber-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Master Wallets & Liquidity</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Manajemen rekening Bank, E-Wallet, Kas Tunai, dan Kartu Kredit dengan saldo riil.
            </p>
          </Card>

          {/* Card 5 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-indigo-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Multi-Tenant Workspaces</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Pemisahan data bersih antara Personal, UMKM, dan PT dengan hak akses peran RBAC.
            </p>
          </Card>

          {/* Card 6 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-blue-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">TanStack Table v8 Engine</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Tabel transaksi berkinerja tinggi, multi-filter, pagination, pencarian cepat, dan ekspor.
            </p>
          </Card>

          {/* Card 7 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-purple-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Goals & Wishlist Tracker</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Lacak target tabungan (Dana Darurat, Rumah, Liburan) dengan AI Feasibility Simulator.
            </p>
          </Card>

          {/* Card 8 */}
          <Card className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 hover:border-emerald-500/40 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-foreground">Bank-Grade Privacy & PWA</h4>
            <p className="text-xs text-default-500 leading-relaxed">
              Privasi penuh tanpa iklan, siap offline via Progressive Web App, dan enkripsi data.
            </p>
          </Card>
        </div>
      </section>

      {/* 7. Workspaces Comparison Section */}
      <section id="workspaces" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            Designed for Every Scale
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            Pilihan Workspace Sesuai Profil Finansial Anda
          </h2>
          <p className="text-sm sm:text-base text-default-500">
            Ganti ruang kerja kapan saja tanpa risiko pencampuran data pribadi dan bisnis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Persona 1 */}
          <Card className="p-6 rounded-3xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Solo Saver (Personal)</h3>
              <p className="text-xs text-default-500 mt-0.5">Pencatatan harian & target tabungan</p>
            </div>
            <ul className="space-y-2 text-xs text-default-600 dark:text-default-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-dompet tunai & e-wallet
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Target tabungan dana darurat & gadget
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pemantauan portofolio saham IHSG
              </li>
            </ul>
          </Card>

          {/* Persona 2 */}
          <Card className="p-6 rounded-3xl border-2 border-blue-500 bg-linear-to-b from-blue-500/5 to-transparent space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                Paling Populer
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Pemilik Bisnis UMKM</h3>
              <p className="text-xs text-default-500 mt-0.5">Operasional & pembukuan kas usaha</p>
            </div>
            <ul className="space-y-2 text-xs text-default-600 dark:text-default-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" /> Pemisahan mutlak uang pribadi vs bisnis
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" /> Ekstraksi nota/struk vendor via AI OCR
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" /> Kolaborasi staf dengan hak akses khusus
              </li>
            </ul>
          </Card>

          {/* Persona 3 */}
          <Card className="p-6 rounded-3xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Korporasi & Akuntan PT</h3>
              <p className="text-xs text-default-500 mt-0.5">Audit trail & kepatuhan pelaporan</p>
            </div>
            <ul className="space-y-2 text-xs text-default-600 dark:text-default-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500" /> Audit trail histori mutasi permanen
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500" /> Ekspor laporan pembukuan PDF & XLSX
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-500" /> Multi-rekening giro & operasional
              </li>
            </ul>
          </Card>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <Card
                key={idx}
                className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm text-foreground cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-default-400 transition-transform ${
                      isOpen ? "rotate-90 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-default-500 leading-relaxed border-t border-default-100 dark:border-default-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 9. Final CTA Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Kendalikan Finansial Anda dengan Standar Tertinggi Hari Ini.
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-normal leading-relaxed">
              Bergabung bersama ribuan pengguna yang mengelola uang pribadi, toko UMKM, dan investasi mereka dengan NovaJournal. 100% Gratis.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              size="lg"
              variant="primary"
              className="h-12 px-8 rounded-2xl bg-white text-blue-600 font-bold text-sm shadow-xl hover:bg-blue-50 transition-all cursor-pointer"
              onPress={() => router.push("/dashboard")}
            >
              <span>Buka Dashboard Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="border-t border-default-200/60 dark:border-default-800 bg-default-50/50 dark:bg-gray-950/60 py-12 px-4 sm:px-6 text-xs text-default-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
              NJ
            </div>
            <span className="font-bold text-foreground">NovaJournal</span>
            <span>— Free & Open Financial OS.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/wallets" className="hover:text-blue-600 transition-colors">
              Wallets
            </Link>
            <Link href="/money-flow" className="hover:text-blue-600 transition-colors">
              Money Flow
            </Link>
            <Link href="/portfolio" className="hover:text-blue-600 transition-colors">
              Portfolio
            </Link>
            <Link href="/settings" className="hover:text-blue-600 transition-colors">
              AI Config
            </Link>
          </div>

          <div className="font-mono text-[11px] text-default-400">
            © 2026 NovaJournal. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
