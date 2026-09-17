/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
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
} from "lucide-react";

const formatCurrency = (val: number) => {
  return "Rp " + Math.round(val).toLocaleString("id-ID");
};

// 1. Income Node (Left Column - Sources)
export const IncomeNode = memo(({ data, selected }: any) => {
  return (
    <div
      className={`min-w-[210px] rounded-xl border bg-white dark:bg-gray-900 p-3.5 shadow-sm transition-all duration-200 ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]"
          : "border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-400"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            {data.category === "freelance" ? (
              <Briefcase className="w-4 h-4" />
            ) : data.category === "investment" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
              Sumber Masuk
            </div>
            <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-baseline justify-between">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Total Masuk</span>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(data.amount || 0)}
        </span>
      </div>

      {data.count !== undefined && (
        <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500 text-right">
          {data.count} transaksi
        </div>
      )}

      {/* Output Handle to Wallets */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white dark:!border-gray-900"
      />
    </div>
  );
});
IncomeNode.displayName = "IncomeNode";

// 2. Wallet / Account Node (Middle Column - Storage / Hub)
export const WalletNode = memo(({ data, selected }: any) => {
  const isNegative = (data.balance ?? 0) < 0;

  return (
    <div
      className={`min-w-[230px] rounded-xl border bg-white dark:bg-gray-900 p-3.5 shadow-sm transition-all duration-200 ${
        selected
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-[1.02]"
          : "border-blue-200 dark:border-blue-900/50 hover:border-blue-400"
      }`}
    >
      {/* Input Handle from Income */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            {data.type === "cash" ? (
              <Wallet className="w-4 h-4" />
            ) : data.type === "bank" ? (
              <Building2 className="w-4 h-4" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
              Akun / Rekening
            </div>
            <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800/80 text-[11px]">
        {data.totalIn !== undefined && (
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>Masuk:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(data.totalIn)}
            </span>
          </div>
        )}
        {data.totalOut !== undefined && (
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span>Keluar:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">
              -{formatCurrency(data.totalOut)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
          <span className="text-gray-600 dark:text-gray-300 font-medium">Saldo:</span>
          <span
            className={`font-bold ${
              isNegative ? "text-rose-500" : "text-gray-900 dark:text-white"
            }`}
          >
            {formatCurrency(data.balance ?? 0)}
          </span>
        </div>
      </div>

      {/* Output Handle to Expenses / Allocations */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white dark:!border-gray-900"
      />
    </div>
  );
});
WalletNode.displayName = "WalletNode";

// 3. Expense Node (Right Column - Outflow Destinations)
export const ExpenseNode = memo(({ data, selected }: any) => {
  return (
    <div
      className={`min-w-[210px] rounded-xl border bg-white dark:bg-gray-900 p-3.5 shadow-sm transition-all duration-200 ${
        selected
          ? "border-rose-500 ring-2 ring-rose-500/20 shadow-md scale-[1.02]"
          : "border-rose-200 dark:border-rose-900/50 hover:border-rose-400"
      }`}
    >
      {/* Input Handle from Wallets */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white dark:!border-gray-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-rose-600 dark:text-rose-400 uppercase">
              Pengeluaran
            </div>
            <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-baseline justify-between">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Total Keluar</span>
        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
          {formatCurrency(data.amount || 0)}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
        {data.percentage !== undefined && (
          <span className="px-1.5 py-0.5 rounded-sm bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-medium">
            {data.percentage.toFixed(1)}% dari total
          </span>
        )}
        {data.count !== undefined && <span>{data.count} transaksi</span>}
      </div>
    </div>
  );
});
ExpenseNode.displayName = "ExpenseNode";

// 4. Savings / Goal Node (Right Column - Allocations & Investments)
export const SavingsNode = memo(({ data, selected }: any) => {
  return (
    <div
      className={`min-w-[210px] rounded-xl border bg-white dark:bg-gray-900 p-3.5 shadow-sm transition-all duration-200 ${
        selected
          ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.02]"
          : "border-amber-200 dark:border-amber-900/50 hover:border-amber-400"
      }`}
    >
      {/* Input Handle from Wallets */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white dark:!border-gray-900"
      />

      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            {data.category === "emergency" ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <PiggyBank className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase">
              Tabungan & Investasi
            </div>
            <div className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
              {data.label}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-baseline justify-between">
        <span className="text-[11px] text-gray-500 dark:text-gray-400">Dialokasikan</span>
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
          {formatCurrency(data.amount || 0)}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
        {data.targetAmount && (
          <span>Target: {formatCurrency(data.targetAmount)}</span>
        )}
        {data.progress !== undefined && (
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            {data.progress.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
});
SavingsNode.displayName = "SavingsNode";
