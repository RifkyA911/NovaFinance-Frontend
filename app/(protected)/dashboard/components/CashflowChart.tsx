/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import {
  Layers,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Activity,
  ChevronDown,
  X,
} from "lucide-react";
import { Card, Button } from "@heroui/react";

export type ChartScale = "1D" | "1W" | "1M" | "1Y" | "5Y" | "CUSTOM";
export type ChartType = "area" | "bar" | "net";

interface CashflowChartProps {
  rawTransactions: any[];
  backendTrends?: any[];
  currency?: string;
}

export default function CashflowChart({
  rawTransactions,
  backendTrends = [],
  currency = "IDR",
}: CashflowChartProps) {
  // Chart visual type: Area, Bar, or Net Cashflow Line
  const [chartType, setChartType] = useState<ChartType>("area");

  // Time scale
  const [scale, setScale] = useState<ChartScale>("1M");

  // Custom date range state
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatCompactNumber = (val: number) => {
    if (Math.abs(val) >= 1000000000) {
      return `${(val / 1000000000).toFixed(1)}B`;
    }
    if (Math.abs(val) >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(val) >= 1000) {
      return `${(val / 1000).toFixed(0)}k`;
    }
    return String(val);
  };

  // Generate bucketed data according to chosen scale
  const { chartData, periodTotals } = useMemo(() => {
    const now = new Date();
    const dataPoints: Array<{
      key: string;
      label: string;
      fullDate: string;
      income: number;
      expense: number;
      net: number;
    }> = [];

    // Setup buckets
    if (scale === "1D") {
      // 6 time intervals today: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
      const hours = [0, 4, 8, 12, 16, 20];
      hours.forEach((hr) => {
        const label = `${String(hr).padStart(2, "0")}:00`;
        dataPoints.push({
          key: label,
          label,
          fullDate: `Hari ini, ${label}`,
          income: 0,
          expense: 0,
          net: 0,
        });
      });
    } else if (scale === "1W") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ymd = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
        });
        const fullDate = d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        dataPoints.push({
          key: ymd,
          label,
          fullDate,
          income: 0,
          expense: 0,
          net: 0,
        });
      }
    } else if (scale === "1M") {
      // Last 30 days
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const ymd = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        const fullDate = d.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        dataPoints.push({
          key: ymd,
          label,
          fullDate,
          income: 0,
          expense: 0,
          net: 0,
        });
      }
    } else if (scale === "1Y") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("id-ID", {
          month: "short",
          year: "2-digit",
        });
        const fullDate = d.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
        dataPoints.push({
          key: yearMonth,
          label,
          fullDate,
          income: 0,
          expense: 0,
          net: 0,
        });
      }
    } else if (scale === "5Y") {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const year = String(now.getFullYear() - i);
        dataPoints.push({
          key: year,
          label: year,
          fullDate: `Tahun ${year}`,
          income: 0,
          expense: 0,
          net: 0,
        });
      }
    } else if (scale === "CUSTOM") {
      // Custom date range
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const diffDays = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );

      if (diffDays <= 35) {
        // Daily buckets
        for (let i = 0; i < diffDays; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          if (d > end) break;
          const ymd = d.toISOString().split("T")[0];
          const label = d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          });
          dataPoints.push({
            key: ymd,
            label,
            fullDate: d.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            income: 0,
            expense: 0,
            net: 0,
          });
        }
      } else {
        // Monthly buckets for longer periods
        const cur = new Date(start.getFullYear(), start.getMonth(), 1);
        while (cur <= end) {
          const yearMonth = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
          const label = cur.toLocaleDateString("id-ID", {
            month: "short",
            year: "2-digit",
          });
          dataPoints.push({
            key: yearMonth,
            label,
            fullDate: cur.toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            }),
            income: 0,
            expense: 0,
            net: 0,
          });
          cur.setMonth(cur.getMonth() + 1);
        }
      }
    }

    // Index points for O(1) lookup
    const pointMap = new Map<string, (typeof dataPoints)[0]>();
    dataPoints.forEach((p) => pointMap.set(p.key, p));

    let totalIn = 0;
    let totalOut = 0;

    // Aggregate transactions into buckets
    rawTransactions.forEach((tx: any) => {
      const amount = Math.abs(Number(tx.amount) || 0);
      const isIncome = tx.type?.toLowerCase() === "income";
      const txDate = new Date(tx.date || tx.createdAt);
      if (isNaN(txDate.getTime())) return;

      const ymd = txDate.toISOString().split("T")[0];
      const yearMonth = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, "0")}`;
      const yearStr = String(txDate.getFullYear());

      if (scale === "1D") {
        const isToday = ymd === now.toISOString().split("T")[0];
        if (isToday) {
          const hour = txDate.getHours();
          const bucketHr = Math.floor(hour / 4) * 4;
          const bucketKey = `${String(bucketHr).padStart(2, "0")}:00`;
          const pt = pointMap.get(bucketKey);
          if (pt) {
            if (isIncome) {
              pt.income += amount;
              totalIn += amount;
            } else {
              pt.expense += amount;
              totalOut += amount;
            }
          }
        }
      } else if (scale === "1W" || scale === "1M") {
        const pt = pointMap.get(ymd);
        if (pt) {
          if (isIncome) {
            pt.income += amount;
            totalIn += amount;
          } else {
            pt.expense += amount;
            totalOut += amount;
          }
        }
      } else if (scale === "1Y") {
        const pt = pointMap.get(yearMonth);
        if (pt) {
          if (isIncome) {
            pt.income += amount;
            totalIn += amount;
          } else {
            pt.expense += amount;
            totalOut += amount;
          }
        }
      } else if (scale === "5Y") {
        const pt = pointMap.get(yearStr);
        if (pt) {
          if (isIncome) {
            pt.income += amount;
            totalIn += amount;
          } else {
            pt.expense += amount;
            totalOut += amount;
          }
        }
      } else if (scale === "CUSTOM") {
        // Match either YMD or YearMonth
        const pt = pointMap.get(ymd) || pointMap.get(yearMonth);
        if (pt) {
          if (isIncome) {
            pt.income += amount;
            totalIn += amount;
          } else {
            pt.expense += amount;
            totalOut += amount;
          }
        }
      }
    });

    // Calculate net for each point
    dataPoints.forEach((p) => {
      p.net = p.income - p.expense;
    });

    return {
      chartData: dataPoints,
      periodTotals: {
        totalIncome: totalIn,
        totalExpense: totalOut,
        netCashflow: totalIn - totalOut,
        savingsRate:
          totalIn > 0 ? Math.max(0, ((totalIn - totalOut) / totalIn) * 100) : 0,
      },
    };
  }, [rawTransactions, scale, customStartDate, customEndDate]);

  // Fallback to backend trends if 1M has no raw transactions but backend trends exist
  const finalChartData = useMemo(() => {
    const hasData = chartData.some((d) => d.income > 0 || d.expense > 0);
    if (!hasData && backendTrends.length > 0 && scale === "1Y") {
      return backendTrends.map((t: any) => ({
        key: t.month,
        label: t.month,
        fullDate: t.month,
        income: Number(t.income) || 0,
        expense: Number(t.expense) || 0,
        net: (Number(t.income) || 0) - (Number(t.expense) || 0),
      }));
    }
    return chartData;
  }, [chartData, backendTrends, scale]);

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-3.5 sm:p-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-default-100 dark:border-default-800">
        <div>
          <div className="flex items-center gap-2">
            <Card.Title className="text-sm sm:text-base font-bold text-foreground tracking-tight">
              Cashflow Performance
            </Card.Title>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Skala {scale}
            </span>
          </div>
          <Card.Description className="text-xs text-default-500 mt-0.5">
            Grafik arus masuk vs keluar dengan opsi rentang waktu fleksibel
          </Card.Description>
        </div>

        {/* Scale & Chart Type Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Scale Selector (1D, 1W, 1M, 1Y, 5Y, Custom) */}
          <div className="flex items-center p-1 rounded-xl bg-default-100 dark:bg-default-800/80 border border-default-200/60 dark:border-default-700/60 text-xs">
            {(["1D", "1W", "1M", "1Y", "5Y"] as ChartScale[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setScale(s);
                  setShowCustomPicker(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  scale === s
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setScale("CUSTOM");
                setShowCustomPicker(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                scale === "CUSTOM"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <Calendar className="w-3 h-3" />
              Custom
            </button>
          </div>

          {/* Chart Type Selector: Area vs Bar vs Net Cashflow */}
          <div className="flex items-center p-1 rounded-xl bg-default-100 dark:bg-default-800/80 border border-default-200/60 dark:border-default-700/60 text-xs">
            <button
              type="button"
              onClick={() => setChartType("area")}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                chartType === "area"
                  ? "bg-white dark:bg-gray-900 text-foreground shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
              title="Grafik Area Spline"
            >
              <Layers className="w-3 h-3 inline mr-1" />
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartType("bar")}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                chartType === "bar"
                  ? "bg-white dark:bg-gray-900 text-foreground shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
              title="Grafik Batang (Bar)"
            >
              <BarChart3 className="w-3 h-3 inline mr-1" />
              Bar
            </button>
            <button
              type="button"
              onClick={() => setChartType("net")}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                chartType === "net"
                  ? "bg-white dark:bg-gray-900 text-foreground shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
              title="Grafik Garis Saldo Bersih (Net)"
            >
              <Activity className="w-3 h-3 inline mr-1" />
              Net
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker Sub-bar (Only when Custom is active) */}
      {scale === "CUSTOM" && showCustomPicker && (
        <div className="mt-3 p-3 rounded-xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground text-[11px] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-500" />
              Rentang Tanggal Kustom:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-default-500">Dari:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-7.5 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs text-foreground focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-default-500">Sampai:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-7.5 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-xs text-foreground focus:outline-hidden"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomPicker(false)}
            className="text-xs text-default-400 hover:text-foreground font-medium flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Tutup
          </button>
        </div>
      )}

      {/* Mini KPI Highlights for current scale */}
      <div className="grid grid-cols-3 gap-2 py-3">
        <div className="flex flex-col">
          <span className="text-[11px] text-default-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            Inflow ({scale})
          </span>
          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(periodTotals.totalIncome)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] text-default-400 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-rose-500" />
            Outflow ({scale})
          </span>
          <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
            {formatCurrency(periodTotals.totalExpense)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] text-default-400 font-medium flex items-center gap-1">
            <Wallet className="w-3 h-3 text-blue-500" />
            Net Cashflow
          </span>
          <span
            className={`text-xs sm:text-sm font-bold ${
              periodTotals.netCashflow >= 0
                ? "text-blue-600 dark:text-blue-400"
                : "text-rose-500"
            }`}
          >
            {formatCurrency(periodTotals.netCashflow)}
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full pt-1">
        <ResponsiveContainer width="100%" height={240}>
          {chartType === "area" ? (
            <AreaChart
              data={finalChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cfIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cfExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.12}
              />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                interval={scale === "1M" ? 3 : 0}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => formatCompactNumber(Number(val) || 0)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-gray-900/95 backdrop-blur-md border border-gray-800 text-white shadow-xl text-xs space-y-1.5">
                        <div className="font-semibold text-[11px] text-gray-300 border-b border-gray-800 pb-1">
                          {data.fullDate || label}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Pemasukan:
                          </span>
                          <span className="font-bold">
                            {formatCurrency(data.income)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-rose-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Pengeluaran:
                          </span>
                          <span className="font-bold">
                            {formatCurrency(data.expense)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-800 text-gray-200">
                          <span>Net Cashflow:</span>
                          <span
                            className={`font-bold ${
                              data.net >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {formatCurrency(data.net)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cfIncomeGrad)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#cfExpenseGrad)"
                name="Expense"
              />
            </AreaChart>
          ) : chartType === "bar" ? (
            <BarChart
              data={finalChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.12}
              />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                interval={scale === "1M" ? 3 : 0}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => formatCompactNumber(Number(val) || 0)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-gray-900/95 backdrop-blur-md border border-gray-800 text-white shadow-xl text-xs space-y-1.5">
                        <div className="font-semibold text-[11px] text-gray-300 border-b border-gray-800 pb-1">
                          {data.fullDate || label}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Pemasukan:
                          </span>
                          <span className="font-bold">
                            {formatCurrency(data.income)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-rose-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Pengeluaran:
                          </span>
                          <span className="font-bold">
                            {formatCurrency(data.expense)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-800 text-gray-200">
                          <span>Net Cashflow:</span>
                          <span
                            className={`font-bold ${
                              data.net >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {formatCurrency(data.net)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="income"
                fill="#10b981"
                radius={[3, 3, 0, 0]}
                name="Income"
              />
              <Bar
                dataKey="expense"
                fill="#ef4444"
                radius={[3, 3, 0, 0]}
                name="Expense"
              />
            </BarChart>
          ) : (
            <LineChart
              data={finalChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                opacity={0.12}
              />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                interval={scale === "1M" ? 3 : 0}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => formatCompactNumber(Number(val) || 0)}
              />
              <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-gray-900/95 backdrop-blur-md border border-gray-800 text-white shadow-xl text-xs space-y-1.5">
                        <div className="font-semibold text-[11px] text-gray-300 border-b border-gray-800 pb-1">
                          {data.fullDate || label}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-blue-400">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Net Surplus / Defisit:
                          </span>
                          <span
                            className={`font-bold ${
                              data.net >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {formatCurrency(data.net)}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-800 flex justify-between">
                          <span>In: {formatCurrency(data.income)}</span>
                          <span>Out: {formatCurrency(data.expense)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 2, fill: "#3b82f6" }}
                activeDot={{ r: 5 }}
                name="Net Cashflow"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
