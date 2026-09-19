/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import {
  Scale,
  Plus,
  TrendingDown,
  Percent,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Snowflake,
  Calculator,
  Sliders,
  DollarSign,
  Building2,
  CreditCard,
  Briefcase,
  Home,
  Clock,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryFunctions } from "../../lib/queries";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface LiabilityItem {
  id: string;
  name: string;
  lenderName: string;
  type: "mortgage" | "business_loan" | "credit_card" | "auto_loan" | "paylater" | "other";
  principalAmount: number;
  remainingAmount: number;
  interestRate: number; // annual percentage
  monthlyPayment: number;
  tenorMonths: number;
  remainingTenorMonths: number;
  dueDate: number; // day of month
  status: "active" | "paid_off" | "restructured";
  notes?: string;
}

const TYPE_CONFIG: Record<
  LiabilityItem["type"],
  { label: string; icon: any; color: string; badge: string }
> = {
  mortgage: {
    label: "KPR & Properti",
    icon: Home,
    color: "#8b5cf6",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  business_loan: {
    label: "Modal Usaha / UMKM",
    icon: Briefcase,
    color: "#3b82f6",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  credit_card: {
    label: "Kartu Kredit & Cicilan",
    icon: CreditCard,
    color: "#f59e0b",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  auto_loan: {
    label: "Kendaraan & Otomotif",
    icon: Building2,
    color: "#06b6d4",
    badge: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  paylater: {
    label: "Fintech & Paylater",
    icon: AlertTriangle,
    color: "#f43f5e",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  other: {
    label: "Kewajiban Lain",
    icon: Scale,
    color: "#64748b",
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

const INITIAL_DEMO_LIABILITIES: LiabilityItem[] = [
  {
    id: "liab-1",
    name: "KPR BTN Syariah - Cluster Grand BSD",
    lenderName: "Bank BTN Syariah",
    type: "mortgage",
    principalAmount: 650000000,
    remainingAmount: 520000000,
    interestRate: 6.75,
    monthlyPayment: 5250000,
    tenorMonths: 180,
    remainingTenorMonths: 142,
    dueDate: 10,
    status: "active",
    notes: "Fasilitas pembiayaan hunian tetap skema murabahah.",
  },
  {
    id: "liab-2",
    name: "Kredit Usaha Modal Kerja Mandiri",
    lenderName: "Bank Mandiri",
    type: "business_loan",
    principalAmount: 100000000,
    remainingAmount: 38000000,
    interestRate: 8.5,
    monthlyPayment: 4600000,
    tenorMonths: 24,
    remainingTenorMonths: 9,
    dueDate: 25,
    status: "active",
    notes: "Ekspansi modal operasional dan inventory software.",
  },
  {
    id: "liab-3",
    name: "BCA Everyday Card & Cicilan 0%",
    lenderName: "Bank BCA",
    type: "credit_card",
    principalAmount: 25000000,
    remainingAmount: 7200000,
    interestRate: 1.75,
    monthlyPayment: 1850000,
    tenorMonths: 12,
    remainingTenorMonths: 4,
    dueDate: 15,
    status: "active",
    notes: "Cicilan 0% peralatan workstation kantor.",
  },
];

const PALETTE = ["#8b5cf6", "#3b82f6", "#f59e0b", "#06b6d4", "#f43f5e", "#64748b"];

export default function LiabilitiesPage() {
  const { selectedWorkspace } = useWorkspace();
  const [liabilities] = useState<LiabilityItem[]>(INITIAL_DEMO_LIABILITIES);

  // Payoff Strategy state: 'avalanche' | 'snowball'
  const [payoffStrategy, setPayoffStrategy] = useState<"avalanche" | "snowball">("avalanche");
  const [extraPaymentPerMonth, setExtraPaymentPerMonth] = useState<number>(2000000);

  const currency = selectedWorkspace?.currency || "IDR";

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Workspace monthly cashflow for DTI computation
  const { data: dashboardSummary } = useQuery({
    queryKey: queryKeys.dashboardSummary(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.dashboardSummary(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  const monthlyIncome = dashboardSummary?.data?.monthlyIncome || 45000000;

  // Aggregate Metrics
  const totalPrincipal = useMemo(
    () => liabilities.reduce((acc, l) => acc + l.principalAmount, 0),
    [liabilities]
  );
  const totalRemaining = useMemo(
    () => liabilities.reduce((acc, l) => acc + l.remainingAmount, 0),
    [liabilities]
  );
  const totalMonthlyPayment = useMemo(
    () => liabilities.reduce((acc, l) => acc + l.monthlyPayment, 0),
    [liabilities]
  );

  // Weighted Average Interest Rate
  const weightedAPR = useMemo(() => {
    if (totalRemaining === 0) return 0;
    const weightedSum = liabilities.reduce(
      (acc, l) => acc + l.interestRate * l.remainingAmount,
      0
    );
    return (weightedSum / totalRemaining).toFixed(2);
  }, [liabilities, totalRemaining]);

  // Debt-to-Income (DTI) Ratio
  const dtiRatio = useMemo(() => {
    if (!monthlyIncome || monthlyIncome <= 0) return "0.0";
    return ((totalMonthlyPayment / monthlyIncome) * 100).toFixed(1);
  }, [totalMonthlyPayment, monthlyIncome]);

  const dtiNum = parseFloat(dtiRatio);

  // Donut chart data for liability breakdown
  const pieChartData = useMemo(() => {
    return liabilities.map((l) => ({
      name: l.name,
      value: l.remainingAmount,
      typeLabel: TYPE_CONFIG[l.type]?.label || l.type,
      apr: l.interestRate,
      share: totalRemaining > 0 ? ((l.remainingAmount / totalRemaining) * 100).toFixed(1) : "0",
    }));
  }, [liabilities, totalRemaining]);

  // 12-Month Projection Amortization Curve
  const amortizationChartData = useMemo(() => {
    const months = [
      "Bln 0",
      "Bln 2",
      "Bln 4",
      "Bln 6",
      "Bln 8",
      "Bln 10",
      "Bln 12",
      "Bln 14",
      "Bln 16",
      "Bln 18",
    ];
    let balanceNormal = totalRemaining;
    let balanceAccelerated = totalRemaining;

    return months.map((m, idx) => {
      const normalDeduction = totalMonthlyPayment * 0.7 * (idx * 2);
      const accelDeduction = (totalMonthlyPayment + extraPaymentPerMonth) * 0.75 * (idx * 2);

      const valNormal = Math.max(0, balanceNormal - normalDeduction);
      const valAccel = Math.max(0, balanceAccelerated - accelDeduction);

      return {
        month: m,
        "Skema Normal": Math.round(valNormal),
        "Akselerasi (+Extra Bayar)": Math.round(valAccel),
      };
    });
  }, [totalRemaining, totalMonthlyPayment, extraPaymentPerMonth]);

  // Payoff Strategy Rankings
  const rankedLiabilities = useMemo(() => {
    const copy = [...liabilities];
    if (payoffStrategy === "avalanche") {
      // Sort by APR descending (highest interest first)
      return copy.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      // Sort by Remaining Amount ascending (smallest balance first)
      return copy.sort((a, b) => a.remainingAmount - b.remainingAmount);
    }
  }, [liabilities, payoffStrategy]);

  // Acceleration Savings Estimates
  const estimatedMonthsSaved = Math.round(extraPaymentPerMonth / 350000);
  const estimatedInterestSaved = Math.round(extraPaymentPerMonth * 14.5);

  return (
    <div className="min-h-screen bg-default-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-default-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white shadow-md shadow-rose-600/20">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Capital Liabilities & Debt Matrix
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-medium border border-rose-500/20">
                  Enterprise Engine
                </span>
              </h1>
              <p className="text-xs md:text-sm text-default-500">
                Pusat kendali kewajiban modal, jadwal amortisasi, mitigasi rasio DTI, dan strategi percepatan pelunasan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Ekspor Amortisasi (.CSV)</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs h-9 shadow-md shadow-rose-600/25 hover:shadow-rose-600/40 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Daftarkan Kewajiban Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding Debt */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Total Sisa Pokok Hutang</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totalRemaining)}
            </span>
            <span className="text-xs text-default-400 font-mono">{liabilities.length} Pinjaman</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-default-500">
            <span>Plafon awal: {formatCurrency(totalPrincipal)}</span>
            <span className="text-emerald-600 font-medium">
              {((1 - totalRemaining / totalPrincipal) * 100).toFixed(0)}% Lunas
            </span>
          </div>
        </Card>

        {/* Monthly Debt Service */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Beban Cicilan / Bulan</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalMonthlyPayment)}
            </span>
            <span className="text-xs text-default-400 font-mono">Bulan ini</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-default-500">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Jatuh tempo terdekat: Tgl 10 (BTN Syariah)</span>
          </div>
        </Card>

        {/* Debt-to-Income (DTI) Ratio */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Rasio DTI (Debt-to-Income)</span>
            <div className={`p-1.5 rounded-lg ${
              dtiNum <= 30
                ? "bg-emerald-500/10 text-emerald-600"
                : dtiNum <= 40
                ? "bg-amber-500/10 text-amber-600"
                : "bg-rose-500/10 text-rose-600"
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">
              {dtiRatio}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
              dtiNum <= 35
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
            }`}>
              {dtiNum <= 35 ? "Kategori Sehat" : "Peringatan Waspada"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-default-500">
            <span>Batas rekomendasi perbankan: <strong>&lt; 35%</strong></span>
          </div>
        </Card>

        {/* Weighted Average APR */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Rata-Rata Bunga (APR)</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {weightedAPR}% / thn
            </span>
            <span className="text-xs text-default-400 font-mono">Tertimbang Pokok</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-default-500">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span>Didominasi oleh suku bunga KPR (6.75%)</span>
          </div>
        </Card>
      </div>

      {/* 3. Visualisasi Charts & Amortization Projection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Komposisi Hutang Portofolio (Donut Chart) */}
        <Card className="lg:col-span-5 p-5 border border-default-200 shadow-sm bg-background flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-semibold text-foreground">Struktur Komposisi Kewajiban</h2>
              </div>
              <span className="text-xs text-default-400">Sisa Saldo (%)</span>
            </div>
            <p className="text-xs text-default-500 mt-2">
              Proporsi pokok pinjaman riil per instrumen pembiayaan.
            </p>

            <div className="h-56 mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-background/95 backdrop-blur-md border border-default-200 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-bold text-foreground">{d.name}</p>
                            <p className="text-default-500">Jenis: {d.typeLabel}</p>
                            <p className="text-rose-500 font-semibold">Sisa Pokok: {formatCurrency(d.value)}</p>
                            <p className="text-blue-500">Bunga: {d.apr}% APR</p>
                            <p className="text-xs font-mono text-default-400">Share: {d.share}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-default-400 uppercase">Total Kewajiban</span>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(totalRemaining)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-default-100 flex flex-wrap gap-1.5">
            {pieChartData.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-default-100/60 border border-default-200/50 text-[11px]"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                <span className="font-medium text-foreground truncate max-w-[120px]">{item.name}</span>
                <span className="text-default-400 font-mono">({item.share}%)</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Right: Simulasi Proyeksi Penurunan Saldo (Area Chart) */}
        <Card className="lg:col-span-7 p-5 border border-default-200 shadow-sm bg-background flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Proyeksi Amortisasi & Pengurangan Pokok</h2>
              </div>
              <span className="text-xs text-emerald-600 font-medium">Model 18 Bulan ke Depan</span>
            </div>
            <p className="text-xs text-default-500 mt-2">
              Perbandingan amortisasi pembayaran standar vs strategi percepatan pelunasan pokok.
            </p>

            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={amortizationChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAccel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#888888" }} />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                    tick={{ fontSize: 10, fill: "#888888" }}
                    width={45}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background/95 backdrop-blur-md border border-default-200 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-bold text-foreground">{label}</p>
                            {payload.map((entry: any, index: number) => (
                              <p key={index} style={{ color: entry.color }}>
                                {entry.name}: {formatCurrency(entry.value)}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Skema Normal"
                    stroke="#94a3b8"
                    fillOpacity={1}
                    fill="url(#colorNormal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Akselerasi (+Extra Bayar)"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorAccel)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-default-100 flex items-center justify-between text-xs text-default-500">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Garis hijau mengilustrasikan pelunasan lebih cepat jika menerapkan pembayaran ekstra bulanan.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. Payoff Strategy Engine (Snowball vs Avalanche) + Extra Payment Slider */}
      <Card className="p-5 border border-default-200 shadow-sm bg-background">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-default-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">Payoff Acceleration Simulator</h2>
            </div>
            <p className="text-xs text-default-500 mt-0.5">
              Pilih metodologi pelunasan hutang paling optimal untuk kebutuhan cashflow bisnismu.
            </p>
          </div>

          {/* Strategy Toggle */}
          <div className="flex items-center bg-default-100 p-1 rounded-xl border border-default-200 text-xs">
            <button
              onClick={() => setPayoffStrategy("avalanche")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                payoffStrategy === "avalanche"
                  ? "bg-background text-primary shadow-sm"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Debt Avalanche (Hemat Bunga)</span>
            </button>
            <button
              onClick={() => setPayoffStrategy("snowball")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                payoffStrategy === "snowball"
                  ? "bg-background text-primary shadow-sm"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-blue-500" />
              <span>Debt Snowball (Kemenangan Cepat)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Strategy Explanation & Ranking */}
          <div className="lg:col-span-7 space-y-3">
            <div className="p-3.5 rounded-xl bg-default-100/60 border border-default-200 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                {payoffStrategy === "avalanche" ? (
                  <>
                    <Flame className="w-4 h-4 text-rose-500" />
                    Strategi Debt Avalanche: Prioritas Bunga Tertinggi
                  </>
                ) : (
                  <>
                    <Snowflake className="w-4 h-4 text-blue-500" />
                    Strategi Debt Snowball: Prioritas Saldo Pokok Terkecil
                  </>
                )}
              </span>
              <p className="text-default-500 mt-1">
                {payoffStrategy === "avalanche"
                  ? "Secara matematis paling menguntungkan. Semua dana ekstra difokuskan untuk melunasi pinjaman berbunga tertinggi (Modal Usaha 8.5%), memangkas beban bunga total secara maksimal."
                  : "Secara psikologis paling memotivasi. Semua dana ekstra difokuskan untuk menghabisi pinjaman bersaldo terkecil (Kartu Kredit BCA Rp 7.2jt), memberikan kelegaan cepat dengan menutup rekening satu per satu."}
              </p>
            </div>

            {/* Target Priority Order List */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-default-400 uppercase tracking-wider">
                Urutan Eksekusi Pembayaran Prioritas:
              </span>
              {rankedLiabilities.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-background border border-default-200 hover:border-primary/40 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                      #{index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-foreground">{item.name}</h4>
                      <p className="text-[11px] text-default-400">
                        {item.lenderName} • Sisa {item.remainingTenorMonths} bln
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <p className="font-bold text-foreground">{formatCurrency(item.remainingAmount)}</p>
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{item.interestRate}% APR</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Extra Payment Slider & Savings Projection */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-default-100/50 border border-default-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Alokasi Ekstra Pelunasan Pokok / Bulan</span>
                <span className="font-mono font-bold text-primary text-sm">
                  {formatCurrency(extraPaymentPerMonth)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10000000"
                step="500000"
                value={extraPaymentPerMonth}
                onChange={(e) => setExtraPaymentPerMonth(Number(e.target.value))}
                className="w-full mt-3 h-2 bg-default-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-default-400 font-mono mt-1">
                <span>Rp 0</span>
                <span>Rp 5.000.000</span>
                <span>Rp 10.000.000</span>
              </div>
            </div>

            {/* Impact Metric Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <span className="text-emerald-700 dark:text-emerald-400 text-[11px]">Waktu Dipercepat</span>
                <p className="text-base font-bold text-emerald-600 mt-0.5">
                  ~{estimatedMonthsSaved} Bulan
                </p>
                <p className="text-[10px] text-emerald-600/80 mt-0.5">Bebas hutang lebih awal</p>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <span className="text-blue-700 dark:text-blue-400 text-[11px]">Estimasi Bunga Dihemat</span>
                <p className="text-base font-bold text-blue-600 mt-0.5">
                  ~{formatCurrency(estimatedInterestSaved)}
                </p>
                <p className="text-[10px] text-blue-600/80 mt-0.5">Efisiensi pengeluaran modal</p>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-xs transition shadow-sm shadow-primary/30 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Terapkan Skema Ekstra ke Rencana Anggaran</span>
            </button>
          </div>
        </div>
      </Card>

      {/* 5. Detail Tabel Pinjaman & Fasilitas Pembiayaan */}
      <Card className="p-5 border border-default-200 shadow-sm bg-background">
        <div className="flex items-center justify-between border-b border-default-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Daftar Fasilitas Kewajiban Aktif</h3>
          </div>
          <span className="text-xs text-default-400 font-mono">3 Kontrak Berjalan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-default-400 uppercase bg-default-100/50 border-b border-default-200">
              <tr>
                <th className="py-2.5 px-3">Fasilitas Pinjaman</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Sisa Pokok</th>
                <th className="py-2.5 px-3">Cicilan / Bln</th>
                <th className="py-2.5 px-3">Suku Bunga</th>
                <th className="py-2.5 px-3">Sisa Tenor</th>
                <th className="py-2.5 px-3">Jatuh Tempo</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100">
              {liabilities.map((item) => {
                const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
                const Icon = config.icon;
                const progressPercent = Math.min(
                  100,
                  ((item.principalAmount - item.remainingAmount) / item.principalAmount) * 100
                );

                return (
                  <tr key={item.id} className="hover:bg-default-100/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-foreground">{item.name}</div>
                      <div className="text-[11px] text-default-400">{item.lenderName}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${config.badge}`}>
                        <Icon className="w-3 h-3" />
                        <span>{config.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-foreground">{formatCurrency(item.remainingAmount)}</div>
                      <div className="w-24 bg-default-200 rounded-full h-1 mt-1 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-foreground">
                      {formatCurrency(item.monthlyPayment)}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-rose-600 dark:text-rose-400">
                      {item.interestRate}% APR
                    </td>
                    <td className="py-3 px-3 font-mono text-default-600">
                      {item.remainingTenorMonths} / {item.tenorMonths} bln
                    </td>
                    <td className="py-3 px-3 text-default-600">
                      Tgl {item.dueDate} setiap bulan
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg bg-default-100 hover:bg-default-200 text-default-700 font-medium text-[11px] border border-default-200 transition"
                      >
                        Detail Jadwal
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
