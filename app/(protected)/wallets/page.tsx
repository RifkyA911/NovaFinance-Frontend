/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Building2,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  ArrowUpRight,
  ArrowRight,
  Search,
  Check,
  AlertTriangle,
  X,
  Copy,
  Coins,
  ShieldCheck,
  Loader2,
  TrendingUp,
  Sparkles,
  GripVertical,
  ArrowLeftRight,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Landmark,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
} from "lucide-react";
import { Card, Button, Chip } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import type { Account } from "../../lib/api";
import { playSoftChime } from "@/app/lib/sound";
import {
  useLegacyTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { flexRender, type SortingState } from "@tanstack/react-table";
import BankLogo from "@/app/components/BankLogo";

const BANK_PRESETS = [
  "BCA",
  "Mandiri",
  "BRI",
  "BNI",
  "BSI (Syariah)",
  "Bank Jago",
  "SeaBank",
  "CIMB Niaga",
  "Permata",
  "Danamon",
  "Blu BCA",
  "Jenius",
  "OCBC NISP",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "LinkAja",
  "Chase",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "PayPal",
  "Wise",
  "Stripe",
  "Revolut",
  "Cash / Tunai",
  "Crypto Wallet",
];

export default function WalletsMasterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspace();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Drag-to-Transfer between Wallets State
  const [draggedAccountId, setDraggedAccountId] = useState<string | null>(null);
  const [dragOverAccountId, setDragOverAccountId] = useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSource, setTransferSource] = useState<Account | null>(null);
  const [transferTarget, setTransferTarget] = useState<Account | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // AI Treasury Advisor Modal State
  const [isAiTreasuryOpen, setIsAiTreasuryOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<"bank" | "cash" | "ewallet" | "credit">("bank");
  const [formBankName, setFormBankName] = useState("");
  const [formAccountNumber, setFormAccountNumber] = useState("");
  const [formBalance, setFormBalance] = useState("0");
  const [formCurrency, setFormCurrency] = useState("IDR");

  // Loading & Alert state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // TanStack Query for workspace accounts
  const accountsQuery = useQuery({
    queryKey: queryKeys.accounts(selectedWorkspace?.id),
    queryFn: () => queryFunctions.accounts(selectedWorkspace?.id),
    enabled: !!selectedWorkspace?.id,
  });

  const accounts: Account[] = useMemo(() => {
    return accountsQuery.data?.data?.accounts || [];
  }, [accountsQuery.data]);

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

  // KPI Calculations
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
  }, [accounts]);

  const bankTotal = useMemo(() => {
    return accounts
      .filter((a) => a.type === "bank")
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const ewalletTotal = useMemo(() => {
    return accounts
      .filter((a) => a.type === "ewallet")
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const cashTotal = useMemo(() => {
    return accounts
      .filter((a) => a.type === "cash")
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        acc.name.toLowerCase().includes(q) ||
        (acc.bankName && acc.bankName.toLowerCase().includes(q)) ||
        (acc.accountNumber && acc.accountNumber.toLowerCase().includes(q));

      const matchType = typeFilter === "all" || acc.type === typeFilter;
      return matchQuery && matchType;
    });
  }, [accounts, searchQuery, typeFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormName("");
    setFormType("bank");
    setFormBankName("");
    setFormAccountNumber("");
    setFormBalance("0");
    setFormCurrency(currency);
    setErrorMessage("");
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setFormName(acc.name);
    setFormType((acc.type as any) || "bank");
    setFormBankName(acc.bankName || "");
    setFormAccountNumber(acc.accountNumber || "");
    setFormBalance(String(acc.balance ?? "0"));
    setFormCurrency(acc.currency || currency);
    setErrorMessage("");
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (acc: Account) => {
    setSelectedAccount(acc);
    setErrorMessage("");
    setIsDeleteModalOpen(true);
  };

  // Submit Create Account
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace?.id || !formName.trim()) {
      setErrorMessage("Nama rekening wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await mutationFunctions.createAccount({
        workspaceId: selectedWorkspace.id,
        name: formName.trim(),
        type: formType,
        balance: String(parseFloat(formBalance) || 0),
        currency: formCurrency || currency,
        bankName: formBankName.trim() || undefined,
        accountNumber: formAccountNumber.trim() || undefined,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) }),
      ]);

      setIsCreateModalOpen(false);
      playSoftChime();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal membuat rekening baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Update Account
  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount?.id || !formName.trim()) {
      setErrorMessage("Nama rekening wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await mutationFunctions.updateAccount(selectedAccount.id, {
        name: formName.trim(),
        type: formType,
        balance: String(parseFloat(formBalance) || 0),
        currency: formCurrency || currency,
        bankName: formBankName.trim() || undefined,
        accountNumber: formAccountNumber.trim() || undefined,
      });

      if (selectedWorkspace?.id) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) }),
        ]);
      }

      setIsEditModalOpen(false);
      playSoftChime();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memperbarui rekening.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Account
  const handleSubmitDelete = async () => {
    if (!selectedAccount?.id) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await mutationFunctions.deleteAccount(selectedAccount.id);

      if (selectedWorkspace?.id) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) }),
        ]);
      }

      setIsDeleteModalOpen(false);
      playSoftChime();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghapus rekening. Pastikan tidak ada transaksi yang tertaut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy Account Number
  const copyAccountNumber = (accNumber: string, id: string) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ----------------------------------------------------
  // Drag & Drop: Inter-Wallet Transfer Handlers
  // ----------------------------------------------------
  const handleDragStartWallet = (e: React.DragEvent, acc: Account) => {
    setDraggedAccountId(acc.id);
    e.dataTransfer.setData("text/plain", acc.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverWallet = (e: React.DragEvent, targetAccId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedAccountId && draggedAccountId !== targetAccId && dragOverAccountId !== targetAccId) {
      setDragOverAccountId(targetAccId);
    }
  };

  const handleDragLeaveWallet = () => {
    setDragOverAccountId(null);
  };

  const handleDropOnWallet = (e: React.DragEvent, targetAcc: Account) => {
    e.preventDefault();
    setDragOverAccountId(null);
    const sourceId = e.dataTransfer.getData("text/plain") || draggedAccountId;
    if (!sourceId || sourceId === targetAcc.id) return;

    const sourceAcc = accounts.find((a) => a.id === sourceId);
    if (!sourceAcc) return;

    // Trigger Inter-Wallet Transfer Modal!
    setTransferSource(sourceAcc);
    setTransferTarget(targetAcc);
    setTransferAmount("");
    setTransferNote(`Transfer dana dari ${sourceAcc.name} ke ${targetAcc.name}`);
    setIsTransferModalOpen(true);
    playSoftChime();
  };

  // Execute Transfer Transaction
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace?.id || !transferSource || !transferTarget) return;

    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Nominal transfer harus lebih dari 0.");
      return;
    }

    setIsTransferring(true);
    try {
      // 1. Double-entry transaction: Debit Source Account (Expense)
      await mutationFunctions.createTransaction({
        workspaceId: selectedWorkspace.id,
        accountId: transferSource.id,
        amount: amountNum,
        type: "expense",
        description: `Transfer keluar ke ${transferTarget.name}`,
        notes: transferNote || undefined,
      });

      // 2. Double-entry transaction: Credit Target Account (Income)
      await mutationFunctions.createTransaction({
        workspaceId: selectedWorkspace.id,
        accountId: transferTarget.id,
        amount: amountNum,
        type: "income",
        description: `Transfer masuk dari ${transferSource.name}`,
        notes: transferNote || undefined,
      });

      // Invalidate queries to reflect updated balances
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions(selectedWorkspace.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) }),
      ]);

      setIsTransferModalOpen(false);
      setTransferSource(null);
      setTransferTarget(null);
      setTransferAmount("");
      playSoftChime();
    } catch (err: any) {
      alert(err.message || "Gagal memproses transfer.");
    } finally {
      setIsTransferring(false);
    }
  };

  // View Mode: DnD Grid Cards vs TanStack Table
  const [viewMode, setViewMode] = useState<"dnd" | "table">("dnd");
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<LegacyColumnDef<Account>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Rekening & Institusi",
        cell: ({ row }) => {
          const acc = row.original;

          return (
            <div className="flex items-center gap-3 py-1">
              <BankLogo
                bankName={acc.bankName}
                accountName={acc.name}
                type={acc.type}
                size={36}
              />
              <div className="min-w-0">
                <span className="font-bold text-xs text-foreground block truncate">{acc.name}</span>
                <span className="text-[10px] text-default-400">
                  {acc.bankName || acc.type.toUpperCase()}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "accountNumber",
        header: "Nomor Akun / HP",
        cell: ({ row }) => {
          const acc = row.original;
          if (!acc.accountNumber) {
            return <span className="text-default-400 text-xs italic">-</span>;
          }
          const isCopied = copiedId === acc.id;
          return (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-foreground border border-default-200/60 dark:border-default-700/60">
                {acc.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => copyAccountNumber(acc.accountNumber!, acc.id)}
                className="p-1 rounded-md text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer"
                title="Salin nomor akun"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          );
        },
      },
      {
        accessorKey: "balance",
        header: "Saldo Likuid",
        cell: ({ row }) => {
          const acc = row.original;
          const balanceNum = Number(acc.balance) || 0;
          const sharePercent = totalBalance > 0 ? Math.max(0, (balanceNum / totalBalance) * 100) : 0;

          return (
            <div>
              <span
                className={`font-mono font-bold text-xs ${
                  balanceNum < 0 ? "text-rose-500" : "text-foreground"
                }`}
              >
                {formatCurrency(balanceNum)}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 bg-default-100 dark:bg-default-800 rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, sharePercent)}%`,
                      backgroundColor: "var(--primary-color)",
                    }}
                  />
                </div>
                <span className="text-[10px] text-default-400 font-mono">{sharePercent.toFixed(1)}%</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        header: "Tipe & Kategori",
        cell: ({ row }) => {
          const type = row.original.type;
          const isBank = type === "bank";
          const isEwallet = type === "ewallet";
          const isCash = type === "cash";

          return (
            <span
              className={
                isBank
                  ? "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                  : isEwallet
                  ? "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : isCash
                  ? "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
              }
              style={
                isBank
                  ? {
                      backgroundColor: "var(--primary-subtle)",
                      color: "var(--primary-color)",
                      borderColor: "var(--primary-ring)",
                    }
                  : undefined
              }
            >
              {type}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi Terintegrasi",
        cell: ({ row }) => {
          const acc = row.original;
          return (
            <div className="flex items-center gap-1.5 justify-end">
              <Link
                href={`/transactions?account=${encodeURIComponent(acc.name)}`}
                className="h-7.5 px-2.5 text-[11px] font-semibold bg-default-100 dark:bg-default-800 hover:bg-default-200 dark:hover:bg-default-700 text-default-700 dark:text-default-300 rounded-lg flex items-center gap-1 transition cursor-pointer border border-default-200/60 dark:border-default-700/60"
              >
                <span>Jurnal</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Button
                size="sm"
                variant="outline"
                isIconOnly
                onPress={() => handleOpenEdit(acc)}
                className="h-7.5 w-7.5 border-default-200 dark:border-default-700 text-default-600 cursor-pointer shadow-2xs"
                aria-label="Edit Rekening"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                isIconOnly
                onPress={() => handleOpenDelete(acc)}
                className="h-7.5 w-7.5 border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer shadow-2xs"
                aria-label="Hapus Rekening"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalBalance, copiedId]
  );

  const table = useLegacyTable({
    data: filteredAccounts,
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
        pageSize: 8,
      },
    },
  });

  return (
    <div className="min-h-screen bg-default-50/70 dark:bg-gray-950 p-4 md:p-6 lg:p-8 space-y-6 text-foreground">
      {/* ── 1. Header Bar: 1 Row Title, 1 Row Buttons ─────────────────── */}
      <div className="space-y-4 border-b border-default-200/80 dark:border-default-800/80 pb-5">
        {/* Row 1: H1 & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-theme-gradient text-white shadow-md shadow-theme-primary shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Master Wallets & Liquidity Hub
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-theme-primary/10 text-theme-primary font-semibold border border-theme-primary/20">
                Drag & Drop Ready
              </span>
              {selectedWorkspace && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-300 font-medium border border-default-200/60 dark:border-default-700/60">
                  {selectedWorkspace.name}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Manajemen brankas kas, rekening bank, dan e-wallet dengan fitur transfer antar dompet instan via drag & drop.
            </p>
          </div>
        </div>

        {/* Row 2: Buttons dan gitu aja */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle: DnD vs TanStack Table */}
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

          {/* AI Treasury Advisor Button */}
          <Button
            size="sm"
            variant="outline"
            onPress={() => setIsAiTreasuryOpen(true)}
            className="h-9 px-3 text-xs font-semibold bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-500" />
            <span>AI Treasury Advisor</span>
          </Button>

          {/* Pilih Entitas Workspace */}
          <Link
            href="/workspaces"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-default-50 dark:hover:bg-default-800 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 shadow-2xs transition cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-default-500" />
            <span>Pilih Entitas Workspace</span>
          </Link>

          {/* Tambah Rekening Baru Button */}
          <Button
            size="sm"
            variant="primary"
            onPress={handleOpenCreate}
            className="h-9 px-4 text-xs font-semibold bg-theme-gradient text-white cursor-pointer shadow-xs hover:opacity-95 active:scale-95 transition-all shadow-theme-primary"
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Tambah Rekening Baru</span>
          </Button>
        </div>
      </div>

      {/* ── 2. Top Summary KPI Cards (High Contrast Surface) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquid Capital */}
        <Card className="p-4.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs flex flex-col justify-between min-h-[136px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-default-500 uppercase tracking-wider">
                Total Saldo Likuid
              </span>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-color)" }}
              >
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span
                className="text-2xl font-extrabold tracking-tight block truncate"
                style={{ color: "var(--primary-color)" }}
                title={formatCurrency(totalBalance)}
              >
                {formatCurrency(totalBalance)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-default-100 dark:border-default-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-default-400 truncate">Seluruh saldo kas terintegrasi</span>
            <span
              className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md shrink-0"
              style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-color)" }}
            >
              {accounts.length} rekening
            </span>
          </div>
        </Card>

        {/* Bank Accounts Total */}
        <Card className="p-4.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs flex flex-col justify-between min-h-[136px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-default-500 uppercase tracking-wider">
                Rekening Bank
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span
                className="text-2xl font-extrabold text-foreground tracking-tight block truncate"
                title={formatCurrency(bankTotal)}
              >
                {formatCurrency(bankTotal)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-default-100 dark:border-default-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-default-400 truncate">Giro & tabungan perbankan</span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
              {accounts.filter((a) => a.type === "bank").length} bank aktif
            </span>
          </div>
        </Card>

        {/* E-Wallets Total */}
        <Card className="p-4.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs flex flex-col justify-between min-h-[136px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-default-500 uppercase tracking-wider">
                Dompet Digital (E-Wallet)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span
                className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight block truncate"
                title={formatCurrency(ewalletTotal)}
              >
                {formatCurrency(ewalletTotal)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-default-100 dark:border-default-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-default-400 truncate">GoPay, OVO, ShopeePay & instan</span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
              {accounts.filter((a) => a.type === "ewallet").length} e-wallet
            </span>
          </div>
        </Card>

        {/* Physical Cash Total */}
        <Card className="p-4.5 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs flex flex-col justify-between min-h-[136px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-default-500 uppercase tracking-wider">
                Kas Tunai & Petty Cash
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span
                className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight block truncate"
                title={formatCurrency(cashTotal)}
              >
                {formatCurrency(cashTotal)}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-default-100 dark:border-default-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-default-400 truncate">Brankas fisik & operasional</span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
              {accounts.filter((a) => a.type === "cash").length} pos kas
            </span>
          </div>
        </Card>
      </div>

      {/* ── 3. Drag-and-Drop Instruction Banner ────────────────────────── */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg bg-theme-primary/10 text-theme-primary shrink-0"
            style={{ color: "var(--primary-color)" }}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <span className="text-foreground">
            <strong>Tips Drag & Drop:</strong> Tarik kartu rekening dan lepas di atas rekening lain untuk transfer saldo & rebalance instan!
          </span>
        </div>
        <span className="hidden sm:inline text-default-400 font-mono text-[11px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 border border-default-200/60 dark:border-default-700/60">
          Double-entry ledger otomatis
        </span>
      </div>

      {/* ── 4. Filter and Search Bar ──────────────────────────────────── */}
      <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-default-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Cari nama rekening, nomor akun, atau bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-default-200/80 dark:border-default-700 bg-default-50 dark:bg-default-800/80 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["all", "bank", "ewallet", "cash", "credit"].map((t) => {
              const isSelected = typeFilter === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs ${
                    isSelected
                      ? "text-white shadow-xs font-bold border-transparent"
                      : "bg-default-50 dark:bg-default-800/80 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-700 dark:text-default-300 hover:text-foreground"
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
                  {t === "all"
                    ? `Semua (${accounts.length})`
                    : t === "bank"
                    ? `Bank (${accounts.filter((a) => a.type === "bank").length})`
                    : t === "ewallet"
                    ? `E-Wallet (${accounts.filter((a) => a.type === "ewallet").length})`
                    : t === "cash"
                    ? `Kas (${accounts.filter((a) => a.type === "cash").length})`
                    : "Kredit"}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ── 5. Main Content: DnD Cards vs TanStack Table ──────────────── */}
      {filteredAccounts.length > 0 ? (
        viewMode === "table" ? (
          <Card className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="border-b border-default-200/80 dark:border-default-800 bg-default-100/50 dark:bg-default-900/50 text-default-600 dark:text-default-400 font-semibold"
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="py-3 px-4 text-xs select-none cursor-pointer hover:text-foreground transition"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1.5">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <span className="text-[10px] text-theme-primary">▲</span>,
                              desc: <span className="text-[10px] text-theme-primary">▼</span>,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-default-100 dark:divide-default-800/60">
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-default-50/80 dark:hover:bg-default-800/40 transition"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-10 text-default-400">
                        Tidak ada rekening yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-default-200/80 dark:border-default-800 bg-default-50/40 dark:bg-default-900/20 text-xs text-default-500">
              <div>
                Halaman {table.getState().pagination.pageIndex + 1} dari {Math.max(1, table.getPageCount())}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  isIconOnly
                  onPress={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                  className="h-7 w-7 rounded-lg border-default-200 dark:border-default-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  isIconOnly
                  onPress={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                  className="h-7 w-7 rounded-lg border-default-200 dark:border-default-700"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* DnD Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAccounts.map((acc) => {
              const isBank = acc.type === "bank";
              const isEwallet = acc.type === "ewallet";
              const isCash = acc.type === "cash";
              const balanceNum = Number(acc.balance) || 0;
              const sharePercent = totalBalance > 0 ? Math.max(0, (balanceNum / totalBalance) * 100) : 0;
              const isTargetDrop = dragOverAccountId === acc.id && draggedAccountId !== acc.id;

              return (
                <Card
                  key={acc.id}
                  draggable
                  onDragStart={(e) => handleDragStartWallet(e, acc)}
                  onDragOver={(e) => handleDragOverWallet(e, acc.id)}
                  onDragLeave={handleDragLeaveWallet}
                  onDrop={(e) => handleDropOnWallet(e, acc)}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group select-none ${
                    isTargetDrop
                      ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10 shadow-lg scale-[1.02]"
                      : "border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-2xs hover:shadow-md hover:border-theme-primary/50"
                  }`}
                >
                  {/* Subtle top accent gradient */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      isEwallet
                        ? "bg-linear-to-r from-emerald-500 to-teal-600"
                        : isCash
                        ? "bg-linear-to-r from-amber-500 to-orange-600"
                        : !isBank
                        ? "bg-linear-to-r from-purple-500 to-pink-600"
                        : ""
                    }`}
                    style={
                      isBank
                        ? { background: "var(--primary-gradient)" }
                        : undefined
                    }
                  />

                  {/* Drop Indicator Overlay if dragging over */}
                  {isTargetDrop && (
                    <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 z-10 pointer-events-none text-center">
                      <ArrowLeftRight className="w-8 h-8 text-emerald-600 animate-bounce mb-1" />
                      <p className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        Lepas untuk Transfer Masuk ke {acc.name}
                      </p>
                    </div>
                  )}

                  {/* Card Main Info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mt-1">
                      <div className="flex items-center gap-2.5">
                        {/* Drag handle */}
                        <div className="text-default-300 group-hover:text-default-500 transition cursor-grab">
                          <GripVertical className="w-4 h-4" />
                        </div>

                        <BankLogo
                          bankName={acc.bankName}
                          accountName={acc.name}
                          type={acc.type}
                          size={42}
                        />
                        <div>
                          <div className="text-sm font-bold text-foreground leading-snug group-hover:text-theme-primary transition">
                            {acc.name}
                          </div>
                          <div className="text-xs text-default-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-400 border border-default-200/60 dark:border-default-700/60">
                              {acc.type}
                            </span>
                            {acc.bankName && <span>• {acc.bankName}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          className="p-1.5 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer"
                          title="Edit rekening"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(acc)}
                          className="p-1.5 rounded-lg text-default-400 hover:text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Hapus rekening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Account number row */}
                    {acc.accountNumber && (
                      <div className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-default-50 dark:bg-default-800/60 border border-default-200/60 dark:border-default-700/60 text-xs font-mono text-default-600 dark:text-default-300">
                        <span>{acc.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyAccountNumber(acc.accountNumber!, acc.id)}
                          className="text-default-400 hover:text-foreground flex items-center gap-1 text-[11px] font-sans cursor-pointer"
                        >
                          {copiedId === acc.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {copiedId === acc.id ? "Tersalin" : "Salin"}
                        </button>
                      </div>
                    )}

                    {/* Balance Display & Share Progress */}
                    <div className="mt-4">
                      <span className="text-xs text-default-400 font-medium">Saldo Likuid</span>
                      <div
                        className={`text-2xl font-bold tracking-tight mt-0.5 ${
                          balanceNum < 0 ? "text-rose-500" : "text-foreground"
                        }`}
                      >
                        {formatCurrency(balanceNum)}
                      </div>
                      {/* Share bar */}
                      <div className="mt-2 w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, sharePercent)}%`,
                            backgroundColor: "var(--primary-color)",
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-default-400 mt-1 font-mono">
                        <span>Porsi Kas: {sharePercent.toFixed(1)}%</span>
                        {balanceNum > 2000000000 && isBank && (
                          <span
                            className="text-amber-500 font-semibold flex items-center gap-1"
                            title="Melebihi penjaminan LPS"
                          >
                            <AlertTriangle className="w-3 h-3" /> &gt;LPS Rp2M
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Links */}
                  <div className="mt-4 pt-3 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs">
                    <Link
                      href={`/transactions?account=${encodeURIComponent(acc.name)}`}
                      className="hover:underline font-semibold flex items-center gap-1 transition"
                      style={{ color: "var(--primary-color)" }}
                    >
                      <span>Jurnal Transaksi</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(acc)}
                      className="text-default-500 hover:text-foreground font-medium flex items-center gap-1 text-xs cursor-pointer"
                      title="Sesuaikan saldo awal atau rekonsiliasi kas"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Sesuaikan Saldo</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <Card className="p-12 text-center border-2 border-dashed border-default-200/80 dark:border-default-800 rounded-2xl space-y-3 bg-white dark:bg-gray-900 shadow-2xs">
          <div
            className="w-12 h-12 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center mx-auto"
            style={{ color: "var(--primary-color)" }}
          >
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Belum Ada Rekening atau Dompet</h3>
          <p className="text-xs text-default-500 max-w-sm mx-auto">
            Buat rekening bank (BCA, Mandiri), e-wallet (GoPay, OVO), atau kas tunai untuk mulai mencatat keuangan.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs hover:opacity-95 transition cursor-pointer"
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            + Tambah Rekening Sekarang
          </button>
        </Card>
      )}

      {/* 6. Drag-to-Transfer Modal */}
      {isTransferModalOpen && transferSource && transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Realokasi & Transfer Antar Dompet</h3>
                  <p className="text-xs text-default-500">Mutasi kas ganda (Double-entry Ledger)</p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Transfer Flow Diagram */}
            <div className="p-3.5 rounded-xl bg-default-50 dark:bg-default-800/80 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 max-w-[150px]">
                <BankLogo
                  bankName={transferSource.bankName}
                  accountName={transferSource.name}
                  type={transferSource.type}
                  size={32}
                />
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] text-default-400 uppercase font-mono block">Sumber</span>
                  <p className="font-bold text-foreground truncate text-xs">{transferSource.name}</p>
                  <span className="text-[11px] text-default-500 font-mono block">{formatCurrency(transferSource.balance)}</span>
                </div>
              </div>

              <div
                className="p-2 rounded-full bg-white dark:bg-gray-900 border border-default-200 dark:border-default-700 shrink-0 shadow-2xs"
                style={{ color: "var(--primary-color)" }}
              >
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="flex items-center justify-end gap-2.5 max-w-[150px] text-right">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] text-default-400 uppercase font-mono block">Tujuan</span>
                  <p className="font-bold text-foreground truncate text-xs">{transferTarget.name}</p>
                  <span className="text-[11px] text-default-500 font-mono block">{formatCurrency(transferTarget.balance)}</span>
                </div>
                <BankLogo
                  bankName={transferTarget.bankName}
                  accountName={transferTarget.name}
                  type={transferTarget.type}
                  size={32}
                />
              </div>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground mb-1 block">
                  Nominal Transfer ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  placeholder="Misal: 500000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-mono font-bold bg-default-50 dark:bg-default-800 border border-default-200 dark:border-default-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary/40 text-foreground"
                  autoFocus
                />
              </div>

              {/* Quick Nominal Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[50000, 100000, 500000, 1000000, 5000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setTransferAmount(String(val))}
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-default-50 dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 font-medium transition cursor-pointer"
                  >
                    +{formatCurrency(val)}
                  </button>
                ))}
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">Catatan Mutasi</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  className="w-full px-3 py-2 bg-default-50 dark:bg-default-800 border border-default-200 dark:border-default-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme-primary/40 text-xs text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-default-100 dark:bg-default-800 hover:bg-default-200 dark:hover:bg-default-700 text-foreground text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isTransferring || !transferAmount}
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  {isTransferring ? "Memproses Transfer..." : "Eksekusi Transfer"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 7. AI Treasury Advisor Modal */}
      {isAiTreasuryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">AI Liquidity & Treasury Advisor</h3>
                  <p className="text-xs text-default-500">Optimalisasi imbal hasil kas & mitigasi risiko plafon LPS</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiTreasuryOpen(false)}
                className="p-1 text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Cash Drag & Idle Yield */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-700 dark:text-amber-400">
                    Deteksi Dana Menganggur (Idle Cash Drag)
                  </p>
                  <p className="text-default-500 text-[11px] mt-0.5">
                    Saldo kas tunai & giro Anda tercatat <strong>{formatCurrency(bankTotal + cashTotal)}</strong>. Sekitar 60% dana operasional ini dapat dipindahkan ke Reksadana Pasar Uang (Money Market Fund) atau Deposito Digital untuk menghasilkan bunga 4.5% - 5.5% p.a.
                  </p>
                </div>
              </div>

              {/* LPS Protection Shield */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    Plafon Penjaminan LPS (Rp 2.000.000.000)
                  </p>
                  <p className="text-default-500 text-[11px] mt-0.5">
                    Seluruh rekening bank Anda berada di bawah batas Rp 2 Miliar per lembaga perbankan. Saldo kas 100% aman dan terjamin oleh Lembaga Penjamin Simpanan (LPS).
                  </p>
                </div>
              </div>

              {/* Recommended Rebalance */}
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-1.5">
                <span className="font-bold text-purple-600 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                  <Zap className="w-3 h-3" /> Rekomendasi Alokasi Likuiditas 30/70:
                </span>
                <p className="text-default-600 text-[11px] leading-relaxed">
                  Pertahankan <strong>30% kas likuid</strong> di rekening bank operasional untuk transaksi harian, dan alokasikan <strong>70% sisanya</strong> ke pos tabungan yield tinggi atau instrumen pasar uang berjangka.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
              <button
                type="button"
                onClick={() => setIsAiTreasuryOpen(false)}
                className="px-4 py-2 rounded-xl text-white font-medium text-xs shadow-xs hover:opacity-95 transition cursor-pointer"
                style={{ backgroundColor: "var(--primary-color)" }}
              >
                Tutup & Terapkan Wawasan
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* 8. Modal Tambah Rekening Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl bg-theme-primary/10 text-theme-primary"
                  style={{ color: "var(--primary-color)" }}
                >
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Tambah Rekening / Dompet Baru</h3>
                  <p className="text-xs text-default-500">Daftarkan akun kas ke workspace aktif</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-3.5 text-xs">
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tipe Rekening */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tipe Rekening / Dompet *</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["bank", "ewallet", "cash", "credit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`h-8 rounded-xl font-semibold text-xs transition uppercase cursor-pointer ${
                        formType === t
                          ? "text-white shadow-xs font-bold"
                          : "bg-default-50 dark:bg-default-800 text-default-600 dark:text-default-400 hover:text-foreground border border-default-200 dark:border-default-700"
                      }`}
                      style={
                        formType === t
                          ? { backgroundColor: "var(--primary-color)", color: "#ffffff" }
                          : undefined
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Rekening */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Akun / Rekening *</label>
                <input
                  type="text"
                  placeholder="Contoh: BCA Tahapan, Mandiri Utama, GoPay Harian"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                  required
                />
              </div>

              {/* Bank / Provider */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Bank / Provider</label>
                <input
                  type="text"
                  placeholder="BCA, Mandiri, BRI, GoPay..."
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                />
                <div className="flex items-center gap-1 mt-1 overflow-x-auto py-0.5">
                  {BANK_PRESETS.slice(0, 7).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormBankName(p)}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-default-50 dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 shrink-0 cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nomor Rekening */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nomor Rekening / No. HP (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40 font-mono"
                />
              </div>

              {/* Saldo Awal */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Saldo Awal ({currency})</label>
                <input
                  type="number"
                  step="1000"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-default-100 dark:bg-default-800 hover:bg-default-200 dark:hover:bg-default-700 text-foreground text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Rekening"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 9. Modal Edit Rekening */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className="p-2 rounded-xl bg-theme-primary/10 text-theme-primary"
                  style={{ color: "var(--primary-color)" }}
                >
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Edit Rekening / Sesuaikan Saldo</h3>
                  <p className="text-xs text-default-500">Perbarui informasi rekening kas</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-default-400 hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpdate} className="space-y-3.5 text-xs">
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tipe Rekening */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tipe Rekening / Dompet</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["bank", "ewallet", "cash", "credit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`h-8 rounded-xl font-semibold text-xs transition uppercase cursor-pointer ${
                        formType === t
                          ? "text-white shadow-xs font-bold"
                          : "bg-default-50 dark:bg-default-800 text-default-600 dark:text-default-400 hover:text-foreground border border-default-200 dark:border-default-700"
                      }`}
                      style={
                        formType === t
                          ? { backgroundColor: "var(--primary-color)", color: "#ffffff" }
                          : undefined
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Rekening */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Akun / Rekening *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                  required
                />
              </div>

              {/* Bank / Provider */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Bank / Provider</label>
                <input
                  type="text"
                  placeholder="BCA, Mandiri, BRI, GoPay, Chase..."
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                />
                <div className="flex items-center gap-1 mt-1 overflow-x-auto py-0.5">
                  {BANK_PRESETS.slice(0, 8).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormBankName(p)}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-default-50 dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 shrink-0 cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nomor Rekening */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nomor Rekening / Akun</label>
                <input
                  type="text"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40 font-mono"
                />
              </div>

              {/* Penyesuaian Saldo Kas */}
              <div className="space-y-1.5 p-3 rounded-xl bg-default-50/80 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground text-xs">Penyesuaian Saldo Kas ({currency})</label>
                  <span className="text-[10px] text-default-400 font-mono">Rekonsiliasi / Saldo Awal</span>
                </div>
                <input
                  type="number"
                  step="1000"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                />
                <p className="text-[10.5px] text-default-400 leading-relaxed">
                  💡 <strong>Mengapa saldo bisa disesuaikan?</strong> Fitur ini berguna saat onboarding akun baru atau opname fisik (rekonsiliasi selisih kas). Untuk transaksi operasional reguler, catat melalui menu Transaksi agar buku besar (double-entry ledger) tetap presisi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-default-100 dark:bg-default-800 hover:bg-default-200 dark:hover:bg-default-700 text-foreground text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  {isSubmitting ? "Menyimpan..." : "Perbarui Rekening"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 10. Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xl p-5 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Hapus Rekening?</h4>
            <p className="text-xs text-default-500">
              Apakah Anda yakin ingin menghapus rekening{" "}
              <strong className="text-foreground">{selectedAccount.name}</strong>?
            </p>
            {errorMessage && (
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 text-xs">
                {errorMessage}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-default-100 dark:bg-default-800 hover:bg-default-200 dark:hover:bg-default-700 text-foreground text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-600/30 disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Rekening"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
