"use client";

import React, { useState } from "react";
import {
  Calculator,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Receipt,
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, Button, Input } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNovaToast, NovaToastContainer } from "@/app/(protected)/components/NovaToast";

type TaxTypeFilter = "all" | "pph21" | "pph23" | "ppn" | "final";

export default function TaxCompliancePage() {
  const { selectedWorkspace } = useWorkspace();
  const { toasts, dismissToast, showSuccess, showWarning } = useNovaToast();
  const [filterType, setFilterType] = useState<TaxTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatMoney = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

  const taxRecords = [
    {
      id: "BUPOT-2026-001",
      taxType: "pph21",
      typeName: "PPh Pasal 21",
      beneficiary: "Budi Santoso & Rekan (Gaji Tetap)",
      dpp: 85000000,
      rate: "5% - 15%",
      taxAmount: 7250000,
      status: "paid",
      dueDate: "10 April 2026",
      ntpn: "9823481726354182",
    },
    {
      id: "BUPOT-2026-002",
      taxType: "pph23",
      typeName: "PPh Pasal 23",
      beneficiary: "PT Cloud Cipta Solusi (Jasa IT Hosting)",
      dpp: 42000000,
      rate: "2%",
      taxAmount: 840000,
      status: "paid",
      dueDate: "10 April 2026",
      ntpn: "1726354928172635",
    },
    {
      id: "BUPOT-2026-003",
      taxType: "ppn",
      typeName: "PPN Keluaran 11%",
      beneficiary: "Faktur Pajak Seri 010.002-26.9823102",
      dpp: 280000000,
      rate: "11%",
      taxAmount: 30800000,
      status: "pending",
      dueDate: "30 April 2026",
      ntpn: null,
    },
    {
      id: "BUPOT-2026-004",
      taxType: "final",
      typeName: "PPh Final UMKM (PP 23)",
      beneficiary: "Omset Usaha Bruto Cabang Surabaya",
      dpp: 94000000,
      rate: "0.5%",
      taxAmount: 470000,
      status: "paid",
      dueDate: "15 April 2026",
      ntpn: "4728193746281928",
    },
    {
      id: "BUPOT-2026-005",
      taxType: "pph23",
      typeName: "PPh Pasal 23",
      beneficiary: "Kantor Konsultan Hukum & Legal",
      dpp: 25000000,
      rate: "2%",
      taxAmount: 500000,
      status: "pending",
      dueDate: "10 April 2026",
      ntpn: null,
    },
  ];

  const filteredRecords = taxRecords.filter((rec) => {
    if (filterType !== "all" && rec.taxType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.id.toLowerCase().includes(q) ||
        rec.beneficiary.toLowerCase().includes(q) ||
        rec.typeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalTaxPaid = taxRecords
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + r.taxAmount, 0);

  const totalTaxPending = taxRecords
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.taxAmount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 mt-4 sm:mt-6">
      <NovaToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-default-200 dark:border-default-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Kepatuhan Pajak & Rekonsiliasi Fiskal</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> SPT Valid
                </span>
              </div>
              <p className="text-xs text-default-500">
                Workspace: <span className="font-semibold text-foreground">{selectedWorkspace?.name || "Nova Enterprise"}</span> · e-Bupot & Rekonsiliasi Faktur Elektronik
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => showSuccess("Ekspor Rekapitulasi Pajak", "File rekonsiliasi SPT Masa .xlsx berhasil disiapkan.")}
            className="h-8.5 px-3 rounded-xl text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-semibold cursor-pointer inline-flex items-center transition"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Rekap Pajak
          </button>
          <Button
            size="sm"
            onPress={() => showSuccess("Sinkronisasi DJP Online", "Terhubung ke gateway API DJP (Direktorat Jenderal Pajak).")}
            className="h-8.5 px-3 text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Sinkron DJP Online
          </Button>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            Batas waktu penyetoran & pelaporan SPT Masa PPh 21/23 periode berjalan adalah <strong>10 April 2026</strong>. Pastikan semua bukti potong diterbitkan sebelum jatuh tempo.
          </span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
          Sisa 14 Hari
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">Pajak Telah Disetor (NTPN)</span>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatMoney(totalTaxPaid)}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 3 Bukti Setor Terverifikasi
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">Pajak Terutang (Pending Billing)</span>
          <div className="text-lg font-black text-amber-600 dark:text-amber-400">{formatMoney(totalTaxPending)}</div>
          <div className="text-[10px] text-amber-500 font-medium mt-1">
            2 Kode Billing Belum Dibayar
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">PPN Keluaran 11%</span>
          <div className="text-lg font-black text-foreground">{formatMoney(30800000)}</div>
          <div className="text-[10px] text-default-400 font-medium mt-1">
            Faktur Terbit e-Faktur 4.0
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <span className="text-xs font-semibold text-default-400 block mb-1">Efisiensi Fiskal & Tarif UMKM</span>
          <div className="text-lg font-black text-violet-600 dark:text-violet-400">0.5%</div>
          <div className="text-[10px] text-violet-600 font-medium mt-1">
            PP 23 Berlaku hingga Des 2026
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tax Category Filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-default-100 dark:bg-default-800/80 border border-default-200/80 dark:border-default-700/80 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "all" as const, label: "Semua Pajak" },
            { id: "pph21" as const, label: "PPh 21" },
            { id: "pph23" as const, label: "PPh 23" },
            { id: "ppn" as const, label: "PPN 11%" },
            { id: "final" as const, label: "PPh Final" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap ${
                filterType === t.id
                  ? "bg-violet-600 text-white shadow-xs"
                  : "text-default-600 dark:text-default-400 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari bukti potong / vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Tax Records Table */}
      <Card className="border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-default-100/70 dark:bg-default-800/50 border-b border-default-200 dark:border-default-800 text-default-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">No. Bukti Potong / Faktur</th>
                <th className="py-3 px-4">Jenis Pajak</th>
                <th className="py-3 px-4">Nama Pihak / Transaksi</th>
                <th className="py-3 px-4 text-right">Dasar Pengenaan (DPP)</th>
                <th className="py-3 px-4 text-center">Tarif</th>
                <th className="py-3 px-4 text-right">Pajak Terutang</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100 dark:divide-default-800">
              {filteredRecords.map((row) => (
                <tr key={row.id} className="hover:bg-default-50/70 dark:hover:bg-default-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-foreground">
                    {row.id}
                    {row.ntpn && (
                      <span className="block text-[9px] font-normal text-default-400">NTPN: {row.ntpn}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold text-default-700 dark:text-default-200">
                    {row.typeName}
                  </td>
                  <td className="py-3 px-4 text-default-600 dark:text-default-300 max-w-[200px] truncate">
                    {row.beneficiary}
                  </td>
                  <td className="py-3 px-4 font-mono text-right text-default-600 dark:text-default-300">
                    {formatMoney(row.dpp)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-default-600 dark:text-default-300">
                    {row.rate}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-foreground">
                    {formatMoney(row.taxAmount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Disetor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="w-2.5 h-2.5" /> Terutang
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => showSuccess("Mengunduh Bukti Potong", `Dokumen resmi e-Bupot untuk ${row.id} diunduh.`)}
                      className="text-violet-600 dark:text-violet-400 hover:underline font-semibold text-[11px] cursor-pointer"
                    >
                      e-Bupot
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
