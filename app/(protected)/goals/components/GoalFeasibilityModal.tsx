/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  RefreshCw,
  Settings2,
  X,
  Zap,
  Key,
  Info,
  Calendar,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { FinancialGoal } from "../page";

interface GoalFeasibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal;
  workspaceName?: string;
  currency?: string;
  monthlyIncome?: number;
  monthlyExpense?: number;
  totalBalance?: number;
  onApplyNewDate?: (goalId: string, newDate: string) => void;
}

interface FeasibilityResponseData {
  feasibilityScore: number;
  status: "Sangat Realistis" | "Cukup Realistis" | "Perlu Penyesuaian" | "Sangat Berat / Risiko Defisit";
  summary: string;
  remainingNeeded: number;
  monthsRemaining: number;
  monthlyRequired: number;
  currentNetCashflow: number;
  gap: number;
  suggestedTargetDate?: string;
  alternativeOptions: Array<{
    title: string;
    description: string;
  }>;
  engineUsed: string;
}

export default function GoalFeasibilityModal({
  isOpen,
  onClose,
  goal,
  workspaceName = "Personal Workspace",
  currency = "IDR",
  monthlyIncome = 0,
  monthlyExpense = 0,
  totalBalance = 0,
  onApplyNewDate,
}: GoalFeasibilityModalProps) {
  const [loading, setLoading] = useState(false);
  const [feasibilityData, setFeasibilityData] = useState<FeasibilityResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [appliedDateSuccess, setAppliedDateSuccess] = useState(false);

  // AI Settings configuration
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"auto" | "groq" | "gemini" | "deepseek" | "claude">("auto");
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("novajournal_ai_key");
    const savedProv = localStorage.getItem("novajournal_ai_provider");
    if (savedKey) setApiKey(savedKey);
    if (savedProv) setProvider(savedProv as any);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("novajournal_ai_key", apiKey.trim());
    localStorage.setItem("novajournal_ai_provider", provider);
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2000);
  };

  const runFeasibilityCheck = useCallback(async () => {
    if (!goal) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/ai/goal-feasibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalTitle: goal.title,
          category: goal.category,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          targetDate: goal.targetDate,
          workspaceName,
          currency,
          monthlyIncome,
          monthlyExpense,
          totalBalance,
          userApiKey: apiKey.trim() || undefined,
          userProvider: provider,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Gagal menganalisis kelayakan target.");
      }

      setFeasibilityData(json.data);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal terhubung ke AI Service.");
    } finally {
      setLoading(false);
    }
  }, [apiKey, currency, goal, monthlyExpense, monthlyIncome, provider, totalBalance, workspaceName]);

  useEffect(() => {
    if (isOpen && goal) {
      runFeasibilityCheck();
    }
  }, [isOpen, goal, runFeasibilityCheck]);

  if (!isOpen || !goal) return null;

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getScoreColorBadge = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    if (score >= 65) return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    if (score >= 50) return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-default-200/80 dark:border-default-800 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-foreground">
                  Smart Goal Feasibility Simulator
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  AI Advisor
                </span>
              </div>
              <p className="text-xs text-default-500">
                Target: <span className="font-semibold text-foreground">{goal.title}</span> ({formatCurrency(goal.targetAmount)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 px-2.5 text-xs text-default-500 hover:text-foreground cursor-pointer"
              onPress={() => setShowSettings(!showSettings)}
              aria-label="Pengaturan Provider AI"
            >
              <Settings2 className="w-4 h-4" />
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* AI Settings Drawer (Secondary Override) */}
          {showSettings && (
            <div className="p-3.5 rounded-2xl bg-default-50 dark:bg-default-800/60 border border-default-200 dark:border-default-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Key className="w-3.5 h-3.5 text-blue-500" />
                  <span>Override Model AI (Secondary / Alternatif)</span>
                </div>
                <a
                  href="/settings"
                  target="_blank"
                  className="text-[11px] text-blue-500 hover:underline flex items-center gap-0.5"
                >
                  Buka Pengaturan Utama &rarr;
                </a>
              </div>
              <p className="text-[10px] text-default-400">
                Secara default, simulasi ini menggunakan API Key & Provider dari halaman <strong>Settings</strong>. Pilih provider di bawah hanya jika ingin mencoba opsi alternatif khusus target ini.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-default-500 block mb-1">Provider Utama</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full h-8 px-2.5 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-foreground outline-none"
                  >
                    <option value="auto">⚡ Auto-Fallback (Groq → Gemini → DeepSeek → Local)</option>
                    <option value="groq">Groq (Llama 3.3 70B - Ultra Fast)</option>
                    <option value="gemini">Google Gemini 2.0 Flash</option>
                    <option value="deepseek">DeepSeek Chat</option>
                    <option value="claude">Anthropic Claude 3.5 Haiku</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-default-500 block mb-1">Custom API Key (Opsional)</label>
                  <input
                    type="password"
                    placeholder="Kosongkan untuk memakai environment default..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 text-foreground outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-default-400">
                  {savedSettingsSuccess ? "✅ Pengaturan tersimpan!" : "Tersimpan aman di browser Anda."}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  className="h-7 text-xs px-3 bg-blue-600 text-white font-medium cursor-pointer"
                  onPress={handleSaveSettings}
                >
                  Simpan & Terapkan
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 animate-spin">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Menganalisis Kelayakan Finansial...</p>
                <p className="text-default-400 text-xs mt-0.5">
                  Menghitung rasio arus kas, durasi target, serta mitigasi risiko defisit dengan AI.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                <span>Gagal Melakukan Analisis</span>
              </div>
              <p className="text-xs">{errorMessage}</p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-2 text-xs"
                onPress={runFeasibilityCheck}
              >
                Coba Lagi
              </Button>
            </div>
          )}

          {/* Feasibility Result Content */}
          {!loading && feasibilityData && (
            <div className="space-y-4">
              {/* Feasibility Score Top Card */}
              <div className="p-4 rounded-2xl bg-default-50 dark:bg-default-800/40 border border-default-200/80 dark:border-default-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-default-500 uppercase tracking-wider">
                      Diagnosis Kelayakan
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getScoreColorBadge(
                        feasibilityData.feasibilityScore
                      )}`}
                    >
                      {feasibilityData.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed pt-1">
                    {feasibilityData.summary}
                  </p>
                </div>

                {/* Score Dial */}
                <div className="flex items-center sm:flex-col justify-center sm:items-center shrink-0 p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-default-200 dark:border-default-800 min-w-28 text-center shadow-xs">
                  <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {feasibilityData.feasibilityScore}
                    <span className="text-xs font-normal text-default-400">/100</span>
                  </div>
                  <span className="text-[10px] text-default-400 font-medium">Feasibility Score</span>
                </div>
              </div>

              {/* 4 Financial Parameters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800">
                  <span className="text-[11px] text-default-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-500" /> Sisa Waktu
                  </span>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {feasibilityData.monthsRemaining} <span className="text-[11px] font-normal text-default-400">Bulan</span>
                  </p>
                  <span className="text-[10px] text-default-400">Deadline: {goal.targetDate}</span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800">
                  <span className="text-[11px] text-default-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-purple-500" /> Nabung / Bulan
                  </span>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {formatCurrency(feasibilityData.monthlyRequired)}
                  </p>
                  <span className="text-[10px] text-default-400">
                    Sisa: {formatCurrency(feasibilityData.remainingNeeded)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800">
                  <span className="text-[11px] text-default-400 flex items-center gap-1">
                    <Wallet className="w-3 h-3 text-emerald-500" /> Surplus Kas Riil
                  </span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {formatCurrency(feasibilityData.currentNetCashflow)}
                  </p>
                  <span className="text-[10px] text-default-400">Pemasukan - Pengeluaran</span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800">
                  <span className="text-[11px] text-default-400 flex items-center gap-1">
                    {feasibilityData.gap <= 0 ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-500" />
                    )}
                    Status Arus Kas
                  </span>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      feasibilityData.gap <= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {feasibilityData.gap <= 0
                      ? `+${formatCurrency(Math.abs(feasibilityData.gap))}`
                      : `-${formatCurrency(feasibilityData.gap)}`}
                  </p>
                  <span className="text-[10px] text-default-400">
                    {feasibilityData.gap <= 0 ? "Surplus Aman / bln" : "Defisit Kurang / bln"}
                  </span>
                </div>
              </div>

              {/* AI Strategic Action Options */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Saran & Alternatif Strategis AI</span>
                  </h4>
                  <span className="text-[10px] text-default-400 font-mono">
                    Model: {feasibilityData.engineUsed}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {feasibilityData.alternativeOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 border border-default-200/70 dark:border-default-700/70 hover:border-blue-500/30 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          {opt.title}
                        </span>

                        {idx === 0 && feasibilityData.suggestedTargetDate && onApplyNewDate && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-6 text-[11px] px-2 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 font-semibold cursor-pointer border border-blue-500/20"
                            onPress={() => {
                              onApplyNewDate(goal.id, feasibilityData.suggestedTargetDate!);
                              setAppliedDateSuccess(true);
                              setTimeout(() => setAppliedDateSuccess(false), 3000);
                            }}
                          >
                            {appliedDateSuccess ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Tanggal Diterapkan!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Terapkan Deadline Ini
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-default-500 leading-relaxed pl-5">
                        {opt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-default-200/80 dark:border-default-800 bg-default-50/50 dark:bg-default-900/50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-default-400 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="hidden sm:inline">Simulasi dihitung berbasis arus kas riil workspace ini.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="text-xs h-8 px-3 cursor-pointer"
              onPress={runFeasibilityCheck}
              isDisabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />
              <span>Hitung Ulang</span>
            </Button>

            <Button
              size="sm"
              variant="primary"
              className="text-xs h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs"
              onPress={onClose}
            >
              Selesai
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
