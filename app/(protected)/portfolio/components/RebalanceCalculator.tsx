/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import { Scale, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles, DollarSign } from "lucide-react";
import type { PortfolioAsset, AssetCategory } from "../types";
import { CATEGORY_CONFIG } from "../types";

interface RebalanceCalculatorProps {
  assets: PortfolioAsset[];
  formatCurrency: (val: number | string) => string;
}

export function RebalanceCalculator({
  assets,
  formatCurrency,
}: RebalanceCalculatorProps) {
  const [freshCapital, setFreshCapital] = useState<number>(0);

  // Group assets by category and calculate actual values
  const totalValue = useMemo(() => {
    return assets.reduce((sum, ast) => sum + ast.shares * ast.currentPrice, 0);
  }, [assets]);

  const targetCapitalTotal = totalValue + freshCapital;

  const categoryStats = useMemo(() => {
    const map: Record<
      string,
      { category: AssetCategory; actualValue: number; targetPct: number }
    > = {};

    assets.forEach((ast) => {
      const cat = ast.category;
      if (!map[cat]) {
        map[cat] = {
          category: cat,
          actualValue: 0,
          targetPct: 0,
        };
      }
      map[cat].actualValue += ast.shares * ast.currentPrice;
      map[cat].targetPct += ast.targetAllocation;
    });

    return Object.values(map).map((item) => {
      const actualPct = totalValue > 0 ? (item.actualValue / totalValue) * 100 : 0;
      const idealTargetValue = targetCapitalTotal * (item.targetPct / 100);
      const diffNominal = idealTargetValue - item.actualValue;
      const diffPct = item.targetPct - actualPct;

      return {
        ...item,
        actualPct,
        idealTargetValue,
        diffNominal,
        diffPct,
        action: diffNominal > 10000 ? ("BUY" as const) : diffNominal < -10000 ? ("SELL" as const) : ("HOLD" as const),
      };
    });
  }, [assets, totalValue, targetCapitalTotal]);

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-default-100 dark:border-default-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Scale className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Smart Asset Rebalancing Engine
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Modern Portfolio Theory
              </span>
            </h3>
            <p className="text-[11px] text-default-500">
              Kalkulasi perbandingan alokasi aktual vs target ideal untuk menjaga profil risiko
            </p>
          </div>
        </div>

        {/* Fresh Capital Input */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-default-500 text-[11px]">Suntik Modal Baru:</span>
          <select
            value={freshCapital}
            onChange={(e) => setFreshCapital(Number(e.target.value))}
            className="px-2.5 py-1 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs font-semibold cursor-pointer"
          >
            <option value={0}>Rp 0 (Rebalance Murni)</option>
            <option value={5000000}>+ Rp 5.000.000</option>
            <option value={10000000}>+ Rp 10.000.000</option>
            <option value={20000000}>+ Rp 20.000.000</option>
          </select>
        </div>
      </div>

      {/* Allocation Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-default-100 dark:border-default-800 text-default-400 font-medium">
              <th className="text-left pb-2 font-semibold">Kelas Aset</th>
              <th className="text-right pb-2 font-semibold">Nilai Aktual</th>
              <th className="text-center pb-2 font-semibold">Aktual vs Target</th>
              <th className="text-right pb-2 font-semibold">Deviasi</th>
              <th className="text-right pb-2 font-semibold">Aksi Rebalance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-100 dark:divide-default-800/60 font-mono">
            {categoryStats.map((item) => {
              const conf = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.cash;

              return (
                <tr key={item.category} className="hover:bg-default-50/50 dark:hover:bg-default-900/30">
                  <td className="py-2.5 font-sans font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: conf.color }} />
                      <span>{conf.label}</span>
                    </div>
                  </td>

                  <td className="py-2.5 text-right font-bold text-foreground">
                    {formatCurrency(item.actualValue)}
                  </td>

                  <td className="py-2.5 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-default-100 dark:bg-default-800 px-2 py-0.5 rounded-full text-[11px]">
                      <span className="font-bold text-foreground">{item.actualPct.toFixed(1)}%</span>
                      <span className="text-default-400 font-sans text-[10px]">➔</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{item.targetPct}%</span>
                    </div>
                  </td>

                  <td className="py-2.5 text-right font-bold">
                    <span
                      className={
                        Math.abs(item.diffPct) < 2
                          ? "text-default-400"
                          : item.diffPct > 0
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-amber-600 dark:text-amber-400"
                      }
                    >
                      {item.diffPct > 0 ? "+" : ""}
                      {item.diffPct.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-2.5 text-right">
                    {item.action === "BUY" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold">
                        Beli +{formatCurrency(item.diffNominal).split(",")[0]}
                      </span>
                    ) : item.action === "SELL" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                        Jual {formatCurrency(Math.abs(item.diffNominal)).split(",")[0]}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Ideal
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info Tip */}
      <div className="p-2.5 rounded-xl bg-default-50 dark:bg-default-900/30 border border-default-100 dark:border-default-800 flex items-center justify-between text-[11px] text-default-400">
        <span>
          💡 <b>Tips Rebalancing</b>: Lakukan penyesuaian alokasi secara berkala (tiap 6 atau 12 bulan) untuk mengunci cuan dari aset yang naik kencang dan membeli aset bagus yang sedang terdiskon.
        </span>
      </div>
    </Card>
  );
}
