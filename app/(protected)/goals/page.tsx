/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import {
  Button,
  Card,
  TextField,
  Label,
  Input,
  Select,
  ListBox,
  Tabs,
} from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryFunctions } from "../../lib/queries";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import GoalFeasibilityModal from "./components/GoalFeasibilityModal";

export interface FinancialGoal {
  id: string;
  workspaceId: string;
  title: string;
  category: "gadget" | "emergency" | "travel" | "property" | "investment" | "other";
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  priority: "high" | "medium" | "low";
  status: "in_progress" | "completed" | "wishlist";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_CONFIG: Record<
  FinancialGoal["category"],
  { label: string; icon: any; color: string; bg: string }
> = {
  emergency: {
    label: "Dana Darurat",
    icon: ShieldCheck,
    color: "#10b981",
    bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  gadget: {
    label: "Gadget & Wishlist",
    icon: Laptop,
    color: "#3b82f6",
    bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  travel: {
    label: "Liburan & Travel",
    icon: Plane,
    color: "#f59e0b",
    bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  property: {
    label: "Rumah & Properti",
    icon: Home,
    color: "#8b5cf6",
    bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  investment: {
    label: "Investasi & Bisnis",
    icon: Briefcase,
    color: "#06b6d4",
    bg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  },
  other: {
    label: "Lainnya",
    icon: Target,
    color: "#64748b",
    bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

const INITIAL_DEMO_GOALS: Omit<FinancialGoal, "workspaceId">[] = [
  {
    id: "goal-1",
    title: "Dana Darurat 6 Bulan",
    category: "emergency",
    targetAmount: 30000000,
    currentAmount: 18500000,
    targetDate: "2026-12-31",
    priority: "high",
    status: "in_progress",
    notes: "Alokasi aman untuk kebutuhan operasional 6 bulan ke depan.",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z",
  },
  {
    id: "goal-2",
    title: "Beli MacBook Pro M3 Max",
    category: "gadget",
    targetAmount: 35000000,
    currentAmount: 22000000,
    targetDate: "2026-11-20",
    priority: "medium",
    status: "in_progress",
    notes: "Upgrade workstation kerja untuk software engineering & AI development.",
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-09-16T00:00:00.000Z",
  },
  {
    id: "goal-3",
    title: "Liburan Musim Dingin Jepang",
    category: "travel",
    targetAmount: 25000000,
    currentAmount: 7500000,
    targetDate: "2027-01-15",
    priority: "low",
    status: "wishlist",
    notes: "Tiket pesawat, akomodasi, dan pass Shinkansen Tokyo-Hokkaido.",
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-15T00:00:00.000Z",
  },
];

export default function GoalsPage() {
  const { selectedWorkspace } = useWorkspace();

  // Fetch actual workspace financial cashflow data for AI Feasibility calculations
  const { data: dashboardSummary } = useQuery({
    queryKey: queryKeys.dashboardSummary(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.dashboardSummary(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  const monthlyIncome = dashboardSummary?.data?.monthlyIncome || 0;
  const monthlyExpense = dashboardSummary?.data?.monthlyExpense || 0;
  const totalBalance = dashboardSummary?.data?.totalBalance || 0;

  // Feasibility simulator state
  const [feasibilityGoal, setFeasibilityGoal] = useState<FinancialGoal | null>(null);

  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [filterTab, setFilterTab] = useState<"all" | "in_progress" | "wishlist" | "completed">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Deposit quick modal state
  const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<FinancialGoal["category"]>("gadget");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [formCurrentAmount, setFormCurrentAmount] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formPriority, setFormPriority] = useState<FinancialGoal["priority"]>("medium");
  const [formStatus, setFormStatus] = useState<FinancialGoal["status"]>("in_progress");
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

  const storageKey = `novajournal_goals_${selectedWorkspace?.id || "default"}`;

  // Load goals from localStorage per workspace
  useEffect(() => {
    if (!selectedWorkspace?.id) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setGoals(parsed);
      } else {
        // Seed with demo data for new workspace
        const initial = INITIAL_DEMO_GOALS.map((g) => ({
          ...g,
          workspaceId: selectedWorkspace.id,
        }));
        setGoals(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch {
      // fallback
    }
  }, [selectedWorkspace?.id, storageKey]);

  // Persist goals
  const saveGoals = (updated: FinancialGoal[]) => {
    setGoals(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const formatAmountInput = (val: string) => {
    if (!val) return "";
    const clean = val.replace(/\D/g, "");
    return Number(clean).toLocaleString("en-US");
  };

  const openCreateModal = () => {
    setEditingGoal(null);
    setFormTitle("");
    setFormCategory("gadget");
    setFormTargetAmount("");
    setFormCurrentAmount("");
    setFormTargetDate(new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split("T")[0]);
    setFormPriority("medium");
    setFormStatus("in_progress");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormCategory(goal.category);
    setFormTargetAmount(String(goal.targetAmount));
    setFormCurrentAmount(String(goal.currentAmount));
    setFormTargetDate(goal.targetDate);
    setFormPriority(goal.priority);
    setFormStatus(goal.status);
    setFormNotes(goal.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formTargetAmount) return;

    const targetVal = parseFloat(formTargetAmount.replace(/,/g, "")) || 0;
    const currentVal = parseFloat(formCurrentAmount.replace(/,/g, "")) || 0;

    let updatedList: FinancialGoal[];

    if (editingGoal) {
      updatedList = goals.map((g) =>
        g.id === editingGoal.id
          ? {
              ...g,
              title: formTitle.trim(),
              category: formCategory,
              targetAmount: targetVal,
              currentAmount: currentVal,
              targetDate: formTargetDate,
              priority: formPriority,
              status: currentVal >= targetVal ? "completed" : formStatus,
              notes: formNotes.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : g
      );
    } else {
      const newGoal: FinancialGoal = {
        id: `goal-${Date.now()}`,
        workspaceId: selectedWorkspace?.id || "default",
        title: formTitle.trim(),
        category: formCategory,
        targetAmount: targetVal,
        currentAmount: currentVal,
        targetDate: formTargetDate,
        priority: formPriority,
        status: currentVal >= targetVal ? "completed" : formStatus,
        notes: formNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedList = [newGoal, ...goals];
    }

    saveGoals(updatedList);
    setIsModalOpen(false);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoals(updated);
  };

  const handleApplyNewDate = (goalId: string, newDate: string) => {
    const updated = goals.map((g) =>
      g.id === goalId ? { ...g, targetDate: newDate, updatedAt: new Date().toISOString() } : g
    );
    saveGoals(updated);
    if (editingGoal && editingGoal.id === goalId) {
      setFormTargetDate(newDate);
    }
    if (feasibilityGoal && feasibilityGoal.id === goalId) {
      setFeasibilityGoal({ ...feasibilityGoal, targetDate: newDate });
    }
  };

  const handleToggleComplete = (goal: FinancialGoal) => {
    const isCurrentlyDone = goal.status === "completed";
    const updated = goals.map((g) =>
      g.id === goal.id
        ? {
            ...g,
            status: (isCurrentlyDone ? "in_progress" : "completed") as FinancialGoal["status"],
            currentAmount: !isCurrentlyDone ? g.targetAmount : g.currentAmount,
            updatedAt: new Date().toISOString(),
          }
        : g
    );
    saveGoals(updated);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal || !depositAmount) return;

    const added = parseFloat(depositAmount.replace(/,/g, "")) || 0;
    if (added <= 0) return;

    const newCurrent = depositGoal.currentAmount + added;
    const updated = goals.map((g) =>
      g.id === depositGoal.id
        ? {
            ...g,
            currentAmount: newCurrent,
            status: (newCurrent >= g.targetAmount ? "completed" : g.status) as FinancialGoal["status"],
            updatedAt: new Date().toISOString(),
          }
        : g
    );

    saveGoals(updated);
    setDepositGoal(null);
    setDepositAmount("");
  };

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      // Tab filter
      if (filterTab !== "all" && g.status !== filterTab) return false;
      // Category filter
      if (filterCategory !== "all" && g.category !== filterCategory) return false;
      return true;
    });
  }, [goals, filterTab, filterCategory]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const remaining = Math.max(0, totalTarget - totalSaved);
    const completedCount = goals.filter((g) => g.status === "completed").length;
    const avgProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

    return {
      totalTarget,
      totalSaved,
      remaining,
      completedCount,
      totalCount: goals.length,
      avgProgress,
    };
  }, [goals]);

  // Helper for countdown & monthly projection
  const getGoalProjection = (goal: FinancialGoal) => {
    const now = new Date();
    const target = new Date(goal.targetDate);
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);

    const remainingMonths = Math.max(1, Math.round(diffDays / 30));
    const neededPerMonth = Math.round(remainingAmount / remainingMonths);

    return {
      diffDays,
      remainingMonths,
      neededPerMonth,
      isOverdue: diffDays < 0 && goal.status !== "completed",
    };
  };

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Target className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Planning & Financial Goals
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase">
              {currency}
            </span>
          </div>
          <p className="text-xs text-default-500">
            Rencanakan target tabungan, impian belanja, dan alokasi anggaran masa depan Anda.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-xs shadow-md flex items-center gap-1.5 h-9 px-4 cursor-pointer"
          onPress={openCreateModal}
        >
          <Plus className="w-4 h-4" />
          <span>Buat Target Baru</span>
        </Button>
      </div>

      {/* Summary KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Total Anggaran Target</p>
              <p className="text-lg sm:text-xl font-bold text-foreground mt-1">
                {formatCurrency(stats.totalTarget)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-xs text-default-400 border-t border-default-100 dark:border-default-800/80 pt-2 flex items-center justify-between">
            <span>{stats.totalCount} item target aktif</span>
            <span className="text-blue-500 font-semibold">{stats.avgProgress}% rata-rata</span>
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Dana Terkumpul</p>
              <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(stats.totalSaved)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-xs text-default-400 border-t border-default-100 dark:border-default-800/80 pt-2 flex items-center justify-between">
            <span>Sisa kebutuhan:</span>
            <span className="font-semibold text-foreground">{formatCurrency(stats.remaining)}</span>
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Target Tercapai</p>
              <p className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {stats.completedCount} <span className="text-xs font-normal text-default-400">/ {stats.totalCount} Selesai</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-xs text-default-400 border-t border-default-100 dark:border-default-800/80 pt-2">
            <span>
              {stats.totalCount > 0
                ? `${Math.round((stats.completedCount / stats.totalCount) * 100)}% resolusi terwujud`
                : "Belum ada target"}
            </span>
          </div>
        </Card>

        <Card className="p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Kebutuhan Rata-rata</p>
              <p className="text-lg sm:text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(stats.remaining > 0 ? Math.round(stats.remaining / 6) : 0)}
                <span className="text-xs font-normal text-default-400">/bln</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-xs text-default-400 border-t border-default-100 dark:border-default-800/80 pt-2">
            <span>Estimasi alokasi 6 bulan ke depan</span>
          </div>
        </Card>
      </div>

      {/* Filter Tabs & Category Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <Tabs
          selectedKey={filterTab}
          onSelectionChange={(k) => setFilterTab(k as any)}
          variant="primary"
          className="w-full sm:w-auto"
        >
          <Tabs.ListContainer>
            <Tabs.List className="flex bg-default-100 dark:bg-default-800/60 p-1 rounded-xl text-xs">
              <Tabs.Tab id="all" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer data-[selected=true]:bg-white dark:data-[selected=true]:bg-gray-800 data-[selected=true]:shadow-xs">
                Semua ({goals.length})
              </Tabs.Tab>
              <Tabs.Tab id="in_progress" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer data-[selected=true]:bg-white dark:data-[selected=true]:bg-gray-800 data-[selected=true]:shadow-xs">
                In Progress ({goals.filter((g) => g.status === "in_progress").length})
              </Tabs.Tab>
              <Tabs.Tab id="wishlist" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer data-[selected=true]:bg-white dark:data-[selected=true]:bg-gray-800 data-[selected=true]:shadow-xs">
                Wishlist ({goals.filter((g) => g.status === "wishlist").length})
              </Tabs.Tab>
              <Tabs.Tab id="completed" className="px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer data-[selected=true]:bg-white dark:data-[selected=true]:bg-gray-800 data-[selected=true]:shadow-xs">
                Tercapai ({goals.filter((g) => g.status === "completed").length})
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <Button
            size="sm"
            variant={filterCategory === "all" ? "primary" : "secondary"}
            onPress={() => setFilterCategory("all")}
            className="rounded-full text-xs font-medium px-3 h-7"
          >
            Semua Kategori
          </Button>
          {(Object.keys(CATEGORY_CONFIG) as FinancialGoal["category"][]).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={filterCategory === cat ? "primary" : "secondary"}
              onPress={() => setFilterCategory(cat)}
              className="rounded-full text-xs font-medium px-3 h-7 whitespace-nowrap"
            >
              {CATEGORY_CONFIG[cat].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Goals Grid Cards */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => {
            const catInfo = CATEGORY_CONFIG[goal.category] || CATEGORY_CONFIG.other;
            const Icon = catInfo.icon;
            const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
            const projection = getGoalProjection(goal);
            const isCompleted = goal.status === "completed" || progress >= 100;

            return (
              <Card
                key={goal.id}
                className="p-4 sm:p-5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${catInfo.bg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-foreground truncate">{goal.title}</h3>
                        <span className="text-[11px] text-default-400">{catInfo.label}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : goal.status === "wishlist"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {isCompleted ? "Tercapai" : goal.status === "wishlist" ? "Wishlist" : "In Progress"}
                      </span>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-default-500 mt-2.5 line-clamp-2 bg-default-50 dark:bg-default-800/40 p-2 rounded-lg">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Amount and Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-default-400 text-[11px]">Terkumpul: </span>
                      <span className="font-bold text-foreground text-sm">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-default-400 text-[11px]">Target: </span>
                      <span className="font-semibold text-default-500 text-xs">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-emerald-500"
                          : progress >= 60
                          ? "bg-blue-600"
                          : progress >= 30
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-default-400">
                    <span className="font-semibold text-foreground">{progress}% selesai</span>
                    <span>Sisa: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}</span>
                  </div>
                </div>

                {/* Projection & Deadline Box */}
                <div className="p-2.5 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-100 dark:border-default-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-default-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Deadline: {goal.targetDate}</span>
                    </div>
                    {projection.isOverdue ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Terlewat
                      </span>
                    ) : isCompleted ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Goal Selesai</span>
                    ) : (
                      <span className="text-default-500 font-medium">{projection.diffDays} hari lagi</span>
                    )}
                  </div>

                  {!isCompleted && projection.neededPerMonth > 0 && (
                    <div className="text-[11px] text-default-500 flex items-center gap-1 pt-1 border-t border-default-200/50 dark:border-default-700/50">
                      <ArrowUpRight className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>
                        Simpan <strong className="text-foreground">{formatCurrency(projection.neededPerMonth)}</strong>/bln ({projection.remainingMonths} bln)
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1 border-t border-default-100 dark:border-default-800/80 gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2.5 text-xs text-default-500 hover:text-foreground cursor-pointer"
                      onPress={() => openEditModal(goal)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline ml-1">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2.5 text-xs text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      onPress={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 px-2.5 text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 font-semibold cursor-pointer border border-blue-500/20"
                      onPress={() => setFeasibilityGoal(goal)}
                      aria-label="Simulasi Kelayakan Finansial AI"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      <span>Simulasi AI</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className={`h-8 px-3 text-xs font-semibold cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "text-default-600"
                      }`}
                      onPress={() => handleToggleComplete(goal)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      <span>{isCompleted ? "Selesai" : "Check"}</span>
                    </Button>

                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="h-8 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs"
                        onPress={() => {
                          setDepositGoal(goal);
                          setDepositAmount("");
                        }}
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        <span>Nabung</span>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <Card className="p-8 text-center rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Belum Ada Target di Kategori Ini</h3>
          <p className="text-xs text-default-500 max-w-sm mx-auto mt-1 mb-4">
            Mulai atur target keuangan, wishlist barang impian, atau tabungan dana darurat sekarang.
          </p>
          <Button
            size="sm"
            variant="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 cursor-pointer"
            onPress={openCreateModal}
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Buat Target Pertama</span>
          </Button>
        </Card>
      )}

      {/* Modal: Create / Edit Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-5 sm:p-6 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <h2 className="font-bold text-base text-foreground">
                  {editingGoal ? "Edit Target Keuangan" : "Buat Target / Wishlist Baru"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <TextField className="w-full space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Nama Target / Barang Impian *</Label>
                <Input
                  type="text"
                  placeholder="e.g. Dana Darurat 6 Bulan, Beli Mobil, Liburan Jepang..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="h-10 text-xs"
                />
              </TextField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Kategori Target</Label>
                  <Select
                    aria-label="Kategori"
                    selectedKey={formCategory}
                    onSelectionChange={(k) => setFormCategory(String(k) as any)}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full justify-between h-10 flex items-center px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 text-xs outline-none">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)] z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                      <ListBox aria-label="Kategori">
                        {(Object.keys(CATEGORY_CONFIG) as FinancialGoal["category"][]).map((cat) => (
                          <ListBox.Item key={cat} id={cat} textValue={CATEGORY_CONFIG[cat].label} className="p-2 text-xs rounded-lg hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer">
                            {CATEGORY_CONFIG[cat].label}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Prioritas</Label>
                  <Select
                    aria-label="Prioritas"
                    selectedKey={formPriority}
                    onSelectionChange={(k) => setFormPriority(String(k) as any)}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full justify-between h-10 flex items-center px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 text-xs outline-none">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)] z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                      <ListBox aria-label="Prioritas">
                        <ListBox.Item id="high" textValue="Tinggi" className="p-2 text-xs rounded-lg hover:bg-default-100 cursor-pointer text-rose-500 font-semibold">Tinggi (High)</ListBox.Item>
                        <ListBox.Item id="medium" textValue="Sedang" className="p-2 text-xs rounded-lg hover:bg-default-100 cursor-pointer text-amber-500 font-semibold">Sedang (Medium)</ListBox.Item>
                        <ListBox.Item id="low" textValue="Rendah" className="p-2 text-xs rounded-lg hover:bg-default-100 cursor-pointer text-blue-500 font-semibold">Rendah (Low)</ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField className="w-full space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Target Nominal ({currency}) *</Label>
                  <Input
                    type="text"
                    placeholder="0"
                    value={formatAmountInput(formTargetAmount)}
                    onChange={(e) => setFormTargetAmount(e.target.value.replace(/,/g, ""))}
                    required
                    className="h-10 text-xs font-mono font-semibold"
                  />
                </TextField>

                <TextField className="w-full space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Sudah Terkumpul ({currency})</Label>
                  <Input
                    type="text"
                    placeholder="0"
                    value={formatAmountInput(formCurrentAmount)}
                    onChange={(e) => setFormCurrentAmount(e.target.value.replace(/,/g, ""))}
                    className="h-10 text-xs font-mono"
                  />
                </TextField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextField className="w-full space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Target Deadline Tanggal *</Label>
                  <Input
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                    required
                    className="h-10 text-xs font-mono"
                  />
                </TextField>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground">Status Target</Label>
                  <Select
                    aria-label="Status"
                    selectedKey={formStatus}
                    onSelectionChange={(k) => setFormStatus(String(k) as any)}
                    className="w-full"
                  >
                    <Select.Trigger className="w-full justify-between h-10 flex items-center px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 text-xs outline-none">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="w-[var(--trigger-width)] z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                      <ListBox aria-label="Status">
                        <ListBox.Item id="in_progress" textValue="In Progress" className="p-2 text-xs rounded-lg hover:bg-default-100 cursor-pointer">In Progress (Berjalan)</ListBox.Item>
                        <ListBox.Item id="wishlist" textValue="Wishlist" className="p-2 text-xs rounded-lg hover:bg-default-100 cursor-pointer">Wishlist (Rencana)</ListBox.Item>
                        <ListBox.Item id="completed" textValue="Completed" className="p-2 text-xs rounded-lg hover:bg-default-100 cursor-pointer text-emerald-500 font-semibold">Completed (Tercapai)</ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              </div>

              <TextField className="w-full space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Catatan / Rencana Tabungan (Opsional)</Label>
                <textarea
                  rows={2}
                  placeholder="Tambahkan detail strategi alokasi tabungan..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 text-foreground resize-none outline-none focus:ring-1 focus:ring-blue-500"
                />
              </TextField>

              <div className="flex items-center justify-between pt-3 border-t border-default-100 dark:border-default-800">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="text-xs text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 font-semibold cursor-pointer border border-blue-500/20"
                  isDisabled={!formTitle.trim() || !formTargetAmount || !formTargetDate}
                  onPress={() => {
                    const targetVal = parseFloat(formTargetAmount.replace(/,/g, "")) || 0;
                    const currentVal = parseFloat(formCurrentAmount.replace(/,/g, "")) || 0;
                    setFeasibilityGoal({
                      id: editingGoal?.id || "preview-goal",
                      workspaceId: selectedWorkspace?.id || "default",
                      title: formTitle.trim() || "Target Finansial",
                      category: formCategory,
                      targetAmount: targetVal,
                      currentAmount: currentVal,
                      targetDate: formTargetDate,
                      priority: formPriority,
                      status: formStatus,
                      notes: formNotes,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-500" />
                  <span>Simulasi Kelayakan AI</span>
                </Button>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() => setIsModalOpen(false)}
                    className="text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-xs"
                  >
                    {editingGoal ? "Simpan Perubahan" : "Buat Target"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Quick Deposit / Add Funds */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-sm p-5 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-sm text-foreground">Tambah Tabungan</h3>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-default-500">
              Menambahkan saldo ke target: <strong className="text-foreground">{depositGoal.title}</strong>
              <div className="mt-1 flex items-center justify-between font-mono text-[11px]">
                <span>Terkumpul: {formatCurrency(depositGoal.currentAmount)}</span>
                <span>Target: {formatCurrency(depositGoal.targetAmount)}</span>
              </div>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <TextField className="w-full space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Nominal Setoran ({currency})</Label>
                <Input
                  type="text"
                  placeholder="0"
                  value={formatAmountInput(depositAmount)}
                  onChange={(e) => setDepositAmount(e.target.value.replace(/,/g, ""))}
                  required
                  autoFocus
                  className="h-10 text-sm font-mono font-bold"
                />
              </TextField>

              {/* Quick deposit presets */}
              <div className="flex flex-wrap gap-1.5">
                {[100000, 250000, 500000, 1000000].map((val) => (
                  <Button
                    key={val}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() => setDepositAmount(String(val))}
                    className="text-[11px] font-semibold px-2.5 h-6"
                  >
                    +{formatCurrency(val)}
                  </Button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onPress={() => setDepositGoal(null)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4"
                >
                  Simpan Setoran
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal: Smart Goal Feasibility Simulator */}
      {feasibilityGoal && (
        <GoalFeasibilityModal
          isOpen={!!feasibilityGoal}
          onClose={() => setFeasibilityGoal(null)}
          goal={feasibilityGoal}
          workspaceName={selectedWorkspace?.name}
          currency={currency}
          monthlyIncome={monthlyIncome}
          monthlyExpense={monthlyExpense}
          totalBalance={totalBalance}
          onApplyNewDate={handleApplyNewDate}
        />
      )}
    </div>
  );
}
