/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@heroui/react";
import {
  Briefcase,
  Plus,
  TrendingUp,
  LayoutGrid,
  Scale,
  Sparkles,
  Coins,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

// Modular components
import { GlobalIndexTicker, GLOBAL_INDICES } from "./components/GlobalIndexTicker";
import { PortfolioMetrics } from "./components/PortfolioMetrics";
import { PortfolioHeatmap } from "./components/PortfolioHeatmap";
import { WealthProjector } from "./components/WealthProjector";
import { RebalanceCalculator } from "./components/RebalanceCalculator";
import { DividendForecast } from "./components/DividendForecast";
import { HoldingsTable } from "./components/HoldingsTable";
import { AddAssetModal } from "./components/AddAssetModal";
import { PortfolioAIAssistant } from "./components/PortfolioAIAssistant";
import type { PortfolioAsset } from "./types";
import { INITIAL_DEFAULT_ASSETS } from "./types";

export default function PortfolioPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedWorkspace } = useWorkspace();

  // Active Global Index (Default: IHSG 🇮🇩)
  const [selectedIndexId, setSelectedIndexId] = useState<string>("ihsg");

  // Active Sub-tab
  const [activeTab, setActiveTab] = useState<"holdings" | "projections" | "rebalance" | "dividends">("holdings");

  // Assets state
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<PortfolioAsset | null>(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load / persist assets per workspace in localStorage
  useEffect(() => {
    const wsId = selectedWorkspace?.id || "default";
    const storageKey = `novajournal_portfolio_${wsId}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAssets(parsed);
          return;
        }
      } catch {}
    }

    // Default seed
    setAssets(INITIAL_DEFAULT_ASSETS);
    try {
      localStorage.setItem(storageKey, JSON.stringify(INITIAL_DEFAULT_ASSETS));
    } catch {}
  }, [selectedWorkspace?.id]);

  const saveAssets = (newAssets: PortfolioAsset[]) => {
    setAssets(newAssets);
    const wsId = selectedWorkspace?.id || "default";
    try {
      localStorage.setItem(`novajournal_portfolio_${wsId}`, JSON.stringify(newAssets));
    } catch {}
  };

  const handleAddOrUpdateAsset = (asset: PortfolioAsset) => {
    const exists = assets.some((a) => a.id === asset.id);
    let updated: PortfolioAsset[];
    if (exists) {
      updated = assets.map((a) => (a.id === asset.id ? asset : a));
    } else {
      updated = [asset, ...assets];
    }
    saveAssets(updated);
  };

  const handleDeleteAsset = (id: string) => {
    const updated = assets.filter((a) => a.id !== id);
    saveAssets(updated);
  };

  const handleEditAsset = (asset: PortfolioAsset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const activeIndex = useMemo(() => {
    return GLOBAL_INDICES.find((i) => i.id === selectedIndexId) || GLOBAL_INDICES[0];
  }, [selectedIndexId]);

  const totalPortfolioValue = useMemo(() => {
    return assets.reduce((sum, ast) => sum + ast.shares * ast.currentPrice, 0);
  }, [assets]);

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              Wealth & Investment Portfolio
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Benchmark: {activeIndex.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-default-500 mt-0.5">
            Monitoring multi-asset global (Saham IHSG, Global US, SBN, Kripto, Emas) dengan kalkulasi PnL riil
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="text-xs font-semibold h-8 px-3 rounded-xl border border-default-200 dark:border-default-700 cursor-pointer"
            onPress={() => {
              saveAssets(INITIAL_DEFAULT_ASSETS);
            }}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            <span>Reset Demo</span>
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="bg-blue-600 text-white text-xs font-semibold h-8 px-3.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            onPress={() => {
              setEditingAsset(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Posisi Aset</span>
          </Button>
        </div>
      </div>

      {/* 1. Global Market Indices Watcher Bar (Default: IHSG 🇮🇩) */}
      <GlobalIndexTicker
        selectedIndex={selectedIndexId}
        onSelectIndex={setSelectedIndexId}
      />

      {/* 2. Executive KPI Cards */}
      <PortfolioMetrics
        assets={assets}
        formatCurrency={formatCurrency}
      />

      {/* 3. AI Portfolio Strategist & Wealth Advisor */}
      <PortfolioAIAssistant
        assets={assets}
        selectedIndexName={activeIndex.name}
        formatCurrency={formatCurrency}
      />

      {/* 4. Tab Navigation Menu */}
      <div className="flex items-center gap-1.5 border-b border-default-200 dark:border-default-800 pb-2 overflow-x-auto scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("holdings")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "holdings"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800"
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Holdings & Heatmap</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projections")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "projections"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Monte Carlo Wealth Projector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rebalance")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "rebalance"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800"
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Smart Rebalance Engine</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dividends")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "dividends"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-default-500 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Dividend & Passive Income</span>
        </button>
      </div>

      {/* 5. Dynamic Tab Content */}
      {activeTab === "holdings" && (
        <div className="space-y-4">
          {/* Finviz / S&P Style Portfolio Heatmap */}
          <PortfolioHeatmap
            assets={assets}
            formatCurrency={formatCurrency}
          />

          {/* Holdings TanStack Table */}
          <HoldingsTable
            assets={assets}
            formatCurrency={formatCurrency}
            onAddAsset={() => {
              setEditingAsset(null);
              setIsModalOpen(true);
            }}
            onDeleteAsset={handleDeleteAsset}
            onEditAsset={handleEditAsset}
          />
        </div>
      )}

      {activeTab === "projections" && (
        <WealthProjector
          initialCapital={totalPortfolioValue}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === "rebalance" && (
        <RebalanceCalculator
          assets={assets}
          formatCurrency={formatCurrency}
        />
      )}

      {activeTab === "dividends" && (
        <DividendForecast
          assets={assets}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Add / Edit Asset Modal */}
      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleAddOrUpdateAsset}
        editingAsset={editingAsset}
      />
    </div>
  );
}
