/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Briefcase,
  Building2,
  Utensils,
  CreditCard,
  ShieldCheck,
  Zap,
  Car,
  ShoppingBag,
  Home,
  Film,
  HeartPulse,
  Coffee,
  Sparkles,
  Smartphone,
} from "lucide-react";

const formatCurrency = (val: number) => {
  let curr = "IDR";
  let locale = "id-ID";
  try {
    if (typeof window !== "undefined") {
      const storedCurr = localStorage.getItem("novajournal_currency");
      if (storedCurr) curr = storedCurr;
      const storedFmt = localStorage.getItem("novajournal_number_format");
      if (storedFmt === "en") locale = "en-US";
    }
  } catch {}
  const isNoDecimal = curr === "IDR" || curr === "JPY";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: curr,
    minimumFractionDigits: isNoDecimal ? 0 : 2,
    maximumFractionDigits: isNoDecimal ? 0 : 2,
  }).format(Math.round(val || 0));
};

// Category Icon Resolver
const getCategoryIcon = (label: string, categoryType?: string) => {
  const normalized = (label || "").toLowerCase();
  if (normalized.includes("gaji") || normalized.includes("salary") || normalized.includes("payroll"))
    return <Briefcase className="w-4 h-4" />;
  if (normalized.includes("makan") || normalized.includes("resto") || normalized.includes("food") || normalized.includes("kuliner"))
    return <Utensils className="w-4 h-4" />;
  if (normalized.includes("kopi") || normalized.includes("cafe"))
    return <Coffee className="w-4 h-4" />;
  if (normalized.includes("transport") || normalized.includes("bensin") || normalized.includes("ojol") || normalized.includes("kendaraan"))
    return <Car className="w-4 h-4" />;
  if (normalized.includes("belanja") || normalized.includes("shopping") || normalized.includes("mall"))
    return <ShoppingBag className="w-4 h-4" />;
  if (normalized.includes("rumah") || normalized.includes("listrik") || normalized.includes("air") || normalized.includes("sewa"))
    return <Home className="w-4 h-4" />;
  if (normalized.includes("hiburan") || normalized.includes("nonton") || normalized.includes("game"))
    return <Film className="w-4 h-4" />;
  if (normalized.includes("kesehatan") || normalized.includes("obat") || normalized.includes("medis"))
    return <HeartPulse className="w-4 h-4" />;
  if (normalized.includes("pulsa") || normalized.includes("kuota") || normalized.includes("internet"))
    return <Smartphone className="w-4 h-4" />;
  if (normalized.includes("freelance") || normalized.includes("proyek") || normalized.includes("side"))
    return <Zap className="w-4 h-4" />;
  if (normalized.includes("investasi") || normalized.includes("dividen") || normalized.includes("saham") || normalized.includes("crypto"))
    return <TrendingUp className="w-4 h-4" />;
  
  if (categoryType === "income") return <TrendingUp className="w-4 h-4" />;
  if (categoryType === "expense") return <TrendingDown className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
};

// 1. Income Node (Left Column - Inflows)
export const IncomeNode = memo(({ data, selected }: any) => {
  const isDimmed = data?.isDimmed;
  const isHighlighted = data?.isHighlighted;

  return (
    <div
      className={`min-w-[215px] rounded-2xl border bg-white dark:bg-gray-900 p-3.5 shadow-xs transition-all duration-200 select-none ${
        isDimmed
          ? "opacity-30 scale-95 border-default-200 dark:border-default-800"
          : isHighlighted || selected
          ? "border-green-500 ring-2 ring-green-500/20 shadow-md scale-[1.02]"
          : "border-default-200 dark:border-default-800 hover:border-green-500/50"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
            {getCategoryIcon(data.label, "income")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                Pemasukan
              </span>
              {data.isPrimary && (
                <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded-full">
                  Utama
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-foreground leading-tight truncate mt-0.5">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-default-100 dark:border-default-800/80 flex items-baseline justify-between">
        <span className="text-xs text-default-500">Total Masuk</span>
        <span className="text-sm font-bold text-green-600 dark:text-green-400">
          {formatCurrency(data.amount || 0)}
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-default-400">
        <span>{data.count !== undefined ? `${data.count} transaksi` : "Terjadwal"}</span>
        {data.sharePercentage !== undefined && (
          <span className="font-semibold text-green-600 dark:text-green-400">
            {data.sharePercentage.toFixed(1)}% aliran
          </span>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white dark:!border-gray-900"
      />
    </div>
  );
});
IncomeNode.displayName = "IncomeNode";

// 2. Wallet / Account Node (Middle Column - Hubs)
export const WalletNode = memo(({ data, selected }: any) => {
  const isNegative = (data.balance ?? 0) < 0;
  const isDimmed = data?.isDimmed;
  const isHighlighted = data?.isHighlighted;

  return (
    <div
      className={`min-w-[225px] rounded-2xl border bg-white dark:bg-gray-900 p-3.5 shadow-xs transition-all duration-200 select-none ${
        isDimmed
          ? "opacity-30 scale-95 border-default-200 dark:border-default-800"
          : isHighlighted || selected
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-[1.02]"
          : "border-default-200 dark:border-default-800 hover:border-blue-500/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            {data.type === "cash" ? (
              <Wallet className="w-4 h-4" />
            ) : data.type === "bank" ? (
              <Building2 className="w-4 h-4" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {data.type === "cash" ? "Kas Tunai" : data.type === "bank" ? "Rekening Bank" : "Dompet Digital"}
            </span>
            <div className="text-xs font-bold text-foreground leading-tight truncate mt-0.5">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 pt-2 border-t border-default-100 dark:border-default-800/80 text-xs">
        {data.totalIn !== undefined && (
          <div className="flex items-center justify-between text-default-500">
            <span>Masuk:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              +{formatCurrency(data.totalIn)}
            </span>
          </div>
        )}
        {data.totalOut !== undefined && (
          <div className="flex items-center justify-between text-default-500">
            <span>Keluar:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">
              -{formatCurrency(data.totalOut)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-dashed border-default-200 dark:border-default-800">
          <span className="text-default-600 font-medium">Saldo:</span>
          <span
            className={`font-bold ${
              isNegative ? "text-red-500" : "text-foreground"
            }`}
          >
            {formatCurrency(data.balance ?? 0)}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900"
      />
    </div>
  );
});
WalletNode.displayName = "WalletNode";

// 3. Expense Node (Right Column - Outflows)
export const ExpenseNode = memo(({ data, selected }: any) => {
  const isDimmed = data?.isDimmed;
  const isHighlighted = data?.isHighlighted;
  const percentage = data.percentage ?? 0;

  return (
    <div
      className={`min-w-[215px] rounded-2xl border bg-white dark:bg-gray-900 p-3.5 shadow-xs transition-all duration-200 select-none ${
        isDimmed
          ? "opacity-30 scale-95 border-default-200 dark:border-default-800"
          : isHighlighted || selected
          ? "border-red-500 ring-2 ring-red-500/20 shadow-md scale-[1.02]"
          : "border-default-200 dark:border-default-800 hover:border-red-500/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white dark:!border-gray-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
            {getCategoryIcon(data.label, "expense")}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">
                Pengeluaran
              </span>
              {percentage > 25 && (
                <span className="text-[9px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded-full">
                  Major
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-foreground leading-tight truncate mt-0.5">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-default-100 dark:border-default-800/80 flex items-baseline justify-between">
        <span className="text-xs text-default-500">Total Keluar</span>
        <span className="text-sm font-bold text-red-600 dark:text-red-400">
          {formatCurrency(data.amount || 0)}
        </span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-default-400">
          <span>{data.count !== undefined ? `${data.count} transaksi` : "Terjadwal"}</span>
          <span className="font-semibold text-red-600 dark:text-red-400">
            {percentage.toFixed(1)}% porsi
          </span>
        </div>
        <div className="w-full h-1.5 bg-default-100 dark:bg-default-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(2, percentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
});
ExpenseNode.displayName = "ExpenseNode";

// 4. Savings / Goal Node (Right Column - Allocations)
export const SavingsNode = memo(({ data, selected }: any) => {
  const isDimmed = data?.isDimmed;
  const isHighlighted = data?.isHighlighted;
  const progress = data.progress ?? 0;

  return (
    <div
      className={`min-w-[215px] rounded-2xl border bg-white dark:bg-gray-900 p-3.5 shadow-xs transition-all duration-200 select-none ${
        isDimmed
          ? "opacity-30 scale-95 border-default-200 dark:border-default-800"
          : isHighlighted || selected
          ? "border-purple-500 ring-2 ring-purple-500/20 shadow-md scale-[1.02]"
          : "border-default-200 dark:border-default-800 hover:border-purple-500/50"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white dark:!border-gray-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            {data.category === "emergency" ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <PiggyBank className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
              Tabungan & Target
            </span>
            <div className="text-xs font-bold text-foreground leading-tight truncate mt-0.5">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-default-100 dark:border-default-800/80 flex items-baseline justify-between">
        <span className="text-xs text-default-500">Dialokasikan</span>
        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
          {formatCurrency(data.amount || 0)}
        </span>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-default-400">
          <span>{data.targetAmount ? `Target: ${formatCurrency(data.targetAmount)}` : "Retensi"}</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">
            {progress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-default-100 dark:bg-default-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(3, progress))}%` }}
          />
        </div>
      </div>
    </div>
  );
});
SavingsNode.displayName = "SavingsNode";
