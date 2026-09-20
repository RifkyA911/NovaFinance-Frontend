/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { playNovaThemeSound } from "@/app/lib/sound";
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
  ChevronDown,
  Compass,
  DollarSign,
  Activity,
  Layers3,
  BrainCircuit,
  Workflow,
  Lightbulb,
  Check,
  Terminal,
  Send,
  Crown,
  Volume2,
  Sliders,
  AlertTriangle,
  ArrowDown,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/contexts/AuthContext";
import NovaSupernovaOverlay from "@/components/landing/NovaSupernovaOverlay";
import SectionFluidBackdrop from "@/components/landing/SectionFluidBackdrop";
import SpreadsheetVsNovaSavage from "@/components/landing/SpreadsheetVsNovaSavage";
import HeroCircularStarTrails from "@/components/landing/HeroCircularStarTrails";
import HeroDashboardPreview from "@/components/landing/HeroDashboardPreview";
import NovaShowcaseInteractive from "@/components/landing/NovaShowcaseInteractive";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------
// I18N DICTIONARIES (English Default, Indonesian Toggle)
// -------------------------------------------------------------
type Language = "en" | "id";

const DICT = {
  en: {
    nav: {
      problem: "Friction vs Solution",
      features: "Features",
      architecture: "AI Hub",
      framework: "5W + 2H",
      showcase: "Showcase",
      personas: "Solutions",
      faq: "FAQ",
      signIn: "Sign In",
      getStarted: "Get Started Free",
      openDashboard: "Open Dashboard",
      supernovaBtn: "Supernova Intro",
    },
    hero: {
      badge: "Next-Gen Multi-Scale Financial Ledger",
      title1: "Intelligent Accounting &",
      titleHighlight: "Global Wealth Ledger",
      title2: "Unified for Everyone.",
      desc: "Architected for solo savers, growing businesses, and corporate teams. Track multi-currency cash flow, explore global portfolios with IHSG & S&P 500, and harness multi-provider AI copilot in a single zero-latency platform.",
      ctaPrimary: "Launch Your Workspace",
      ctaSecondary: "Explore Interactive Demo",
      stats: {
        uptime: "99.98% High Availability",
        providers: "Autonomous CFO Copilot",
        latency: "<280ms Vision Extraction",
        encryption: "Bank-Grade TLS 1.3",
      },
      mock: {
        url: "novafinance.app/dashboard",
        tenant: "● Multi-Tenant Connected",
        netWorth: "Total Net Worth",
        cashflow: "Operating Cash Flow",
        runway: "Healthy Runway",
        portfolio: "Stock & Gold (IHSG)",
        yield: "+8.6% Yield",
        chartTitle: "Cash Flow vs Budget Trajectory",
        income: "Income",
        expense: "Expense",
        aiInsightTitle: "Nova Copilot Real-Time Audit",
        aiInsightText: "Receipt from BCA transfer of Rp 2.500.000 auto-categorized into",
        aiInsightTag: "Operating Expense",
        aiInsightTime: "Audit verified • Sub-280ms",
        assetAllocation: "Asset Allocation",
        liquidCash: "Liquid Cash",
        businessEquity: "Business Equity",
        globalValas: "Global Valas",
      },
    },
    ticker: {
      label: "LIVE GLOBAL INDICES",
      defaultBadge: "DEFAULT",
    },
    aiSection: {
      badge: "AUTONOMOUS AI ENGINE",
      title: "Autonomous Multimodal Financial Intelligence",
      subtitle: "From sub-second receipt vision to executive CFO voice debriefs — NovaFinance unifies modern multimodal AI capabilities with seamless zero-downtime routing.",
      providers: [
        {
          id: "vision-ocr",
          name: "Ultra-Fast Vision OCR",
          role: "Multi-Receipt & Invoice Parsing",
          speed: "<280ms Extraction",
          desc: "Drag and drop receipts, tax invoices, and bank statements. Vision AI parses merchant names, timestamps, line items, and totals into ledger transactions automatically.",
          tag: "Vision Intelligence",
          icon: "Receipt",
          capability: "Groq & Gemini Vision",
          badge: "Sub-Second Engine",
        },
        {
          id: "cfo-copilot",
          name: "Autonomous CFO Copilot",
          role: "4 Strategic Executive Personas",
          speed: "Real-time Context",
          desc: "Switch between Corporate CFO, Friendly Buddy, Forensic Auditor, and Portfolio Analyst personas. Full real-time ledger context with custom (W × H) window sizing.",
          tag: "Executive Advisory",
          icon: "BrainCircuit",
          capability: "4 Operating Personas",
          badge: "Custom W × H Window",
        },
        {
          id: "voice-tts",
          name: "Celestial Voice Synthesis",
          role: "Spoken Briefings & Audio Cues",
          speed: "Natural Neural Voice",
          desc: "Listen to natural audio debriefs of cashflow health in Indonesian & English (male & female profiles), accompanied by interactive celestial theme chimes.",
          tag: "Voice & Sound",
          icon: "Volume2",
          capability: "5 Voice Personas",
          badge: "ID & EN Natural TTS",
        },
        {
          id: "intelligent-router",
          name: "Zero-Downtime Engine Router",
          role: "High-Availability Failover & BYOK",
          speed: "99.98% High Availability",
          desc: "Dynamic failover across Gemini 2.0 Flash, Groq Llama 3.3, DeepSeek R1, and Claude 3.5. Safely connect your custom private API keys with client-side encryption.",
          tag: "Engine Orchestration",
          icon: "Workflow",
          capability: "Multi-Engine Failover",
          badge: "BYO API Key Vault",
        },
      ],
      customKeysNote: "Configure your primary and fallback API keys directly in Settings or use workspace defaults.",
    },
    problemToSolved: {
      badge: "THE FRICTION VS THE NOVA SOLUTION",
      title: "Why Traditional Spreadsheets Fail & How Nova Solves It",
      subtitle: "Stop wrestling with broken formulas, siloed m-banking apps, lost invoice slips, and mystery cash leaks.",
      items: [
        {
          id: 1,
          problemTitle: "Spreadsheet Nightmare & Broken Formulas",
          problemDesc: "Fragile formulas break on edits, accidental overrides cause math drift, zero audit logs, and zero automated double-entry verification.",
          solutionTitle: "Automated Ledger Integrity & Audit Trail",
          solutionDesc: "Real-time debit-credit reconciliation, immutable audit log events, visual Sankey cashflow topology, and zero mathematical drift.",
          tag: "Double-Entry Core",
        },
        {
          id: 2,
          problemTitle: "Exhausting Manual Receipt Typing",
          problemDesc: "Hours wasted every weekend typing crumpled paper receipts and invoice PDFs into spreadsheets with frequent human typos.",
          solutionTitle: "Multi-Model AI Vision OCR (<300ms)",
          solutionDesc: "Ultra-fast Groq & Gemini vision OCR extracts merchant, items, taxes, and nominals straight into ledger lines in 1 click.",
          tag: "Sub-300ms Vision",
        },
        {
          id: 3,
          problemTitle: "Siloed Bank & Investment Accounts",
          problemDesc: "Juggling 5 different banking and stock broker apps without any unified real-time net-worth valuation across currencies.",
          solutionTitle: "Unified Master Multi-Currency Hub",
          solutionDesc: "Consolidated real-time tracking across bank accounts, e-wallets, crypto assets, and live global indices (IHSG, S&P 500) in IDR/USD.",
          tag: "Global Multi-Valas",
        },
        {
          id: 4,
          problemTitle: "Rigid Generic Business Tools",
          problemDesc: "Generic ERPs are expensive and lack white-label branding, customized UI density, or executive analytical advisory.",
          solutionTitle: "Enterprise White-Label & Nova Copilot",
          solutionDesc: "Custom company logo and brand header in sidebar, precision UI density sizing (custom W & H, 6 fonts), and AI Copilot with CFO voice TTS.",
          tag: "Enterprise Ready",
        },
      ],
    },
    framework5w2h: {
      badge: "SYSTEMATIC 5W + 2H FRAMEWORK",
      title: "Everything You Need to Know About NovaFinance",
      subtitle: "A rigorous, transparent breakdown of our purpose, architecture, timeline, and value proposition.",
      items: [
        {
          question: "WHAT is NovaFinance?",
          label: "What",
          icon: BrainCircuit,
          summary: "A unified double-entry ledger platform combining multi-tenant business accounting, global investment portfolios, and intelligent multi-model AI.",
          details: "Unlike simple expense-trackers that lose history or bulky enterprise ERPs that cost thousands, NovaFinance bridges personal finance and business bookkeeping into one modern reactive system.",
        },
        {
          question: "WHY do you need it?",
          label: "Why",
          icon: Lightbulb,
          summary: "Spreadsheets break, banking apps are isolated, and financial blind spots cause irreversible business cash crunches.",
          details: "NovaFinance gives you real-time visibility over every rupiah and dollar, visual money flow paths, and automated receipt OCR so you never miss a tax write-off or duplicate expense.",
        },
        {
          question: "WHO is it built for?",
          label: "Who",
          icon: Users,
          summary: "Solo professionals, growing UMKM entrepreneurs, freelance consultants, and corporate accounting teams.",
          details: "Multi-tenant workspaces let you switch between your personal family budget and multiple PT/CV corporate accounts in a single click with role-based access control.",
        },
        {
          question: "WHERE can you access it?",
          label: "Where",
          icon: Globe,
          summary: "Accessible worldwide across modern web browsers, desktop workspaces, and installable PWA on iOS and Android.",
          details: "Built with high-speed edge distribution and local caching so your daily cash flow logging remains fluid even in low-connectivity areas.",
        },
        {
          question: "WHEN should you adopt it?",
          label: "When",
          icon: Clock,
          summary: "From your very first paycheck to scaling an enterprise through round funding.",
          details: "Starting early prevents financial reconciliation debt. Whether you're sorting out 5 transaction receipts or 5,000 monthly ledger rows, NovaFinance scales seamlessly.",
        },
        {
          question: "HOW does it work?",
          label: "How",
          icon: Workflow,
          summary: "High-speed TypeScript Next.js frontend, Go microservice core, PostgreSQL double-entry schema, and TanStack Table v8 reactivity.",
          details: "Every debit transaction has a verified credit counterpart. Zero mathematical drift, zero ghost balances, backed by live websockets and instant AI schema parsing.",
        },
        {
          question: "HOW MUCH does it cost & save?",
          label: "How Much",
          icon: DollarSign,
          summary: "Free open community tier with zero transaction cut, saving 15+ hours/month of manual bookkeeping.",
          details: "Eliminate expensive monthly accounting subscriptions. Save thousands in accountant fees by delivering clean, audit-ready Excel and PDF reports.",
        },
      ],
    },
    showcase: {
      badge: "LIVE CAPABILITIES",
      title: "Designed for Velocity and Total Precision",
      subtitle: "Select a module below to inspect NovaFinance's live interactive workflow.",
      tabs: {
        dashboard: "1. Multi-Scale Dashboard",
        moneyflow: "2. Money Flow Topology",
        portfolio: "3. Global Portfolio & IHSG",
        ai: "4. Multi-Provider AI Copilot",
      },
      cards: {
        dashboard: {
          title: "Executive Financial Command Center",
          desc: "Live multi-entity balance sheets, cashflow trajectory, and quick action hubs.",
          link: "View full dashboard",
          assetLabel: "Total Asset Value",
          assetChange: "+18.4% vs last quarter",
          burnLabel: "Active Monthly Burn Rate",
          burnDesc: "Within target safety bounds",
          runwayLabel: "Emergency & Warchest Runway",
          runwayDesc: "Tier-1 Capital Resilience",
        },
        moneyflow: {
          title: "Visual Topology & Fund Routing",
          desc: "Interactive graphical node topology mapping money transfers across all accounts.",
          link: "Inspect money topology",
          inflowTitle: "Revenue & Inflow",
          inflowSub: "BCA & Mandiri Hub",
          allocTitle: "Internal Allocation",
          allocSub: "Payroll & Operational Vault",
          reinvestTitle: "Wealth Reinvestment",
          reinvestSub: "IHSG Stocks & Bullion Vault",
        },
        portfolio: {
          title: "IHSG & Global Multi-Asset Engine",
          desc: "Live index tracking, Finviz heatmap integration, and Monte Carlo wealth projector.",
          link: "Open portfolio suite",
        },
        ai: {
          title: "Live AI Copilot & Receipt Extraction",
          desc: "Extract unstructured paper receipts, detect tax splits, and forecast budget surplus.",
          link: "Try copilot audit",
          boxTitle: "Automated Double-Entry Ledger Entry Formed",
          boxDesc: "Receipt parsed in 240ms via Groq Llama 3.3. Debited Operational Expense (Rp 450.000) and Credited Petty Cash Wallet with 100% verified tax calculation.",
        },
      },
    },
    bento: {
      badge: "FULL SPECTRUM TECHNOLOGY",
      title: "Eight Core Pillars of Financial Supremacy",
      subtitle: "Built from scratch to outperform legacy personal finance and accounting apps.",
    },
    personas: {
      badge: "TAILORED SOLUTIONS",
      title: "Built for Your Exact Financial Scope",
      subtitle: "Whether tracking your personal savings or orchestrating payroll across three holding entities.",
      solo: {
        title: "Solo Saver & Investor",
        tag: "Personal Finance",
        desc: "Take command of personal wealth, daily living expenses, and automated portfolio goals.",
      },
      umkm: {
        title: "UMKM & Agency Founders",
        tag: "Small Business",
        desc: "Track client invoices, team spending, petty cash, and supplier debts in real-time.",
      },
      corp: {
        title: "Corporate Accountants & PT",
        tag: "Enterprise",
        desc: "Full double-entry ledger, multi-entity consolidation, RBAC roles, and exportable audit trails.",
      },
    },
    faq: {
      badge: "FREQUENTLY ASKED QUESTIONS",
      title: "Everything Clarified",
      subtitle: "Have questions before getting started? Explore our transparent answers below.",
    },
    cta: {
      title: "Master Your Financial Future Today.",
      desc: "Join thousands of professionals, UMKM founders, and finance teams who trust NovaFinance for audit-ready precision.",
      button: "Create Free Account Now",
      subtext: "Free forever tier • No credit card required • Instant setup in 60 seconds",
    },
    footer: {
      rights: "NovaFinance Inc. All rights reserved.",
      tagline: "The Modern Financial Operating System for Forward-Thinking Operators.",
      statusText: "All Systems Operational • API v1.2",
      securityBadge: "SOC-2 Ready • 256-bit TLS • BetterAuth Protected",
      newsletterTitle: "Subscribe to Financial Intelligence",
      newsletterDesc: "Join 12,000+ operators getting weekly memos on runway optimization and AI bookkeeping.",
      subscribePlaceholder: "Enter your work email...",
      subscribeBtn: "Subscribe",
      colPlatform: "Platform",
      colAi: "AI & Intelligence",
      colGovernance: "Governance & RBAC",
      colDevelopers: "Developers",
      colLegal: "Legal & Security",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      security: "Security Disclosure",
      madeWith: "Crafted with Next.js 16, Turbopack, and Elysia.",
    },
  },
  id: {
    nav: {
      problem: "Masalah vs Solusi",
      features: "Fitur",
      architecture: "AI Hub",
      framework: "5W + 2H",
      showcase: "Simulasi",
      personas: "Solusi",
      faq: "FAQ",
      signIn: "Masuk",
      getStarted: "Daftar Gratis",
      openDashboard: "Buka Dashboard",
      supernovaBtn: "Intro Supernova",
    },
    hero: {
      badge: "Buku Besar Keuangan Multi-Skala Generasi Baru",
      title1: "Pembukuan Cerdas &",
      titleHighlight: "Portofolio Global",
      title2: "Terpadu untuk Semua Skala.",
      desc: "Dirancang khusus untuk pencatatan pribadi, bisnis UMKM, hingga akuntansi PT. Kelola arus kas multi-mata uang, pantau portofolio saham IHSG & indeks global, serta gunakan asisten AI multi-provider dalam satu sistem berkecepatan tinggi.",
      ctaPrimary: "Mulai Sekarang Gratis",
      ctaSecondary: "Lihat Simulasi Interaktif",
      stats: {
        uptime: "99.98% Ketersediaan Sistem",
        providers: "CFO Copilot Otonom",
        latency: "<280ms Ekstraksi Vision",
        encryption: "Enkripsi Bank-Grade TLS 1.3",
      },
      mock: {
        url: "novafinance.app/dashboard",
        tenant: "● Multi-Tenant Terhubung",
        netWorth: "Total Kekayaan Bersih",
        cashflow: "Arus Kas Operasional",
        runway: "Runway Aman",
        portfolio: "Saham & Emas (IHSG)",
        yield: "+8.6% Imbal Hasil",
        chartTitle: "Lintasan Arus Kas vs Anggaran",
        income: "Pemasukan",
        expense: "Pengeluaran",
        aiInsightTitle: "Audit Real-Time Nova Copilot",
        aiInsightText: "Struk transfer BCA Rp 2.500.000 otomatis dikategorikan ke",
        aiInsightTag: "Beban Operasional",
        aiInsightTime: "Terverifikasi audit • Sub-280ms",
        assetAllocation: "Alokasi Aset",
        liquidCash: "Kas Likuid",
        businessEquity: "Ekuitas Bisnis",
        globalValas: "Valas Global",
      },
    },
    ticker: {
      label: "INDEKS BURSA GLOBAL",
      defaultBadge: "DEFAULT",
    },
    aiSection: {
      badge: "MESIN AI OTONOM",
      title: "Kecerdasan Finansial Multimodal Otonom",
      subtitle: "Dari pembacaan struk super cepat hingga briefing suara CFO eksekutif — NovaFinance memadukan teknologi AI multimodal dengan proteksi failover tanpa jeda.",
      providers: [
        {
          id: "vision-ocr",
          name: "Vision OCR Super Cepat",
          role: "Ekstraksi Foto Struk & Faktur Pajak",
          speed: "Ekstraksi <280ms",
          desc: "Cukup seret struk belanja, nota warung, atau tagihan multi-halaman. AI Vision mengekstrak nama toko, tanggal transaksi, rincian barang, dan total nominal ke buku kas dalam sekejap.",
          tag: "Vision Intelligence",
          icon: "Receipt",
          capability: "Groq & Gemini Vision",
          badge: "Sub-Second Engine",
        },
        {
          id: "cfo-copilot",
          name: "Nova Copilot & 4 Persona",
          role: "Asisten Keuangan Finansial Adaptif",
          speed: "Real-time Insight",
          desc: "Beralih instan antara CFO Korporat, Sahabat Finansial, Auditor Forensik, dan Analis Portofolio. Menguasai data pembukuan Anda dengan pengaturan ukuran jendela kustom (W × H).",
          tag: "Executive Advisory",
          icon: "BrainCircuit",
          capability: "4 Persona Operasional",
          badge: "Jendela Kustom W × H",
        },
        {
          id: "voice-tts",
          name: "Sintesis Suara (TTS) Celestial",
          role: "Briefing Lisan & Audio Feedback",
          speed: "Suara Alami Bernada",
          desc: "Dengarkan ringkasan arus kas harian dibacakan dengan suara alami Bahasa Indonesia & English (pria & wanita), lengkap dengan efek suara celestial chime interaktif.",
          tag: "Voice & Sound",
          icon: "Volume2",
          capability: "5 Profil Suara TTS",
          badge: "ID & EN Natural TTS",
        },
        {
          id: "intelligent-router",
          name: "Router Mesin Anti-Downtime",
          role: "Failover Multimodel & Vault BYOK",
          speed: "99.98% Ketersediaan",
          desc: "Peralihan otomatis antara Gemini 2.0 Flash, Groq Llama 3.3, DeepSeek R1, dan Claude 3.5. Pasang API Key pribadi Anda sendiri dengan enkripsi aman di sisi pengguna.",
          tag: "Engine Orchestration",
          icon: "Workflow",
          capability: "Failover Otomatis",
          badge: "Brankas Kunci API Vault",
        },
      ],
      customKeysNote: "Anda dapat mengatur kunci API utama dan cadangan langsung di halaman Settings atau menggunakan setelan bawaan workspace.",
    },
    problemToSolved: {
      badge: "PROBLEMA PEMBUKUAN VS SOLUSI NOVA",
      title: "Mengapa Cara Lama Gagal & Bagaimana Nova Menyelesaikannya",
      subtitle: "Hentikan kerepotan rumus spreadsheet yang rusak, aplikasi perbankan yang terisolasi, dan kebocoran dana misterius.",
      items: [
        {
          id: 1,
          problemTitle: "Mimpi Buruk Spreadsheet & Rumus Rusak",
          problemDesc: "Formula Excel mudah error tertimpa, tanpa jejak audit resmi, dan tanpa verifikasi buku besar berpasangan otomatis.",
          solutionTitle: "Integritas Buku Besar Berpasangan & Jejak Audit",
          solutionDesc: "Rekonsiliasi debit-kredit real-time, audit log tidak dapat diubah, visual Sankey money flow, dan nol selisih angka.",
          tag: "Double-Entry Core",
        },
        {
          id: 2,
          problemTitle: "Kelelahan Input Struk Manual",
          problemDesc: "Waktu berjam-jam terbuang mengetik nota belanja, bukti potong pajak tercecer, dan salah ketik nominal transaksi.",
          solutionTitle: "Vision AI OCR Multi-Provider (<300ms)",
          solutionDesc: "Ekstraksi multimodal Groq & Gemini sub-300ms langsung menjadi transaksi berkategori akurat dalam 1 klik.",
          tag: "Sub-300ms Vision",
        },
        {
          id: 3,
          problemTitle: "Rekening Bank & Investasi Terkotak-kotak",
          problemDesc: "Harus membuka 6 aplikasi m-banking dan sekuritas berbeda tanpa visibilitas total kekayaan bersih multi-valas.",
          solutionTitle: "Hub Terpadu Multi-Valas & Indeks Global",
          solutionDesc: "Pelacakan terpusat rekening bank, e-wallet, aset kripto, serta pantauan indeks IHSG dan S&P 500 dalam IDR/USD/EUR.",
          tag: "Global Multi-Valas",
        },
        {
          id: 4,
          problemTitle: "Aplikasi Kaku Tanpa Identitas Korporasi",
          problemDesc: "Tidak bisa white-label identitas entitas, tampilan terlalu padat atau longgar, dan minim asistensi analitis eksekutif.",
          solutionTitle: "Enterprise White-Label & Nova Copilot Cerdas",
          solutionDesc: "Identitas logo & brand kustom perusahaan, pengaturan kepadatan UI presisi (px W & H, 6 font), serta Copilot AI dengan persona CFO.",
          tag: "Enterprise Ready",
        },
      ],
    },
    framework5w2h: {
      badge: "KERANGKA KERJA SISTEMATIS 5W + 2H",
      title: "Segala Hal Tentang NovaFinance Secara Transparan",
      subtitle: "Penjelasan terstruktur mengenai fungsi, arsitektur, relevansi, dan nilai tambah bagi pengguna.",
      items: [
        {
          question: "APA itu NovaFinance? (What)",
          label: "What",
          icon: BrainCircuit,
          summary: "Platform buku besar ganda modern yang menggabungkan pembukuan UMKM/PT, portofolio investasi global, dan AI Copilot terintegrasi.",
          details: "Berbeda dari aplikasi pencatat pengeluaran biasa yang mudah hilang riwayatnya atau ERP korporat yang rumit dan mahal, NovaFinance menjembatani keuangan pribadi dan pembukuan resmi dalam satu antarmuka reaktif.",
        },
        {
          question: "MENGAPA Anda membutuhkannya? (Why)",
          label: "Why",
          icon: Lightbulb,
          summary: "Spreadsheet rawan rumus rusak, aplikasi bank terkotak-kotak, dan kebocoran dana dapat mematikan arus kas bisnis.",
          details: "NovaFinance memberi Anda pandangan menyeluruh atas setiap rupiah, visual aliran dana antar-kantong, dan OCR struk otomatis sehingga tidak ada bukti transaksi yang tercecer.",
        },
        {
          question: "SIAPA pengguna targetnya? (Who)",
          label: "Who",
          icon: Users,
          summary: "Individu penabung, pemilik bisnis UMKM, konsultan lepas, hingga tim staf akuntansi perusahaan PT.",
          details: "Fitur Multi-Tenant Workspaces memungkinkan Anda berganti antara dompet pribadi keluarga dan pembukuan beberapa PT/CV hanya dengan 1 klik tanpa campur aduk.",
        },
        {
          question: "DI MANA platform ini dapat diakses? (Where)",
          label: "Where",
          icon: Globe,
          summary: "Dapat diakses di mana saja melalui browser modern di PC, laptop, tablet, serta PWA di smartphone iOS & Android.",
          details: "Menggunakan CDN edge berkecepatan tinggi dan caching lokal, sehingga pencatatan transaksi harian tetap responsif dan lancar kapan pun dibutuhkan.",
        },
        {
          question: "KAPAN waktu terbaik menggunakannya? (When)",
          label: "When",
          icon: Clock,
          summary: "Sejak penghasilan pertama Anda hingga mengelola puluhan rekening dan dividen bisnis.",
          details: "Memulai sedini mungkin mencegah beban rekonsiliasi berantakan di akhir tahun. Baik Anda mencatat 10 transaksi atau 10.000 mutasi sebulan, performa tetap instan.",
        },
        {
          question: "BAGAIMANA cara kerjanya? (How)",
          label: "How",
          icon: Workflow,
          summary: "Frontend Next.js TypeScript, microservice Go di backend, skema double-entry PostgreSQL, dan TanStack Table v8.",
          details: "Setiap transaksi debit memiliki penyeimbang kredit yang tervalidasi. Tidak ada selisih fiktif, dilengkapi sinkronisasi WebSocket real-time dan parsing schema AI.",
        },
        {
          question: "BERAPA biaya dan penghematannya? (How Much)",
          label: "How Much",
          icon: DollarSign,
          summary: "Tersedia tier komunitas gratis tanpa potongan transaksi, menghemat 15+ jam kerja manual setiap bulan.",
          details: "Hilangkan biaya langganan software akuntansi kaku bernilai jutaan rupiah. Hemat waktu konsultan dengan laporan Excel dan PDF yang siap audit.",
        },
      ],
    },
    showcase: {
      badge: "SIMULASI FITUR UTAMA",
      title: "Dirancang untuk Kecepatan dan Presisi Mutlak",
      subtitle: "Pilih tab di bawah untuk melihat alur kerja interaktif NovaFinance.",
      tabs: {
        dashboard: "1. Dashboard Multi-Skala",
        moneyflow: "2. Visual Aliran Arus Kas",
        portfolio: "3. Portofolio Global & IHSG",
        ai: "4. Asisten Multi-Provider AI",
      },
      cards: {
        dashboard: {
          title: "Pusat Komando Finansial Eksekutif",
          desc: "Neraca multi-entitas real-time, lintasan arus kas, dan pintasan aksi cepat.",
          link: "Lihat dashboard penuh",
          assetLabel: "Total Nilai Aset",
          assetChange: "+18.4% vs kuartal lalu",
          burnLabel: "Burn Rate Bulanan Aktif",
          burnDesc: "Dalam batas aman anggaran",
          runwayLabel: "Runway Kas & Cadangan Darurat",
          runwayDesc: "Ketahanan Modal Tier-1",
        },
        moneyflow: {
          title: "Topologi Visual & Aliran Dana",
          desc: "Pemetaan grafis node interaktif untuk arus transfer ke seluruh rekening & brankas.",
          link: "Periksa topologi dana",
          inflowTitle: "Pendapatan & Arus Masuk",
          inflowSub: "Hub Rekening BCA & Mandiri",
          allocTitle: "Alokasi Operasional",
          allocSub: "Gaji & Vault Operasional",
          reinvestTitle: "Reinvestasi & Aset",
          reinvestSub: "Saham IHSG & Brankas Emas",
        },
        portfolio: {
          title: "Mesin Multi-Aset Global & IHSG",
          desc: "Pelacakan indeks real-time, integrasi heatmap Finviz, dan simulator Monte Carlo.",
          link: "Buka modul portofolio",
        },
        ai: {
          title: "Copilot AI & Ekstraksi Struk Real-Time",
          desc: "Ekstraksi struk kertas tak terstruktur, deteksi pembagian pajak, dan proyeksi surplus kas.",
          link: "Coba audit copilot",
          boxTitle: "Jurnal Pembukuan Berpasangan Otomatis Terbentuk",
          boxDesc: "Struk diproses dalam 240ms via Groq Llama 3.3. Mendebit Beban Operasional (Rp 450.000) dan Mengkredit Kas Kecil dengan kalkulasi pajak 100% terverifikasi.",
        },
      },
    },
    bento: {
      badge: "FITUR LENGKAP",
      title: "Delapan Pilar Keunggulan Finansial",
      subtitle: "Didesain dari nol untuk melampaui keterbatasan aplikasi pencatatan konvensional.",
    },
    personas: {
      badge: "SOLUSI PERSONAL & BISNIS",
      title: "Disesuaikan untuk Skala Kebutuhan Anda",
      subtitle: "Dari sekadar memantau tabungan pribadi hingga mengelola arus kas beberapa entitas bisnis.",
      solo: {
        title: "Penabung & Investor Mandiri",
        tag: "Keuangan Pribadi",
        desc: "Kuasai aset pribadi, pantau pengeluaran harian, dan pantau target keuangan impian secara terarah.",
      },
      umkm: {
        title: "Pemilik Bisnis UMKM & Agensi",
        tag: "Bisnis & Usaha",
        desc: "Pantau piutang klien, kas kecil operasional, biaya logistik, dan tagihan vendor dalam satu layar.",
      },
      corp: {
        title: "Staf Akuntansi & Direksi PT",
        tag: "Korporat & Entitas",
        desc: "Buku besar ganda lengkap, pemisahan entitas dengan RBAC, rekonsiliasi bank, dan audit trail siap ekspor.",
      },
    },
    faq: {
      badge: "PERTANYAAN UMUM",
      title: "Segala Hal yang Perlu Diketahui",
      subtitle: "Punya pertanyaan seputar keamanan atau penggunaan? Temukan jawabannya di bawah ini.",
    },
    cta: {
      title: "Kuasai Manajemen Keuangan Anda Hari Ini.",
      desc: "Bergabung bersama ribuan profesional, pelaku UMKM, dan tim keuangan yang mempercayakan pencatatan mereka pada NovaFinance.",
      button: "Buat Akun Gratis Sekarang",
      subtext: "Tier gratis selamanya • Tanpa kartu kredit • Siap digunakan dalam 60 detik",
    },
    footer: {
      rights: "NovaFinance Inc. Hak cipta dilindungi undang-undang.",
      tagline: "Sistem Operasi Finansial & Pembukuan Modern untuk Pengambil Keputusan Terdepan.",
      statusText: "Semua Layanan Operasional • API v1.2",
      securityBadge: "Siap Standar SOC-2 • Enkripsi TLS 256-bit • Diproteksi BetterAuth",
      newsletterTitle: "Berlangganan Wawasan Finansial",
      newsletterDesc: "Bergabung bersama 12.000+ founder mendapatkan kurasi mingguan seputar optimasi arus kas & akuntansi AI.",
      subscribePlaceholder: "Ketik alamat email Anda...",
      subscribeBtn: "Langganan",
      colPlatform: "Platform",
      colAi: "AI & Intelijen",
      colGovernance: "Tata Kelola & RBAC",
      colDevelopers: "Developer",
      colLegal: "Legal & Keamanan",
      privacy: "Kebijakan Privasi",
      terms: "Ketentuan Layanan",
      security: "Keterbukaan Keamanan",
      madeWith: "Dibangun dengan Next.js 16, Turbopack, dan Elysia.",
    },
  },
};

// Global market indices
const GLOBAL_INDICES = [
  { symbol: "COMPOSITE", name: "IHSG (IDX)", price: "7,345.82", change: "+0.84%", up: true, isDefault: true, flag: "🇮🇩" },
  { symbol: "SPX", name: "S&P 500", price: "5,815.20", change: "+0.45%", up: true, flag: "🇺🇸" },
  { symbol: "IXIC", name: "NASDAQ", price: "18,371.40", change: "+0.68%", up: true, flag: "🇺🇸" },
  { symbol: "N225", name: "Nikkei 225", price: "39,180.30", change: "+1.12%", up: true, flag: "🇯🇵" },
  { symbol: "HSI", name: "Hang Seng", price: "20,638.70", change: "-0.32%", up: false, flag: "🇭🇰" },
  { symbol: "XAU", name: "Gold (USD/oz)", price: "$2,684.10", change: "+0.38%", up: true, flag: "🪙" },
  { symbol: "BTC", name: "Bitcoin", price: "$68,450.00", change: "+2.15%", up: true, flag: "⚡" },
];

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Language>("en");

  // Active showcase tab
  const [activeShowcase, setActiveShowcase] = useState<"dashboard" | "moneyflow" | "portfolio" | "ai">("dashboard");

  // Active 5W2H item
  const [active5W2H, setActive5W2H] = useState<number>(0);

  // Active FAQ accordion item
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Supernova overlay replay control
  const [replaySupernova, setReplaySupernova] = useState(false);

  useEffect(() => {
    const handleReplay = () => setReplaySupernova(true);
    window.addEventListener("novafinance_trigger_supernova", handleReplay);
    return () => window.removeEventListener("novafinance_trigger_supernova", handleReplay);
  }, []);

  // GSAP animation refs
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroPreviewRef = useRef<HTMLDivElement>(null);
  const dotsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll section refs
  const problemSectionRef = useRef<HTMLElement>(null);
  const aiSectionRef = useRef<HTMLElement>(null);
  const frameworkSectionRef = useRef<HTMLElement>(null);
  const showcaseSectionRef = useRef<HTMLElement>(null);
  const bentoSectionRef = useRef<HTMLElement>(null);
  const personasSectionRef = useRef<HTMLElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);
  const footerCanvasRef = useRef<HTMLCanvasElement>(null);

  // Read language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem("novajournal_lang") as Language | null;
    if (savedLang === "en" || savedLang === "id") {
      setLang(savedLang);
    }
  }, []);

  const switchLanguage = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("novajournal_lang", newLang);
  };

  const t = useMemo(() => DICT[lang], [lang]);

  // GSAP Entrance & ScrollTrigger Animations
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context((self) => {
      // 1. Floating Dots Animation
      if (dotsContainerRef.current) {
        const dots = dotsContainerRef.current.querySelectorAll(".drifting-dot");
        dots.forEach((dot, idx) => {
          gsap.to(dot, {
            x: (idx % 2 === 0 ? 1 : -1) * (15 + (idx % 4) * 8),
            y: (idx % 3 === 0 ? -1 : 1) * (12 + (idx % 5) * 6),
            duration: 5 + (idx % 5) * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: (idx % 6) * 0.3,
          });
        });
      }

      // 2. Hero Content Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        heroBadgeRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, delay: 0.1 }
      )
        .fromTo(
          heroTitleRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8 },
          "-=0.4"
        )
        .fromTo(
          heroDescRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          heroCtaRef.current,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        )
        .fromTo(
          heroPreviewRef.current,
          { opacity: 0, y: 35, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power4.out" },
          "-=0.3"
        );

      // 3. ScrollTrigger Reveals for Major Sections
      const revealSections = [
        problemSectionRef.current,
        aiSectionRef.current,
        frameworkSectionRef.current,
        showcaseSectionRef.current,
        bentoSectionRef.current,
        personasSectionRef.current,
        faqSectionRef.current,
      ];

      revealSections.forEach((section) => {
        if (!section) return;
        gsap.fromTo(
          section,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // 4. GSAP Floating Loops on Badges & Highlight Cards
      gsap.to(".floating-loop", {
        y: -7,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.25,
      });

      // 5. Footer Fluid Cosmic Wave Animation (Canvas)
      const canvas = footerCanvasRef.current;
      if (canvas) {
        const ctx2 = canvas.getContext("2d");
        let animId: number;
        let w = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
        let h = (canvas.height = canvas.parentElement?.clientHeight || 500);

        const onResize = () => {
          if (!canvas) return;
          w = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
          h = canvas.height = canvas.parentElement?.clientHeight || 500;
        };
        window.addEventListener("resize", onResize);

        let step = 0;
        const renderWave = () => {
          if (!ctx2) return;
          step += 0.015;
          ctx2.clearRect(0, 0, w, h);

          // 3 Cosmic wave layers: indigo, purple, blue with ethereal blending
          const waves = [
            { y: h * 0.60, length: 0.0032, amp: 26, speed: 0.02, color: "rgba(99, 102, 241, 0.24)" },
            { y: h * 0.70, length: 0.0042, amp: 20, speed: 0.014, color: "rgba(168, 85, 247, 0.22)" },
            { y: h * 0.80, length: 0.0028, amp: 32, speed: 0.01, color: "rgba(59, 130, 246, 0.20)" },
          ];

          waves.forEach((wave, idx) => {
            ctx2.beginPath();
            ctx2.moveTo(0, h);
            for (let x = 0; x <= w; x += 8) {
              const y = wave.y + Math.sin(x * wave.length + step * (idx + 1) * 0.8) * wave.amp + Math.cos(x * 0.002 + step * 0.5) * (wave.amp * 0.4);
              ctx2.lineTo(x, y);
            }
            ctx2.lineTo(w, h);
            ctx2.closePath();
            ctx2.fillStyle = wave.color;
            ctx2.fill();
          });

          animId = requestAnimationFrame(renderWave);
        };

        renderWave();

        self.add(() => {
          window.removeEventListener("resize", onResize);
          cancelAnimationFrame(animId);
        });
      }
    });

    return () => ctx.revert();
  }, [mounted]);

  // Interactive 3D Card Tilt Effect on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroPreviewRef.current) return;
    const card = heroPreviewRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!heroPreviewRef.current) return;
    gsap.to(heroPreviewRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  return (
    <div className="min-h-screen bg-default-50/70 dark:bg-gray-950 text-foreground selection:bg-blue-500/20 selection:text-blue-500 font-sans antialiased overflow-x-hidden">
      {/* 0. Supernova Fluid Preloader Overlay with Celestial Audio */}
      <NovaSupernovaOverlay
        forceShow={replaySupernova}
        onComplete={() => setReplaySupernova(false)}
      />

      {/* -------------------------------------------------------- */}
      {/* 1. TOP RUNNING TICKER (IHSG Default + Global Indices)     */}
      {/* -------------------------------------------------------- */}
      <div className="w-full bg-default-100/90 dark:bg-gray-900/90 border-b border-default-200/60 dark:border-default-800/60 py-1.5 px-3 overflow-hidden text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-default-300 dark:border-default-700 font-semibold text-[11px] text-default-600 dark:text-default-400">
            <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
            <span className="tracking-wider">{t.ticker.label}</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-[11px]">
            {GLOBAL_INDICES.map((idx) => (
              <div key={idx.symbol} className="inline-flex items-center gap-1.5 shrink-0">
                <span className="text-xs">{idx.flag}</span>
                <span className="font-semibold text-foreground">{idx.name}</span>
                <span className="font-mono text-default-600 dark:text-default-400">{idx.price}</span>
                <span className={`font-mono font-medium ${idx.up ? "text-emerald-500" : "text-rose-500"}`}>
                  {idx.change}
                </span>
                {idx.isDefault && (
                  <span className="text-[9px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.2 rounded-sm tracking-wide">
                    {t.ticker.defaultBadge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------- */}
      {/* 2. NAVBAR (Session-Aware, Identical Dashboard Logo, i18n) */}
      {/* -------------------------------------------------------- */}
      <header className="sticky top-0 z-50 w-full border-b border-default-200/60 dark:border-default-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          {/* Logo matching /dashboard */}
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <div className="w-6.5 h-6.5 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              NovaFinance
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-default-600 dark:text-default-400">
            <a href="#problem-solved" className="hover:text-foreground transition-colors">
              {t.nav.problem}
            </a>
            <a href="#ai-engine" className="hover:text-foreground transition-colors">
              {t.nav.architecture}
            </a>
            <a href="#framework-5w2h" className="hover:text-foreground transition-colors">
              {t.nav.framework}
            </a>
            <a href="#showcase" className="hover:text-foreground transition-colors">
              {t.nav.showcase}
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              {t.nav.features}
            </a>
            <a href="#solutions" className="hover:text-foreground transition-colors">
              {t.nav.personas}
            </a>
            <a href="#faq" className="hover:text-foreground transition-colors">
              {t.nav.faq}
            </a>
          </nav>

          {/* Right Action Controls: Language Toggle, Theme, Session-Aware Button */}
          <div className="flex items-center gap-2.5">
            {/* Navbar Supernova Replay Button */}
            <button
              type="button"
              onClick={() => setReplaySupernova(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Putar ulang intro animasi Supernova"
            >
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>{t.nav.supernovaBtn}</span>
            </button>

            {/* Language Selector (EN / ID) */}
            <div className="flex items-center bg-default-100 dark:bg-default-900 p-0.5 rounded-lg border border-default-200/80 dark:border-default-800/80 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => switchLanguage("en")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => switchLanguage("id")}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  lang === "id"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                ID
              </button>
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <button
                type="button"
                aria-label="Toggle Theme"
                onClick={() => {
                  const nextTheme = theme === "dark" ? "light" : "dark";
                  playNovaThemeSound(nextTheme === "dark");
                  setTheme(nextTheme);
                }}
                className="w-8 h-8 rounded-lg bg-default-100 hover:bg-default-200 dark:bg-default-800 dark:hover:bg-default-700 text-default-700 dark:text-default-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
              </button>
            )}

            {/* Session Aware Auth Buttons */}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white text-xs font-semibold shadow-xs transition-opacity"
              >
                <span>{t.nav.openDashboard}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-medium text-default-700 dark:text-default-300 hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>{t.nav.getStarted}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------- */}
      {/* 3. HERO SECTION                                          */}
      {/* Semi-Square Mesh Background + Drifting Floating Dots +   */}
      {/* Colorless Backdrop + Technical Micro Corner Accents       */}
      {/* -------------------------------------------------------- */}
      <section ref={heroContainerRef} className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Ambient Fluid Backdrop Animation */}
        <SectionFluidBackdrop palette="cosmic" />

        {/* Circular Orbital Star Trails (Hero Section Flanks) */}
        <HeroCircularStarTrails />

        {/* Semi-Square Mesh Container with Fading Edges */}
        <div className="absolute inset-0 max-w-6xl mx-auto pointer-events-none px-4">
          <div className="relative w-full h-full rounded-[2.5rem] border border-default-200/50 dark:border-default-800/50 bg-white/40 dark:bg-gray-900/30 backdrop-blur-md overflow-hidden [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_60%,transparent_100%)]">
            {/* Mesh Gradient Layer */}
            <div className="absolute inset-0 bg-linear-to-tr from-blue-500/10 via-purple-500/5 to-transparent dark:from-blue-600/15 dark:via-purple-600/10 opacity-70" />

            {/* Technical Perimeter Crosshairs & Tick Accents */}
            <span className="absolute top-4 left-4 text-[10px] font-mono text-default-400 select-none">+ [SYS_01]</span>
            <span className="absolute top-4 right-4 text-[10px] font-mono text-default-400 select-none">[REV_2.4] +</span>
            <span className="absolute bottom-4 left-4 text-[10px] font-mono text-default-400 select-none">+ [LEDGER]</span>
            <span className="absolute bottom-4 right-4 text-[10px] font-mono text-default-400 select-none">[SECURE] +</span>

            {/* Drifting Floating Dots Matrix */}
            <div ref={dotsContainerRef} className="absolute inset-0">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="drifting-dot absolute rounded-full"
                  style={{
                    width: `${3 + (i % 4) * 2}px`,
                    height: `${3 + (i % 4) * 2}px`,
                    top: `${8 + (i * 13) % 84}%`,
                    left: `${5 + (i * 17) % 90}%`,
                    backgroundColor: i % 2 === 0 ? "#3b82f6" : "#a855f7",
                    opacity: 0.18 + (i % 3) * 0.08,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Hero Pill Badge + Supernova Replay */}
          {/* Hero Pill Badge */}
          <div ref={heroBadgeRef} className="floating-loop inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-xs mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.hero.badge}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>

          {/* Main Hero Headline */}
          <h1
            ref={heroTitleRef}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]"
          >
            {t.hero.title1}{" "}
            <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>{" "}
            {t.hero.title2}
          </h1>

          {/* Hero Subtitle */}
          <p
            ref={heroDescRef}
            className="mt-6 text-sm sm:text-base text-default-600 dark:text-default-400 max-w-2xl mx-auto leading-relaxed"
          >
            {t.hero.desc}
          </p>

          {/* Hero CTA Buttons */}
          <div ref={heroCtaRef} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md sm:max-w-2xl mx-auto">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto h-11 px-7 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>{isAuthenticated ? t.nav.openDashboard : t.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#showcase"
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-default-300 dark:border-default-700 bg-white/70 dark:bg-gray-900/70 hover:bg-default-100 dark:hover:bg-default-800 text-foreground text-xs sm:text-sm font-semibold backdrop-blur-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Compass className="w-4 h-4 text-blue-500" />
              <span>{t.hero.ctaSecondary}</span>
            </a>
          </div>

          {/* Micro Status Bar */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-default-500">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.hero.stats.uptime}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
              <span>{t.hero.stats.providers}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>{t.hero.stats.latency}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.hero.stats.encryption}</span>
            </div>
          </div>

          {/* Interactive 3D Tilt Dashboard Preview Card */}
          <div
            ref={heroPreviewRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="mt-14 max-w-5xl mx-auto rounded-3xl border border-default-200/80 dark:border-default-800/80 bg-white/90 dark:bg-gray-900/90 shadow-2xl backdrop-blur-xl p-4 sm:p-6 transition-shadow duration-300"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Real Dashboard Replica Component */}
            <HeroDashboardPreview lang={lang} />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 3.5 BRUTAL SPREADSHEET VS NOVAFINANCE BATTLE ARENA        */}
      {/* -------------------------------------------------------- */}
      <section id="problem-solved" ref={problemSectionRef} className="py-24 border-t border-default-200/60 dark:border-default-800/60 relative overflow-hidden bg-default-50/50 dark:bg-gray-950/40">
        <SectionFluidBackdrop palette="rose" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <SpreadsheetVsNovaSavage />
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 4. AI INTEGRATION DEEP-DIVE (Multi-Provider Fallback)    */}
      {/* -------------------------------------------------------- */}
      <section id="ai-engine" ref={aiSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 relative overflow-hidden">
        <SectionFluidBackdrop palette="purple" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold mb-3">
              <Cpu className="w-3.5 h-3.5" />
              <span>{t.aiSection.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t.aiSection.title}
            </h2>
            <p className="mt-3 text-sm text-default-600 dark:text-default-400 leading-relaxed">
              {t.aiSection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.aiSection.providers.map((p, idx) => {
              const IconComp =
                p.id === "vision-ocr"
                  ? Receipt
                  : p.id === "cfo-copilot"
                  ? BrainCircuit
                  : p.id === "voice-tts"
                  ? Volume2
                  : Workflow;

              const iconGlow =
                p.id === "vision-ocr"
                  ? "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30"
                  : p.id === "cfo-copilot"
                  ? "from-purple-500/20 to-indigo-500/20 text-purple-500 border-purple-500/30"
                  : p.id === "voice-tts"
                  ? "from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/30"
                  : "from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/30";

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${iconGlow} border flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        {p.speed}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-semibold font-mono uppercase tracking-wider text-default-400">
                        {p.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {p.name}
                    </h3>
                    <div className="text-xs font-semibold text-default-500 mt-0.5">
                      {p.role}
                    </div>

                    <p className="text-xs text-default-600 dark:text-default-400 mt-3 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-default-100 dark:border-default-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-default-400 font-medium font-mono text-[10px]">
                      {p.capability}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[10px] border border-purple-500/20">
                      {p.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center text-xs text-default-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t.aiSection.customKeysNote}</span>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 5. 5W + 2H SYSTEMATIC FRAMEWORK SECTION                 */}
      {/* -------------------------------------------------------- */}
      <section id="framework-5w2h" ref={frameworkSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 bg-default-100/40 dark:bg-gray-900/40 relative overflow-hidden">
        <SectionFluidBackdrop palette="blue" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{t.framework5w2h.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t.framework5w2h.title}
            </h2>
            <p className="mt-3 text-sm text-default-600 dark:text-default-400 leading-relaxed">
              {t.framework5w2h.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Selector List */}
            <div className="lg:col-span-5 space-y-2">
              {t.framework5w2h.items.map((item, idx) => {
                const IconComponent = item.icon;
                const isSelected = active5W2H === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActive5W2H(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-gray-900 border-blue-500 shadow-sm"
                        : "bg-default-50/50 dark:bg-default-900/30 border-default-200 dark:border-default-800 hover:bg-white dark:hover:bg-gray-900/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-default-200 dark:bg-default-800 text-default-600 dark:text-default-400"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{item.question}</div>
                        <div className="text-[11px] text-default-500 truncate max-w-xs">{item.summary}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "rotate-90 text-blue-500" : "text-default-400"}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Detailed Inspector Panel */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-md">
              {(() => {
                const cur = t.framework5w2h.items[active5W2H];
                const IconComponent = cur.icon;
                return (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono uppercase text-blue-600 dark:text-blue-400 font-bold">
                          Framework Point • {cur.label}
                        </span>
                        <h3 className="text-xl font-extrabold text-foreground">{cur.question}</h3>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20 text-xs font-semibold text-foreground">
                      {cur.summary}
                    </div>

                    <div className="text-xs sm:text-sm text-default-600 dark:text-default-300 leading-relaxed space-y-3">
                      <p>{cur.details}</p>
                    </div>

                    <div className="pt-4 border-t border-default-200 dark:border-default-800 flex items-center justify-between text-xs">
                      <span className="text-default-400">Section {active5W2H + 1} of 7</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={active5W2H === 0}
                          onClick={() => setActive5W2H((prev) => Math.max(0, prev - 1))}
                          className="px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-800 disabled:opacity-40 cursor-pointer"
                        >
                          Prev
                        </button>
                        <button
                          type="button"
                          disabled={active5W2H === 6}
                          onClick={() => setActive5W2H((prev) => Math.min(6, prev + 1))}
                          className="px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-800 disabled:opacity-40 cursor-pointer"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 6. INTERACTIVE TAB SHOWCASE (Dashboard, Money Flow, ...) */}
      {/* -------------------------------------------------------- */}
      <section id="showcase" ref={showcaseSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 relative overflow-hidden">
        <SectionFluidBackdrop palette="cyan" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <NovaShowcaseInteractive lang={lang} />
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 7. EIGHT-PILLAR BENTO GRID                               */}
      {/* -------------------------------------------------------- */}
      <section id="features" ref={bentoSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 bg-default-100/30 dark:bg-gray-900/30 relative overflow-hidden">
        <SectionFluidBackdrop palette="emerald" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>{t.bento.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t.bento.title}
            </h2>
            <p className="mt-3 text-sm text-default-600 dark:text-default-400 leading-relaxed">
              {t.bento.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. White-label Enterprise & Multi-Tenant */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500/20 to-purple-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Crown className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "Enterprise White-Label" : "White-Label Enterprise"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "Customize corporate logo, brand header, jargon, and tier styling directly integrated into sidebar navigation."
                  : "Kustomisasi logo perusahaan, nama brand, jargon, dan tema tier langsung terintegrasi di navigasi sidebar."}
              </p>
            </div>

            {/* 2. Nova Copilot TTS & Executive Personas */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "Copilot TTS & Personas" : "Copilot TTS & Persona Eksekutif"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "Interactive audio voice briefing with specialized persona modes: CFO Advisor, Forensic Auditor, and Portfolio Analyst."
                  : "Penjelasan suara audio interaktif dengan mode persona spesifik: Penasihat CFO, Auditor Forensik, dan Analis Portofolio."}
              </p>
            </div>

            {/* 3. Precision UI Density & Typography */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "Precision UI Density & 6 Fonts" : "Kepadatan UI & 6 Pilihan Font"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "Customize exact pixel sizing (custom width & height) and select across 6 typography families (Geist, Inter, Plus Jakarta Sans, etc)."
                  : "Atur ukuran pixel presisi (custom W & H) serta pilih dari 6 tipografi modern (Geist, Inter, Plus Jakarta Sans, Outfit, dll)."}
              </p>
            </div>

            {/* 4. Multi-Currency Regional Hub */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "Multi-Currency Valas Hub" : "Hub Valas Multi-Mata Uang"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "Seamless support for IDR, USD, EUR, JPY, GBP, SGD, and AUD with automatic cross-currency net worth conversion."
                  : "Dukungan penuh IDR, USD, EUR, JPY, GBP, SGD, dan AUD dengan kalkulasi konversi kekayaan bersih otomatis."}
              </p>
            </div>

            {/* 5. TanStack Table v8 Engine */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "TanStack Table v8 Engine" : "Mesin Tabel TanStack v8"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "Supercharged ledger grid with multi-column sorting, fuzzy search, pagination, and real-time inline row mutations."
                  : "Tabel buku besar kilat dengan multi-column sorting, pencarian fuzzy, paginasi, dan mutasi data baris instan."}
              </p>
            </div>

            {/* 6. Double-Entry Ledger Integrity */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "Double-Entry Ledger Integrity" : "Buku Besar Berpasangan Sejati"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "Mathematical zero-drift guarantee. Every debit is strictly counterbalanced by a credit to preserve audit compliance."
                  : "Jaminan nol selisih matematis. Setiap debit terikat presisi dengan kredit demi kepatuhan audit standar akuntansi."}
              </p>
            </div>

            {/* 7. Sub-300ms Vision OCR */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "Sub-300ms AI Vision OCR" : "AI Vision OCR Sub-300ms"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "Drag-and-drop receipts or PDF invoices for sub-second multi-model AI extraction and automatic attachment."
                  : "Unggah banyak struk belanja atau faktur PDF sekaligus untuk ekstraksi AI instan dan pencatatan otomatis."}
              </p>
            </div>

            {/* 8. Zero-Trust Privacy Vault */}
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 hover:border-blue-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                {lang === "en" ? "Zero-Trust Privacy Vault" : "Brankas Privasi Zero-Trust"}
              </h3>
              <p className="text-xs text-default-500 leading-relaxed">
                {lang === "en"
                  ? "BetterAuth secure session cookies, localized API key overrides, and end-to-end data isolation per workspace."
                  : "Cookie sesi aman BetterAuth, perlindungan kunci API mandiri, dan isolasi data per workspace tanpa bocor."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 8. PERSONAS COMPARISON MATRIX                            */}
      {/* -------------------------------------------------------- */}
      <section id="solutions" ref={personasSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 relative overflow-hidden">
        <SectionFluidBackdrop palette="amber" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
              <Users className="w-3.5 h-3.5" />
              <span>{t.personas.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t.personas.title}
            </h2>
            <p className="mt-3 text-sm text-default-600 dark:text-default-400 leading-relaxed">
              {t.personas.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solo */}
            <div className="p-6 rounded-2xl border border-default-200 dark:border-default-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                  {t.personas.solo.tag}
                </span>
                <h3 className="text-lg font-bold text-foreground">{t.personas.solo.title}</h3>
                <p className="text-xs text-default-500 leading-relaxed">{t.personas.solo.desc}</p>
                <div className="pt-4 border-t border-default-100 dark:border-default-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Unlimited daily expense & income logging</span>
                  </div>
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>IHSG stock & gold portfolio tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Emergency fund & wishlists meter</span>
                  </div>
                </div>
              </div>
              <Link
                href="/register"
                className="mt-6 w-full h-9 rounded-xl border border-default-300 dark:border-default-700 hover:border-blue-500 text-xs font-semibold flex items-center justify-center transition-colors"
              >
                Start Solo
              </Link>
            </div>

            {/* UMKM */}
            <div className="p-6 rounded-2xl border-2 border-blue-500/80 bg-white dark:bg-gray-900 shadow-xl relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                  {t.personas.umkm.tag}
                </span>
                <h3 className="text-lg font-bold text-foreground">{t.personas.umkm.title}</h3>
                <p className="text-xs text-default-500 leading-relaxed">{t.personas.umkm.desc}</p>
                <div className="pt-4 border-t border-default-100 dark:border-default-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Separate bank & digital wallet accounts</span>
                  </div>
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Sub-second Groq AI OCR receipt scanning</span>
                  </div>
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Visual money flow topology & cash leak alerts</span>
                  </div>
                </div>
              </div>
              <Link
                href="/register"
                className="mt-6 w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
              >
                Launch UMKM Hub
              </Link>
            </div>

            {/* Enterprise PT */}
            <div className="p-6 rounded-2xl border border-default-200 dark:border-default-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  {t.personas.corp.tag}
                </span>
                <h3 className="text-lg font-bold text-foreground">{t.personas.corp.title}</h3>
                <p className="text-xs text-default-500 leading-relaxed">{t.personas.corp.desc}</p>
                <div className="pt-4 border-t border-default-100 dark:border-default-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Multi-tenant workspace isolation & RBAC</span>
                  </div>
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Double-entry ledger & audit export (Excel/PDF)</span>
                  </div>
                  <div className="flex items-center gap-2 text-default-700 dark:text-default-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Deep Gemini 2.5 Pro multi-page statement audit</span>
                  </div>
                </div>
              </div>
              <Link
                href="/register"
                className="mt-6 w-full h-9 rounded-xl border border-default-300 dark:border-default-700 hover:border-blue-500 text-xs font-semibold flex items-center justify-center transition-colors"
              >
                Deploy Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 9. INTERACTIVE FAQ ACCORDION                              */}
      {/* -------------------------------------------------------- */}
      <section id="faq" ref={faqSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 bg-default-100/30 dark:bg-gray-900/30 relative overflow-hidden">
        <SectionFluidBackdrop palette="blue" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.faq.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t.faq.title}
            </h2>
            <p className="mt-3 text-sm text-default-600 dark:text-default-400">
              {t.faq.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Bagaimana cara kerja fallback Multi-Provider AI (Groq, Gemini, DeepSeek, Claude)?",
                q_en: "How does the Multi-Provider AI fallback architecture work?",
                a: "NovaFinance memprioritaskan Groq (Llama 3.3) untuk ekstraksi OCR berkecepatan tinggi (<300ms). Jika kuota atau server provider sedang bermasalah, request secara instan dialihkan ke Gemini 2.5 Pro, DeepSeek R1, atau Claude 3.5 Sonnet tanpa menghentikan workflow Anda. Anda juga bisa menyetel custom API keys di menu Settings.",
                a_en: "NovaFinance routes receipt OCR to Groq (Llama 3.3) for ultra-low latency (<300ms). If a provider limit is reached, it seamlessly falls back to Gemini 2.5 Pro, DeepSeek R1, or Claude 3.5 Sonnet with zero downtime.",
              },
              {
                q: "Apakah data keuangan saya aman dan terenkripsi?",
                q_en: "Is my financial data secure and encrypted?",
                a: "Sangat aman. Seluruh data dilindungi enkripsi TLS 1.3 256-bit baik saat transit maupun at-rest. Cookie sesi dilindungi HttpOnly Secure flag melalui BetterAuth, dan data antar-workspace diisolasi secara ketat.",
                a_en: "Absolutely. All transactions are protected via TLS 1.3 256-bit encryption in-flight and at-rest. Session tokens use HttpOnly secure cookies, and workspaces are strictly isolated.",
              },
              {
                q: "Apakah NovaFinance mendukung bursa saham Indonesia (IHSG)?",
                q_en: "Does NovaFinance natively support Indonesian stocks (IHSG)?",
                a: "Ya! IHSG (IDX Composite) adalah indeks default NovaFinance. Anda dapat mencatat dan memantau emiten bursa (seperti BBCA, BBRI, TLKM, ANTM) lengkap dengan kalkulator rebalancing portofolio dan proyeksi Monte Carlo.",
                a_en: "Yes! The IDX Composite (IHSG) is the default benchmark. You can track all IDX equities (BBCA, BBRI, ANTM, etc.) with automated rebalancing and Monte Carlo projection models.",
              },
              {
                q: "Bisakah saya memisahkan keuangan pribadi dan perusahaan?",
                q_en: "Can I separate personal finance and multiple corporate entities?",
                a: "Bisa, dengan fitur Multi-Tenant Workspaces. Anda dapat membuat workspace tersendiri untuk dompet pribadi, UMKM, maupun PT, masing-masing dengan mata uang, kategori, dan anggota tim independen.",
                a_en: "Yes, via Multi-Tenant Workspaces. Switch between personal family budgets, UMKM operations, and PT corporate ledgers with isolated roles, currencies, and wallets.",
              },
              {
                q: "Apakah saya bisa mengekspor laporan untuk keperluan pajak?",
                q_en: "Can I export reports for annual tax filing and audits?",
                a: "Tentu saja. NovaFinance menyediakan fitur ekspor satu-klik ke file Excel (.xlsx) dan PDF yang sudah terstruktur dengan format buku besar akuntansi standar.",
                a_en: "Yes. NovaFinance provides instant one-click exports to structured Excel workbooks (.xlsx) and clean PDF reports ready for accountants and tax filing.",
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {lang === "en" ? faq.q_en : faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-default-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-blue-500" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-default-600 dark:text-default-400 leading-relaxed border-t border-default-100 dark:border-default-800/60 mt-1">
                      <p className="pt-3">{lang === "en" ? faq.a_en : faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 10. HIGH CONVERTING CTA BANNER                           */}
      {/* -------------------------------------------------------- */}
      {/* -------------------------------------------------------- */}
      {/* 10. HIGH CONVERTING CTA BANNER                           */}
      {/* -------------------------------------------------------- */}
      <section className="py-20 border-t border-default-200/60 dark:border-default-800/60 relative overflow-hidden">
        <SectionFluidBackdrop palette="cosmic" />
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t.cta.title}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-default-600 dark:text-default-400 max-w-xl mx-auto leading-relaxed">
            {t.cta.desc}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? t.nav.openDashboard : t.cta.button}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="mt-4 text-xs text-default-400">
            {t.cta.subtext}
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 11. ENTERPRISE DETAILED FOOTER                           */}
      {/* -------------------------------------------------------- */}
      <footer className="relative overflow-hidden border-t border-gray-200 dark:border-gray-800/80 bg-white dark:bg-[#030712] text-gray-600 dark:text-gray-400 text-xs transition-colors">
        <SectionFluidBackdrop palette="purple" />
        {/* GSAP Fluid Cosmic Wave Canvas */}
        <canvas
          ref={footerCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-50 dark:opacity-40"
        />
        {/* Subtle Contrast Overlay for 100% Crisp Legibility */}
        <div className="absolute inset-0 bg-white/75 dark:bg-[#030712]/75 backdrop-blur-[1.5px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
          
          {/* Top Newsletter & System Status Strip */}
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                  {t.footer.statusText}
                </span>
                <span className="text-gray-300 dark:text-gray-700">•</span>
                <span className="text-[11px] text-gray-500 font-medium">
                  {t.footer.securityBadge}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                {t.footer.newsletterTitle}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.footer.newsletterDesc}
              </p>
            </div>

            {/* Newsletter Input Box */}
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to NovaFinance Financial Intelligence!"); }} className="flex items-center gap-2 w-full lg:w-auto">
              <input
                type="email"
                required
                placeholder={t.footer.subscribePlaceholder}
                className="h-10 px-3.5 w-full sm:w-64 text-xs rounded-xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-2xs"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{t.footer.subscribeBtn}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* 5-Column Navigation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-xs">
            {/* Brand Column (2 Cols wide on desktop) */}
            <div className="col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xs text-white">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-base font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                  NovaFinance
                </span>
              </Link>

              <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                {t.footer.tagline}
              </p>

              {/* Status and Security Badges */}
              <div className="space-y-2 pt-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-[11px] font-mono text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>NovaFinance Core v1.2</span>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                  <span className="text-blue-600 dark:text-blue-400">Elysia on Bun</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Bank-Grade 256-Bit TLS Encryption</span>
                </div>
              </div>
            </div>

            {/* Column 1: Platform */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                {t.footer.colPlatform}
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-white transition-colors">Executive Dashboard</Link></li>
                <li><Link href="/transactions" className="hover:text-blue-600 dark:hover:text-white transition-colors">Transaction Ledgers</Link></li>
                <li><Link href="/transactions/new" className="hover:text-blue-600 dark:hover:text-white transition-colors">Smart AI Entry</Link></li>
                <li><Link href="/wallets" className="hover:text-blue-600 dark:hover:text-white transition-colors">Master Wallets</Link></li>
                <li><Link href="/workspaces" className="hover:text-blue-600 dark:hover:text-white transition-colors">Multi-Workspace</Link></li>
              </ul>
            </div>

            {/* Column 2: AI & Intelligence */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                {t.footer.colAi}
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="#ai-engine" className="hover:text-blue-600 dark:hover:text-white transition-colors">Gemini OCR Scanner</a></li>
                <li><a href="#ai-engine" className="hover:text-blue-600 dark:hover:text-white transition-colors">Groq Speed Inference</a></li>
                <li><a href="#ai-engine" className="hover:text-blue-600 dark:hover:text-white transition-colors">DeepSeek Reasoning</a></li>
                <li><a href="#ai-engine" className="hover:text-blue-600 dark:hover:text-white transition-colors">Claude Advisory</a></li>
                <li><Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-white transition-colors">Financial Health Audit</Link></li>
              </ul>
            </div>

            {/* Column 3: Governance & Controls */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                {t.footer.colGovernance}
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="/users" className="hover:text-blue-600 dark:hover:text-white transition-colors">Roles & RBAC Matrix</Link></li>
                <li><Link href="/money-flow" className="hover:text-blue-600 dark:hover:text-white transition-colors">Money Flow Sankey</Link></li>
                <li><Link href="/portfolio" className="hover:text-blue-600 dark:hover:text-white transition-colors">Investment Portfolio</Link></li>
                <li><Link href="/goals" className="hover:text-blue-600 dark:hover:text-white transition-colors">Goals & Wishlist</Link></li>
                <li><Link href="/analytics" className="hover:text-blue-600 dark:hover:text-white transition-colors">Financial Analytics</Link></li>
              </ul>
            </div>

            {/* Column 4: Developers */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                {t.footer.colDevelopers}
              </h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><a href="http://localhost:8080/swagger" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-white transition-colors flex items-center gap-1">Swagger OpenAPI <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="http://localhost:8080/swagger/json" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-white transition-colors">OpenAPI JSON Spec</a></li>
                <li><a href="http://localhost:8080/health" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-white transition-colors">System Health API</a></li>
                <li><span className="text-gray-400 dark:text-gray-600 select-none">MCP Protocol v1.0</span></li>
                <li><Link href="/settings" className="hover:text-blue-600 dark:hover:text-white transition-colors">API Keys Hub</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Divider Bar */}
          <div className="pt-8 border-t border-gray-200/80 dark:border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span>© 2026 {t.footer.rights}</span>
              <span>•</span>
              <span className="text-gray-400 dark:text-gray-600">{t.footer.madeWith}</span>
            </div>

            {/* Privacy & Legal Links */}
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.footer.privacy}</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.footer.terms}</Link>
              <span>•</span>
              <Link href="/security-disclosure" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t.footer.security}</Link>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
