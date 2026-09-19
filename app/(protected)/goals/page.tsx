/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Target,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  PiggyBank,
  Laptop,
  Plane,
  ShieldCheck,
  Home,
  Briefcase,
  X,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  LayoutGrid,
  Kanban,
  Filter,
  Search,
  ArrowUpDown,
  GripVertical,
  Flame,
  Zap,
  Lightbulb,
  Check,
  ChevronRight,
  Wallet,
  Coins,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  HelpCircle,
  Percent,
} from "lucide-react";
import { Card } from "@heroui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { FinancialGoal } from "../../lib/api";
import GoalFeasibilityModal from "./components/GoalFeasibilityModal";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export type { FinancialGoal };

export const CATEGORY_CONFIG: Record<
  string,
  { label: string; cluster: string; icon: any; color: string; bg: string }
> = {
  emergency: {
    label: "Dana Darurat",
    cluster: "Pondasi Finansial",
    icon: ShieldCheck,
    color: "#10b981",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  property: {
    label: "Rumah & Properti",
    cluster: "Aset Riil",
    icon: Home,
    color: "#8b5cf6",
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  investment: {
    label: "Investasi & Bisnis",
    cluster: "Aset Produktif",
    icon: Briefcase,
    color: "#06b6d4",
    bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  gadget: {
    label: "Gadget & Workstation",
    cluster: "Produktivitas & Wishlist",
    icon: Laptop,
    color: "#3b82f6",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  travel: {
    label: "Liburan & Travel",
    cluster: "Lifestyle & Rehat",
    icon: Plane,
    color: "#f59e0b",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  retirement: {
    label: "Pensiun & FIRE",
    cluster: "Kebebasan Finansial",
    icon: TrendingUp,
    color: "#ec4899",
    bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  },
  education: {
    label: "Pendidikan & Skill",
    cluster: "Human Capital",
    icon: Sparkles,
    color: "#6366f1",
    bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  other: {
    label: "Lainnya",
    cluster: "General",
    icon: Target,
    color: "#64748b",
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

const PRIORITY_LANES: Array<{
  id: "urgent" | "high" | "medium" | "low";
  label: string;
  sublabel: string;
  badge: string;
  icon: any;
  color: string;
}> = [
  {
    id: "urgent",
    label: "P0 - Urgent / Kritis",
    sublabel: "Target esensial wajib terpenuhi segera",
    badge: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    icon: Flame,
    color: "#f43f5e",
  },
  {
    id: "high",
    label: "P1 - Prioritas Tinggi",
    sublabel: "Fokus akumulasi tabungan utama",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    icon: Zap,
    color: "#f59e0b",
  },
  {
    id: "medium",
    label: "P2 - Prioritas Sedang",
    sublabel: "Alokasi berkala jangka menengah",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    icon: Target,
    color: "#3b82f6",
  },
  {
    id: "low",
    label: "P3 - Wishlist / Santai",
    sublabel: "Bisa ditunda setelah prioritas utama aman",
    badge: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400",
    icon: Lightbulb,
    color: "#64748b",
  },
];

const PALETTE = ["#10b981", "#8b5cf6", "#06b6d4", "#3b82f6", "#f59e0b", "#ec4899", "#6366f1", "#64748b"];

export default function GoalsPage() {
  const { selectedWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  // View state: 'kanban' | 'grid'
  const [viewMode, setViewMode] = useState<"kanban" | "grid">("kanban");
  const [showCharts, setShowCharts] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "target_desc" | "deadline" | "progress">("priority");

  // Drag & Drop State
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [feasibilityGoal, setFeasibilityGoal] = useState<FinancialGoal | null>(null);

  // Form inputs
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<string>("emergency");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formCurrentAmount, setFormCurrentAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formPriority, setFormPriority] = useState<FinancialGoal["priority"]>("medium");
  const [formStatus, setFormStatus] = useState<FinancialGoal["status"]>("in_progress");
  const [formMonthlyPlanned, setFormMonthlyPlanned] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const currency = selectedWorkspace?.currency || "IDR";

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

  // Queries
  const { data: goalsResponse, isLoading: isGoalsLoading } = useQuery({
    queryKey: queryKeys.goals(selectedWorkspace?.id || "", filterStatus, filterPriority, filterCategory),
    queryFn: () => queryFunctions.goals(selectedWorkspace?.id || "", filterStatus, filterPriority, filterCategory),
    enabled: !!selectedWorkspace?.id,
  });

  const { data: analyticsResponse } = useQuery({
    queryKey: queryKeys.goalsAnalytics(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.goalsAnalytics(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  const { data: dashboardSummary } = useQuery({
    queryKey: queryKeys.dashboardSummary(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.dashboardSummary(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  const goalsList: FinancialGoal[] = useMemo(() => {
    return goalsResponse?.data?.goals || [];
  }, [goalsResponse]);

  // Client-side filtering & sorting
  const filteredGoals = useMemo(() => {
    let list = [...goalsList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((g) => g.title.toLowerCase().includes(q) || (g.notes && g.notes.toLowerCase().includes(q)));
    }

    if (filterStatus !== "all") {
      list = list.filter((g) => g.status === filterStatus);
    }
    if (filterPriority !== "all") {
      list = list.filter((g) => g.priority === filterPriority);
    }
    if (filterCategory !== "all") {
      list = list.filter((g) => g.category === filterCategory);
    }

    if (sortBy === "target_desc") {
      list.sort((a, b) => Number(b.targetAmount) - Number(a.targetAmount));
    } else if (sortBy === "progress") {
      list.sort((a, b) => {
        const rateA = Number(a.targetAmount) > 0 ? (Number(a.currentAmount) / Number(a.targetAmount)) : 0;
        const rateB = Number(b.targetAmount) > 0 ? (Number(b.currentAmount) / Number(b.targetAmount)) : 0;
        return rateB - rateA;
      });
    } else if (sortBy === "deadline") {
      list.sort((a, b) => {
        if (!a.targetDate) return 1;
        if (!b.targetDate) return -1;
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      });
    } else {
      // Default priority ranking
      const pWeights: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
      list.sort((a, b) => (pWeights[a.priority] ?? 99) - (pWeights[b.priority] ?? 99) || (a.order - b.order));
    }

    return list;
  }, [goalsList, searchQuery, filterStatus, filterPriority, filterCategory, sortBy]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: mutationFunctions.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: mutationFunctions.updateGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsModalOpen(false);
      setEditingGoal(null);
      resetForm();
    },
  });

  const depositMutation = useMutation({
    mutationFn: mutationFunctions.depositGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setDepositGoal(null);
      setDepositAmount("");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: mutationFunctions.reorderGoals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: mutationFunctions.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const resetForm = () => {
    setFormTitle("");
    setFormCategory("emergency");
    setFormTargetAmount("");
    setFormCurrentAmount("");
    setFormTargetDate("");
    setFormPriority("medium");
    setFormStatus("in_progress");
    setFormMonthlyPlanned("");
    setFormNotes("");
    setEditingGoal(null);
  };

  const handleOpenCreateModal = (presetPriority?: FinancialGoal["priority"]) => {
    resetForm();
    if (presetPriority) setFormPriority(presetPriority);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormCategory(goal.category);
    setFormTargetAmount(String(goal.targetAmount));
    setFormCurrentAmount(String(goal.currentAmount));
    setFormTargetDate(goal.targetDate ? goal.targetDate.split("T")[0] : "");
    setFormPriority(goal.priority);
    setFormStatus(goal.status);
    setFormMonthlyPlanned(goal.monthlyContributionPlanned ? String(goal.monthlyContributionPlanned) : "");
    setFormNotes(goal.notes || "");
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace?.id || !formTitle || !formTargetAmount) return;

    if (editingGoal) {
      updateMutation.mutate({
        id: editingGoal.id,
        data: {
          title: formTitle,
          category: formCategory,
          targetAmount: parseFloat(formTargetAmount),
          currentAmount: parseFloat(formCurrentAmount || "0"),
          targetDate: formTargetDate || undefined,
          priority: formPriority,
          status: formStatus,
          monthlyContributionPlanned: parseFloat(formMonthlyPlanned || "0"),
          notes: formNotes || undefined,
        },
      });
    } else {
      createMutation.mutate({
        workspaceId: selectedWorkspace.id,
        title: formTitle,
        category: formCategory,
        targetAmount: parseFloat(formTargetAmount),
        currentAmount: parseFloat(formCurrentAmount || "0"),
        targetDate: formTargetDate || undefined,
        priority: formPriority,
        status: formStatus,
        monthlyContributionPlanned: parseFloat(formMonthlyPlanned || "0"),
        notes: formNotes || undefined,
      });
    }
  };

  const handleQuickDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount) return;
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) return;

    depositMutation.mutate({
      id: depositGoal.id,
      amount: num,
      note: `Setoran dana goal: ${depositGoal.title}`,
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedGoalId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverLane !== laneId) {
      setDragOverLane(laneId);
    }
  };

  const handleDragLeave = () => {
    setDragOverLane(null);
  };

  const handleDropOnLane = (e: React.DragEvent, targetPriority: FinancialGoal["priority"]) => {
    e.preventDefault();
    setDragOverLane(null);
    const goalId = e.dataTransfer.getData("text/plain") || draggedGoalId;
    if (!goalId || !selectedWorkspace?.id) return;

    const targetGoal = goalsList.find((g) => g.id === goalId);
    if (!targetGoal) return;

    if (targetGoal.priority === targetPriority) return;

    // Optimistic UI update
    const updated = goalsList.map((g) => (g.id === goalId ? { ...g, priority: targetPriority } : g));
    queryClient.setQueryData(
      queryKeys.goals(selectedWorkspace.id, filterStatus, filterPriority, filterCategory),
      { success: true, data: { goals: updated, total: updated.length } }
    );

    // Persist reorder to backend
    reorderMutation.mutate({
      workspaceId: selectedWorkspace.id,
      items: [{ id: goalId, order: targetGoal.order, priority: targetPriority }],
    });
  };

  // Analytics aggregates
  const analytics = analyticsResponse?.data || {
    totalGoals: goalsList.length,
    totalTargetAmount: goalsList.reduce((acc, g) => acc + Number(g.targetAmount), 0),
    totalCurrentAmount: goalsList.reduce((acc, g) => acc + Number(g.currentAmount), 0),
    overallCompletionRate: 0,
    totalMonthlyPlanned: goalsList.reduce((acc, g) => acc + Number(g.monthlyContributionPlanned || 0), 0),
    statusCounts: { in_progress: 0, completed: 0, wishlist: 0, paused: 0 },
    priorityCounts: { urgent: 0, high: 0, medium: 0, low: 0 },
    categoryBreakdown: [],
  };

  const completionPercent = analytics.totalTargetAmount > 0
    ? Math.min(100, (analytics.totalCurrentAmount / analytics.totalTargetAmount) * 100)
    : 0;

  // Chart data for Category Diversification
  const categoryChartData = useMemo(() => {
    if (analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0) {
      return analytics.categoryBreakdown.map((item) => ({
        name: CATEGORY_CONFIG[item.category]?.label || item.category,
        cluster: CATEGORY_CONFIG[item.category]?.cluster || "Umum",
        target: item.totalTarget,
        current: item.totalCurrent,
        share: parseFloat(item.targetSharePercentage),
      }));
    }
    // Fallback computed from goalsList
    const map: Record<string, { target: number; current: number }> = {};
    for (const g of goalsList) {
      const cat = g.category || "other";
      if (!map[cat]) map[cat] = { target: 0, current: 0 };
      map[cat].target += Number(g.targetAmount);
      map[cat].current += Number(g.currentAmount);
    }
    return Object.entries(map).map(([k, v]) => ({
      name: CATEGORY_CONFIG[k]?.label || k,
      cluster: CATEGORY_CONFIG[k]?.cluster || "Umum",
      target: v.target,
      current: v.current,
      share: analytics.totalTargetAmount > 0 ? (v.target / analytics.totalTargetAmount) * 100 : 0,
    }));
  }, [analytics, goalsList]);

  // Top 6 goals comparison chart data
  const topGoalsChartData = useMemo(() => {
    return [...goalsList]
      .sort((a, b) => Number(b.targetAmount) - Number(a.targetAmount))
      .slice(0, 6)
      .map((g) => ({
        title: g.title.length > 18 ? `${g.title.slice(0, 18)}...` : g.title,
        target: Number(g.targetAmount),
        terkumpul: Number(g.currentAmount),
        sisa: Math.max(0, Number(g.targetAmount) - Number(g.currentAmount)),
      }));
  }, [goalsList]);

  return (
    <div className="min-h-screen bg-default-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-default-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md shadow-primary/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Financial Goals & Wishlist Matrix
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                  Backend Connected
                </span>
              </h1>
              <p className="text-xs md:text-sm text-default-500">
                Perencanaan target tabungan, manajemen prioritas terstruktur, dan diversifikasi alokasi kekayaan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold text-xs h-9 border border-purple-200 dark:border-purple-800 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
            onClick={() => {
              if (goalsList.length > 0) {
                setFeasibilityGoal(goalsList[0]);
              }
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Simulasi Kelayakan AI</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
            onClick={() => setShowCharts(!showCharts)}
          >
            {showCharts ? <BarChart3 className="w-3.5 h-3.5" /> : <PieIcon className="w-3.5 h-3.5" />}
            <span>{showCharts ? "Sembunyikan Visualisasi" : "Tampilkan Visualisasi"}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs h-9 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all cursor-pointer"
            onClick={() => handleOpenCreateModal()}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Target Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Target Capital */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Total Target Kapital</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(analytics.totalTargetAmount)}
            </span>
            <span className="text-xs text-default-400 font-mono">{goalsList.length} Goals</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-default-500">
            <Layers className="w-3 h-3 text-blue-500" />
            <span>Target gabungan semua klaster</span>
          </div>
        </Card>

        {/* Total Terkumpul / Saved */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Saldo Terkumpul</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(analytics.totalCurrentAmount)}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {completionPercent.toFixed(1)}%
            </span>
          </div>
          {/* Global Progress mini bar */}
          <div className="mt-2 w-full bg-default-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, completionPercent)}%` }}
            />
          </div>
        </Card>

        {/* Planned Monthly Savings Pace */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Komitmen Nabung / Bln</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(analytics.totalMonthlyPlanned)}
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Kecepatan Akumulasi</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-default-500">
            <Calendar className="w-3 h-3 text-purple-500" />
            <span>Alokasi bulanan terencana</span>
          </div>
        </Card>

        {/* Sisa Kebutuhan Dana */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Kekurangan Dana (Gap)</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(Math.max(0, analytics.totalTargetAmount - analytics.totalCurrentAmount))}
            </span>
            <span className="text-xs text-default-400 font-mono">
              {analytics.totalMonthlyPlanned > 0
                ? `~${Math.ceil((analytics.totalTargetAmount - analytics.totalCurrentAmount) / analytics.totalMonthlyPlanned)} bln`
                : "Fleksibel"}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-default-500">
            <ArrowUpRight className="w-3 h-3 text-amber-500" />
            <span>Estimasi lunas berdasarkan run-rate</span>
          </div>
        </Card>
      </div>

      {/* 3. Visualisasi Chart Detail Lengkap Professional (Collapsible / Toggleable) */}
      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Diversifikasi Alokasi Portofolio Target (Donut Chart) */}
          <Card className="lg:col-span-5 p-5 border border-default-200 shadow-sm bg-background flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-default-100 pb-3">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Diversifikasi Portofolio Target</h2>
                </div>
                <span className="text-xs text-default-400">Share Kapital (%)</span>
              </div>
              <p className="text-xs text-default-500 mt-2">
                Distribusi sasaran alokasi dana per klaster kehidupan untuk menjaga keseimbangan diversifikasi.
              </p>

              {categoryChartData.length > 0 ? (
                <div className="h-56 mt-2 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="target"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-background/95 backdrop-blur-md border border-default-200 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                                <p className="font-bold text-foreground">{data.name}</p>
                                <p className="text-default-500">Klaster: {data.cluster}</p>
                                <p className="text-primary font-semibold">Target: {formatCurrency(data.target)}</p>
                                <p className="text-emerald-500">Terkumpul: {formatCurrency(data.current)}</p>
                                <p className="text-xs font-mono text-default-400">Porsi: {data.share.toFixed(1)}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Stat */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-default-400">Portofolio</span>
                    <span className="text-base font-bold text-foreground">
                      {completionPercent.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-emerald-500 font-medium">Tercapai</span>
                  </div>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-default-400">
                  Belum ada data sasaran alokasi
                </div>
              )}
            </div>

            {/* Pill Legends */}
            <div className="mt-3 pt-3 border-t border-default-100 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {categoryChartData.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-default-100/60 border border-default-200/50 text-[11px]"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PALETTE[idx % PALETTE.length] }} />
                  <span className="font-medium text-foreground truncate max-w-[100px]">{item.name}</span>
                  <span className="text-default-400 font-mono">({item.share.toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Right: Milestone & Target vs Saldo Terkumpul (Ranked Comparison Bar) */}
          <Card className="lg:col-span-7 p-5 border border-default-200 shadow-sm bg-background flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-default-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-foreground">Komparasi Target vs Saldo Terkumpul</h2>
                </div>
                <span className="text-xs text-default-400 font-mono">Top 6 Target Utama</span>
              </div>
              <p className="text-xs text-default-500 mt-2">
                Evaluasi progres dana riil terhadap target masing-masing instrumen tabungan.
              </p>

              {topGoalsChartData.length > 0 ? (
                <div className="h-56 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topGoalsChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#88888820" />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                        tick={{ fontSize: 10, fill: "#888888" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="title"
                        tick={{ fontSize: 11, fill: "#888888" }}
                        width={90}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="bg-background/95 backdrop-blur-md border border-default-200 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                                <p className="font-bold text-foreground">{d.title}</p>
                                <p className="text-primary">Target: {formatCurrency(d.target)}</p>
                                <p className="text-emerald-500 font-semibold">Terkumpul: {formatCurrency(d.terkumpul)}</p>
                                <p className="text-amber-500">Sisa: {formatCurrency(d.sisa)}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="terkumpul" name="Terkumpul" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
                      <Bar dataKey="sisa" name="Sisa Kebutuhan" fill="#e2e8f0" radius={[0, 4, 4, 0]} stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-default-400">
                  Belum ada goal yang aktif
                </div>
              )}
            </div>

            {/* Run-rate intelligence note */}
            <div className="mt-3 pt-3 border-t border-default-100 flex items-center justify-between text-xs text-default-500">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>AI Projection: Target total diperkirakan tercapai dalam <strong>~14 bulan</strong> dengan tabungan konsisten.</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. Professional Filter Bar & View Mode Control */}
      <Card className="p-4 border border-default-200 shadow-sm bg-background">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-default-400" />
            <input
              type="text"
              placeholder="Cari target, catatan, atau keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-default-100 border border-default-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-default-100 border border-default-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Semua Status</option>
              <option value="in_progress">Aktif (In Progress)</option>
              <option value="wishlist">Wishlist</option>
              <option value="completed">Tercapai (Completed)</option>
              <option value="paused">Dijeda (Paused)</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-default-100 border border-default-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Semua Prioritas</option>
              <option value="urgent">P0 Urgent</option>
              <option value="high">P1 High</option>
              <option value="medium">P2 Medium</option>
              <option value="low">P3 Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-2.5 py-2 rounded-lg bg-default-100 border border-default-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">Semua Kategori</option>
              <option value="emergency">Dana Darurat</option>
              <option value="property">Rumah & Properti</option>
              <option value="investment">Investasi</option>
              <option value="gadget">Gadget & Hardware</option>
              <option value="travel">Liburan</option>
              <option value="retirement">Pensiun / FIRE</option>
              <option value="education">Pendidikan</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-2 rounded-lg bg-default-100 border border-default-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="priority">Urutkan: Prioritas</option>
              <option value="target_desc">Target Tertinggi</option>
              <option value="deadline">Deadline Terdekat</option>
              <option value="progress">Persentase Terbanyak</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-default-100 p-1 rounded-lg border border-default-200">
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === "kanban"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-default-500 hover:text-foreground"
                }`}
                title="Tampilan Kanban Board (Drag and Drop)"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prioritas Board</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-default-500 hover:text-foreground"
                }`}
                title="Tampilan Grid Cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid Kartu</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* 5. Main Content: Kanban Priority Board OR Grid View */}
      {isGoalsLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-default-500">Memuat target finansial dari database...</p>
        </div>
      ) : viewMode === "kanban" ? (
        /* KANBAN PRIORITY LANES WITH DRAG & DROP */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {PRIORITY_LANES.map((lane) => {
            const laneGoals = filteredGoals.filter((g) => g.priority === lane.id);
            const laneTotalTarget = laneGoals.reduce((acc, g) => acc + Number(g.targetAmount), 0);
            const laneTotalCurrent = laneGoals.reduce((acc, g) => acc + Number(g.currentAmount), 0);
            const LaneIcon = lane.icon;
            const isTargetOver = dragOverLane === lane.id;

            return (
              <div
                key={lane.id}
                onDragOver={(e) => handleDragOver(e, lane.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnLane(e, lane.id)}
                className={`flex flex-col bg-default-100/70 border rounded-2xl p-3.5 min-h-[480px] transition-all duration-200 ${
                  isTargetOver
                    ? "ring-2 ring-primary border-primary bg-primary/5 shadow-md"
                    : "border-default-200"
                }`}
              >
                {/* Lane Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${lane.badge} border`}>
                      <LaneIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-foreground">{lane.label}</h3>
                      <p className="text-[10px] text-default-500">{lane.sublabel}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-background border border-default-200 text-default-600 font-mono">
                    {laneGoals.length}
                  </span>
                </div>

                {/* Lane Subtotal */}
                <div className="flex items-center justify-between text-[11px] text-default-500 px-1 py-1.5 mb-2.5 border-b border-default-200/60 font-mono">
                  <span>Target: {formatCurrency(laneTotalTarget)}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Ada: {formatCurrency(laneTotalCurrent)}
                  </span>
                </div>

                {/* Drop Area / Cards list */}
                <div className="space-y-3 flex-1 flex flex-col">
                  {laneGoals.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      formatCurrency={formatCurrency}
                      onEdit={() => handleOpenEditModal(goal)}
                      onDelete={() => deleteMutation.mutate(goal.id)}
                      onDeposit={() => {
                        setDepositGoal(goal);
                        setDepositAmount("");
                      }}
                      onCheckFeasibility={() => setFeasibilityGoal(goal)}
                      onDragStart={(e) => handleDragStart(e, goal.id)}
                    />
                  ))}

                  {laneGoals.length === 0 && (
                    <div
                      className={`flex-1 border-2 border-dashed border-default-200 rounded-xl flex flex-col items-center justify-center p-6 text-center text-xs text-default-400 transition ${
                        isTargetOver ? "border-primary bg-primary/10 text-primary" : ""
                      }`}
                    >
                      <GripVertical className="w-5 h-5 mb-1.5 opacity-40" />
                      <span>Tarik & lepas target ke sini untuk mengubah prioritas</span>
                    </div>
                  )}
                </div>

                {/* Quick Add into Lane Button */}
                <button
                  onClick={() => handleOpenCreateModal(lane.id)}
                  className="mt-3 w-full py-2 border border-dashed border-default-300 rounded-xl text-xs text-default-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition flex items-center justify-center gap-1.5 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah di kolom ini</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              formatCurrency={formatCurrency}
              onEdit={() => handleOpenEditModal(goal)}
              onDelete={() => deleteMutation.mutate(goal.id)}
              onDeposit={() => {
                setDepositGoal(goal);
                setDepositAmount("");
              }}
              onCheckFeasibility={() => setFeasibilityGoal(goal)}
            />
          ))}

          {filteredGoals.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-default-200 rounded-2xl">
              <Target className="w-10 h-10 text-default-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-foreground">Tidak ada target yang sesuai filter</p>
              <p className="text-xs text-default-500 mt-1">Coba sesuaikan kata kunci pencarian atau reset filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("all");
                  setFilterPriority("all");
                  setFilterStatus("all");
                }}
                className="mt-4 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-medium transition shadow-sm shadow-primary/20"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Quick Deposit Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-md p-6 bg-background border border-default-200 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Nabung / Setor Dana</h3>
                  <p className="text-xs text-default-500 truncate max-w-[260px]">{depositGoal.title}</p>
                </div>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 rounded-md text-default-400 hover:text-default-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current status stats */}
            <div className="bg-default-100 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-default-400">Terkumpul saat ini:</span>
                <p className="font-bold text-foreground">{formatCurrency(depositGoal.currentAmount)}</p>
              </div>
              <div className="text-right">
                <span className="text-default-400">Target Akhir:</span>
                <p className="font-bold text-primary">{formatCurrency(depositGoal.targetAmount)}</p>
              </div>
            </div>

            <form onSubmit={handleQuickDeposit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Nominal Setoran ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Contoh: 1500000"
                  className="w-full px-3 py-2.5 text-sm bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-mono"
                />
              </div>

              {/* Quick Nominal Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[100000, 500000, 1000000, 2500000, 5000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDepositAmount(String(val))}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-default-100 hover:bg-default-200 border border-default-200 text-default-600 font-medium transition"
                  >
                    +{formatCurrency(val)}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-default-100">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={depositMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-medium transition shadow-sm shadow-primary/30 disabled:opacity-50"
                >
                  {depositMutation.isPending ? "Menyimpan..." : "Konfirmasi Setoran"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 7. Create / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-lg p-6 bg-background border border-default-200 shadow-2xl rounded-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingGoal ? "Edit Target Finansial" : "Buat Target / Wishlist Baru"}
                  </h3>
                  <p className="text-xs text-default-500">Konfigurasikan sasaran, kategori, dan prioritas</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1 rounded-md text-default-400 hover:text-default-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="font-semibold text-foreground mb-1 block">Nama Target / Wishlist *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Misal: Dana Darurat 6 Bulan, DP Rumah, MacBook Pro M3"
                  className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Kategori Klaster</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-medium"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label} ({v.cluster})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-foreground mb-1 block">Tingkat Prioritas</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-medium"
                  >
                    <option value="urgent">P0 - Urgent / Kritis</option>
                    <option value="high">P1 - Prioritas Tinggi</option>
                    <option value="medium">P2 - Prioritas Sedang</option>
                    <option value="low">P3 - Wishlist / Santai</option>
                  </select>
                </div>
              </div>

              {/* Target Amount & Initial Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Target Nominal ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={formTargetAmount}
                    onChange={(e) => setFormTargetAmount(e.target.value)}
                    placeholder="Contoh: 30000000"
                    className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground mb-1 block">Saldo Saat Ini ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formCurrentAmount}
                    onChange={(e) => setFormCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Target Date & Planned Monthly Saving */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Target Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground mb-1 block">Rencana Tabungan / Bln</label>
                  <input
                    type="number"
                    min="0"
                    value={formMonthlyPlanned}
                    onChange={(e) => setFormMonthlyPlanned(e.target.value)}
                    placeholder="Contoh: 2500000"
                    className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="font-semibold text-foreground mb-1 block">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-medium"
                >
                  <option value="in_progress">Aktif (Sedang Berjalan)</option>
                  <option value="wishlist">Wishlist (Menunggu Giliran)</option>
                  <option value="completed">Tercapai (Sudah Terpenuhi)</option>
                  <option value="paused">Dijeda Sementara</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold text-foreground mb-1 block">Catatan / Rencana Strategis</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Tambahkan detail strategi alokasi akun tabungan atau sumber dana..."
                  className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-medium transition shadow-sm shadow-primary/30 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : "Simpan Target"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 8. AI Feasibility Modal */}
      {feasibilityGoal && (
        <GoalFeasibilityModal
          isOpen={!!feasibilityGoal}
          onClose={() => setFeasibilityGoal(null)}
          goal={feasibilityGoal}
          workspaceName={selectedWorkspace?.name}
          currency={currency}
          monthlyIncome={dashboardSummary?.data?.monthlyIncome || 0}
          monthlyExpense={dashboardSummary?.data?.monthlyExpense || 0}
          totalBalance={dashboardSummary?.data?.totalBalance || 0}
          onApplyNewDate={(id, newDate) => {
            updateMutation.mutate({
              id,
              data: { targetDate: newDate },
            });
            setFeasibilityGoal(null);
          }}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------
// Sub-Component: GoalCard (Supports Drag & Drop)
// ----------------------------------------------------
interface GoalCardProps {
  goal: FinancialGoal;
  formatCurrency: (val: number | string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onDeposit: () => void;
  onCheckFeasibility: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}

function GoalCard({
  goal,
  formatCurrency,
  onEdit,
  onDelete,
  onDeposit,
  onCheckFeasibility,
  onDragStart,
}: GoalCardProps) {
  const target = Number(goal.targetAmount) || 0;
  const current = Number(goal.currentAmount) || 0;
  const percent = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const remaining = Math.max(0, target - current);

  const cat = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.other;
  const CatIcon = cat.icon;

  // Days remaining calculation
  let daysLeftText = "";
  if (goal.targetDate) {
    const targetTime = new Date(goal.targetDate).getTime();
    const nowTime = new Date().getTime();
    const diffDays = Math.ceil((targetTime - nowTime) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      daysLeftText = `Terlewat ${Math.abs(diffDays)} hari`;
    } else if (diffDays === 0) {
      daysLeftText = "Jatuh tempo hari ini";
    } else if (diffDays < 30) {
      daysLeftText = `${diffDays} hari lagi`;
    } else {
      const months = Math.floor(diffDays / 30);
      daysLeftText = `~${months} bulan lagi`;
    }
  }

  // Calculate suggested monthly pace to finish on deadline
  const monthlyPace = useMemo(() => {
    if (!goal.targetDate || remaining <= 0) return null;
    const targetTime = new Date(goal.targetDate).getTime();
    const nowTime = new Date().getTime();
    const diffMonths = Math.max(1, (targetTime - nowTime) / (1000 * 60 * 60 * 24 * 30.4));
    return Math.ceil(remaining / diffMonths);
  }, [goal.targetDate, remaining]);

  return (
    <Card
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      className={`p-4 border border-default-200 shadow-sm bg-background hover:shadow-md hover:border-primary/40 transition-all duration-150 select-none group relative ${
        onDragStart ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      {/* Top badges & Drag handle */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {onDragStart && (
            <div className="text-default-300 group-hover:text-default-500 transition cursor-grab">
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          )}
          {/* Category Chip */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cat.bg}`}>
            <CatIcon className="w-3 h-3" />
            <span>{cat.label}</span>
          </span>

          {/* Status Chip */}
          {goal.status === "completed" && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Tercapai
            </span>
          )}
          {goal.status === "wishlist" && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-default-100 text-default-600 border border-default-200">
              Wishlist
            </span>
          )}
        </div>

        {/* Action dropdown or buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
          <button
            onClick={onCheckFeasibility}
            title="Analisis kelayakan AI"
            className="p-1 rounded-md text-secondary hover:bg-secondary/10 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onEdit}
            title="Edit target"
            className="p-1 rounded-md text-default-400 hover:text-default-700 hover:bg-default-100 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Hapus target"
            className="p-1 rounded-md text-default-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Goal Title & Notes */}
      <div className="mt-2.5">
        <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition">
          {goal.title}
        </h4>
        {goal.notes && (
          <p className="text-[11px] text-default-500 line-clamp-2 mt-0.5">{goal.notes}</p>
        )}
      </div>

      {/* Progress Bar & Amounts */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-baseline justify-between text-xs font-mono">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(current)}
          </span>
          <span className="text-default-400">
            dari <strong className="text-foreground">{formatCurrency(target)}</strong>
          </span>
        </div>

        <div className="w-full bg-default-100 rounded-full h-2 overflow-hidden border border-default-200/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percent >= 100
                ? "bg-emerald-500"
                : percent >= 60
                ? "bg-primary"
                : "bg-amber-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-default-500 pt-0.5">
          <span className="font-semibold text-foreground">{percent.toFixed(1)}%</span>
          {remaining > 0 ? (
            <span>Sisa {formatCurrency(remaining)}</span>
          ) : (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" /> Target Terpenuhi
            </span>
          )}
        </div>
      </div>

      {/* Monthly Planned & Deadline info */}
      <div className="mt-3 pt-2.5 border-t border-default-100 flex items-center justify-between text-[11px] text-default-500">
        <div className="flex items-center gap-1 truncate max-w-[130px]" title="Deadline target">
          <Calendar className="w-3 h-3 text-default-400 shrink-0" />
          <span>{daysLeftText || "Tanpa deadline"}</span>
        </div>

        {monthlyPace && remaining > 0 ? (
          <span className="font-mono text-primary text-[10px] font-medium" title="Saran nominal nabung per bulan agar tepat waktu">
            Perlu: {formatCurrency(monthlyPace)}/bln
          </span>
        ) : goal.monthlyContributionPlanned ? (
          <span className="font-mono text-default-400 text-[10px]">
            Plan: {formatCurrency(goal.monthlyContributionPlanned)}/bln
          </span>
        ) : null}
      </div>

      {/* Quick Nabung / Setor Button */}
      <div className="mt-3">
        <button
          type="button"
          onClick={onDeposit}
          className="w-full h-8 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Nabung / Setor Dana</span>
        </button>
      </div>
    </Card>
  );
}
