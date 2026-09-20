"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { Card, Button } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useNovaToast, NovaToastContainer } from "@/app/(protected)/components/NovaToast";

type ReportPeriod = "month" | "q1" | "ytd" | "last_year";
type TabType = "income-statement" | "balance-sheet" | "cash-flow";

export default function FinancialStatementPage() {
  const { selectedWorkspace } = useWorkspace();
  const { toasts, dismissToast, showSuccess, showInfo } = useNovaToast();
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [activeTab, setActiveTab] = useState<TabType>("income-statement");
  const [currency, setCurrency] = useState<"IDR" | "USD">("IDR");

  const formatMoney = (amount: number) => {
    if (currency === "USD") {
      return `$${(amount / 15800).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const handleExport = (type: "pdf" | "excel") => {
    if (type === "pdf") {
      showSuccess("Mengekspor Laporan Keuangan", "Dokumen PDF berstempel resmi sedang disiapkan...");
    } else {
      showSuccess("Mengekspor Spreadsheet Excel", "Data neraca dan laba rugi format .xlsx diunduh.");
    }
  };

  // Mock Financial Data
  const incomeData = [
    { category: "Pendapatan Usaha (Revenue)", items: [
      { name: "Penjualan Produk & Lisensi SaaS", amount: 485000000, variance: "+12.4%", isPositive: true },
      { name: "Jasa Konsultasi & Implementasi", amount: 142000000, variance: "+8.1%", isPositive: true },
      { name: "Pendapatan Retainer Bulanan", amount: 98000000, variance: "+4.5%", isPositive: true },
    ], total: 725000000 },
    { category: "Harga Pokok Penjualan (COGS)", items: [
      { name: "Biaya Cloud Server & API Infrastructure", amount: 84000000, variance: "+2.1%", isPositive: false },
      { name: "Payment Gateway & Merchant Fees", amount: 19500000, variance: "-1.2%", isPositive: true },
      { name: "Lisensi Perangkat Pihak Ketiga", amount: 16500000, variance: "0.0%", isPositive: true },
    ], total: 120000000 },
    { category: "Beban Operasional & Administrasi (OPEX)", items: [
      { name: "Gaji & Tunjangan Tim Inti", amount: 195000000, variance: "+3.2%", isPositive: false },
      { name: "Pemasaran Digital & Kampanye Akuisisi", amount: 64000000, variance: "-5.4%", isPositive: true },
      { name: "Sewa Kantor & Utilitas Operasional", amount: 28000000, variance: "0.0%", isPositive: true },
      { name: "Beban Perjalanan Dinas & Representasi", amount: 12500000, variance: "+15.0%", isPositive: false },
    ], total: 299500000 },
  ];

  const totalRevenue = 725000000;
  const totalCogs = 120000000;
  const grossProfit = totalRevenue - totalCogs;
  const totalOpex = 299500000;
  const ebitda = grossProfit - totalOpex;
  const taxEstimate = ebitda * 0.11;
  const netIncome = ebitda - taxEstimate;

  const balanceSheetData = {
    assets: [
      { name: "Kas & Setara Kas (Bank & Petty Cash)", amount: 540000000 },
      { name: "Piutang Usaha Lancar (AR)", amount: 184500000 },
      { name: "Biaya Dibayar di Muka", amount: 32000000 },
      { name: "Peralatan Kantor & Hardware IT", amount: 145000000 },
      { name: "Akumulasi Penyusutan Aset Tetap", amount: -28000000 },
    ],
    liabilities: [
      { name: "Hutang Usaha Jangka Pendek (AP)", amount: 76000000 },
      { name: "Hutang Pajak PPh & PPN Terutang", amount: 34500000 },
      { name: "Beban Akrual Masih Harus Dibayar", amount: 28000000 },
      { name: "Kewajiban Sewa Jangka Panjang", amount: 95000000 },
    ],
    equity: [
      { name: "Modal Disetor Pemegang Saham", amount: 400000000 },
      { name: "Laba Ditahan (Retained Earnings)", amount: 239000000 },
    ],
  };

  const cashFlowData = [
    { section: "Arus Kas dari Aktivitas Operasi", items: [
      { label: "Penerimaan Kas dari Pelanggan", amount: 698000000, type: "in" },
      { label: "Pembayaran Kas ke Pemasok & Vendor", amount: -118000000, type: "out" },
      { label: "Pembayaran Gaji & Operasional Karyawan", amount: -289000000, type: "out" },
      { label: "Pembayaran Pajak Usaha", amount: -32000000, type: "out" },
    ], net: 259000000 },
    { section: "Arus Kas dari Aktivitas Investasi", items: [
      { label: "Pembelian Perangkat Server & IT Hardware", amount: -45000000, type: "out" },
      { label: "Pengembalian Investasi Dana Pasar Uang", amount: 12000000, type: "in" },
    ], net: -33000000 },
    { section: "Arus Kas dari Aktivitas Pendanaan", items: [
      { label: "Pembayaran Cicilan Pokok Pinjaman Usaha", amount: -25000000, type: "out" },
      { label: "Pembagian Dividen Interim", amount: -50000000, type: "out" },
    ], net: -75000000 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 mt-4 sm:mt-6">
      <NovaToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-default-200 dark:border-default-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Laporan Keuangan Komprehensif</h1>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  SAK EMKM / IFRS Compliant
                </span>
              </div>
              <p className="text-xs text-default-500">
                Workspace: <span className="font-semibold text-foreground">{selectedWorkspace?.name || "Nova Enterprise"}</span> · Konsolidasi Keuangan Otomatis
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Selector */}
          <div className="flex items-center p-1 rounded-xl bg-default-100 dark:bg-default-800/80 border border-default-200/80 dark:border-default-700/80">
            {(["month", "q1", "ytd"] as ReportPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  period === p
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-default-600 dark:text-default-400 hover:text-foreground"
                }`}
              >
                {p === "month" ? "Bulan Ini" : p === "q1" ? "Q1 2026" : "YTD 2026"}
              </button>
            ))}
          </div>

          {/* Currency Toggle */}
          <button
            type="button"
            onClick={() => setCurrency((prev) => (prev === "IDR" ? "USD" : "IDR"))}
            className="px-2.5 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-xs font-mono font-bold text-default-700 dark:text-default-300 hover:bg-default-50 dark:hover:bg-default-800 cursor-pointer transition"
            title="Ganti Mata Uang Tampilan"
          >
            {currency}
          </button>

          {/* Export Buttons */}
          <button
            type="button"
            onClick={() => handleExport("excel")}
            className="h-8.5 px-3 rounded-xl text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold cursor-pointer inline-flex items-center transition"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Excel
          </button>
          <Button
            size="sm"
            onPress={() => handleExport("pdf")}
            className="h-8.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Cetak PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-xs font-semibold">Total Pendapatan Usaha</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-foreground">{formatMoney(totalRevenue)}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14.2% vs periode lalu
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-xs font-semibold">Gross Profit Margin</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-black text-foreground">
            {((grossProfit / totalRevenue) * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-default-400 font-medium mt-1">
            Laba Kotor: {formatMoney(grossProfit)}
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-xs font-semibold">Beban Operasional</span>
            <ArrowDownRight className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-black text-foreground">{formatMoney(totalOpex)}</div>
          <div className="text-[10px] text-default-400 font-medium mt-1">
            Rasio OPEX: {((totalOpex / totalRevenue) * 100).toFixed(1)}%
          </div>
        </Card>

        <Card className="p-4 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-xs font-semibold">Net Profit (Laba Bersih)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatMoney(netIncome)}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            Net Margin: {((netIncome / totalRevenue) * 100).toFixed(1)}%
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-default-100 dark:bg-default-800/60 border border-default-200/60 dark:border-default-700/60">
        {[
          { id: "income-statement" as const, label: "Laporan Laba Rugi (P&L)" },
          { id: "balance-sheet" as const, label: "Neraca Keuangan (Balance Sheet)" },
          { id: "cash-flow" as const, label: "Laporan Arus Kas (Cash Flow)" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition ${
              activeTab === tab.id
                ? "bg-white dark:bg-default-900 text-foreground shadow-sm"
                : "text-default-500 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Income Statement */}
      {activeTab === "income-statement" && (
        <Card className="p-5 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/40 shadow-xs space-y-6">
          <div className="space-y-4">
            {incomeData.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-default-200 dark:border-default-800">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {section.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-foreground">
                    {formatMoney(section.total)}
                  </span>
                </div>
                <div className="space-y-1.5 pl-2">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 hover:bg-default-50 dark:hover:bg-default-800/40 px-2 rounded-lg transition">
                      <span className="text-default-600 dark:text-default-300">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono font-semibold ${item.isPositive ? "text-emerald-500" : "text-red-500"}`}>
                          {item.variance}
                        </span>
                        <span className="font-mono text-default-700 dark:text-default-200 min-w-[110px] text-right">
                          {formatMoney(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Bottom Totals */}
            <div className="pt-4 border-t-2 border-default-200 dark:border-default-700 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-default-600">
                <span>Laba Kotor (Gross Profit)</span>
                <span className="font-mono font-bold">{formatMoney(grossProfit)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-default-600">
                <span>EBITDA (Laba Sebelum Bunga & Pajak)</span>
                <span className="font-mono font-bold">{formatMoney(ebitda)}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-default-600">
                <span>Estimasi Beban Pajak Penghasilan (11%)</span>
                <span className="font-mono font-bold text-red-500">-{formatMoney(taxEstimate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-black text-foreground pt-2 border-t border-default-200 dark:border-default-800">
                <span>Laba Bersih Tahun Berjalan (Net Profit After Tax)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                  {formatMoney(netIncome)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Balance Sheet */}
      {activeTab === "balance-sheet" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Assets */}
          <Card className="p-5 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/40 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide pb-2 border-b border-default-200 dark:border-default-800 flex items-center justify-between">
              <span>Aktiva / Aset (Assets)</span>
              <span className="text-emerald-600">Lancar & Tetap</span>
            </h3>
            <div className="space-y-2">
              {balanceSheetData.assets.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 hover:bg-default-50 dark:hover:bg-default-800/40 px-2 rounded-lg">
                  <span className="text-default-600 dark:text-default-300">{item.name}</span>
                  <span className="font-mono font-bold text-foreground">{formatMoney(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t-2 border-default-200 dark:border-default-700 flex items-center justify-between text-xs font-black text-foreground">
              <span>Total Aset (Aktiva)</span>
              <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                {formatMoney(balanceSheetData.assets.reduce((acc, curr) => acc + curr.amount, 0))}
              </span>
            </div>
          </Card>

          {/* Liabilities & Equity */}
          <div className="space-y-4">
            <Card className="p-5 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/40 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide pb-2 border-b border-default-200 dark:border-default-800">
                Kewajiban / Liabilitas (Liabilities)
              </h3>
              <div className="space-y-2">
                {balanceSheetData.liabilities.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 hover:bg-default-50 dark:hover:bg-default-800/40 px-2 rounded-lg">
                    <span className="text-default-600 dark:text-default-300">{item.name}</span>
                    <span className="font-mono font-bold text-foreground">{formatMoney(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-default-200 dark:border-default-800 flex items-center justify-between text-xs font-bold text-default-600">
                <span>Total Kewajiban</span>
                <span className="font-mono">{formatMoney(balanceSheetData.liabilities.reduce((acc, curr) => acc + curr.amount, 0))}</span>
              </div>
            </Card>

            <Card className="p-5 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/40 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide pb-2 border-b border-default-200 dark:border-default-800">
                Ekuitas Pemilik Modal (Equity)
              </h3>
              <div className="space-y-2">
                {balanceSheetData.equity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 hover:bg-default-50 dark:hover:bg-default-800/40 px-2 rounded-lg">
                    <span className="text-default-600 dark:text-default-300">{item.name}</span>
                    <span className="font-mono font-bold text-foreground">{formatMoney(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t-2 border-default-200 dark:border-default-700 flex items-center justify-between text-xs font-black text-foreground">
                <span>Total Liabilitas & Ekuitas</span>
                <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                  {formatMoney(
                    balanceSheetData.liabilities.reduce((acc, curr) => acc + curr.amount, 0) +
                    balanceSheetData.equity.reduce((acc, curr) => acc + curr.amount, 0)
                  )}
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Cash Flow Statement */}
      {activeTab === "cash-flow" && (
        <Card className="p-5 border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/40 shadow-xs space-y-5">
          <div className="space-y-4">
            {cashFlowData.map((sec, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-default-200 dark:border-default-800">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wide">{sec.section}</span>
                  <span className={`text-xs font-mono font-bold ${sec.net >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                    Net: {formatMoney(sec.net)}
                  </span>
                </div>
                <div className="space-y-1 pl-2">
                  {sec.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 hover:bg-default-50 dark:hover:bg-default-800/40 px-2 rounded-lg">
                      <span className="text-default-600 dark:text-default-300">{item.label}</span>
                      <span className={`font-mono font-bold ${item.type === "in" ? "text-emerald-600" : "text-default-700 dark:text-default-200"}`}>
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t-2 border-default-200 dark:border-default-700 flex items-center justify-between text-sm font-black text-foreground">
              <span>Kenaikan Bersih Kas & Setara Kas (Net Cash Increase)</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">
                {formatMoney(cashFlowData.reduce((acc, curr) => acc + curr.net, 0))}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
