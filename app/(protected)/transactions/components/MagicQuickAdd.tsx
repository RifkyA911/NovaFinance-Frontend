/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Send,
  Settings2,
  Check,
  Loader2,
  ArrowRight,
  Wallet,
  CreditCard,
  X,
  Tag,
  Calendar,
  Zap,
  Key,
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys, mutationFunctions } from "../../../lib/queries";
import { useRouter } from "next/navigation";

interface MagicQuickAddProps {
  categories: Array<{ id: string; name: string; type?: string }>;
  accounts: Array<{ id: string; name: string; type?: string }>;
}

export default function MagicQuickAdd({ categories, accounts }: MagicQuickAddProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspace();

  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Parsed result preview modal state
  const [parsedData, setParsedData] = useState<{
    description: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    categoryName: string;
    matchedCategoryId?: string;
    accountName: string;
    matchedAccountId?: string;
    date: string;
    source?: string;
  } | null>(null);

  // Settings modal for custom API Key (Gemini / Groq)
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("novajournal_ai_key");
    if (saved) setApiKey(saved);
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem("novajournal_ai_key", apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleParse = async (textToParse?: string) => {
    const text = (textToParse || inputPrompt).trim();
    if (!text) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const currentProvider = (typeof window !== "undefined" ? localStorage.getItem("novajournal_ai_provider") : null) || "auto";

      const res = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          workspaceCategories: categories,
          workspaceAccounts: accounts,
          apiKey: apiKey.trim() || undefined,
          provider: currentProvider,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menguraikan transaksi");
      }

      setParsedData({
        ...data.data,
        source: data.source,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memproses.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (presetText: string) => {
    setInputPrompt(presetText);
    handleParse(presetText);
  };

  const handleConfirmSave = async () => {
    if (!parsedData || !selectedWorkspace) return;

    setSaving(true);
    setErrorMsg("");

    try {
      // Find or determine accountId
      const accountId =
        parsedData.matchedAccountId ||
        accounts[0]?.id ||
        "";

      // Find or determine categoryId
      let categoryId = parsedData.matchedCategoryId;
      if (!categoryId && categories.length > 0) {
        const matched = categories.find(
          (c) => c.name.toLowerCase() === parsedData.categoryName.toLowerCase()
        );
        categoryId = matched?.id || categories[0]?.id;
      }

      const payload: any = {
        workspaceId: selectedWorkspace.id,
        amount: parsedData.amount,
        type: parsedData.type.toUpperCase(),
        description: parsedData.description,
        date: parsedData.date || new Date().toISOString(),
      };

      if (accountId) payload.accountId = accountId;
      if (categoryId) payload.categoryId = categoryId;

      await mutationFunctions.createTransaction(payload);

      // Invalidate queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['accounts'] }),
      ]);

      setSuccessMsg(`Transaksi "${parsedData.description}" sebesar Rp ${parsedData.amount.toLocaleString("id-ID")} berhasil dicatat!`);
      setParsedData(null);
      setInputPrompt("");

      setTimeout(() => {
        setSuccessMsg("");
      }, 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan transaksi.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditInFullForm = () => {
    if (!parsedData) return;
    // Push query params to full form
    const params = new URLSearchParams({
      description: parsedData.description,
      amount: String(parsedData.amount),
      type: parsedData.type,
      accountId: parsedData.matchedAccountId || "",
      categoryId: parsedData.matchedCategoryId || "",
    });
    router.push(`/transactions/new?${params.toString()}`);
  };

  return (
    <Card className="p-3.5 sm:p-4 rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-2xs shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Magic Quick-Add AI
            </span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              Gratis & Cepat
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Pengaturan API Key (Gemini / Groq)"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Row (Collapsible) */}
      {showSettings && (
        <div className="mb-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
              <Key className="w-3.5 h-3.5 text-blue-500" />
              Override API Key / Model (Secondary)
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
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Secara default, parser menggunakan konfigurasi dari halaman <strong>Settings</strong>. Masukkan key di bawah hanya jika ingin override/fallback khusus:
          </p>
          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Contoh: gsk_... atau AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 h-8 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold shrink-0"
              onClick={handleSaveApiKey}
            >
              {keySaved ? <Check className="w-3 h-3 text-green-500" /> : "Simpan"}
            </Button>
          </div>
        </div>
      )}

      {/* Natural Language Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleParse();
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ketik santai, misal: 'Makan siang padang 35rb pake bca', 'Gaji 12jt masuk mandiri', 'Beli bensin 50k tunai'..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading || saving}
            className="w-full h-9 pl-3.5 pr-8 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
          />
          {inputPrompt && (
            <button
              type="button"
              onClick={() => setInputPrompt("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          size="sm"
          variant="primary"
          isDisabled={!inputPrompt.trim() || loading || saving}
          className="h-9 px-3.5 text-xs font-semibold bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-xs shrink-0 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <Zap className="w-3.5 h-3.5 mr-1" />
          )}
          Proses AI
        </Button>
      </form>

      {/* Quick Example Presets */}
      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
        <span className="text-gray-400 dark:text-gray-500 shrink-0 font-medium">Contoh:</span>
        <button
          type="button"
          onClick={() => handleQuickPreset("Makan siang bakso 35rb pake bca")}
          className="px-2 py-0.5 rounded-full bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:border-blue-400 shrink-0 transition-colors"
        >
          🍜 Makan siang 35rb BCA
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset("Isi bensin pertamax 100k pake gopay")}
          className="px-2 py-0.5 rounded-full bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:border-blue-400 shrink-0 transition-colors"
        >
          ⛽ Bensin 100k GoPay
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset("Gaji bulanan 15jt masuk mandiri")}
          className="px-2 py-0.5 rounded-full bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:border-blue-400 shrink-0 transition-colors"
        >
          💼 Gaji 15jt Mandiri
        </button>
        <button
          type="button"
          onClick={() => handleQuickPreset("Kopi janji jiwa 24rb tunai")}
          className="px-2 py-0.5 rounded-full bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-gray-600 dark:text-gray-300 hover:border-blue-400 shrink-0 transition-colors"
        >
          ☕ Kopi 24rb Tunai
        </button>
      </div>

      {/* Success Notice */}
      {successMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <X className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Parsed Result Preview Drawer / Card */}
      {parsedData && (
        <div className="mt-3 p-3.5 rounded-xl bg-white dark:bg-gray-900 border border-blue-300 dark:border-blue-800 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Hasil Ekstraksi Transaksi
              {parsedData.source && (
                <span className="text-[10px] font-normal text-gray-400">
                  via {parsedData.source}
                </span>
              )}
            </div>
            <button
              onClick={() => setParsedData(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Title / Description */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Judul Transaksi</span>
              <input
                type="text"
                value={parsedData.description}
                onChange={(e) =>
                  setParsedData({ ...parsedData, description: e.target.value })
                }
                className="w-full h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white text-xs"
              />
            </div>

            {/* Amount & Type */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase">
                <span>Nominal</span>
                <span
                  className={`px-1 py-0.2 rounded font-bold ${
                    parsedData.type === "INCOME"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-rose-500/10 text-rose-600"
                  }`}
                >
                  {parsedData.type}
                </span>
              </div>
              <input
                type="number"
                value={parsedData.amount}
                onChange={(e) =>
                  setParsedData({ ...parsedData, amount: Number(e.target.value) || 0 })
                }
                className="w-full h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold text-gray-900 dark:text-white text-xs"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Kategori</span>
              <select
                value={parsedData.matchedCategoryId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const cat = categories.find((c) => c.id === selectedId);
                  setParsedData({
                    ...parsedData,
                    matchedCategoryId: selectedId,
                    categoryName: cat?.name || parsedData.categoryName,
                  });
                }}
                className="w-full h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white text-xs"
              >
                <option value="">{parsedData.categoryName} (Otomatis)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Dropdown */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">Rekening</span>
              <select
                value={parsedData.matchedAccountId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const acc = accounts.find((a) => a.id === selectedId);
                  setParsedData({
                    ...parsedData,
                    matchedAccountId: selectedId,
                    accountName: acc?.name || parsedData.accountName,
                  });
                }}
                className="w-full h-8 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-gray-900 dark:text-white text-xs"
              >
                <option value="">{parsedData.accountName} (Otomatis)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Confirmation Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              size="sm"
              variant="outline"
              onClick={handleEditInFullForm}
              className="text-xs h-8"
            >
              Edit di Form Lengkap
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleConfirmSave}
              isDisabled={saving}
              className="text-xs h-8 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Check className="w-3 h-3 mr-1" />
              )}
              Simpan Transaksi Langsung
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
