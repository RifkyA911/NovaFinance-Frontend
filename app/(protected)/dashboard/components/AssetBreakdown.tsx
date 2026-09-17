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

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  bank: { label: "Bank Account", icon: Landmark, color: "#3b82f6" },
  ewallet: { label: "E-Wallet", icon: Wallet, color: "#10b981" },
  cash: { label: "Cash / Tunai", icon: Coins, color: "#f59e0b" },
  credit: { label: "Credit Card", icon: Layers, color: "#8b5cf6" },
  other: { label: "Lainnya", icon: Wallet, color: "#64748b" },
};

export function AssetBreakdown({
  accounts = [],
  formatCurrency,
  currency = "IDR",
}: AssetBreakdownProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"donut" | "bar" | "list">("donut");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [hoveredSlice, setHoveredSlice] = useState<AccountAssetItem | null>(null);

  // Filter accounts by type if selected
  const filteredAccounts = useMemo(() => {
    if (selectedType === "ALL") return accounts;
    return accounts.filter((acc) => {
      const type = (acc.type || "other").toLowerCase();
      return type === selectedType.toLowerCase();
    });
  }, [accounts, selectedType]);

  // Overall calculations
  const totalAssets = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (Number(acc.value) || 0), 0);
  }, [accounts]);

  const topHolding = useMemo(() => {
    if (accounts.length === 0) return null;
    const sorted = [...accounts].sort((a, b) => b.value - a.value);
    const top = sorted[0];
    const percentage = totalAssets > 0 ? Math.round((top.value / totalAssets) * 100) : 0;
    return { ...top, percentage };
  }, [accounts, totalAssets]);

  // Available types in current portfolio
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    accounts.forEach((acc) => {
      if (acc.type) types.add(acc.type.toLowerCase());
    });
    return Array.from(types);
  }, [accounts]);

  // Fallback palette
  const COLORS = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#ec4899", // pink
    "#6366f1", // indigo
    "#14b8a6", // teal
  ];

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 flex flex-col justify-between space-y-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-default-100 dark:border-default-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Landmark className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Asset & Portfolio Breakdown</h3>
              <p className="text-[11px] text-default-500">Distribusi likuiditas & alokasi saldo dompet</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-default-100 dark:bg-default-800 p-0.5 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode("donut")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "donut"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
              title="Donut Allocation Chart"
            >
              <PieIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("bar")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "bar"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
              title="Bar Chart View"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-default-500 hover:text-foreground"
              }`}
              title="Detailed List Breakdown"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="h-8 px-2.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 font-semibold cursor-pointer border border-blue-500/20"
            onPress={() => router.push("/wallets")}
          >
            <span>Master Wallets</span>
            <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800">
          <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider">Total Likuiditas</span>
          <p className="text-sm sm:text-base font-black text-foreground mt-0.5 font-mono">
            {formatCurrency(totalAssets)}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800">
          <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider">Akun Terhubung</span>
          <p className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400 mt-0.5">
            {accounts.length} <span className="text-xs font-normal text-default-400">Akun</span>
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800">
          <span className="text-[10px] uppercase font-bold text-default-400 tracking-wider">Penyimpan Terbesar</span>
          <p className="text-xs font-bold text-foreground mt-0.5 truncate flex items-center gap-1">
            <span className="truncate">{topHolding?.name || "-"}</span>
            {topHolding && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                ({topHolding.percentage}%)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Type Filter Pills */}
      {availableTypes.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedType("ALL")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedType === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
            }`}
          >
            Semua ({accounts.length})
          </button>
          {availableTypes.map((t) => {
            const conf = TYPE_CONFIG[t] || TYPE_CONFIG.other;
            const count = accounts.filter((a) => (a.type || "other").toLowerCase() === t).length;
            const isSelected = selectedType.toLowerCase() === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap capitalize flex items-center gap-1 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
                }`}
              >
                <span>{conf.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Chart Area */}
      <div className="min-h-56">
        {filteredAccounts.length === 0 ? (
          <div className="w-full h-56 flex flex-col items-center justify-center text-default-400 text-xs gap-2 text-center p-4">
            <Landmark className="w-8 h-8 text-default-300" />
            <p>Tidak ada akun untuk filter ini.</p>
            <Button
              size="sm"
              variant="primary"
              className="text-xs bg-blue-600 text-white"
              onPress={() => router.push("/wallets")}
            >
              Tambah Akun Baru
            </Button>
          </div>
        ) : viewMode === "donut" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
            {/* Donut Chart with Center Label */}
            <div className="relative flex items-center justify-center h-60 lg:col-span-5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "11px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    }}
                    formatter={(val: unknown) => [formatCurrency(Number(val) || 0), "Saldo"]}
                  />
                  <Pie
                    data={filteredAccounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    onMouseEnter={(_, idx) => setHoveredSlice(filteredAccounts[idx])}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    {filteredAccounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Info in Donut */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none max-w-32">
                <span className="text-[10px] text-default-400 font-medium truncate w-full">
                  {hoveredSlice ? hoveredSlice.name : "Total Aset"}
                </span>
                <span className="text-xs sm:text-base font-black text-foreground font-mono">
                  {hoveredSlice
                    ? `${totalAssets > 0 ? Math.round((hoveredSlice.value / totalAssets) * 100) : 0}%`
                    : formatCurrency(totalAssets).split(",")[0]}
                </span>
              </div>
            </div>

            {/* Account Allocation Progress List (Right side of Donut) */}
            <div className="lg:col-span-7 max-h-60 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredAccounts.map((acc, index) => {
                  const pct = totalAssets > 0 ? Math.round((acc.value / totalAssets) * 100) : 0;
                  const itemColor = acc.color || COLORS[index % COLORS.length];

                  return (
                    <div
                      key={acc.id || index}
                      className="p-2.5 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800/70 text-xs space-y-1.5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer"
                      onClick={() => router.push("/wallets")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: itemColor }}
                          />
                          <span className="font-bold text-foreground truncate">{acc.name}</span>
                        </div>
                        <span className="font-mono font-bold text-foreground shrink-0 text-[11px]">
                          {formatCurrency(acc.value)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-full bg-default-200 dark:bg-default-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: itemColor }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-default-400 shrink-0 w-8 text-right">
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
          /* Bar Chart View */
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredAccounts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    color: "#fff",
                    fontSize: "11px",
                  }}
                  formatter={(val: unknown) => [formatCurrency(Number(val) || 0), "Saldo"]}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {filteredAccounts.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* Detailed List View */
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {filteredAccounts.map((acc, index) => {
              const pct = totalAssets > 0 ? Math.round((acc.value / totalAssets) * 100) : 0;
              const itemColor = acc.color || COLORS[index % COLORS.length];
              const conf = TYPE_CONFIG[(acc.type || "other").toLowerCase()] || TYPE_CONFIG.other;
              const Icon = conf.icon;

              return (
                <div
                  key={acc.id || index}
                  className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-100 dark:border-default-800 flex items-center justify-between gap-3 hover:border-blue-500/40 transition-all cursor-pointer"
                  onClick={() => router.push("/wallets")}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: itemColor }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{acc.name}</p>
                      <span className="text-[10px] text-default-400 capitalize">{conf.label}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-xs text-foreground">
                      {formatCurrency(acc.value)}
                    </p>
                    <span className="text-[10px] font-semibold text-blue-500">{pct}% porsi</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Insight */}
      <div className="pt-2 border-t border-default-100 dark:border-default-800/80 flex items-center justify-between text-[11px] text-default-400">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <span>Likuiditas tercatat di {accounts.length} akun & dompet aktif</span>
        </span>
        <span className="font-semibold text-foreground font-mono">{currency}</span>
      </div>
    </Card>
  );
}
