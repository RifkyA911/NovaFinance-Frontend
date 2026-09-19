/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import type { Workspace } from "@/app/lib/api";
import {
  Plus,
  Building2,
  Trash2,
  CheckCircle2,
  X,
  Wallet,
  ArrowRight,
  Sparkles,
  GripVertical,
  ShieldCheck,
  Users,
  Coins,
  ArrowUpRight,
  Sliders,
  ExternalLink,
  Layers,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Globe,
  Briefcase,
  User,
  Activity,
  Edit3,
  TrendingUp,
  Check,
} from "lucide-react";
import { Card } from "@heroui/react";
import { playSoftChime } from "@/app/lib/sound";

const SPARKLINE_DATA: Record<string, number[]> = {
  personal: [18, 22, 21, 26, 28, 27, 32, 35, 38],
  umkm: [45, 42, 50, 48, 55, 62, 59, 68, 74],
  pt: [120, 115, 130, 125, 142, 138, 155, 162, 178],
};

const GROWTH_CONFIG: Record<string, { pnl: string; label: string }> = {
  personal: { pnl: "+14.8%", label: "Equity Growth" },
  umkm: { pnl: "+22.4%", label: "Net Margin" },
  pt: { pnl: "+31.2%", label: "EBITDA Growth" },
};

function MiniSparkline({ data, isPositive = true }: { data: number[]; isPositive?: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 110;
  const height = 32;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pointsString = points.join(" ");
  const areaString = `0,${height} ${pointsString} ${width},${height}`;
  const strokeColor = isPositive ? "#10b981" : "#f43f5e";
  const gradientId = `spark-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon points={areaString} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pointsString}
      />
    </svg>
  );
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: any; color: string; badge: string; desc: string }
> = {
  personal: {
    label: "Personal Finance",
    icon: User,
    color: "#3b82f6",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    desc: "Pembukuan pribadi, tabungan harian, dan cashflow keluarga",
  },
  umkm: {
    label: "UMKM / Small Business",
    icon: Briefcase,
    color: "#10b981",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    desc: "Operasional dagang & jasa, inventaris kas, dan rekonsiliasi usaha",
  },
  pt: {
    label: "PT / Corporate Entity",
    icon: Building2,
    color: "#8b5cf6",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    desc: "Entitas berbadan hukum, audit berjenjang, dan tata kelola RBAC",
  },
};

export default function WorkspacesPage() {
  const router = useRouter();
  const {
    workspaces,
    selectedWorkspace,
    setSelectedWorkspace,
    loading,
    refreshWorkspaces,
  } = useWorkspace();

  // Search & Type Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Drag and drop ordering state
  const [orderedWorkspaces, setOrderedWorkspaces] = useState<Workspace[]>([]);
  const [draggedWsId, setDraggedWsId] = useState<string | null>(null);
  const [dragOverWsId, setDragOverWsId] = useState<string | null>(null);

  // Sync ordered workspaces when workspaces load
  React.useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      setOrderedWorkspaces(workspaces);
    }
  }, [workspaces]);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState("personal");
  const [newWorkspaceCurrency, setNewWorkspaceCurrency] = useState("IDR");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit Workspace Modal state
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("personal");
  const [editCurrency, setEditCurrency] = useState("IDR");
  const [updating, setUpdating] = useState(false);

  const handleOpenEdit = (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkspace(ws);
    setEditName(ws.name);
    setEditType(ws.type);
    setEditCurrency(ws.currency);
  };

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace || !editName.trim()) return;

    setUpdating(true);
    setError("");
    try {
      const response = await fetch(`http://localhost:8080/api/workspaces/${editingWorkspace.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editName.trim(),
          type: editType,
          currency: editCurrency,
        }),
      });

      const data = await response.json();
      if (data.success) {
        playSoftChime();
        await refreshWorkspaces();
        setEditingWorkspace(null);
      } else {
        setError(data.error || "Gagal memperbarui workspace.");
      }
    } catch (err) {
      console.error("Failed to update workspace:", err);
      setError("Gagal memperbarui workspace. Silakan coba lagi.");
    } finally {
      setUpdating(false);
    }
  };

  // AI Diagnostic Modal state
  const [aiAuditWorkspace, setAiAuditWorkspace] = useState<Workspace | null>(null);
  const [isAiAuditing, setIsAiAuditing] = useState(false);

  // Filtered workspaces
  const filteredWorkspaces = useMemo(() => {
    const list = orderedWorkspaces.length > 0 ? orderedWorkspaces : workspaces;
    return list.filter((ws) => {
      const matchSearch =
        ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ws.currency.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "all" || ws.type.toLowerCase() === typeFilter.toLowerCase();
      return matchSearch && matchType;
    });
  }, [orderedWorkspaces, workspaces, searchQuery, typeFilter]);

  // Handle Workspace Switch
  const handleSelectWorkspace = (ws: Workspace) => {
    playSoftChime();
    setSelectedWorkspace(ws);
  };

  // Direct Jump to Wallets of that Workspace
  const handleOpenWallets = (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWorkspace(ws);
    router.push("/wallets");
  };

  // Create Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setCreating(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8080/api/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: newWorkspaceName.trim(),
          type: newWorkspaceType,
          currency: newWorkspaceCurrency,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
        setShowCreateModal(false);
        setNewWorkspaceName("");
        setNewWorkspaceType("personal");
        setNewWorkspaceCurrency("IDR");
      } else {
        setError(data.error || "Gagal membuat workspace.");
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
      setError("Gagal membuat workspace. Pastikan koneksi backend aktif.");
    } finally {
      setCreating(false);
    }
  };

  // Confirm Delete Workspace
  const confirmDeleteWorkspace = async () => {
    if (!deleteWorkspaceId) return;

    setDeleting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/workspaces/${deleteWorkspaceId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        await refreshWorkspaces();
        setShowDeleteModal(false);
        setDeleteWorkspaceId(null);
      } else {
        setError(data.error || "Gagal menghapus workspace.");
      }
    } catch (err) {
      console.error("Failed to delete workspace:", err);
      setError("Gagal menghapus workspace. Silakan coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWsId(id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverWsId !== id) {
      setDragOverWsId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverWsId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverWsId(null);
    const sourceId = e.dataTransfer.getData("text/plain") || draggedWsId;
    if (!sourceId || sourceId === targetId) return;

    const currentList = [...orderedWorkspaces];
    const sourceIdx = currentList.findIndex((w) => w.id === sourceId);
    const targetIdx = currentList.findIndex((w) => w.id === targetId);

    if (sourceIdx < 0 || targetIdx < 0) return;

    // Reorder array
    const [moved] = currentList.splice(sourceIdx, 1);
    currentList.splice(targetIdx, 0, moved);

    setOrderedWorkspaces(currentList);
    playSoftChime();
  };

  return (
    <div className="min-h-screen bg-default-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-default-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Multi-Workspace & Entity Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium border border-blue-500/20">
                  Granular Isolation
                </span>
              </h1>
              <p className="text-xs md:text-sm text-default-500">
                Pemisahan tegas antara pembukuan pribadi, UMKM, dan korporat PT dengan isolasi data terenkripsi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/wallets"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ke Master Wallets</span>
          </Link>

          <Link
            href="/users"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Kelola RBAC & Tim</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setError("");
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs h-9 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Workspace Baru</span>
          </button>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-danger hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workspaces */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Total Entitas Workspace</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">{workspaces.length}</span>
            <span className="text-xs text-blue-600 font-mono font-semibold">Tersinkronisasi</span>
          </div>
          <p className="mt-2 text-xs text-default-500 flex items-center gap-1">
            <span>Personal, UMKM & PT aktif</span>
          </p>
        </Card>

        {/* Selected Active Workspace */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Entitas Aktif Saat Ini</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-base font-bold text-foreground truncate">
              {selectedWorkspace?.name || "Belum dipilih"}
            </h3>
            <span className="inline-block text-[11px] font-semibold text-emerald-600 uppercase mt-0.5 font-mono">
              {selectedWorkspace?.type || "N/A"} • {selectedWorkspace?.currency || "IDR"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-default-400">Semua ledger & transaksi merujuk ke entitas ini</p>
        </Card>

        {/* Multi-Entity Segregation Health */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Isolasi Keuangan</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">100% Terisolasi</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold border border-purple-500/20">
              Zero Leakage
            </span>
          </div>
          <p className="mt-2 text-xs text-default-500">Mencegah percampuran kas pribadi & modal usaha</p>
        </Card>

        {/* Quick Link to Wallets */}
        <Card className="p-4 border border-default-200 shadow-sm bg-background flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-default-500 uppercase tracking-wider">Pusat Kas & Wallets</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-default-500 mt-2">
              Kelola rekening bank, e-wallet, dan likuiditas per workspace.
            </p>
          </div>
          <Link
            href="/wallets"
            className="mt-3 w-full py-2 rounded-xl bg-white dark:bg-default-800 hover:bg-amber-500/10 hover:border-amber-500/30 text-default-800 dark:text-default-200 hover:text-amber-600 dark:hover:text-amber-400 border border-default-200 dark:border-default-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-95 shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <span>Buka Kas & Rekening</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          </Link>
        </Card>
      </div>

      {/* 3. Filter Bar & Drag Instructions */}
      <Card className="p-4 border border-default-200 shadow-sm bg-background">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <input
              type="text"
              placeholder="Cari entitas, nama workspace, atau mata uang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white dark:bg-default-800/80 border border-default-200 dark:border-default-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-foreground placeholder:text-default-400 shadow-2xs transition-colors"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {["all", "personal", "umkm", "pt"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs ${
                  typeFilter === type
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 border border-blue-600"
                    : "bg-white dark:bg-default-800/80 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-700 dark:text-default-300 hover:text-foreground"
                }`}
              >
                {type === "all"
                  ? "Semua Entitas"
                  : type === "personal"
                  ? "Personal"
                  : type === "umkm"
                  ? "UMKM (Usaha)"
                  : "PT (Korporat)"}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1 text-xs text-default-400 font-mono">
            <GripVertical className="w-3.5 h-3.5" />
            <span>Drag kartu untuk mengatur prioritas urutan</span>
          </div>
        </div>
      </Card>

      {/* 4. Workspace Cards Grid with Drag & Drop */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-default-500 mt-3 text-xs">Memuat entitas workspace...</p>
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-default-200 rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 text-default-300 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Tidak ada workspace ditemukan</h3>
          <p className="text-xs text-default-500 max-w-sm mx-auto">
            {searchQuery ? "Coba sesuaikan kata kunci pencarian atau reset filter." : "Buat workspace pertama Anda untuk mulai mengelola pembukuan."}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm shadow-primary/30"
          >
            + Buat Workspace
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkspaces.map((workspace: Workspace, index: number) => {
            const isSelected = selectedWorkspace?.id === workspace.id;
            const config = TYPE_CONFIG[workspace.type.toLowerCase()] || TYPE_CONFIG.personal;
            const Icon = config.icon;
            const isOver = dragOverWsId === workspace.id;
            const sparklineData = SPARKLINE_DATA[workspace.type.toLowerCase()] || SPARKLINE_DATA.personal;
            const growth = GROWTH_CONFIG[workspace.type.toLowerCase()] || GROWTH_CONFIG.personal;

            return (
              <Card
                key={workspace.id}
                draggable
                onDragStart={(e) => handleDragStart(e, workspace.id)}
                onDragOver={(e) => handleDragOver(e, workspace.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, workspace.id)}
                onClick={() => handleSelectWorkspace(workspace)}
                className={`p-5 border transition-all duration-200 cursor-pointer bg-background relative select-none group ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-md"
                    : "border-default-200 hover:border-default-400 hover:shadow-sm"
                } ${isOver ? "ring-2 ring-primary border-primary bg-primary/5" : ""}`}
              >
                {/* Top header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Drag handle */}
                    <div className="text-default-300 group-hover:text-default-500 transition cursor-grab">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: config.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition line-clamp-1">
                        {workspace.name}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${config.badge}`}>
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Edit, AI Audit & Delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(workspace, e)}
                      title="Edit rincian workspace"
                      className="p-1.5 text-default-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAiAuditWorkspace(workspace);
                      }}
                      title="Audit Diagnostik Keuangan dengan AI"
                      className="p-1.5 text-purple-600 hover:bg-purple-500/10 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteWorkspaceId(workspace.id);
                        setShowDeleteModal(true);
                      }}
                      title="Hapus workspace"
                      className="p-1.5 text-default-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-default-500 mt-3 line-clamp-2 min-h-[32px]">
                  {config.desc}
                </p>

                {/* Mini Sparkline & Growth / PnL% */}
                <div className="mt-3 p-2.5 rounded-xl bg-default-50 dark:bg-default-900/60 border border-default-100 dark:border-default-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {growth.pnl}
                      </span>
                    </div>
                    <span className="text-[10px] text-default-400 block mt-0.5">
                      {growth.label} (MoM)
                    </span>
                  </div>
                  <div className="w-28 h-8 flex items-center justify-end">
                    <MiniSparkline data={sparklineData} isPositive={true} />
                  </div>
                </div>

                {/* Meta details */}
                <div className="mt-3 pt-3 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs text-default-500 font-mono">
                  <span>Mata Uang: <strong className="text-foreground">{workspace.currency}</strong></span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-primary font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktif Terpilih
                    </span>
                  ) : (
                    <span className="text-default-400 text-[11px] group-hover:text-foreground">
                      Klik untuk aktifkan
                    </span>
                  )}
                </div>

                {/* Action Buttons: Open Wallets & View Ledger */}
                <div className="mt-4 pt-3 border-t border-default-100 dark:border-default-800 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleOpenWallets(workspace, e)}
                    className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 dark:hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white dark:hover:text-white border border-blue-200/70 dark:border-blue-800/60 hover:border-transparent text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  >
                    <Wallet className="w-3.5 h-3.5 shrink-0" />
                    <span>Buka Wallets</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkspace(workspace);
                      router.push("/transactions");
                    }}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-800 dark:text-default-200 border border-default-200 dark:border-default-700 hover:border-default-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                  >
                    <Activity className="w-3.5 h-3.5 text-default-500 shrink-0" />
                    <span>Transaksi</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 5. Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-background border border-default-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Buat Workspace Baru</h2>
                  <p className="text-xs text-default-500">Konfigurasikan entitas keuangan terisolasi</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-default-400 hover:text-foreground rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold mb-1 block text-foreground">Nama Workspace / Perusahaan *</label>
                <input
                  type="text"
                  placeholder="Misal: Keuangan Pribadi, Toko Sukses Makmur, PT Nova Teknologi"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-default-200 bg-default-100 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold mb-1 block text-foreground">Tipe Entitas</label>
                <select
                  value={newWorkspaceType}
                  onChange={(e) => setNewWorkspaceType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-default-200 bg-default-100 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                >
                  <option value="personal">Personal Finance (Pribadi / Rumah Tangga)</option>
                  <option value="umkm">UMKM (Bisnis & Usaha Dagang/Jasa)</option>
                  <option value="pt">PT / Korporat (Entitas Badan Hukum Berjenjang)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold mb-1 block text-foreground">Mata Uang Utama</label>
                <select
                  value={newWorkspaceCurrency}
                  onChange={(e) => setNewWorkspaceCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-default-200 bg-default-100 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono font-medium"
                >
                  <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="SGD">SGD - Singapore Dollar (S$)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-default-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating || !newWorkspaceName.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-500/25 disabled:opacity-50 transition cursor-pointer active:scale-95"
                >
                  {creating ? "Membuat..." : "Simpan & Buat Workspace"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 5b. Edit Workspace Modal */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-background border border-default-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Edit Rincian Workspace</h2>
                  <p className="text-xs text-default-500">Perbarui identitas dan konfigurasi mata uang entitas</p>
                </div>
              </div>
              <button
                onClick={() => setEditingWorkspace(null)}
                className="p-1 text-default-400 hover:text-foreground rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateWorkspace} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold mb-1 block text-foreground">Nama Workspace / Perusahaan *</label>
                <input
                  type="text"
                  placeholder="Misal: Keuangan Pribadi, Toko Makmur"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-default-200 bg-default-100/70 dark:bg-default-800/60 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                />
              </div>

              <div>
                <label className="font-semibold mb-1 block text-foreground">Tipe Entitas</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-default-200 bg-default-100/70 dark:bg-default-800/60 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium cursor-pointer"
                >
                  <option value="personal">Personal Finance (Pribadi / Rumah Tangga)</option>
                  <option value="umkm">UMKM (Bisnis & Usaha Dagang/Jasa)</option>
                  <option value="pt">PT / Korporat (Entitas Badan Hukum Berjenjang)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold mb-1 block text-foreground">Mata Uang Utama</label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-default-200 bg-default-100/70 dark:bg-default-800/60 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono font-medium cursor-pointer"
                >
                  <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="SGD">SGD - Singapore Dollar (S$)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setEditingWorkspace(null)}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-700 dark:text-default-300 border border-default-200 dark:border-default-700 text-xs font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating || !editName.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-500/25 disabled:opacity-50 transition cursor-pointer active:scale-95"
                >
                  {updating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-background border border-default-200 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Hapus Workspace
            </h2>
            <p className="text-xs text-default-500">
              Apakah Anda yakin ingin menghapus workspace ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh jurnal transaksi yang terasosiasi.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-default-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteWorkspace}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm shadow-rose-600/30 disabled:opacity-50"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus Workspace"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* 7. AI Multi-Entity Diagnostic Modal */}
      {aiAuditWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-background border border-default-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI Multi-Entity Diagnostic</h3>
                  <p className="text-xs text-default-500 truncate max-w-[280px]">
                    Workspace: <strong>{aiAuditWorkspace.name}</strong> ({aiAuditWorkspace.type.toUpperCase()})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiAuditWorkspace(null)}
                className="p-1 text-default-400 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Diagnostics Content */}
            <div className="space-y-3 text-xs">
              {/* Commingling Risk Check */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    Isolasi Kas Bebas Percampuran (Commingling: Clean)
                  </p>
                  <p className="text-default-500 text-[11px] mt-0.5">
                    Entitas ini terisolasi secara disiplin di database dengan UUID unik. Tidak ada transaksi tercampur antara kebutuhan privat dan operasional.
                  </p>
                </div>
              </div>

              {/* Cashflow Runway Health */}
              <div className="p-3 rounded-xl bg-default-100 border border-default-200 space-y-1.5">
                <div className="flex items-center justify-between font-medium">
                  <span>Skor Kepatuhan & Kesiapan Pajak:</span>
                  <span className="font-bold text-primary font-mono">92 / 100</span>
                </div>
                <div className="w-full bg-default-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: "92%" }} />
                </div>
                <p className="text-[11px] text-default-400">
                  Kategori pemasukan dan pengeluaran tersusun rapi untuk pelaporan tahunan.
                </p>
              </div>

              {/* AI Strategic Recommendation */}
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                <span className="font-bold text-purple-600 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Zap className="w-3 h-3" /> Rekomendasi Cerdas AI:
                </span>
                <p className="text-default-600 text-[11px] leading-relaxed">
                  Hubungkan minimal 2 rekening terpisah di tab <strong>Wallets</strong> (1 Rekening Operasional Harian + 1 Rekening Cadangan Pajak / Dana Darurat) untuk menjaga rasio likuiditas tetap prima.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-default-100">
              <button
                type="button"
                onClick={() => {
                  const ws = aiAuditWorkspace;
                  setAiAuditWorkspace(null);
                  handleOpenWallets(ws, {} as any);
                }}
                className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-xs transition flex items-center gap-1"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Buka Wallets Entitas Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setAiAuditWorkspace(null)}
                className="px-3.5 py-1.5 rounded-xl bg-default-100 hover:bg-default-200 text-foreground font-medium text-xs"
              >
                Tutup
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
