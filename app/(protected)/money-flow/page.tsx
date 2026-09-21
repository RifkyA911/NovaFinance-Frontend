/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  Minimize2,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  HelpCircle,
  X,
  PieChart,
  CheckCircle2,
  Building2,
  Plus,
  Search,
  Activity,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Flame,
  ShieldCheck,
  Eye,
  EyeOff,
  CreditCard,
  PiggyBank,
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryFunctions } from "../../lib/queries";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function MoneyFlowPage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Dashboard-consistent Currency Formatter
  const formatCurrency = useCallback((amount: number | string): string => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "Rp 0";
    let curr = selectedWorkspace?.currency || "IDR";
    let locale = "id-ID";
    try {
      const storedCurr = localStorage.getItem("novajournal_currency");
      if (storedCurr) curr = storedCurr;
      const storedFmt = localStorage.getItem("novajournal_number_format");
      if (storedFmt === "en") locale = "en-US";
    } catch {}
    const isNoDecimal = curr === "IDR" || curr === "JPY";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      minimumFractionDigits: isNoDecimal ? 0 : 2,
      maximumFractionDigits: isNoDecimal ? 0 : 2,
    }).format(num);
  }, [selectedWorkspace?.currency]);

  // Mode: "actual" (workspace transactions) or "simulation" (budget planner)
  const [mode, setMode] = useState<"actual" | "simulation">("actual");

  // Simulation parameters
  const [simMonthlyIncome, setSimMonthlyIncome] = useState<number>(15000000);
  const [simRule, setSimRule] = useState<"503020" | "603010" | "fire">("503020");

  // Selected node for detail slide-over drawer
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  // Focus Tracing Mode: ID of focused node to highlight active paths
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Time filter for actual transactions
  const [timeFilter, setTimeFilter] = useState<"all" | "this_month" | "last_3_months">("all");

  // Search filter query
  const [searchQuery, setSearchQuery] = useState<string>("");

  // AI Diagnostics flyout panel
  const [showAiAdvisor, setShowAiAdvisor] = useState<boolean>(false);

  // Fullscreen toggle for canvas container
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      canvasContainerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

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

  // Raw data access
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
    let list = rawTransactions;
    if (timeFilter !== "all") {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      list = list.filter((tx: any) => {
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
    }

    return list;
  }, [rawTransactions, timeFilter]);

  // Build Actual Flow Nodes & Edges
  const { actualNodes, actualEdges, actualMetrics } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

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
      const isIncome = tx.type === "INCOME" || tx.type === "income";
      const isExpense = tx.type === "EXPENSE" || tx.type === "expense";

      let catName = "";
      let catId = "";

      if (tx.category && typeof tx.category === "object") {
        catName = typeof tx.category.name === "string" ? tx.category.name : "";
        catId = typeof tx.category.id === "string" ? tx.category.id : "";
      } else if (typeof tx.category === "string" && tx.category.trim()) {
        catName = tx.category.trim();
      }

      const fallbackCatId = tx.categoryId || catId;
      if (!catName && fallbackCatId && categoryLookupMap.has(fallbackCatId)) {
        catName = categoryLookupMap.get(fallbackCatId) || "";
      }

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

        const incomeCat = incomeCategoriesMap.get(catId) || {
          id: catId,
          name: catName,
          amount: 0,
          count: 0,
        };
        incomeCat.amount += amount;
        incomeCat.count += 1;
        incomeCategoriesMap.set(catId, incomeCat);

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

        const expenseCat = expenseCategoriesMap.get(catId) || {
          id: catId,
          name: catName,
          amount: 0,
          count: 0,
        };
        expenseCat.amount += amount;
        expenseCat.count += 1;
        expenseCategoriesMap.set(catId, expenseCat);

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

    const COL_1_X = 60;
    const COL_2_X = 470;
    const COL_3_X = 890;
    const Y_SPACING = 145;

    // Inflow Nodes
    const incomeList = Array.from(incomeCategoriesMap.values()).sort(
      (a, b) => b.amount - a.amount
    );
    incomeList.forEach((inc, idx) => {
      const share = totalInflow > 0 ? (inc.amount / totalInflow) * 100 : 0;
      nodes.push({
        id: inc.id,
        type: "incomeNode",
        position: { x: COL_1_X, y: 60 + idx * Y_SPACING },
        data: {
          label: inc.name,
          amount: inc.amount,
          count: inc.count,
          sharePercentage: share,
          isPrimary: idx === 0 && share > 50,
          category: String(inc.name || "").toLowerCase(),
        },
      });
    });

    // Account Nodes
    const accountList = Array.from(accountFlowsMap.values());
    accountList.forEach((acc, idx) => {
      nodes.push({
        id: acc.id,
        type: "walletNode",
        position: { x: COL_2_X, y: 80 + idx * (Y_SPACING + 25) },
        data: {
          label: acc.name,
          type: acc.type,
          balance: acc.balance,
          totalIn: acc.totalIn,
          totalOut: acc.totalOut,
        },
      });
    });

    // Expense Nodes
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

    // Edges
    let edgeIndex = 0;
    flowStreams.forEach((stream) => {
      const strokeWidth = Math.max(
        2,
        Math.min(7, Math.round(Math.log10(Math.max(stream.amount, 1000)) * 1.2))
      );

      const isFromIncome = incomeCategoriesMap.has(stream.source);
      const strokeColor = isFromIncome
        ? isDark
          ? "#22c55e"
          : "#16a34a"
        : isDark
        ? "#ef4444"
        : "#dc2626";

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
          fontSize: 11,
          fontWeight: 600,
          fill: isDark ? "#f3f4f6" : "#1f2937",
        },
        labelBgStyle: {
          fill: isDark ? "#111827" : "#ffffff",
          fillOpacity: 0.95,
          rx: 6,
          ry: 6,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: 14,
          height: 14,
        },
      });
    });

    const highestExpense = expenseList[0];
    const highestIncome = incomeList[0];
    const primaryIncomeShare = highestIncome && totalInflow > 0 ? (highestIncome.amount / totalInflow) * 100 : 0;
    const topExpenseShare = highestExpense && totalOutflow > 0 ? (highestExpense.amount / totalOutflow) * 100 : 0;

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
        primaryIncomeShare,
        highestExpense,
        highestIncome,
        topExpenseShare,
      },
    };
  }, [rawAccounts, filteredTransactions, categoryLookupMap, isDark, formatCurrency]);

  // Build Simulation Flow Nodes & Edges (50/30/20, 60/30/10, FIRE)
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
    const COL_2_X = 470;
    const COL_3_X = 890;

    const mainSalary = income * 0.85;
    const sideGig = income * 0.15;

    nodes.push({
      id: "sim-in-1",
      type: "incomeNode",
      position: { x: COL_1_X, y: 60 },
      data: {
        label: "Gaji Pokok / Kontrak",
        amount: mainSalary,
        count: 1,
        sharePercentage: 85,
        isPrimary: true,
        category: "salary",
      },
    });

    nodes.push({
      id: "sim-in-2",
      type: "incomeNode",
      position: { x: COL_1_X, y: 220 },
      data: {
        label: "Pendapatan Sampingan / Freelance",
        amount: sideGig,
        count: 3,
        sharePercentage: 15,
        isPrimary: false,
        category: "freelance",
      },
    });

    const bcaAmount = mainSalary;
    const cashAmount = sideGig;

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
      position: { x: COL_2_X, y: 260 },
      data: {
        label: "E-Wallet & Cash (Harian)",
        type: "cash",
        balance: cashAmount * 0.8,
        totalIn: cashAmount,
        totalOut: wantsAmount,
      },
    });

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

    edges.push({
      id: "se-1",
      source: "sim-in-1",
      target: "sim-acc-1",
      animated: true,
      style: { stroke: "#16a34a", strokeWidth: 5 },
      label: formatCurrency(mainSalary),
      labelStyle: { fontSize: 11, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#16a34a" },
    });

    edges.push({
      id: "se-2",
      source: "sim-in-2",
      target: "sim-acc-2",
      animated: true,
      style: { stroke: "#16a34a", strokeWidth: 3 },
      label: formatCurrency(sideGig),
      labelStyle: { fontSize: 11, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#16a34a" },
    });

    edges.push({
      id: "se-3",
      source: "sim-acc-1",
      target: "sim-out-needs",
      animated: true,
      style: { stroke: "#dc2626", strokeWidth: 5 },
      label: formatCurrency(needsAmount),
      labelStyle: { fontSize: 11, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#dc2626" },
    });

    edges.push({
      id: "se-4",
      source: "sim-acc-2",
      target: "sim-out-wants",
      animated: true,
      style: { stroke: "#dc2626", strokeWidth: 4 },
      label: formatCurrency(wantsAmount),
      labelStyle: { fontSize: 11, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#dc2626" },
    });

    edges.push({
      id: "se-5",
      source: "sim-acc-1",
      target: "sim-out-savings",
      animated: true,
      style: { stroke: "#9333ea", strokeWidth: 4 },
      label: formatCurrency(savingsAmount),
      labelStyle: { fontSize: 11, fontWeight: 600 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#9333ea" },
    });

    return {
      simNodes: nodes,
      simEdges: edges,
      simMetrics: {
        totalInflow: income,
        totalOutflow: needsAmount + wantsAmount,
        netCashflow: savingsAmount,
        savingsRate: savingsRatio * 100,
        primaryIncomeShare: 85,
        highestExpense: { name: "Kebutuhan Pokok", amount: needsAmount },
        highestIncome: { name: "Gaji Pokok", amount: mainSalary },
        topExpenseShare: needsRatio * 100,
      },
    };
  }, [simMonthlyIncome, simRule, formatCurrency]);

  const baseNodesData = mode === "actual" ? actualNodes : simNodes;
  const baseEdgesData = mode === "actual" ? actualEdges : simEdges;
  const currentMetrics = mode === "actual" ? actualMetrics : simMetrics;

  // Apply Focus / Dimming and Search Filter
  const { processedNodes, processedEdges } = useMemo(() => {
    let activeNodes = baseNodesData;
    let activeEdges = baseEdgesData;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      activeNodes = activeNodes.map((n) => {
        const matches = String((n.data as any)?.label || "").toLowerCase().includes(q);
        return {
          ...n,
          data: {
            ...n.data,
            isDimmed: !matches,
            isHighlighted: matches,
          },
        };
      });
      return { processedNodes: activeNodes, processedEdges: activeEdges };
    }

    if (focusedNodeId) {
      const connectedNodeIds = new Set<string>([focusedNodeId]);
      const connectedEdgeIds = new Set<string>();

      activeEdges.forEach((e) => {
        if (e.source === focusedNodeId || e.target === focusedNodeId) {
          connectedEdgeIds.add(e.id);
          connectedNodeIds.add(e.source);
          connectedNodeIds.add(e.target);
        }
      });

      activeEdges.forEach((e) => {
        if (connectedNodeIds.has(e.source) || connectedNodeIds.has(e.target)) {
          connectedEdgeIds.add(e.id);
          connectedNodeIds.add(e.source);
          connectedNodeIds.add(e.target);
        }
      });

      activeNodes = activeNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isDimmed: !connectedNodeIds.has(n.id),
          isHighlighted: n.id === focusedNodeId,
        },
      }));

      activeEdges = activeEdges.map((e) => ({
        ...e,
        animated: connectedEdgeIds.has(e.id),
        style: {
          ...e.style,
          opacity: connectedEdgeIds.has(e.id) ? 1 : 0.15,
          strokeWidth: connectedEdgeIds.has(e.id) ? 4 : 1,
        },
      }));
    }

    return { processedNodes: activeNodes, processedEdges: activeEdges };
  }, [baseNodesData, baseEdgesData, focusedNodeId, searchQuery]);

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(processedEdges);

  useEffect(() => {
    setNodes(processedNodes);
    setEdges(processedEdges);
  }, [processedNodes, processedEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeData(node);
    setFocusedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const handleResetLayout = () => {
    setFocusedNodeId(null);
    setSearchQuery("");
    setNodes(baseNodesData);
  };

  // Associated transactions for selected node
  const nodeTransactions = useMemo(() => {
    if (!selectedNodeData || mode !== "actual") return [];
    const nodeId = selectedNodeData.id;
    const nodeLabel = selectedNodeData.data?.label || "";

    return filteredTransactions.filter((tx: any) => {
      const matchCategory =
        tx.categoryId === nodeId ||
        tx.category?.id === nodeId ||
        (typeof tx.category === "string" && tx.category === nodeLabel) ||
        (tx.category?.name && tx.category.name === nodeLabel);

      const matchAccount =
        tx.accountId === nodeId ||
        tx.account?.id === nodeId ||
        (tx.account?.name && tx.account.name === nodeLabel);

      return matchCategory || matchAccount;
    });
  }, [selectedNodeData, filteredTransactions, mode]);

  const hasNoActualData =
    mode === "actual" &&
    actualNodes.length === 0 &&
    !transactionsQuery.isLoading;

  return (
    <div
      ref={canvasContainerRef}
      className={`flex flex-col p-3.5 md:p-6 gap-4 max-w-[1680px] mx-auto w-full ${
        isFullscreen
          ? "fixed inset-0 z-50 bg-white dark:bg-gray-950 p-4 h-screen w-screen overflow-hidden"
          : "min-h-[calc(100vh-4.2rem)] pb-16"
      }`}
    >
      {/* ── Top Header Section (2-Tier Clean Dashboard Aligned) ── */}
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-default-200/90 dark:border-default-800 shadow-2xs space-y-3.5">
        {/* Tier 1: Identity & Primary Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  Money Flow Visualizer
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-default-100 dark:bg-default-800 text-default-700 dark:text-default-300 border border-default-200 dark:border-default-700">
                  {selectedWorkspace?.name || "Workspace"}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                    mode === "actual"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {mode === "actual" ? "Data Riil" : "Simulasi"}
                </span>
                {focusedNodeId && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Fokus Terpilih
                  </span>
                )}
              </div>
              <p className="text-xs text-default-500 mt-0.5">
                Peta alur sirkulasi likuiditas: Pemasukan → Akun/Dompet Penyimpan → Pengeluaran & Pos Alokasi.
              </p>
            </div>
          </div>

          {/* Mode Switcher Segmented Control & Fullscreen */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <div className="flex items-center p-1 rounded-xl bg-default-100 dark:bg-default-800 border border-default-200 dark:border-default-700">
              <button
                type="button"
                onClick={() => {
                  setMode("actual");
                  setFocusedNodeId(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === "actual"
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-default-600 hover:text-foreground"
                }`}
              >
                Data Riil
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("simulation");
                  setFocusedNodeId(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === "simulation"
                    ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow-2xs"
                    : "text-default-600 hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Simulasi
              </button>
            </div>

            <button
              type="button"
              className="h-9 w-9 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 flex items-center justify-center cursor-pointer transition text-default-700 dark:text-default-300 shadow-2xs"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tier 2: Search, Filters & Canvas Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-default-100 dark:border-default-800/80">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
              <input
                type="text"
                placeholder="Cari node / kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8.5 pl-8.5 pr-8 rounded-xl border border-default-200 dark:border-default-700 bg-default-50/70 dark:bg-default-800/60 text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Time Filter for Actual Mode */}
            {mode === "actual" && (
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50/70 dark:bg-default-800/60 text-xs font-medium text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500 shadow-2xs cursor-pointer"
              >
                <option value="all">Semua Periode</option>
                <option value="this_month">Bulan Ini</option>
                <option value="last_3_months">3 Bulan Terakhir</option>
              </select>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* AI Advisor Toggle Button */}
            <Button
              size="sm"
              variant="outline"
              onPress={() => setShowAiAdvisor(!showAiAdvisor)}
              className={`h-8.5 px-3.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-xl border shadow-2xs active:scale-95 transition-all ${
                showAiAdvisor
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white dark:bg-default-800 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostik AI</span>
            </Button>

            {/* Reset Position Button */}
            <Button
              size="sm"
              variant="outline"
              className="h-8.5 px-3.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer rounded-xl bg-white dark:bg-default-800 text-default-700 dark:text-default-200 border border-default-200 dark:border-default-700 hover:bg-default-100 dark:hover:bg-default-700 shadow-2xs active:scale-95 transition-all"
              onPress={handleResetLayout}
            >
              <RefreshCw className="w-3.5 h-3.5 text-default-500" />
              <span>Tata Posisi</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Primary Financial Stats Row (EXACT Dashboard Clean Design) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        {/* Total Inflow */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-default-200/90 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs hover:shadow-xs hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Pemasukan (Inflow)</p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(currentMetrics.totalInflow)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center mr-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Masuk
            </span>
            <span>{mode === "actual" ? (timeFilter === "this_month" ? "bulan ini" : "pada periode filter") : "proyeksi simulasi"}</span>
          </div>
        </Card>

        {/* Total Outflow */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-default-200/90 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs hover:shadow-xs hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Pengeluaran (Outflow)</p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(currentMetrics.totalOutflow)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2.5">
            <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center mr-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              Terserap
            </span>
            <span>
              {currentMetrics.highestExpense ? `Terbanyak: ${currentMetrics.highestExpense.name}` : "belum ada pos"}
            </span>
          </div>
        </Card>

        {/* Net Balance / Cashflow */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-default-200/90 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs hover:shadow-xs hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Net Aliran Kas (Sisa)</p>
              <p className={`text-xl sm:text-2xl font-bold tracking-tight mt-1 ${
                currentMetrics.netCashflow >= 0 ? "text-foreground" : "text-danger"
              }`}>
                {formatCurrency(currentMetrics.netCashflow)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2.5">
            <span>{currentMetrics.netCashflow >= 0 ? "Surplus kas" : "Defisit kas"}</span>
            <span className="text-blue-500 font-semibold cursor-pointer hover:underline" onClick={() => router.push("/portfolio")}>
              Lihat Akun
            </span>
          </div>
        </Card>

        {/* Savings Rate & Health */}
        <Card className="p-4 sm:p-5 rounded-2xl border border-default-200/90 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs hover:shadow-xs hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-default-500 uppercase tracking-wider">Tingkat Tabungan / Retensi</p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
                {currentMetrics.savingsRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2.5">
            <span
              className={`font-semibold ${
                currentMetrics.savingsRate >= 30
                  ? "text-emerald-600 dark:text-emerald-400"
                  : currentMetrics.savingsRate >= 15
                  ? "text-blue-500"
                  : currentMetrics.savingsRate > 0
                  ? "text-amber-500"
                  : "text-danger"
              }`}
            >
              {currentMetrics.savingsRate >= 30
                ? "Sehat (≥30%)"
                : currentMetrics.savingsRate >= 15
                ? "Sedang (≥15%)"
                : currentMetrics.savingsRate > 0
                ? "Rendah (<15%)"
                : "Defisit"}
            </span>
            <span>Net: {formatCurrency(currentMetrics.netCashflow)}</span>
          </div>
        </Card>
      </div>

      {/* ── AI Diagnostics Advisor Flyout Panel ── */}
      {showAiAdvisor && (
        <Card className="p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-500/5 dark:bg-purple-950/20 backdrop-blur-md animate-in slide-in-from-top-2 duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 shadow-2xs">
          <div className="space-y-1.5 max-w-4xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                Diagnostik Arus Kas Nova AI
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Konsentrasi Pemasukan
                </div>
                <p className="text-xs text-default-500 mt-1 leading-snug">
                  {currentMetrics.primaryIncomeShare > 70
                    ? `⚠️ ${currentMetrics.primaryIncomeShare.toFixed(0)}% arus masuk terkonsentrasi dari 1 sumber. Disarankan diversifikasi pendapatan.`
                    : "✅ Aliran masuk terdistribusi seimbang dari beberapa pos."}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <Flame className="w-3.5 h-3.5 text-danger" />
                  Beban Pengeluaran Dominan
                </div>
                <p className="text-xs text-default-500 mt-1 leading-snug">
                  {currentMetrics.highestExpense
                    ? `Pos '${currentMetrics.highestExpense.name}' menyerap ${currentMetrics.topExpenseShare.toFixed(0)}% total pengeluaran.`
                    : "Belum ada pos pengeluaran tercatat."}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs">
                <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-500" />
                  Evaluasi Retensi Kas
                </div>
                <p className="text-xs text-default-500 mt-1 leading-snug">
                  {currentMetrics.savingsRate >= 20
                    ? "🌟 Sehat Prima: Retensi kas >20% melampaui aturan 50/30/20."
                    : currentMetrics.savingsRate > 0
                    ? "⚖️ Moderat: Ada surplus kas, dapat dioptimasi pos sekunder."
                    : "🚨 Defisit: Kas keluar melebihi kas masuk. Periksa pengeluaran!"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAiAdvisor(false)}
            className="text-default-400 hover:text-foreground cursor-pointer self-start md:self-center p-1 rounded-lg hover:bg-default-100 dark:hover:bg-default-800"
          >
            <X className="w-4 h-4" />
          </button>
        </Card>
      )}

      {/* ── Simulation Controls Bar ── */}
      {mode === "simulation" && (
        <Card className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-500/5 dark:bg-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">
                Simulator Alokasi Anggaran
              </div>
              <div className="text-xs text-default-500">
                Simulasi distribusi penghasilan bulanan berdasarkan metode budgeting terbukti.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 p-0.5 rounded-lg border border-default-200 dark:border-default-800 text-xs">
              <button
                type="button"
                onClick={() => setSimRule("503020")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  simRule === "503020"
                    ? "bg-amber-500 text-white"
                    : "text-default-600 hover:text-foreground"
                }`}
              >
                50 / 30 / 20
              </button>
              <button
                type="button"
                onClick={() => setSimRule("603010")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  simRule === "603010"
                    ? "bg-amber-500 text-white"
                    : "text-default-600 hover:text-foreground"
                }`}
              >
                60 / 30 / 10
              </button>
              <button
                type="button"
                onClick={() => setSimRule("fire")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                  simRule === "fire"
                    ? "bg-amber-500 text-white"
                    : "text-default-600 hover:text-foreground"
                }`}
              >
                FIRE (40 / 20 / 40)
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-default-500 font-medium">Gaji/Bulan:</span>
              <input
                type="number"
                step="500000"
                value={simMonthlyIncome}
                onChange={(e) => setSimMonthlyIncome(Math.max(1000000, Number(e.target.value) || 0))}
                className="w-36 h-8 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-xs font-bold text-foreground"
              />
            </div>
          </div>
        </Card>
      )}

      {/* ── Main Flow Canvas Area (High-End Mesh & Generous Height) ── */}
      <div
        className={`w-full rounded-2xl border border-default-200/90 dark:border-default-800 relative overflow-hidden shadow-xs flex transition-all ${
          isFullscreen ? "flex-1 h-full min-h-0" : "h-[740px] min-h-[660px]"
        }`}
        style={{
          background: isDark
            ? "radial-gradient(ellipse at 50% 30%, #111827 0%, #030712 100%)"
            : "radial-gradient(ellipse at 50% 30%, #ffffff 0%, #f1f5f9 100%)",
        }}
      >
        {/* Stage Columns Headers */}
        <div className="absolute top-3 left-0 right-0 z-10 pointer-events-none flex justify-between px-12 md:px-20 text-[10px] md:text-[11px] font-semibold text-default-500 uppercase tracking-wide">
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 px-3.5 py-1.5 rounded-full border border-default-200/90 dark:border-default-800 backdrop-blur-md shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            1. Sumber Masuk (Inflow)
          </div>
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 px-3.5 py-1.5 rounded-full border border-default-200/90 dark:border-default-800 backdrop-blur-md shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            2. Rekening & Dompet (Hubs)
          </div>
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-gray-900/95 px-3.5 py-1.5 rounded-full border border-default-200/90 dark:border-default-800 backdrop-blur-md shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            3. Pos Pengeluaran & Tabungan (Outflow)
          </div>
        </div>

        {/* Empty State Banner */}
        {hasNoActualData && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 shadow-2xs">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              Belum Ada Arus Transaksi di Workspace Ini
            </h3>
            <p className="text-xs text-default-500 max-w-md mt-1 mb-4">
              Money Flow membutuhkan transaksi pemasukan dan pengeluaran untuk memetakan sirkulasi kas Anda. Coba simulasi budget atau catat transaksi pertama.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="text-xs bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs font-semibold cursor-pointer"
                onPress={() => setMode("simulation")}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Coba Simulasi Budget
              </Button>
              <Link href="/transactions/new">
                <Button size="sm" variant="outline" className="text-xs border border-default-200 dark:border-default-700 font-semibold cursor-pointer">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Tambah Transaksi
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
          className="w-full h-full"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1.4}
            color={isDark ? "#374151" : "#cbd5e1"}
          />
          <Controls className="!bg-white dark:!bg-gray-900 !border-default-200 dark:!border-default-800 !rounded-xl !shadow-xs text-xs" />
          <MiniMap
            zoomable
            pannable
            className="!bg-white/90 dark:!bg-gray-900/90 !border-default-200 dark:!border-default-800 !rounded-xl overflow-hidden shadow-xs"
            nodeColor={(node) => {
              if (node.type === "incomeNode") return "#22c55e";
              if (node.type === "walletNode") return "#3b82f6";
              if (node.type === "expenseNode") return "#ef4444";
              return "#a855f7";
            }}
          />
        </ReactFlow>

        {/* ── Node Detail Slide-Over Flyout Drawer ── */}
        {selectedNodeData && (
          <div className="absolute top-4 right-4 bottom-4 w-88 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-default-200/80 dark:border-default-800 rounded-2xl shadow-xl z-30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-default-100 dark:border-default-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Detail Aliran Node
                  </span>
                  <span className="text-[10px] text-default-400">
                    {selectedNodeData.type === "incomeNode"
                      ? "Pos Pemasukan"
                      : selectedNodeData.type === "walletNode"
                      ? "Hub Akun / Dompet"
                      : "Pos Pengeluaran"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFocusedNodeId((prev) => (prev ? null : selectedNodeData.id))}
                  className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                    focusedNodeId === selectedNodeData.id
                      ? "bg-amber-500/20 text-amber-600"
                      : "hover:bg-default-100 dark:hover:bg-default-800 text-default-400"
                  }`}
                  title="Fokus Alur Node"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedNodeData(null)}
                  className="p-1.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-800 text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-default-400 uppercase tracking-wide">
                  Nama Node / Pos
                </span>
                <h4 className="text-sm font-bold text-foreground mt-0.5">
                  {selectedNodeData.data?.label || selectedNodeData.id}
                </h4>
              </div>

              {/* Metrics Summary Card */}
              {selectedNodeData.type === "walletNode" ? (
                <div className="space-y-2.5 p-3 rounded-xl bg-default-50 dark:bg-default-800/60 border border-default-100 dark:border-default-800">
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Total Masuk:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                      +{formatCurrency(selectedNodeData.data?.totalIn || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Total Keluar:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                      -{formatCurrency(selectedNodeData.data?.totalOut || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-default-200 dark:border-default-700">
                    <span className="font-semibold text-foreground">Saldo Rekening:</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(selectedNodeData.data?.balance || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 p-3 rounded-xl bg-default-50 dark:bg-default-800/60 border border-default-100 dark:border-default-800">
                  <div className="flex items-center justify-between">
                    <span className="text-default-500">Nominal Aliran:</span>
                    <span className="font-bold text-foreground text-sm">
                      {formatCurrency(selectedNodeData.data?.amount || 0)}
                    </span>
                  </div>
                  {selectedNodeData.data?.percentage !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-default-500">Porsi Pengeluaran:</span>
                      <span className="font-semibold text-red-500">
                        {selectedNodeData.data?.percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {selectedNodeData.data?.sharePercentage !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-default-500">Porsi Pemasukan:</span>
                      <span className="font-semibold text-green-500">
                        {selectedNodeData.data?.sharePercentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                  {selectedNodeData.data?.count !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-default-500">Frekuensi:</span>
                      <span className="font-medium text-foreground">
                        {selectedNodeData.data?.count} kali transaksi
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Associated Real Transactions Breakdown */}
              {mode === "actual" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-500" />
                      Transaksi Melalui Node Ini ({nodeTransactions.length})
                    </span>
                  </div>

                  {nodeTransactions.length === 0 ? (
                    <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/40 text-center text-default-400 text-xs">
                      Tidak ada transaksi pada filter periode ini.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {nodeTransactions.slice(0, 10).map((tx: any) => {
                        const isInc = tx.type === "INCOME" || tx.type === "income";
                        return (
                          <div
                            key={tx.id}
                            className="p-2 rounded-lg border border-default-100 dark:border-default-800 bg-white dark:bg-gray-900/60 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate">
                                {tx.description || tx.title || "Transaksi"}
                              </div>
                              <div className="text-[10px] text-default-400">
                                {new Date(tx.date || tx.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                            <span
                              className={`font-semibold shrink-0 ${
                                isInc ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {isInc ? "+" : "-"}
                              {formatCurrency(Math.abs(Number(tx.amount) || 0))}
                            </span>
                          </div>
                        );
                      })}
                      {nodeTransactions.length > 10 && (
                        <div className="text-[10px] text-center text-default-400 py-1">
                          + {nodeTransactions.length - 10} transaksi lainnya
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {mode === "actual" && (
                <Link href="/transactions" className="block w-full pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border border-default-200 dark:border-default-700"
                  >
                    Buka Riwayat Transaksi Lengkap
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
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
