/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { TrendingUp, TrendingDown, Globe, Clock, CheckCircle2 } from "lucide-react";

export interface GlobalIndex {
  id: string;
  name: string;
  symbol: string;
  country: string;
  flag: string;
  value: number;
  change: number; // percentage
  changePoints: number;
  currency: string;
  isOpen: boolean;
  marketSession: string;
}

export const GLOBAL_INDICES: GlobalIndex[] = [
  {
    id: "ihsg",
    name: "IHSG (IDX Composite)",
    symbol: "^JKSE",
    country: "Indonesia",
    flag: "🇮🇩",
    value: 7850.45,
    change: 1.24,
    changePoints: 96.2,
    currency: "IDR",
    isOpen: true,
    marketSession: "Session 2",
  },
  {
    id: "sp500",
    name: "S&P 500",
    symbol: "^GSPC",
    country: "United States",
    flag: "🇺🇸",
    value: 5751.13,
    change: 0.42,
    changePoints: 24.1,
    currency: "USD",
    isOpen: false,
    marketSession: "Pre-Market",
  },
  {
    id: "nasdaq",
    name: "NASDAQ 100",
    symbol: "^NDX",
    country: "United States",
    flag: "🇺🇸",
    value: 20008.62,
    change: 0.83,
    changePoints: 164.5,
    currency: "USD",
    isOpen: false,
    marketSession: "Pre-Market",
  },
  {
    id: "nikkei",
    name: "Nikkei 225",
    symbol: "^N225",
    country: "Japan",
    flag: "🇯🇵",
    value: 38720.15,
    change: -0.65,
    changePoints: -253.4,
    currency: "JPY",
    isOpen: true,
    marketSession: "Regular",
  },
  {
    id: "hangseng",
    name: "Hang Seng",
    symbol: "^HSI",
    country: "Hong Kong",
    flag: "🇭🇰",
    value: 18258.74,
    change: 1.88,
    changePoints: 337.1,
    currency: "HKD",
    isOpen: true,
    marketSession: "Regular",
  },
  {
    id: "ftse",
    name: "FTSE 100",
    symbol: "^FTSE",
    country: "United Kingdom",
    flag: "🇬🇧",
    value: 8273.32,
    change: 0.15,
    changePoints: 12.4,
    currency: "GBP",
    isOpen: true,
    marketSession: "Regular",
  },
  {
    id: "dax",
    name: "DAX 40",
    symbol: "^GDAXI",
    country: "Germany",
    flag: "🇩🇪",
    value: 18699.4,
    change: -0.32,
    changePoints: -60.1,
    currency: "EUR",
    isOpen: true,
    marketSession: "Regular",
  },
  {
    id: "gold",
    name: "Gold (XAU/USD)",
    symbol: "XAU/USD",
    country: "Global",
    flag: "🪙",
    value: 2618.5,
    change: 0.62,
    changePoints: 16.2,
    currency: "USD",
    isOpen: true,
    marketSession: "Live 24h",
  },
  {
    id: "crypto_cap",
    name: "Total Crypto Market",
    symbol: "TOTAL",
    country: "Global",
    flag: "⚡",
    value: 2340000000000,
    change: 2.75,
    changePoints: 62000000000,
    currency: "USD",
    isOpen: true,
    marketSession: "Live 24h",
  },
];

interface GlobalIndexTickerProps {
  selectedIndex: string;
  onSelectIndex: (id: string) => void;
}

export function GlobalIndexTicker({
  selectedIndex,
  onSelectIndex,
}: GlobalIndexTickerProps) {
  return (
    <div className="w-full rounded-2xl border border-default-200/80 dark:border-default-800 bg-white/70 dark:bg-gray-900/70 p-3 shadow-2xs backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground">Global Market Indices Watch</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Default: IHSG 🇮🇩
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-default-400">
          <Clock className="w-3 h-3" />
          <span>Live Market Feed</span>
        </div>
      </div>

      {/* Horizontal Scrollable Index Badges */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 pt-0.5">
        {GLOBAL_INDICES.map((idx) => {
          const isSelected = selectedIndex === idx.id;
          const isPositive = idx.change >= 0;

          return (
            <button
              key={idx.id}
              type="button"
              onClick={() => onSelectIndex(idx.id)}
              className={`shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-blue-500 bg-blue-500/10 shadow-xs ring-1 ring-blue-500/30"
                  : "border-default-200/60 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40 hover:bg-default-100/70 hover:border-default-300"
              }`}
            >
              <span className="text-base">{idx.flag}</span>
              <div className="min-w-24">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-foreground truncate max-w-28">
                    {idx.name}
                  </span>
                  {idx.isOpen && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[11px] font-semibold text-default-600 dark:text-default-300">
                    {idx.id === "crypto_cap"
                      ? `$${(idx.value / 1e12).toFixed(2)}T`
                      : idx.value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold flex items-center ${
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {idx.change}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
