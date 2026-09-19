/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Building2,
  Wallet,
  CreditCard,
  Banknote,
  QrCode,
  Store,
  Hash,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Tag,
  ArrowRight,
  Plus,
  RefreshCw,
  FileText,
  Paperclip,
  Check,
  Zap,
  TrendingDown,
  TrendingUp,
  Receipt,
  HelpCircle,
  CornerDownLeft,
} from "lucide-react";
import { Card, Button } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  queryKeys,
  queryFunctions,
  mutationFunctions,
} from "@/app/lib/queries";
import {
  DocumentUpload,
  type DocumentMetadata,
  type UploadedDocumentResult,
} from "@/app/(protected)/components/DocumentUpload";

const PRESET_CATEGORIES: {
  name: string;
  type: "expense" | "income";
  color: string;
}[] = [
  { name: "Food & Drink", type: "expense", color: "#ef4444" },
  { name: "Transport", type: "expense", color: "#f59e0b" },
  { name: "Shopping", type: "expense", color: "#8b5cf6" },
  { name: "Utilities", type: "expense", color: "#06b6d4" },
  { name: "Entertainment", type: "expense", color: "#ec4899" },
  { name: "Healthcare", type: "expense", color: "#10b981" },
  { name: "Salary", type: "income", color: "#22c55e" },
  { name: "Freelance", type: "income", color: "#3b82f6" },
  { name: "Investment", type: "income", color: "#6366f1" },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash / Tunai", icon: Banknote },
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2 },
  { id: "qris_ewallet", label: "QRIS / E-Wallet", icon: QrCode },
  { id: "credit_card", label: "Credit Card", icon: CreditCard },
  { id: "debit_card", label: "Debit Card", icon: Wallet },
];

const PROMPT_SUGGESTIONS = [
  {
    label: "☕ Kopi Starbucks 55rb",
    text: "Beli kopi Starbucks 55.000 bayar pake QRIS BCA barusan",
  },
  {
    label: "🍔 Makan Siang 35rb",
    text: "Makan siang di Resto Padang 35.000 tunai cash",
  },
  {
    label: "💰 Gaji Bulanan 15jt",
    text: "Gaji bulanan masuk 15.000.000 ke rekening Mandiri",
  },
  {
    label: "⚡ Listrik PLN 350rb",
    text: "Bayar tagihan listrik PLN 350.000 transfer BCA",
  },
  {
    label: "⛽ Bensin Shell 150rb",
    text: "Beli bensin Pertamax SPBU Shell 150rb pake Gopay",
  },
];

function getCurrencyPrefix(curr?: string) {
  if (!curr || curr.toUpperCase() === "IDR") return "Rp";
  if (curr.toUpperCase() === "USD") return "$";
  if (curr.toUpperCase() === "SGD") return "S$";
  if (curr.toUpperCase() === "EUR") return "€";
  return curr;
}

function formatNumber(val: number | string) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("id-ID").format(num);
}

export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspace();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Natural Language Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isParsingPrompt, setIsParsingPrompt] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<{
    amount?: number;
    type?: "INCOME" | "EXPENSE";
    category?: string;
    account?: string;
    merchant?: string;
    description?: string;
    paymentMethod?: string;
  } | null>(null);

  // Main Form Data
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    account: "",
    category: "",
    date: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm
    notes: "",
    paymentMethod: "cash",
    merchant: "",
    referenceNo: "",
  });

  const [attachedDocuments, setAttachedDocuments] = useState<
    Record<string, UploadedDocumentResult>
  >({});
  const [isAiAutoFilled, setIsAiAutoFilled] = useState(false);

  // Queries
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(selectedWorkspace?.id),
    queryFn: () => queryFunctions.categories(selectedWorkspace?.id),
    enabled: !!selectedWorkspace?.id,
  });

  const accountsQuery = useQuery({
    queryKey: queryKeys.accounts(selectedWorkspace?.id),
    queryFn: () => queryFunctions.accounts(selectedWorkspace?.id),
    enabled: !!selectedWorkspace?.id,
  });

  const categories = categoriesQuery.data?.data?.categories || [];
  const accounts = accountsQuery.data?.data?.accounts || [];

  // Default select first account if not set
  useEffect(() => {
    if (!formData.account && accounts.length > 0) {
      setFormData((prev) => ({ ...prev, account: accounts[0].id }));
    }
  }, [accounts, formData.account]);

  // Merge workspace categories with presets
  const existingCatNames = useMemo(
    () => new Set(categories.map((c: any) => c.name.toLowerCase())),
    [categories]
  );

  const availablePresets = useMemo(
    () =>
      PRESET_CATEGORIES.filter(
        (p) =>
          !existingCatNames.has(p.name.toLowerCase()) &&
          p.type === formData.type.toLowerCase()
      ),
    [existingCatNames, formData.type]
  );

  const allCategoryOptions = useMemo(
    () => [
      ...categories
        .filter(
          (c: any) =>
            !c.type || c.type.toLowerCase() === formData.type.toLowerCase()
        )
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          color: c.color || "#3b82f6",
          type: c.type || formData.type.toLowerCase(),
          isPreset: false,
        })),
      ...availablePresets.map((p) => ({
        id: p.name,
        name: p.name,
        color: p.color,
        type: p.type,
        isPreset: true,
      })),
    ],
    [categories, availablePresets, formData.type]
  );

  // Auto select first category if not set
  useEffect(() => {
    if (!formData.category && allCategoryOptions.length > 0) {
      setFormData((prev) => ({ ...prev, category: allCategoryOptions[0].name }));
    }
  }, [allCategoryOptions, formData.category]);

  // Quick Amount Adjustments
  const handleAddAmount = (delta: number) => {
    const current = Number(formData.amount.replace(/,/g, "")) || 0;
    const next = Math.max(0, current + delta);
    setFormData((prev) => ({ ...prev, amount: String(next) }));
  };

  const handleResetAmount = () => {
    setFormData((prev) => ({ ...prev, amount: "" }));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (/^\d*\.?\d*$/.test(raw)) {
      setFormData((prev) => ({ ...prev, amount: raw }));
    }
  };

  // -------------------------------------------------------------
  // SMART NATURAL LANGUAGE PROMPT PARSER (Instant Client-Side NLP)
  // -------------------------------------------------------------
  const parsePrompt = (promptText: string) => {
    if (!promptText.trim()) return;
    setIsParsingPrompt(true);

    const lower = promptText.toLowerCase();

    // 1. Detect Type (Income vs Expense)
    const incomeKeywords = [
      "gaji",
      "salary",
      "masuk",
      "dapat",
      "terima",
      "bonus",
      "freelance",
      "cair",
      "topup",
      "top up",
      "dividen",
      "pendapatan",
    ];
    let detectedType: "INCOME" | "EXPENSE" = "EXPENSE";
    for (const kw of incomeKeywords) {
      if (lower.includes(kw)) {
        detectedType = "INCOME";
        break;
      }
    }

    // 2. Detect Amount (Supports: 55rb, 55k, 15jt, 15m, 50.000, 50,000, Rp 50000, $20)
    let detectedAmount: number | undefined = undefined;

    // Pattern for "15jt" or "15 juta"
    const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta|million)/);
    if (jtMatch) {
      detectedAmount = parseFloat(jtMatch[1].replace(",", ".")) * 1000000;
    }

    // Pattern for "55rb" or "55k" or "55 ribu"
    if (!detectedAmount) {
      const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu|thousand)/);
      if (rbMatch) {
        detectedAmount = parseFloat(rbMatch[1].replace(",", ".")) * 1000;
      }
    }

    // Pattern for standard numeric "Rp 150.000" or "150.000" or "150000"
    if (!detectedAmount) {
      const numMatch = lower.match(/(?:rp\.?|\$)?\s*(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d+)/);
      if (numMatch) {
        const clean = numMatch[1].replace(/\./g, "").replace(",", ".");
        const val = parseFloat(clean);
        if (!isNaN(val) && val > 0) {
          detectedAmount = val;
        }
      }
    }

    // 3. Detect Category
    let detectedCategory = "";
    const categoryMatches: { keywords: string[]; category: string }[] = [
      { keywords: ["kopi", "starbucks", "fore", "janji jiwa", "cafe", "kafe"], category: "Food & Drink" },
      { keywords: ["makan", "lunch", "dinner", "sarapan", "resto", "padang", "warteg", "gofood", "grabfood"], category: "Food & Drink" },
      { keywords: ["bensin", "pertamax", "pertalite", "shell", "spbu", "bbm"], category: "Transport" },
      { keywords: ["gojek", "grab", "goride", "gocar", "maxim", "taxi", "parkir", "tol"], category: "Transport" },
      { keywords: ["belanja", "shopee", "tokopedia", "tiktok shop", "indomaret", "alfamart", "mall", "baju", "sepatu"], category: "Shopping" },
      { keywords: ["listrik", "pln", "air", "pdam", "wifi", "indihome", "pulsa", "kuota", "paket data"], category: "Utilities" },
      { keywords: ["netflix", "spotify", "youtube", "bioskop", "cinema", "game", "steam"], category: "Entertainment" },
      { keywords: ["obat", "apotek", "dokter", "klinik", "rumah sakit", "vitamin"], category: "Healthcare" },
      { keywords: ["gaji", "salary", "payroll"], category: "Salary" },
      { keywords: ["freelance", "proyek", "project", "side job"], category: "Freelance" },
      { keywords: ["saham", "reksadana", "crypto", "bibit", "ajaib", "investasi"], category: "Investment" },
    ];

    for (const cm of categoryMatches) {
      if (cm.keywords.some((kw) => lower.includes(kw))) {
        // Look up in actual workspace categories first
        const found = categories.find((c: any) =>
          c.name.toLowerCase().includes(cm.category.toLowerCase())
        );
        detectedCategory = found ? found.name : cm.category;
        break;
      }
    }

    // 4. Detect Account / Wallet
    let detectedAccount = formData.account;
    for (const acc of accounts) {
      const accName = acc.name.toLowerCase();
      if (lower.includes(accName)) {
        detectedAccount = acc.id;
        break;
      }
    }
    // Fallback detection for common banks/wallets if account names match
    if (!detectedAccount && accounts.length > 0) {
      if (lower.includes("bca")) {
        const bca = accounts.find((a: any) => a.name.toLowerCase().includes("bca"));
        if (bca) detectedAccount = bca.id;
      } else if (lower.includes("mandiri")) {
        const man = accounts.find((a: any) => a.name.toLowerCase().includes("mandiri"));
        if (man) detectedAccount = man.id;
      } else if (lower.includes("gopay") || lower.includes("ovo") || lower.includes("dana")) {
        const ewal = accounts.find(
          (a: any) =>
            a.name.toLowerCase().includes("gopay") ||
            a.name.toLowerCase().includes("ovo") ||
            a.name.toLowerCase().includes("dana") ||
            a.type === "ewallet"
        );
        if (ewal) detectedAccount = ewal.id;
      } else if (lower.includes("cash") || lower.includes("tunai")) {
        const cash = accounts.find((a: any) => a.type === "cash");
        if (cash) detectedAccount = cash.id;
      }
    }

    // 5. Detect Payment Method
    let detectedPaymentMethod = "cash";
    if (lower.includes("qris") || lower.includes("gopay") || lower.includes("ovo") || lower.includes("dana")) {
      detectedPaymentMethod = "qris_ewallet";
    } else if (lower.includes("transfer") || lower.includes("bca") || lower.includes("mandiri") || lower.includes("bri")) {
      detectedPaymentMethod = "bank_transfer";
    } else if (lower.includes("kartu kredit") || lower.includes("cc") || lower.includes("credit")) {
      detectedPaymentMethod = "credit_card";
    } else if (lower.includes("debit")) {
      detectedPaymentMethod = "debit_card";
    }

    // 6. Detect Merchant / Title
    let detectedMerchant = "";
    const knownMerchants = [
      "Starbucks",
      "McDonald's",
      "KFC",
      "Resto Padang",
      "Warteg",
      "Indomaret",
      "Alfamart",
      "SPBU Shell",
      "SPBU Pertamina",
      "PLN",
      "PDAM",
      "Netflix",
      "Spotify",
      "Tokopedia",
      "Shopee",
      "Grab",
      "Gojek",
    ];
    for (const m of knownMerchants) {
      if (lower.includes(m.toLowerCase())) {
        detectedMerchant = m;
        break;
      }
    }

    const detectedDesc =
      detectedMerchant ||
      promptText.slice(0, 45).trim() ||
      (detectedType === "INCOME" ? "Income Entry" : "Expense Entry");

    // Apply parsed values to form
    setFormData((prev) => ({
      ...prev,
      type: detectedType,
      amount: detectedAmount !== undefined ? String(detectedAmount) : prev.amount,
      category: detectedCategory || prev.category,
      account: detectedAccount || prev.account,
      paymentMethod: detectedPaymentMethod,
      merchant: detectedMerchant || prev.merchant,
      description: detectedDesc,
      notes: `✨ Auto-parsed from AI prompt: "${promptText}"`,
    }));

    setParsedInfo({
      amount: detectedAmount,
      type: detectedType,
      category: detectedCategory,
      account: accounts.find((a: any) => a.id === detectedAccount)?.name,
      merchant: detectedMerchant,
      description: detectedDesc,
      paymentMethod: detectedPaymentMethod,
    });

    setIsParsingPrompt(false);
    setIsAiAutoFilled(true);
    setSuccessToast("Prompt parsed & form auto-filled successfully!");
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Document extraction
  const handleMetadataExtracted = (
    meta: DocumentMetadata,
    doc: UploadedDocumentResult
  ) => {
    setAttachedDocuments((prev) => ({ ...prev, [doc.id]: doc }));
    setIsAiAutoFilled(true);

    if (meta.amount !== undefined && !isNaN(Number(meta.amount))) {
      setFormData((prev) => ({ ...prev, amount: String(meta.amount) }));
    }

    const merchantName = meta.merchant || meta.vendor || "";
    if (merchantName) {
      setFormData((prev) => ({
        ...prev,
        merchant: merchantName,
        description: prev.description || merchantName,
      }));
    }

    if (meta.date) {
      try {
        const d = new Date(meta.date);
        if (!isNaN(d.getTime())) {
          setFormData((prev) => ({ ...prev, date: d.toISOString().slice(0, 16) }));
        }
      } catch {}
    }

    if (meta.categories && meta.categories.length > 0 && categories.length > 0) {
      const extractedCat = meta.categories[0].toLowerCase();
      const matched = categories.find((c: any) =>
        c.name.toLowerCase().includes(extractedCat)
      );
      if (matched) {
        setFormData((prev) => ({ ...prev, category: matched.name }));
      }
    }

    if (meta.lineItems && meta.lineItems.length > 0) {
      const itemsSummary = meta.lineItems
        .map(
          (item) =>
            `• ${item.description || "Item"} (${item.quantity || 1}x @ Rp ${(item.unitPrice || 0).toLocaleString("id-ID")} = Rp ${(item.totalPrice || 0).toLocaleString("id-ID")})`
        )
        .join("\n");
      setFormData((prev) => ({ ...prev, notes: itemsSummary }));
    }
  };

  const resetForm = () => {
    setAttachedDocuments({});
    setIsAiAutoFilled(false);
    setAiPrompt("");
    setParsedInfo(null);
    setFormData({
      description: "",
      amount: "",
      type: "EXPENSE",
      account: accounts[0]?.id || "",
      category: allCategoryOptions[0]?.name || "",
      date: new Date().toISOString().slice(0, 16),
      notes: "",
      paymentMethod: "cash",
      merchant: "",
      referenceNo: "",
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.description.trim() || !formData.amount) {
      setError("Please provide both a Title / Description and an Amount.");
      return;
    }

    if (!selectedWorkspace?.id) {
      setError("No workspace selected.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Resolve or auto-create account
      let accountId = formData.account;
      if (!accountId || accountId === "cash") {
        if (accounts.length > 0) {
          accountId = accounts[0].id;
        } else {
          const res = await mutationFunctions.createAccount({
            workspaceId: selectedWorkspace.id,
            name: "Main Cash",
            type: "cash",
            balance: "0",
            currency: selectedWorkspace.currency || "IDR",
          });
          if (res.data?.account?.id) {
            accountId = res.data.account.id;
          }
        }
      }

      // 2. Resolve or auto-create category
      let categoryId: string | undefined = undefined;
      if (formData.category) {
        const found = categories.find(
          (c: any) =>
            c.name.toLowerCase() === formData.category.toLowerCase() ||
            c.id === formData.category
        );
        if (found) {
          categoryId = found.id;
        } else {
          const preset = PRESET_CATEGORIES.find(
            (p) => p.name === formData.category
          );
          const catRes = await mutationFunctions.createCategory({
            workspaceId: selectedWorkspace.id,
            name: formData.category,
            type: formData.type.toLowerCase() as "income" | "expense",
            color: preset?.color || "#3b82f6",
          });
          if (catRes.data?.category?.id) {
            categoryId = catRes.data.category.id;
            queryClient.invalidateQueries({
              queryKey: queryKeys.categories(selectedWorkspace.id),
            });
          }
        }
      }

      const payload = {
        workspaceId: selectedWorkspace.id,
        accountId,
        categoryId,
        amount: String(formData.amount),
        type: formData.type.toLowerCase() as "income" | "expense",
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        notes: formData.notes.trim() || undefined,
        metadata: {
          paymentMethod: formData.paymentMethod || undefined,
          merchant: formData.merchant.trim() || undefined,
          referenceNo: formData.referenceNo.trim() || undefined,
        },
      };

      const res = await mutationFunctions.createTransaction(payload);

      // Link attached documents
      const docs = Object.values(attachedDocuments);
      for (const doc of docs) {
        if (doc.id && res.data?.transaction?.id) {
          await mutationFunctions.linkDocumentToTransaction({
            documentId: doc.id,
            transactionId: res.data.transaction.id,
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Create transaction error:", err);
      setError(err?.message || "Failed to record transaction.");
    } finally {
      setLoading(false);
    }
  };

  const currency = selectedWorkspace?.currency || "IDR";
  const currencyPrefix = getCurrencyPrefix(currency);

  const selectedAccountObj = accounts.find((a: any) => a.id === formData.account);
  const currentAccBalance = selectedAccountObj ? Number(selectedAccountObj.balance) : 0;
  const transactionAmountNum = Number(formData.amount) || 0;
  const projectedBalance =
    formData.type === "INCOME"
      ? currentAccBalance + transactionAmountNum
      : currentAccBalance - transactionAmountNum;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-gray-950 text-white dark:bg-white dark:text-gray-950 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-default-200/20 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP HEADER & BREADCRUMBS */}
      <div className="max-w-7xl mx-auto space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-default-200/60 dark:border-default-800/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 rounded-xl bg-default-100 hover:bg-default-200 dark:bg-default-800 dark:hover:bg-default-700 flex items-center justify-center text-default-600 dark:text-default-300 transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-default-400">
                <span>Transactions</span>
                <span>/</span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold">New Entry</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Record New Transaction</span>
                {isAiAutoFilled && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    AI ASSISTED
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onPress={resetForm}
              className="text-xs h-8.5 px-3 text-default-500 hover:text-foreground cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
            <Button
              size="sm"
              onPress={() => handleSubmit()}
              isDisabled={loading}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-semibold text-xs h-8.5 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{loading ? "Saving..." : "Save Entry"}</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* FULL-WIDTH DUAL-PANE WORKSPACE */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================= */}
        {/* LEFT COLUMN: PRIMARY WORKFLOW & FORM (8 COLS)          */}
        {/* ======================================================= */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. AI PROMPT INPUT HUB */}
          <Card className="p-4 sm:p-5 rounded-2xl border border-blue-500/30 bg-linear-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                    <span>AI Natural Language Quick Entry</span>
                    <span className="text-[9px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded font-bold">
                      SMART NLP
                    </span>
                  </h3>
                  <p className="text-[11px] text-default-500">
                    Type or paste transaction in plain Indonesian/English (e.g. &ldquo;Beli kopi 55rb QRIS BCA&rdquo;)
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt Input Box */}
            <div className="relative">
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    parsePrompt(aiPrompt);
                  }
                }}
                placeholder="Contoh: Beli bensin Pertamax 150rb di SPBU Shell bayar pake Gopay barusan..."
                className="w-full p-3 pr-24 text-xs sm:text-sm rounded-xl bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner resize-none transition-all"
              />
              <button
                type="button"
                onClick={() => parsePrompt(aiPrompt)}
                disabled={!aiPrompt.trim() || isParsingPrompt}
                className="absolute right-2.5 bottom-3 h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isParsingPrompt ? "Parsing..." : "Auto-Fill"}</span>
              </button>
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[10px] text-default-400 font-semibold uppercase shrink-0 mr-1">
                Try Examples:
              </span>
              {PROMPT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiPrompt(s.text);
                    parsePrompt(s.text);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 hover:border-blue-500 text-default-600 dark:text-default-300 hover:text-foreground shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Parsed Breakdown Pills if recognized */}
            {parsedInfo && (
              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-gray-900/70 border border-blue-500/20 text-[11px] flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Extracted:</span>
                {parsedInfo.type && (
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    parsedInfo.type === "EXPENSE" ? "bg-rose-500/10 text-rose-600" : "bg-emerald-500/10 text-emerald-600"
                  }`}>
                    {parsedInfo.type}
                  </span>
                )}
                {parsedInfo.amount !== undefined && (
                  <span className="px-2 py-0.5 rounded bg-default-100 dark:bg-default-800 font-mono font-bold text-foreground">
                    Rp {formatNumber(parsedInfo.amount)}
                  </span>
                )}
                {parsedInfo.category && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                    📁 {parsedInfo.category}
                  </span>
                )}
                {parsedInfo.account && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium">
                    💳 {parsedInfo.account}
                  </span>
                )}
                {parsedInfo.merchant && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">
                    🏪 {parsedInfo.merchant}
                  </span>
                )}
              </div>
            )}
          </Card>

          {/* 2. TRANSACTION FORM CARD */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-xl space-y-5">
            
            {/* TYPE SELECTOR TABS */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-default-100 dark:border-default-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-default-100 dark:bg-default-800 flex items-center justify-center text-default-600 dark:text-default-300">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Transaction Details</h2>
                  <p className="text-[11px] text-default-400">Configure financial classification and ledger entries</p>
                </div>
              </div>

              {/* Segmented Type Control */}
              <div className="flex items-center p-1 rounded-xl bg-default-100 dark:bg-default-800/80 border border-default-200/60 dark:border-default-700/60">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: "EXPENSE" }))}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.type === "EXPENSE"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-default-500 hover:text-foreground"
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: "INCOME" }))}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.type === "INCOME"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-default-500 hover:text-foreground"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Income</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ROW 1: TITLE / DESCRIPTION (Full Width) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Title / Description *</span>
                  <span className="text-[10px] text-default-400 font-normal">What was this for?</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kopi Starbucks, Belanja Mingguan, Pembayaran Invoice..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-800 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* ROW 2: NOMINAL AMOUNT (Left 1/2) + QUICK ADJUST (Right 1/2) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                
                {/* Nominal Input */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Nominal / Amount *</span>
                    <span className="text-[10px] font-mono text-default-400">{currency}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-default-400">
                      {currencyPrefix}
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="0"
                      value={formData.amount ? Number(formData.amount).toLocaleString("id-ID") : ""}
                      onChange={handleAmountChange}
                      className="w-full h-11 pl-11 pr-3 text-base sm:text-lg font-bold font-mono rounded-xl bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Quick Amount Adjustments */}
                <div className="md:col-span-6 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Quick Adjustments</span>
                    <button
                      type="button"
                      onClick={handleResetAmount}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer font-medium"
                    >
                      Reset to 0
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {[10000, 50000, 100000, 500000, 1000000].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => handleAddAmount(step)}
                        className="h-10 rounded-xl bg-default-100 hover:bg-default-200 dark:bg-default-800 dark:hover:bg-default-700 text-default-700 dark:text-default-300 font-mono text-[11px] font-semibold flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-default-200/50 dark:border-default-700/50"
                      >
                        +{step >= 1000000 ? `${step / 1000000}M` : `${step / 1000}k`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROW 3: CATEGORY (Left 1/2) + POPULAR CATEGORIES (Right 1/2) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                
                {/* Category Select */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Category</span>
                    <span className="text-[10px] text-default-400">Classification</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 text-xs rounded-xl bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-800 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {allCategoryOptions.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} {cat.isPreset ? "(Preset)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Popular Categories */}
                <div className="md:col-span-6 space-y-1.5">
                  <span className="text-xs font-semibold text-foreground block">Popular Presets</span>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {PRESET_CATEGORIES.filter((p) => p.type === formData.type.toLowerCase()).map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: preset.name })}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 border ${
                          formData.category === preset.name
                            ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                            : "bg-default-100 dark:bg-default-800 border-default-200/60 dark:border-default-700/60 text-default-600 dark:text-default-300 hover:text-foreground"
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ROW 4: WALLET / ACCOUNT (Left 1/2) + PAYMENT METHOD (Right 1/2) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                
                {/* Account / Wallet */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Source Wallet / Bank Account *</span>
                    <span className="text-[10px] text-default-400">
                      Balance: {selectedAccountObj ? `Rp ${formatNumber(selectedAccountObj.balance)}` : "—"}
                    </span>
                  </label>
                  <select
                    value={formData.account}
                    onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                    className="w-full h-10 px-3 text-xs rounded-xl bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-800 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {accounts.length === 0 ? (
                      <option value="cash">Main Cash (Auto-create)</option>
                    ) : (
                      accounts.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.type.toUpperCase()}) — Rp {formatNumber(acc.balance)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Payment Method Pills */}
                <div className="md:col-span-6 space-y-1.5">
                  <span className="text-xs font-semibold text-foreground block">Payment Method</span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-0.5">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = formData.paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                          className={`h-9 px-1 rounded-xl text-[10px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-default-100 hover:bg-default-200 dark:bg-default-800 dark:hover:bg-default-700 text-default-600 dark:text-default-300 border-default-200/60 dark:border-default-700/60"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[50px]">{method.label.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ROW 5: DATE & TIME (Left 1/2) + MERCHANT / PAYEE (Right 1/2) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pt-1">
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Transaction Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full h-10 px-3 text-xs rounded-xl bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-800 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">
                    Merchant / Payee / Store
                  </label>
                  <div className="relative">
                    <Store className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-default-400" />
                    <input
                      type="text"
                      placeholder="e.g. Starbucks Grand Indonesia"
                      value={formData.merchant}
                      onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                      className="w-full h-10 pl-8.5 pr-3 text-xs rounded-xl bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-800 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* ROW 6: NOTES & MEMO */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Notes & Additional Memo</span>
                  <span className="text-[10px] text-default-400">Optional</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Add notes, itemized breakdown, or reference remarks..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 text-xs rounded-xl bg-default-50 dark:bg-default-900 border border-default-200 dark:border-default-800 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </form>
          </Card>

          {/* 3. ATTACHMENTS & DOCUMENT UPLOAD CARD */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Paperclip className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    Receipts & Invoices Attachments
                  </h3>
                  <p className="text-[11px] text-default-400">
                    Upload receipt photos or PDF invoices for audit-ready archive and AI verification
                  </p>
                </div>
              </div>
            </div>

            <DocumentUpload
              workspaceId={selectedWorkspace?.id || ""}
              onMetadataExtracted={handleMetadataExtracted}
            />
          </Card>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: LIVE DIGITAL VOUCHER & IMPACT (4 COLS)    */}
        {/* ======================================================= */}
        <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
          
          {/* DIGITAL RECEIPT / VOUCHER SLIP */}
          <div className="relative rounded-3xl p-5 bg-linear-to-b from-gray-900 to-gray-950 text-white shadow-2xl border border-gray-800 overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  NJ
                </div>
                <span className="font-bold text-xs tracking-wider uppercase text-gray-300">
                  Transaction Voucher
                </span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                formData.type === "EXPENSE" ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
              }`}>
                {formData.type}
              </span>
            </div>

            {/* Slip Amount */}
            <div className="py-5 text-center space-y-1 border-b border-gray-800/80">
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-mono">
                Total Transaction
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                <span className={formData.type === "EXPENSE" ? "text-rose-400" : "text-emerald-400"}>
                  {formData.type === "EXPENSE" ? "-" : "+"}
                  {currencyPrefix} {formData.amount ? formatNumber(formData.amount) : "0"}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium truncate px-2">
                {formData.description || "Untitled Transaction"}
              </p>
            </div>

            {/* Slip Key-Value Details */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-gray-400">
                <span>Category</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>{formData.category || "Uncategorized"}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-400">
                <span>Source Wallet</span>
                <span className="text-white font-semibold">
                  {selectedAccountObj?.name || "Main Cash"}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-400">
                <span>Payment Mode</span>
                <span className="text-white font-semibold capitalize">
                  {formData.paymentMethod.replace("_", " ")}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-400">
                <span>Timestamp</span>
                <span className="text-gray-300 font-mono text-[11px]">
                  {new Date(formData.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {formData.merchant && (
                <div className="flex items-center justify-between text-gray-400">
                  <span>Merchant</span>
                  <span className="text-white font-medium">{formData.merchant}</span>
                </div>
              )}
            </div>

            {/* Balance Impact */}
            <div className="p-3 rounded-xl bg-gray-800/60 border border-gray-700/60 space-y-1 text-xs">
              <div className="flex items-center justify-between text-gray-400 text-[11px]">
                <span>Wallet Balance Projected:</span>
                <span className="font-mono text-gray-300">
                  Rp {formatNumber(currentAccBalance)}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold">
                <span className="text-gray-300">After Entry:</span>
                <span className={`font-mono ${projectedBalance < 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  Rp {formatNumber(projectedBalance)}
                </span>
              </div>
            </div>

            {/* Barcode Accent */}
            <div className="mt-4 pt-3 border-t border-dashed border-gray-800 flex items-center justify-between text-[9px] text-gray-500 font-mono">
              <span>REF: {selectedWorkspace?.id.slice(0, 8) || "NOVA-WS"}</span>
              <span>SECURED BY BETTERAUTH & DRIZZLE</span>
            </div>
          </div>

          {/* ACTION BUTTONS CARD */}
          <Card className="p-4 rounded-2xl border border-default-200/80 dark:border-default-800 bg-white dark:bg-gray-900 shadow-xl space-y-3">
            <Button
              size="lg"
              onPress={() => handleSubmit()}
              isDisabled={loading}
              className="w-full bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm h-12 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{loading ? "Recording..." : "Record Transaction"}</span>
            </Button>

            <div className="flex items-center justify-between text-[11px] text-default-400 px-1 pt-1">
              <span>Shortcuts:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-default-100 dark:bg-default-800 font-mono text-[10px]">
                Ctrl + Enter
              </kbd>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
