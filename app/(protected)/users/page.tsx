/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, Button } from "@heroui/react";
import {
  ShieldCheck,
  Users,
  UserPlus,
  Shield,
  Check,
  Lock,
  Search,
  MoreVertical,
  Mail,
  Calendar,
  KeyRound,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Eye,
  Sliders,
  QrCode,
  Copy,
  Plus,
  X,
  AlertTriangle,
  ArrowRight,
  Smartphone,
  Layers,
} from "lucide-react";
import {
  useLegacyTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { type SortingState } from "@tanstack/react-table";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  UserRole,
  ROLES,
  getEffectiveRole,
  setSimulatedRole,
} from "@/app/lib/rbac";
import { playSoftChime, playNovaThemeSound } from "@/app/lib/sound";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface Member {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarColor: string;
  joinedAt: string;
  lastActive: string;
  twoFactorEnabled: boolean;
  status: "active" | "invited";
}

export interface MasterRoleItem {
  id: string;
  name: string;
  type: "system" | "custom";
  badgeColor: string;
  description: string;
  userCount: number;
  permissions: string[];
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: "mem-1",
    userId: "usr-rifky",
    name: "Alexander Vance (You)",
    email: "alexander@novajournal.io",
    role: "owner",
    avatarColor: "from-amber-500 to-orange-600",
    joinedAt: "Jan 12, 2026",
    lastActive: "Just now",
    twoFactorEnabled: true,
    status: "active",
  },
  {
    id: "mem-2",
    userId: "usr-sarah",
    name: "Sarah Wijaya, CFA",
    email: "sarah.finance@novajournal.io",
    role: "admin",
    avatarColor: "from-purple-500 to-indigo-600",
    joinedAt: "Feb 01, 2026",
    lastActive: "2 jam lalu",
    twoFactorEnabled: true,
    status: "active",
  },
  {
    id: "mem-3",
    userId: "usr-budi",
    name: "Budi Santoso, Ak.",
    email: "budi.acc@auditcorp.id",
    role: "staff",
    avatarColor: "from-blue-500 to-cyan-600",
    joinedAt: "Feb 15, 2026",
    lastActive: "1 hari lalu",
    twoFactorEnabled: false,
    status: "active",
  },
  {
    id: "mem-4",
    userId: "usr-dewi",
    name: "Dewi Lestari",
    email: "dewi.invest@venture.io",
    role: "viewer",
    avatarColor: "from-emerald-500 to-teal-600",
    joinedAt: "Mar 04, 2026",
    lastActive: "3 hari lalu",
    twoFactorEnabled: false,
    status: "invited",
  },
  {
    id: "mem-5",
    userId: "usr-hendra",
    name: "Hendra Gunawan",
    email: "hendra.ops@enterprise.co.id",
    role: "staff",
    avatarColor: "from-indigo-500 to-blue-600",
    joinedAt: "Apr 10, 2026",
    lastActive: "5 jam lalu",
    twoFactorEnabled: true,
    status: "active",
  },
  {
    id: "mem-6",
    userId: "usr-maya",
    name: "Maya Anggraini",
    email: "maya.tax@partnerconsult.id",
    role: "viewer",
    avatarColor: "from-pink-500 to-rose-600",
    joinedAt: "May 02, 2026",
    lastActive: "1 minggu lalu",
    twoFactorEnabled: false,
    status: "active",
  },
];

const INITIAL_MASTER_ROLES: MasterRoleItem[] = [
  {
    id: "owner",
    name: "Workspace Owner",
    type: "system",
    badgeColor: "amber",
    description: "Kedaulatan penuh atas workspace, billing, alokasi kursi, penutupan entitas, dan transfer hak root.",
    userCount: 1,
    permissions: ["all"],
  },
  {
    id: "admin",
    name: "Enterprise Admin",
    type: "system",
    badgeColor: "purple",
    description: "Operasional eksekutif: undang & kelola staf, rekening bank/wallets, konfigurasi AI, dan audit log.",
    userCount: 1,
    permissions: ["transactions.*", "accounts.*", "goals.*", "liabilities.*", "collaborators.*", "reports.*", "logs.*"],
  },
  {
    id: "staff",
    name: "Senior Accountant / Staff",
    type: "system",
    badgeColor: "blue",
    description: "Pembukuan ganda, rekonsiliasi mutasi harian, scan nota AI OCR, dan ekspor laporan statement.",
    userCount: 2,
    permissions: ["transactions.create", "transactions.read", "transactions.update", "accounts.read", "ai.ocr", "reports.export"],
  },
  {
    id: "viewer",
    name: "Auditor / Stakeholder",
    type: "system",
    badgeColor: "emerald",
    description: "Akses baca laporan keuangan, pajak, dan kurva arus kas tanpa hak modifikasi data buku besar.",
    userCount: 2,
    permissions: ["transactions.read", "accounts.read", "reports.read", "analytics.read"],
  },
  {
    id: "treasury",
    name: "Treasury & Liquidity Officer",
    type: "custom",
    badgeColor: "cyan",
    description: "Pengawasan saldo kas, diversifikasi bank, limit LPS Rp 2 Miliar, dan optimasi yield deposito.",
    userCount: 0,
    permissions: ["accounts.*", "reports.read", "transactions.read"],
  },
];

export default function UsersPage() {
  const { selectedWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"members" | "roles" | "simulation">("members");

  // Member State
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [masterRoles, setMasterRoles] = useState<MasterRoleItem[]>(INITIAL_MASTER_ROLES);
  const [loading, setLoading] = useState(false);

  // TanStack Table Filtering & Search
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [twoFactorFilter, setTwoFactorFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  // Role Simulation State
  const [currentEffectiveRole, setCurrentEffectiveRole] = useState<UserRole>("owner");

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("staff");

  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false);
  const [twoFactorTargetMember, setTwoFactorTargetMember] = useState<Member | null>(null);
  const [twoFactorOtpInput, setTwoFactorOtpInput] = useState("");
  const [twoFactorVerifiedSuccess, setTwoFactorVerifiedSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRolePerms, setNewRolePerms] = useState<Record<string, boolean>>({
    "transactions.read": true,
    "transactions.create": true,
    "accounts.read": true,
    "reports.export": true,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Sync effective role
  useEffect(() => {
    const syncRole = () => {
      const r = getEffectiveRole((selectedWorkspace as any)?.role);
      setCurrentEffectiveRole(r);
    };
    syncRole();
    window.addEventListener("novajournal_role_change", syncRole);
    return () => window.removeEventListener("novajournal_role_change", syncRole);
  }, [selectedWorkspace]);

  // Fetch real members from backend if available
  const fetchWorkspaceMembers = async () => {
    if (!selectedWorkspace?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${selectedWorkspace.id}/members`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.members?.length > 0) {
          setMembers(json.data.members);
        }
      }
    } catch {
      // Graceful fallback to initial seed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceMembers();
  }, [selectedWorkspace?.id]);

  const showNotification = (msg: string) => {
    playSoftChime();
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSimulateRole = (role: UserRole) => {
    setSimulatedRole(role);
    setCurrentEffectiveRole(role);
    showNotification(`Peran aktif disimulasikan sebagai: ${ROLES[role].label.toUpperCase()}`);
  };

  const handleResetRole = () => {
    setSimulatedRole(null);
    const r = getEffectiveRole((selectedWorkspace as any)?.role);
    setCurrentEffectiveRole(r);
    showNotification("Simulasi peran dikembalikan ke default.");
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      if (selectedWorkspace?.id) {
        await fetch(`/api/workspaces/${selectedWorkspace.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: inviteEmail.trim(),
            name: inviteName.trim() || inviteEmail.split("@")[0],
            role: inviteRole,
          }),
        });
      }
    } catch {}

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: inviteName.trim() || inviteEmail.split("@")[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      avatarColor: "from-indigo-500 to-purple-600",
      joinedAt: "Baru saja",
      lastActive: "Diundang",
      twoFactorEnabled: false,
      status: "invited",
    };

    setMembers([newMember, ...members]);
    setInviteEmail("");
    setInviteName("");
    setIsInviteOpen(false);
    showNotification(`Undangan berhasil dikirim ke ${newMember.email} (${ROLES[inviteRole].label})!`);
  };

  const handleChangeMemberRole = async (memberId: string, newRole: UserRole) => {
    setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)));
    showNotification(`Role anggota diubah menjadi ${ROLES[newRole].label}`);

    try {
      const mem = members.find((m) => m.id === memberId);
      if (selectedWorkspace?.id && mem?.userId) {
        await fetch(`/api/workspaces/${selectedWorkspace.id}/members/${mem.userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });
      }
    } catch {}
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (confirm(`Hapus ${memberName} dari workspace ini? Akses akan dicabut segera.`)) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      showNotification(`${memberName} telah dihapus dari workspace.`);

      try {
        const mem = members.find((m) => m.id === memberId);
        if (selectedWorkspace?.id && mem?.userId) {
          await fetch(`/api/workspaces/${selectedWorkspace.id}/members/${mem.userId}`, {
            method: "DELETE",
          });
        }
      } catch {}
    }
  };

  // Open 2FA Setup Modal for a user
  const handleOpen2FaModal = (member: Member) => {
    playSoftChime();
    setTwoFactorTargetMember(member);
    setTwoFactorOtpInput("");
    setTwoFactorVerifiedSuccess(false);
    setIsTwoFactorModalOpen(true);
  };

  const handleVerify2FaToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorOtpInput.trim().length === 6) {
      setTwoFactorVerifiedSuccess(true);
      playSoftChime();
      if (twoFactorTargetMember) {
        setMembers((prev) =>
          prev.map((m) =>
            m.id === twoFactorTargetMember.id ? { ...m, twoFactorEnabled: true } : m
          )
        );
      }
      showNotification("2FA TOTP berhasil diverifikasi dan diaktifkan!");
    } else {
      alert("Masukkan 6-digit kode OTP dari aplikasi autentikator Anda.");
    }
  };

  // Create New Master Role
  const handleCreateNewRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newRole: MasterRoleItem = {
      id: newRoleName.toLowerCase().replace(/\s+/g, "_"),
      name: newRoleName.trim(),
      type: "custom",
      badgeColor: "rose",
      description: newRoleDesc.trim() || "Peran kustom otorisasi khusus workspace.",
      userCount: 0,
      permissions: Object.keys(newRolePerms).filter((k) => newRolePerms[k]),
    };

    setMasterRoles([...masterRoles, newRole]);
    setNewRoleName("");
    setNewRoleDesc("");
    setIsNewRoleModalOpen(false);
    showNotification(`Master Role baru "${newRole.name}" berhasil dibuat!`);
  };

  // ==========================================
  // EXPORT EXCEL (.XLSX) & PDF
  // ==========================================
  const exportToExcel = () => {
    playSoftChime();
    const wsName = selectedWorkspace?.name || "Workspace";
    const exportData = members.map((m, idx) => ({
      No: idx + 1,
      Nama: m.name,
      Email: m.email,
      Peran: ROLES[m.role]?.label || m.role,
      Status: m.status === "active" ? "Aktif" : "Diundang",
      Otentikasi_2FA: m.twoFactorEnabled ? "Aktif (Protected)" : "Nonaktif",
      Tanggal_Bergabung: m.joinedAt,
      Aktivitas_Terakhir: m.lastActive,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daftar Anggota");
    XLSX.writeFile(wb, `NovaJournal_Members_${wsName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPdf = () => {
    playSoftChime();
    const wsName = selectedWorkspace?.name || "Workspace";
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("NovaJournal - Roster Anggota & Matriks Otorisasi", 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Entitas: ${wsName} | Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 25);

    const tableData = members.map((m, idx) => [
      idx + 1,
      m.name,
      m.email,
      ROLES[m.role]?.label || m.role,
      m.status.toUpperCase(),
      m.twoFactorEnabled ? "2FA AKTIF" : "NONAKTIF",
      m.joinedAt,
    ]);

    autoTable(doc, {
      startY: 32,
      head: [["#", "Nama Pengguna", "Alamat Email", "Peran (Role)", "Status", "2FA Security", "Bergabung"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    doc.save(`NovaJournal_Members_${wsName.replace(/\s+/g, "_")}.pdf`);
  };

  // ==========================================
  // TANSTACK TABLE SETUP
  // ==========================================
  const filteredData = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (twoFactorFilter === "enabled" && !m.twoFactorEnabled) return false;
      if (twoFactorFilter === "disabled" && m.twoFactorEnabled) return false;
      if (globalFilter.trim()) {
        const q = globalFilter.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchEmail = m.email.toLowerCase().includes(q);
        const matchRole = ROLES[m.role]?.label.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole) return false;
      }
      return true;
    });
  }, [members, roleFilter, statusFilter, twoFactorFilter, globalFilter]);

  const columns: LegacyColumnDef<Member>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Anggota & Identitas",
        accessorKey: "name",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl bg-linear-to-br ${m.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
              >
                {m.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-foreground text-xs flex items-center gap-1.5">
                  <span className="truncate">{m.name}</span>
                  {m.role === "owner" && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      Root
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-default-400 flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span>{m.email}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "role",
        header: "Peran / Otorisasi",
        accessorKey: "role",
        cell: ({ row }) => {
          const m = row.original;
          const roleInfo = ROLES[m.role] || { label: m.role, color: "text-default-500", bg: "bg-default-100" };
          return (
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                  m.role === "owner"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    : m.role === "admin"
                    ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                    : m.role === "staff"
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                }`}
              >
                {roleInfo.label}
              </span>

              {m.role !== "owner" && (
                <select
                  value={m.role}
                  onChange={(e) => handleChangeMemberRole(m.id, e.target.value as UserRole)}
                  className="h-7 text-[11px] px-1.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground cursor-pointer focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff / Akuntan</option>
                  <option value="viewer">Auditor / Viewer</option>
                </select>
              )}
            </div>
          );
        },
      },
      {
        id: "twoFactor",
        header: "Keamanan 2FA",
        accessorKey: "twoFactorEnabled",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <button
              type="button"
              onClick={() => handleOpen2FaModal(m)}
              title="Klik untuk konfigurasi otentikasi dua faktor"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer active:scale-95 ${
                m.twoFactorEnabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
              }`}
            >
              {m.twoFactorEnabled ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>2FA Aktif</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Konfig 2FA</span>
                </>
              )}
            </button>
          );
        },
      },
      {
        id: "status",
        header: "Status Akun",
        accessorKey: "status",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  m.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-blue-400"
                }`}
              />
              <span className="text-xs font-medium capitalize text-default-700 dark:text-default-300">
                {m.status === "active" ? "Aktif" : "Diundang"}
              </span>
            </div>
          );
        },
      },
      {
        id: "activity",
        header: "Aktivitas",
        accessorKey: "lastActive",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <div className="text-xs">
              <span className="text-default-700 dark:text-default-300 font-medium block">{m.lastActive}</span>
              <span className="text-[10px] text-default-400 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> {m.joinedAt}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const m = row.original;
          if (m.role === "owner") return null;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => handleRemoveMember(m.id, m.name)}
                title="Hapus akses anggota"
                className="p-1.5 rounded-lg text-default-400 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [members]
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
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-foreground">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-default-200/20 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-default-200/80 dark:border-default-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Users & Access Control (RBAC)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-default-500">
            Kelola anggota entitas <strong>{selectedWorkspace?.name || "Utama"}</strong>, konfigurasi 2FA, master role kustom, dan audit keamanan AI.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Analysis Button (NEXT TO INVITE MEMBER) */}
          <Button
            size="sm"
            onPress={() => {
              playSoftChime();
              setIsAiAnalysisOpen(true);
            }}
            className="h-9 px-3.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>AI RBAC Analysis</span>
          </Button>

          {/* Invite Member Button */}
          <Button
            size="sm"
            onPress={() => {
              playSoftChime();
              setIsInviteOpen(true);
            }}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Undang Anggota</span>
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-default-200 dark:border-default-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { id: "members", label: "Daftar Anggota & Sesi", icon: Users, count: members.length },
            { id: "roles", label: "Master Roles & Matriks Otorisasi", icon: KeyRound, count: masterRoles.length },
            { id: "simulation", label: "Sandbox Simulasi Peran", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playSoftChime();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                    : "text-default-600 hover:bg-default-100 dark:hover:bg-default-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-default-200 dark:bg-default-700 text-default-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Export Buttons */}
        {activeTab === "members" && (
          <div className="flex items-center gap-1.5 pb-2">
            <button
              type="button"
              onClick={exportToExcel}
              title="Ekspor ke spreadsheet Excel (.xlsx)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 hover:bg-default-50 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={exportToPdf}
              title="Ekspor ke dokumen PDF resmi"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 hover:bg-default-50 text-xs font-semibold text-rose-600 dark:text-rose-400 transition cursor-pointer active:scale-95 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEMBERS ROSTER WITH TANSTACK TABLE */}
      {/* ========================================================================= */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {/* KPI Mini Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs">
              <span className="text-[11px] font-semibold text-default-400 uppercase tracking-wider">Total Anggota</span>
              <div className="text-xl font-extrabold text-foreground mt-0.5">{members.length} dari 10 Kursi</div>
              <p className="text-[10px] text-default-500 mt-0.5">Workspace Tier Pro</p>
            </Card>

            <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs">
              <span className="text-[11px] font-semibold text-default-400 uppercase tracking-wider">Tingkat Adopsi 2FA</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {Math.round((members.filter((m) => m.twoFactorEnabled).length / members.length) * 100)}%
              </div>
              <p className="text-[10px] text-default-500 mt-0.5">
                {members.filter((m) => m.twoFactorEnabled).length} dari {members.length} akun terlindungi
              </p>
            </Card>

            <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs">
              <span className="text-[11px] font-semibold text-default-400 uppercase tracking-wider">Admin & Owner</span>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-0.5">
                {members.filter((m) => m.role === "owner" || m.role === "admin").length} Akun
              </div>
              <p className="text-[10px] text-default-500 mt-0.5">Hak administratif penuh</p>
            </Card>

            <Card className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs">
              <span className="text-[11px] font-semibold text-default-400 uppercase tracking-wider">Undangan Menunggu</span>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                {members.filter((m) => m.status === "invited").length}
              </div>
              <p className="text-[10px] text-default-500 mt-0.5">Menunggu konfirmasi email</p>
            </Card>
          </div>

          {/* Table Filters & Toolbar */}
          <Card className="p-3 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
                <input
                  type="text"
                  placeholder="Cari anggota berdasarkan nama, email, atau peran..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full h-8.5 pl-8 pr-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              {/* Filters Group */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* Role Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-default-400 font-semibold uppercase tracking-wider">Peran:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="all">Semua Peran</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                {/* 2FA Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-default-400 font-semibold uppercase tracking-wider">2FA:</span>
                  <select
                    value={twoFactorFilter}
                    onChange={(e) => setTwoFactorFilter(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="all">Semua</option>
                    <option value="enabled">2FA Aktif</option>
                    <option value="disabled">2FA Belum Aktif</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-default-400 font-semibold uppercase tracking-wider">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 px-2 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="all">Semua</option>
                    <option value="active">Aktif</option>
                    <option value="invited">Diundang</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* TanStack Table Container */}
          <Card className="rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-default-200/60 dark:border-default-800/60 bg-default-50/70 dark:bg-default-800/40 text-default-400 text-[11px]">
                    {table.getHeaderGroups().map((headerGroup) =>
                      headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="py-3 px-4 font-semibold select-none cursor-pointer"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1">
                            <span>{header.column.columnDef.header as string}</span>
                            {{
                              asc: " 🔼",
                              desc: " 🔽",
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-default-800/50">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-default-400">
                        Tidak ada anggota yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-default-50/60 dark:hover:bg-default-800/30 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-4 whitespace-nowrap">
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

            {/* Pagination Controls */}
            <div className="p-3 border-t border-default-200/60 dark:border-default-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-default-500">
                <span>
                  Menampilkan{" "}
                  <strong>
                    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      filteredData.length
                    )}
                  </strong>{" "}
                  dari <strong>{filteredData.length}</strong> anggota
                </span>

                <span className="text-default-300">|</span>

                <div className="flex items-center gap-1">
                  <span>Baris per halaman:</span>
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="h-7 px-2 rounded-md border border-default-200 dark:border-default-700 bg-white dark:bg-default-800 text-foreground cursor-pointer"
                  >
                    {[5, 10, 20, 50].map((pageSize) => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg border border-default-200 dark:border-default-700 hover:bg-default-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="p-1.5 rounded-lg border border-default-200 dark:border-default-700 hover:bg-default-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-2 font-mono text-default-600">
                  Halaman <strong>{table.getState().pagination.pageIndex + 1}</strong> dari{" "}
                  <strong>{Math.max(1, table.getPageCount())}</strong>
                </span>

                <button
                  type="button"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg border border-default-200 dark:border-default-700 hover:bg-default-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="p-1.5 rounded-lg border border-default-200 dark:border-default-700 hover:bg-default-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MASTER ROLES & GRANULAR PERMISSIONS */}
      {/* ========================================================================= */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground">Definisi Master Roles & Privilese</h2>
              <p className="text-xs text-default-500">
                Standar hierarki hak akses sistem dan delegasi kapabilitas per modul.
              </p>
            </div>
            <Button
              size="sm"
              onPress={() => {
                playSoftChime();
                setIsNewRoleModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl h-8.5 px-3.5 flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Master Role Baru</span>
            </Button>
          </div>

          {/* Master Roles Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {masterRoles.map((role) => (
              <Card
                key={role.id}
                className="p-4 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        role.badgeColor === "amber"
                          ? "bg-amber-500"
                          : role.badgeColor === "purple"
                          ? "bg-purple-500"
                          : role.badgeColor === "blue"
                          ? "bg-blue-500"
                          : role.badgeColor === "emerald"
                          ? "bg-emerald-500"
                          : "bg-cyan-500"
                      }`}
                    />
                    <h3 className="text-xs font-bold text-foreground">{role.name}</h3>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800 text-default-500">
                    {role.type}
                  </span>
                </div>

                <p className="text-[11px] text-default-500 leading-relaxed min-h-[36px]">
                  {role.description}
                </p>

                <div className="pt-2 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-default-400">
                    Pengguna Aktif: <strong className="text-foreground">{role.userCount} akun</strong>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {role.permissions.includes("all") ? "Full Root Access" : `${role.permissions.length} Hak Modul`}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Granular Permission Matrix Table */}
          <Card className="rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 overflow-hidden shadow-2xs">
            <div className="p-3 bg-default-50 dark:bg-default-800/50 border-b border-default-200/60 dark:border-default-800 font-bold text-xs">
              Matriks Kapabilitas Modul Berdasarkan Master Role
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-default-200/60 dark:border-default-800/60 text-default-400 text-[11px]">
                    <th className="py-2.5 px-4 font-semibold">Modul & Hak Akses</th>
                    <th className="py-2.5 text-center font-semibold text-amber-600">Owner</th>
                    <th className="py-2.5 text-center font-semibold text-purple-600">Admin</th>
                    <th className="py-2.5 text-center font-semibold text-blue-600">Staff</th>
                    <th className="py-2.5 text-center font-semibold text-emerald-600">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-default-800/50 text-foreground">
                  {[
                    { mod: "Transactions", perm: "Lihat & Cari Mutasi Transaksi", o: true, a: true, s: true, v: true },
                    { mod: "Transactions", perm: "Entri & Ubah Transaksi", o: true, a: true, s: true, v: false },
                    { mod: "Transactions", perm: "Hapus & Rekonsiliasi Permanen", o: true, a: true, s: false, v: false },
                    { mod: "Wallets", perm: "Lihat Saldo & Likuiditas", o: true, a: true, s: true, v: true },
                    { mod: "Wallets", perm: "Tambah & Hapus Rekening Bank", o: true, a: true, s: false, v: false },
                    { mod: "Goals", perm: "Simulasi & Reorder Kanban Goals", o: true, a: true, s: true, v: false },
                    { mod: "Liabilities", perm: "Kalkulator Amortisasi & Pelunasan", o: true, a: true, s: true, v: true },
                    { mod: "AI OCR", perm: "Ekstraksi Nota Kuitansi Gemini", o: true, a: true, s: true, v: false },
                    { mod: "AI OCR", perm: "Audit Keuangan & Anomali Cashflow", o: true, a: true, s: true, v: true },
                    { mod: "Reports", perm: "Ekspor Laporan Excel & PDF", o: true, a: true, s: true, v: true },
                    { mod: "Security", perm: "Inspeksi Audit Logs Forensik", o: true, a: true, s: false, v: false },
                    { mod: "Governance", perm: "Undang Anggota & Ubah Role", o: true, a: true, s: false, v: false },
                    { mod: "Governance", perm: "Hapus Workspace & Kunci Rahasia AI", o: true, a: false, s: false, v: false },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-default-50/50 dark:hover:bg-default-800/30 transition-colors">
                      <td className="py-2 px-4 font-medium text-default-700 dark:text-default-300">
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-default-100 dark:bg-default-800 text-default-500 mr-2">
                          {row.mod}
                        </span>
                        <span>{row.perm}</span>
                      </td>
                      <td className="py-2 text-center text-emerald-500 font-bold">{row.o ? "✓" : "—"}</td>
                      <td className="py-2 text-center text-emerald-500 font-bold">{row.a ? "✓" : "—"}</td>
                      <td className="py-2 text-center text-emerald-500 font-bold">{row.s ? "✓" : "—"}</td>
                      <td className="py-2 text-center text-default-400">{row.v ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROLE SIMULATION SANDBOX */}
      {/* ========================================================================= */}
      {activeTab === "simulation" && (
        <Card className="p-5 rounded-xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-default-900 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>Sandbox Simulasi Peran RBAC</span>
              </h2>
              <p className="text-xs text-default-500">
                Uji tampilan menu dan hak navigasi aplikasi seolah-olah Anda login dengan role lain.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs"
              onPress={handleResetRole}
            >
              Reset ke Default (Owner)
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(ROLES) as UserRole[]).map((rKey) => {
              const r = ROLES[rKey];
              const isSelected = currentEffectiveRole === rKey;
              return (
                <button
                  key={rKey}
                  type="button"
                  onClick={() => handleSimulateRole(rKey)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/30 text-foreground font-bold"
                      : "border-default-200 dark:border-default-700 bg-white dark:bg-default-800 hover:bg-default-50 text-default-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">{r.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-default-400 leading-tight">
                    {rKey === "owner" && "Hak mutlak atas seluruh sistem"}
                    {rKey === "admin" && "Manajemen operasional & staf"}
                    {rKey === "staff" && "Entri transaksi & rekonsiliasi"}
                    {rKey === "viewer" && "Akses baca laporan finansial"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-default-100/70 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 text-xs text-default-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Simulasi ini berlaku secara live di session browser saat ini. Sidebar di sebelah kiri akan langsung menyesuaikan akses menu yang diizinkan untuk peran tersebut.
            </span>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: AI RBAC & TEAM SECURITY ANALYSIS */}
      {/* ========================================================================= */}
      {isAiAnalysisOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between bg-linear-to-r from-purple-950/20 via-blue-950/20 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI RBAC & Team Security Audit</h3>
                  <p className="text-[11px] text-default-500">
                    Evaluasi kepatuhan Least Privilege, Segregation of Duties (SoD), & mitigasi risiko.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiAnalysisOpen(false)}
                className="p-1.5 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Score Card */}
              <div className="p-4 rounded-xl bg-linear-to-br from-emerald-500/10 via-blue-500/10 to-transparent border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Least Privilege Compliance Score
                  </span>
                  <div className="text-2xl font-black text-foreground mt-0.5">94 / 100 • Luar Biasa</div>
                  <p className="text-[11px] text-default-500 mt-0.5">
                    Hanya 2 akun memiliki hak administratif tingkat tinggi di workspace ini.
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-base">
                  A+
                </div>
              </div>

              {/* Security Findings Grid */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-foreground block uppercase tracking-wider">
                  Temuan & Rekomendasi Audit Otorisasi:
                </span>

                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Enforcement 2FA pada Akun Staf Keuangan</span>
                  </div>
                  <p className="text-[11px] text-default-600 dark:text-default-400 leading-relaxed">
                    Pengguna <strong>Budi Santoso (Staff)</strong> belum mengaktifkan 2FA. Akun dengan wewenang entri transaksi buku besar wajib diamankan dengan autentikasi dua faktor untuk mencegah phishing credential.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Pemisahan Tugas (Segregation of Duties) Aman</span>
                  </div>
                  <p className="text-[11px] text-default-600 dark:text-default-400 leading-relaxed">
                    Tidak ditemukan konflik otorisasi ganda. Pembuat mutasi harian (Staff) tidak memiliki wewenang untuk menghapus rekening bank atau mentransfer kepemilikan workspace.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400 text-xs">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Optimasi Alokasi Kursi (Ghost Member)</span>
                  </div>
                  <p className="text-[11px] text-default-600 dark:text-default-400 leading-relaxed">
                    Undangan untuk <strong>Dewi Lestari</strong> telah berstatus pending lebih dari 7 hari. Batalkan undangan jika tidak lagi dibutuhkan untuk menghemat kuota kursi kolaborator.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-default-200 dark:border-default-800 flex items-center justify-end bg-default-50/50 dark:bg-default-900/50">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                onPress={() => setIsAiAnalysisOpen(false)}
              >
                Tutup Analisis
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TWO-FACTOR AUTHENTICATION (2FA) CONFIGURATION */}
      {/* ========================================================================= */}
      {isTwoFactorModalOpen && twoFactorTargetMember && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-md rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between bg-emerald-500/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Otentikasi Dua Faktor (2FA)</h3>
                  <p className="text-[11px] text-default-500">Konfigurasi TOTP untuk {twoFactorTargetMember.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTwoFactorModalOpen(false)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs">
              {twoFactorVerifiedSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    2FA Berhasil Dikonfigurasi!
                  </h4>
                  <p className="text-[11px] text-default-600 dark:text-default-400">
                    Akun kini mewajibkan input 6-digit kode OTP aplikasi autentikator setiap kali sesi baru dibuka.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1: QR Code Canvas */}
                  <div className="text-center space-y-2">
                    <p className="text-[11px] text-default-500">
                      Pindai kode QR ini menggunakan aplikasi <strong>Google Authenticator</strong> atau <strong>Authy</strong>:
                    </p>
                    {/* Simulated High-Res TOTP QR Code */}
                    <div className="w-36 h-36 mx-auto p-2 rounded-xl bg-white border-2 border-emerald-500 shadow-md flex items-center justify-center">
                      <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100">
                        <rect x="10" y="10" width="25" height="25" fill="currentColor" />
                        <rect x="65" y="10" width="25" height="25" fill="currentColor" />
                        <rect x="10" y="65" width="25" height="25" fill="currentColor" />
                        <rect x="15" y="15" width="15" height="15" fill="white" />
                        <rect x="70" y="15" width="15" height="15" fill="white" />
                        <rect x="15" y="70" width="15" height="15" fill="white" />
                        <rect x="19" y="19" width="7" height="7" fill="currentColor" />
                        <rect x="74" y="19" width="7" height="7" fill="currentColor" />
                        <rect x="19" y="74" width="7" height="7" fill="currentColor" />
                        <rect x="42" y="10" width="6" height="20" fill="currentColor" />
                        <rect x="52" y="25" width="8" height="8" fill="currentColor" />
                        <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                        <rect x="45" y="45" width="10" height="10" fill="white" />
                        <rect x="65" y="45" width="12" height="6" fill="currentColor" />
                        <rect x="45" y="70" width="15" height="8" fill="currentColor" />
                        <rect x="65" y="65" width="25" height="25" fill="currentColor" />
                        <rect x="70" y="70" width="15" height="15" fill="white" />
                        <rect x="74" y="74" width="7" height="7" fill="currentColor" />
                      </svg>
                    </div>

                    {/* Manual Secret Key */}
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                      <span className="font-mono text-[11px] bg-default-100 dark:bg-default-800 px-2 py-1 rounded-lg border border-default-200">
                        JBSWY3DPEHPK3PXP
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
                          setCopiedKey(true);
                          setTimeout(() => setCopiedKey(false), 2000);
                        }}
                        className="p-1 rounded-lg hover:bg-default-100 text-default-500 cursor-pointer"
                      >
                        {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Verification Input */}
                  <form onSubmit={handleVerify2FaToken} className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-foreground block mb-1">
                        Masukkan 6-Digit Kode Autentikasi
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        value={twoFactorOtpInput}
                        onChange={(e) => setTwoFactorOtpInput(e.target.value.replace(/\D/g, ""))}
                        className="w-full h-10 text-center tracking-[0.5em] text-base font-mono rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 rounded-xl"
                    >
                      Verifikasi & Aktifkan 2FA
                    </Button>
                  </form>

                  {/* Production Roadmap Info Box */}
                  <div className="p-3 rounded-xl bg-default-100/80 dark:bg-default-800/60 border border-default-200/60 text-[11px] text-default-600 space-y-1">
                    <span className="font-bold block text-foreground">Kebutuhan Integrasi Produksi Backend:</span>
                    <p>
                      • Package Backend: <code>otplib</code> (RFC 6238 TOTP) &amp; <code>qrcode</code> atau BetterAuth <code>@better-auth/two-factor</code>.
                    </p>
                    <p>
                      • Skema DB: Kolom <code>two_factor_secret</code> dan <code>two_factor_enabled</code> pada tabel <code>users</code>.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-default-200 dark:border-default-800 flex items-center justify-end bg-default-50/50 dark:bg-default-900/50">
              <Button
                size="sm"
                variant="secondary"
                className="text-xs"
                onPress={() => setIsTwoFactorModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INVITE MEMBER MODAL */}
      {/* ========================================================================= */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-md rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between bg-blue-500/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Undang Anggota Baru</h3>
                  <p className="text-[11px] text-default-500">Kirim email undangan delegasi role workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Alamat Email *</label>
                <input
                  type="email"
                  required
                  placeholder="rekan@perusahaan.co.id"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Nama Lengkap (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Rian Pratama"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Peran Otorisasi *</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground cursor-pointer focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                >
                  <option value="admin">Admin (Operasional & Kelola Staf)</option>
                  <option value="staff">Staff / Akuntan (Pencatatan Buku Besar)</option>
                  <option value="viewer">Viewer / Auditor (Hanya Baca Laporan)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  onPress={() => setIsInviteOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs"
                >
                  Kirim Undangan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CREATE NEW MASTER ROLE */}
      {/* ========================================================================= */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-lg rounded-2xl border border-default-200 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-default-200 dark:border-default-800 flex items-center justify-between bg-purple-500/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Tambah Master Role Baru</h3>
                  <p className="text-[11px] text-default-500">Definisikan level otorisasi kustom untuk workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRoleModalOpen(false)}
                className="p-1 rounded-lg text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewRole} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Nama Role *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Internal Financial Controller"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Deskripsi Tanggung Jawab</label>
                <textarea
                  rows={2}
                  placeholder="Uraikan batasan kewenangan role ini..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Pilih Hak Akses Modul:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-default-50 dark:bg-default-800/50 border border-default-200/60 max-h-48 overflow-y-auto">
                  {[
                    { id: "transactions.read", label: "Lihat Buku Besar" },
                    { id: "transactions.create", label: "Buat Transaksi" },
                    { id: "transactions.delete", label: "Hapus Transaksi" },
                    { id: "accounts.read", label: "Lihat Saldo Bank" },
                    { id: "accounts.manage", label: "Kelola Rekening" },
                    { id: "goals.manage", label: "Atur Goals & Wishlist" },
                    { id: "liabilities.manage", label: "Kelola Utang/Kredit" },
                    { id: "ai.ocr", label: "Ekstraksi AI Nota" },
                    { id: "reports.export", label: "Ekspor Excel/PDF" },
                    { id: "logs.read", label: "Inspeksi Audit Logs" },
                  ].map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer text-default-700 dark:text-default-300">
                      <input
                        type="checkbox"
                        checked={!!newRolePerms[perm.id]}
                        onChange={(e) =>
                          setNewRolePerms({
                            ...newRolePerms,
                            [perm.id]: e.target.checked,
                          })
                        }
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-[11px]">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs"
                  onPress={() => setIsNewRoleModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs"
                >
                  Simpan Master Role
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
