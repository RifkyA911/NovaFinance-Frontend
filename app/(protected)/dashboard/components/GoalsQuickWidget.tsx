/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Laptop,
  Plane,
  Home,
  PiggyBank,
  Clock,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, Button } from "@heroui/react";

interface GoalsQuickWidgetProps {
  workspaceId?: string;
  formatCurrency: (val: number | string) => string;
  currency?: string;
}

interface QuickGoal {
  id: string;
  workspaceId: string;
  title: string;
  category: "gadget" | "emergency" | "travel" | "property" | "investment" | "other";
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: "high" | "medium" | "low";
  status: "in_progress" | "completed" | "wishlist";
}

const CATEGORY_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  emergency: {
    icon: ShieldCheck,
    color: "#10b981",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  gadget: {
    icon: Laptop,
    color: "#3b82f6",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  travel: {
    icon: Plane,
    color: "#f59e0b",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  property: {
    icon: Home,
    color: "#8b5cf6",
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  investment: {
    icon: PiggyBank,
    color: "#06b6d4",
    bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  other: {
    icon: Target,
    color: "#64748b",
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

const DEFAULT_DEMO_GOALS: QuickGoal[] = [
  {
    id: "goal-1",
    workspaceId: "",
    title: "Dana Darurat 6 Bulan",
    category: "emergency",
    targetAmount: 30000000,
    currentAmount: 18500000,
    targetDate: "2026-12-31",
    priority: "high",
    status: "in_progress",
  },
  {
    id: "goal-2",
    workspaceId: "",
    title: "Beli MacBook Pro M3 Max",
    category: "gadget",
    targetAmount: 35000000,
    currentAmount: 22000000,
    targetDate: "2026-11-20",
    priority: "medium",
    status: "in_progress",
  },
  {
    id: "goal-3",
    workspaceId: "",
    title: "Liburan Musim Dingin Jepang",
    category: "travel",
    targetAmount: 25000000,
    currentAmount: 7500000,
    targetDate: "2027-01-15",
    priority: "low",
    status: "wishlist",
  },
];

export function GoalsQuickWidget({
  workspaceId,
  formatCurrency,
}: GoalsQuickWidgetProps) {
  const router = useRouter();
  const [goals, setGoals] = useState<QuickGoal[]>([]);

  // Load workspace goals from localStorage or fallback
  useEffect(() => {
    if (!workspaceId) return;
    const storageKey = `novajournal_goals_${workspaceId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGoals(parsed);
          return;
        }
      } catch {}
    }
    // Seed default goals if empty
    const seeded = DEFAULT_DEMO_GOALS.map((g) => ({ ...g, workspaceId }));
    setGoals(seeded);
    try {
      localStorage.setItem(storageKey, JSON.stringify(seeded));
    } catch {}
  }, [workspaceId]);

  // Calculations
  const stats = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
    const totalCurrent = goals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
    const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
    const activeCount = goals.filter((g) => g.status !== "completed").length;
    return { totalTarget, totalCurrent, overallPct, activeCount };
  }, [goals]);

  // Display top 3 active goals
  const activeGoals = useMemo(() => {
    return [...goals]
      .filter((g) => g.status !== "completed")
      .sort((a, b) => {
        const pctA = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
        const pctB = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
        return pctB - pctA;
      })
      .slice(0, 3);
  }, [goals]);

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-white dark:bg-gray-900 flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-default-100 dark:border-default-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Target className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Financial Goals & Wishlist
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {stats.activeCount} Aktif
              </span>
            </h3>
            <p className="text-[11px] text-default-500">Pencapaian target tabungan & impian</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="text-xs font-semibold h-7.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 flex items-center gap-1 text-default-700 dark:text-default-300 hover:text-purple-600 dark:hover:text-purple-400"
          onPress={() => router.push("/goals")}
          aria-label="Lihat Semua Goals"
        >
          <span>Kelola</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Overview Progress Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 border border-purple-500/15">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-semibold text-foreground text-[11px]">Akumulasi Tabungan</span>
          </div>
          <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs">
            {stats.overallPct}% Tercapai
          </span>
        </div>

        <div className="w-full bg-default-200/70 dark:bg-default-800 rounded-full h-2 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-700 shadow-xs"
            style={{ width: `${stats.overallPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-default-500">
            Terkumpul: <b className="text-foreground">{formatCurrency(stats.totalCurrent)}</b>
          </span>
          <span className="text-default-500">
            Target: <b className="text-foreground">{formatCurrency(stats.totalTarget)}</b>
          </span>
        </div>
      </div>

      {/* Active Goals List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto max-h-64 pr-0.5">
        {activeGoals.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-default-200 dark:border-default-800 rounded-xl bg-default-50/50 dark:bg-default-900/20">
            <Target className="w-8 h-8 text-default-300 dark:text-default-700 mb-2" />
            <p className="text-xs font-semibold text-default-600">Belum ada target aktif</p>
            <p className="text-[11px] text-default-400 mt-0.5">Buat target impian tabungan pertamamu</p>
            <Button
              size="sm"
              variant="primary"
              className="mt-3 bg-purple-600 text-white text-xs h-7.5 px-3 rounded-lg flex items-center gap-1"
              onPress={() => router.push("/goals")}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Target</span>
            </Button>
          </div>
        ) : (
          activeGoals.map((g) => {
            const conf = CATEGORY_ICONS[g.category] || CATEGORY_ICONS.other;
            const IconComponent = conf.icon;
            const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g.id}
                onClick={() => router.push("/goals")}
                className="group p-2.5 rounded-xl border border-default-200/70 dark:border-default-800 bg-default-50/60 dark:bg-default-900/40 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${conf.bg} flex items-center justify-center shrink-0`}>
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {g.title}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-default-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Deadline: {g.targetDate || "Belum diatur"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs" style={{ color: conf.color }}>
                      {pct}%
                    </span>
                    <p className="text-[10px] text-default-400 font-mono">
                      Sisa: {formatCurrency(remaining).split(",")[0]}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-default-200/80 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: conf.color,
                      boxShadow: `0 0 6px ${conf.color}40`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Shortcut */}
      <div className="pt-2 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-default-400">
          Kelola tabungan & wishlist secara detail
        </span>
        <Button
          size="sm"
          variant="secondary"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline p-0 h-auto min-w-0 bg-transparent flex items-center gap-1"
          onPress={() => router.push("/goals")}
          aria-label="Buka Semua Goals"
        >
          <span>Buka Goals Page</span>
          <ArrowUpRight className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}
