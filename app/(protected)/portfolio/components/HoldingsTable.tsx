/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { PortfolioAsset, AssetCategory } from "../types";
import { CATEGORY_CONFIG } from "../types";

interface HoldingsTableProps {
  assets: PortfolioAsset[];
  formatCurrency: (val: number | string) => string;
  onAddAsset: () => void;
  onDeleteAsset: (id: string) => void;
  onEditAsset: (asset: PortfolioAsset) => void;
}

export function HoldingsTable({
  assets,
  formatCurrency,
  onAddAsset,
  onDeleteAsset,
  onEditAsset,
}: HoldingsTableProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"value" | "gain" | "name" | "yield">("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtered and sorted assets
  const processedAssets = useMemo(() => {
    let list = [...assets];

    // Filter by category
    if (selectedCategory !== "ALL") {
      list = list.filter((a) => a.category === selectedCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.symbol.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.sector.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      const valA = a.shares * a.currentPrice;
      const valB = b.shares * b.currentPrice;
      const gainA = (a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice;
      const gainB = (b.currentPrice - b.avgBuyPrice) / b.avgBuyPrice;

      if (sortBy === "value") return sortOrder === "desc" ? valB - valA : valA - valB;
      if (sortBy === "gain") return sortOrder === "desc" ? gainB - gainA : gainA - gainB;
      if (sortBy === "yield") return sortOrder === "desc" ? b.dividendYield - a.dividendYield : a.dividendYield - b.dividendYield;
      if (sortBy === "name") return sortOrder === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [assets, selectedCategory, search, sortBy, sortOrder]);

  const toggleSort = (col: "value" | "gain" | "name" | "yield") => {
    if (sortBy === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  // Sparkline renderer
  const renderSparkline = (points: number[], isProfitable: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const height = 24;
    const width = 64;

    const coords = points.map((val, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const color = isProfitable ? "#10b981" : "#ef4444";

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords.join(" ")}
        />
      </svg>
    );
  };

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-default-100 dark:border-default-800">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            Asset Holdings & Investment Book
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {processedAssets.length} Posisi
            </span>
          </h3>
          <p className="text-[11px] text-default-500">
            Daftar kepemilikan saham, obligasi, kripto, dan emas dengan kalkulasi Real-time PnL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            className="bg-blue-600 text-white text-xs font-semibold h-8 px-3 rounded-xl flex items-center gap-1.5 shadow-xs"
            onPress={onAddAsset}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Posisi Aset</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto py-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
            }`}
          >
            Semua ({assets.length})
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => {
            const count = assets.filter((a) => a.category === key).length;
            const isSel = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSel
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
                }`}
              >
                {conf.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari simbol saham, nama, atau sektor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 px-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-default-100 dark:border-default-800 bg-default-50/50 dark:bg-default-900/40 text-default-500 font-semibold">
              <th
                className="py-2.5 px-3 text-left cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("name")}
              >
                Aset / Ticker
              </th>
              <th className="py-2.5 px-3 text-left">Kategori & Sektor</th>
              <th className="py-2.5 px-3 text-right">Kepemilikan</th>
              <th className="py-2.5 px-3 text-right">Harga Modal</th>
              <th className="py-2.5 px-3 text-right">Harga Pasar</th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("value")}
              >
                Total Nilai
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("gain")}
              >
                Unrealized Return
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-foreground"
                onClick={() => toggleSort("yield")}
              >
                Div. Yield
              </th>
              <th className="py-2.5 px-3 text-center">Tren 7H</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-default-100 dark:divide-default-800/60 font-mono">
            {processedAssets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-default-400 font-sans text-xs">
                  Tidak ada aset yang sesuai dengan pencarian atau filter.
                </td>
              </tr>
            ) : (
              processedAssets.map((ast) => {
                const totalInvested = ast.shares * ast.avgBuyPrice;
                const totalCurrent = ast.shares * ast.currentPrice;
                const gainNominal = totalCurrent - totalInvested;
                const gainPct = totalInvested > 0 ? (gainNominal / totalInvested) * 100 : 0;
                const isProfitable = gainNominal >= 0;
                const conf = CATEGORY_CONFIG[ast.category] || CATEGORY_CONFIG.cash;

                return (
                  <tr
                    key={ast.id}
                    className="hover:bg-default-50/70 dark:hover:bg-default-900/40 transition-colors"
                  >
                    {/* Symbol & Name */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0"
                          style={{ backgroundColor: `${conf.color}15`, color: conf.color }}
                        >
                          {ast.symbol.slice(0, 2)}
                        </div>
                        <div className="font-sans min-w-0">
                          <p className="font-bold text-foreground text-xs leading-none">
                            {ast.symbol}
                          </p>
                          <p className="text-[10px] text-default-400 truncate max-w-36 mt-0.5">
                            {ast.name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Sector */}
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${conf.bg}`}>
                        {conf.label}
                      </span>
                      <p className="text-[10px] text-default-400 mt-0.5">{ast.sector}</p>
                    </td>

                    {/* Shares */}
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      {ast.shares.toLocaleString()}
                    </td>

                    {/* Avg Buy Price */}
                    <td className="py-2.5 px-3 text-right text-default-500">
                      {formatCurrency(ast.avgBuyPrice)}
                    </td>

                    {/* Current Price */}
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">
                      {formatCurrency(ast.currentPrice)}
                    </td>

                    {/* Total Market Value */}
                    <td className="py-2.5 px-3 text-right font-black text-foreground">
                      {formatCurrency(totalCurrent)}
                    </td>

                    {/* Unrealized Return */}
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-bold inline-block ${
                          isProfitable
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isProfitable ? "+" : ""}
                        {formatCurrency(gainNominal).split(",")[0]}
                      </span>
                      <p
                        className={`text-[10px] font-bold ${
                          isProfitable
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isProfitable ? "+" : ""}
                        {gainPct.toFixed(2)}%
                      </p>
                    </td>

                    {/* Dividend Yield */}
                    <td className="py-2.5 px-3 text-right">
                      {ast.dividendYield > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold">
                          {ast.dividendYield}%
                        </span>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </td>

                    {/* Sparkline */}
                    <td className="py-2.5 px-3 text-center">
                      {renderSparkline(ast.sparkline, isProfitable)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEditAsset(ast)}
                          className="p-1 rounded-lg text-default-400 hover:text-blue-500 hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
                          title="Edit Posisi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAsset(ast.id)}
                          className="p-1 rounded-lg text-default-400 hover:text-rose-500 hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
                          title="Hapus Aset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
