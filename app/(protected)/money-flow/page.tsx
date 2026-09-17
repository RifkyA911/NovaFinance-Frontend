/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Workflow,
  Sparkles,
  RefreshCw,
  Sliders,
  Wallet,
  ArrowRight,
  Maximize2,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  X,
  PieChart,
  CheckCircle2,
  Building2,
  Plus,
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryFunctions } from "../../lib/queries";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  IncomeNode,
  WalletNode,
  ExpenseNode,
  SavingsNode,
} from "./components/FlowNodes";

const nodeTypes: any = {
  incomeNode: IncomeNode,
  walletNode: WalletNode,
  expenseNode: ExpenseNode,
  savingsNode: SavingsNode,
};

const formatCurrency = (val: number) => {
  return "Rp " + Math.round(val).toLocaleString("id-ID");
};

export default function MoneyFlowPage() {
  const { selectedWorkspace } = useWorkspace();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Mode: "actual" (workspace transactions) or "simulation" (50/30/20 budget planner)
  const [mode, setMode] = useState<"actual" | "simulation">("actual");

  // Simulation parameters
  const [simMonthlyIncome, setSimMonthlyIncome] = useState<number>(15000000);
  const [simRule, setSimRule] = useState<"503020" | "603010" | "fire">("503020");

  // Selected node for detail drawer
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  // Time filter for actual transactions
  const [timeFilter, setTimeFilter] = useState<"all" | "this_month" | "last_3_months">("all");

  // Fetch actual data
  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(selectedWorkspace?.id || "", 1000),
    queryFn: () => queryFunctions.transactions(selectedWorkspace?.id || "", 1000),
    enabled: !!selectedWorkspace?.id,
  });

  const accountsQuery = useQuery({
    queryKey: queryKeys.accounts(selectedWorkspace?.id),
    queryFn: () => queryFunctions.accounts(selectedWorkspace?.id),
    enabled: !!selectedWorkspace?.id,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.categories(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  // Calculate actual flow graph
  const rawTransactions = useMemo(() => {
    return transactionsQuery.data?.data?.transactions || [];
  }, [transactionsQuery.data]);

  const rawAccounts = useMemo(() => {
    return accountsQuery.data?.data?.accounts || [];
  }, [accountsQuery.data]);

  const rawCategories = useMemo(() => {
    return categoriesQuery.data?.data?.categories || [];
  }, [categoriesQuery.data]);

  const categoryLookupMap = useMemo(() => {
    const map = new Map<string, string>();
    rawCategories.forEach((cat: any) => {
      if (cat.id && cat.name) {
        map.set(cat.id, cat.name);
      }
    });
    return map;
  }, [rawCategories]);

  // Filter transactions by time
  const filteredTransactions = useMemo(() => {
    if (timeFilter === "all") return rawTransactions;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return rawTransactions.filter((tx: any) => {
      const txDate = new Date(tx.date || tx.createdAt);
      if (isNaN(txDate.getTime())) return true;

      if (timeFilter === "this_month") {
        return (
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonth
        );
      }
      if (timeFilter === "last_3_months") {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return txDate >= threeMonthsAgo;
      }
      return true;
    });
  }, [rawTransactions, timeFilter]);

  // Build Actual Flow Nodes & Edges
  const { actualNodes, actualEdges, actualMetrics } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Maps for aggregation
    const incomeCategoriesMap = new Map<
      string,
      { amount: number; count: number; name: string; id: string }
    >();
    const expenseCategoriesMap = new Map<
      string,
      { amount: number; count: number; name: string; id: string }
    >();
    const accountFlowsMap = new Map<
      string,
      { totalIn: number; totalOut: number; name: string; id: string; balance: number; type: string }
    >();

    // Edge tracking: [sourceId -> targetId] -> total amount
    const flowStreams = new Map<string, { source: string; target: string; amount: number; label: string }>();

    // Prepopulate accounts
    rawAccounts.forEach((acc: any) => {
      accountFlowsMap.set(acc.id, {
        id: acc.id,
        name: acc.name,
        type: acc.type || "bank",
        balance: Number(acc.balance) || 0,
        totalIn: 0,
        totalOut: 0,
      });
    });

    let totalInflow = 0;
    let totalOutflow = 0;

    filteredTransactions.forEach((tx: any) => {
      const amount = Math.abs(Number(tx.amount) || 0);
      const isIncome =
        tx.type === "INCOME" || tx.type === "income";
      const isExpense =
        tx.type === "EXPENSE" || tx.type === "expense";

      // Safe Category extraction
      let catName = "";
      let catId = "";

      if (tx.category && typeof tx.category === "object") {
        catName = typeof tx.category.name === "string" ? tx.category.name : "";
        catId = typeof tx.category.id === "string" ? tx.category.id : "";
      } else if (typeof tx.category === "string" && tx.category.trim()) {
        catName = tx.category.trim();
      }

      // If name is missing, try looking up via tx.categoryId or catId
      const fallbackCatId = tx.categoryId || catId;
      if (!catName && fallbackCatId && categoryLookupMap.has(fallbackCatId)) {
        catName = categoryLookupMap.get(fallbackCatId) || "";
      }

      // Final fallback if no category name
      if (!catName || typeof catName !== "string" || !catName.trim()) {
        catName = isIncome ? "Pemasukan Lainnya" : "Pengeluaran Umum";
      }

      if (!catId) {
        const safeSlug = String(catName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        catId = `cat-${safeSlug || "default"}`;
      }

      // Safe Account extraction
      let accountId = "";
      let accountName = "";

      if (tx.accountId && typeof tx.accountId === "string") {
        accountId = tx.accountId;
      } else if (tx.account && typeof tx.account === "object") {
        accountId = tx.account.id || "";
        accountName = tx.account.name || "";
      } else if (typeof tx.account === "string") {
        accountId = tx.account;
      }

      if (!accountId) {
        accountId = rawAccounts[0]?.id || "default-acc";
      }

      if (!accountName) {
        accountName =
          rawAccounts.find((a: any) => a.id === accountId)?.name ||
          "Rekening Utama";
      }

      if (!accountFlowsMap.has(accountId)) {
        accountFlowsMap.set(accountId, {
          id: accountId,
          name: accountName,
          type: "bank",
          balance: 0,
          totalIn: 0,
          totalOut: 0,
        });
      }

      const accData = accountFlowsMap.get(accountId)!;

      if (isIncome) {
        totalInflow += amount;
        accData.totalIn += amount;

        // Income Category Node
        const incomeCat = incomeCategoriesMap.get(catId) || {
          id: catId,
          name: catName,
          amount: 0,
          count: 0,
        };
        incomeCat.amount += amount;
        incomeCat.count += 1;
        incomeCategoriesMap.set(catId, incomeCat);

        // Stream: Income -> Account
        const streamKey = `${catId}__to__${accountId}`;
        const existing = flowStreams.get(streamKey) || {
          source: catId,
          target: accountId,
          amount: 0,
          label: catName,
        };
        existing.amount += amount;
        flowStreams.set(streamKey, existing);
      } else if (isExpense) {
        totalOutflow += amount;
        accData.totalOut += amount;

        // Expense Category Node
        const expenseCat = expenseCategoriesMap.get(catId) || {
          id: catId,
          name: catName,
          amount: 0,
          count: 0,
        };
        expenseCat.amount += amount;
        expenseCat.count += 1;
        expenseCategoriesMap.set(catId, expenseCat);

        // Stream: Account -> Expense
        const streamKey = `${accountId}__to__${catId}`;
        const existing = flowStreams.get(streamKey) || {
          source: accountId,
          target: catId,
          amount: 0,
          label: catName,
        };
        existing.amount += amount;
        flowStreams.set(streamKey, existing);
      }
    });

    // Positions
    const COL_1_X = 60;   // Inflow Sources
    const COL_2_X = 460;  // Accounts
    const COL_3_X = 860;  // Outflow Destinations
    const Y_SPACING = 140;

    // 1. Generate Inflow Nodes
    const incomeList = Array.from(incomeCategoriesMap.values()).sort(
      (a, b) => b.amount - a.amount
    );
    incomeList.forEach((inc, idx) => {
      nodes.push({
        id: inc.id,
        type: "incomeNode",
        position: { x: COL_1_X, y: 60 + idx * Y_SPACING },
        data: {
          label: inc.name,
          amount: inc.amount,
          count: inc.count,
          category: String(inc.name || "").toLowerCase(),
        },
      });
    });

    // 2. Generate Account Nodes
    const accountList = Array.from(accountFlowsMap.values());
    accountList.forEach((acc, idx) => {
      nodes.push({
        id: acc.id,
        type: "walletNode",
        position: { x: COL_2_X, y: 80 + idx * (Y_SPACING + 20) },
        data: {
          label: acc.name,
          type: acc.type,
          balance: acc.balance,
          totalIn: acc.totalIn,
          totalOut: acc.totalOut,
        },
      });
    });

    // 3. Generate Expense Nodes
    const expenseList = Array.from(expenseCategoriesMap.values()).sort(
      (a, b) => b.amount - a.amount
    );
    expenseList.forEach((exp, idx) => {
      const percentage = totalOutflow > 0 ? (exp.amount / totalOutflow) * 100 : 0;
      nodes.push({
        id: exp.id,
        type: "expenseNode",
        position: { x: COL_3_X, y: 60 + idx * Y_SPACING },
        data: {
          label: exp.name,
          amount: exp.amount,
          count: exp.count,
          percentage,
        },
      });
    });

    // 4. Generate Edges with dynamic stroke width
    let edgeIndex = 0;
    flowStreams.forEach((stream) => {
      // Calculate stroke thickness between 2px and 8px based on amount
      const strokeWidth = Math.max(
        2,
        Math.min(7, Math.round(Math.log10(Math.max(stream.amount, 1000)) * 1.2))
      );

      const isFromIncome = incomeCategoriesMap.has(stream.source);
      const strokeColor = isFromIncome
        ? isDark
          ? "#10b981"
          : "#059669"
        : isDark
        ? "#f43f5e"
        : "#e11d48";

      edges.push({
        id: `e-${stream.source}-${stream.target}-${edgeIndex++}`,
        source: stream.source,
        target: stream.target,
        animated: true,
        style: {
          stroke: strokeColor,
          strokeWidth,
          opacity: 0.85,
        },
        label: formatCurrency(stream.amount),
        labelStyle: {
          fontSize: 10,
          fontWeight: 600,
          fill: isDark ? "#d1d5db" : "#374151",
        },
        labelBgStyle: {
          fill: isDark ? "#111827" : "#ffffff",
          fillOpacity: 0.9,
          rx: 4,
          ry: 4,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14,
        },
      });
    });

    return {
      actualNodes: nodes,
      actualEdges: edges,
      actualMetrics: {
        totalInflow,
        totalOutflow,
        netCashflow: totalInflow - totalOutflow,
        savingsRate:
          totalInflow > 0
            ? Math.max(0, ((totalInflow - totalOutflow) / totalInflow) * 100)
            : 0,
      },
    };
  }, [rawAccounts, filteredTransactions, categoryLookupMap, isDark]);

  // Build Simulation Flow Nodes & Edges (e.g. 50/30/20 Rule)
  const { simNodes, simEdges, simMetrics } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const income = simMonthlyIncome;
    let needsRatio = 0.5;
    let wantsRatio = 0.3;
    let savingsRatio = 0.2;

    if (simRule === "603010") {
      needsRatio = 0.6;
      wantsRatio = 0.3;
      savingsRatio = 0.1;
    } else if (simRule === "fire") {
      needsRatio = 0.4;
      wantsRatio = 0.2;
      savingsRatio = 0.4;
    }

    const needsAmount = income * needsRatio;
    const wantsAmount = income * wantsRatio;
    const savingsAmount = income * savingsRatio;

    const COL_1_X = 60;
    const COL_2_X = 460;
    const COL_3_X = 860;

    // Inflow Nodes
    const mainSalary = income * 0.8;
    const sideGig = income * 0.2;

    nodes.push({
      id: "sim-in-1",
      type: "incomeNode",
      position: { x: COL_1_X, y: 100 },
      data: {
        label: "Gaji Pokok",
        amount: mainSalary,
        count: 1,
        category: "salary",
      },
    });

    nodes.push({
      id: "sim-in-2",
      type: "incomeNode",
      position: { x: COL_1_X, y: 260 },
      data: {
        label: "Side Hustle / Bonus",
        amount: sideGig,
        count: 2,
        category: "freelance",
      },
    });

    // Account Nodes
    const bcaAmount = income * 0.7;
    const cashAmount = income * 0.3;

    nodes.push({
      id: "sim-acc-1",
      type: "walletNode",
      position: { x: COL_2_X, y: 80 },
      data: {
        label: "Rekening Payroll (BCA)",
        type: "bank",
        balance: bcaAmount * 1.5,
        totalIn: bcaAmount,
        totalOut: needsAmount + savingsAmount,
      },
    });

    nodes.push({
      id: "sim-acc-2",
      type: "walletNode",
      position: { x: COL_2_X, y: 280 },
      data: {
        label: "E-Wallet & Cash (Harian)",
        type: "cash",
        balance: cashAmount * 0.8,
        totalIn: cashAmount,
        totalOut: wantsAmount,
      },
    });

    // Outflow Nodes
    // 1. Kebutuhan Pokok (Needs)
    nodes.push({
      id: "sim-out-needs",
      type: "expenseNode",
      position: { x: COL_3_X, y: 40 },
      data: {
        label: `Kebutuhan Pokok (${(needsRatio * 100).toFixed(0)}%)`,
        amount: needsAmount,
        count: 8,
        percentage: needsRatio * 100,
      },
    });

    // 2. Keinginan & Lifestyle (Wants)
    nodes.push({
      id: "sim-out-wants",
      type: "expenseNode",
      position: { x: COL_3_X, y: 190 },
      data: {
        label: `Gaya Hidup & Keinginan (${(wantsRatio * 100).toFixed(0)}%)`,
        amount: wantsAmount,
        count: 12,
        percentage: wantsRatio * 100,
      },
    });

    // 3. Tabungan & Investasi (Savings)
    nodes.push({
      id: "sim-out-savings",
      type: "savingsNode",
      position: { x: COL_3_X, y: 340 },
      data: {
        label: `Tabungan & Investasi (${(savingsRatio * 100).toFixed(0)}%)`,
        amount: savingsAmount,
        targetAmount: savingsAmount * 12,
        progress: 35,
        category: "emergency",
      },
    });

    // Edges
    // Inflow -> Accounts
    edges.push({
      id: "se-1",
      source: "sim-in-1",
      target: "sim-acc-1",
      animated: true,
      style: { stroke: "#10b981", strokeWidth: 5 },
      label: formatCurrency(mainSalary),
      labelStyle: { fontSize: 10, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
    });

    edges.push({
      id: "se-2",
      source: "sim-in-2",
      target: "sim-acc-2",
      animated: true,
      style: { stroke: "#10b981", strokeWidth: 3 },
      label: formatCurrency(sideGig),
      labelStyle: { fontSize: 10, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#10b981" },
    });

    // Accounts -> Outflows
    edges.push({
      id: "se-3",
      source: "sim-acc-1",
      target: "sim-out-needs",
      animated: true,
      style: { stroke: "#f43f5e", strokeWidth: 5 },
      label: formatCurrency(needsAmount),
      labelStyle: { fontSize: 10, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#f43f5e" },
    });

    edges.push({
      id: "se-4",
      source: "sim-acc-2",
      target: "sim-out-wants",
      animated: true,
      style: { stroke: "#f43f5e", strokeWidth: 4 },
      label: formatCurrency(wantsAmount),
      labelStyle: { fontSize: 10, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#f43f5e" },
    });

    edges.push({
      id: "se-5",
      source: "sim-acc-1",
      target: "sim-out-savings",
      animated: true,
      style: { stroke: "#f59e0b", strokeWidth: 4 },
      label: formatCurrency(savingsAmount),
      labelStyle: { fontSize: 10, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
    });

    return {
      simNodes: nodes,
      simEdges: edges,
      simMetrics: {
        totalInflow: income,
        totalOutflow: needsAmount + wantsAmount,
        netCashflow: savingsAmount,
        savingsRate: savingsRatio * 100,
      },
    };
  }, [simMonthlyIncome, simRule]);

  // Current active nodes & edges based on mode
  const currentNodesData = mode === "actual" ? actualNodes : simNodes;
  const currentEdgesData = mode === "actual" ? actualEdges : simEdges;
  const currentMetrics = mode === "actual" ? actualMetrics : simMetrics;

  const [nodes, setNodes, onNodesChange] = useNodesState(currentNodesData);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentEdgesData);

  // Sync state when data or mode changes
  useEffect(() => {
    setNodes(currentNodesData);
    setEdges(currentEdgesData);
  }, [currentNodesData, currentEdgesData, setNodes, setEdges]);

  // Handle node click to inspect details
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeData(node);
  }, []);

  // Reset node positions to original neatly arranged columns
  const handleResetLayout = () => {
    setNodes(currentNodesData);
  };

  const hasNoActualData =
    mode === "actual" &&
    actualNodes.length === 0 &&
    !transactionsQuery.isLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 gap-4 max-w-[1600px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Workflow className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Money Flow Visualizer
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Interactive Flow
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Visualisasi peta interaktif pergerakan uang: Pemasukan → Dompet/Rekening → Pengeluaran & Tabungan.
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Selector (Segmented Control) */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80">
            <button
              onClick={() => setMode("actual")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === "actual"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Data Transaksi Riil
            </button>
            <button
              onClick={() => setMode("simulation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === "simulation"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Simulasi Budget
            </button>
          </div>

          {/* Time Filter for Actual Mode */}
          {mode === "actual" && (
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="h-8.5 px-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Waktu</option>
              <option value="this_month">Bulan Ini</option>
              <option value="last_3_months">3 Bulan Terakhir</option>
            </select>
          )}

          {/* Reset Position Button */}
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8.5"
            onClick={handleResetLayout}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Tata Ulang Posisi
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-500/5 dark:bg-emerald-950/20">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            Total Masuk (Inflow)
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(currentMetrics.totalInflow)}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-rose-100 dark:border-rose-950/60 bg-rose-500/5 dark:bg-rose-950/20">
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            Total Keluar (Outflow)
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(currentMetrics.totalOutflow)}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-500/5 dark:bg-blue-950/20">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
            <Wallet className="w-3.5 h-3.5" />
            Net Aliran Kas (Sisa)
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
            {formatCurrency(currentMetrics.netCashflow)}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-amber-100 dark:border-amber-950/60 bg-amber-500/5 dark:bg-amber-950/20">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-semibold">
            <PieChart className="w-3.5 h-3.5" />
            Saving / Retained Rate
          </div>
          <div className="text-base font-bold text-gray-900 dark:text-white mt-1">
            {currentMetrics.savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Simulation Controls Bar (Only visible in simulation mode) */}
      {mode === "simulation" && (
        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-500/5 dark:bg-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Simulator Alokasi Anggaran
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Ubah nominal pendapatan bulanan atau pilih rumus budgeting populer.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Rule Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800 text-xs">
              <button
                onClick={() => setSimRule("503020")}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  simRule === "503020"
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                Aturan 50 / 30 / 20
              </button>
              <button
                onClick={() => setSimRule("603010")}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  simRule === "603010"
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                60 / 30 / 10
              </button>
              <button
                onClick={() => setSimRule("fire")}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  simRule === "fire"
                    ? "bg-amber-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                }`}
              >
                FIRE (40 / 20 / 40)
              </button>
            </div>

            {/* Income Input */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">Gaji:</span>
              <input
                type="number"
                step="500000"
                value={simMonthlyIncome}
                onChange={(e) => setSimMonthlyIncome(Math.max(1000000, Number(e.target.value) || 0))}
                className="w-32 h-8 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Flow Canvas Area */}
      <div className="flex-1 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 relative overflow-hidden shadow-inner flex">
        {/* Column Stage Headers */}
        <div className="absolute top-3 left-0 right-0 z-10 pointer-events-none flex justify-between px-16 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 px-2.5 py-1 rounded-full border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            1. Pemasukan (Inflows)
          </div>
          <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 px-2.5 py-1 rounded-full border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            2. Rekening & Dompet (Hubs)
          </div>
          <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 px-2.5 py-1 rounded-full border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            3. Pengeluaran & Tabungan (Outflows)
          </div>
        </div>

        {/* Empty State Banner if No Real Transactions */}
        {hasNoActualData && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xs text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Belum Ada Arus Transaksi di Workspace Ini
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mt-1 mb-4">
              Money Flow membutuhkan transaksi pemasukan dan pengeluaran untuk menggambar peta alur uang. Anda dapat mencoba mode simulasi atau mencatat transaksi baru.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setMode("simulation")}
                className="text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Lihat Contoh Simulasi Budget
              </Button>
              <Link href="/transactions/new">
                <Button size="sm" variant="outline" className="text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Buat Transaksi Baru
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* React Flow Viewport */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          colorMode={isDark ? "dark" : "light"}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
          className="bg-gray-50 dark:bg-gray-950"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1.2}
            color={isDark ? "#374151" : "#d1d5db"}
          />
          <Controls className="!bg-white dark:!bg-gray-900 !border-gray-200 dark:!border-gray-800 !rounded-xl !shadow-sm text-xs" />
          <MiniMap
            zoomable
            pannable
            className="!bg-white/80 dark:!bg-gray-900/80 !border-gray-200 dark:!border-gray-800 !rounded-xl overflow-hidden shadow-sm"
            nodeColor={(node) => {
              if (node.type === "incomeNode") return "#10b981";
              if (node.type === "walletNode") return "#3b82f6";
              if (node.type === "expenseNode") return "#f43f5e";
              return "#f59e0b";
            }}
          />
        </ReactFlow>

        {/* Node Detail Slide-Over Drawer */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 bottom-4 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Rincian Node
                </span>
              </div>
              <button
                onClick={() => setSelectedNodeData(null)}
                className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Nama Node / Kategori
                </span>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                  {selectedNodeData.data?.label || selectedNodeData.id}
                </h4>
              </div>

              {selectedNodeData.type === "walletNode" ? (
                <div className="space-y-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Masuk:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(selectedNodeData.data?.totalIn || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Total Keluar:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      -{formatCurrency(selectedNodeData.data?.totalOut || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Saldo Rekening:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(selectedNodeData.data?.balance || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Nominal Aliran:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(selectedNodeData.data?.amount || 0)}
                    </span>
                  </div>
                  {selectedNodeData.data?.percentage !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Porsi Pengeluaran:</span>
                      <span className="font-semibold text-rose-500">
                        {selectedNodeData.data?.percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {selectedNodeData.data?.count !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Frekuensi Transaksi:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedNodeData.data?.count} kali
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions / Tips */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300">
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Tips Navigasi Canvas
                </div>
                <p>
                  Node ini dapat digeser (drag & drop) secara bebas. Gunakan scroll mouse untuk zoom in/out dan klik tahan area kosong untuk menggeser canvas.
                </p>
              </div>

              {/* Action Button */}
              {mode === "actual" && (
                <Link href="/transactions" className="block w-full">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                  >
                    Buka Riwayat Transaksi
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
