"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  ChevronRight,
  PieChart,
  Target,
  FileSpreadsheet,
  Cpu,
  ScanLine,
  Receipt,
  FileCheck,
} from "lucide-react";

interface NovaShowcaseInteractiveProps {
  lang?: "en" | "id";
}

type ShowcaseTab = "dashboard" | "moneyflow" | "expense" | "ai";

const SHOWCASE_DICT = {
  en: {
    badge: "INTERACTIVE MODULE SIMULATION",
    title: "Designed for Velocity and Total Precision",
    subtitle: "Experience the real engine powering NovaFinance. Switch tabs to inspect our live financial architecture.",
    tabs: {
      dashboard: "1. Executive Command Center",
      moneyflow: "2. Money Flow & Fund Topology",
      expense: "3. Expense Breakdown & Budget",
      ai: "4. Autonomous Copilot & Vision",
    },
    dashboard: {
      title: "Executive Financial Command Center",
      desc: "Live multi-entity balance sheets, cashflow trajectory, and instant capital health diagnostics.",
      link: "Open full dashboard",
      netWorth: "Total Net Asset Value",
      inflow: "Monthly Inflow",
      spending: "Monthly Spending",
      savingsRate: "Savings Rate",
      chartTitle: "Operating Cashflow Trajectory",
      chartSubtitle: "Double-entry reconciled cash movement",
    },
    moneyflow: {
      title: "Visual Topology & Automated Fund Routing",
      desc: "Interactive graphical node topology mapping money transfers across all accounts, vaults, and corporate entities.",
      link: "Inspect money topology",
      nodeInflow: "Revenue & Inflow Hub",
      nodeInflowSub: "BCA · Mandiri · Stripe Gateway",
      nodeAlloc: "Operational Vault",
      nodeAllocSub: "Payroll · Cloud · Taxes",
      nodeWealth: "Warchest & Reserves",
      nodeWealthSub: "Time Deposit · High-Yield Vault",
      routedAmount: "Rp 48.500.000 Processed",
    },
    expense: {
      title: "Category Breakdown & Real-Time Budget Variance",
      desc: "Track actual spending vs allocated departmental budgets with instant threshold warnings.",
      link: "Explore budget manager",
      budgetCap: "Monthly Budget Limit: Rp 25.000.000",
      used: "Used: Rp 18.200.000 (72.8%)",
      healthLabel: "Healthy Bounds",
    },
    ai: {
      title: "Autonomous Receipt Vision & Double-Entry Scanner",
      desc: "Extract unstructured paper invoices, calculate automatic tax splits, and credit/debit matching accounts in sub-240ms.",
      link: "Try AI journal entry",
      scanTitle: "Paper Receipt OCR Processing Completed",
      scanSub: "Groq Llama 3.3 · Extracted in 218ms with 99.8% field confidence",
      debited: "DEBIT: Cloud Infrastructure Expense",
      credited: "CREDIT: BCA Corporate Debit Account",
      taxIncluded: "11% PPN Tax Auto-Categorized",
    },
  },
  id: {
    badge: "SIMULASI MODUL INTERAKTIF",
    title: "Dirancang untuk Kecepatan dan Presisi Mutlak",
    subtitle: "Rasakan keunggulan sistem operasi finansial NovaFinance. Pilih modul di bawah untuk melihat alur kerja live.",
    tabs: {
      dashboard: "1. Pusat Komando Eksekutif",
      moneyflow: "2. Topologi Visual Aliran Dana",
      expense: "3. Analisis Biaya & Anggaran",
      ai: "4. Copilot AI & Vision Scanner",
    },
    dashboard: {
      title: "Pusat Komando Finansial Eksekutif",
      desc: "Neraca multi-entitas real-time, lintasan arus kas, dan diagnostik ketahanan modal terintegrasi.",
      link: "Buka dashboard penuh",
      netWorth: "Total Nilai Aset Bersih",
      inflow: "Pemasukan Bulan Ini",
      spending: "Pengeluaran Bulan Ini",
      savingsRate: "Tingkat Tabungan",
      chartTitle: "Lintasan Arus Kas Operasional",
      chartSubtitle: "Rekonsiliasi pencatatan ganda debit & kredit",
    },
    moneyflow: {
      title: "Topologi Visual & Aliran Dana Otomatis",
      desc: "Pemetaan grafis node interaktif untuk arus transfer ke seluruh rekening, kas kecil, dan brankas bisnis.",
      link: "Periksa topologi dana",
      nodeInflow: "Hub Pendapatan & Masuk",
      nodeInflowSub: "BCA · Mandiri · Stripe Gateway",
      nodeAlloc: "Vault Operasional",
      nodeAllocSub: "Gaji Tim · Server · Pajak",
      nodeWealth: "Brankas Cadangan Dana",
      nodeWealthSub: "Deposito · Dana Darurat Bisnis",
      routedAmount: "Rp 48.500.000 Telah Terdistribusi",
    },
    expense: {
      title: "Analisis Kategori Biaya & Realisasi Anggaran",
      desc: "Pantau pengeluaran aktual vs batas anggaran departemen dengan deteksi kebocoran instan.",
      link: "Lihat rincian pengeluaran",
      budgetCap: "Batas Anggaran Bulanan: Rp 25.000.000",
      used: "Terpakai: Rp 18.200.000 (72.8%)",
      healthLabel: "Dalam Batas Aman",
    },
    ai: {
      title: "Vision OCR Struk & Pembukuan Ganda Otomatis",
      desc: "Ekstraksi struk kertas tak terstruktur, kalkulasi pajak otomatis, dan jurnal seimbang sub-240ms.",
      link: "Coba input struk AI",
      scanTitle: "Ekstraksi Vision OCR Struk Selesai",
      scanSub: "Groq Llama 3.3 · Diproses dalam 218ms dengan akurasi 99.8%",
      debited: "DEBIT: Beban Infrastruktur Server & Cloud",
      credited: "KREDIT: Rekening Operasional BCA Bisnis",
      taxIncluded: "Pajak PPN 11% Otomatis Terpisah",
    },
  },
};

export default function NovaShowcaseInteractive({ lang = "en" }: NovaShowcaseInteractiveProps) {
  const t = SHOWCASE_DICT[lang] || SHOWCASE_DICT.en;
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("dashboard");
  const [activeFlowStep, setActiveFlowStep] = useState<number>(1);

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.badge}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {t.title}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-default-600 dark:text-default-400">
          {t.subtitle}
        </p>
      </div>

      {/* Interactive Tabs Navigation (Framer Motion Segmented Control) */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1.5 rounded-2xl bg-default-100 dark:bg-gray-800/80 border border-default-200/80 dark:border-default-700/80 max-w-full overflow-x-auto gap-1">
          {(
            [
              { id: "dashboard", label: t.tabs.dashboard, icon: BarChart3 },
              { id: "moneyflow", label: t.tabs.moneyflow, icon: Layers },
              { id: "expense", label: t.tabs.expense, icon: PieChart },
              { id: "ai", label: t.tabs.ai, icon: Cpu },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-default-600 dark:text-default-400 hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeShowcaseTabBg"
                    className="absolute inset-0 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-default-200/60 dark:border-default-700/60"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Display with AnimatePresence */}
      <div className="rounded-3xl border border-default-200/80 dark:border-default-800/80 bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl shadow-2xl p-6 sm:p-8 overflow-hidden min-h-[440px]">
        <AnimatePresence mode="wait">
          {/* TAB 1: EXECUTIVE COMMAND DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">{t.dashboard.title}</h3>
                  <p className="text-xs text-default-500 mt-0.5">{t.dashboard.desc}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>{t.dashboard.link}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* 4 Mini KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/60 dark:bg-default-900/40">
                  <span className="text-[11px] text-default-500">{t.dashboard.netWorth}</span>
                  <div className="text-lg sm:text-xl font-extrabold text-foreground mt-1">Rp 312.450.000</div>
                  <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +18.4% Q3
                  </span>
                </div>
                <div className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/60 dark:bg-default-900/40">
                  <span className="text-[11px] text-default-500">{t.dashboard.inflow}</span>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">Rp 48.500.000</div>
                  <span className="text-[10px] text-emerald-500 font-semibold mt-1 inline-block">100% Reconciled</span>
                </div>
                <div className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/60 dark:bg-default-900/40">
                  <span className="text-[11px] text-default-500">{t.dashboard.spending}</span>
                  <div className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">Rp 18.200.000</div>
                  <span className="text-[10px] text-blue-500 font-semibold mt-1 inline-block">-8.2% vs budget</span>
                </div>
                <div className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/60 dark:bg-default-900/40">
                  <span className="text-[11px] text-default-500">{t.dashboard.savingsRate}</span>
                  <div className="text-lg sm:text-xl font-extrabold text-foreground mt-1">62.5%</div>
                  <span className="text-[10px] text-emerald-500 font-bold mt-1 inline-block">Optimal Resilience</span>
                </div>
              </div>

              {/* Dynamic SVG Sparkline Area Chart */}
              <div className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/40 dark:bg-default-900/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">{t.dashboard.chartTitle}</span>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold">+Rp 30.300.000 Net Runway Surplus</span>
                </div>
                <div className="h-28 w-full pt-2">
                  <svg viewBox="0 0 600 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="showcaseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
                    <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
                    <line x1="0" y1="95" x2="600" y2="95" stroke="currentColor" strokeOpacity="0.1" />

                    <path
                      d="M 0 65 C 80 58, 140 45, 220 38 C 300 32, 380 22, 460 16 C 520 12, 570 8, 600 5 L 600 95 L 0 95 Z"
                      fill="url(#showcaseAreaGrad)"
                    />
                    <path
                      d="M 0 65 C 80 58, 140 45, 220 38 C 300 32, 380 22, 460 16 C 520 12, 570 8, 600 5"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle cx="600" cy="5" r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: MONEY FLOW & TOPOLOGY */}
          {activeTab === "moneyflow" && (
            <motion.div
              key="tab-moneyflow"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">{t.moneyflow.title}</h3>
                  <p className="text-xs text-default-500 mt-0.5">{t.moneyflow.desc}</p>
                </div>
                <Link
                  href="/money-flow"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>{t.moneyflow.link}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Graphical Node Topology with Animated Stream */}
              <div className="p-6 sm:p-8 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/40 dark:bg-default-900/30">
                <div className="flex items-center justify-between text-[11px] font-mono text-default-400 mb-6">
                  <span>LIVE REVENUE PIPELINE</span>
                  <span className="text-emerald-500 font-bold font-mono">{t.moneyflow.routedAmount}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                  {/* Node 1: Inflow */}
                  <div className="p-5 rounded-2xl border-2 border-blue-500/30 bg-blue-500/10 dark:bg-blue-950/20 text-center space-y-2 relative">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white mx-auto flex items-center justify-center shadow-md shadow-blue-500/30">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-extrabold text-foreground">{t.moneyflow.nodeInflow}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t.moneyflow.nodeInflowSub}</div>
                    <div className="text-xs font-mono font-bold text-emerald-500 pt-1">+Rp 48.500.000</div>
                  </div>

                  {/* Node 2: Operational Allocation */}
                  <div className="p-5 rounded-2xl border-2 border-purple-500/30 bg-purple-500/10 dark:bg-purple-950/20 text-center space-y-2 relative">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white mx-auto flex items-center justify-center shadow-md shadow-purple-500/30">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-extrabold text-foreground">{t.moneyflow.nodeAlloc}</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t.moneyflow.nodeAllocSub}</div>
                    <div className="text-xs font-mono font-bold text-rose-500 pt-1">-Rp 18.200.000</div>
                  </div>

                  {/* Node 3: Warchest & Wealth Vault */}
                  <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 text-center space-y-2 relative">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-md shadow-emerald-500/30">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-extrabold text-foreground">{t.moneyflow.nodeWealth}</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t.moneyflow.nodeWealthSub}</div>
                    <div className="text-xs font-mono font-bold text-emerald-500 pt-1">+Rp 30.300.000 (Surplus)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: EXPENSE BREAKDOWN & BUDGET (NO IHSG!) */}
          {activeTab === "expense" && (
            <motion.div
              key="tab-expense"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">{t.expense.title}</h3>
                  <p className="text-xs text-default-500 mt-0.5">{t.expense.desc}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>{t.expense.link}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Budget Progress Meter */}
              <div className="p-5 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/40 dark:bg-default-900/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-foreground">{t.expense.budgetCap}</span>
                    <p className="text-[11px] text-default-500">{t.expense.used}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold self-start sm:self-auto">
                    {t.expense.healthLabel}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-default-200 dark:bg-default-700 overflow-hidden flex">
                  <div className="h-full bg-blue-500 w-[35%]" title="Payroll" />
                  <div className="h-full bg-purple-500 w-[25%]" title="Cloud" />
                  <div className="h-full bg-amber-500 w-[8%]" title="Marketing" />
                  <div className="h-full bg-emerald-500 w-[4.8%]" title="Operations" />
                </div>
              </div>

              {/* Departmental Allocation Mini Cards with Sparklines */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Team & Payroll", val: "Rp 8.200.000", pct: "45.0%", color: "text-blue-500", barColor: "bg-blue-500" },
                  { name: "Cloud & Security", val: "Rp 6.450.000", pct: "35.4%", color: "text-purple-500", barColor: "bg-purple-500" },
                  { name: "Growth Marketing", val: "Rp 2.150.000", pct: "11.8%", color: "text-amber-500", barColor: "bg-amber-500" },
                  { name: "Office Operations", val: "Rp 1.400.000", pct: "7.8%", color: "text-emerald-500", barColor: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.name} className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800/80 bg-default-50/50 dark:bg-default-900/40">
                    <span className="text-[11px] text-default-500 truncate block">{item.name}</span>
                    <div className="text-sm font-extrabold text-foreground mt-1">{item.val}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-[10px] font-bold ${item.color}`}>{item.pct}</span>
                      <div className="w-16 h-1 rounded-full bg-default-200 dark:bg-default-700 overflow-hidden">
                        <div className={`h-full ${item.barColor} rounded-full`} style={{ width: item.pct }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: AUTONOMOUS AI COPILOT & VISION SCANNER */}
          {activeTab === "ai" && (
            <motion.div
              key="tab-ai"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200 dark:border-default-800">
                <div>
                  <h3 className="text-xl font-extrabold text-foreground">{t.ai.title}</h3>
                  <p className="text-xs text-default-500 mt-0.5">{t.ai.desc}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>{t.ai.link}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Simulated Paper Receipt Extraction Process */}
              <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/30">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{t.ai.scanTitle}</h4>
                    <p className="text-xs text-default-500 mt-0.5">{t.ai.scanSub}</p>
                  </div>
                </div>

                {/* Double-Entry Balanced Entry Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800/80 bg-white/80 dark:bg-default-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block">{t.ai.debited}</span>
                      <span className="text-xs font-mono font-bold text-foreground">Rp 4.250.000</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800/80 bg-white/80 dark:bg-default-900/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">{t.ai.credited}</span>
                      <span className="text-xs font-mono font-bold text-foreground">Rp 4.250.000</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-default-500 pt-1 border-t border-emerald-500/20">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.ai.taxIncluded}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">100% Audit Reconciled</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
