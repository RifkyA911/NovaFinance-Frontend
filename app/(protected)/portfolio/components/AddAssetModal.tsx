/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { X, Plus, Sparkles, Check, DollarSign } from "lucide-react";
import type { PortfolioAsset, AssetCategory } from "../types";
import { CATEGORY_CONFIG } from "../types";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: PortfolioAsset) => void;
  editingAsset: PortfolioAsset | null;
}

const PRESET_TICKERS = [
  { symbol: "BBCA.JK", name: "Bank Central Asia Tbk", category: "stocks_id" as AssetCategory, sector: "Banking", yield: 2.8, price: 10250 },
  { symbol: "BBRI.JK", name: "Bank Rakyat Indonesia Tbk", category: "stocks_id" as AssetCategory, sector: "Banking", yield: 5.6, price: 5350 },
  { symbol: "BMRI.JK", name: "Bank Mandiri Tbk", category: "stocks_id" as AssetCategory, sector: "Banking", yield: 5.2, price: 7100 },
  { symbol: "TLKM.JK", name: "Telkom Indonesia Tbk", category: "stocks_id" as AssetCategory, sector: "Telecom", yield: 5.1, price: 3150 },
  { symbol: "ASII.JK", name: "Astra International Tbk", category: "stocks_id" as AssetCategory, sector: "Automotive / Conglomerate", yield: 8.5, price: 5100 },
  { symbol: "BTC", name: "Bitcoin", category: "crypto" as AssetCategory, sector: "Digital Asset", yield: 0, price: 990000000 },
  { symbol: "ETH", name: "Ethereum", category: "crypto" as AssetCategory, sector: "Smart Contract", yield: 0, price: 41000000 },
  { symbol: "ANTAM", name: "Emas Batangan Antam 24K", category: "gold" as AssetCategory, sector: "Precious Metals", yield: 0, price: 1420000 },
  { symbol: "SBN-ORI025", name: "Obligasi Ritel ORI025", category: "bonds" as AssetCategory, sector: "Government Bond", yield: 6.4, price: 1000000 },
  { symbol: "NVDA", name: "NVIDIA Corp.", category: "stocks_us" as AssetCategory, sector: "Semiconductors / AI", yield: 0.1, price: 1850000 },
];

export function AddAssetModal({
  isOpen,
  onClose,
  onSave,
  editingAsset,
}: AddAssetModalProps) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("stocks_id");
  const [shares, setShares] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [dividendYield, setDividendYield] = useState("");
  const [targetAllocation, setTargetAllocation] = useState("");
  const [sector, setSector] = useState("");

  useEffect(() => {
    if (editingAsset) {
      setSymbol(editingAsset.symbol);
      setName(editingAsset.name);
      setCategory(editingAsset.category);
      setShares(String(editingAsset.shares));
      setAvgBuyPrice(String(editingAsset.avgBuyPrice));
      setCurrentPrice(String(editingAsset.currentPrice));
      setDividendYield(String(editingAsset.dividendYield));
      setTargetAllocation(String(editingAsset.targetAllocation));
      setSector(editingAsset.sector);
    } else {
      setSymbol("");
      setName("");
      setCategory("stocks_id");
      setShares("100");
      setAvgBuyPrice("10000");
      setCurrentPrice("10000");
      setDividendYield("3.0");
      setTargetAllocation("10");
      setSector("General");
    }
  }, [editingAsset, isOpen]);

  const handleSelectPreset = (p: typeof PRESET_TICKERS[0]) => {
    setSymbol(p.symbol);
    setName(p.name);
    setCategory(p.category);
    setSector(p.sector);
    setDividendYield(String(p.yield));
    setCurrentPrice(String(p.price));
    if (!avgBuyPrice) setAvgBuyPrice(String(p.price));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !name || !shares || !avgBuyPrice) return;

    const cur = Number(currentPrice) || Number(avgBuyPrice);
    const avg = Number(avgBuyPrice);

    // Generate simulated sparkline
    const sparkline = editingAsset?.sparkline || [
      avg * 0.95,
      avg * 0.98,
      avg * 1.02,
      cur * 0.96,
      cur * 0.99,
      cur,
    ];

    const saved: PortfolioAsset = {
      id: editingAsset?.id || `ast-${Date.now()}`,
      symbol: symbol.toUpperCase().trim(),
      name: name.trim(),
      category,
      shares: Number(shares),
      avgBuyPrice: avg,
      currentPrice: cur,
      currency: "IDR",
      dividendYield: Number(dividendYield) || 0,
      targetAllocation: Number(targetAllocation) || 10,
      sector: sector || "General",
      sparkline,
    };

    onSave(saved);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-default-200 dark:border-default-700 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-2xl space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-default-100 dark:border-default-800">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {editingAsset ? "Edit Posisi Aset" : "Tambah Posisi Aset Investasi"}
            </h3>
            <p className="text-xs text-default-500">
              Catat saham, kripto, obligasi atau emas ke dalam portofolio
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        {!editingAsset && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-default-400">Pilihan Cepat (Presets):</span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {PRESET_TICKERS.map((p) => (
                <button
                  key={p.symbol}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="px-2 py-1 rounded-lg bg-default-100 dark:bg-default-800 hover:bg-blue-500/10 hover:text-blue-500 text-[11px] font-mono font-semibold transition-all shrink-0 cursor-pointer"
                >
                  {p.symbol.replace(".JK", "")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Kode / Ticker *
              </label>
              <input
                placeholder="misal: BBCA.JK atau BTC"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Kategori Aset *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-xs font-semibold cursor-pointer"
              >
                {Object.entries(CATEGORY_CONFIG).map(([k, c]) => (
                  <option key={k} value={k}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Nama Lengkap Aset *
            </label>
            <input
              placeholder="misal: Bank Central Asia Tbk"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Jumlah Lembar / Unit *
              </label>
              <input
                type="number"
                step="any"
                placeholder="100"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Sektor / Klasifikasi
              </label>
              <input
                placeholder="misal: Banking"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Harga Modal Beli (Rp) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="9150"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Harga Pasar Terkini (Rp) *
              </label>
              <input
                type="number"
                step="any"
                placeholder="10250"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                required
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Dividen Yield Tahunan (%)
              </label>
              <input
                type="number"
                step="any"
                placeholder="misal: 3.5"
                value={dividendYield}
                onChange={(e) => setDividendYield(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Target Alokasi Ideal (%)
              </label>
              <input
                type="number"
                step="any"
                placeholder="misal: 15"
                value={targetAllocation}
                onChange={(e) => setTargetAllocation(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="text-xs"
              onPress={onClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              className="bg-blue-600 text-white text-xs font-semibold"
            >
              Simpan Aset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
