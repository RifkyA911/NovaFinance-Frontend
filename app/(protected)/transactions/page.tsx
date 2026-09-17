/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Spinner,
  Modal,
  Label,
  Select,
  ListBox,
} from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Building2,
  Trash2,
  X,
  Calendar,
  DollarSign,
  Receipt,
} from "lucide-react";
import {
  useLegacyTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { type SortingState } from "@tanstack/react-table";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import type { TransactionWithIcon } from "../../lib/api";
import MagicQuickAdd from "./components/MagicQuickAdd";
import { TransactionsTable } from "../dashboard/components/TransactionsTable";

export default function Transactions() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspace();

  // Sorting and filtering state
  const [apiSortBy, setApiSortBy] = useState<"createdAt" | "date">("createdAt");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterAccount, setFilterAccount] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterMinAmount, setFilterMinAmount] = useState<string>("");
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>("");

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // TanStack pagination & sorting
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [jumpPageVal, setJumpPageVal] = useState("");

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
  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(selectedWorkspace?.id || "", 1000, apiSortBy),
    queryFn: () => queryFunctions.transactions(selectedWorkspace?.id || "", 1000, apiSortBy),
    enabled: !!selectedWorkspace,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.categories(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace,
  });

  const accountsQuery = useQuery({
    queryKey: queryKeys.accounts(selectedWorkspace?.id),
    queryFn: () => queryFunctions.accounts(selectedWorkspace?.id),
    enabled: !!selectedWorkspace?.id,
  });

  const rawTransactions = useMemo(
    () => transactionsQuery.data?.data?.transactions || [],
    [transactionsQuery.data?.data?.transactions]
  );
  const allCategories = useMemo(
    () => categoriesQuery.data?.data?.categories || [],
    [categoriesQuery.data?.data?.categories]
  );
  const allAccounts = useMemo(
    () => accountsQuery.data?.data?.accounts || [],
    [accountsQuery.data?.data?.accounts]
  );

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterType !== "ALL") count++;
    if (filterCategory) count++;
    if (filterAccount) count++;
    if (filterStartDate || filterEndDate) count++;
    if (filterMinAmount || filterMaxAmount) count++;
    if (filterKeyword) count++;
    return count;
  }, [
    filterType,
    filterCategory,
    filterAccount,
    filterStartDate,
    filterEndDate,
    filterMinAmount,
    filterMaxAmount,
    filterKeyword,
  ]);

  const resetAllFilters = () => {
    setFilterKeyword("");
    setFilterType("ALL");
    setFilterCategory("");
    setFilterAccount("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMinAmount("");
    setFilterMaxAmount("");
  };

  // Filter transactions with complete criteria
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter((tx: any) => {
      // Type filter
      if (filterType !== "ALL" && tx.type?.toUpperCase() !== filterType) return false;

      // Category filter
      if (filterCategory) {
        const catName = typeof tx.category === "object" && tx.category ? tx.category.name : tx.category;
        if (catName !== filterCategory) return false;
      }

      // Account filter
      if (filterAccount) {
        const accId = tx.accountId || (typeof tx.account === "object" ? tx.account?.id : tx.account);
        if (accId !== filterAccount) return false;
      }

      // Date Range filter
      if (filterStartDate || filterEndDate) {
        const txDate = tx.date ? new Date(tx.date).getTime() : 0;
        if (filterStartDate && txDate < new Date(filterStartDate).getTime()) return false;
        if (filterEndDate && txDate > new Date(filterEndDate).getTime() + 86400000) return false;
      }

      // Amount Range filter
      if (filterMinAmount) {
        const min = parseFloat(filterMinAmount);
        if (!isNaN(min) && (Number(tx.amount) || 0) < min) return false;
      }
      if (filterMaxAmount) {
        const max = parseFloat(filterMaxAmount);
        if (!isNaN(max) && (Number(tx.amount) || 0) > max) return false;
      }

      // Keyword search
      if (filterKeyword.trim()) {
        const q = filterKeyword.toLowerCase();
        const desc = (tx.description || "").toLowerCase();
        const notes = (tx.notes || "").toLowerCase();
        const cat = (typeof tx.category === "object" ? tx.category?.name : tx.category || "").toLowerCase();
        if (!desc.includes(q) && !notes.includes(q) && !cat.includes(q)) return false;
      }

      return true;
    });
  }, [
    rawTransactions,
    filterType,
    filterCategory,
    filterAccount,
    filterStartDate,
    filterEndDate,
    filterMinAmount,
    filterMaxAmount,
    filterKeyword,
  ]);

  // Map to table rows
  const transactions: TransactionWithIcon[] = useMemo(() => {
    return filteredTransactions.map((tx: any, index: number) => {
      const categoryValue = tx.category;
      let categoryName = "Uncategorized";
      if (typeof categoryValue === "string") {
        categoryName = categoryValue;
      } else if (categoryValue && typeof categoryValue === "object" && categoryValue.name) {
        categoryName = categoryValue.name;
      }
      const isIncome = tx.type?.toLowerCase() === "income";
      return {
        ...tx,
        id: tx.id || `tx-${index}`,
        type: isIncome ? ("INCOME" as const) : ("EXPENSE" as const),
        description: tx.description || "",
        category: categoryName,
        date: tx.date
          ? new Date(tx.date).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })
          : "-",
        rawDate: tx.date,
        createdAt: tx.createdAt,
        notes: tx.notes,
        icon: isIncome ? (
          <Wallet className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <CreditCard className="w-3.5 h-3.5 text-red-500" />
        ),
      };
    });
  }, [filteredTransactions]);

  // Overall KPIs
  const totalIncome = useMemo(() => {
    return rawTransactions
      .filter((t: any) => t.type?.toLowerCase() === "income")
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  }, [rawTransactions]);

  const totalExpense = useMemo(() => {
    return rawTransactions
      .filter((t: any) => t.type?.toLowerCase() === "expense")
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
  }, [rawTransactions]);

  const netBalance = totalIncome - totalExpense;

  // Category & account color helpers
  const getCategoryColor = (cat: string) => {
    const hash = cat.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#f97316"];
    return colors[hash % colors.length];
  };

  const getAccountName = (tx: any) => {
    if (typeof tx.account === "object" && tx.account?.name) return tx.account.name;
    if (tx.accountId) {
      const acc = allAccounts.find((a: any) => a.id === tx.accountId);
      if (acc) return acc.name;
    }
    return "Akun Utama";
  };

  // Delete transaction handler
  const handleDeleteTransaction = async (id: string) => {
    if (!selectedWorkspace?.id) return;
    setDeletingTxId(id);
    try {
      await mutationFunctions.deleteTransaction(id);
      queryClient.invalidateQueries({ queryKey: ["transactions", selectedWorkspace.id] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardTrends(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCategories(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) });
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    } finally {
      setDeletingTxId(null);
    }
  };

  // Helper for generating pagination page numbers
  const generatePageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const current = currentPage + 1;
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (current >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", current - 1, current, current + 1, "...", totalPages];
  };

  // TanStack Column Definitions (identical to dashboard)
  const columns = useMemo<LegacyColumnDef<TransactionWithIcon>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Transaksi",
        cell: ({ row }) => {
          const tx = row.original;
          const isIncome = tx.type?.toLowerCase() === "income";
          return (
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                  isIncome ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                }`}
              >
                {tx.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-xs sm:text-sm truncate text-foreground">{tx.description}</p>
                {tx.notes && (
                  <p className="text-[10px] text-default-400 truncate max-w-xs">{tx.notes}</p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Kategori",
        cell: ({ row }) => {
          const tx = row.original;
          const color = getCategoryColor(tx.category);
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
              style={{
                backgroundColor: `${color}18`,
                color: color,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="truncate max-w-[120px]">{tx.category}</span>
            </span>
          );
        },
      },
      {
        id: "account",
        header: "Dompet / Rekening",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-400">
            <Building2 className="w-3.5 h-3.5 text-default-400 shrink-0" />
            <span className="truncate max-w-[140px]">{getAccountName(row.original)}</span>
          </div>
        ),
      },
      {
        id: "date",
        accessorKey: "rawDate",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="text-default-400 text-xs font-mono">{row.original.date}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right w-full">Nominal</div>,
        cell: ({ row }) => {
          const tx = row.original;
          const isIncome = tx.type?.toLowerCase() === "income";
          return (
            <div className="text-right font-mono font-semibold text-xs sm:text-sm">
              <span className={isIncome ? "text-success" : "text-danger"}>
                {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right w-full">Aksi</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const tx = row.original;
          return (
            <div className="text-right flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => handleDeleteTransaction(tx.id)}
                disabled={deletingTxId === tx.id}
                className="p-1 text-default-400 hover:text-danger rounded hover:bg-danger/10 transition-colors cursor-pointer"
                title="Hapus transaksi"
                aria-label="Hapus transaksi"
              >
                {deletingTxId === tx.id ? <Spinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deletingTxId, allAccounts, currency]
  );

  // TanStack Table instantiation
  const table = useLegacyTable({
    data: transactions,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (transactionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-5 flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-2.5">
          <Spinner size="md" />
          <p className="text-default-500 text-xs sm:text-sm">Memuat daftar transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Transactions Journal
            </h1>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Manajemen buku kas dan riwayat transaksi untuk{" "}
              <span className="font-semibold text-foreground">{selectedWorkspace?.name || "Workspace"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 px-3.5 text-xs bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-xs cursor-pointer"
              onPress={() => router.push("/transactions/new")}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Tambah Transaksi</span>
            </Button>
          </div>
        </div>

        {/* Magic Quick-Add AI Input Bar */}
        <MagicQuickAdd categories={allCategories} accounts={allAccounts} />

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Pemasukan</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-green-600 dark:text-green-400 font-mono">
                  {formatCurrency(totalIncome)}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-success">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Arus kas masuk</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 text-green-500">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Pengeluaran</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 font-mono">
                  {formatCurrency(totalExpense)}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-danger">
                  <ArrowDownRight className="w-3 h-3" />
                  <span>Arus kas keluar</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Surplus Kas Bersih (Net)</p>
                <p
                  className={`text-xl sm:text-2xl font-bold tracking-tight font-mono ${
                    netBalance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-danger"
                  }`}
                >
                  {formatCurrency(netBalance)}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-default-500">
                  <Wallet className="w-3 h-3" />
                  <span>Selisih cashflow riil</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Active Filter Chips Row */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-default-100/70 dark:bg-default-800/40 rounded-xl text-xs">
            <span className="text-[11px] font-semibold text-default-500 mr-1">Filter Aktif:</span>
            {filterType !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                Tipe: {filterType}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterType("ALL")} />
              </span>
            )}
            {filterCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                Kategori: {filterCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterCategory("")} />
              </span>
            )}
            {filterAccount && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                Akun: {allAccounts.find((a: any) => a.id === filterAccount)?.name || filterAccount}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterAccount("")} />
              </span>
            )}
            {(filterStartDate || filterEndDate) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                Tanggal: {filterStartDate || "Start"} → {filterEndDate || "End"}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setFilterStartDate("");
                    setFilterEndDate("");
                  }}
                />
              </span>
            )}
            {(filterMinAmount || filterMaxAmount) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                Nominal: {filterMinAmount ? formatCurrency(filterMinAmount) : "0"} -{" "}
                {filterMaxAmount ? formatCurrency(filterMaxAmount) : "∞"}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => {
                    setFilterMinAmount("");
                    setFilterMaxAmount("");
                  }}
                />
              </span>
            )}
            {filterKeyword && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                Keyword: &quot;{filterKeyword}&quot;
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterKeyword("")} />
              </span>
            )}
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-[11px] text-danger hover:underline ml-1 font-semibold cursor-pointer"
            >
              Reset Semua
            </button>
          </div>
        )}

        {/* Full TanStack DataTable - EXACT SAME AS DASHBOARD */}
        <TransactionsTable
          table={table}
          transactions={transactions}
          rawTransactions={rawTransactions}
          activeFiltersCount={activeFiltersCount}
          apiSortBy={apiSortBy}
          setApiSortBy={setApiSortBy}
          filterKeyword={filterKeyword}
          setFilterKeyword={setFilterKeyword}
          setIsFilterModalOpen={setIsFilterModalOpen}
          generatePageNumbers={generatePageNumbers}
          jumpPageVal={jumpPageVal}
          setJumpPageVal={setJumpPageVal}
          columns={columns}
          showViewAll={false}
        />
      </div>

      {/* Filter Modal Dialog */}
      <Modal isOpen={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <Modal.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Modal.Container className="w-full max-w-2xl">
            <Modal.Dialog className="max-w-2xl w-full bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 shadow-2xl rounded-2xl p-0 overflow-hidden outline-none">
              <Modal.CloseTrigger />
              <Modal.Header className="p-5 border-b border-default-100 dark:border-default-800">
                <div className="flex items-center justify-between w-full pr-8">
                  <div className="space-y-0.5">
                    <Modal.Heading className="text-base font-bold text-foreground">
                      Filter Transaksi
                    </Modal.Heading>
                    <p className="text-xs text-default-500">
                      Saring riwayat transaksi berdasarkan kriteria spesifik
                    </p>
                  </div>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs text-blue-500 font-semibold px-2 py-0.5 rounded-full bg-blue-500/10">
                      {activeFiltersCount} filter aktif
                    </span>
                  )}
                </div>
              </Modal.Header>

              <Modal.Body className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Keyword & Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Kata Kunci</Label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-default-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Cari deskripsi atau catatan..."
                        value={filterKeyword}
                        onChange={(e) => setFilterKeyword(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1 block">Tipe Transaksi</Label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFilterType(t)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            filterType === t
                              ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                              : "border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100"
                          }`}
                        >
                          {t === "ALL" ? "Semua" : t === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category & Account Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Kategori</Label>
                    <Select
                      aria-label="Filter Kategori"
                      placeholder="Semua kategori"
                      selectedKey={filterCategory || null}
                      onSelectionChange={(key) => setFilterCategory(key ? String(key) : "")}
                      className="w-full"
                    >
                      <Select.Trigger className="w-full justify-between h-8 px-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="min-w-56 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                        <ListBox>
                          <ListBox.Item id="" textValue="Semua Kategori" className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-default-100 cursor-pointer">
                            Semua Kategori
                          </ListBox.Item>
                          {allCategories.map((cat: any) => (
                            <ListBox.Item key={cat.id || cat.name} id={cat.name} textValue={cat.name} className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-default-100 cursor-pointer">
                              {cat.name}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Dompet / Rekening</Label>
                    <Select
                      aria-label="Filter Rekening"
                      placeholder="Semua akun"
                      selectedKey={filterAccount || null}
                      onSelectionChange={(key) => setFilterAccount(key ? String(key) : "")}
                      className="w-full"
                    >
                      <Select.Trigger className="w-full justify-between h-8 px-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="min-w-56 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                        <ListBox>
                          <ListBox.Item id="" textValue="Semua Akun" className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-default-100 cursor-pointer">
                            Semua Akun
                          </ListBox.Item>
                          {allAccounts.map((acc: any) => (
                            <ListBox.Item key={acc.id} id={acc.id} textValue={acc.name} className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-default-100 cursor-pointer">
                              {acc.name} ({acc.type})
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                </div>

                {/* Date Range Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-default-400" /> Dari Tanggal
                    </Label>
                    <input
                      type="date"
                      value={filterStartDate}
                      onChange={(e) => setFilterStartDate(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-default-400" /> Sampai Tanggal
                    </Label>
                    <input
                      type="date"
                      value={filterEndDate}
                      onChange={(e) => setFilterEndDate(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground font-mono"
                    />
                  </div>
                </div>

                {/* Amount Range Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-default-400" /> Nominal Min ({currency})
                    </Label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filterMinAmount}
                      onChange={(e) => setFilterMinAmount(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-default-400" /> Nominal Maks ({currency})
                    </Label>
                    <input
                      type="number"
                      placeholder="Tanpa batas"
                      value={filterMaxAmount}
                      onChange={(e) => setFilterMaxAmount(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground font-mono"
                    />
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="p-4 border-t border-default-100 dark:border-default-800 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={resetAllFilters}
                  className="text-xs text-danger"
                >
                  Reset Filter
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4"
                    onPress={() => setIsFilterModalOpen(false)}
                  >
                    Terapkan Filter ({filteredTransactions.length} hasil)
                  </Button>
                </div>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
