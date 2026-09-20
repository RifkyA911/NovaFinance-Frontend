"use client";

import React, { useState } from "react";
import {
  FileCheck2,
  Download,
  Filter,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card, Button, Input } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNovaToast, NovaToastContainer } from "@/app/(protected)/components/NovaToast";

type DepartmentFilter = "all" | "it" | "marketing" | "hr" | "operations" | "legal";

export default function BudgetVariancePage() {
  const { selectedWorkspace } = useWorkspace();
  const { toasts, dismissToast, showSuccess, showWarning } = useNovaToast();
  const [deptFilter, setDeptFilter] = useState<DepartmentFilter>("all");
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "annual">("monthly");

  const formatMoney = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

  const budgetItems = [
    {
      id: "BUD-001",
      category: "Gaji & Tunjangan Karyawan",
      department: "hr",
      deptName: "HR & Talenta",
      budget: 200000000,
      actual: 195000000,
      variance: 5000000,
      percentage: 97.5,
      status: "safe",
    },
    {
      id: "BUD-002",
      category: "Infrastruktur Cloud AWS & Server",
      department: "it",
      deptName: "IT & Engineering",
      budget: 80000000,
      actual: 84000000,
      variance: -4000000,
      percentage: 105.0,
      status: "overbudget",
    },
    {
      id: "BUD-003",
      category: "Iklan Digital & Influencer Campaign",
      department: "marketing",
      deptName: "Pemasaran",
      budget: 70000000,
      actual: 64000000,
      variance: 6000000,
      percentage: 91.4,
      status: "safe",
    },
    {
      id: "BUD-004",
      category: "Sewa Kantor & Utilitas Listrik/Air",
      department: "operations",
      deptName: "Operasional",
      budget: 30000000,
      actual: 28000000,
      variance: 2000000,
      percentage: 93.3,
      status: "safe",
    },
    {
      id: "BUD-005",
      category: "Konsultan Hukum & Perizinan Usaha",
      department: "legal",
      deptName: "Legal & Kepatuhan",
      budget: 20000000,
      actual: 19500000,
      variance: 500000,
      percentage: 97.5,
      status: "warning",
    },
    {
      id: "BUD-006",
      category: "Software Subscription & Tools Desain",
      department: "it",
      deptName: "IT & Engineering",
      budget: 15000000,
      actual: 16500000,
      variance: -1500000,
      percentage: 110.0,
      status: "overbudget",
    },
  ];

  const filteredItems = budgetItems.filter((item) => {
    if (deptFilter !== "all" && item.department !== deptFilter) return false;
    return true;
  });

  const totalBudget = budgetItems.reduce((acc, curr) => acc + curr.budget, 0);
  const totalActual = budgetItems.reduce((acc, curr) => acc + curr.actual, 0);
  const totalVariance = totalBudget - totalActual;
  const overallBurnRate = ((totalActual / totalBudget) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 mt-4 sm:mt-6">
      <NovaToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-default-200 dark:border-default-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Realisasi & Varian Anggaran</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Budget vs Actual Control
                </span>
              </div>
              <p className="text-xs text-default-500">
                Workspace: <span className="font-semibold text-foreground">{selectedWorkspace?.name || "Nova Enterprise"}</span> · Analisis Efisiensi & Deviasi Belanja
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center p-1 rounded-xl bg-default-100 dark:bg-default-800/80 border border-default-200/80 dark:border-default-700/80">
            {(["monthly", "quarterly", "annual"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  period === p
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-default-600 dark:text-default-400 hover:text-foreground"
                }`}
              >
                {p === "monthly" ? "Bulanan" : p === "quarterly" ? "Triwulan (Q1)" : "Tahunan"}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => showSuccess("Mengekspor Laporan Anggaran", "Data varian realisasi anggaran .xlsx berhasil diunduh.")}
            className="h-8.5 px-3 rounded-xl text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold cursor-pointer inline-flex items-center transition"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Ekspor Varian
          </button>
        </div>
      </div>

      {/* Overbudget Warning Alert */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Terdapat <strong>2 pos biaya</strong> yang melampaui pagu anggaran (Overbudget): Cloud Server AWS (+5.0%) dan Lisensi Software (+10.0%). Pertimbangkan realokasi sisa anggaran pos Pemasaran.
          </span>
        </div>
        <button
          type="button"
          onClick={() => showSuccess("Saran Realokasi Nova AI", "Nova Copilot menyarankan transfer Rp 5.500.000 dari pos Pemasaran ke Cloud Infrastructure.")}
          className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 cursor-pointer shrink-0 transition"
        >
          Saran AI Realokasi
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">Total Pagu Disetujui</span>
          <div className="text-lg font-black text-foreground">{formatMoney(totalBudget)}</div>
          <div className="text-[10px] text-default-400 font-medium mt-1">
            Alokasi Budget Periode Berjalan
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">Realisasi Pengeluaran Aktual</span>
          <div className="text-lg font-black text-foreground">{formatMoney(totalActual)}</div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1">
            Penyerapan Anggaran: {overallBurnRate}%
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">Varian Bersih (Surplus)</span>
          <div className={`text-lg font-black ${totalVariance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {formatMoney(totalVariance)}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Hemat 1.9% dari total pagu
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">Efisiensi Belanja Operasional</span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">98.1%</div>
          <div className="text-[10px] text-default-400 font-medium mt-1">
            Tingkat Kepatuhan Budgeting
          </div>
        </Card>
      </div>

      {/* Department Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-default-100 dark:bg-default-800/80 border border-default-200/80 dark:border-default-700/80 overflow-x-auto">
        {[
          { id: "all" as const, label: "Semua Departemen" },
          { id: "it" as const, label: "IT & Cloud" },
          { id: "marketing" as const, label: "Pemasaran" },
          { id: "hr" as const, label: "HR & Talenta" },
          { id: "operations" as const, label: "Operasional" },
          { id: "legal" as const, label: "Legal" },
        ].map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDeptFilter(d.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
              deptFilter === d.id
                ? "bg-blue-600 text-white shadow-xs"
                : "text-default-600 dark:text-default-400 hover:text-foreground"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Variance Table */}
      <Card className="border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-default-100/70 dark:bg-default-800/50 border-b border-default-200 dark:border-default-800 text-default-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Pos Pengeluaran & Departemen</th>
                <th className="py-3 px-4 text-right">Pagu Disetujui</th>
                <th className="py-3 px-4 text-right">Realisasi Aktual</th>
                <th className="py-3 px-4 text-right">Deviasi / Selisih</th>
                <th className="py-3 px-4 text-center min-w-[140px]">Penyerapan (%)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100 dark:divide-default-800">
              {filteredItems.map((row) => (
                <tr key={row.id} className="hover:bg-default-50/70 dark:hover:bg-default-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-foreground block">{row.category}</span>
                    <span className="text-[10px] text-default-400">{row.deptName} · {row.id}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-default-700 dark:text-default-300">
                    {formatMoney(row.budget)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-foreground">
                    {formatMoney(row.actual)}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right">
                    <span className={row.variance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                      {row.variance >= 0 ? `+${formatMoney(row.variance)}` : `-${formatMoney(Math.abs(row.variance))}`}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-default-500">Burn</span>
                        <span className={`font-bold ${row.percentage > 100 ? "text-red-500" : "text-foreground"}`}>
                          {row.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-default-200 dark:bg-default-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.percentage > 100
                              ? "bg-red-500"
                              : row.percentage > 95
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(row.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.status === "safe" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Aman
                      </span>
                    ) : row.status === "warning" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="w-2.5 h-2.5" /> 97%+
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        <AlertTriangle className="w-2.5 h-2.5" /> Overbudget
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => showSuccess("Detail Pos Anggaran", `Audit trail varian untuk ${row.category} ditampilkan.`)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
