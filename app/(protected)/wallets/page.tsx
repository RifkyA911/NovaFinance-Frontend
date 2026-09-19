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
  RefreshCw,
  Landmark,
} from "lucide-react";
import { Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import type { Account } from "../../lib/api";
import { playSoftChime } from "@/app/lib/sound";

const BANK_PRESETS = [
  "BCA",
  "Mandiri",
  "BRI",
  "BNI",
  "Bank Jago",
  "SeaBank",
  "BSI (Syariah)",
  "CIMB Niaga",
  "Permata",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
  "Cash / Tunai",
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

  return (
    <div className="min-h-screen bg-default-50/50 p-4 md:p-6 lg:p-8 space-y-6">
      {/* 1. Header Section with Breadcrumb Link to /workspaces */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-default-200 pb-5">
        <div>
          {/* Breadcrumb back to Workspaces */}
          <div className="flex items-center gap-1.5 text-xs text-default-500 mb-1.5">
            <Link href="/workspaces" className="hover:text-primary transition flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Workspaces</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-default-400" />
            <span className="font-semibold text-foreground">{selectedWorkspace?.name || "Workspace"}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Master Wallets & Liquidity Hub
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium border border-blue-500/20">
                  Drag & Drop Ready
                </span>
              </h1>
              <p className="text-xs md:text-sm text-default-500">
                Manajemen brankas kas, rekening bank, dan e-wallet dengan fitur transfer antar dompet instan via drag & drop.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* AI Treasury Advisor Button */}
          <button
            type="button"
            onClick={() => setIsAiTreasuryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-semibold text-xs h-9 transition border border-purple-500/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>AI Treasury Advisor</span>
          </button>

          <Link
            href="/workspaces"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-default-500" />
            <span>Pilih Entitas Workspace</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs h-9 shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Rekening Baru</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Liquid Capital */}
        <Card className="p-4 rounded-2xl border border-default-200 shadow-sm bg-background">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider">Total Saldo Likuid</p>
              <p className="text-xl font-bold tracking-tight text-primary">
                {formatCurrency(totalBalance)}
              </p>
              <div className="text-xs text-default-400 font-mono">
                {accounts.length} rekening terhubung
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* Bank Accounts Total */}
        <Card className="p-4 rounded-2xl border border-default-200 shadow-sm bg-background">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider">Rekening Bank</p>
              <p className="text-xl font-bold tracking-tight text-foreground">
                {formatCurrency(bankTotal)}
              </p>
              <div className="text-xs text-default-400 font-mono">
                {accounts.filter((a) => a.type === "bank").length} bank aktif
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* E-Wallets Total */}
        <Card className="p-4 rounded-2xl border border-default-200 shadow-sm bg-background">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider">Dompet Digital (E-Wallet)</p>
              <p className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(ewalletTotal)}
              </p>
              <div className="text-xs text-default-400 font-mono">
                {accounts.filter((a) => a.type === "ewallet").length} e-wallet
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* Physical Cash Total */}
        <Card className="p-4 rounded-2xl border border-default-200 shadow-sm bg-background">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider">Kas Tunai (Physical Cash)</p>
              <p className="text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                {formatCurrency(cashTotal)}
              </p>
              <div className="text-xs text-default-400 font-mono">
                {accounts.filter((a) => a.type === "cash").length} pos kas
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Drag-and-Drop Instruction Banner */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/20 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary shrink-0" />
          <span className="text-foreground">
            <strong>Tips Drag & Drop:</strong> Tarik kartu satu rekening dan lepas di atas rekening lain untuk transfer saldo & rebalance instan!
          </span>
        </div>
        <span className="hidden sm:inline text-default-400 font-mono text-[11px]">
          Double-entry ledger otomatis
        </span>
      </div>

      {/* 4. Filter and Search Bar */}
      <Card className="p-4 border border-default-200 shadow-sm bg-background">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-default-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Cari nama rekening, nomor akun, atau bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-default-200 bg-default-100 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["all", "bank", "ewallet", "cash", "credit"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs ${
                  typeFilter === t
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30 border border-blue-600"
                    : "bg-white dark:bg-default-800/80 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-700 dark:text-default-300 hover:text-foreground"
                }`}
              >
                {t === "all"
                  ? `Semua (${accounts.length})`
                  : t === "bank"
                  ? "Bank"
                  : t === "ewallet"
                  ? "E-Wallet"
                  : t === "cash"
                  ? "Kas Tunai"
                  : "Kredit"}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* 5. Wallets & Accounts Grid with Drag-to-Transfer */}
      {filteredAccounts.length > 0 ? (
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
                    : "border-default-200 bg-background hover:shadow-md hover:border-primary/40"
                }`}
              >
                {/* Subtle top accent gradient */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isBank
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                      : isEwallet
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                      : isCash
                      ? "bg-gradient-to-r from-amber-500 to-orange-600"
                      : "bg-gradient-to-r from-purple-500 to-pink-600"
                  }`}
                />

                {/* Drop Indicator Overlay if dragging over */}
                {isTargetDrop && (
                  <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 z-10 pointer-events-none text-center">
                    <ArrowLeftRight className="w-8 h-8 text-emerald-600 animate-bounce mb-1" />
                    <p className="font-bold text-emerald-700 text-xs">
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

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          isBank
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : isEwallet
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : isCash
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        {isBank ? (
                          <Landmark className="w-5 h-5" />
                        ) : isEwallet ? (
                          <CreditCard className="w-5 h-5" />
                        ) : (
                          <Coins className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition">
                          {acc.name}
                        </div>
                        <div className="text-xs text-default-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-default-100 text-default-600">
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
                        className="p-1.5 rounded-lg text-default-400 hover:text-primary hover:bg-default-100 transition"
                        title="Edit rekening"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(acc)}
                        className="p-1.5 rounded-lg text-default-400 hover:text-rose-600 hover:bg-rose-500/10 transition"
                        title="Hapus rekening"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Account number row */}
                  {acc.accountNumber && (
                    <div className="mt-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-default-100 border border-default-200 text-xs font-mono text-default-600">
                      <span>{acc.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyAccountNumber(acc.accountNumber!, acc.id)}
                        className="text-default-400 hover:text-foreground flex items-center gap-1 text-[11px] font-sans"
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
                    <div className="mt-2 w-full bg-default-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, sharePercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-default-400 mt-1 font-mono">
                      <span>Porsi Kas: {sharePercent.toFixed(1)}%</span>
                      {balanceNum > 2000000000 && isBank && (
                        <span className="text-amber-500 font-semibold flex items-center gap-1" title="Melebihi penjaminan LPS">
                          <AlertTriangle className="w-3 h-3" /> &gt;LPS Rp2M
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Links */}
                <div className="mt-4 pt-3 border-t border-default-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/transactions?account=${encodeURIComponent(acc.name)}`}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Jurnal Transaksi</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(acc)}
                    className="text-default-500 hover:text-foreground font-medium flex items-center gap-1 text-xs"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Ubah Saldo</span>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed border-default-200 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Belum Ada Rekening atau Dompet</h3>
          <p className="text-xs text-default-500 max-w-sm mx-auto">
            Buat rekening bank (BCA, Mandiri), e-wallet (GoPay, OVO), atau kas tunai untuk mulai mencatat keuangan.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm shadow-primary/30"
          >
            + Tambah Rekening Sekarang
          </button>
        </Card>
      )}

      {/* 6. Drag-to-Transfer Modal */}
      {isTransferModalOpen && transferSource && transferTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <Card className="bg-background border border-default-200 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
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
                className="p-1 text-default-400 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Transfer Flow Diagram */}
            <div className="p-3.5 rounded-xl bg-default-100 flex items-center justify-between text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-[10px] text-default-400 uppercase">Sumber (Keluar)</span>
                <p className="font-bold text-foreground truncate max-w-[130px]">{transferSource.name}</p>
                <span className="text-[11px] text-default-500">{formatCurrency(transferSource.balance)}</span>
              </div>

              <div className="p-2 rounded-full bg-background border border-default-200 text-primary">
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-[10px] text-default-400 uppercase">Tujuan (Masuk)</span>
                <p className="font-bold text-foreground truncate max-w-[130px]">{transferTarget.name}</p>
                <span className="text-[11px] text-default-500">{formatCurrency(transferTarget.balance)}</span>
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
                  className="w-full px-3 py-2.5 text-sm font-mono font-bold bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-default-100 hover:bg-default-200 border border-default-200 text-default-600 font-medium transition"
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
                  className="w-full px-3 py-2 bg-default-100 border border-default-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isTransferring || !transferAmount}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/30 disabled:opacity-50 transition"
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
          <Card className="bg-background border border-default-200 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
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
                className="p-1 text-default-400 hover:text-foreground"
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100">
              <button
                type="button"
                onClick={() => setIsAiTreasuryOpen(false)}
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium text-xs shadow-sm shadow-primary/30"
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
          <Card className="w-full max-w-md bg-background rounded-2xl border border-default-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Tambah Rekening / Dompet Baru</h3>
                  <p className="text-xs text-default-500">Daftarkan akun kas ke workspace aktif</p>
                </div>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-default-400 hover:text-foreground">
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
                      className={`h-8 rounded-xl font-semibold text-xs transition uppercase ${
                        formType === t
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "bg-default-100 text-default-600 hover:text-foreground"
                      }`}
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
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
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
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="flex items-center gap-1 mt-1 overflow-x-auto py-0.5">
                  {BANK_PRESETS.slice(0, 7).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormBankName(p)}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-default-100 hover:bg-default-200 text-default-600 shrink-0"
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
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
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
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/30 disabled:opacity-50 transition"
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
          <Card className="w-full max-w-md bg-background rounded-2xl border border-default-200 shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-default-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Edit Rekening / Sesuaikan Saldo</h3>
                  <p className="text-xs text-default-500">Perbarui informasi rekening kas</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-default-400 hover:text-foreground">
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
                      className={`h-8 rounded-xl font-semibold text-xs transition uppercase ${
                        formType === t
                          ? "bg-primary text-white shadow-sm shadow-primary/30"
                          : "bg-default-100 text-default-600 hover:text-foreground"
                      }`}
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
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>

              {/* Bank / Provider */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Bank / Provider</label>
                <input
                  type="text"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Nomor Rekening */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nomor Rekening / Akun</label>
                <input
                  type="text"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
              </div>

              {/* Saldo Terkini */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Saldo Terkini ({currency})</label>
                <input
                  type="number"
                  step="1000"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-default-200 bg-default-100 text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-sm shadow-primary/30 disabled:opacity-50 transition"
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
          <Card className="w-full max-w-sm bg-background rounded-2xl border border-default-200 shadow-2xl p-5 text-center space-y-3">
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
                className="px-3.5 py-2 rounded-xl bg-default-100 hover:bg-default-200 text-foreground text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-600/30 disabled:opacity-50 transition"
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
