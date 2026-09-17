/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { Card } from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Coins,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import type { PortfolioAsset } from "../types";

interface PortfolioMetricsProps {
  assets: PortfolioAsset[];
  formatCurrency: (val: number | string) => string;
}

export function PortfolioMetrics({
  assets,
  formatCurrency,
}: PortfolioMetricsProps) {
  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    let totalAnnualDividend = 0;

    assets.forEach((ast) => {
      const invested = ast.shares * ast.avgBuyPrice;
      const current = ast.shares * ast.currentPrice;
      totalInvested += invested;
      totalCurrent += current;
      if (ast.dividendYield > 0) {
        totalAnnualDividend += current * (ast.dividendYield / 100);
      }
    });

    const gainNominal = totalCurrent - totalInvested;
    const gainPct = totalInvested > 0 ? (gainNominal / totalInvested) * 100 : 0;
    const blendedYield = totalCurrent > 0 ? (totalAnnualDividend / totalCurrent) * 100 : 0;

    // Calculate diversification score
    // Max weight of single asset
    let maxWeight = 0;
    assets.forEach((ast) => {
      const weight = totalCurrent > 0 ? (ast.shares * ast.currentPrice) / totalCurrent : 0;
      if (weight > maxWeight) maxWeight = weight;
    });

    // Score from 100
    // If maxWeight < 0.3 -> great (90+), if maxWeight > 0.5 -> risky
    let healthScore = 92;
    let healthLabel = "Sangat Sehat";
    let healthColor = "text-emerald-600 dark:text-emerald-400";
    let healthBg = "bg-emerald-500/10";

    if (maxWeight > 0.5) {
      healthScore = 65;
      healthLabel = "Konsentrasi Tinggi";
      healthColor = "text-rose-600 dark:text-rose-400";
      healthBg = "bg-rose-500/10";
    } else if (maxWeight > 0.35) {
      healthScore = 78;
      healthLabel = "Cukup Berimbang";
      healthColor = "text-amber-600 dark:text-amber-400";
      healthBg = "bg-amber-500/10";
    }

    return {
      totalInvested,
      totalCurrent,
      gainNominal,
      gainPct,
      totalAnnualDividend,
      blendedYield,
      healthScore,
      healthLabel,
      healthColor,
      healthBg,
      assetCount: assets.length,
    };
  }, [assets]);

  const isProfit = stats.gainNominal >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. Total Portfolio Value */}
      <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs bg-white dark:bg-gray-900 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-default-500">Total Nilai Portofolio</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-black font-mono text-foreground">
            {formatCurrency(stats.totalCurrent)}
          </p>
          <p className="text-[11px] text-default-400 font-mono mt-0.5">
            Modal Beli: {formatCurrency(stats.totalInvested).split(",")[0]}
          </p>
        </div>
      </Card>

      {/* 2. Total Unrealized PnL */}
      <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs bg-white dark:bg-gray-900 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-default-500">Unrealized Gain / Loss</span>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isProfit ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            }`}
          >
            {isProfit ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <p
            className={`text-xl sm:text-2xl font-black font-mono ${
              isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isProfit ? "+" : ""}
            {formatCurrency(stats.gainNominal)}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${
                isProfit
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isProfit ? "+" : ""}
              {stats.gainPct.toFixed(2)}%
            </span>
            <span className="text-[10px] text-default-400">Total Return</span>
          </div>
        </div>
      </Card>

      {/* 3. Est. Annual Dividends / Cashflow */}
      <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs bg-white dark:bg-gray-900 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-default-500">Proyeksi Pasif Income / Thn</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
            {formatCurrency(stats.totalAnnualDividend)}
          </p>
          <p className="text-[11px] text-default-400 font-mono mt-0.5">
            Avg Yield: <b className="text-foreground">{stats.blendedYield.toFixed(2)}%/thn</b> (~
            {formatCurrency(stats.totalAnnualDividend / 12).split(",")[0]}/bln)
          </p>
        </div>
      </Card>

      {/* 4. Diversification & Risk Score */}
      <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs bg-white dark:bg-gray-900 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-default-500">Skor Diversifikasi Portofolio</span>
          <div className={`w-8 h-8 rounded-xl ${stats.healthBg} flex items-center justify-center ${stats.healthColor}`}>
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl sm:text-2xl font-black font-mono text-foreground">
              {stats.healthScore}
              <span className="text-xs text-default-400 font-normal">/100</span>
            </p>
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${stats.healthBg} ${stats.healthColor}`}>
              {stats.healthLabel}
            </span>
          </div>
          <p className="text-[11px] text-default-400 mt-0.5">
            Tersebar di {stats.assetCount} aset pada 7 kelas investasi
          </p>
        </div>
      </Card>
    </div>
  );
}
