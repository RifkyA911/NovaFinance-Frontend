/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@heroui/react";
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
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "@/contexts/AuthContext";

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
      features: "Features",
      architecture: "AI Engine",
      framework: "5W + 2H",
      showcase: "Showcase",
      personas: "Solutions",
      faq: "FAQ",
      signIn: "Sign In",
      getStarted: "Get Started Free",
      openDashboard: "Open Dashboard",
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
        providers: "4 AI Engine Fallbacks",
        latency: "<300ms OCR Response",
        encryption: "Bank-Grade TLS 1.3",
      },
    },
    ticker: {
      label: "LIVE GLOBAL INDICES",
      defaultBadge: "DEFAULT",
    },
    aiSection: {
      badge: "MULTI-PROVIDER AI ARCHITECTURE",
      title: "Intelligent Multi-Model Financial Orchestration",
      subtitle: "Never rely on a single AI provider. NovaJournal automatically routes your receipts, financial audits, and investment reasoning to specialized leading models with fail-safe zero-downtime failover.",
      providers: [
        {
          name: "Groq (Llama 3.3 70B)",
          role: "Ultra-Fast OCR & Real-time Tagging",
          speed: "Sub-300ms",
          desc: "Instant text extraction from receipt photos, invoice snapshots, and automatic categorization before you can even switch tabs.",
          tag: "Speed Optimized",
          gradient: "from-orange-500 to-amber-600",
        },
        {
          name: "Google Gemini 2.5 Pro",
          role: "Multimodal Ledger Auditing",
          speed: "Complex Reasoning",
          desc: "Deep analysis across multi-page bank statements, reconciliation discrepancies, and multi-currency exchange rate verifications.",
          tag: "Multimodal Lead",
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          name: "DeepSeek R1",
          role: "Chain-of-Thought Budget Reasoning",
          speed: "Mathematical Precision",
          desc: "Rigorous step-by-step mathematical logic for discovering cash leaks, optimizing business runways, and portfolio rebalancing.",
          tag: "Deep Reasoning",
          gradient: "from-purple-500 to-indigo-600",
        },
        {
          name: "Anthropic Claude 3.5 Sonnet",
          role: "Executive Advisory & Natural Reporting",
          speed: "Executive Tone",
          desc: "Generates clear, human-like executive summaries for board meetings, tax planning narratives, and personalized budgeting advice.",
          tag: "Conversational Master",
          gradient: "from-rose-500 to-pink-600",
        },
      ],
      customKeysNote: "Configure your primary and fallback API keys directly in Settings or use workspace defaults.",
    },
    framework5w2h: {
      badge: "SYSTEMATIC 5W + 2H FRAMEWORK",
      title: "Everything You Need to Know About NovaJournal",
      subtitle: "A rigorous, transparent breakdown of our purpose, architecture, timeline, and value proposition.",
      items: [
        {
          question: "WHAT is NovaJournal?",
          label: "What",
          icon: BrainCircuit,
          summary: "A unified double-entry ledger platform combining multi-tenant business accounting, global investment portfolios, and intelligent multi-model AI.",
          details: "Unlike simple expense-trackers that lose history or bulky enterprise ERPs that cost thousands, NovaJournal bridges personal finance and business bookkeeping into one modern reactive system.",
        },
        {
          question: "WHY do you need it?",
          label: "Why",
          icon: Lightbulb,
          summary: "Spreadsheets break, banking apps are isolated, and financial blind spots cause irreversible business cash crunches.",
          details: "NovaJournal gives you real-time visibility over every rupiah and dollar, visual money flow paths, and automated receipt OCR so you never miss a tax write-off or duplicate expense.",
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
          details: "Starting early prevents financial reconciliation debt. Whether you're sorting out 5 transaction receipts or 5,000 monthly ledger rows, NovaJournal scales seamlessly.",
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
      subtitle: "Select a module below to inspect NovaJournal's live interactive workflow.",
      tabs: {
        dashboard: "1. Multi-Scale Dashboard",
        moneyflow: "2. Money Flow Topology",
        portfolio: "3. Global Portfolio & IHSG",
        ai: "4. Multi-Provider AI Copilot",
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
      desc: "Join thousands of professionals, UMKM founders, and finance teams who trust NovaJournal for audit-ready precision.",
      button: "Create Free Account Now",
      subtext: "Free forever tier • No credit card required • Instant setup in 60 seconds",
    },
    footer: {
      rights: "NovaJournal Inc. All rights reserved.",
      tagline: "The Modern Financial Architecture for Forward-Thinking Operators.",
    },
  },
  id: {
    nav: {
      features: "Fitur",
      architecture: "Mesin AI",
      framework: "5W + 2H",
      showcase: "Simulasi",
      personas: "Solusi",
      faq: "FAQ",
      signIn: "Masuk",
      getStarted: "Daftar Gratis",
      openDashboard: "Buka Dashboard",
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
        providers: "4 Provider AI Siap Pakai",
        latency: "<300ms Kecepatan OCR",
        encryption: "Enkripsi Bank-Grade TLS 1.3",
      },
    },
    ticker: {
      label: "INDEKS BURSA GLOBAL",
      defaultBadge: "DEFAULT",
    },
    aiSection: {
      badge: "ARSITEKTUR MULTI-PROVIDER AI",
      title: "Orkestrasi AI Cerdas dengan Otomatisasi Fallback",
      subtitle: "Jangan bergantung hanya pada satu AI. NovaJournal secara otomatis mendistribusikan pembacaan struk, audit pembukuan, dan analisis investasi ke model terbaik dengan proteksi anti-downtime.",
      providers: [
        {
          name: "Groq (Llama 3.3 70B)",
          role: "OCR Struk Kilat & Kategorisasi Cepat",
          speed: "Kurang dari 300ms",
          desc: "Ekstraksi teks foto struk belanja, nota warung, dan tagging instan otomatis dalam hitungan milidetik sebelum Anda sempat berpindah tab.",
          tag: "Super Cepat",
          gradient: "from-orange-500 to-amber-600",
        },
        {
          name: "Google Gemini 2.5 Pro",
          role: "Audit Rekonsiliasi & Multi-Halaman",
          speed: "Penalaran Kompleks",
          desc: "Menganalisis rekening koran bank multi-halaman PDF, mendeteksi selisih rekonsiliasi, dan verifikasi kurs multi-valas.",
          tag: "Unggul Multimodal",
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          name: "DeepSeek R1",
          role: "Logika Penalaran Anggaran Matematik",
          speed: "Presisi Tinggi",
          desc: "Langkah penalaran analitis matematis untuk mengungkap kebocoran kas, optimasi runway bisnis, dan kalkulasi rebalancing portofolio.",
          tag: "Deep Reasoning",
          gradient: "from-purple-500 to-indigo-600",
        },
        {
          name: "Anthropic Claude 3.5 Sonnet",
          role: "Nasihat Keuangan & Laporan Eksekutif",
          speed: "Bahasa Alami",
          desc: "Menyusun ringkasan eksekutif untuk rapat pemegang saham, narasi perencanaan pajak, dan rekomendasi hemat bergaya konsultan privat.",
          tag: "Master Bahasa Alami",
          gradient: "from-rose-500 to-pink-600",
        },
      ],
      customKeysNote: "Anda dapat mengatur kunci API utama dan cadangan langsung di halaman Settings atau menggunakan setelan bawaan workspace.",
    },
    framework5w2h: {
      badge: "KERANGKA KERJA SISTEMATIS 5W + 2H",
      title: "Segala Hal Tentang NovaJournal Secara Transparan",
      subtitle: "Penjelasan terstruktur mengenai fungsi, arsitektur, relevansi, dan nilai tambah bagi pengguna.",
      items: [
        {
          question: "APA itu NovaJournal? (What)",
          label: "What",
          icon: BrainCircuit,
          summary: "Platform buku besar ganda modern yang menggabungkan pembukuan UMKM/PT, portofolio investasi global, dan AI Copilot terintegrasi.",
          details: "Berbeda dari aplikasi pencatat pengeluaran biasa yang mudah hilang riwayatnya atau ERP korporat yang rumit dan mahal, NovaJournal menjembatani keuangan pribadi dan pembukuan resmi dalam satu antarmuka reaktif.",
        },
        {
          question: "MENGAPA Anda membutuhkannya? (Why)",
          label: "Why",
          icon: Lightbulb,
          summary: "Spreadsheet rawan rumus rusak, aplikasi bank terkotak-kotak, dan kebocoran dana dapat mematikan arus kas bisnis.",
          details: "NovaJournal memberi Anda pandangan menyeluruh atas setiap rupiah, visual aliran dana antar-kantong, dan OCR struk otomatis sehingga tidak ada bukti transaksi yang tercecer.",
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
      subtitle: "Pilih tab di bawah untuk melihat alur kerja interaktif NovaJournal.",
      tabs: {
        dashboard: "1. Dashboard Multi-Skala",
        moneyflow: "2. Visual Aliran Arus Kas",
        portfolio: "3. Portofolio Global & IHSG",
        ai: "4. Asisten Multi-Provider AI",
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
      desc: "Bergabung bersama ribuan profesional, pelaku UMKM, dan tim keuangan yang mempercayakan pencatatan mereka pada NovaJournal.",
      button: "Buat Akun Gratis Sekarang",
      subtext: "Tier gratis selamanya • Tanpa kartu kredit • Siap digunakan dalam 60 detik",
    },
    footer: {
      rights: "NovaJournal Inc. Hak cipta dilindungi undang-undang.",
      tagline: "Arsitektur Keuangan Modern untuk Pengambil Keputusan Terdepan.",
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

  // GSAP animation refs
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroPreviewRef = useRef<HTMLDivElement>(null);
  const dotsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll section refs
  const aiSectionRef = useRef<HTMLElement>(null);
  const frameworkSectionRef = useRef<HTMLElement>(null);
  const showcaseSectionRef = useRef<HTMLElement>(null);
  const bentoSectionRef = useRef<HTMLElement>(null);
  const personasSectionRef = useRef<HTMLElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);

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

    const ctx = gsap.context(() => {
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
              NovaJournal
            </span>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-default-600 dark:text-default-400">
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
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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
          {/* Hero Pill Badge */}
          <div ref={heroBadgeRef} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-xs mb-6">
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
          <div ref={heroCtaRef} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
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
              <Cpu className="w-3.5 h-3.5 text-blue-500" />
              <span>{t.hero.stats.providers}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
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
            className="mt-14 max-w-5xl mx-auto rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-white/85 dark:bg-gray-900/85 shadow-2xl backdrop-blur-md p-4 sm:p-6 transition-shadow duration-300"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Mock Header Window */}
            <div className="flex items-center justify-between pb-4 border-b border-default-200/60 dark:border-default-800/60">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-default-500 ml-2">novajournal.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                  ● Multi-Tenant Connected
                </span>
              </div>
            </div>

            {/* Mock Dashboard Body */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
              {/* Left Column: Metric Cards */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-default-200/60 dark:border-default-800/60 bg-default-50/50 dark:bg-default-900/40">
                    <div className="text-[11px] text-default-500">Total Net Worth</div>
                    <div className="text-base font-bold text-foreground mt-0.5">Rp 248.550.000</div>
                    <div className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +14.2% MoM
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-default-200/60 dark:border-default-800/60 bg-default-50/50 dark:bg-default-900/40">
                    <div className="text-[11px] text-default-500">Operating Cash Flow</div>
                    <div className="text-base font-bold text-foreground mt-0.5">Rp 42.180.000</div>
                    <div className="text-[10px] text-blue-500 font-semibold mt-1">Healthy Runway</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-default-200/60 dark:border-default-800/60 bg-default-50/50 dark:bg-default-900/40">
                    <div className="text-[11px] text-default-500">Stock & Gold (IHSG)</div>
                    <div className="text-base font-bold text-foreground mt-0.5">Rp 98.400.000</div>
                    <div className="text-[10px] text-emerald-500 font-semibold mt-1">+8.6% Yield</div>
                  </div>
                </div>

                {/* Simulated Chart Bars */}
                <div className="p-4 rounded-xl border border-default-200/60 dark:border-default-800/60 bg-default-50/50 dark:bg-default-900/40">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-semibold text-foreground">Cash Flow vs Budget Trajectory</div>
                    <div className="flex items-center gap-2 text-[10px] text-default-500">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Income</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Expense</span>
                    </div>
                  </div>
                  <div className="h-24 flex items-end justify-between gap-2 pt-2 px-1">
                    {[65, 40, 80, 55, 95, 70, 85, 60, 110, 75, 125, 90].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            i % 2 === 0 ? "bg-blue-500/80 hover:bg-blue-500" : "bg-purple-500/80 hover:bg-purple-500"
                          }`}
                          style={{ height: `${h}%` }}
                        />
                        <span className="text-[8px] text-default-400 font-mono">{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Live Audit Snippet */}
              <div className="md:col-span-4 p-4 rounded-xl border border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>AI Copilot Insight</span>
                    </div>
                    <span className="text-[9px] bg-blue-500/15 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono font-semibold">
                      Groq Llama 3.3
                    </span>
                  </div>
                  <p className="text-xs text-default-600 dark:text-default-300 leading-relaxed">
                    &ldquo;Receipt from BCA transfer of Rp 2.500.000 auto-categorized into <span className="font-semibold text-foreground">Operational IT Server</span>. No budget leakage detected.&rdquo;
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-[11px] text-default-500">
                  <span>Audit Trail</span>
                  <span className="text-emerald-500 font-semibold font-mono">100% Balanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 4. AI INTEGRATION DEEP-DIVE (Multi-Provider Fallback)    */}
      {/* -------------------------------------------------------- */}
      <section id="ai-engine" ref={aiSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
            {t.aiSection.providers.map((p, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400">
                      {p.tag}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-500">
                      {p.speed}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>
                  <div className="text-xs font-semibold text-default-500 mt-0.5">
                    {p.role}
                  </div>

                  <p className="text-xs text-default-600 dark:text-default-400 mt-3 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-default-100 dark:border-default-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-default-400 font-medium">Automatic Fallback</span>
                  <span className="text-blue-500 font-bold">Enabled ✓</span>
                </div>
              </div>
            ))}
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
      <section id="framework-5w2h" ref={frameworkSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 bg-default-100/40 dark:bg-gray-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
      <section id="showcase" ref={showcaseSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>{t.showcase.badge}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {t.showcase.title}
            </h2>
            <p className="mt-3 text-sm text-default-600 dark:text-default-400 leading-relaxed">
              {t.showcase.subtitle}
            </p>

            {/* Segmented Control Tabs */}
            <div className="mt-8 inline-flex p-1 rounded-xl bg-default-100 dark:bg-gray-900 border border-default-200 dark:border-default-800 max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveShowcase("dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeShowcase === "dashboard"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-default-600 dark:text-default-400 hover:text-foreground"
                }`}
              >
                {t.showcase.tabs.dashboard}
              </button>
              <button
                type="button"
                onClick={() => setActiveShowcase("moneyflow")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeShowcase === "moneyflow"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-default-600 dark:text-default-400 hover:text-foreground"
                }`}
              >
                {t.showcase.tabs.moneyflow}
              </button>
              <button
                type="button"
                onClick={() => setActiveShowcase("portfolio")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeShowcase === "portfolio"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-default-600 dark:text-default-400 hover:text-foreground"
                }`}
              >
                {t.showcase.tabs.portfolio}
              </button>
              <button
                type="button"
                onClick={() => setActiveShowcase("ai")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeShowcase === "ai"
                    ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-default-600 dark:text-default-400 hover:text-foreground"
                }`}
              >
                {t.showcase.tabs.ai}
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="p-6 sm:p-8 rounded-2xl border border-default-200 dark:border-default-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-xl">
            {activeShowcase === "dashboard" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Executive Financial Command Center</h3>
                    <p className="text-xs text-default-500">Live multi-entity balance sheets, cashflow trajectory, and quick action hubs.</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>View full dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-xs text-default-500">Total Asset Value</span>
                    <div className="text-xl font-extrabold text-foreground mt-1">Rp 312.450.000</div>
                    <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">+18.4% vs last quarter</span>
                  </div>
                  <div className="p-4 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-xs text-default-500">Active Monthly Burn Rate</span>
                    <div className="text-xl font-extrabold text-foreground mt-1">Rp 18.200.000</div>
                    <span className="text-[11px] text-blue-500 font-semibold mt-1 inline-block">Within target safety bounds</span>
                  </div>
                  <div className="p-4 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-xs text-default-500">Emergency & Warchest Runway</span>
                    <div className="text-xl font-extrabold text-foreground mt-1">17.1 Months</div>
                    <span className="text-[11px] text-emerald-500 font-semibold mt-1 inline-block">Tier-1 Capital Resilience</span>
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === "moneyflow" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Visual Topology & Fund Routing</h3>
                    <p className="text-xs text-default-500">Interactive graphical node topology mapping money transfers across all accounts.</p>
                  </div>
                  <Link
                    href="/money-flow"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Inspect money topology</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-6 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40 flex flex-col md:flex-row items-center justify-between gap-4 text-center">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 w-full md:w-auto">
                    <div className="text-xs font-bold">Revenue & Inflow</div>
                    <div className="text-sm font-mono font-bold mt-1">BCA & Mandiri Hub</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-default-400 hidden md:block" />
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 w-full md:w-auto">
                    <div className="text-xs font-bold">Internal Allocation</div>
                    <div className="text-sm font-mono font-bold mt-1">Payroll & Operational Vault</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-default-400 hidden md:block" />
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 w-full md:w-auto">
                    <div className="text-xs font-bold">Wealth Reinvestment</div>
                    <div className="text-sm font-mono font-bold mt-1">IHSG Stocks & Bullion Vault</div>
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === "portfolio" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">IHSG & Global Multi-Asset Engine</h3>
                    <p className="text-xs text-default-500">Live index tracking, Finviz heatmap integration, and Monte Carlo wealth projector.</p>
                  </div>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Open portfolio suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-[11px] text-default-500">BBCA.JK (BCA)</span>
                    <div className="text-sm font-bold text-foreground mt-0.5">Rp 10.450</div>
                    <span className="text-[10px] text-emerald-500 font-semibold">+1.46%</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-[11px] text-default-500">BBRI.JK (BRI)</span>
                    <div className="text-sm font-bold text-foreground mt-0.5">Rp 4.980</div>
                    <span className="text-[10px] text-emerald-500 font-semibold">+0.81%</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-[11px] text-default-500">ANTM.JK (Gold)</span>
                    <div className="text-sm font-bold text-foreground mt-0.5">Rp 1.620</div>
                    <span className="text-[10px] text-emerald-500 font-semibold">+2.21%</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-default-200 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-[11px] text-default-500">ASII.JK (Astra)</span>
                    <div className="text-sm font-bold text-foreground mt-0.5">Rp 5.125</div>
                    <span className="text-[10px] text-rose-500 font-semibold">-0.48%</span>
                  </div>
                </div>
              </div>
            )}

            {activeShowcase === "ai" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Live AI Copilot & Receipt Extraction</h3>
                    <p className="text-xs text-default-500">Extract unstructured paper receipts, detect tax splits, and forecast budget surplus.</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Try copilot audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">Automated Double-Entry Ledger Entry Formed</div>
                    <p className="text-xs text-default-600 dark:text-default-400">
                      Receipt parsed in 240ms via Groq Llama 3.3. Debited Operational Expense (Rp 450.000) and Credited Petty Cash Wallet with 100% verified tax calculation.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 7. EIGHT-PILLAR BENTO GRID                               */}
      {/* -------------------------------------------------------- */}
      <section id="features" ref={bentoSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 bg-default-100/30 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Multi-Tenant Workspaces</h3>
              <p className="text-xs text-default-500 leading-relaxed">Isolate personal savings, multiple UMKM stores, and holding companies with independent currencies and roles.</p>
            </div>

            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">TanStack Table v8 Engine</h3>
              <p className="text-xs text-default-500 leading-relaxed">Supercharged client table with instant multi-column sorting, fuzzy search, pagination, and inline row mutations.</p>
            </div>

            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Double-Entry Ledger Integrity</h3>
              <p className="text-xs text-default-500 leading-relaxed">Mathematical zero-drift guarantee. Every debit is strictly counterbalanced by a credit to preserve audit compliance.</p>
            </div>

            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Instant Audit Export</h3>
              <p className="text-xs text-default-500 leading-relaxed">Export professional Excel workbooks (.xlsx) and clean formatted PDF reports ready for tax accountants.</p>
            </div>

            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Smart Goals & Wishlists</h3>
              <p className="text-xs text-default-500 leading-relaxed">Interactive funding meters, target feasibility calculators, and automated emergency fund milestones.</p>
            </div>

            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Instant OCR Struk Belanja</h3>
              <p className="text-xs text-default-500 leading-relaxed">Drag-and-drop multiple paper receipts or PDF invoices for sub-second AI extraction and auto-attachment.</p>
            </div>

            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Global Indices & Heatmap</h3>
              <p className="text-xs text-default-500 leading-relaxed">Live ticker tracking IDX Composite (IHSG), S&P 500, Nikkei, and Finviz market heatmaps in real-time.</p>
            </div>

            <div className="p-5 rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Zero-Trust Privacy Vault</h3>
              <p className="text-xs text-default-500 leading-relaxed">BetterAuth secure session cookies, localized API key overrides, and end-to-end data isolation per workspace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 8. PERSONAS COMPARISON MATRIX                            */}
      {/* -------------------------------------------------------- */}
      <section id="solutions" ref={personasSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
      <section id="faq" ref={faqSectionRef} className="py-20 border-t border-default-200/60 dark:border-default-800/60 bg-default-100/30 dark:bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
                a: "NovaJournal memprioritaskan Groq (Llama 3.3) untuk ekstraksi OCR berkecepatan tinggi (<300ms). Jika kuota atau server provider sedang bermasalah, request secara instan dialihkan ke Gemini 2.5 Pro, DeepSeek R1, atau Claude 3.5 Sonnet tanpa menghentikan workflow Anda. Anda juga bisa menyetel custom API keys di menu Settings.",
                a_en: "NovaJournal routes receipt OCR to Groq (Llama 3.3) for ultra-low latency (<300ms). If a provider limit is reached, it seamlessly falls back to Gemini 2.5 Pro, DeepSeek R1, or Claude 3.5 Sonnet with zero downtime.",
              },
              {
                q: "Apakah data keuangan saya aman dan terenkripsi?",
                q_en: "Is my financial data secure and encrypted?",
                a: "Sangat aman. Seluruh data dilindungi enkripsi TLS 1.3 256-bit baik saat transit maupun at-rest. Cookie sesi dilindungi HttpOnly Secure flag melalui BetterAuth, dan data antar-workspace diisolasi secara ketat.",
                a_en: "Absolutely. All transactions are protected via TLS 1.3 256-bit encryption in-flight and at-rest. Session tokens use HttpOnly secure cookies, and workspaces are strictly isolated.",
              },
              {
                q: "Apakah NovaJournal mendukung bursa saham Indonesia (IHSG)?",
                q_en: "Does NovaJournal natively support Indonesian stocks (IHSG)?",
                a: "Ya! IHSG (IDX Composite) adalah indeks default NovaJournal. Anda dapat mencatat dan memantau emiten bursa (seperti BBCA, BBRI, TLKM, ANTM) lengkap dengan kalkulator rebalancing portofolio dan proyeksi Monte Carlo.",
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
                a: "Tentu saja. NovaJournal menyediakan fitur ekspor satu-klik ke file Excel (.xlsx) dan PDF yang sudah terstruktur dengan format buku besar akuntansi standar.",
                a_en: "Yes. NovaJournal provides instant one-click exports to structured Excel workbooks (.xlsx) and clean PDF reports ready for accountants and tax filing.",
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
      <section className="py-20 border-t border-default-200/60 dark:border-default-800/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative text-center">
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
      {/* 11. FOOTER                                               */}
      {/* -------------------------------------------------------- */}
      <footer className="border-t border-default-200/60 dark:border-default-800/60 py-10 bg-white/50 dark:bg-gray-950 text-xs text-default-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xs shrink-0">
              <Wallet className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-foreground">NovaJournal</span>
            <span className="text-default-400">• {t.footer.rights}</span>
          </div>

          <div className="text-default-400 text-[11px] text-center sm:text-right">
            {t.footer.tagline}
          </div>
        </div>
      </footer>
    </div>
  );
}
