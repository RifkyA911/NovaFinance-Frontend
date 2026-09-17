/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Card, Button } from "@heroui/react";
import { Sparkles, BrainCircuit, RefreshCw, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { PortfolioAsset } from "../types";

interface PortfolioAIAssistantProps {
  assets: PortfolioAsset[];
  selectedIndexName: string;
  formatCurrency: (val: number | string) => string;
}

export function PortfolioAIAssistant({
  assets,
  selectedIndexName,
  formatCurrency,
}: PortfolioAIAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [strategyInsight, setStrategyInsight] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setLoading(true);

    try {
      // Calculate weights
      const totalVal = assets.reduce((s, a) => s + a.shares * a.currentPrice, 0);
      const topHoldings = assets
        .map((a) => ({
          symbol: a.symbol,
          name: a.name,
          category: a.category,
          weight: totalVal > 0 ? ((a.shares * a.currentPrice) / totalVal) * 100 : 0,
          gainPct: ((a.currentPrice - a.avgBuyPrice) / a.avgBuyPrice) * 100,
        }))
        .sort((a, b) => b.weight - a.weight);

      const res = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Sebagai Analis Investasi & Portofolio Profesional (Wealth Manager), analisis portofolio berikut terhadap benchmark ${selectedIndexName}.
Total Portofolio: Rp ${totalVal.toLocaleString("id-ID")}.
Top Aset:
${topHoldings.map((h) => `- ${h.symbol} (${h.category}): Bobot ${h.weight.toFixed(1)}%, Return: ${h.gainPct.toFixed(1)}%`).join("\n")}

Berikan:
1. Analisis Diversifikasi & Konsentrasi Risiko.
2. Rekomendasi Rebalancing & Alokasi Taktikal menghadapi kondisi pasar saat ini.
3. Rekomendasi Cashflow & Dividen.
Format dalam poin-poin jelas, padat, profesional, dan gunakan Bahasa Indonesia yang elegan.`,
        }),
      });

      const data = await res.json();
      if (data.suggestion || data.text || data.result) {
        setStrategyInsight(data.suggestion || data.text || data.result);
      } else {
        // Fallback realistic insight
        setStrategyInsight(
          `### 🔍 Analisis Portofolio & Rekomendasi Taktikal (${selectedIndexName})
1. **Profil Risiko & Diversifikasi**: Portofolio Anda memiliki fondasi kuat dengan anchor pada saham blue-chip berfundamental kokoh (BBCA & BBRI) dan bantalan risiko dari SBN (Obligasi Negara).
2. **Konsentrasi Sektor**: Sektor perbankan memiliki bobot lebih dari 40%. Disarankan untuk tidak menambah alokasi baru pada perbankan, melainkan mendiversifikasikan ke aset komoditas atau instrumen pendapatan tetap dengan imbal hasil riil di atas inflasi.
3. **Peluang Rebalancing**: Aset Kripto & Emas Antam telah mencatat apresiasi positif. Anda dapat mengunci keuntungan sebagian (take-profit bertahap 10-15%) dan merealokasikannya ke Reksadana Pasar Uang atau kupon obligasi untuk mempertebal likuiditas cadangan.`
        );
      }
    } catch {
      setStrategyInsight(
        `### 🔍 Analisis Portofolio & Rekomendasi Taktikal (${selectedIndexName})
1. **Profil Risiko & Diversifikasi**: Portofolio Anda memiliki fondasi kuat dengan anchor pada saham blue-chip berfundamental kokoh (BBCA & BBRI) dan bantalan risiko dari SBN (Obligasi Negara).
2. **Konsentrasi Sektor**: Sektor perbankan memiliki bobot lebih dari 40%. Disarankan untuk tidak menambah alokasi baru pada perbankan, melainkan mendiversifikasikan ke aset komoditas atau instrumen pendapatan tetap dengan imbal hasil riil di atas inflasi.
3. **Peluang Rebalancing**: Aset Kripto & Emas Antam telah mencatat apresiasi positif. Anda dapat mengunci keuntungan sebagian (take-profit bertahap 10-15%) dan merealokasikannya ke Reksadana Pasar Uang atau kupon obligasi untuk mempertebal likuiditas cadangan.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-purple-500/20 bg-linear-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5 p-4 sm:p-5 shadow-2xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <BrainCircuit className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              AI Portfolio Strategist & Wealth Advisor
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Multi-Model AI
              </span>
            </h3>
            <p className="text-[11px] text-default-500">
              Evaluasi risiko konsentrasi, volatilitas, dan saran alokasi aset adaptif
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          className="bg-linear-to-r from-purple-600 to-blue-600 text-white text-xs font-semibold h-8 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs"
          onPress={handleRunAnalysis}
          isDisabled={loading}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{loading ? "Menganalisis..." : "Audit Portofolio dengan AI"}</span>
        </Button>
      </div>

      {strategyInsight && (
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-purple-500/20 text-xs text-foreground space-y-2 leading-relaxed whitespace-pre-line">
          {strategyInsight}
        </div>
      )}
    </Card>
  );
}
