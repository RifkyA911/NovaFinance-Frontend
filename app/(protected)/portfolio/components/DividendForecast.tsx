/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { Card } from "@heroui/react";
import { Coins, Calendar, TrendingUp, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PortfolioAsset } from "../types";

interface DividendForecastProps {
  assets: PortfolioAsset[];
  formatCurrency: (val: number | string) => string;
}

export function DividendForecast({
  assets,
  formatCurrency,
}: DividendForecastProps) {
  // Compute monthly expected dividend flow
  // SBN pays monthly/semi-annual, BBCA/BBRI pay in March & November, Sucorinvest monthly
  const { monthlyData, totalAnnual } = useMemo(() => {
    let totalAnnual = 0;
    const monthlySum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    assets.forEach((ast) => {
      const marketVal = ast.shares * ast.currentPrice;
      const annualYield = (marketVal * ast.dividendYield) / 100;
      totalAnnual += annualYield;

      if (ast.category === "bonds" || ast.category === "cash") {
        // Distributed monthly
        const perMonth = annualYield / 12;
        for (let m = 0; m < 12; m++) {
          monthlySum[m] += perMonth;
        }
      } else if (ast.dividendYield > 0) {
        // Stocks usually pay in March (Q1 final) and November (interim)
        monthlySum[2] += annualYield * 0.7; // March
        monthlySum[10] += annualYield * 0.3; // November
      }
    });

    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const monthlyData = months.map((m, idx) => ({
      month: m,
      dividend: Math.round(monthlySum[idx]),
    }));

    return { monthlyData, totalAnnual };
  }, [assets]);

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-default-100 dark:border-default-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Coins className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Dividend & Passive Income Calendar
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Cashflow Generator
              </span>
            </h3>
            <p className="text-[11px] text-default-500">
              Proyeksi distribusi dividen saham dan imbal hasil kupon SBN per bulan
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-default-400 block font-sans">
            Total Estimasi Tahunan
          </span>
          <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base">
            {formatCurrency(totalAnnual)}
          </span>
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="h-48 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 5, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
            <YAxis
              stroke="#9ca3af"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "0.75rem",
                color: "#fff",
                fontSize: "11px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
              }}
              formatter={(val: unknown) => [formatCurrency(Number(val) || 0), "Dividen"]}
            />
            <Bar dataKey="dividend" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Highlights */}
      <div className="flex items-center justify-between text-[11px] text-default-500 pt-1 border-t border-default-100 dark:border-default-800">
        <span>Rata-rata Arus Kas Pasif: <b className="text-foreground font-mono">{formatCurrency(totalAnnual / 12).split(",")[0]}/bulan</b></span>
        <span className="text-amber-600 dark:text-amber-400 font-medium">Musim Dividen: Maret & November</span>
      </div>
    </Card>
  );
}
