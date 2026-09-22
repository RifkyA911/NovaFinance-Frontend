/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import OptimizedImage from "@/app/components/OptimizedImage";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { api, type Workspace } from "@/app/lib/api";
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
  Layers,
  AlertTriangle,
  RefreshCw,
  Zap,
  Briefcase,
  User,
  Activity,
  Edit3,
  TrendingUp,
  Check,
  ChevronDown,
  UploadCloud,
  Table as TableIcon,
  LayoutGrid,
  Lock,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Info,
} from "lucide-react";
import { Card, Button, Chip } from "@heroui/react";
import { playSoftChime } from "@/app/lib/sound";
import {
  useLegacyTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { flexRender, type SortingState } from "@tanstack/react-table";

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
  const width = 100;
  const height = 28;
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
    label: "UMKM / Usaha Dagang",
    icon: Briefcase,
    color: "#10b981",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    desc: "Operasional dagang & jasa, inventaris kas, dan rekonsiliasi usaha",
  },
  pt: {
    label: "PT / Korporat",
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

  // View Mode: DnD Grid Cards vs TanStack Table
  const [viewMode, setViewMode] = useState<"dnd" | "table">("dnd");

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

  // Create Workspace Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceType, setNewWorkspaceType] = useState("personal");
  const [newWorkspaceCurrency, setNewWorkspaceCurrency] = useState("IDR");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // Delete Workspace Modal state
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit Workspace Modal state (includes photo/brand logo upload)
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("personal");
  const [editCurrency, setEditCurrency] = useState("IDR");
  const [editLogoUrl, setEditLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [updating, setUpdating] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // AI Workspace Suggestion & Recommendation Modal state
  const [showAiAdvisorModal, setShowAiAdvisorModal] = useState(false);
  const [aiSelectedIndustry, setAiSelectedIndustry] = useState<string>("agency");
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);

  // RBAC Guide Modal state
  const [showRbacModal, setShowRbacModal] = useState(false);

  // AI Diagnostic Modal state
  const [aiAuditWorkspace, setAiAuditWorkspace] = useState<Workspace | null>(null);

  // Filtered workspaces for Grid & Table
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

  // Open Edit Workspace Modal with prefilled state
  const handleOpenEdit = (ws: Workspace, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkspace(ws);
    setEditName(ws.name);
    setEditType(ws.type.toLowerCase());
    setEditCurrency(ws.currency);
    setEditLogoUrl(ws.customBrandLogo || null);
    setError("");
  };

  // Upload/Edit Workspace Logo (square cropped)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingWorkspace) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (PNG, JPG, WebP, GIF)");
      return;
    }

    setIsUploadingLogo(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setEditLogoUrl(dataUrl);

        try {
          const res = await api.uploadBrandLogo(editingWorkspace.id, dataUrl, "square");
          if (res.success && res.brandLogoUrl) {
            setEditLogoUrl(res.brandLogoUrl);
            await refreshWorkspaces();
          }
        } catch (uploadErr: any) {
          console.error("Failed to upload brand logo:", uploadErr);
          setError(uploadErr?.message || "Gagal mengunggah logo ke storage");
        } finally {
          setIsUploadingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err?.message || "Gagal memproses file gambar");
      setIsUploadingLogo(false);
    }
  };

  // Update Workspace with Currency Security Audit
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
          customBrandLogo: editLogoUrl,
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
    } catch (err: any) {
      console.error("Failed to update workspace:", err);
      setError("Gagal memperbarui workspace. Pastikan koneksi backend aktif.");
    } finally {
      setUpdating(false);
    }
  };

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
        playSoftChime();
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
        playSoftChime();
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

  // ── TanStack Table Setup ──────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<LegacyColumnDef<Workspace>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Entitas & Identitas",
        cell: ({ row }) => {
          const ws = row.original;
          const config = TYPE_CONFIG[ws.type.toLowerCase()] || TYPE_CONFIG.personal;
          const Icon = config.icon;
          const isSelected = selectedWorkspace?.id === ws.id;

          return (
            <div className="flex items-center gap-3 py-1">
              {ws.customBrandLogo ? (
                <OptimizedImage
                  src={ws.customBrandLogo}
                  alt={ws.name}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-xl border border-default-200/80 dark:border-default-700/80 shadow-2xs shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0"
                  style={{ backgroundColor: config.color }}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground truncate">{ws.name}</span>
                  {isSelected && (
                    <Chip size="sm" variant="soft" color="success" className="text-[9.5px] h-4 font-bold">
                      Aktif
                    </Chip>
                  )}
                </div>
                <span className={`inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold border mt-0.5 ${config.badge}`}>
                  {config.label}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "currency",
        header: "Mata Uang",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-foreground border border-default-200/60 dark:border-default-700/60">
            {row.original.currency}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Pertumbuhan & MoM PnL",
        cell: ({ row }) => {
          const type = row.original.type.toLowerCase();
          const sparklineData = SPARKLINE_DATA[type] || SPARKLINE_DATA.personal;
          const growth = GROWTH_CONFIG[type] || GROWTH_CONFIG.personal;

          return (
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
                  {growth.pnl}
                </span>
                <span className="text-[9.5px] text-default-400">{growth.label}</span>
              </div>
              <MiniSparkline data={sparklineData} isPositive={true} />
            </div>
          );
        },
      },
      {
        id: "rbacStatus",
        header: "Akses & RBAC",
        cell: () => (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/70 dark:border-purple-800/70 px-2 py-0.5 rounded-lg">
            <Shield className="w-3 h-3 text-purple-500" />
            👑 Owner / Full
          </span>
        ),
      },
      {
        id: "actions",
        header: "Aksi Terintegrasi",
        cell: ({ row }) => {
          const ws = row.original;
          const isSelected = selectedWorkspace?.id === ws.id;

          return (
            <div className="flex items-center gap-1.5 justify-end">
              <Button
                size="sm"
                variant={isSelected ? "primary" : "outline"}
                onPress={() => handleSelectWorkspace(ws)}
                className="h-7.5 px-2.5 text-[11px] font-semibold cursor-pointer shadow-2xs"
              >
                {isSelected ? "Terpilih" : "Pilih"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onPress={(e) => handleOpenWallets(ws, e as any)}
                className="h-7.5 px-2.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white cursor-pointer shadow-2xs"
              >
                <Wallet className="w-3 h-3 mr-1" />
                Wallets
              </Button>
              <Button
                size="sm"
                variant="outline"
                isIconOnly
                onPress={(e) => handleOpenEdit(ws, e as any)}
                className="h-7.5 w-7.5 border-default-200 dark:border-default-700 text-default-600 cursor-pointer shadow-2xs"
                aria-label="Edit Workspace"
              >
                <Edit3 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                isIconOnly
                onPress={() => setAiAuditWorkspace(ws)}
                className="h-7.5 w-7.5 border-purple-200 dark:border-purple-800 text-purple-600 cursor-pointer shadow-2xs"
                aria-label="Audit AI Workspace"
              >
                <Sparkles className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                isIconOnly
                onPress={() => {
                  setDeleteWorkspaceId(ws.id);
                  setShowDeleteModal(true);
                }}
                className="h-7.5 w-7.5 border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 cursor-pointer shadow-2xs"
                aria-label="Hapus Workspace"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          );
        },
      },
    ],
    [selectedWorkspace]
  );

  const table = useLegacyTable({
    data: filteredWorkspaces,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 6,
      },
    },
  });

  // AI Structure Preset Suggestions
  const AI_PRESETS: Record<
    string,
    {
      name: string;
      jargon: string;
      type: "personal" | "umkm" | "pt";
      currency: string;
      wallets: string[];
      advice: string;
    }
  > = {
    agency: {
      name: "PT Nova Solusi Kreatif",
      jargon: "Digital Agency & Software House Core",
      type: "pt",
      currency: "IDR",
      wallets: ["Bank Mandiri Operasional", "BCA Penampung Client", "Dana Cadangan Pajak"],
      advice: "Pisahkan rekening penampung invoice client dengan rekening gaji dan operasional harian.",
    },
    fnb: {
      name: "Kedai Kopi Makmur Nusantara",
      jargon: "F&B Retail & Quick Service Restaurant",
      type: "umkm",
      currency: "IDR",
      wallets: ["BCA QRIS Kasir", "Kas Tunai Toko", "Dana Bahan Baku Supplier"],
      advice: "Lakukan settlement QRIS harian ke rekening khusus supplier untuk menghindari kebocoran modal.",
    },
    freelance: {
      name: "Studio Desain & Konsultasi",
      jargon: "Independent Creator & Global Freelance",
      type: "personal",
      currency: "USD",
      wallets: ["PayPal / Stripe USD", "Wise Multi-Currency", "Rekening Pribadi IDR"],
      advice: "Pertahankan mata uang USD untuk invoicing internasional sebelum dikonversi ke tabungan pribadi.",
    },
    holding: {
      name: "PT Nova Capital Nusantara",
      jargon: "Corporate Holding & Portfolio Assets",
      type: "pt",
      currency: "IDR",
      wallets: ["Rekening Giro Induk", "Vault Investasi Obligasi", "Cadangan Dividen"],
      advice: "Terapkan persetujuan berjenjang pada RBAC dan pastikan dividen tercatat di rekening terisolasi.",
    },
  };

  const currentPreset = AI_PRESETS[aiSelectedIndustry] || AI_PRESETS.agency;

  return (
    <div className="min-h-screen bg-default-50/70 dark:bg-gray-950 p-4 md:p-6 lg:p-8 space-y-6 text-foreground">
      {/* ── 1. Header Bar: 1 Row Title, 1 Row Buttons ─────────────────── */}
      <div className="space-y-4 border-b border-default-200/80 dark:border-default-800/80 pb-5">
        {/* Row 1: H1 & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Multi-Workspace & Entity Hub
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                Granular Isolation
              </span>
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Pemisahan tegas antara pembukuan pribadi, UMKM, dan korporat PT dengan isolasi data terenkripsi.
            </p>
          </div>
        </div>

        {/* Row 2: Controls (Left) and Actions (Far Right) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Controls: View Mode & Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Grid vs Tabel */}
            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("dnd")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "dnd"
                    ? "text-white shadow-2xs font-bold"
                    : "text-default-500 hover:text-foreground"
                }`}
                style={
                  viewMode === "dnd"
                    ? { backgroundColor: "var(--primary-color)", color: "#ffffff" }
                    : undefined
                }
                title="Tampilan Grid Kartu (Drag-and-Drop)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid Kartu</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "text-white shadow-2xs font-bold"
                    : "text-default-500 hover:text-foreground"
                }`}
                style={
                  viewMode === "table"
                    ? { backgroundColor: "var(--primary-color)", color: "#ffffff" }
                    : undefined
                }
                title="Tampilan Daftar Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Daftar Tabel</span>
              </button>
            </div>

            {/* RBAC Info Button */}
            <Button
              size="sm"
              variant="outline"
              onPress={() => setShowRbacModal(true)}
              className="h-9 px-3 text-xs font-semibold bg-white dark:bg-gray-900 border-default-200 dark:border-default-700 text-default-700 dark:text-default-300 hover:bg-default-50 cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              <span>Kelola RBAC</span>
            </Button>

            {/* Kas & Rekening Bank Shortcut */}
            <Link
              href="/wallets"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-default-50 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 shadow-2xs transition cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" style={{ color: "var(--primary-color)" }} />
              <span>Kas & Rekening</span>
            </Link>
          </div>

          {/* Far Right: AI Advisor & Tambah Workspace */}
          <div className="flex items-center gap-2 ml-auto">
            {/* AI Entity Advisor Button with Premium Gradient */}
            <Button
              size="sm"
              onPress={() => setShowAiAdvisorModal(true)}
              className="h-9 px-3.5 text-xs font-bold bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 hover:opacity-95 active:scale-95 transition-all border border-purple-400/30 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300 animate-pulse" />
              <span>AI Entity Advisor</span>
            </Button>

            {/* Create Workspace Button */}
            <Button
              size="sm"
              variant="primary"
              onPress={() => {
                setError("");
                setShowCreateModal(true);
              }}
              className="h-9 px-4 text-xs font-semibold text-white cursor-pointer shadow-xs hover:opacity-95 active:scale-95 transition-all"
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Tambah Workspace</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-500 hover:opacity-75 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 2. Top Summary KPI Cards (High Contrast Surface) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workspaces */}
        <Card className="p-4.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">
              Total Entitas
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground">{workspaces.length}</span>
            <span className="text-xs text-blue-600 font-mono font-semibold">Tersinkronisasi</span>
          </div>
          <p className="mt-2 text-xs text-default-500">Personal, UMKM & PT aktif terisolasi</p>
        </Card>

        {/* Selected Active Workspace */}
        <Card className="p-4.5 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 bg-white dark:bg-gray-900 shadow-2xs ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">
              Entitas Aktif
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            {selectedWorkspace?.customBrandLogo && (
              <OptimizedImage
                src={selectedWorkspace.customBrandLogo}
                alt="Logo"
                width={28}
                height={28}
                className="w-7 h-7 rounded-lg border border-default-200 shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-foreground truncate">
                {selectedWorkspace?.name || "Belum dipilih"}
              </h3>
              <span className="inline-block text-[10.5px] font-semibold text-emerald-600 uppercase font-mono">
                {selectedWorkspace?.type || "N/A"} • {selectedWorkspace?.currency || "IDR"}
              </span>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-default-400">Semua ledger & transaksi merujuk ke sini</p>
        </Card>

        {/* Multi-Entity Segregation Health */}
        <Card className="p-4.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">
              Isolasi Keuangan
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">100% Terisolasi</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-semibold border border-purple-500/20">
              Zero Commingling
            </span>
          </div>
          <p className="mt-2 text-xs text-default-500">Mencegah percampuran kas pribadi & usaha</p>
        </Card>

        {/* Master Wallets Shortcut */}
        <Card className="p-4.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-default-500 uppercase tracking-wider">
                Pusat Kas & Wallets
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-default-500 mt-2">
              Kelola rekening bank, e-wallet, dan likuiditas per entitas.
            </p>
          </div>
          <Link
            href="/wallets"
            className="mt-3 w-full py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <span>Buka Kas & Rekening</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
          </Link>
        </Card>
      </div>

      {/* ── 3. Filter Bar (High Contrast Surface) ─────────────────────── */}
      <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-default-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari entitas, nama workspace, atau mata uang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-default-50 dark:bg-default-800/80 border border-default-200 dark:border-default-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-foreground placeholder:text-default-400 shadow-2xs transition"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {["all", "personal", "umkm", "pt"].map((type) => {
              const isSelected = typeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer shadow-2xs ${
                    isSelected
                      ? "text-white shadow-xs font-bold border-transparent"
                      : "bg-white dark:bg-default-800/80 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-700 dark:text-default-300"
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                          color: "#ffffff",
                        }
                      : undefined
                  }
                >
                  {type === "all"
                    ? "Semua Entitas"
                    : type === "personal"
                    ? "Personal"
                    : type === "umkm"
                    ? "UMKM (Usaha)"
                    : "PT (Korporat)"}
                </button>
              );
            })}
          </div>

          {viewMode === "dnd" && (
            <div className="hidden lg:flex items-center gap-1 text-xs text-default-400 font-mono">
              <GripVertical className="w-3.5 h-3.5" />
              <span>Drag kartu untuk mengatur urutan prioritas</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── 4. Main View: DnD Cards vs TanStack Table ─────────────────── */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-default-500 mt-3 text-xs">Memuat entitas workspace...</p>
        </div>
      ) : filteredWorkspaces.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-default-200/80 dark:border-default-800 rounded-2xl space-y-3 bg-white dark:bg-gray-900 shadow-2xs">
          <Building2 className="w-10 h-10 text-default-300 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Tidak ada workspace ditemukan</h3>
          <p className="text-xs text-default-500 max-w-sm mx-auto">
            {searchQuery
              ? "Coba sesuaikan kata kunci pencarian atau reset filter."
              : "Buat workspace pertama Anda untuk mulai mengelola pembukuan."}
          </p>
          <Button
            size="sm"
            variant="primary"
            onPress={() => setShowCreateModal(true)}
            className="mt-2 bg-blue-600 text-white text-xs font-semibold"
          >
            + Buat Workspace
          </Button>
        </Card>
      ) : viewMode === "dnd" ? (
        /* ── View Mode 1: Drag & Drop Cards ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkspaces.map((workspace: Workspace) => {
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
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 relative select-none group shadow-2xs ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/15 dark:bg-blue-950/20"
                    : "border-default-200/80 dark:border-default-800 hover:border-default-300 hover:shadow-xs"
                } ${isOver ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/20" : ""}`}
              >
                {/* Top header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Drag handle */}
                    <div className="text-default-300 group-hover:text-default-500 transition cursor-grab shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Brand Logo / Type Icon with Square Aspect Ratio */}
                    {workspace.customBrandLogo ? (
                      <OptimizedImage
                        src={workspace.customBrandLogo}
                        alt={workspace.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-xl border border-default-200/80 dark:border-default-700/80 shadow-2xs shrink-0"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0"
                        style={{ backgroundColor: config.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-blue-600 transition truncate">
                        {workspace.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${config.badge}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Edit, AI Audit & Delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(workspace, e)}
                      title="Edit rincian & foto workspace"
                      className="p-1.5 text-default-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAiAuditWorkspace(workspace);
                      }}
                      title="Audit Diagnostik Keuangan AI"
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
                      className="p-1.5 text-default-400 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition active:scale-95 cursor-pointer"
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
                <div className="mt-3 p-2.5 rounded-xl bg-default-50 dark:bg-default-800/60 border border-default-100 dark:border-default-800 flex items-center justify-between">
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
                  <span>
                    Mata Uang: <strong className="text-foreground">{workspace.currency}</strong>
                  </span>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-blue-600 font-bold text-[11px]">
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
                    className="py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-600 text-blue-700 dark:text-blue-300 hover:text-white border border-blue-200/70 dark:border-blue-800/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
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
                    className="py-2 px-3 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-800 dark:text-default-200 border border-default-200 dark:border-default-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Activity className="w-3.5 h-3.5 text-default-500 shrink-0" />
                    <span>Transaksi</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ── View Mode 2: TanStack Table ── */
        <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                {table.getHeaderGroups().map((headerGroup: any) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-default-200/80 dark:border-default-800 bg-default-50/80 dark:bg-default-900/50 text-default-600 font-semibold"
                  >
                    {headerGroup.headers.map((header: any) => (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="py-3 px-4 text-left cursor-pointer select-none hover:text-foreground transition"
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc"
                            ? " 🔼"
                            : header.column.getIsSorted() === "desc"
                            ? " 🔽"
                            : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row: any) => (
                  <tr
                    key={row.id}
                    className="border-b border-default-100 dark:border-default-800/60 hover:bg-default-50/60 dark:hover:bg-default-800/40 transition-colors"
                  >
                    {row.getVisibleCells().map((cell: any) => (
                      <td key={cell.id} className="py-2.5 px-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-3 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs text-default-500">
            <span>
              Menampilkan {table.getRowModel().rows.length} dari {filteredWorkspaces.length} entitas
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                isDisabled={!table.getCanPreviousPage()}
                onPress={() => table.previousPage()}
                className="h-7.5 px-2.5 text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
                Sebelumnya
              </Button>
              <span className="font-mono font-semibold">
                Hal {table.getState().pagination.pageIndex + 1} dari {table.getPageCount() || 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                isDisabled={!table.getCanNextPage()}
                onPress={() => table.nextPage()}
                className="h-7.5 px-2.5 text-[11px]"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── 5. Create Workspace Modal (with Clean Select Chevron) ──────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Buat Workspace Baru</h2>
                  <p className="text-xs text-default-500">Konfigurasikan entitas keuangan terisolasi</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-default-400 hover:text-foreground rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold mb-1 block text-foreground">
                  Nama Workspace / Perusahaan *
                </label>
                <input
                  type="text"
                  placeholder="Misal: Keuangan Pribadi, Toko Makmur, PT Nova Teknologi"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                  autoFocus
                />
              </div>

              {/* Entity Type Select with Centered Chevron */}
              <div>
                <label className="font-semibold mb-1 block text-foreground">Tipe Entitas</label>
                <div className="relative">
                  <select
                    value={newWorkspaceType}
                    onChange={(e) => setNewWorkspaceType(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium appearance-none cursor-pointer"
                  >
                    <option value="personal">Personal Finance (Pribadi / Rumah Tangga)</option>
                    <option value="umkm">UMKM (Bisnis & Usaha Dagang/Jasa)</option>
                    <option value="pt">PT / Korporat (Entitas Badan Hukum Berjenjang)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-default-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Currency Select with Centered Chevron */}
              <div>
                <label className="font-semibold mb-1 block text-foreground">Mata Uang Utama</label>
                <div className="relative">
                  <select
                    value={newWorkspaceCurrency}
                    onChange={(e) => setNewWorkspaceCurrency(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono font-medium appearance-none cursor-pointer"
                  >
                    <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="SGD">SGD - Singapore Dollar (S$)</option>
                    <option value="JPY">JPY - Japanese Yen (¥)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-default-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating || !newWorkspaceName.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 disabled:opacity-50 transition cursor-pointer active:scale-95"
                >
                  {creating ? "Membuat..." : "Simpan & Buat Workspace"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── 6. Edit Workspace Modal (with Photo Upload & Currency Guard) ── */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Edit Workspace & Brand Logo</h2>
                  <p className="text-xs text-default-500">Perbarui identitas, logo, dan konfigurasi entitas</p>
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
              {/* Photo / Brand Logo Upload (Square Crop) */}
              <div>
                <label className="font-semibold mb-1.5 block text-foreground">
                  Foto / Logo Profil Entitas (Rasio Square)
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-default-50 dark:bg-default-800/60 border border-default-200 dark:border-default-700">
                  {editLogoUrl ? (
                    <OptimizedImage
                      src={editLogoUrl}
                      alt="Brand Logo"
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl border border-default-200/80 dark:border-default-700/80 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={isUploadingLogo}
                      onPress={() => logoInputRef.current?.click()}
                      className="h-8 px-3 text-[11px] font-semibold bg-white dark:bg-gray-800 border-default-200 dark:border-default-700 text-foreground cursor-pointer shadow-2xs"
                    >
                      {isUploadingLogo ? (
                        <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin text-blue-500" />
                      ) : (
                        <UploadCloud className="w-3.5 h-3.5 mr-1 text-blue-500" />
                      )}
                      <span>{editLogoUrl ? "Ganti Foto" : "Unggah Logo"}</span>
                    </Button>
                    <p className="text-[10px] text-default-400 mt-1">
                      PNG, JPG, WebP. Dipotong rasio 1:1 otomatis.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name input */}
              <div>
                <label className="font-semibold mb-1 block text-foreground">Nama Workspace *</label>
                <input
                  type="text"
                  placeholder="Nama workspace"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  required
                />
              </div>

              {/* Entity Type Select */}
              <div>
                <label className="font-semibold mb-1 block text-foreground">Tipe Entitas</label>
                <div className="relative">
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium appearance-none cursor-pointer"
                  >
                    <option value="personal">Personal Finance (Pribadi / Rumah Tangga)</option>
                    <option value="umkm">UMKM (Bisnis & Usaha Dagang/Jasa)</option>
                    <option value="pt">PT / Korporat (Entitas Badan Hukum Berjenjang)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-default-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Currency Select with Security Notice */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold block text-foreground">Mata Uang Dasar</label>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Audit Dilindungi
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-10 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono font-medium appearance-none cursor-pointer"
                  >
                    <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="SGD">SGD - Singapore Dollar (S$)</option>
                    <option value="JPY">JPY - Japanese Yen (¥)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-default-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10.5px] text-default-400 mt-1 leading-relaxed">
                  * Jika entitas telah memiliki riwayat transaksi, perubahan mata uang dicegah untuk menjaga integritas nominal historis.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setEditingWorkspace(null)}
                  disabled={updating}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating || !editName.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 disabled:opacity-50 transition cursor-pointer active:scale-95"
                >
                  {updating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── 7. AI Workspace Advisor & Architect Modal ─────────────────── */}
      {showAiAdvisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800/80 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI Workspace Advisor & Architect</h3>
                  <p className="text-xs text-default-500">
                    Rekomendasi struktur entitas, segregasi akun, dan mata uang optimal
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiAdvisorModal(false)}
                className="p-1 text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Industry Selector Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-default-500 block">Pilih Model Bisnis / Industri:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "agency", label: "Software House / Agency" },
                  { id: "fnb", label: "F&B / Toko Retail" },
                  { id: "freelance", label: "Global Freelance / Kreator" },
                  { id: "holding", label: "Holding & Manajemen Aset" },
                ].map((ind) => (
                  <button
                    key={ind.id}
                    type="button"
                    onClick={() => setAiSelectedIndustry(ind.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                      aiSelectedIndustry === ind.id
                        ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                        : "bg-default-50 dark:bg-default-800 border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Recommendation Card */}
            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 tracking-wider block">
                    Usulan Nama Entitas
                  </span>
                  <p className="font-bold text-sm text-foreground">{currentPreset.name}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-mono">
                  {currentPreset.currency} • {currentPreset.type.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-default-500 tracking-wider block">
                  Rekomendasi Rekening Awal (Chart of Accounts):
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentPreset.wallets.map((w) => (
                    <span
                      key={w}
                      className="px-2 py-0.5 rounded bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 text-[10.5px] font-medium text-foreground"
                    >
                      🏦 {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 dark:bg-gray-900/80 border border-default-200/60 dark:border-default-700/60">
                <span className="font-bold text-purple-700 dark:text-purple-300 text-[11px] block mb-0.5">
                  💡 Rekomendasi Isolasi Pajak & Risiko:
                </span>
                <p className="text-[11px] text-default-600 leading-relaxed">{currentPreset.advice}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-default-100 dark:border-default-800">
              <Button
                size="sm"
                variant="outline"
                onPress={() => setShowAiAdvisorModal(false)}
                className="text-xs"
              >
                Tutup
              </Button>
              <Button
                size="sm"
                variant="primary"
                onPress={() => {
                  setNewWorkspaceName(currentPreset.name);
                  setNewWorkspaceType(currentPreset.type);
                  setNewWorkspaceCurrency(currentPreset.currency);
                  setShowAiAdvisorModal(false);
                  setShowCreateModal(true);
                }}
                className="text-xs bg-purple-600 text-white font-semibold shadow-xs"
              >
                Terapkan ke Form Workspace &rarr;
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── 8. RBAC Architecture Explanation Modal ────────────────────── */}
      {showRbacModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Tata Kelola Akses & RBAC Workspace
                  </h3>
                  <p className="text-xs text-default-500">
                    Cara mengatur izin anggota tim di setiap entitas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRbacModal(false)}
                className="p-1 text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-default-600">
              <p className="leading-relaxed">
                Di NovaJournal, setiap workspace memiliki tabel kolaborator terisolasi (
                <code className="px-1.5 py-0.5 rounded bg-default-100 text-foreground font-mono text-[10.5px]">
                  collaborators
                </code>
                ). Pengaturan anggota dan role dilakukan di menu <strong>Users & Tim</strong>:
              </p>

              <div className="space-y-1.5 pt-1">
                {[
                  {
                    role: "👑 Owner (Pemilik)",
                    desc: "Akses mutlak: membuat/menghapus workspace, mengelola rekening, billing, serta transfer kepemilikan.",
                    color: "text-amber-600 dark:text-amber-400",
                  },
                  {
                    role: "🛡️ Admin (Pengelola)",
                    desc: "Mengelola rekening bank, mengundang anggota tim, menyetujui transaksi besar, dan mencetak laporan keuangan.",
                    color: "text-blue-600 dark:text-blue-400",
                  },
                  {
                    role: "✍️ Staff / Operator",
                    desc: "Hanya dapat mencatat transaksi harian, mengunggah struk/dokumen, tidak dapat mengubah konfigurasi workspace.",
                    color: "text-emerald-600 dark:text-emerald-400",
                  },
                  {
                    role: "👁️ Member / Viewer",
                    desc: "Hanya memiliki akses lihat (read-only) ke ringkasan kas dan analitik tanpa izin modifikasi.",
                    color: "text-default-500",
                  },
                ].map((r) => (
                  <div key={r.role} className="p-2.5 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60">
                    <span className={`font-bold text-xs ${r.color}`}>{r.role}</span>
                    <p className="text-[11px] text-default-500 mt-0.5 leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-default-100 dark:border-default-800">
              <Button
                size="sm"
                variant="outline"
                onPress={() => setShowRbacModal(false)}
                className="text-xs"
              >
                Tutup
              </Button>
              <Link
                href="/users"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition"
              >
                Buka Pengaturan Users & RBAC &rarr;
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* ── 9. Delete Confirmation Modal ──────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-3">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Hapus Workspace
            </h2>
            <p className="text-xs text-default-500">
              Apakah Anda yakin ingin menghapus workspace ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus seluruh jurnal transaksi yang terasosiasi.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-default-100 dark:border-default-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-3 py-1.5 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteWorkspace}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-sm shadow-rose-600/30 disabled:opacity-50 cursor-pointer"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus Workspace"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ── 10. AI Multi-Entity Diagnostic Modal ──────────────────────── */}
      {aiAuditWorkspace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
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
                className="p-1 text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    Isolasi Kas Bersih (Commingling: Clean)
                  </p>
                  <p className="text-default-500 text-[11px] mt-0.5">
                    Entitas ini terisolasi secara disiplin di database dengan UUID unik. Tidak ada transaksi tercampur antara kebutuhan privat dan operasional.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/60 border border-default-200 dark:border-default-700 space-y-1.5">
                <div className="flex items-center justify-between font-medium">
                  <span>Skor Kepatuhan & Kesiapan Pajak:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">92 / 100</span>
                </div>
                <div className="w-full bg-default-200 dark:bg-default-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "92%" }} />
                </div>
                <p className="text-[11px] text-default-400">
                  Kategori pemasukan dan pengeluaran tersusun rapi untuk pelaporan tahunan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1">
                <span className="font-bold text-purple-600 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Zap className="w-3 h-3" /> Rekomendasi Cerdas AI:
                </span>
                <p className="text-default-600 dark:text-default-300 text-[11px] leading-relaxed">
                  Hubungkan minimal 2 rekening terpisah di tab <strong>Wallets</strong> (1 Rekening Operasional Harian + 1 Rekening Cadangan Pajak / Dana Darurat) untuk menjaga rasio likuiditas tetap prima.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-default-100 dark:border-default-800">
              <button
                type="button"
                onClick={() => {
                  const ws = aiAuditWorkspace;
                  setAiAuditWorkspace(null);
                  handleOpenWallets(ws, {} as any);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Buka Wallets Entitas Ini</span>
              </button>

              <button
                type="button"
                onClick={() => setAiAuditWorkspace(null)}
                className="px-3.5 py-1.5 rounded-xl bg-default-100 hover:bg-default-200 text-foreground font-medium text-xs cursor-pointer"
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
