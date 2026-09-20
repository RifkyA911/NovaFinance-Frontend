"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building2,
  Plus,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter,
  Layers,
  BarChart3,
  Clock,
  ChevronRight,
} from "lucide-react";

interface HeroDashboardPreviewProps {
  lang?: "en" | "id";
}

const PREVIEW_TEXT = {
  en: {
    workspace: "PT Nova Solusi Finansial",
    tier: "Active Enterprise",
    walletsCount: "4 Wallets Synced",
    addTx: "Add Transaction",
    exportXls: "Export (.csv)",
    totalNetBalance: "Total Net Balance",
    connectedWallets: "4 connected wallets",
    momChange: "+14.2% MoM",
    monthlyInflow: "Monthly Inflow",
    inflowSub: "Incoming this month",
    monthlySpending: "Monthly Spending",
    spendingAvg: "Avg: Rp 606.000/day",
    savingsRate: "Savings Rate",
    healthyBadge: "Healthy (≥30%)",
    netSurplus: "Net: +Rp 30.300.000",
    chartTitle: "Cashflow Trajectory vs Budget",
    chartSubtitle: "Double-entry inflow vs outflow projection",
    inflowLegend: "Inflow",
    outflowLegend: "Outflow",
    recentTransactions: "Recent Journal Entries",
    viewAllTx: "View all in ledgers",
    healthTitle: "Financial Health Auditor",
    healthStatus: "Optimal · 94/100",
    warchestRunway: "17.1 Months Runway",
    resilience: "Tier-1 Capital Resilience",
    expenseBreakdown: "Expense Breakdown",
    budgetCap: "72.8% of monthly limit",
    aiVerified: "AI Verified",
    matched: "Balanced",
  },
  id: {
    workspace: "PT Nova Solusi Finansial",
    tier: "Enterprise Aktif",
    walletsCount: "4 Dompet Terhubung",
    addTx: "Tambah Transaksi",
    exportXls: "Ekspor (.csv)",
    totalNetBalance: "Total Saldo Bersih",
    connectedWallets: "4 dompet terhubung",
    momChange: "+14.2% MoM",
    monthlyInflow: "Pemasukan Bulan Ini",
    inflowSub: "Masuk bulan ini",
    monthlySpending: "Pengeluaran Bulan Ini",
    spendingAvg: "Rata-rata: Rp 606.000/hari",
    savingsRate: "Tingkat Tabungan",
    healthyBadge: "Sehat (≥30%)",
    netSurplus: "Bersih: +Rp 30.300.000",
    chartTitle: "Lintasan Arus Kas vs Anggaran",
    chartSubtitle: "Proyeksi double-entry debit & kredit",
    inflowLegend: "Pemasukan",
    outflowLegend: "Pengeluaran",
    recentTransactions: "Entri Jurnal Terbaru",
    viewAllTx: "Lihat semua buku",
    healthTitle: "Audit Kesehatan Finansial",
    healthStatus: "Optimal · 94/100",
    warchestRunway: "17.1 Bulan Runway",
    resilience: "Ketahanan Modal Tier-1",
    expenseBreakdown: "Rincian Pengeluaran",
    budgetCap: "72.8% dari limit anggaran",
    aiVerified: "Terverifikasi AI",
    matched: "Seimbang",
  },
};

const MOCK_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const INFLOW_DATA = [28, 32, 36, 34, 40, 42, 45, 43, 47, 46, 50, 48.5];
const OUTFLOW_DATA = [14, 16, 15, 18, 17, 19, 18, 17.5, 19, 18, 18.5, 18.2];

export default function HeroDashboardPreview({ lang = "en" }: HeroDashboardPreviewProps) {
  const t = PREVIEW_TEXT[lang] || PREVIEW_TEXT.en;
  const [activeRange, setActiveRange] = useState<"1M" | "3M" | "6M" | "1Y">("1Y");
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(11);

  const transactions = [
    {
      id: "tx-1",
      title: "Invoice Pembayaran Klien PT Astra",
      account: "BCA Giro Operasional",
      category: "Pendapatan Bisnis",
      amount: "+Rp 28.500.000",
      isIncome: true,
      time: "Hari ini, 10:45",
      badge: t.aiVerified,
    },
    {
      id: "tx-2",
      title: "AWS Cloud Infrastructure Cluster",
      account: "Stripe Corporate Card",
      category: "Server & Software",
      amount: "-Rp 4.250.000",
      isIncome: false,
      time: "Kemarin, 16:20",
      badge: t.matched,
    },
    {
      id: "tx-3",
      title: "Gaji Pokok Karyawan & Engineering",
      account: "Mandiri Payroll Hub",
      category: "Beban Tim & SDM",
      amount: "-Rp 12.800.000",
      isIncome: false,
      time: "18 Sep 2026",
      badge: t.matched,
    },
  ];

  return (
    <div className="w-full text-left font-sans select-none">
      {/* 1. Dashboard Top Header Bar (Matching /dashboard) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200/80 dark:border-default-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Workspace Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-100/60 dark:bg-default-800/60 text-xs font-bold text-foreground">
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>{t.workspace}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
              {t.tier}
            </span>
          </div>

          {/* Connected Wallets Indicator */}
          <div className="inline-flex items-center gap-1.5 text-[11px] text-default-500 px-2 py-1 rounded-lg bg-default-50 dark:bg-default-900/40 border border-default-200/50 dark:border-default-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t.walletsCount}</span>
          </div>
        </div>

        {/* Quick Action Buttons (Matching /dashboard) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-default-700 dark:text-default-300 text-xs font-semibold hover:bg-default-50 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.exportXls}</span>
          </button>
          <Link
            href="/transactions/new"
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addTx}</span>
          </Link>
        </div>
      </div>

      {/* 2. Four Core Financial Metric Cards (Matching /dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
        {/* Metric 1: Total Net Balance */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 sm:p-4 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/50 dark:bg-default-900/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-default-500">{t.totalNetBalance}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              Rp 312.450.000
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> {t.momChange}
              </span>
              <span className="text-default-400 hidden sm:inline">{t.connectedWallets}</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 2: Monthly Inflow */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 sm:p-4 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/50 dark:bg-default-900/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-default-500">{t.monthlyInflow}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              Rp 48.500.000
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1 text-default-400">
              <span>{t.inflowSub}</span>
              <span className="text-emerald-500 font-semibold">+22.4%</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 3: Monthly Spending */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 sm:p-4 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/50 dark:bg-default-900/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-default-500">{t.monthlySpending}</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              Rp 18.200.000
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1 text-default-400">
              <span>{t.spendingAvg}</span>
              <span className="text-blue-500 font-semibold">-8.2%</span>
            </div>
          </div>
        </motion.div>

        {/* Metric 4: Savings Rate */}
        <motion.div
          whileHover={{ y: -2 }}
          className="p-3.5 sm:p-4 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/50 dark:bg-default-900/40 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-default-500">{t.savingsRate}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              {t.healthyBadge}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
              62.5%
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-emerald-500 font-semibold">{t.netSurplus}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 3. Main Split Grid: Chart + Transactions (Left 7) & Auditor + Breakdown (Right 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 pt-3.5">
        
        {/* Left Column (lg:col-span-7): Cashflow Area Curve & Recent Ledger Entries */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Cashflow Trajectory Chart Card */}
          <div className="p-4 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/40 dark:bg-default-900/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs font-bold text-foreground">{t.chartTitle}</h4>
                <p className="text-[10px] text-default-500">{t.chartSubtitle}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Legend */}
                <div className="flex items-center gap-2 text-[10px] text-default-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> {t.inflowLegend}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> {t.outflowLegend}
                  </span>
                </div>

                {/* Range Tabs */}
                <div className="flex items-center p-0.5 rounded-lg bg-default-200/60 dark:bg-default-800/60 text-[9px] font-bold">
                  {(["1M", "3M", "6M", "1Y"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setActiveRange(r)}
                      className={`px-1.5 py-0.5 rounded-md transition ${
                        activeRange === r
                          ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-default-500 hover:text-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive SVG Area Chart */}
            <div className="relative h-32 w-full pt-2">
              <svg viewBox="0 0 480 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="heroInflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="heroOutflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="30" x2="480" y2="30" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="480" y2="70" stroke="currentColor" strokeOpacity="0.06" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="480" y2="110" stroke="currentColor" strokeOpacity="0.08" />

                {/* Inflow Area & Curve */}
                <path
                  d="M 0 65 Q 40 55, 80 48 T 160 42 T 240 32 T 320 25 T 400 18 T 480 12 L 480 110 L 0 110 Z"
                  fill="url(#heroInflowGrad)"
                />
                <path
                  d="M 0 65 Q 40 55, 80 48 T 160 42 T 240 32 T 320 25 T 400 18 T 480 12"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Outflow Area & Curve */}
                <path
                  d="M 0 88 Q 40 85, 80 82 T 160 80 T 240 78 T 320 76 T 400 75 T 480 74 L 480 110 L 0 110 Z"
                  fill="url(#heroOutflowGrad)"
                />
                <path
                  d="M 0 88 Q 40 85, 80 82 T 160 80 T 240 78 T 320 76 T 400 75 T 480 74"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeLinecap="round"
                />

                {/* Interactive Points on Current Month (Dec) */}
                <circle cx="480" cy="12" r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                <circle cx="480" cy="74" r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
              </svg>

              {/* Month Ticks */}
              <div className="flex justify-between text-[8px] font-mono text-default-400 mt-1 px-1">
                {MOCK_MONTHS.map((m, idx) => (
                  <span
                    key={m}
                    className={`cursor-pointer transition-colors ${
                      hoveredMonth === idx ? "font-bold text-blue-500" : ""
                    }`}
                    onMouseEnter={() => setHoveredMonth(idx)}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Journal Transactions (Matching TanStack Table in /dashboard) */}
          <div className="p-3.5 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/40 dark:bg-default-900/30">
            <div className="flex items-center justify-between pb-2 border-b border-default-200/60 dark:border-default-800/60">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                {t.recentTransactions}
              </span>
              <Link
                href="/transactions"
                className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                <span>{t.viewAllTx}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-default-100 dark:divide-default-800/50 pt-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${
                        tx.isIncome
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {tx.isIncome ? <Wallet className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate text-[11px]">{tx.title}</div>
                      <div className="text-[9px] text-default-400 flex items-center gap-1.5">
                        <span>{tx.account}</span>
                        <span>•</span>
                        <span className="text-default-500">{tx.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono font-bold text-xs ${
                        tx.isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                      }`}
                    >
                      {tx.amount}
                    </div>
                    <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold font-mono">
                      {tx.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (lg:col-span-5): Auditor & Category Expense Breakdown */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Financial Health Auditor Card (Matching FinancialHealthAuditor.tsx) */}
          <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-50/25 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {t.healthTitle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                {t.healthStatus}
              </span>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-foreground text-sm">{t.warchestRunway}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{t.resilience}</span>
              </div>
              {/* Runway Health Progress Bar */}
              <div className="w-full h-2 rounded-full bg-emerald-200/50 dark:bg-emerald-900/40 overflow-hidden">
                <div className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full w-[85%]" />
              </div>
            </div>
          </div>

          {/* Expense Breakdown by Category (Matching ExpenseBreakdown.tsx) */}
          <div className="p-4 rounded-xl border border-default-200/70 dark:border-default-800/70 bg-default-50/40 dark:bg-default-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">{t.expenseBreakdown}</h4>
                <p className="text-[10px] text-default-500">{t.budgetCap}</p>
              </div>
              <span className="text-[11px] font-mono font-bold text-rose-500">Rp 18.200.000</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                { name: "Team & Engineering Payroll", pct: 45, val: "Rp 8.200.000", color: "bg-blue-500" },
                { name: "Cloud Infra & Security", pct: 35, val: "Rp 6.450.000", color: "bg-purple-500" },
                { name: "Marketing & Growth Ads", pct: 12, val: "Rp 2.150.000", color: "bg-amber-500" },
                { name: "Petty Cash & Logistics", pct: 8, val: "Rp 1.400.000", color: "bg-emerald-500" },
              ].map((c) => (
                <div key={c.name} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-foreground font-medium">{c.name}</span>
                    <span className="font-mono text-default-500">{c.val} ({c.pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-default-200 dark:bg-default-700 overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Copilot Real-Time Extraction Badge */}
          <div className="p-3 rounded-xl border border-blue-500/25 bg-blue-50/30 dark:bg-blue-950/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-foreground">Double-Entry AI Vision Engine</div>
              <div className="text-[9px] text-default-500 truncate">Groq Llama 3.3 · 240ms Sub-Second Categorization</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
