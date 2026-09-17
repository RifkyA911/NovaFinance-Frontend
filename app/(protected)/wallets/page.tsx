/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button, Card } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import type { Account } from "../../lib/api";
import Link from "next/link";

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

  const accounts: Account[] = accountsQuery.data?.data?.accounts || [];

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: selectedWorkspace?.currency || "IDR",
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

  // Filtered accounts list
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchType = typeFilter === "all" || acc.type === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        acc.name.toLowerCase().includes(q) ||
        (acc.bankName && acc.bankName.toLowerCase().includes(q)) ||
        (acc.accountNumber && acc.accountNumber.toLowerCase().includes(q));
      return matchType && matchSearch;
    });
  }, [accounts, typeFilter, searchQuery]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormName("");
    setFormType("bank");
    setFormBankName("BCA");
    setFormAccountNumber("");
    setFormBalance("0");
    setFormCurrency(selectedWorkspace?.currency || "IDR");
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
    setFormCurrency(acc.currency || "IDR");
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
        currency: formCurrency || "IDR",
        bankName: formBankName.trim() || undefined,
        accountNumber: formAccountNumber.trim() || undefined,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) }),
      ]);

      setIsCreateModalOpen(false);
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
        currency: formCurrency || "IDR",
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
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghapus rekening. Pastikan tidak ada transaksi yang tertaut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAccountNumber = (accNumber: string, id: string) => {
    navigator.clipboard.writeText(accNumber);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Master Wallets & Rekening
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-1">
              Kelola daftar rekening bank, e-wallet, dan kas tunai untuk workspace{" "}
              <span className="font-semibold text-foreground">
                {selectedWorkspace?.name || "Workspace"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenCreate}
              className="h-8.5 px-3 text-xs font-semibold bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Tambah Rekening Baru
            </Button>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Saldo Likuid</p>
                <p className="text-lg sm:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalBalance)}
                </p>
                <div className="text-[11px] text-default-400 font-medium">
                  {accounts.length} rekening terhubung
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Rekening Bank</p>
                <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {formatCurrency(bankTotal)}
                </p>
                <div className="text-[11px] text-default-400 font-medium">
                  {accounts.filter((a) => a.type === "bank").length} bank aktif
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Dompet Digital (E-Wallet)</p>
                <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(ewalletTotal)}
                </p>
                <div className="text-[11px] text-default-400 font-medium">
                  {accounts.filter((a) => a.type === "ewallet").length} e-wallet
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Kas Tunai (Physical Cash)</p>
                <p className="text-lg sm:text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {formatCurrency(cashTotal)}
                </p>
                <div className="text-[11px] text-default-400 font-medium">
                  {accounts.filter((a) => a.type === "cash").length} pos kas
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-default-200/80 dark:border-default-800">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-default-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              placeholder="Cari nama rekening, nomor akun, atau bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 pl-8 pr-3 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800/60 text-xs text-foreground placeholder:text-default-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === "all"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground"
              }`}
            >
              Semua ({accounts.length})
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("bank")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === "bank"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground"
              }`}
            >
              Bank
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("ewallet")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === "ewallet"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground"
              }`}
            >
              E-Wallet
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("cash")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                typeFilter === "cash"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground"
              }`}
            >
              Tunai
            </button>
          </div>
        </div>

        {/* Wallets & Accounts Grid */}
        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((acc) => {
              const isBank = acc.type === "bank";
              const isEwallet = acc.type === "ewallet";
              const isCash = acc.type === "cash";
              const balanceNum = Number(acc.balance) || 0;

              return (
                <div
                  key={acc.id}
                  className="rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Subtle top accent gradient */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${
                      isBank
                        ? "bg-linear-to-r from-blue-500 to-indigo-600"
                        : isEwallet
                        ? "bg-linear-to-r from-emerald-500 to-teal-600"
                        : isCash
                        ? "bg-linear-to-r from-amber-500 to-orange-600"
                        : "bg-linear-to-r from-purple-500 to-pink-600"
                    }`}
                  />

                  {/* Top card info */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mt-1">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
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
                            <Building2 className="w-4.5 h-4.5" />
                          ) : isEwallet ? (
                            <CreditCard className="w-4.5 h-4.5" />
                          ) : (
                            <Coins className="w-4.5 h-4.5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground leading-snug">
                            {acc.name}
                          </div>
                          <div className="text-[11px] text-default-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold uppercase text-[10px] tracking-wider px-1.5 py-0.2 rounded bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-300">
                              {acc.type}
                            </span>
                            {acc.bankName && <span>• {acc.bankName}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Dropdown / Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          className="p-1.5 rounded-lg text-default-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Edit rekening"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(acc)}
                          className="p-1.5 rounded-lg text-default-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus rekening"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Account number row */}
                    {acc.accountNumber && (
                      <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-default-50 dark:bg-default-800/60 border border-default-100 dark:border-default-800 text-xs font-mono text-default-600 dark:text-default-300">
                        <span>{acc.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyAccountNumber(acc.accountNumber!, acc.id)}
                          className="text-default-400 hover:text-foreground flex items-center gap-1 text-[10px] font-sans"
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

                    {/* Balance */}
                    <div className="mt-4">
                      <span className="text-[11px] text-default-400 font-medium">Saldo Saat Ini</span>
                      <div
                        className={`text-xl sm:text-2xl font-bold tracking-tight mt-0.5 ${
                          balanceNum < 0
                            ? "text-rose-500"
                            : "text-foreground"
                        }`}
                      >
                        {formatCurrency(balanceNum)}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Links */}
                  <div className="mt-4 pt-3 border-t border-default-100 dark:border-default-800 flex items-center justify-between text-xs">
                    <Link
                      href={`/transactions?account=${encodeURIComponent(acc.name)}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      Lihat Transaksi
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(acc)}
                      className="text-default-500 hover:text-foreground font-medium flex items-center gap-1 text-[11px]"
                    >
                      <Sliders className="w-3 h-3" />
                      Ubah Saldo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Belum Ada Rekening atau Dompet</h3>
            <p className="text-xs text-default-500 max-w-sm mx-auto mt-1 mb-4">
              Buat rekening bank (BCA, Mandiri), e-wallet (GoPay, OVO), atau kas tunai untuk mulai mencatat keuangan.
            </p>
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenCreate}
              className="text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tambah Rekening Sekarang
            </Button>
          </div>
        )}
      </div>

      {/* Modal Tambah Rekening Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-default-200 dark:border-default-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-default-100 dark:border-default-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Tambah Rekening / Dompet Baru</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-default-400 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="p-4 space-y-3.5 text-xs">
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tipe Rekening */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Tipe Rekening / Dompet *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["bank", "ewallet", "cash", "credit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`h-8 rounded-lg font-semibold text-xs transition-all uppercase ${
                        formType === t
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Rekening */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Nama Akun / Rekening *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: BCA Tahapan, Mandiri Utama, GoPay Harian"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bank / Provider Preset & Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Nama Bank / Provider
                </label>
                <input
                  type="text"
                  placeholder="BCA, Mandiri, BRI, GoPay..."
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                {/* Preset Pills */}
                <div className="flex items-center gap-1 mt-1 overflow-x-auto no-scrollbar py-0.5">
                  {BANK_PRESETS.slice(0, 7).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormBankName(p)}
                      className="px-2 py-0.5 rounded text-[10px] bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground shrink-0"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nomor Rekening */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Nomor Rekening / No. HP (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Saldo Awal */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Saldo Awal (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs h-8"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  isDisabled={isSubmitting}
                  className="text-xs h-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Check className="w-3.5 h-3.5 mr-1" />
                  )}
                  Simpan Rekening
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Rekening */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-default-200 dark:border-default-800 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-default-100 dark:border-default-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Edit Rekening / Sesuaikan Saldo</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-default-400 hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpdate} className="p-4 space-y-3.5 text-xs">
              {errorMessage && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Tipe Rekening */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Tipe Rekening / Dompet
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["bank", "ewallet", "cash", "credit"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`h-8 rounded-lg font-semibold text-xs transition-all uppercase ${
                        formType === t
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Rekening */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Nama Akun / Rekening *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Bank / Provider */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Nama Bank / Provider
                </label>
                <input
                  type="text"
                  value={formBankName}
                  onChange={(e) => setFormBankName(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Nomor Rekening */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Nomor Rekening / Akun
                </label>
                <input
                  type="text"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Saldo Terkini */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-default-500 uppercase">
                  Saldo Terkini (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  value={formBalance}
                  onChange={(e) => setFormBalance(e.target.value)}
                  className="w-full h-8.5 px-2.5 rounded-lg border border-default-200 dark:border-default-700 bg-white dark:bg-gray-800 text-foreground text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs h-8"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  type="submit"
                  isDisabled={isSubmitting}
                  className="text-xs h-8 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : (
                    <Check className="w-3.5 h-3.5 mr-1" />
                  )}
                  Perbarui Rekening
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl border border-default-200 dark:border-default-800 shadow-xl p-5 text-center space-y-3">
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs h-8"
              >
                Batal
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmitDelete}
                isDisabled={isSubmitting}
                className="text-xs h-8 font-semibold bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                )}
                Hapus Rekening
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
