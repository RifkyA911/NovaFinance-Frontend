"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  Label,
  TextField,
  Modal,
  Select,
  ListBox,
  Dropdown,
  ProgressBar,
  Spinner,
  Table,
} from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart,
  Target,
  Building2,
  Search,
  X,
  RotateCcw,
  Trash2,
  CheckCircle2,
  BarChart3,
  Layers,
  Banknote,
  Sparkles,
  Brain,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Info,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionWithIcon } from "../../lib/api";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import { DocumentUpload, type DocumentMetadata, type UploadedDocumentResult } from "../components/DocumentUpload";

export default function Dashboard() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const queryClient = useQueryClient();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

  // Category view toggle ("expense" | "income")
  const [categoryViewType, setCategoryViewType] = useState<"expense" | "income">("expense");

  // Chart view mode ("area" | "bar")
  const [chartMode, setChartMode] = useState<"area" | "bar">("area");

  // Full Add Transaction Form State
  const [newTxDescription, setNewTxDescription] = useState("");
  const [newTxAmount, setNewTxAmount] = useState("");
  const [newTxType, setNewTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [newTxAccount, setNewTxAccount] = useState("");
  const [newTxCategory, setNewTxCategory] = useState("");
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTxNotes, setNewTxNotes] = useState("");
  const [attachedDocument, setAttachedDocument] = useState<UploadedDocumentResult | null>(null);
  const [isAiAutoFilled, setIsAiAutoFilled] = useState(false);

  // Full Filter Form State
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterMinAmount, setFilterMinAmount] = useState("");
  const [filterMaxAmount, setFilterMaxAmount] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");

  // TanStack Query hooks for dashboard & workspace data
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboardSummary(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.dashboardSummary(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  const trendsQuery = useQuery({
    queryKey: queryKeys.dashboardTrends(selectedWorkspace?.id || "", 6),
    queryFn: () => queryFunctions.dashboardTrends(selectedWorkspace?.id || "", 6),
    enabled: !!selectedWorkspace?.id,
  });

  const dashboardAccountsQuery = useQuery({
    queryKey: queryKeys.dashboardAccounts(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.dashboardAccounts(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  const workspaceAccountsQuery = useQuery({
    queryKey: queryKeys.accounts(selectedWorkspace?.id),
    queryFn: () => queryFunctions.accounts(selectedWorkspace?.id),
    enabled: !!selectedWorkspace?.id,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.transactions(selectedWorkspace?.id || "", 50),
    enabled: !!selectedWorkspace?.id,
  });

  const allCategoriesQuery = useQuery({
    queryKey: queryKeys.categories(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.categories(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace?.id,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.dashboardCategories(selectedWorkspace?.id || "", categoryViewType),
    queryFn: () => queryFunctions.dashboardCategories(selectedWorkspace?.id || "", categoryViewType),
    enabled: !!selectedWorkspace?.id,
  });

  const loading =
    summaryQuery.isLoading ||
    trendsQuery.isLoading ||
    categoriesQuery.isLoading ||
    dashboardAccountsQuery.isLoading ||
    workspaceAccountsQuery.isLoading ||
    transactionsQuery.isLoading ||
    allCategoriesQuery.isLoading;

  const summary = summaryQuery.data?.data;
  const trends = useMemo(() => trendsQuery.data?.data?.trends || [], [trendsQuery.data?.data?.trends]);
  const categories = useMemo(() => categoriesQuery.data?.data?.categories || [], [categoriesQuery.data?.data?.categories]);
  const accountsAggregated = useMemo(() => dashboardAccountsQuery.data?.data?.accounts || [], [dashboardAccountsQuery.data?.data?.accounts]);
  const workspaceAccounts = useMemo(() => workspaceAccountsQuery.data?.data?.accounts || [], [workspaceAccountsQuery.data?.data?.accounts]);
  const allCategories = useMemo(() => allCategoriesQuery.data?.data?.categories || [], [allCategoriesQuery.data?.data?.categories]);

  // Handle extracted metadata from Gemini RAG receipt scan
  const handleMetadataExtracted = (meta: DocumentMetadata, doc: UploadedDocumentResult) => {
    setAttachedDocument(doc);
    setIsAiAutoFilled(true);

    // 1. Amount
    if (meta.amount !== undefined && !isNaN(Number(meta.amount))) {
      setNewTxAmount(String(meta.amount));
    }

    // 2. Vendor / Merchant -> Description
    const title = meta.merchant || meta.vendor;
    if (title) {
      setNewTxDescription(title);
    }

    // 3. Date
    if (meta.date) {
      setNewTxDate(meta.date);
    }

    // 4. Category auto-match
    if (meta.categories && meta.categories.length > 0 && allCategories.length > 0) {
      const extractedCat = meta.categories[0].toLowerCase();
      const matched = allCategories.find((c: { name: string; id: string }) => {
        const cName = c.name.toLowerCase();
        return (
          cName.includes(extractedCat) ||
          extractedCat.includes(cName) ||
          (extractedCat.includes("food") && cName.includes("makan")) ||
          (extractedCat.includes("grocer") && (cName.includes("belanja") || cName.includes("grocer"))) ||
          (extractedCat.includes("transport") && cName.includes("transport")) ||
          (extractedCat.includes("util") && cName.includes("tagihan"))
        );
      });
      if (matched) {
        setNewTxCategory(matched.name);
      }
    }

    // 5. Line items -> Notes
    if (meta.lineItems && meta.lineItems.length > 0) {
      const itemsSummary = meta.lineItems
        .map(
          (item) =>
            `• ${item.description || "Item"} (${item.quantity || 1}x @ Rp ${(item.unitPrice || 0).toLocaleString("id-ID")} = Rp ${(item.totalPrice || 0).toLocaleString("id-ID")})`
        )
        .join("\n");
      setNewTxNotes(itemsSummary);
    }
  };

  const rawTransactions = useMemo(
    () => transactionsQuery.data?.data?.transactions || [],
    [transactionsQuery.data?.data?.transactions]
  );

  // Filter transactions with complete criteria
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter((tx: {
      type?: string;
      category?: string | { name?: string; id?: string };
      account?: string | { name?: string; id?: string };
      accountId?: string;
      amount?: number | string;
      date?: string;
      description?: string;
      notes?: string;
    }) => {
      // Type filter
      if (filterType !== "ALL" && tx.type?.toUpperCase() !== filterType) return false;

      // Category filter
      if (filterCategory) {
        const catName = typeof tx.category === "object" && tx.category ? tx.category.name : tx.category;
        const catId = typeof tx.category === "object" && tx.category ? tx.category.id : undefined;
        if (catName !== filterCategory && catId !== filterCategory) return false;
      }

      // Account filter
      if (filterAccount) {
        const accId = tx.accountId || (typeof tx.account === "object" && tx.account ? tx.account.id : undefined);
        const accName = typeof tx.account === "object" && tx.account ? tx.account.name : tx.account;
        if (accId !== filterAccount && accName !== filterAccount) return false;
      }

      // Date range filter
      if (filterStartDate && tx.date) {
        const txDate = new Date(tx.date).toISOString().split("T")[0];
        if (txDate < filterStartDate) return false;
      }
      if (filterEndDate && tx.date) {
        const txDate = new Date(tx.date).toISOString().split("T")[0];
        if (txDate > filterEndDate) return false;
      }

      // Amount range filter
      const txAmount = typeof tx.amount === "string" ? parseFloat(tx.amount) : (tx.amount || 0);
      if (filterMinAmount && txAmount < parseFloat(filterMinAmount)) return false;
      if (filterMaxAmount && txAmount > parseFloat(filterMaxAmount)) return false;

      // Keyword filter
      if (filterKeyword) {
        const kw = filterKeyword.toLowerCase();
        const descMatch = tx.description?.toLowerCase().includes(kw);
        const notesMatch = tx.notes?.toLowerCase().includes(kw);
        if (!descMatch && !notesMatch) return false;
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

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterType !== "ALL") count++;
    if (filterCategory) count++;
    if (filterAccount) count++;
    if (filterStartDate) count++;
    if (filterEndDate) count++;
    if (filterMinAmount) count++;
    if (filterMaxAmount) count++;
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

  const resetFilters = () => {
    setFilterType("ALL");
    setFilterCategory("");
    setFilterAccount("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterMinAmount("");
    setFilterMaxAmount("");
    setFilterKeyword("");
  };

  const setDatePreset = (preset: "all" | "this-month" | "last-30" | "this-year") => {
    const now = new Date();
    if (preset === "all") {
      setFilterStartDate("");
      setFilterEndDate("");
    } else if (preset === "this-month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
      setFilterStartDate(start);
      setFilterEndDate(end);
    } else if (preset === "last-30") {
      const past = new Date(now);
      past.setDate(now.getDate() - 30);
      setFilterStartDate(past.toISOString().split("T")[0]);
      setFilterEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "this-year") {
      const start = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
      const end = new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0];
      setFilterStartDate(start);
      setFilterEndDate(end);
    }
  };

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

  const getCategoryName = (cat: unknown): string => {
    if (typeof cat === "string") return cat;
    if (cat && typeof cat === "object" && "name" in cat && typeof (cat as { name: string }).name === "string") {
      return (cat as { name: string }).name;
    }
    return "General";
  };

  const getCategoryColor = (cat: unknown): string => {
    if (cat && typeof cat === "object" && "color" in cat && typeof (cat as { color: string }).color === "string") {
      return (cat as { color: string }).color;
    }
    return "#3b82f6";
  };

  const getAccountName = (tx: { account?: unknown; accountId?: string }): string => {
    if (tx.account && typeof tx.account === "object" && "name" in tx.account) {
      return String((tx.account as { name: string }).name);
    }
    if (tx.accountId) {
      const found = workspaceAccounts.find((a) => a.id === tx.accountId);
      if (found) return found.name;
    }
    return "Main Account";
  };

  const transactions: TransactionWithIcon[] = filteredTransactions.map(
    (
      tx: { id?: string; category?: unknown; account?: { id: string; name: string; type: string } | unknown; accountId?: string; type: string; date: string; description: string; amount: number | string; notes?: string; isStaging?: boolean },
      index: number
    ) => {
      const categoryName = getCategoryName(tx.category);
      const isIncome = tx.type?.toLowerCase() === "income";
      const accObj =
        tx.account && typeof tx.account === "object" && "name" in tx.account
          ? {
              id: (tx.account as { id?: string }).id || "",
              name: (tx.account as { name?: string }).name || "Main Account",
              type: (tx.account as { type?: string }).type || "cash",
            }
          : undefined;

      return {
        id: tx.id || `tx-${index}`,
        accountId: tx.accountId,
        account: accObj,
        amount: typeof tx.amount === "string" ? parseFloat(tx.amount) : Number(tx.amount || 0),
        type: isIncome ? ("INCOME" as const) : ("EXPENSE" as const),
        description: tx.description || "",
        category: categoryName,
        date: tx.date
          ? new Date(tx.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          : "-",
        notes: tx.notes,
        icon: isIncome ? (
          <Wallet className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <CreditCard className="w-3.5 h-3.5 text-red-500" />
        ),
      };
    }
  );

  const monthlyData = trends || [];
  const spendingCategories = categories || [];
  const portfolioData =
    accountsAggregated?.map((acc: { name: string; balance: string; type: string; color?: string }) => ({
      name: acc.name,
      value: parseFloat(acc.balance) || 0,
      color:
        acc.color ||
        (acc.type === "bank"
          ? "#3b82f6"
          : acc.type === "ewallet"
          ? "#10b981"
          : acc.type === "cash"
          ? "#f59e0b"
          : "#8b5cf6"),
    })) || [];

  const totalBalance = summary?.totalBalance || 0;
  const monthlyIncome = summary?.monthlyIncome || 0;
  const monthlyExpense = summary?.monthlyExpense || 0;
  const netMonthly = monthlyIncome - monthlyExpense;
  const savingsRate = summary?.savingsRate || 0;

  // AI Financial Advisor State
  interface AiInsight {
    title: string;
    description: string;
    type: "positive" | "warning" | "info";
  }

  interface AiSuggestion {
    summary: string;
    healthScore: number;
    status: string;
    insights: AiInsight[];
    recommendations: string[];
    savingsPotential: string;
  }

  const [aiData, setAiData] = useState<AiSuggestion | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiExpanded, setIsAiExpanded] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);
  const lastAnalyzedWorkspaceId = useRef<string | null>(null);

  // Fetch AI Financial Intelligence & Synthesis
  const fetchAiSuggestion = useCallback(async (isManual = false) => {
    if (!selectedWorkspace?.id) return;
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceName: selectedWorkspace.name,
          currency: selectedWorkspace.currency || "IDR",
          totalBalance,
          monthlyIncome,
          monthlyExpense,
          savingsRate,
          spendingCategories: categories,
          accounts: workspaceAccounts.map((a) => ({ name: a.name, type: a.type, balance: a.balance })),
          transactionCount: rawTransactions.length,
        }),
      });

      if (!res.ok) throw new Error("Gagal mengambil analisis AI");
      const data: AiSuggestion = await res.json();
      setAiData(data);
      if (isManual) {
        setSuccessMessage("Analisis dan kesimpulan AI berhasil diperbarui.");
        setTimeout(() => setSuccessMessage(""), 3500);
      }
    } catch (err: unknown) {
      console.error("AI suggestion fetch failed:", err);
      setAiError(err instanceof Error ? err.message : "Gagal memproses insight AI.");
    } finally {
      setIsAiLoading(false);
    }
  }, [
    selectedWorkspace,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    savingsRate,
    categories,
    workspaceAccounts,
    rawTransactions.length,
  ]);

  // Trigger AI analysis on workspace mount/change
  useEffect(() => {
    if (selectedWorkspace?.id && lastAnalyzedWorkspaceId.current !== selectedWorkspace.id) {
      lastAnalyzedWorkspaceId.current = selectedWorkspace.id;
      fetchAiSuggestion(false);
    }
  }, [selectedWorkspace?.id, fetchAiSuggestion]);

  // Export handlers
  const handleExportCsv = () => {
    if (!filteredTransactions.length) return;
    const headers = ["ID", "Type", "Description", "Amount", "Category", "Wallet", "Date", "Notes"];
    const rows = filteredTransactions.map((tx: { id?: string; type?: string; description?: string; amount?: number | string; category?: unknown; notes?: string; date?: string; account?: unknown; accountId?: string }) => [
      tx.id || "",
      tx.type || "",
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      tx.amount || 0,
      `"${(getCategoryName(tx.category) || "").replace(/"/g, '""')}"`,
      `"${(getAccountName(tx) || "").replace(/"/g, '""')}"`,
      tx.date || "",
      `"${(tx.notes || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `novajournal-${selectedWorkspace?.name || "transactions"}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    window.print();
  };

  // Fully integrated Backend API transaction creator
  const handleAddTransaction = async () => {
    if (!newTxDescription.trim() || !newTxAmount) {
      setErrorMessage("Please enter title and amount.");
      return;
    }

    if (!selectedWorkspace) {
      setErrorMessage("No workspace selected.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // 1. Resolve or provision accountId (Backend schema requires accountId)
      let accountId = newTxAccount;
      if (!accountId) {
        if (workspaceAccounts.length > 0) {
          accountId = workspaceAccounts[0].id;
        } else {
          // Auto-create a default Cash account if the workspace doesn't have one yet
          const res = await mutationFunctions.createAccount({
            workspaceId: selectedWorkspace.id,
            name: "Main Cash",
            type: "cash",
            balance: "0",
            currency: selectedWorkspace.currency || "IDR",
          });
          if (res.data?.account?.id) {
            accountId = res.data.account.id;
            queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) });
          }
        }
      }

      if (!accountId) {
        setErrorMessage("Please select or create an account first.");
        setIsSubmitting(false);
        return;
      }

      // 2. Resolve categoryId if selected
      let categoryId: string | undefined = undefined;
      if (newTxCategory) {
        const found = allCategories.find((c: { id: string; name: string }) => c.name === newTxCategory || c.id === newTxCategory);
        if (found) categoryId = found.id;
      }

      // 3. Post to backend API
      const txRes = await mutationFunctions.createTransaction({
        workspaceId: selectedWorkspace.id,
        accountId,
        categoryId,
        amount: String(newTxAmount),
        type: newTxType.toLowerCase(),
        description: newTxDescription.trim(),
        date: newTxDate ? new Date(newTxDate).toISOString() : new Date().toISOString(),
        notes: newTxNotes.trim() || undefined,
        metadata: attachedDocument
          ? {
              documentId: attachedDocument.id,
              fileUrl: attachedDocument.fileUrl,
              fileName: attachedDocument.fileName,
              geminiMetadata: attachedDocument.metadata,
            }
          : undefined,
      });

      // Link uploaded document with created transaction
      if (attachedDocument?.id && txRes?.data?.transaction?.id) {
        try {
          await mutationFunctions.linkDocumentToTransaction({
            documentId: attachedDocument.id,
            transactionId: txRes.data.transaction.id,
          });
        } catch (linkErr) {
          console.warn("Failed to link document:", linkErr);
        }
      }

      // 4. Invalidate related queries to refresh dashboard seamlessly
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardTrends(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCategories(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) });

      // 5. Reset form and close modal
      setIsAddModalOpen(false);
      setNewTxDescription("");
      setNewTxAmount("");
      setNewTxCategory("");
      setNewTxAccount("");
      setNewTxNotes("");
      setAttachedDocument(null);
      setIsAiAutoFilled(false);
      setNewTxDate(new Date().toISOString().split("T")[0]);
      setSuccessMessage("Transaction saved successfully.");
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err: unknown) {
      console.error("Failed to add transaction:", err);
      const msg = err instanceof Error ? err.message : "Failed to add transaction. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!selectedWorkspace?.id) return;
    setDeletingTxId(id);
    try {
      await mutationFunctions.deleteTransaction(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(selectedWorkspace.id) });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-5 flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-2.5">
          <Spinner size="md" />
          <p className="text-default-500 text-xs sm:text-sm">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-5 flex items-center justify-center">
        <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-4 shadow-2xs border border-default-200/80 dark:border-default-800 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500 shadow-2xs">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">No Workspace Selected</h2>
            <p className="text-xs text-default-500 max-w-xs mx-auto">
              Please choose an existing workspace or create a new one to access your financial metrics and transaction journal.
            </p>
          </div>
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-xs cursor-pointer font-medium"
              onPress={() => router.push("/workspaces")}
            >
              Manage Workspaces
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 lg:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-xl text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage("")} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Workspace Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {selectedWorkspace.name}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              {selectedWorkspace.type || "Personal"}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-default-100 dark:bg-default-800 text-default-500">
              {selectedWorkspace.currency || "IDR"}
            </span>
          </div>
          <p className="text-xs text-default-500">
            Financial journal & balance overview for this workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Filter Button with Count Badge */}
          <Button
            variant="outline"
            size="sm"
            onPress={() => setIsFilterModalOpen(true)}
            className="h-8 px-3 text-xs flex items-center gap-1.5 cursor-pointer relative"
          >
            <Filter className="w-3.5 h-3.5 text-default-500" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Add Transaction Button */}
          <Button
            size="sm"
            className="h-8 px-3.5 text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-xs cursor-pointer flex items-center gap-1.5 font-medium"
            onPress={() => {
              setErrorMessage("");
              setIsAddModalOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </Button>

          {/* Export Options Dropdown */}
          <Dropdown>
            <Dropdown.Trigger
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-default-200 dark:border-default-700 bg-transparent hover:bg-default-100 dark:hover:bg-default-800 text-default-600 cursor-pointer transition-colors"
              aria-label="Export options"
            >
              <Download className="w-3.5 h-3.5" />
            </Dropdown.Trigger>
            <Dropdown.Popover className="min-w-40 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
              <Dropdown.Menu
                aria-label="Export options"
                onAction={(key) => {
                  if (key === "excel") handleExportCsv();
                  else if (key === "pdf") handleExportPdf();
                }}
                className="outline-none space-y-0.5"
              >
                <Dropdown.Item id="excel" textValue="Download Excel" className="text-xs flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                  <span>Export Excel (.csv)</span>
                </Dropdown.Item>
                <Dropdown.Item id="pdf" textValue="Download PDF" className="text-xs flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer outline-none">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>Export Summary (.pdf)</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>

      {/* Primary Financial Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Balance */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Total Net Balance</p>
              <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2">
            <span>{workspaceAccounts.length} connected wallet{workspaceAccounts.length !== 1 ? "s" : ""}</span>
            <span className="text-blue-500 font-semibold cursor-pointer hover:underline" onClick={() => router.push("/portfolio")}>
              View
            </span>
          </div>
        </Card>

        {/* Monthly Income */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Monthly Inflow</p>
              <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400 mt-0.5">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2">
            <span className="text-success font-medium flex items-center mr-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              Incoming
            </span>
            <span>this month</span>
          </div>
        </Card>

        {/* Monthly Expenses */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Monthly Spending</p>
              <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">
                {formatCurrency(monthlyExpense)}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2">
            <span className="text-danger font-medium flex items-center mr-1">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              Avg:
            </span>
            <span>{formatCurrency(monthlyExpense / Math.max(1, new Date().getDate()))}/day</span>
          </div>
        </Card>

        {/* Savings Rate & Health */}
        <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-default-500">Savings Rate</p>
              <p className="text-lg sm:text-xl font-bold text-foreground mt-0.5">{savingsRate}%</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-default-500 border-t border-default-100 dark:border-default-800/80 pt-2">
            <span
              className={`font-semibold ${
                savingsRate >= 30
                  ? "text-success"
                  : savingsRate >= 15
                  ? "text-blue-500"
                  : savingsRate > 0
                  ? "text-amber-500"
                  : "text-danger"
              }`}
            >
              {savingsRate >= 30
                ? "Healthy (≥30%)"
                : savingsRate >= 15
                ? "Moderate (≥15%)"
                : savingsRate > 0
                ? "Low (<15%)"
                : "Deficit"}
            </span>
            <span>Net: {formatCurrency(netMonthly)}</span>
          </div>
        </Card>
      </div>

      {/* AI Financial Intelligence & Synthesis Section */}
      <Card className="rounded-2xl border border-purple-500/25 dark:border-purple-500/30 bg-linear-to-br from-purple-500/5 via-blue-500/5 to-transparent backdrop-blur-md shadow-2xs overflow-hidden transition-all duration-300">
        <div className="p-3.5 sm:p-4 border-b border-default-200/60 dark:border-default-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">
                  AI Financial Intelligence
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  <Zap className="w-3 h-3" />
                  Gemini 3.6 Flash
                </span>
                {aiData?.status && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      aiData.status === "Sehat"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20"
                        : aiData.status === "Cukup Baik"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {aiData.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-default-500 mt-0.5">
                Sintesis otomatis kesimpulan finansial, diagnosis arus kas, dan rekomendasi aksi terukur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs flex items-center gap-1.5 border-default-200 dark:border-default-700 hover:border-purple-500/40 text-foreground cursor-pointer"
              onPress={() => fetchAiSuggestion(true)}
              isDisabled={isAiLoading}
            >
              <RefreshCw className={`w-3 h-3 text-purple-500 ${isAiLoading ? "animate-spin" : ""}`} />
              <span>{isAiLoading ? "Menganalisis..." : "Refresh Diagnosis"}</span>
            </Button>
            <button
              onClick={() => setIsAiExpanded(!isAiExpanded)}
              aria-label={isAiExpanded ? "Collapse AI Section" : "Expand AI Section"}
              className="h-7 w-7 flex items-center justify-center rounded-lg border border-default-200 dark:border-default-700 text-default-500 hover:text-foreground cursor-pointer transition-colors"
            >
              {isAiExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsed Bar View */}
        {!isAiExpanded && aiData && (
          <div
            onClick={() => setIsAiExpanded(true)}
            className="px-4 py-2.5 bg-default-50/50 dark:bg-default-900/30 flex items-center justify-between text-xs text-default-600 dark:text-default-400 cursor-pointer hover:bg-default-100/50 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <Brain className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="font-semibold text-foreground shrink-0">Kesimpulan Singkat:</span>
              <span className="truncate">{aiData.summary}</span>
            </div>
            <span className="text-[11px] text-purple-500 font-medium shrink-0 ml-2 hover:underline">
              Buka Diagnosis Lengkap &rarr;
            </span>
          </div>
        )}

        {/* Expanded Content View */}
        {isAiExpanded && (
          <div className="p-3.5 sm:p-4 space-y-3.5">
            {isAiLoading && !aiData ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
                <Spinner size="sm" />
                <p className="text-xs text-default-500">
                  Gemini 3.6 Flash sedang menganalisis jurnal transaksi & arus kas...
                </p>
              </div>
            ) : aiError && !aiData ? (
              <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs flex items-center justify-between">
                <span>{aiError}</span>
                <Button size="sm" variant="outline" className="h-7 text-xs" onPress={() => fetchAiSuggestion(true)}>
                  Coba Lagi
                </Button>
              </div>
            ) : aiData ? (
              <>
                {/* Executive Conclusion & Score Gauge Banner */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 bg-linear-to-r from-purple-500/10 via-blue-500/5 to-default-100/40 dark:to-default-800/20 border border-purple-500/20 rounded-xl p-3.5">
                  <div className="lg:col-span-3 space-y-2">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                      <Brain className="w-4 h-4" />
                      <span>Kesimpulan & Diagnosis Finansial</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                      &quot;{aiData.summary}&quot;
                    </p>
                    {aiData.savingsPotential && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-gray-800/80 border border-purple-500/20 text-[11px] font-semibold text-purple-600 dark:text-purple-300 shadow-2xs">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Peluang: {aiData.savingsPotential}</span>
                      </div>
                    )}
                  </div>

                  {/* Health Score Gauge */}
                  <div className="lg:col-span-1 lg:border-l lg:border-purple-500/20 lg:pl-3.5 flex flex-col justify-center space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-default-600 dark:text-default-400">Skor Kesehatan</span>
                      <span className="text-base font-bold font-mono text-foreground">
                        {aiData.healthScore}
                        <span className="text-xs text-default-400 font-normal">/100</span>
                      </span>
                    </div>
                    <ProgressBar
                      value={aiData.healthScore}
                      aria-label="Financial Health Score"
                      className="w-full"
                    >
                      <ProgressBar.Track className="h-2 rounded-full bg-default-200 dark:bg-default-700">
                        <ProgressBar.Fill
                          className={`rounded-full transition-all duration-700 ${
                            aiData.healthScore >= 80
                              ? "bg-green-500"
                              : aiData.healthScore >= 60
                              ? "bg-blue-500"
                              : aiData.healthScore >= 40
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                      </ProgressBar.Track>
                    </ProgressBar>
                    <div className="flex items-center justify-between text-[10px] text-default-400">
                      <span>Status: <strong className="text-foreground">{aiData.status}</strong></span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        Valid
                      </span>
                    </div>
                  </div>
                </div>

                {/* Key Insights & Actionable Recommendations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Key Insights List */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-500" />
                      <span>Key Diagnostic Insights</span>
                    </h3>
                    <div className="space-y-2">
                      {aiData.insights?.map((insight, idx) => {
                        const isPos = insight.type === "positive";
                        const isWarn = insight.type === "warning";
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 sm:p-3 rounded-xl border text-xs space-y-1 transition-all ${
                              isPos
                                ? "bg-green-500/5 border-green-500/25 hover:border-green-500/40"
                                : isWarn
                                ? "bg-amber-500/5 border-amber-500/25 hover:border-amber-500/40"
                                : "bg-blue-500/5 border-blue-500/25 hover:border-blue-500/40"
                            }`}
                          >
                            <div className="flex items-center gap-2 font-semibold">
                              {isPos ? (
                                <TrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0" />
                              ) : isWarn ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <Lightbulb className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              )}
                              <span className="text-foreground truncate">{insight.title}</span>
                            </div>
                            <p className="text-default-500 text-[11px] leading-relaxed pl-5.5">
                              {insight.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actionable Recommendations */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-purple-500" />
                      <span>Rekomendasi Aksi Finansial</span>
                    </h3>
                    <div className="space-y-2 bg-white/60 dark:bg-gray-900/60 border border-default-200/80 dark:border-default-800 rounded-xl p-3">
                      {aiData.recommendations?.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs">
                          <div className="w-4 h-4 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-default-600 dark:text-default-300 text-xs leading-snug flex-1">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </Card>

      {/* Quick Wallets Strip */}
      {workspaceAccounts.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[11px] font-semibold text-default-400 uppercase tracking-wider shrink-0 mr-1">
            Wallets:
          </span>
          <div
            onClick={() => {
              setFilterAccount("");
              setFilterCategory("");
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer shrink-0 ${
              filterAccount === ""
                ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                : "border-default-200/80 dark:border-default-800 bg-white/60 dark:bg-gray-900/60 hover:bg-default-100/70 text-foreground"
            }`}
          >
            <span>All Wallets</span>
          </div>
          {workspaceAccounts.map((acc) => (
            <div
              key={acc.id}
              onClick={() => {
                setFilterAccount(acc.id);
                setFilterCategory("");
              }}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs border transition-all cursor-pointer shrink-0 ${
                filterAccount === acc.id
                  ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                  : "border-default-200/80 dark:border-default-800 bg-white/60 dark:bg-gray-900/60 hover:bg-default-100/70 text-foreground"
              }`}
            >
              <Banknote className="w-3.5 h-3.5 text-default-400" />
              <span className="font-medium">{acc.name}</span>
              <span className="font-mono text-default-500 text-[11px]">{formatCurrency(acc.balance)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Income vs Expenses Cashflow Chart */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs p-3.5 sm:p-4">
            <Card.Header className="flex items-center justify-between p-0 pb-3">
              <div>
                <Card.Title className="text-sm font-semibold text-foreground">Cashflow Performance (6 Months)</Card.Title>
                <Card.Description className="text-xs text-default-500">Historical comparison between Inflow and Outflow</Card.Description>
              </div>
              <div className="flex items-center gap-1 bg-default-100 dark:bg-default-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setChartMode("area")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    chartMode === "area" ? "bg-white dark:bg-gray-900 text-foreground shadow-2xs" : "text-default-500"
                  }`}
                >
                  <Layers className="w-3 h-3 inline mr-1" />
                  Area
                </button>
                <button
                  onClick={() => setChartMode("bar")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    chartMode === "bar" ? "bg-white dark:bg-gray-900 text-foreground shadow-2xs" : "text-default-500"
                  }`}
                >
                  <BarChart3 className="w-3 h-3 inline mr-1" />
                  Bar
                </button>
              </div>
            </Card.Header>
            <Card.Content className="p-0">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  {chartMode === "area" ? (
                    <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "0.5rem",
                          color: "#fff",
                          fontSize: "11px",
                        }}
                        formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#incomeGradient)"
                        name="Income"
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#expenseGradient)"
                        name="Expense"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "none",
                          borderRadius: "0.5rem",
                          color: "#fff",
                          fontSize: "11px",
                        }}
                        formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
                      />
                      <Bar dataKey="income" fill="#10b981" radius={[3, 3, 0, 0]} name="Income" />
                      <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} name="Expense" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-52 flex flex-col items-center justify-center text-default-500 text-xs gap-1">
                  <p>No historical trends recorded yet</p>
                  <p className="text-[11px] text-default-400">Save your first transaction to generate cashflow charts</p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Asset Breakdown by Account */}
        <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs p-3.5 sm:p-4">
          <Card.Header className="flex items-center justify-between p-0 pb-3">
            <div>
              <Card.Title className="text-sm font-semibold text-foreground">Asset Breakdown</Card.Title>
              <Card.Description className="text-xs text-default-500">Distribution across connected wallets</Card.Description>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-6 px-2 text-default-500"
              onPress={() => router.push("/portfolio")}
            >
              Portfolio
            </Button>
          </Card.Header>
          <Card.Content className="p-0">
            {portfolioData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={portfolioData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: "0.5rem",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                    formatter={(val: unknown) => [formatCurrency(Number(val) || 0), ""]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#3b82f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-52 flex flex-col items-center justify-center text-default-500 text-xs gap-1">
                <p>No active accounts found</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 mt-2"
                  onPress={() => router.push("/portfolio")}
                >
                  Configure Accounts
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Categories Breakdown & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Spending & Inflow by Category */}
        <div className="lg:col-span-2">
          <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs p-3.5 sm:p-4">
            <Card.Header className="flex items-center justify-between p-0 pb-3">
              <div>
                <Card.Title className="text-sm font-semibold text-foreground">
                  {categoryViewType === "expense" ? "Expense Breakdown" : "Income Breakdown"}
                </Card.Title>
                <Card.Description className="text-xs text-default-500">
                  Distribution by category this month
                </Card.Description>
              </div>
              <div className="flex items-center gap-1 bg-default-100 dark:bg-default-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setCategoryViewType("expense")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    categoryViewType === "expense" ? "bg-red-500 text-white shadow-2xs" : "text-default-500"
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setCategoryViewType("income")}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    categoryViewType === "income" ? "bg-green-500 text-white shadow-2xs" : "text-default-500"
                  }`}
                >
                  Income
                </button>
              </div>
            </Card.Header>
            <Card.Content className="space-y-3 p-0">
              {spendingCategories.length > 0 ? (
                spendingCategories.map((category, index) => {
                  const categoryName =
                    typeof category === "object" && category.name
                      ? category.name
                      : typeof category === "string"
                      ? category
                      : `Category ${index}`;
                  const percentageNum = Number(category.percentage) || 0;
                  const catColor = (category as { color?: string }).color || "#3b82f6";
                  return (
                    <div key={categoryName || index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                          <span className="font-medium text-foreground">{categoryName}</span>
                        </div>
                        <span className="text-default-500 font-mono">
                          {category.value ? formatCurrency(category.value) : ""}
                          {category.percentage ? ` (${category.percentage}%)` : ""}
                        </span>
                      </div>
                      {category.percentage && (
                        <ProgressBar value={percentageNum} aria-label={categoryName}>
                          <ProgressBar.Track className="h-1.5 rounded-full bg-default-100 dark:bg-default-800">
                            <ProgressBar.Fill
                              className="rounded-full transition-all duration-500"
                              style={{ backgroundColor: catColor }}
                            />
                          </ProgressBar.Track>
                        </ProgressBar>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-default-400 text-xs">
                  No {categoryViewType} recorded for this period
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Quick Operations Widget */}
        <div className="space-y-3 flex flex-col justify-between">
          <Card
            className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 hover:border-green-500/40 hover:bg-default-50/50 dark:hover:bg-default-800/30 transition-all cursor-pointer flex flex-row items-center gap-3 shadow-2xs"
            onClick={() => {
              setNewTxType("INCOME");
              setErrorMessage("");
              setIsAddModalOpen(true);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 text-green-500">
              <Plus className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Record Income</p>
              <p className="text-[11px] text-default-400 truncate">Log revenue, salary, or client payment</p>
            </div>
          </Card>

          <Card
            className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 hover:border-red-500/40 hover:bg-default-50/50 dark:hover:bg-default-800/30 transition-all cursor-pointer flex flex-row items-center gap-3 shadow-2xs"
            onClick={() => {
              setNewTxType("EXPENSE");
              setErrorMessage("");
              setIsAddModalOpen(true);
            }}
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Record Expense</p>
              <p className="text-[11px] text-default-400 truncate">Log operational costs or personal spend</p>
            </div>
          </Card>

          <Card
            className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 hover:border-purple-500/40 hover:bg-default-50/50 dark:hover:bg-default-800/30 transition-all cursor-pointer flex flex-row items-center gap-3 shadow-2xs"
            onClick={() => router.push("/analytics")}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 text-purple-500">
              <PieChart className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Deep Analytics</p>
              <p className="text-[11px] text-default-400 truncate">View monthly cashflow & categories</p>
            </div>
          </Card>

          <Card
            className="p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 hover:border-blue-500/40 hover:bg-default-50/50 dark:hover:bg-default-800/30 transition-all cursor-pointer flex flex-row items-center gap-3 shadow-2xs"
            onClick={() => router.push("/portfolio")}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
              <Target className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">Wallets & Assets</p>
              <p className="text-[11px] text-default-400 truncate">Manage bank accounts, cash & e-wallets</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-default-100/70 dark:bg-default-800/40 rounded-xl text-xs">
          <span className="text-[11px] font-semibold text-default-500 mr-1">Active filters:</span>
          {filterType !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
              Type: {filterType}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterType("ALL")} />
            </span>
          )}
          {filterCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
              Category: {filterCategory}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterCategory("")} />
            </span>
          )}
          {filterAccount && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
              Account: {workspaceAccounts.find(a => a.id === filterAccount)?.name || filterAccount}
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterAccount("")} />
            </span>
          )}
          {(filterStartDate || filterEndDate) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
              Date: {filterStartDate || "Start"} → {filterEndDate || "End"}
              <X className="w-3 h-3 cursor-pointer" onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }} />
            </span>
          )}
          {(filterMinAmount || filterMaxAmount) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
              Amount: {filterMinAmount ? formatCurrency(filterMinAmount) : "0"} - {filterMaxAmount ? formatCurrency(filterMaxAmount) : "∞"}
              <X className="w-3 h-3 cursor-pointer" onClick={() => { setFilterMinAmount(""); setFilterMaxAmount(""); }} />
            </span>
          )}
          {filterKeyword && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
              Keyword: &quot;{filterKeyword}&quot;
              <X className="w-3 h-3 cursor-pointer" onClick={() => setFilterKeyword("")} />
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[11px] text-danger hover:underline ml-auto font-medium cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Recent Transactions Table */}
      <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs overflow-hidden">
        <Card.Header className="p-3.5 sm:p-4 border-b border-default-100 dark:border-default-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <Card.Title className="text-sm font-semibold text-foreground">Transaction Journal</Card.Title>
            <Card.Description className="text-xs text-default-500">
              Showing {transactions.length} record{transactions.length !== 1 ? "s" : ""}
              {activeFiltersCount > 0 ? ` (filtered from ${rawTransactions.length})` : ""}
            </Card.Description>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-44 sm:w-56">
              <Search className="w-3.5 h-3.5 text-default-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={filterKeyword}
                onChange={(e) => setFilterKeyword(e.target.value)}
                className="w-full h-7.5 pl-8 pr-7 text-xs rounded-lg border border-default-200 dark:border-default-700 bg-transparent text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all"
              />
              {filterKeyword && (
                <button
                  type="button"
                  onClick={() => setFilterKeyword("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7.5 px-2.5 text-xs flex items-center gap-1 cursor-pointer border-default-200 dark:border-default-700 hover:border-blue-500/40"
              onPress={() => setIsFilterModalOpen(true)}
            >
              <Filter className="w-3 h-3 text-default-500" />
              <span>Filter</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7.5 px-2 text-default-500 hover:text-foreground cursor-pointer"
              onPress={() => router.push("/transactions")}
            >
              View All
            </Button>
          </div>
        </Card.Header>
        <Card.Content className="p-0">
          <Table className="w-full">
            <Table.ScrollContainer className="overflow-x-auto">
              <Table.Content aria-label="Recent Transactions" className="w-full min-w-160">
                <Table.Header>
                  <Table.Column id="transaction" isRowHeader className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30">
                    Transaction
                  </Table.Column>
                  <Table.Column id="category" className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30">
                    Category
                  </Table.Column>
                  <Table.Column id="account" className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30 hidden sm:table-cell">
                    Wallet / Account
                  </Table.Column>
                  <Table.Column id="date" className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30 hidden md:table-cell">
                    Date
                  </Table.Column>
                  <Table.Column id="amount" className="text-right py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30">
                    Amount
                  </Table.Column>
                  <Table.Column id="actions" className="text-right py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30">
                    Action
                  </Table.Column>
                </Table.Header>
                <Table.Body
                  items={transactions}
                  renderEmptyState={() => (
                    <div className="py-10 text-center text-default-500 text-xs">
                      No transactions match the selected criteria
                    </div>
                  )}
                >
                  {(tx: TransactionWithIcon) => (
                    <Table.Row
                      id={tx.id}
                      className="border-b border-default-100 dark:border-default-800/60 hover:bg-default-50/50 dark:hover:bg-default-800/40 transition-colors"
                    >
                      <Table.Cell className="py-2 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                              tx.type?.toLowerCase() === "income" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {tx.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate text-foreground">{tx.description}</p>
                            {tx.notes && (
                              <p className="text-[10px] text-default-400 truncate max-w-xs">{tx.notes}</p>
                            )}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="py-2 px-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor: `${getCategoryColor(tx.category)}18`,
                            color: getCategoryColor(tx.category),
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCategoryColor(tx.category) }} />
                          {getCategoryName(tx.category)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="py-2 px-3.5 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-default-600 dark:text-default-400">
                          <Building2 className="w-3.5 h-3.5 text-default-400" />
                          <span>{getAccountName(tx)}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="py-2 px-3.5 hidden md:table-cell">
                        <span className="text-default-400 text-xs">{tx.date}</span>
                      </Table.Cell>
                      <Table.Cell className="py-2 px-3.5 text-right">
                        <span
                          className={`font-semibold text-xs sm:text-sm font-mono ${
                            tx.type?.toLowerCase() === "income" ? "text-success" : "text-danger"
                          }`}
                        >
                          {tx.type?.toLowerCase() === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="py-2 px-3.5 text-right">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          disabled={deletingTxId === tx.id}
                          className="p-1 text-default-400 hover:text-danger rounded hover:bg-danger/10 transition-colors cursor-pointer"
                          title="Delete transaction"
                        >
                          {deletingTxId === tx.id ? <Spinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </Card.Content>
      </Card>

      {/* WIDE MODAL: Add Transaction Modal (max-w-2xl sm:max-w-3xl) */}
      <Modal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <Modal.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Modal.Container className="w-full max-w-2xl sm:max-w-3xl">
            <Modal.Dialog className="max-w-2xl sm:max-w-3xl w-full bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 shadow-2xl rounded-2xl p-0 overflow-hidden outline-none">
              <Modal.CloseTrigger />
              <Modal.Header className="p-5 sm:p-6 border-b border-default-100 dark:border-default-800">
                <div className="space-y-0.5">
                  <Modal.Heading className="text-lg font-bold text-foreground">
                    {newTxType === "INCOME" ? "Record Income Transaction" : "Record Expense Transaction"}
                  </Modal.Heading>
                  <p className="text-xs text-default-500">
                    Add a new entry to <span className="font-semibold text-foreground">{selectedWorkspace.name}</span>
                  </p>
                </div>
              </Modal.Header>

              <Modal.Body className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Gemini RAG Receipt / Invoice Scanner */}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-foreground">Attach Receipt / Invoice (AI Auto-Fill)</Label>
                  <DocumentUpload
                    workspaceId={selectedWorkspace.id}
                    onMetadataExtracted={handleMetadataExtracted}
                    compact={true}
                  />
                  {isAiAutoFilled && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-medium">
                      <span>✨ Nilai otomatis diisi oleh Gemini Vision AI dari struk Anda.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedDocument(null);
                          setIsAiAutoFilled(false);
                          setNewTxDescription("");
                          setNewTxAmount("");
                          setNewTxCategory("");
                          setNewTxNotes("");
                          setNewTxDate(new Date().toISOString().split("T")[0]);
                        }}
                        className="underline text-[11px] ml-2 cursor-pointer text-danger"
                      >
                        Reset Form
                      </button>
                    </div>
                  )}
                </div>

                {/* Transaction Type Tabs */}
                <div>
                  <Label className="text-xs font-semibold mb-1.5 block text-foreground">Transaction Type</Label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-default-100 dark:bg-default-800/70 rounded-xl max-w-md">
                    <button
                      type="button"
                      onClick={() => setNewTxType("EXPENSE")}
                      className={`py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        newTxType === "EXPENSE"
                          ? "bg-red-500 text-white shadow-xs"
                          : "text-default-600 hover:text-foreground"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Expense</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewTxType("INCOME")}
                      className={`py-2 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        newTxType === "INCOME"
                          ? "bg-green-500 text-white shadow-xs"
                          : "text-default-600 hover:text-foreground"
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Income</span>
                    </button>
                  </div>
                </div>

                {/* 2-Column Responsive Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Description / Title */}
                  <TextField className="w-full space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Description / Title *</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Server hosting, Monthly salary, Coffee"
                      value={newTxDescription}
                      onChange={(e) => setNewTxDescription(e.target.value)}
                      required
                    />
                  </TextField>

                  {/* Amount */}
                  <TextField className="w-full space-y-1">
                    <Label className="text-xs font-semibold text-foreground">
                      Amount ({selectedWorkspace.currency || "IDR"}) *
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 150000"
                      min="0"
                      step="any"
                      value={newTxAmount}
                      onChange={(e) => setNewTxAmount(e.target.value)}
                      required
                    />
                  </TextField>

                  {/* Account / Wallet */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground">Wallet / Account *</Label>
                      {workspaceAccounts.length === 0 && (
                        <span className="text-[10px] text-blue-500 font-medium">(Auto-creates Cash wallet)</span>
                      )}
                    </div>
                    <Select
                      placeholder={workspaceAccounts.length > 0 ? "Select account" : "Main Cash (Auto)"}
                      selectedKey={newTxAccount || (workspaceAccounts[0]?.id ?? null)}
                      onSelectionChange={(key) => setNewTxAccount(key ? String(key) : "")}
                      className="w-full"
                    >
                      <Select.Trigger className="w-full justify-between h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="min-w-64 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                        <ListBox>
                          {workspaceAccounts.length > 0 ? (
                            workspaceAccounts.map((acc) => (
                              <ListBox.Item
                                key={acc.id}
                                id={acc.id}
                                textValue={acc.name}
                                className="px-3 py-2 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-4 h-4 text-default-400" />
                                  <div>
                                    <p className="font-semibold text-foreground">{acc.name}</p>
                                    <p className="text-[10px] text-default-400 uppercase">{acc.type} • {formatCurrency(acc.balance)}</p>
                                  </div>
                                </div>
                                <ListBox.ItemIndicator className="text-blue-500" />
                              </ListBox.Item>
                            ))
                          ) : (
                            <ListBox.Item
                              key="default-cash"
                              id="default-cash"
                              textValue="Main Cash (Default)"
                              className="px-3 py-2 rounded-lg text-xs"
                            >
                              Main Cash (Default)
                              <ListBox.ItemIndicator className="text-blue-500" />
                            </ListBox.Item>
                          )}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Category</Label>
                    <Select
                      placeholder="Select category"
                      selectedKey={newTxCategory || null}
                      onSelectionChange={(key) => setNewTxCategory(key ? String(key) : "")}
                      className="w-full"
                    >
                      <Select.Trigger className="w-full justify-between h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="min-w-64 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                        <ListBox>
                          {allCategories.map((cat: { id: string; name: string; color?: string }) => (
                            <ListBox.Item
                              key={cat.id || cat.name}
                              id={cat.name}
                              textValue={cat.name}
                              className="px-3 py-2 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || "#3b82f6" }} />
                                <span>{cat.name}</span>
                              </div>
                              <ListBox.ItemIndicator className="text-blue-500" />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  {/* Date */}
                  <TextField className="w-full space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Date of Transaction *</Label>
                    <Input
                      type="date"
                      value={newTxDate}
                      onChange={(e) => setNewTxDate(e.target.value)}
                      required
                    />
                  </TextField>

                  {/* Notes / Remarks */}
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Notes / Reference (Optional)</Label>
                    <textarea
                      rows={2}
                      placeholder="Invoice number, tax receipt, memo, etc."
                      value={newTxNotes}
                      onChange={(e) => setNewTxNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="p-5 sm:p-6 pt-3 flex items-center justify-end gap-2.5 border-t border-default-100 dark:border-default-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => setIsAddModalOpen(false)}
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-xs cursor-pointer font-medium px-5"
                  onPress={handleAddTransaction}
                  isDisabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : "Save Transaction"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* WIDE MODAL: Filter Transactions Modal (max-w-2xl sm:max-w-3xl) */}
      <Modal isOpen={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <Modal.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Modal.Container className="w-full max-w-2xl sm:max-w-3xl">
            <Modal.Dialog className="max-w-2xl sm:max-w-3xl w-full bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 shadow-2xl rounded-2xl p-0 overflow-hidden outline-none">
              <Modal.CloseTrigger />
              <Modal.Header className="p-5 sm:p-6 border-b border-default-100 dark:border-default-800">
                <div className="flex items-center justify-between w-full pr-8">
                  <div className="space-y-0.5">
                    <Modal.Heading className="text-lg font-bold text-foreground">Filter Transactions</Modal.Heading>
                    <p className="text-xs text-default-500">Refine recent journal entries by multiple conditions</p>
                  </div>
                  {activeFiltersCount > 0 && (
                    <span className="text-xs text-blue-500 font-semibold px-2 py-0.5 rounded-full bg-blue-500/10">
                      {activeFiltersCount} active filter{activeFiltersCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </Modal.Header>

              <Modal.Body className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Keyword & Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Keyword Search</Label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-default-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search description, notes or memo..."
                        value={filterKeyword}
                        onChange={(e) => setFilterKeyword(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-semibold text-foreground mb-1.5 block">Transaction Type</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFilterType(t)}
                          className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            filterType === t
                              ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                              : "border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100 dark:hover:bg-default-800"
                          }`}
                        >
                          {t === "ALL" ? "All Types" : t === "INCOME" ? "Income" : "Expense"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category & Account Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Category</Label>
                    <Select
                      placeholder="All categories"
                      selectedKey={filterCategory || null}
                      onSelectionChange={(key) => setFilterCategory(key ? String(key) : "")}
                      className="w-full"
                    >
                      <Select.Trigger className="w-full justify-between h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="min-w-64 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                        <ListBox>
                          <ListBox.Item key="all" id="" textValue="All Categories" className="px-3 py-1.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer">
                            All Categories
                            <ListBox.ItemIndicator className="text-blue-500" />
                          </ListBox.Item>
                          {allCategories.map((cat: { id: string; name: string }) => (
                            <ListBox.Item key={cat.id || cat.name} id={cat.name} textValue={cat.name} className="px-3 py-1.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer">
                              {cat.name}
                              <ListBox.ItemIndicator className="text-blue-500" />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Wallet / Account</Label>
                    <Select
                      placeholder="All accounts"
                      selectedKey={filterAccount || null}
                      onSelectionChange={(key) => setFilterAccount(key ? String(key) : "")}
                      className="w-full"
                    >
                      <Select.Trigger className="w-full justify-between h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="min-w-64 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                        <ListBox>
                          <ListBox.Item key="all-acc" id="" textValue="All Accounts" className="px-3 py-1.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer">
                            All Accounts
                            <ListBox.ItemIndicator className="text-blue-500" />
                          </ListBox.Item>
                          {workspaceAccounts.map((acc) => (
                            <ListBox.Item key={acc.id} id={acc.id} textValue={acc.name} className="px-3 py-1.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer">
                              {acc.name} ({acc.type})
                              <ListBox.ItemIndicator className="text-blue-500" />
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </div>
                </div>

                {/* Date Period Presets & Custom Pickers */}
                <div className="space-y-2 pt-1 border-t border-default-100 dark:border-default-800">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Date Range</Label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setDatePreset("this-month")}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground cursor-pointer font-medium"
                      >
                        This Month
                      </button>
                      <button
                        type="button"
                        onClick={() => setDatePreset("last-30")}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground cursor-pointer font-medium"
                      >
                        Last 30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => setDatePreset("this-year")}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-800 text-default-600 hover:text-foreground cursor-pointer font-medium"
                      >
                        This Year
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] text-default-400 block mb-1">From Date</span>
                      <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-default-400 block mb-1">To Date</span>
                      <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Amount Range Filter */}
                <div className="space-y-1 pt-1 border-t border-default-100 dark:border-default-800">
                  <Label className="text-xs font-semibold text-foreground">Amount Range (IDR)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Minimum Amount"
                      value={filterMinAmount}
                      onChange={(e) => setFilterMinAmount(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Maximum Amount"
                      value={filterMaxAmount}
                      onChange={(e) => setFilterMaxAmount(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </Modal.Body>

              <Modal.Footer className="p-5 sm:p-6 pt-3 flex items-center justify-between border-t border-default-100 dark:border-default-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={resetFilters}
                  className="text-xs flex items-center gap-1.5 text-default-500 hover:text-foreground"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => setIsFilterModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-linear-to-r from-blue-500 to-purple-600 text-white cursor-pointer px-5"
                    onPress={() => setIsFilterModalOpen(false)}
                  >
                    Apply Filters
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
