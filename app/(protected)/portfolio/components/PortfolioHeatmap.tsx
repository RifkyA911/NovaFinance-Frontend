/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import { LayoutGrid, PieChart as PieIcon, Info, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import type { PortfolioAsset } from "../types";
import { CATEGORY_CONFIG } from "../types";

interface PortfolioHeatmapProps {
  assets: PortfolioAsset[];
  formatCurrency: (val: number | string) => string;
}

export function PortfolioHeatmap({
  assets,
  formatCurrency,
}: PortfolioHeatmapProps) {
  const [hoveredAsset, setHoveredAsset] = useState<PortfolioAsset | null>(null);

  // Total portfolio value
  const totalValue = useMemo(() => {
    return assets.reduce((sum, ast) => sum + ast.shares * ast.currentPrice, 0);
  }, [assets]);

  // Enriched items with calculated gains and weights
  const heatmapItems = useMemo(() => {
    return assets.map((ast) => {
      const invested = ast.shares * ast.avgBuyPrice;
      const current = ast.shares * ast.currentPrice;
      const gainNominal = current - invested;
      const gainPct = invested > 0 ? (gainNominal / invested) * 100 : 0;
      const weight = totalValue > 0 ? (current / totalValue) * 100 : 0;

      // Determine background color based on gainPct
      // -5% or lower -> deep red, -2% -> soft red, 0% -> neutral, +2% -> soft green, +5%+ -> rich emerald
      let bgStyle = "bg-emerald-600/80 hover:bg-emerald-600";
      let borderStyle = "border-emerald-500/60";
      let textAccent = "text-emerald-200";

      if (gainPct >= 15) {
        bgStyle = "bg-emerald-600 dark:bg-emerald-600 hover:brightness-110";
        borderStyle = "border-emerald-400";
      } else if (gainPct > 0) {
        bgStyle = "bg-emerald-700/80 dark:bg-emerald-700/90 hover:brightness-110";
        borderStyle = "border-emerald-500/50";
      } else if (gainPct === 0) {
        bgStyle = "bg-slate-700/80 dark:bg-slate-800 hover:brightness-110";
        borderStyle = "border-slate-600";
        textAccent = "text-slate-300";
      } else if (gainPct > -5) {
        bgStyle = "bg-rose-700/80 dark:bg-rose-800/90 hover:brightness-110";
        borderStyle = "border-rose-500/50";
        textAccent = "text-rose-200";
      } else {
        bgStyle = "bg-rose-600 dark:bg-rose-600 hover:brightness-110";
        borderStyle = "border-rose-400";
        textAccent = "text-rose-100";
      }

      return {
        ...ast,
        invested,
        current,
        gainNominal,
        gainPct,
        weight,
        bgStyle,
        borderStyle,
        textAccent,
      };
    });
  }, [assets, totalValue]);

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-default-100 dark:border-default-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <LayoutGrid className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Portfolio Heatmap & Finviz-Style Map
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Live Performance
              </span>
            </h3>
            <p className="text-[11px] text-default-500">
              Ukuran kotak proporsional terhadap bobot aset, warna menandakan tingkat Return (PnL)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono">
          <span className="text-default-400">-5%</span>
          <span className="w-3 h-3 rounded bg-rose-600" />
          <span className="w-3 h-3 rounded bg-rose-700/80" />
          <span className="w-3 h-3 rounded bg-slate-700" />
          <span className="w-3 h-3 rounded bg-emerald-700/80" />
          <span className="w-3 h-3 rounded bg-emerald-600" />
          <span className="text-default-400">+15%</span>
        </div>
      </div>

      {/* Finviz Heatmap Grid Container */}
      <div className="min-h-64 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {heatmapItems.map((item) => {
          const isSelected = hoveredAsset?.id === item.id;
          const conf = CATEGORY_CONFIG[item.category];

          // Flex sizing proportional to weight: high weight assets take 2 cols on lg
          const isLarge = item.weight >= 20;

          return (
            <div
              key={item.id}
              onMouseEnter={() => setHoveredAsset(item)}
              onMouseLeave={() => setHoveredAsset(null)}
              className={`relative rounded-xl p-3 text-white transition-all duration-300 border shadow-xs cursor-pointer flex flex-col justify-between ${
                item.bgStyle
              } ${item.borderStyle} ${
                isLarge ? "sm:col-span-2 lg:col-span-2 min-h-36" : "min-h-28"
              } ${isSelected ? "scale-[1.02] shadow-lg ring-2 ring-white/40" : ""}`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-1">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-sm sm:text-base tracking-tight">
                      {item.symbol.replace(".JK", "")}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-black/30 backdrop-blur-xs text-white/90">
                      {item.weight.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{item.name}</p>
                </div>

                <span className="text-[10px] font-mono font-bold bg-black/40 px-1.5 py-0.5 rounded">
                  {conf?.label.split(" ")[0]}
                </span>
              </div>

              {/* Bottom Row */}
              <div className="mt-2 pt-2 border-t border-white/20 flex items-end justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block">
                    Nilai Aset
                  </span>
                  <span className="font-mono font-bold text-xs sm:text-sm">
                    {formatCurrency(item.current).split(",")[0]}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-white/70 block">Return</span>
                  <span className="font-mono font-black text-xs sm:text-sm flex items-center gap-0.5 justify-end">
                    {item.gainPct >= 0 ? "+" : ""}
                    {item.gainPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover Info Tooltip Bar */}
      {hoveredAsset ? (
        <div className="p-3 rounded-xl bg-default-100/80 dark:bg-default-800/60 border border-default-200 dark:border-default-700 flex flex-wrap items-center justify-between gap-2 text-xs transition-all">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{hoveredAsset.name}</span>
            <span className="text-default-400 font-mono">({hoveredAsset.symbol})</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
              {hoveredAsset.sector}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>
              Lot/Koin: <b className="text-foreground">{hoveredAsset.shares}</b>
            </span>
            <span>
              Harga Modal:{" "}
              <b className="text-foreground">{formatCurrency(hoveredAsset.avgBuyPrice)}</b>
            </span>
            <span>
              Harga Pasar:{" "}
              <b className="text-foreground">{formatCurrency(hoveredAsset.currentPrice)}</b>
            </span>
            <span>
              Yield: <b className="text-foreground">{hoveredAsset.dividendYield}%</b>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-default-50 dark:bg-default-900/30 border border-default-100 dark:border-default-800 flex items-center justify-between text-[11px] text-default-400">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            Arahkan kursor pada kotak saham untuk melihat rincian lot, modal beli, dan dividen yield.
          </span>
          <span className="font-mono">Total Portofolio: {formatCurrency(totalValue)}</span>
        </div>
      )}
    </Card>
  );
}
