/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings2,
  CheckCircle2,
  HelpCircle,
  PiggyBank,
  X,
  Zap,
  Key,
  ChevronRight,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface FinancialHealthAuditorProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  spendingCategories: Array<{ name: string; amount?: number; value?: number; percentage?: string | number }>;
  transactionCount: number;
  currency?: string;
}

export default function FinancialHealthAuditor({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  savingsRate,
  spendingCategories,
  transactionCount,
  currency = "IDR",
}: FinancialHealthAuditorProps) {
  const { selectedWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(false);
  const [auditData, setAuditData] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Settings: Custom API Key & Provider preference
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"auto" | "groq" | "gemini" | "deepseek" | "claude">("auto");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("novajournal_ai_key");
    const savedProv = localStorage.getItem("novajournal_ai_provider");
    if (savedKey) setApiKey(savedKey);
    if (savedProv) setProvider(savedProv as any);

    // Load cached audit if available
    const cachedAudit = localStorage.getItem(`novajournal_audit_${selectedWorkspace?.id}`);
    if (cachedAudit) {
      try {
        setAuditData(JSON.parse(cachedAudit));
      } catch {}
    }
  }, [selectedWorkspace?.id]);

  const handleSaveSettings = () => {
    localStorage.setItem("novajournal_ai_key", apiKey.trim());
    localStorage.setItem("novajournal_ai_provider", provider);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleRunAudit = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Normalize top categories
      const normalizedCategories = spendingCategories.slice(0, 5).map((c) => ({
        name: c.name,
        amount: Number(c.amount ?? c.value ?? 0),
        percentage:
          typeof c.percentage === "number"
            ? c.percentage
            : parseFloat(String(c.percentage || "0")) ||
              (monthlyExpense > 0
                ? (Number(c.amount ?? c.value ?? 0) / monthlyExpense) * 100
                : 0),
      }));

      const res = await fetch("/api/ai/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceName: selectedWorkspace?.name || "Workspace",
          currency,
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          topCategories: normalizedCategories,
          transactionCount,
          userApiKey: apiKey.trim() || undefined,
          userProvider: provider,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal melakukan audit keuangan");
      }

      setAuditData(data.data);
      if (selectedWorkspace?.id) {
        localStorage.setItem(`novajournal_audit_${selectedWorkspace.id}`, JSON.stringify(data.data));
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses audit.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-500/10";
    if (score >= 65) return "text-blue-600 dark:text-blue-400 border-blue-500 bg-blue-500/10";
    if (score >= 50) return "text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-500/10";
    return "text-rose-600 dark:text-rose-400 border-rose-500 bg-rose-500/10";
  };

  return (
    <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs p-4 sm:p-5 bg-linear-to-br from-white via-default-50/50 to-blue-50/30 dark:from-gray-900 dark:via-gray-900/90 dark:to-blue-950/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-default-100 dark:border-default-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground tracking-tight">
                AI Financial Health & Leakage Auditor
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Multi-Provider AI
              </span>
            </div>
            <p className="text-xs text-default-500 mt-0.5">
              Analisis cerdas kebocoran kas, skor kesehatan finansial, dan audit forensik pengeluaran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition-colors"
            title="Pengaturan Provider AI (Groq, Gemini, DeepSeek, Claude)"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleRunAudit}
            isDisabled={loading}
            className="h-8 px-3 text-xs font-semibold bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-xs cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            )}
            {auditData ? "Jalankan Ulang Audit" : "Jalankan Audit AI"}
          </Button>
        </div>
      </div>

      {/* Settings Panel (Collapsible) */}
      {showSettings && (
        <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-default-200 dark:border-default-700 space-y-3 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-default-100 dark:border-default-700 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              Override Model AI (Secondary / Alternatif)
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/settings"
                target="_blank"
                className="text-[11px] text-blue-500 hover:underline"
              >
                Atur di Settings &rarr;
              </a>
              <button
                onClick={() => setShowSettings(false)}
                className="text-default-400 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[11px] text-default-500">
            Secara default, auditor ini menggunakan konfigurasi dari menu <strong>Settings</strong>. Gunakan opsi di bawah ini hanya jika ingin override/fallback khusus untuk audit ini:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-default-400 uppercase">
                Pilihan Provider
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full h-8 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-gray-900 text-foreground text-xs focus:outline-hidden"
              >
                <option value="auto">Auto-Detect (Rekomendasi)</option>
                <option value="groq">⚡ Groq (Llama 3.3 - Super Cepat)</option>
                <option value="gemini">✨ Google Gemini (2.0 Flash)</option>
                <option value="deepseek">🧠 DeepSeek (V3 Chat)</option>
                <option value="claude">🦅 Anthropic Claude (3.5 Haiku)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[10px] font-semibold text-default-400 uppercase">
                Custom API Key (Opsional)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="gsk_..., AIzaSy..., sk-..., sk-ant-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-gray-900 text-foreground text-xs focus:outline-hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveSettings}
                  className="h-8 text-xs font-semibold shrink-0"
                >
                  {keySaved ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : "Simpan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Audit Content */}
      {auditData ? (
        <div className="mt-4 space-y-4">
          {/* Top Diagnosis Row: Score + Summary + Savings Potential */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Score Card */}
            <div className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 font-bold ${getScoreColor(
                  auditData.healthScore
                )}`}
              >
                <span className="text-xl leading-none">{auditData.healthScore}</span>
                <span className="text-[9px] uppercase tracking-wider mt-0.5">/ 100</span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-default-400 uppercase tracking-wider">
                  Diagnosis Kesehatan
                </span>
                <div className="text-sm font-bold text-foreground leading-snug">
                  Status: {auditData.status}
                </div>
                {auditData.engineUsed && (
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 mt-0.5">
                    <Zap className="w-2.5 h-2.5" />
                    {auditData.engineUsed}
                  </div>
                )}
              </div>
            </div>

            {/* Savings Potential Highlight */}
            <div className="p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-500/5 dark:bg-emerald-950/20 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Estimasi Potensi Hemat
                </span>
                <div className="text-base font-bold text-emerald-700 dark:text-emerald-300">
                  {auditData.savingsPotential || "Rp 500.000 / bulan"}
                </div>
                <div className="text-[10px] text-default-400">
                  Bisa dialihkan ke Goals & Tabungan
                </div>
              </div>
            </div>

            {/* Cashflow Verdict Summary */}
            <div className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 flex flex-col justify-center">
              <span className="text-[10px] font-semibold text-default-400 uppercase tracking-wider">
                Kesimpulan Forensik
              </span>
              <p className="text-xs text-foreground mt-1 leading-relaxed line-clamp-3">
                {auditData.summary}
              </p>
            </div>
          </div>

          {/* Detected Leakages Section */}
          {auditData.leakages && auditData.leakages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Deteksi Kebocoran Kas (Spending Leakage)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {auditData.leakages.map((leak: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 space-y-2 text-xs hover:border-amber-400/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">{leak.category}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          leak.severity === "high"
                            ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                            : leak.severity === "medium"
                            ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        }`}
                      >
                        Tingkat: {leak.severity}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {leak.detectedLeakage}
                    </div>

                    <p className="text-[11px] text-default-500 leading-relaxed">
                      {leak.insight}
                    </p>

                    <div className="pt-2 border-t border-default-100 dark:border-default-800 flex items-start gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{leak.solution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          {auditData.recommendations && auditData.recommendations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-default-50 dark:bg-gray-900/60 border border-default-200/60 dark:border-default-800 space-y-2 text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                Rekomendasi Tindakan Terukur (Action Plan)
              </span>
              <ul className="space-y-1.5 pl-1">
                {auditData.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-default-600 dark:text-default-300">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold text-[9px] mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* Empty / Initial state */
        <div className="mt-4 p-6 rounded-xl border border-dashed border-default-200 dark:border-default-800 text-center space-y-3 bg-white/50 dark:bg-gray-900/40">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Audit Forensik Keuangan Belum Dijalankan
            </h4>
            <p className="text-xs text-default-400 max-w-md mx-auto mt-1">
              Jalankan audit untuk mendeteksi pos pengeluaran yang bocor, menghitung skor kesehatan finansial, dan mendapatkan saran konkret penataan anggaran.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleRunAudit}
            isDisabled={loading}
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            )}
            Mulai Audit Finansial Sekarang
          </Button>
        </div>
      )}
    </Card>
  );
}
