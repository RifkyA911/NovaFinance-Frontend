"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Flame,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileWarning,
  Coins,
  Cpu,
} from "lucide-react";
import { playSoftChime } from "@/app/lib/sound";

interface BattleItem {
  id: number;
  tag: string;
  category: string;
  battleTitle: string;
  traditional: {
    title: string;
    desc: string;
    metrics: string;
    visualSnippet: string[];
    badge: string;
  };
  novaFinance: {
    title: string;
    desc: string;
    metrics: string;
    visualSnippet: string[];
    badge: string;
  };
}

const BATTLES: BattleItem[] = [
  {
    id: 1,
    tag: "Integrity & Core Math",
    category: "BATTLE 01",
    battleTitle: "Formula Corruption vs Immutable Double-Entry Ledger",
    traditional: {
      title: "The Silent #REF! Catastrophe",
      desc: "One accidental drag, cut-paste, or deleted row corrupts the entire cashflow chain without anyone noticing until tax audit.",
      metrics: "88% Spreadsheets Contain Fatal Math Errors",
      badge: "FRAGILE & UNPROTECTED",
      visualSnippet: [
        "A1: Saldo Kas = 50.000.000",
        "B2: =SUM(B2:B98) -> #REF!",
        "C3: Net Cashflow -> #DIV/0!",
        "⚠ Status: Math Corrupted",
      ],
    },
    novaFinance: {
      title: "ACID Double-Entry Core Engine",
      desc: "Every debit strictly enforces a verified credit counterpart. Zero mathematical drift, automated checksums, and immutable state.",
      metrics: "100% Balanced Ledger (Zero Drift)",
      badge: "ACID CRYPTOGRAPHIC CORE",
      visualSnippet: [
        "tx_9481: Debit Bank Mandiri  Rp 15.000.000",
        "tx_9481: Credit Pendapatan  Rp 15.000.000",
        "chk: 0x9f4a... (Checksum Verified ✓)",
        "✓ Status: Reconciled & Audited",
      ],
    },
  },
  {
    id: 2,
    tag: "Data Ingestion Speed",
    category: "BATTLE 02",
    battleTitle: "Midnight Receipt Typing vs Sub-300ms Multi-AI Vision",
    traditional: {
      title: "Exhausting Manual Sunday Typing",
      desc: "Hours wasted every weekend squinting at crumpled paper receipts, invoices, and bank statements with frequent decimal typos.",
      metrics: "15+ Jam Terbuang Setiap Bulan",
      badge: "SLOW & TYPO-PRONE",
      visualSnippet: [
        "Input: Struk_Kopi_Kenangan.jpg",
        "Action: Manual ketik 1 per 1...",
        "Typo: Rp 45.000 tertulis Rp 450.000",
        "⚠ Selisih Pembukuan: Rp 405.000",
      ],
    },
    novaFinance: {
      title: "Sub-300ms Vision OCR (Groq & Gemini)",
      desc: "Drag-and-drop receipt or invoice PDF. AI instantly extracts merchant, line items, taxes, and nominals straight into journal ledger.",
      metrics: "Latency <280ms (Instant Extraction)",
      badge: "ULTRA-FAST MULTI-AI VISION",
      visualSnippet: [
        "Input: Struk_Kopi_Kenangan.jpg",
        "AI OCR: Groq Llama 3.3 Vision (240ms)",
        "Parsed: Merchant 'Kopi Kenangan' • Rp 45.000",
        "✓ Auto-linked to Expense: F&B Operasional",
      ],
    },
  },
  {
    id: 3,
    tag: "Cashflow Visibility",
    category: "BATTLE 03",
    battleTitle: "Isolated Bank Silos vs Visual Money Flow Topology",
    traditional: {
      title: "The Multi-App Blind Spot",
      desc: "Juggling 5 different banking apps, e-wallets, and broker accounts without knowing your true consolidated burn rate.",
      metrics: "Zero Real-Time Net Worth View",
      badge: "FRAGMENTED & BLIND",
      visualSnippet: [
        "BCA: Rp 12.400.000  (Buka App 1)",
        "Mandiri: Rp 4.200.000 (Buka App 2)",
        "Bibit / IHSG: ? (Buka App 3)",
        "⚠ Hidden recurring sub: -Rp 450.000/mo",
      ],
    },
    novaFinance: {
      title: "Unified Master Cashflow Topology",
      desc: "Interactive Sankey diagram tracing money from income sources, across bank vaults and investments, down to precise cost buckets.",
      metrics: "Live Global Multi-Valas & IHSG",
      badge: "SANKEY FLOW TOPOLOGY",
      visualSnippet: [
        "Inflow: Rp 35.000.000 -> Liquidity Hub",
        "Split: 60% Vaults • 25% Operational • 15% IHSG",
        "Runway: 8.4 Bulan Kas Cadangan",
        "✓ Net-Worth: Rp 148.920.000 (Live)",
      ],
    },
  },
  {
    id: 4,
    tag: "Security & Governance",
    category: "BATTLE 04",
    battleTitle: "Zero Audit Trail vs Enterprise Zero-Trust & Copilot",
    traditional: {
      title: "The Spreadsheet Overwrite Disaster",
      desc: "Anyone with access can delete cells, alter financial records, or leak confidential salaries with zero access logs or version control.",
      metrics: "0 Audit Logging & Zero RBAC",
      badge: "SECURITY RISK CRITICAL",
      visualSnippet: [
        "File: Keuangan_Final_v3_Revisi.xlsx",
        "User: Unknown Staff edited cell D14",
        "History: Overwritten permanently",
        "❌ Akuntan: Gagal Lolos Uji Kepatuhan",
      ],
    },
    novaFinance: {
      title: "Zero-Trust RBAC & Autonomous CFO AI",
      desc: "Cryptographic audit trail, granular roles (Owner, Admin, Staff, Viewer), TLS 1.3 encryption, and voice-enabled CFO AI Copilot.",
      metrics: "Enterprise Audit Ready 24/7",
      badge: "ZERO-TRUST & ENTERPRISE RBAC",
      visualSnippet: [
        "RBAC: Staff role restricted to Read-Only",
        "Audit Trail: #LOG_4091 logged IP & timestamp",
        "AI CFO Copilot: 'Runway sehat, margin naik 4%'",
        "✓ Laporan Pajak & PDF Siap 1-Klik",
      ],
    },
  },
];

export default function SpreadsheetVsNovaSavage() {
  const [activeBattleId, setActiveBattleId] = useState(1);
  const activeBattle = BATTLES.find((b) => b.id === activeBattleId) || BATTLES[0];

  const handleSelectBattle = (id: number) => {
    playSoftChime();
    setActiveBattleId(id);
  };

  return (
    <div className="relative space-y-12">
      {/* Savage Header Section */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-wide shadow-xs">
          <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>THE BRUTAL REALITY OF EXCEL & SPREADSHEETS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
          Why Traditional Spreadsheets Bleed Capital & How{" "}
          <span className="bg-linear-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            NovaFinance
          </span>{" "}
          Crushes It
        </h2>

        <p className="text-sm sm:text-base text-default-600 dark:text-default-400 leading-relaxed max-w-2xl mx-auto">
          Spreadsheets were invented in 1979 for simple grids. Relying on fragile formulas, disconnected e-wallets, and manual midnight typing in 2026 is costing you countless hours and hidden millions.
        </p>

        {/* Savage Brutal Facts Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
          <div className="p-3 sm:p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              88%
            </div>
            <div className="text-[11px] text-default-500 leading-tight">
              Spreadsheets Mengandung Error Fatal (Dartmouth Study)
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              15+ Jam
            </div>
            <div className="text-[11px] text-default-500 leading-tight">
              Terbuang Tiap Bulan Ketik Struk & Nota Manual
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              0 Log
            </div>
            <div className="text-[11px] text-default-500 leading-tight">
              Audit Trail & Otorisasi RBAC di File Excel Biasa
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              &lt;300ms
            </div>
            <div className="text-[11px] text-default-500 leading-tight">
              Ekstraksi AI Vision & Rekonsiliasi Otomatis NovaFinance
            </div>
          </div>
        </div>
      </div>

      {/* Battle Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
        {BATTLES.map((b) => {
          const isActive = b.id === activeBattleId;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handleSelectBattle(b.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? "bg-foreground text-background border-foreground shadow-md scale-105"
                  : "bg-default-100/80 dark:bg-default-800/80 text-default-600 dark:text-default-400 border-default-200/60 dark:border-default-700/60 hover:bg-default-200 dark:hover:bg-default-700"
              }`}
            >
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? "bg-background/20 text-background" : "bg-default-200 dark:bg-default-700 text-default-600"}`}>
                0{b.id}
              </span>
              <span>{b.tag}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Savage Arena Duel Card */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {activeBattle.category} : {activeBattle.battleTitle}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT: THE SPREADSHEET TRAP */}
          <div className="relative rounded-3xl border-2 border-rose-500/40 bg-linear-to-b from-rose-500/5 via-white dark:via-gray-900 to-rose-500/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-rose-500/5 overflow-hidden group">
            {/* Background Hazard Stripes Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                    The Spreadsheet Trap
                  </span>
                </div>
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  {activeBattle.traditional.badge}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{activeBattle.traditional.title}</span>
              </h3>

              <p className="text-xs sm:text-sm text-default-600 dark:text-default-400 leading-relaxed mb-6">
                {activeBattle.traditional.desc}
              </p>

              {/* Visual Corrupted Mockup */}
              <div className="p-4 rounded-2xl bg-gray-950 text-slate-300 font-mono text-xs border border-rose-500/30 shadow-inner space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-2">
                  <span>EXCEL_SHEET_CORRUPTED.XLSX</span>
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> FORMULA BROKEN
                  </span>
                </div>
                {activeBattle.traditional.visualSnippet.map((line, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      line.includes("#REF!") || line.includes("Typo") || line.includes("Overwritten") || line.includes("Selisih")
                        ? "text-rose-400 font-bold"
                        : line.includes("⚠")
                        ? "text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Metric */}
            <div className="mt-6 pt-4 border-t border-rose-200/50 dark:border-rose-900/40 flex items-center justify-between text-xs">
              <span className="text-default-500 font-medium">Impact Risiko:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                {activeBattle.traditional.metrics}
              </span>
            </div>
          </div>

          {/* RIGHT: THE NOVAFINANCE SHIELD */}
          <div className="relative rounded-3xl border-2 border-emerald-500/40 bg-linear-to-b from-emerald-500/5 via-white dark:via-gray-900 to-emerald-500/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-emerald-500/5 overflow-hidden group">
            {/* Background Halo Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    The NovaFinance Superiority
                  </span>
                </div>
                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {activeBattle.novaFinance.badge}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{activeBattle.novaFinance.title}</span>
              </h3>

              <p className="text-xs sm:text-sm text-default-600 dark:text-default-400 leading-relaxed mb-6">
                {activeBattle.novaFinance.desc}
              </p>

              {/* Visual Verified Mockup */}
              <div className="p-4 rounded-2xl bg-gray-950 text-slate-300 font-mono text-xs border border-emerald-500/30 shadow-inner space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-slate-800 pb-1 mb-2">
                  <span>NOVAFINANCE_AUTONOMOUS_LEDGER</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> RECONCILED ✓
                  </span>
                </div>
                {activeBattle.novaFinance.visualSnippet.map((line, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      line.includes("✓") || line.includes("Checksum") || line.includes("Rp 35.000.000")
                        ? "text-emerald-400 font-bold"
                        : line.includes("AI OCR")
                        ? "text-cyan-400 font-bold"
                        : "text-slate-300"
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Metric */}
            <div className="mt-6 pt-4 border-t border-emerald-200/50 dark:border-emerald-900/40 flex items-center justify-between text-xs">
              <span className="text-default-500 font-medium">Jaminan Akurasi:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {activeBattle.novaFinance.metrics}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
