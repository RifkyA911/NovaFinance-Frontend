/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Chip, Skeleton } from "@heroui/react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Download,
  FileSpreadsheet,
  FileText,
  Sparkles,
  RefreshCw,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryFunctions } from "@/app/lib/queries";
import { exportToExcel, exportToPdf, formatCurrency } from "../dashboard/lib/exportUtils";

// Color palette for charts
const CATEGORY_COLORS = [
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#6366f1", // Indigo
  "#64748b", // Slate
];

type TimeRange = "1m" | "3m" | "6m" | "12m";

export default function AnalyticsPage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const currency = selectedWorkspace?.currency || "IDR";
  const workspaceName = (selectedWorkspace as any)?.customBrandName || selectedWorkspace?.name || "Nova Workspace";

  // Time Range & Active Tab State
  const [timeRange, setTimeRange] = useState<TimeRange>("6m");
  const [activeTab, setActiveTab] = useState<"cashflow" | "categories" | "runway">("cashflow");

  // AI Interactive State
  const [aiQuestion, setAiQuestion] = useState("");
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    answer: string;
    keyMetricsSummary?: string;
    recommendations?: string[];
  } | null>(null);

  // AI Conclusion Generation State
  const [isGeneratingConclusion, setIsGeneratingConclusion] = useState(false);
  const [aiConclusion, setAiConclusion] = useState<{
    summary: string;
    healthScore: number;
    status: "Sehat" | "Cukup Baik" | "Perlu Perhatian" | "Kritis";
    runwayMonths: string;
    insights: Array<{ title: string; description: string; type: "positive" | "warning" | "info" }>;
    recommendations: string[];
    savingsPotential?: string;
  } | null>(null);

  // 1. Fetch Real Dashboard Summary
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: queryKeys.dashboardSummary(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.dashboardSummary(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  // 2. Fetch Trends based on selected TimeRange
  const monthsParam = timeRange === "1m" ? 1 : timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
  const {
    data: trendsData,
    isLoading: isTrendsLoading,
    refetch: refetchTrends,
  } = useQuery({
    queryKey: queryKeys.dashboardTrends(selectedWorkspace?.id || "", monthsParam),
    queryFn: () => queryFunctions.dashboardTrends(selectedWorkspace?.id || "", monthsParam),
    enabled: !!selectedWorkspace?.id,
  });

  // 3. Fetch Category Breakdown
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: queryKeys.dashboardCategories(selectedWorkspace?.id || "", "expense"),
    queryFn: () => queryFunctions.dashboardCategories(selectedWorkspace?.id || "", "expense"),
    enabled: !!selectedWorkspace?.id,
  });

  // 4. Fetch Accounts & Vaults
  const { data: accountsData } = useQuery({
    queryKey: queryKeys.dashboardAccounts(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.dashboardAccounts(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  // 5. Fetch Recent Transactions for Audit & Export
  const { data: txData } = useQuery({
    queryKey: queryKeys.transactions(selectedWorkspace?.id || "", 150),
    queryFn: () => queryFunctions.transactions(selectedWorkspace?.id || "", 150),
    enabled: !!selectedWorkspace?.id,
  });

  const transactions = useMemo(() => {
    return txData?.data?.transactions || [];
  }, [txData]);

  const accounts = useMemo(() => {
    return accountsData?.data?.accounts || [];
  }, [accountsData]);

  // Aggregate Metrics
  const totalBalance = summaryData?.data?.totalBalance || 0;
  const monthlyIncome = summaryData?.data?.monthlyIncome || 0;
  const monthlyExpense = summaryData?.data?.monthlyExpense || 0;
  const netCashflow = monthlyIncome - monthlyExpense;
  const savingsRate = summaryData?.data?.savingsRate || 0;

  // Calculate SaaS Burn Rate & Runway
  const monthlyBurn = monthlyExpense > monthlyIncome ? monthlyExpense - monthlyIncome : monthlyExpense;
  const runwayMonths = monthlyBurn > 0 ? (totalBalance / monthlyBurn).toFixed(1) : "12+";

  // Format Trends for Recharts
  const chartTrends = useMemo(() => {
    const rawTrends = trendsData?.data?.trends || [];
    if (rawTrends.length === 0) {
      // Graceful fallback with current month if no historical trends
      return [
        { month: "Bulan Ini", income: monthlyIncome, expense: monthlyExpense, net: netCashflow },
      ];
    }
    return rawTrends.map((item) => ({
      ...item,
      net: (item.income || 0) - (item.expense || 0),
    }));
  }, [trendsData, monthlyIncome, monthlyExpense, netCashflow]);

  // Cumulative Capital Accumulation Trend
  const cumulativeTrend = useMemo(() => {
    let runningTotal = totalBalance - (netCashflow);
    return chartTrends.map((t) => {
      runningTotal += t.net;
      return {
        month: t.month,
        accumulated: runningTotal,
        net: t.net,
      };
    });
  }, [chartTrends, totalBalance, netCashflow]);

  // Format Categories for Donut & List
  const categoryList = useMemo(() => {
    const raw = categoriesData?.data?.categories || [];
    if (raw.length === 0 && monthlyExpense > 0) {
      return [{ name: "Operasional Umum", value: monthlyExpense, percentage: "100" }];
    }
    return raw;
  }, [categoriesData, monthlyExpense]);

  // Total Category Value for ratio computation
  const totalCategoryExpense = useMemo(() => {
    return categoryList.reduce((sum, c) => sum + (Number(c.value) || 0), 0) || 1;
  }, [categoryList]);

  // Handlers
  const handleRefreshAll = () => {
    refetchSummary();
    refetchTrends();
    refetchCategories();
  };

  const handleExportExcel = () => {
    exportToExcel(workspaceName, currency, transactions, accounts, {
      dateRange: timeRange === "1m" ? "last_30_days" : "all",
    });
  };

  const handleExportPdf = () => {
    exportToPdf(workspaceName, currency, transactions, accounts, {
      dateRange: timeRange === "1m" ? "last_30_days" : "all",
    });
  };

  // Trigger AI Conclusion Analysis
  const handleGenerateAiConclusion = async () => {
    setIsGeneratingConclusion(true);
    try {
      const res = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceName,
          currency,
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories: categoryList,
          accounts,
          transactionCount: transactions.length,
        }),
      });
      const data = await res.json();
      setAiConclusion(data);
    } catch (err) {
      console.error("Gagal meminta kesimpulan AI:", err);
    } finally {
      setIsGeneratingConclusion(false);
    }
  };

  // Trigger Interactive Ask AI
  const handleAskAi = async (questionText?: string) => {
    const q = (questionText || aiQuestion).trim();
    if (!q) return;

    setIsAskingAi(true);
    try {
      const res = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceName,
          currency,
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories: categoryList,
          accounts,
          userQuestion: q,
        }),
      });
      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.error("Gagal bertanya ke AI:", err);
    } finally {
      setIsAskingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ── 1. Header & Actions Bar ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-default-200/60 dark:border-default-800/60">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Financial Analytics & Intelligence
              </h1>
              <Chip size="sm" variant="soft" color="accent" className="font-mono text-[11px] h-5">
                {currency}
              </Chip>
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Visualisasi metrik kas, analisis runway SaaS, serta audit cerdas untuk{" "}
              <strong className="text-foreground font-semibold">{workspaceName}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Filter Pill */}
            <div className="flex items-center p-1 rounded-xl bg-default-100/70 dark:bg-default-800/60 border border-default-200/80 dark:border-default-700/80">
              {(
                [
                  { id: "1m", label: "1 Bulan" },
                  { id: "3m", label: "3 Bulan" },
                  { id: "6m", label: "6 Bulan" },
                  { id: "12m", label: "1 Tahun" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeRange(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    timeRange === t.id
                      ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                      : "text-default-500 hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <Button
              size="sm"
              variant="outline"
              isIconOnly
              onPress={handleRefreshAll}
              className="h-8.5 w-8.5 border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 cursor-pointer shadow-2xs"
              aria-label="Refresh Data Analytics"
            >
              <RefreshCw className="w-3.5 h-3.5 text-default-600" />
            </Button>

            {/* Export Excel Button */}
            <Button
              size="sm"
              variant="outline"
              onPress={handleExportExcel}
              className="h-8.5 px-3 text-xs font-semibold bg-white dark:bg-gray-900 border-default-200 dark:border-default-700 text-foreground hover:bg-default-50 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              <span>Excel</span>
            </Button>

            {/* Export PDF Button */}
            <Button
              size="sm"
              variant="primary"
              onPress={handleExportPdf}
              className="h-8.5 px-3 text-xs font-semibold bg-linear-to-r from-blue-600 to-indigo-600 text-white cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              <span>Cetak PDF</span>
            </Button>
          </div>
        </div>

        {/* ── 2. Top Metric Cards (SaaS KPI Matrix) ────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Revenue / Inflow */}
          <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider block">
                  Total Pemasukan
                </span>
                {isSummaryLoading ? (
                  <Skeleton className="h-8 w-28 rounded-lg mt-1" />
                ) : (
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {formatCurrency(monthlyIncome, currency)}
                  </div>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-default-400 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  Inflow bulan berjalan
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>

          {/* Card 2: Operating Expenses */}
          <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider block">
                  Beban Operasional
                </span>
                {isSummaryLoading ? (
                  <Skeleton className="h-8 w-28 rounded-lg mt-1" />
                ) : (
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5">
                    {formatCurrency(monthlyExpense, currency)}
                  </div>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-default-400 mt-1">
                  <ArrowDownRight className="w-3 h-3 text-rose-500" />
                  Realisasi pengeluaran
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </Card>

          {/* Card 3: Net Cashflow & Profit Margin */}
          <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider block">
                  Laba Bersih Operasional
                </span>
                {isSummaryLoading ? (
                  <Skeleton className="h-8 w-28 rounded-lg mt-1" />
                ) : (
                  <div
                    className={`text-xl sm:text-2xl font-bold tracking-tight mt-0.5 ${
                      netCashflow >= 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {formatCurrency(netCashflow, currency)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                  <span className="text-default-400">Margin:</span>
                  <span
                    className={`font-bold ${
                      savingsRate >= 20 ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {savingsRate}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
            </div>
          </Card>

          {/* Card 4: Liquid Reserve & Runway Simulator */}
          <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider block">
                  Kas Likuid & Runway
                </span>
                {isSummaryLoading ? (
                  <Skeleton className="h-8 w-28 rounded-lg mt-1" />
                ) : (
                  <div className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 mt-0.5">
                    {runwayMonths} <span className="text-sm font-normal text-default-500">Bulan</span>
                  </div>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] text-default-400 mt-1">
                  Cadangan: {formatCurrency(totalBalance, currency)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 shadow-2xs">
                <PieIcon className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* ── 3. AI Financial Advisor & Executive Conclusion ────────────── */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 bg-linear-to-r from-purple-500/5 via-indigo-500/5 to-blue-500/5 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-purple-100 dark:border-purple-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  Nova AI Financial Intelligence & Conclusion
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    CFO Copilot
                  </span>
                </h2>
                <p className="text-[11px] text-default-500">
                  Diagnosis otomatis kesehatan arus kas, simulasi ketahanan modal, dan audit cerdas.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              isDisabled={isGeneratingConclusion}
              onPress={handleGenerateAiConclusion}
              className="h-8 px-3 text-xs font-semibold bg-white dark:bg-gray-900 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 cursor-pointer shadow-2xs self-start md:self-center"
            >
              {isGeneratingConclusion ? (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-purple-500" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
              )}
              <span>{aiConclusion ? "Analisis Ulang AI" : "Generate Kesimpulan AI"}</span>
            </Button>
          </div>

          {/* AI Conclusion Report View */}
          {aiConclusion && (
            <div className="mt-3.5 space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white dark:bg-gray-900 border border-purple-100 dark:border-purple-900/60 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex flex-col items-center justify-center text-purple-600 dark:text-purple-400 font-mono font-bold">
                    <span className="text-base leading-none">{aiConclusion.healthScore}</span>
                    <span className="text-[9px] font-sans font-medium text-default-400">SKOR</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">Status Diagnosis:</span>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={
                          aiConclusion.status === "Sehat"
                            ? "success"
                            : aiConclusion.status === "Cukup Baik"
                            ? "accent"
                            : "danger"
                        }
                        className="text-[10px] h-4.5 font-bold"
                      >
                        {aiConclusion.status}
                      </Chip>
                    </div>
                    <p className="text-xs text-default-600 mt-1 max-w-3xl leading-relaxed">
                      {aiConclusion.summary}
                    </p>
                  </div>
                </div>
                {aiConclusion.savingsPotential && (
                  <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold self-start sm:self-center">
                    💡 {aiConclusion.savingsPotential}
                  </span>
                )}
              </div>

              {/* Insights & Recommendations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Insights List */}
                <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-default-200/60 dark:border-default-800 space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    Poin Kunci Observasi
                  </span>
                  <div className="space-y-1.5">
                    {aiConclusion.insights.map((ins, i) => (
                      <div key={i} className="p-2 rounded-lg bg-default-50 dark:bg-default-800/50 space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-1">
                          {ins.type === "warning" ? (
                            <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                          ) : ins.type === "positive" ? (
                            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Info className="w-3 h-3 text-blue-500 shrink-0" />
                          )}
                          <span>{ins.title}</span>
                        </div>
                        <p className="text-[11px] text-default-500 leading-relaxed pl-4">
                          {ins.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations Checklist */}
                <div className="p-3 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-default-200/60 dark:border-default-800 space-y-2">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    Rekomendasi Strategis CFO
                  </span>
                  <ul className="space-y-1.5">
                    {aiConclusion.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-default-50 dark:bg-default-800/50 text-[11px] text-default-600 leading-relaxed"
                      >
                        <span className="w-4 h-4 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── Interactive "Tanya Nova AI" Prompt Box ──────────────────── */}
          <div className="mt-3.5 pt-3 border-t border-purple-100 dark:border-purple-950 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-default-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                Tanya AI seputar keuangan workspace ini:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  "Apakah burn rate aman?",
                  "Kategori apa yang paling boros?",
                  "Proyeksi kas 3 bulan ke depan?",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setAiQuestion(chip);
                      handleAskAi(chip);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 hover:bg-purple-100 cursor-pointer transition-colors shrink-0"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAi();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Tanyakan analisis keuangan, misal: 'Berapa persen alokasi biaya terbesar dan bagaimana solusinya?'..."
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs text-foreground placeholder-default-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isDisabled={!aiQuestion.trim() || isAskingAi}
                className="h-9 px-4 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs shrink-0"
              >
                {isAskingAi ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Send className="w-3.5 h-3.5 mr-1" />
                )}
                Tanya AI
              </Button>
            </form>

            {/* AI Answer Card */}
            {aiResponse && (
              <div className="mt-2 p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-900 shadow-sm space-y-2 text-xs animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-default-100 dark:border-default-800">
                  <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Jawaban Nova AI Advisor
                  </span>
                  {aiResponse.keyMetricsSummary && (
                    <span className="text-[10px] font-mono text-default-500 bg-default-100 dark:bg-default-800 px-2 py-0.5 rounded-md">
                      {aiResponse.keyMetricsSummary}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                  {aiResponse.answer}
                </p>
                {aiResponse.recommendations && aiResponse.recommendations.length > 0 && (
                  <div className="pt-1.5 flex flex-wrap gap-1.5">
                    {aiResponse.recommendations.map((rec, rIdx) => (
                      <span
                        key={rIdx}
                        className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-medium"
                      >
                        ✓ {rec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* ── 4. Main Analytics Tabs ────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-default-200/60 dark:border-default-800/60 pb-1">
            {[
              { id: "cashflow", label: "Dinamika Arus Kas & Tren", icon: TrendingUp },
              { id: "categories", label: "Distribusi Pos Beban (OPEX)", icon: PieIcon },
              { id: "runway", label: "Runway & Likuiditas Rekening", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20 shadow-2xs"
                      : "text-default-500 hover:text-foreground hover:bg-default-100/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── TAB 1: Cashflow & Trends ───────────────────────────────── */}
          {activeTab === "cashflow" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Revenue vs Expense Bar Chart */}
                <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Perbandingan Inflow vs Outflow</h3>
                      <p className="text-xs text-default-500">Omzet dan pengeluaran bulanan</p>
                    </div>
                  </div>
                  {isTrendsLoading ? (
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                  ) : (
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={chartTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                        <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.4} fontSize={11} />
                        <YAxis
                          stroke="currentColor"
                          strokeOpacity={0.4}
                          fontSize={11}
                          tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--heroui-background, #18181b)",
                            border: "1px solid var(--default-200, #3f3f46)",
                            borderRadius: "10px",
                            fontSize: "12px",
                          }}
                          formatter={(value: unknown) => formatCurrency(Number(value || 0), currency)}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Bar dataKey="income" fill="#10b981" name="Pemasukan" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                {/* Net Cashflow Area Chart */}
                <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Akumulasi Cadangan Kas Bersih</h3>
                      <p className="text-xs text-default-500">Pertumbuhan modal likuid over time</p>
                    </div>
                  </div>
                  {isTrendsLoading ? (
                    <Skeleton className="h-[220px] w-full rounded-xl" />
                  ) : (
                    <ResponsiveContainer width="100%" height={230}>
                      <AreaChart data={cumulativeTrend}>
                        <defs>
                          <linearGradient id="accumulatedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                        <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.4} fontSize={11} />
                        <YAxis
                          stroke="currentColor"
                          strokeOpacity={0.4}
                          fontSize={11}
                          tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--heroui-background, #18181b)",
                            border: "1px solid var(--default-200, #3f3f46)",
                            borderRadius: "10px",
                            fontSize: "12px",
                          }}
                          formatter={(value: unknown) => formatCurrency(Number(value || 0), currency)}
                        />
                        <Area
                          type="monotone"
                          dataKey="accumulated"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#accumulatedGradient)"
                          name="Kas Kumulatif"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* ── TAB 2: Category Breakdown ──────────────────────────────── */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Donut Pie Chart */}
              <Card className="lg:col-span-5 p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Distribusi Beban Pos</h3>
                    <p className="text-xs text-default-500">Porsi pengeluaran berdasarkan kategori</p>
                  </div>
                </div>
                <div className="h-[240px] flex items-center justify-center">
                  {categoryList.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryList}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryList.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--heroui-background, #18181b)",
                            border: "1px solid var(--default-200, #3f3f46)",
                            borderRadius: "8px",
                            fontSize: "11px",
                          }}
                          formatter={(value: unknown) => formatCurrency(Number(value || 0), currency)}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-default-400">Belum ada data transaksi</span>
                  )}
                </div>
              </Card>

              {/* Ranked Category Progress Bars */}
              <Card className="lg:col-span-7 p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Rincian Pos Terbesar</h3>
                    <p className="text-xs text-default-500">Peringkat belanja operasional tertinggi</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-default-500">
                    Total: {formatCurrency(monthlyExpense, currency)}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {categoryList.map((cat, idx) => {
                    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                    const numValue = Number(cat.value) || 0;
                    const pct = Math.min(100, Math.round((numValue / totalCategoryExpense) * 100));
                    return (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="font-semibold text-foreground">{cat.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-foreground">
                              {formatCurrency(numValue, currency)}
                            </span>
                            <span className="text-[10.5px] text-default-400 font-mono w-10 text-right">
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* ── TAB 3: Runway & Vaults ─────────────────────────────────── */}
          {activeTab === "runway" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Runway Scenario Explainer */}
              <Card className="lg:col-span-6 p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Simulasi Ketahanan Modal (Runway)</h3>
                  <p className="text-xs text-default-500">Estimasi waktu bertahan tanpa suntikan pemasukan baru</p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Beban Rata-rata Bulanan (Burn Rate):
                    </span>
                    <span className="font-mono font-bold text-sm text-purple-800 dark:text-purple-200">
                      {formatCurrency(monthlyBurn, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      Cadangan Likuid Saat Ini:
                    </span>
                    <span className="font-mono font-bold text-sm text-purple-800 dark:text-purple-200">
                      {formatCurrency(totalBalance, currency)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-purple-200/80 dark:border-purple-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Estimasi Runway:</span>
                    <span className="font-mono font-extrabold text-base text-purple-600 dark:text-purple-400">
                      {runwayMonths} Bulan
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-default-500 leading-relaxed">
                  * Runway dihitung dari rasio total saldo likuid di seluruh rekening dibagi burn rate bulanan.
                  Standar keamanan institusional merekomendasikan cadangan minimum <strong>6 bulan operasional</strong>.
                </p>
              </Card>

              {/* Liquidity Vaults List */}
              <Card className="lg:col-span-6 p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Rekening & Vaults Terhubung</h3>
                    <p className="text-xs text-default-500">Saldo riil di setiap akun keuangan</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-800 text-default-600">
                    {accounts.length} Akun
                  </span>
                </div>

                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {accounts.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-default-200/60 dark:border-default-800 bg-default-50/50 dark:bg-default-900/30"
                    >
                      <div>
                        <span className="text-xs font-bold text-foreground block">{acc.name}</span>
                        <span className="text-[10px] text-default-400 uppercase font-semibold">
                          {acc.type || "Cash / Bank"}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">
                        {formatCurrency(Number(acc.balance) || 0, acc.currency || currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* ── 5. Audit Trail & Largest Transactions ────────────────────── */}
        <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-950 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-default-100 dark:border-default-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">Audit Trail & Transaksi Terkini</h3>
              <p className="text-xs text-default-500">Rekap transaksi yang tersinkronisasi dalam kalkulasi</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onPress={() => router.push("/transactions")}
              className="h-8 text-xs font-semibold self-start sm:self-center"
            >
              Lihat Semua di Transaksi &rarr;
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-default-100 dark:border-default-800 bg-default-50/60 dark:bg-default-900/40 text-default-500 font-semibold">
                  <th className="text-left py-2.5 px-4">Deskripsi / Judul</th>
                  <th className="text-left py-2.5 px-4">Kategori</th>
                  <th className="text-left py-2.5 px-4">Tanggal</th>
                  <th className="text-right py-2.5 px-4">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 7).map((tx: any) => {
                  const amt = typeof tx.amount === "string" ? parseFloat(tx.amount) : Number(tx.amount || 0);
                  const isIncome = tx.type === "income";
                  const catName = typeof tx.category === "object" ? tx.category?.name : tx.category || "General";
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-default-100 dark:border-default-800/60 hover:bg-default-50/50 dark:hover:bg-default-900/40 transition-colors"
                    >
                      <td className="py-2.5 px-4 font-medium text-foreground">
                        {tx.description || tx.note || "Transaksi"}
                      </td>
                      <td className="py-2.5 px-4">
                        <Chip size="sm" variant="soft" className="text-[10.5px] h-5">
                          {catName}
                        </Chip>
                      </td>
                      <td className="py-2.5 px-4 text-default-400 font-mono text-[11px]">
                        {tx.date ? new Date(tx.date).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-bold ${
                          isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(amt, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
