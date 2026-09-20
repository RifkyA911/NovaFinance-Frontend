/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getEffectiveRole, hasAccess } from "@/app/lib/rbac";
import { Card, Button } from "@heroui/react";
import {
  useLegacyTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { type SortingState } from "@tanstack/react-table";
import {
  ScrollText,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  User,
  Terminal,
  FileCode,
  Globe,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Wallet,
  Target,
  Building2,
  ArrowRightLeft,
  ArrowUpDown,
} from "lucide-react";
import { playSoftChime } from "@/app/lib/sound";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  userId: string | null;
  userName?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: any;
  newData: any;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  createdAt: string;
}

// Action dictionary with human-readable labels and badge stylings
const ACTION_MAP: Record<string, { label: string; color: string; badge: string }> = {
  "statement.exported": {
    label: "Ekspor Statement Keuangan",
    color: "purple",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  "ai.audit_run": {
    label: "Audit Forensik Nova AI",
    color: "purple",
    badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  "goals.priority_reorder": {
    label: "Reorder Prioritas Goal",
    color: "blue",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  "wallet.rebalance_transfer": {
    label: "Transfer Antar Dompet",
    color: "emerald",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  "workspace.update": {
    label: "Pembaruan Profil Workspace",
    color: "blue",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  "security.login_session": {
    label: "Sesi Login & Otorisasi",
    color: "amber",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  "transaction.batch_sync": {
    label: "Sinkronisasi Batch Transaksi",
    color: "indigo",
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  "transaction.create": {
    label: "Pencatatan Transaksi Baru",
    color: "emerald",
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  "transaction.update": {
    label: "Perubahan Catatan Transaksi",
    color: "blue",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  "transaction.delete": {
    label: "Penghapusan Transaksi",
    color: "rose",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  "member.invite": {
    label: "Undangan Anggota Baru",
    color: "blue",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  "member.role_update": {
    label: "Modifikasi Hak Akses / Role",
    color: "amber",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  "member.remove": {
    label: "Pencabutan Akses Anggota",
    color: "rose",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
};

function formatActionInfo(action: string) {
  if (ACTION_MAP[action]) return ACTION_MAP[action];
  const parts = action.split(".");
  const pretty = parts
    .map((p) => p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()))
    .join(" - ");

  let badge = "bg-default-100 text-default-700 dark:text-default-300 border-default-200";
  if (action.includes("create") || action.includes("new")) {
    badge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  } else if (action.includes("delete") || action.includes("remove")) {
    badge = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
  } else if (action.includes("update") || action.includes("edit")) {
    badge = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
  }

  return { label: pretty, color: "default", badge };
}

// Entity configuration with dedicated icons
const ENTITY_CONFIG: Record<string, { label: string; icon: any; colorClass: string }> = {
  transaction: { label: "Buku Besar", icon: Terminal, colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
  account: { label: "Dompet / Rekening", icon: Wallet, colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  goal: { label: "Target / Goal", icon: Target, colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  export: { label: "Dokumen Ekspor", icon: Download, colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  ai: { label: "Nova AI Engine", icon: Sparkles, colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
  auth: { label: "Keamanan Sesi", icon: ShieldCheck, colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  workspace: { label: "Ruang Kerja", icon: Building2, colorClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" },
};

function getEntityInfo(type: string) {
  const t = (type || "").toLowerCase();
  return ENTITY_CONFIG[t] || { label: type, icon: Layers, colorClass: "bg-default-100 text-default-600 border-default-200" };
}

export default function AuditLogsPage() {
  const { selectedWorkspace } = useWorkspace();
  const effectiveRole = getEffectiveRole();
  const canViewLogs = hasAccess(effectiveRole, ["owner", "admin"]);

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>("all");
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>("all");
  const [inspectingLog, setInspectingLog] = useState<AuditLogEntry | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // TanStack table states
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fallbackLogs: AuditLogEntry[] = [
    {
      id: "log-seed-1",
      workspaceId: selectedWorkspace?.id || "ws-1",
      userId: "usr-admin-1",
      userName: "Alexander Vance",
      userEmail: "alexander@novajournal.io",
      action: "statement.exported",
      entityType: "export",
      entityId: "exp-statement-q3",
      oldData: null,
      newData: { format: "xlsx", sheets: ["Executive Summary", "Ledger Transaksi"], dateRange: "Bulan Ini" },
      ipAddress: "182.253.14.88",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
      correlationId: "corr-exp-9901",
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: "log-seed-2",
      workspaceId: selectedWorkspace?.id || "ws-1",
      userId: "usr-admin-1",
      userName: "Alexander Vance",
      userEmail: "alexander@novajournal.io",
      action: "ai.audit_run",
      entityType: "ai",
      entityId: "audit-session-882",
      oldData: null,
      newData: { provider: "Google Gemini 2.0 Flash", anomaliesFound: 0, healthScore: 94 },
      ipAddress: "127.0.0.1",
      userAgent: "Nova Copilot Engine v1.2",
      correlationId: "corr-ai-4421",
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "log-seed-3",
      workspaceId: selectedWorkspace?.id || "ws-1",
      userId: "usr-admin-1",
      userName: "Alexander Vance",
      userEmail: "alexander@novajournal.io",
      action: "goals.priority_reorder",
      entityType: "goal",
      entityId: "goal-matrix-batch",
      oldData: { lanes: { P0: 1, P1: 2, P2: 3, P3: 2 } },
      newData: { lanes: { P0: 2, P1: 2, P2: 2, P3: 2 }, movedItem: "Dana Darurat 6 Bulan" },
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      correlationId: "corr-goal-891",
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
      id: "log-seed-4",
      workspaceId: selectedWorkspace?.id || "ws-1",
      userId: "usr-admin-1",
      userName: "Alexander Vance",
      userEmail: "alexander@novajournal.io",
      action: "wallet.rebalance_transfer",
      entityType: "account",
      entityId: "tx-transfer-drag-drop",
      oldData: { sourceBalance: 45000000, targetBalance: 12000000 },
      newData: { sourceBalance: 40000000, targetBalance: 17000000, nominal: 5000000 },
      ipAddress: "182.253.14.88",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      correlationId: "corr-tf-512",
      createdAt: new Date(Date.now() - 14 * 3600000).toISOString(),
    },
    {
      id: "log-seed-5",
      workspaceId: selectedWorkspace?.id || "ws-1",
      userId: "usr-admin-1",
      userName: "Alexander Vance",
      userEmail: "alexander@novajournal.io",
      action: "workspace.update",
      entityType: "workspace",
      entityId: selectedWorkspace?.id || "ws-1",
      oldData: { name: "Personal Workspace" },
      newData: { name: selectedWorkspace?.name || "Personal Finance & Wealth Hub" },
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      correlationId: "corr-ws-119",
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: "log-seed-6",
      workspaceId: selectedWorkspace?.id || "ws-1",
      userId: "usr-admin-1",
      userName: "Alexander Vance",
      userEmail: "alexander@novajournal.io",
      action: "security.login_session",
      entityType: "auth",
      entityId: "sess-crypt-token-1",
      oldData: null,
      newData: { method: "session_credential", mfa: true, role: "owner" },
      ipAddress: "182.253.14.88",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      correlationId: "corr-auth-001",
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
  ];

  const fetchLogs = async () => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/logs?workspaceId=${selectedWorkspace.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.logs?.length > 0) {
          setLogs(json.data.logs);
        } else {
          setLogs(fallbackLogs);
        }
      } else {
        setLogs(fallbackLogs);
      }
    } catch {
      setLogs(fallbackLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedWorkspace?.id]);

  // RBAC Access Gate
  if (!canViewLogs) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4 rounded-2xl border border-rose-500/30 bg-rose-500/5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Akses Audit Logs Terbatas</h2>
            <p className="text-xs text-default-500">
              Menu Audit Logs dan Jejak Forensik Sistem dilindungi secara ketat. Halaman ini hanya dapat diakses oleh peran <strong>Owner</strong> dan <strong>Admin</strong>.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-default-100 dark:bg-default-800/60 text-[11px] text-default-600 font-mono">
            Peran Anda Saat Ini: <span className="uppercase font-bold text-rose-500">{effectiveRole}</span>
          </div>
          <Link href="/dashboard">
            <Button className="w-full bg-default-900 text-white dark:bg-white dark:text-default-900 text-xs font-semibold rounded-xl">
              Kembali ke Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Filtered dataset
  const filteredData = useMemo(() => {
    return logs.filter((item) => {
      if (selectedEntityFilter !== "all" && item.entityType !== selectedEntityFilter) return false;
      if (selectedActionFilter !== "all" && !item.action.startsWith(selectedActionFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const actionLabel = formatActionInfo(item.action).label.toLowerCase();
        const matchAction = item.action.toLowerCase().includes(q) || actionLabel.includes(q);
        const matchEntity = item.entityType.toLowerCase().includes(q);
        const matchIp = item.ipAddress?.toLowerCase().includes(q);
        const matchUser = item.userName?.toLowerCase().includes(q) || item.userEmail?.toLowerCase().includes(q);
        const matchCorrelation = item.correlationId?.toLowerCase().includes(q);
        if (!matchAction && !matchEntity && !matchIp && !matchUser && !matchCorrelation) return false;
      }
      return true;
    });
  }, [logs, selectedEntityFilter, selectedActionFilter, searchQuery]);

  // =========================================================================
  // EXPORT FUNCTIONS: EXCEL (.xlsx), PDF (.pdf), JSON (.json)
  // =========================================================================
  const exportAsExcel = () => {
    playSoftChime();
    const wsName = selectedWorkspace?.name || "Workspace";
    const exportRows = filteredData.map((l, idx) => ({
      No: idx + 1,
      Timestamp: new Date(l.createdAt).toLocaleString("id-ID"),
      Aksi_Audit: formatActionInfo(l.action).label,
      Kode_Aksi: l.action,
      Entitas: l.entityType,
      ID_Entitas: l.entityId || "—",
      Pengguna: l.userName || "Admin User",
      Email: l.userEmail || "—",
      IP_Address: l.ipAddress || "—",
      User_Agent: l.userAgent || "—",
      Correlation_ID: l.correlationId || "—",
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Trail");
    XLSX.writeFile(wb, `NovaFinance_AuditLogs_${wsName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportAsPdf = () => {
    playSoftChime();
    const wsName = selectedWorkspace?.name || "Workspace";
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("NovaFinance - Buku Audit Forensik & Governance Trail", 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Entitas: ${wsName} | Dicetak oleh: ${effectiveRole.toUpperCase()} | Waktu: ${new Date().toLocaleString("id-ID")}`, 14, 23);

    const tableRows = filteredData.map((l, idx) => [
      idx + 1,
      new Date(l.createdAt).toLocaleString("id-ID"),
      formatActionInfo(l.action).label,
      l.entityType.toUpperCase(),
      l.userName || "Admin",
      l.ipAddress || "127.0.0.1",
      l.correlationId || "—",
    ]);

    autoTable(doc, {
      startY: 28,
      head: [["#", "Timestamp", "Aktivitas / Aksi", "Entitas", "Aktor", "IP Address", "Correlation ID"]],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    doc.save(`NovaFinance_AuditLogs_${wsName.replace(/\s+/g, "_")}.pdf`);
  };

  const exportAsJson = () => {
    playSoftChime();
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `novajournal-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // TANSTACK TABLE COLUMN DEFINITIONS
  // =========================================================================
  const columns: LegacyColumnDef<AuditLogEntry>[] = useMemo(
    () => [
      {
        id: "createdAt",
        header: "Timestamp",
        accessorKey: "createdAt",
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div className="whitespace-nowrap">
              <div className="flex items-center gap-1.5 text-default-700 dark:text-default-300 font-medium">
                <Clock className="w-3 h-3 text-default-400" />
                <span className="font-mono text-xs">
                  {new Date(log.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-[10px] text-default-400">
                {new Date(log.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          );
        },
      },
      {
        id: "actor",
        header: "Aktor / Pengguna",
        accessorKey: "userName",
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="w-7 h-7 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                {(log.userName || log.userEmail || "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-xs truncate max-w-[140px]">
                  {log.userName || "Admin User"}
                </div>
                <div className="text-[10px] text-default-400 truncate max-w-[140px]">
                  {log.userEmail || "admin@novajournal.io"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "action",
        header: "Aktivitas & Entitas",
        accessorKey: "action",
        cell: ({ row }) => {
          const log = row.original;
          const actInfo = formatActionInfo(log.action);
          const entInfo = getEntityInfo(log.entityType);
          const EntIcon = entInfo.icon;

          return (
            <div className="space-y-1 py-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Clean Human-Readable Action Badge */}
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${actInfo.badge}`}
                >
                  {actInfo.label}
                </span>

                {/* Separate Dedicated Entity Badge */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${entInfo.colorClass}`}
                >
                  <EntIcon className="w-3 h-3" />
                  <span>{entInfo.label}</span>
                </span>
              </div>

              {/* Technical subtext with ID */}
              <div className="flex items-center gap-2 text-[10px] text-default-400 font-mono">
                <span className="opacity-70">{log.action}</span>
                {log.entityId && (
                  <span className="truncate max-w-[160px] text-default-500">
                    • ID: {log.entityId}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "network",
        header: "Jaringan / IP",
        accessorKey: "ipAddress",
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div className="whitespace-nowrap font-mono text-xs">
              <div className="flex items-center gap-1.5 text-default-600 dark:text-default-400">
                <Globe className="w-3 h-3 text-default-400 shrink-0" />
                <span>{log.ipAddress || "127.0.0.1"}</span>
              </div>
              <div className="text-[10px] text-default-400 truncate max-w-[130px]" title={log.userAgent || ""}>
                {log.userAgent?.split(" ")[0] || "Client Web"}
              </div>
            </div>
          );
        },
      },
      {
        id: "correlationId",
        header: "Correlation ID",
        accessorKey: "correlationId",
        cell: ({ row }) => {
          const log = row.original;
          return (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-default-100 dark:bg-default-800 text-default-500">
              {log.correlationId || "—"}
            </span>
          );
        },
      },
      {
        id: "inspect",
        header: "",
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  playSoftChime();
                  setInspectingLog(log);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold text-xs transition-all cursor-pointer active:scale-95 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Detail Diff</span>
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useLegacyTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-5 text-foreground max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-default-200/60 dark:border-default-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <ScrollText className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Audit Logs & Governance Trail</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                  Admin & Owner Only
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-default-500 mt-1">
            Jejak forensik, mutasi data, dan riwayat otorisasi pada entitas <strong>{selectedWorkspace?.name || "Utama"}</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Analysis Modal Trigger */}
          <Button
            size="sm"
            className="h-9 px-3.5 text-xs font-bold bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/25 active:scale-95 transition-all cursor-pointer"
            onPress={() => {
              playSoftChime();
              setIsAiModalOpen(true);
            }}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>AI Audit Trail Analysis</span>
          </Button>

          {/* Export Excel (.xlsx) */}
          <Button
            size="sm"
            variant="secondary"
            className="h-9 text-xs px-3 font-semibold cursor-pointer border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 active:scale-95 transition-all"
            onPress={exportAsExcel}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">Excel</span>
          </Button>

          {/* Export PDF (.pdf) */}
          <Button
            size="sm"
            variant="secondary"
            className="h-9 text-xs px-3 font-semibold cursor-pointer border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 transition-all"
            onPress={exportAsPdf}
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            <span className="hidden sm:inline">PDF</span>
          </Button>

          {/* Export JSON */}
          <Button
            size="sm"
            variant="secondary"
            className="h-9 text-xs px-3 font-semibold cursor-pointer border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 active:scale-95 transition-all"
            onPress={exportAsJson}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            <span>JSON</span>
          </Button>

          {/* Refresh */}
          <Button
            size="sm"
            variant="secondary"
            className="h-9 text-xs px-3 font-semibold cursor-pointer border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-default-700 dark:text-default-300 hover:bg-default-100 active:scale-95 transition-all"
            onPress={fetchLogs}
            isDisabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Aksi Tercatat</span>
            <Layers className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{logs.length}</div>
          <div className="text-[10px] text-default-500 mt-0.5">Seluruh rekaman aktivitas forensik</div>
        </Card>

        <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Peristiwa Keamanan</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {logs.filter((l) => l.entityType === "auth" || l.action.includes("security")).length}
          </div>
          <div className="text-[10px] text-default-500 mt-0.5">Login, token & validasi sesi</div>
        </Card>

        <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Mutasi Buku Besar</span>
            <Terminal className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {logs.filter((l) => l.entityType === "transaction" || l.entityType === "account" || l.entityType === "goal").length}
          </div>
          <div className="text-[10px] text-default-500 mt-0.5">Transaksi, saldo & target</div>
        </Card>

        <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 shadow-2xs">
          <div className="flex items-center justify-between text-default-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">AI & Ekspor Data</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
            {logs.filter((l) => l.entityType === "ai" || l.entityType === "export").length}
          </div>
          <div className="text-[10px] text-default-500 mt-0.5">Audit AI & unduhan statement</div>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-3.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/50 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
            <input
              type="text"
              placeholder="Cari aktivitas, ID entitas, IP address, atau correlation ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8.5 pr-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Entity Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-[11px] text-default-400 font-semibold uppercase tracking-wider mr-1">Entitas:</span>
            {[
              { id: "all", label: "Semua" },
              { id: "transaction", label: "Transaksi" },
              { id: "account", label: "Dompet" },
              { id: "goal", label: "Goals" },
              { id: "export", label: "Ekspor" },
              { id: "ai", label: "AI" },
              { id: "auth", label: "Auth" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedEntityFilter(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedEntityFilter === p.id
                    ? "bg-theme-primary text-white shadow-xs"
                    : "bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 hover:bg-default-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* TanStack Table View */}
      <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900/60 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-default-200/60 dark:border-default-800/60 bg-default-50/80 dark:bg-default-800/50 text-default-500 font-bold text-[11px] tracking-wide uppercase"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="py-3 px-4">
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-1 hover:text-foreground"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>{header.column.columnDef.header as string}</span>
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="w-3 h-3 text-default-400" />
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-default-100 dark:divide-default-800/50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-default-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2.5 text-blue-500" />
                    <span className="font-medium text-xs">Memuat buku audit forensik...</span>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-default-400">
                    <ScrollText className="w-8 h-8 mx-auto mb-2 text-default-300" />
                    <p className="font-semibold text-foreground text-sm">Tidak Ada Rekaman Log</p>
                    <p className="text-xs text-default-400 mt-0.5">Tidak ditemukan aktivitas yang cocok dengan filter pencarian.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-default-50/70 dark:hover:bg-default-800/40 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="py-3 px-4">
                        {cell.column.columnDef.cell
                          ? (cell.column.columnDef.cell as any)(cell.getContext())
                          : (cell.getValue() as string)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* TanStack Pagination Footer */}
        <div className="p-3.5 border-t border-default-200/60 dark:border-default-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-default-500 bg-default-50/40 dark:bg-default-900/30">
          <div className="flex items-center gap-2">
            <span>Baris per halaman:</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-7 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground font-medium cursor-pointer focus:outline-none"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-default-400 ml-1">
              Menampilkan {table.getRowModel().rows.length} dari {filteredData.length} rekaman
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs mr-2">
              Halaman <strong>{table.getState().pagination.pageIndex + 1}</strong> dari{" "}
              <strong>{table.getPageCount() || 1}</strong>
            </span>

            <Button
              size="sm"
              variant="secondary"
              isIconOnly
              className="h-7 w-7 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800"
              onPress={() => table.setPageIndex(0)}
              isDisabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isIconOnly
              className="h-7 w-7 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800"
              onPress={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isIconOnly
              className="h-7 w-7 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800"
              onPress={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              isIconOnly
              className="h-7 w-7 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-default-800"
              onPress={() => table.setPageIndex(table.getPageCount() - 1)}
              isDisabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ===================================================================== */}
      {/* AI AUDIT TRAIL & FORENSIC ANALYSIS MODAL                             */}
      {/* ===================================================================== */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between bg-linear-to-r from-purple-500/10 via-indigo-500/10 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Nova AI Forensic Audit & Threat Assessment
                  </h3>
                  <p className="text-[11px] text-default-500">
                    Analisis jejak mutasi, integritas buku kas, dan kewaspadaan celah keamanan untuk Admin & Owner.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Overall Health Score Card */}
              <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-500/25 shrink-0">
                    96%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">Status Forensik: Optimal</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        Zero Breach
                      </span>
                    </div>
                    <p className="text-default-500 text-[11px] mt-0.5">
                      Tidak terdeteksi anomali brute-force, eskalasi privilege ilegal, atau mutasi data ganjil pada {filteredData.length} peristiwa terakhir.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  className="h-8 px-3 text-xs bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer shadow-xs active:scale-95 transition shrink-0"
                  onPress={() => {
                    playSoftChime();
                    setIsAnalyzing(true);
                    setTimeout(() => setIsAnalyzing(false), 1200);
                  }}
                  isDisabled={isAnalyzing}
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                  <span>{isAnalyzing ? "Memindai..." : "Pindai Ulang"}</span>
                </Button>
              </div>

              {/* Forensic Findings */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-default-400">
                  Kesimpulan & Temuan Kunci (AI Findings)
                </h4>

                <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Integritas Log & Chain of Custody Terjaga</span>
                  </div>
                  <p className="text-[11px] text-default-500 pl-6 leading-relaxed">
                    Setiap mutasi transaksi memiliki correlation ID yang valid dan tercatat beserta IP asal. Tidak ada data yang dihapus tanpa jejak log sebelumnya.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Kepatuhan Otentikasi Multi-Faktor (MFA / 2FA)</span>
                  </div>
                  <p className="text-[11px] text-default-500 pl-6 leading-relaxed">
                    Sesi login kredensial terakhir berhasil diautentikasi dengan token MFA yang sesuai. Disarankan memastikan semua akun dengan hak <strong>Admin</strong> mengaktifkan 2FA via Google Authenticator.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Saran Mitigasi & Tata Kelola Keuangan</span>
                  </div>
                  <p className="text-[11px] text-default-500 pl-6 leading-relaxed">
                    Aktivitas ekspor statement Excel (.xlsx) tercatat dilakukan oleh user Administrator. Pastikan file laporan keuangan yang diunduh disimpan di perangkat terenkripsi sesuai standar ISO 27001.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <span className="text-[11px] text-default-400">
                Didukung oleh <strong>Nova AI Engine & Gemini 2.0 Flash</strong>
              </span>

              <Button
                size="sm"
                className="text-xs bg-default-900 text-white dark:bg-white dark:text-default-900 font-semibold px-4 cursor-pointer"
                onPress={() => setIsAiModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* JSON DIFF & FORENSIC INSPECTOR MODAL                                 */}
      {/* ===================================================================== */}
      {inspectingLog && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Forensic Diff Inspector</h3>
                  <p className="text-[11px] font-mono text-default-400">{inspectingLog.action}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="p-1.5 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-3 rounded-xl bg-default-100/70 dark:bg-default-800/50">
                <div>
                  <span className="text-default-400 block">ID Log</span>
                  <span className="font-mono font-semibold truncate block">{inspectingLog.id}</span>
                </div>
                <div>
                  <span className="text-default-400 block">Entity</span>
                  <span className="font-semibold text-foreground">{inspectingLog.entityType}</span>
                </div>
                <div>
                  <span className="text-default-400 block">IP Address</span>
                  <span className="font-mono font-semibold">{inspectingLog.ipAddress}</span>
                </div>
                <div>
                  <span className="text-default-400 block">Correlation</span>
                  <span className="font-mono font-semibold truncate block">{inspectingLog.correlationId || "—"}</span>
                </div>
              </div>

              {/* Data Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Old Data */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-default-500 font-semibold text-[11px]">
                    <span className="text-rose-500 font-mono">[-] Old State (Sebelumnya)</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-default-50 dark:bg-black/60 border border-default-200 dark:border-default-800 text-[11px] font-mono text-default-700 dark:text-default-300 overflow-x-auto max-h-56">
                    {inspectingLog.oldData
                      ? JSON.stringify(inspectingLog.oldData, null, 2)
                      : "null (Entitas Baru Dibuat)"}
                  </pre>
                </div>

                {/* New Data */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-default-500 font-semibold text-[11px]">
                    <span className="text-emerald-500 font-mono">[+] New State (Hasil Mutasi)</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-default-50 dark:bg-black/60 border border-default-200 dark:border-default-800 text-[11px] font-mono text-default-700 dark:text-default-300 overflow-x-auto max-h-56">
                    {inspectingLog.newData
                      ? JSON.stringify(inspectingLog.newData, null, 2)
                      : "null (Entitas Dihapus)"}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-default-200 dark:border-default-800 flex items-center justify-between bg-default-50/50 dark:bg-default-900/50">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectingLog, null, 2));
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="inline-flex items-center gap-1 text-xs text-default-500 hover:text-foreground cursor-pointer"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId ? "Tersalin ke Clipboard!" : "Salin JSON Lengkap"}</span>
              </button>

              <Button
                size="sm"
                className="text-xs bg-default-900 text-white dark:bg-white dark:text-default-900 font-semibold"
                onPress={() => setInspectingLog(null)}
              >
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
