/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { Card, Button } from "@heroui/react";
import { PieChart, Tag, ArrowUpRight, TrendingDown, TrendingUp, Layers } from "lucide-react";

interface ExpenseBreakdownProps {
  categoryViewType: "expense" | "income";
  setCategoryViewType: (val: "expense" | "income") => void;
  spendingCategories: any[];
  formatCurrency: (val: number | string) => string;
}

export function ExpenseBreakdown({
  categoryViewType,
  setCategoryViewType,
  spendingCategories,
  formatCurrency,
}: ExpenseBreakdownProps) {
  // Aggregate total
  const totalAmount = useMemo(() => {
    return spendingCategories.reduce((sum, cat) => sum + (Number(cat.value) || 0), 0);
  }, [spendingCategories]);

  // Top category
  const topCategory = useMemo(() => {
    if (spendingCategories.length === 0) return null;
    return [...spendingCategories].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))[0];
  }, [spendingCategories]);

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-default-100 dark:border-default-800">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              categoryViewType === "expense"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <PieChart className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              {categoryViewType === "expense" ? "Expense Breakdown" : "Income Breakdown"}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  categoryViewType === "expense"
                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {spendingCategories.length} Kategori
              </span>
            </h3>
            <p className="text-[11px] text-default-500">Distribusi pengeluaran berdasarkan pos anggaran</p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center gap-1 bg-default-100 dark:bg-default-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setCategoryViewType("expense")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              categoryViewType === "expense"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-default-500 hover:text-foreground"
            }`}
          >
            Expenses
          </button>
          <button
            type="button"
            onClick={() => setCategoryViewType("income")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
              categoryViewType === "income"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-default-500 hover:text-foreground"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      {/* Metric Summary Banner */}
      <div
        className={`p-3 rounded-xl border ${
          categoryViewType === "expense"
            ? "bg-gradient-to-r from-rose-500/5 to-amber-500/5 border-rose-500/15"
            : "bg-gradient-to-r from-emerald-500/5 to-teal-500/5 border-emerald-500/15"
        }`}
      >
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[11px] font-medium text-default-500">
            Total {categoryViewType === "expense" ? "Pengeluaran" : "Pemasukan"} Terdistribusi
          </span>
          <span
            className={`font-mono font-bold text-xs ${
              categoryViewType === "expense"
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {topCategory && (
          <div className="flex items-center justify-between text-[11px] text-default-500 pt-1 border-t border-default-200/40 dark:border-default-800/40">
            <span>Pos Terbesar:</span>
            <span className="font-semibold text-foreground">
              {topCategory.name} ({topCategory.percentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Category List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-64 pr-0.5">
        {spendingCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-start">
            {spendingCategories.map((category, index) => {
              const categoryName =
                typeof category === "object" && category.name
                  ? category.name
                  : typeof category === "string"
                  ? category
                  : `Category ${index}`;
              const percentageNum = Number(category.percentage) || 0;
              const catColor = (category as { color?: string }).color || "#3b82f6";

              return (
                <div
                  key={categoryName || index}
                  className="p-3 rounded-xl border border-default-200/70 dark:border-default-800 bg-default-50/60 dark:bg-default-900/40 hover:border-default-300 dark:hover:border-default-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${catColor}15`, color: catColor }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-foreground truncate block">
                          {categoryName}
                        </span>
                        <span className="text-[10px] text-default-400">
                          {category.percentage}% dari total
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-xs block" style={{ color: catColor }}>
                        {category.value ? formatCurrency(category.value) : "Rp 0"}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-default-200/80 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentageNum}%`,
                        backgroundColor: catColor,
                        boxShadow: `0 0 6px ${catColor}40`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-default-200 dark:border-default-800 rounded-xl bg-default-50/50 dark:bg-default-900/20">
            <PieChart className="w-8 h-8 text-default-300 dark:text-default-700 mb-2" />
            <p className="text-xs font-semibold text-default-600">
              Belum ada {categoryViewType === "expense" ? "pengeluaran" : "pemasukan"}
            </p>
            <p className="text-[11px] text-default-400 mt-0.5">
              Transaksi yang dicatat akan muncul secara otomatis di sini
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-default-400">
          Kalkulasi real-time bulan berjalan
        </span>
        <span className="text-[11px] font-mono text-default-500">
          {spendingCategories.length} item aktif
        </span>
      </div>
    </Card>
  );
}
