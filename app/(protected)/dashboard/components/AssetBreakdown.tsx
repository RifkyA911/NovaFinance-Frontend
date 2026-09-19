/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@heroui/react";
import {
  PieChart as PieIcon,
  BarChart3,
  Landmark,
  Wallet,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  ChevronRight,
  Zap,
  ArrowRight,
  Scale,
  BrainCircuit,
  Sliders,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface AccountAssetItem {
  id?: string;
  name: string;
  balance?: number | string;
  value: number;
  type?: string;
  color?: string;
  accountNumber?: string;
  bankName?: string;
}

interface AssetBreakdownProps {
  accounts: AccountAssetItem[];
  formatCurrency: (val: number | string) => string;
  currency?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; badgeBg: string }> = {
  bank: { label: "Bank Account", icon: Landmark, color: "#3b82f6", badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  ewallet: { label: "E-Wallet", icon: Wallet, color: "#10b981", badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  cash: { label: "Cash / Tunai", icon: Coins, color: "#f59e0b", badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  credit: { label: "Credit Card", icon: Layers, color: "#8b5cf6", badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  other: { label: "Lainnya", icon: Wallet, color: "#64748b", badgeBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
};

const PALETTE = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#84cc16", // Lime
];

export function AssetBreakdown({
  accounts = [],
  formatCurrency,
  currency = "IDR",
}: AssetBreakdownProps) {
  const router = useRouter();

  // View mode: donut | bar | list | ai
  const [viewMode, setViewMode] = useState<"donut" | "bar" | "list" | "ai">("donut");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [hoveredSlice, setHoveredSlice] = useState<AccountAssetItem | null>(null);
  const [isAiRegenerating, setIsAiRegenerating] = useState(false);

  // Filter accounts by category type if selected
  const filteredAccounts = useMemo(() => {
    if (selectedType === "ALL") return accounts;
    return accounts.filter((acc) => {
      const type = (acc.type || "other").toLowerCase();
      return type === selectedType.toLowerCase();
    });
  }, [accounts, selectedType]);

  // Total balance computation
  const totalAssets = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (Number(acc.value) || 0), 0);
  }, [accounts]);

  // Largest holding analysis
  const topHolding = useMemo(() => {
    if (accounts.length === 0) return null;
    const sorted = [...accounts].sort((a, b) => b.value - a.value);
    const top = sorted[0];
    const percentage = totalAssets > 0 ? Math.round((top.value / totalAssets) * 100) : 0;
    return { ...top, percentage };
  }, [accounts, totalAssets]);

  // Type aggregation (Bank vs E-Wallet vs Cash)
  const typeAggregation = useMemo(() => {
    const agg: Record<string, { label: string; total: number; count: number; color: string; icon: any }> = {};

    accounts.forEach((acc) => {
      const t = (acc.type || "other").toLowerCase();
      const conf = TYPE_CONFIG[t] || TYPE_CONFIG.other;
      if (!agg[t]) {
        agg[t] = { label: conf.label, total: 0, count: 0, color: conf.color, icon: conf.icon };
      }
      agg[t].total += Number(acc.value) || 0;
      agg[t].count += 1;
    });

    return Object.entries(agg).map(([key, data]) => ({
      type: key,
      ...data,
      percentage: totalAssets > 0 ? Math.round((data.total / totalAssets) * 100) : 0,
    }));
  }, [accounts, totalAssets]);

  // Available types in portfolio
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    accounts.forEach((acc) => {
      if (acc.type) types.add(acc.type.toLowerCase());
    });
    return Array.from(types);
  }, [accounts]);

  // -------------------------------------------------------------
  // DIVERSIFICATION & AI CONCLUSION ENGINE
  // -------------------------------------------------------------
  const aiAudit = useMemo(() => {
    if (accounts.length === 0 || totalAssets === 0) {
      return {
        score: 0,
        status: "No Data",
        riskLevel: "None",
        headline: "Belum ada rekening atau saldo yang terhubung.",
        keyPoints: [
          { title: "Tambahkan Rekening", desc: "Hubungkan rekening bank BCA, Mandiri, atau dompet tunai Anda untuk mengaktifkan AI audit likuiditas.", level: "info" },
        ],
      };
    }

    const topShare = topHolding?.percentage || 0;
    let score = 90;
    let riskLevel: "Low" | "Moderate" | "High" = "Low";
    let headline = "Likuiditas terdistribusi dengan proporsional.";

    if (topShare >= 75) {
      score = 45;
      riskLevel = "High";
      headline = `Konsentrasi likuiditas sangat tinggi pada ${topHolding?.name} (${topShare}%).`;
    } else if (topShare >= 50) {
      score = 68;
      riskLevel = "Moderate";
      headline = `Sebagian besar dana terkumpul di ${topHolding?.name} (${topShare}%).`;
    } else {
      score = 88;
      riskLevel = "Low";
      headline = `Diversifikasi sehat di ${accounts.length} rekening dengan risiko konsentrasi rendah.`;
    }

    // Checking LPS Guarantee limit in Indonesia (Rp 2 Milyar per bank)
    const lpsCapExceeded = accounts.filter((a) => Number(a.value) > 2000000000);

    const keyPoints: { title: string; desc: string; level: "optimal" | "warning" | "recommendation" | "info" }[] = [];

    // Point 1: Concentration
    if (topShare >= 60) {
      keyPoints.push({
        title: "Peringatan Konsentrasi Dana Tunggal",
        desc: `Sebanyak ${topShare}% dana perusahaan/pribadi bertumpu pada satu akun (${topHolding?.name}). Disarankan memecah cadangan ke bank sekunder untuk kontinuitas operasional saat maintenance jaringan.`,
        level: "warning",
      });
    } else {
      keyPoints.push({
        title: "Distribusi Likuiditas Optimal",
        desc: `Tidak ada satu akun pun yang memegang lebih dari 50% dari total aset. Arus kas Anda memiliki ketahanan tinggi terhadap downtime sistem perbankan.`,
        level: "optimal",
      });
    }

    // Point 2: LPS Security
    if (lpsCapExceeded.length > 0) {
      keyPoints.push({
        title: "Batas Penjaminan LPS (> Rp 2 Miliar)",
        desc: `Terdapat ${lpsCapExceeded.length} akun dengan saldo melampaui batas penjaminan LPS (Rp 2.000.000.000). Alihkan kelebihan dana ke instrumen pasar uang atau obligasi negara (SBN) untuk proteksi modal 100%.`,
        level: "warning",
      });
    } else {
      keyPoints.push({
        title: "Kepatuhan Proteksi Simpanan",
        desc: "Seluruh saldo per akun berada di bawah ambang batas aman penjaminan simpanan perbankan nasional.",
        level: "optimal",
      });
    }

    // Point 3: Yield Opportunity
    const cashShare = typeAggregation.find((t) => t.type === "cash")?.percentage || 0;
    if (cashShare > 25) {
      keyPoints.push({
        title: "Peluang Yield Dana Tunai Mengendap",
        desc: `Porsi uang tunai/kas fisik mencapai ${cashShare}%. Pertimbangkan memindahkan 15% ke rekening bunga harian atau deposito on-call agar tidak tergerus inflasi.`,
        level: "recommendation",
      });
    } else {
      keyPoints.push({
        title: "Rasio Kas & Tabungan Efisien",
        desc: `Alokasi kas tunai terkontrol (${cashShare}%). Dana operasional telah tersentralisasi pada akun digital yang mudah diotomatisasi.`,
        level: "recommendation",
      });
    }

    return { score, riskLevel, headline, keyPoints };
  }, [accounts, totalAssets, topHolding, typeAggregation]);

  const handleRegenerateAi = () => {
    setIsAiRegenerating(true);
    setTimeout(() => {
      setIsAiRegenerating(false);
    }, 600);
  };

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AccountAssetItem;
      const pct = totalAssets > 0 ? ((data.value / totalAssets) * 100).toFixed(1) : "0";
      const conf = TYPE_CONFIG[(data.type || "other").toLowerCase()] || TYPE_CONFIG.other;

      return (
        <div className="bg-gray-950/95 text-white border border-gray-800 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs space-y-1 z-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color || "#3b82f6" }} />
            <span className="font-bold text-white text-xs">{data.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-300 capitalize">{conf.label}</span>
          </div>
          <div className="pt-1 flex items-center justify-between gap-4 font-mono">
            <span className="text-gray-400 text-[11px]">Saldo Aktif:</span>
            <span className="font-bold text-white text-xs">{formatCurrency(data.value)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-gray-400 text-[11px]">Porsi Aset:</span>
            <span className="font-bold text-blue-400 text-xs">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-xs p-4 sm:p-6 bg-white dark:bg-gray-900 flex flex-col space-y-5 transition-all">
      
      {/* ========================================================= */}
      {/* 1. TOP HEADER & INTERACTIVE MODE SELECTORS                */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-default-100 dark:border-default-800">
        
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs shrink-0">
            <Landmark className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Asset & Portfolio Breakdown
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase border border-blue-500/20">
                LIVE LIQUIDITY
              </span>
            </div>
            <p className="text-xs text-default-500">
              Distribusi likuiditas multi-rekening, rasio konsentrasi risiko, dan audit AI
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          
          {/* Segmented Visual Controls */}
          <div className="flex items-center bg-default-100 dark:bg-default-800/80 p-0.5 rounded-xl border border-default-200/60 dark:border-default-700/60 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("donut")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "donut"
                  ? "bg-theme-primary text-white shadow-xs font-bold"
                  : "text-default-500 hover:text-foreground hover:bg-default-200/50"
              }`}
              title="Donut Allocation Chart"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Donut</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("bar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "bar"
                  ? "bg-theme-primary text-white shadow-xs font-bold"
                  : "text-default-500 hover:text-foreground hover:bg-default-200/50"
              }`}
              title="Ranked Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Ranking</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-theme-primary text-white shadow-xs font-bold"
                  : "text-default-500 hover:text-foreground hover:bg-default-200/50"
              }`}
              title="Detailed List Table"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Tabel</span>
            </button>

            {/* AI Conclusion Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setViewMode("ai")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === "ai"
                  ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-xs font-bold"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
              }`}
              title="AI Conclusion & Insights"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px]">AI Conclusion</span>
            </button>
          </div>

          <Button
            size="sm"
            className="h-8.5 px-3 text-xs bg-default-100 hover:bg-default-200 dark:bg-default-800 dark:hover:bg-default-700 text-default-700 dark:text-default-300 font-semibold cursor-pointer border border-default-200 dark:border-default-700"
            onPress={() => router.push("/wallets")}
          >
            <span>Master Wallets</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KPI METRIC SUMMARY STRIP                               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Total Liquidity */}
        <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800/80">
          <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider">Total Likuiditas</span>
          <p className="text-base sm:text-lg font-black text-foreground mt-0.5 font-mono">
            {formatCurrency(totalAssets)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-default-400 mt-0.5">
            <span>Mata uang:</span>
            <strong className="font-mono text-foreground">{currency}</strong>
          </div>
        </div>

        {/* Metric 2: Connected Accounts */}
        <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800/80">
          <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider">Akun Aktif</span>
          <p className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {accounts.length} <span className="text-xs font-normal text-default-400">Rekening</span>
          </p>
          <div className="text-[10px] text-default-400 mt-0.5">
            {typeAggregation.length} jenis instrumen
          </div>
        </div>

        {/* Metric 3: Top Concentration */}
        <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800/80">
          <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider">Akun Terbesar</span>
          <p className="text-sm sm:text-base font-bold text-foreground mt-0.5 truncate">
            {topHolding?.name || "-"}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-default-400 mt-0.5">
            <span>Porsi:</span>
            <strong className={`font-mono ${topHolding && topHolding.percentage > 60 ? "text-amber-500 font-bold" : "text-emerald-500"}`}>
              {topHolding?.percentage || 0}% total dana
            </strong>
          </div>
        </div>

        {/* Metric 4: AI Diversification Health */}
        <div className="p-3 rounded-xl bg-linear-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
              Health Index
            </span>
            <Sparkles className="w-3 h-3 text-purple-500" />
          </div>
          <p className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5 font-mono">
            {aiAudit.score}/100
          </p>
          <div className="flex items-center gap-1 text-[10px] text-default-500 mt-0.5">
            <span>Risiko:</span>
            <span className={`font-bold ${aiAudit.riskLevel === "High" ? "text-rose-500" : aiAudit.riskLevel === "Moderate" ? "text-amber-500" : "text-emerald-500"}`}>
              {aiAudit.riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Asset Category Distribution Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[10px] font-bold text-default-400 uppercase tracking-wider shrink-0 mr-1">
          Alokasi Kelas:
        </span>
        {typeAggregation.map((agg) => {
          const Icon = agg.icon;
          return (
            <div
              key={agg.type}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-default-100 dark:bg-default-800/80 border border-default-200/60 dark:border-default-700/60 text-xs shrink-0"
            >
              <Icon className="w-3.5 h-3.5" style={{ color: agg.color }} />
              <span className="font-semibold text-foreground">{agg.label}:</span>
              <span className="font-mono text-default-600 dark:text-default-400 text-[11px]">{formatCurrency(agg.total)}</span>
              <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-default-200 dark:bg-default-700 text-default-600 dark:text-default-300">
                {agg.percentage}%
              </span>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN CONTENT: CHARTS OR AI CONCLUSION MODE             */}
      {/* ========================================================= */}
      <div className="min-h-72">
        {filteredAccounts.length === 0 ? (
          <div className="w-full h-72 flex flex-col items-center justify-center text-default-400 text-xs gap-3 text-center p-6 border border-dashed border-default-200 dark:border-default-800 rounded-2xl">
            <Landmark className="w-10 h-10 text-default-300" />
            <div>
              <p className="font-bold text-sm text-foreground">Tidak Ada Data Likuiditas</p>
              <p className="text-xs text-default-400 mt-0.5">Hubungkan rekening bank, e-wallet, atau catat kas tunai Anda.</p>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 text-white font-semibold text-xs px-4 h-8.5 rounded-xl cursor-pointer shadow-xs"
              onPress={() => router.push("/wallets")}
            >
              Buka Master Wallets
            </Button>
          </div>
        ) : viewMode === "donut" ? (
          /* ---------------- DONUT CHART VIEW ---------------- */
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 py-2">
            
            {/* Left: Donut Chart with Center Display & Quick Metric */}
            <div className="flex flex-col items-center lg:col-span-5 gap-2">
              <div className="relative flex items-center justify-center h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={filteredAccounts}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={105}
                      paddingAngle={3}
                      onMouseEnter={(_, idx) => setHoveredSlice(filteredAccounts[idx])}
                      onMouseLeave={() => setHoveredSlice(null)}
                    >
                      {filteredAccounts.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || PALETTE[index % PALETTE.length]}
                          stroke="rgba(0,0,0,0.1)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Donut Hub */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none max-w-[140px] px-2">
                  <span className="text-[11px] text-default-400 font-semibold truncate w-full uppercase tracking-wider">
                    {hoveredSlice ? hoveredSlice.name : "Total Saldo"}
                  </span>
                  <span className="text-sm sm:text-base font-black text-foreground font-mono mt-0.5">
                    {hoveredSlice
                      ? `${totalAssets > 0 ? ((hoveredSlice.value / totalAssets) * 100).toFixed(1) : 0}%`
                      : formatCurrency(totalAssets).split(",")[0]}
                  </span>
                  <span className="text-[9px] text-default-400 font-medium mt-0.5">
                    {hoveredSlice ? formatCurrency(hoveredSlice.value) : `${accounts.length} Akun Terhubung`}
                  </span>
                </div>
              </div>

              {/* Instant Diversification Indicator */}
              <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/50 dark:border-default-700/50 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-default-500">Likuiditas Primer:</span>
                  <strong className="text-foreground font-mono">
                    {Math.round(typeAggregation.filter((t) => t.type === "bank" || t.type === "cash").reduce((acc, c) => acc + c.percentage, 0))}%
                  </strong>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-default-400">Konsentrasi:</span>
                  <span className={`font-bold font-mono ${topHolding && topHolding.percentage > 50 ? "text-amber-500" : "text-emerald-500"}`}>
                    {topHolding?.percentage || 0}% {topHolding?.percentage && topHolding.percentage > 50 ? "(Tinggi)" : "(Aman)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Detailed Allocation Cards Grid */}
            <div className="lg:col-span-7 max-h-72 overflow-y-auto pr-1 no-scrollbar space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredAccounts.map((acc, index) => {
                  const pct = totalAssets > 0 ? ((acc.value / totalAssets) * 100).toFixed(1) : "0";
                  const itemColor = acc.color || PALETTE[index % PALETTE.length];
                  const conf = TYPE_CONFIG[(acc.type || "other").toLowerCase()] || TYPE_CONFIG.other;
                  const Icon = conf.icon;

                  return (
                    <div
                      key={acc.id || index}
                      onClick={() => router.push("/wallets")}
                      className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/60 dark:border-default-800/80 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-6.5 h-6.5 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: itemColor }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-foreground truncate">{acc.name}</p>
                            <p className="text-[10px] text-default-400 capitalize">{conf.label}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-xs text-foreground shrink-0">
                          {formatCurrency(acc.value)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-default-200 dark:bg-default-700/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: itemColor }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-default-500 shrink-0 w-10 text-right font-mono">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : viewMode === "bar" ? (
          /* ---------------- RANKED BAR CHART VIEW ---------------- */
          <div className="py-2 space-y-4">
            {/* Top Ranked Highlights Podium */}
            {filteredAccounts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {filteredAccounts.slice(0, 3).map((top, idx) => {
                  const pct = totalAssets > 0 ? ((top.value / totalAssets) * 100).toFixed(1) : "0";
                  const rankColors = [
                    "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
                    "border-slate-400/30 bg-slate-500/5 text-slate-600 dark:text-slate-400",
                    "border-orange-500/30 bg-orange-500/5 text-orange-600 dark:text-orange-400",
                  ];
                  const rankLabels = ["#1 Utama", "#2 Sekunder", "#3 Cadangan"];

                  return (
                    <div
                      key={top.id || idx}
                      className={`p-3 rounded-xl border ${rankColors[idx] || "border-default-200 bg-default-50"} flex items-center justify-between gap-2`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-default-200 dark:bg-default-700 font-mono">
                            {rankLabels[idx]}
                          </span>
                          <span className="font-bold text-xs truncate text-foreground">{top.name}</span>
                        </div>
                        <p className="text-xs font-mono font-bold mt-1 text-foreground">
                          {formatCurrency(top.value)}
                        </p>
                      </div>
                      <div className="text-right shrink-0 font-mono">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {pct}%
                        </span>
                        <span className="block text-[9px] text-default-400 mt-0.5">porsi total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recharts Bar Container */}
            <div className="h-68 rounded-xl bg-default-50/50 dark:bg-default-800/30 p-2 border border-default-200/50 dark:border-default-800/50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredAccounts}
                  layout="vertical"
                  margin={{ top: 8, right: 30, left: 20, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                    {filteredAccounts.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={entry.color || PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] text-default-400 px-1">
              <span>Satuan nilai ditampilkan dalam jutaan ({currency}).</span>
              <span className="font-mono">Total {filteredAccounts.length} Akun Terdaftar</span>
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* ---------------- DETAILED LIST VIEW ---------------- */
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
            {filteredAccounts.map((acc, index) => {
              const pct = totalAssets > 0 ? ((acc.value / totalAssets) * 100).toFixed(1) : "0";
              const itemColor = acc.color || PALETTE[index % PALETTE.length];
              const conf = TYPE_CONFIG[(acc.type || "other").toLowerCase()] || TYPE_CONFIG.other;
              const Icon = conf.icon;

              return (
                <div
                  key={acc.id || index}
                  onClick={() => router.push("/wallets")}
                  className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/60 dark:border-default-800 flex items-center justify-between gap-4 hover:border-blue-500/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: itemColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-foreground truncate">{acc.name}</p>
                        {acc.bankName && (
                          <span className="text-[10px] text-default-400 font-mono">({acc.bankName})</span>
                        )}
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase border ${conf.badgeBg}`}>
                        {conf.label}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-xs text-foreground">
                      {formatCurrency(acc.value)}
                    </p>
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                      {pct}% porsi
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ---------------- AI CONCLUSION MODE ---------------- */
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-purple-500/5 via-indigo-500/5 to-blue-500/5 border border-purple-500/20 space-y-4 animate-in fade-in duration-300">
            {/* AI Conclusion Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <BrainCircuit className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                    <span>AI Liquidity & Solvency Audit</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/30">
                      AUTONOMOUS AGENT
                    </span>
                  </h4>
                  <p className="text-[11px] text-default-500">{aiAudit.headline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerateAi}
                  disabled={isAiRegenerating}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-gray-800 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isAiRegenerating ? "animate-spin" : ""}`} />
                  <span>{isAiRegenerating ? "Auditing..." : "Re-Analyze"}</span>
                </button>
              </div>
            </div>

            {/* Strategic Action Points Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aiAudit.keyPoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-default-200/80 dark:border-default-800 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    {pt.level === "optimal" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                    {pt.level === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                    {pt.level === "recommendation" && <Zap className="w-4 h-4 text-blue-500 shrink-0" />}
                    {pt.level === "info" && <Info className="w-4 h-4 text-default-400 shrink-0" />}
                    <h5 className="font-bold text-xs text-foreground truncate">{pt.title}</h5>
                  </div>
                  <p className="text-[11px] text-default-500 leading-relaxed">
                    {pt.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Executive Recommendation Banner */}
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-default-700 dark:text-default-300">
                  Rekomendasi Utama: <strong className="text-foreground">Alokasikan 70% saldo operasional di bank utama, dan simpan 30% dana cadangan di instrumen likuid berbunga harian.</strong>
                </span>
              </div>
              <button
                onClick={() => router.push("/portfolio")}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Kelola Portofolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. FOOTER INSIGHT & SUMMARY                               */}
      {/* ========================================================= */}
      <div className="pt-3 border-t border-default-100 dark:border-default-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-default-400">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>Likuiditas tercatat di {accounts.length} akun aktif • Diversifikasi: <strong className="text-foreground font-semibold">{aiAudit.riskLevel} Risk ({aiAudit.score}/100)</strong></span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === "ai" ? "donut" : "ai")}
            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{viewMode === "ai" ? "Kembali ke Grafik" : "Lihat Kesimpulan AI"}</span>
          </button>
          <span className="font-semibold text-foreground font-mono uppercase">{currency}</span>
        </div>
      </div>
    </Card>
  );
}
