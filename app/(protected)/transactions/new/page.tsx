/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  Button,
  Card,
  TextField,
  Label,
  Input,
  Select,
  ListBox,
  Tabs,
  DatePicker,
  DateField,
  Calendar,
} from "@heroui/react";
import {
  parseDate,
  today,
  getLocalTimeZone,
  type DateValue,
} from "@internationalized/date";
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

function getAccountIcon(type: string) {
  switch (type?.toLowerCase()) {
    case "bank":
      return <Building2 className="w-4 h-4 text-blue-500" />;
    case "ewallet":
      return <Wallet className="w-4 h-4 text-purple-500" />;
    case "credit":
      return <CreditCard className="w-4 h-4 text-orange-500" />;
    case "cash":
    default:
      return <Banknote className="w-4 h-4 text-green-500" />;
  }
}

function getCurrencyPrefix(curr?: string) {
  if (!curr || curr.toUpperCase() === "IDR") return "Rp";
  if (curr.toUpperCase() === "USD") return "$";
  if (curr.toUpperCase() === "SGD") return "S$";
  if (curr.toUpperCase() === "EUR") return "€";
  return curr;
}

function formatAmountInput(numStr: string) {
  if (!numStr) return "";
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState<DateValue | null>(() => {
    try {
      return today(getLocalTimeZone());
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    account: "",
    category: "",
    date: selectedDate ? selectedDate.toString() : "",
    notes: "",
    paymentMethod: "cash",
    merchant: "",
    referenceNo: "",
  });

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

  // Merge user workspace categories with presets
  const existingCatNames = new Set(
    categories.map((c: any) => c.name.toLowerCase()),
  );
  const availablePresets = PRESET_CATEGORIES.filter(
    (p) =>
      !existingCatNames.has(p.name.toLowerCase()) &&
      p.type === formData.type.toLowerCase(),
  );

  const allCategoryOptions = [
    ...categories
      .filter(
        (c: any) =>
          !c.type || c.type.toLowerCase() === formData.type.toLowerCase(),
      )
      .map((c: any) => ({
        id: c.name,
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
  ];

  const [attachedDocuments, setAttachedDocuments] = useState<
    Record<string, UploadedDocumentResult>
  >({});
  const [isAiAutoFilled, setIsAiAutoFilled] = useState(false);

  const handleMetadataExtracted = (
    meta: DocumentMetadata,
    doc: UploadedDocumentResult,
    key: string,
  ) => {
    setAttachedDocuments((prev) => ({ ...prev, [key]: doc }));

    if (!isAiAutoFilled) {
      setIsAiAutoFilled(true);

      // Amount
      if (meta.amount !== undefined && !isNaN(Number(meta.amount))) {
        setFormData((prev) => ({ ...prev, amount: String(meta.amount) }));
      }

      // Merchant / Payee
      const merchantName = meta.merchant || meta.vendor || "";
      if (merchantName) {
        setFormData((prev) => ({
          ...prev,
          merchant: merchantName,
          description: prev.description || merchantName,
        }));
      }

      // Date
      if (meta.date) {
        try {
          const iso = meta.date.slice(0, 10);
          const parsed = parseDate(iso);
          setSelectedDate(parsed);
          setFormData((prev) => ({ ...prev, date: iso }));
        } catch {
          // ignore parsing error
        }
      }

      // Category
      if (
        meta.categories &&
        meta.categories.length > 0 &&
        categories.length > 0
      ) {
        const extractedCat = meta.categories[0].toLowerCase();
        const matched = categories.find((c: { name: string; id: string }) => {
          const cName = c.name.toLowerCase();
          return (
            cName.includes(extractedCat) ||
            extractedCat.includes(cName) ||
            (extractedCat.includes("food") && cName.includes("makan")) ||
            (extractedCat.includes("grocer") &&
              (cName.includes("belanja") || cName.includes("grocer"))) ||
            (extractedCat.includes("transport") &&
              cName.includes("transport")) ||
            (extractedCat.includes("util") && cName.includes("tagihan"))
          );
        });
        if (matched) {
          setFormData((prev) => ({ ...prev, category: matched.name }));
        }
      }

      // Line items -> Notes
      if (meta.lineItems && meta.lineItems.length > 0) {
        const itemsSummary = meta.lineItems
          .map(
            (item) =>
              `• ${item.description || "Item"} (${item.quantity || 1}x @ Rp ${(item.unitPrice || 0).toLocaleString("id-ID")} = Rp ${(item.totalPrice || 0).toLocaleString("id-ID")})`,
          )
          .join("\n");
        setFormData((prev) => ({ ...prev, notes: itemsSummary }));
      }
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    if (/^\d*\.?\d*$/.test(raw)) {
      setFormData((prev) => ({ ...prev, amount: raw }));
    }
  };

  const resetForm = () => {
    setAttachedDocuments({});
    setIsAiAutoFilled(false);
    const t = today(getLocalTimeZone());
    setSelectedDate(t);
    setFormData({
      description: "",
      amount: "",
      type: "EXPENSE",
      account: "",
      category: "",
      date: t.toString(),
      notes: "",
      paymentMethod: "cash",
      merchant: "",
      referenceNo: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.amount) {
      setError("Please provide description and amount.");
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
      if (!accountId || accountId === "cash" || accountId === "default-cash") {
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

      if (!accountId || accountId === "cash" || accountId === "default-cash") {
        setError("Please select or create an account.");
        setLoading(false);
        return;
      }

      // 2. Resolve categoryId or auto-create if preset
      let categoryId: string | undefined = undefined;
      if (formData.category) {
        const found = categories.find(
          (c: { id: string; name: string }) =>
            c.name.toLowerCase() === formData.category.toLowerCase() ||
            c.id === formData.category,
        );
        if (found) {
          categoryId = found.id;
        } else {
          // Auto-create category in workspace master data
          const preset = PRESET_CATEGORIES.find(
            (p) => p.name === formData.category,
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
        date: formData.date
          ? new Date(formData.date).toISOString()
          : new Date().toISOString(),
        notes: formData.notes.trim() || undefined,
        metadata: {
          paymentMethod: formData.paymentMethod || undefined,
          merchant: formData.merchant.trim() || undefined,
          referenceNo: formData.referenceNo.trim() || undefined,
        },
      };

      const res = await mutationFunctions.createTransaction(payload);

      // Link uploaded documents
      const docs = Object.values(attachedDocuments);
      for (const doc of docs) {
        if (doc.id && res.data?.transaction?.id) {
          await mutationFunctions.linkDocumentToTransaction({
            documentId: doc.id,
            transactionId: res.data.transaction.id,
          });
        }
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions(selectedWorkspace.id),
      });
      router.push("/transactions");
    } catch (err: any) {
      console.error("Create transaction error:", err);
      setError(err?.message || "Failed to create transaction.");
    } finally {
      setLoading(false);
    }
  };

  const currency = selectedWorkspace?.currency || "IDR";
  const currencyPrefix = getCurrencyPrefix(currency);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-medium text-default-500 hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <Card className="p-5 sm:p-8 bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-xl rounded-2xl">
          <div className="mb-6 pb-4 border-b border-default-100 dark:border-default-800">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              New Transaction
            </h1>
            <p className="text-default-400 text-xs mt-1">
              Record a new income or expense entry with automated bookkeeping
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Attachments */}
            <div className="bg-default-50 dark:bg-default-900/50 p-4 rounded-xl border border-default-200 dark:border-default-800 space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Attachments (Receipts / Invoices)
              </Label>
              <DocumentUpload
                workspaceId={selectedWorkspace?.id || ""}
                onMetadataExtracted={(meta, doc) =>
                  handleMetadataExtracted(meta, doc, "doc-main")
                }
                compact={true}
              />
              {isAiAutoFilled && (
                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-xs font-medium">
                  <span>
                    ✨ Auto-filled by Gemini AI. You can edit any value.
                  </span>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="underline ml-2 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Transaction Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold block text-foreground">
                Type
              </Label>
              <Tabs
                variant="primary"
                selectedKey={formData.type}
                onSelectionChange={(key) =>
                  setFormData({
                    ...formData,
                    type: key as "INCOME" | "EXPENSE",
                    category: "", // reset category selection on type switch
                  })
                }
                className="w-full"
              >
                <Tabs.ListContainer>
                  <Tabs.List className="flex bg-default-200/50 dark:bg-default-800/50 p-1.5 rounded-xl gap-2">
                    <Tabs.Tab
                      id="EXPENSE"
                      className="py-1.5 px-6 rounded-lg text-sm font-bold transition-all cursor-pointer flex-1 text-center bg-white text-black dark:bg-default-100 dark:text-white data-[selected=true]:bg-red-500 data-[selected=true]:text-white shadow-sm outline-none data-[focus-visible=true]:ring-2"
                    >
                      Expense
                    </Tabs.Tab>
                    <Tabs.Tab
                      id="INCOME"
                      className="py-1.5 px-6 rounded-lg text-sm font-bold transition-all cursor-pointer flex-1 text-center bg-white text-black dark:bg-default-100 dark:text-white data-[selected=true]:bg-green-500 data-[selected=true]:text-white shadow-sm outline-none data-[focus-visible=true]:ring-2"
                    >
                      Income
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
              </Tabs>
            </div>

            {/* Title / Description & Merchant / Payee (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField className="w-full space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Title / Description *
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Lunch with client, Cloud subscription..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  className="h-11 text-xs"
                />
              </TextField>

              <TextField className="w-full space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-default-400" />
                  <Label className="text-xs font-semibold text-foreground">
                    Merchant / Payee
                  </Label>
                </div>
                <Input
                  type="text"
                  placeholder="e.g. McDonald's, AWS, Tokopedia..."
                  value={formData.merchant}
                  onChange={(e) =>
                    setFormData({ ...formData, merchant: e.target.value })
                  }
                  className="h-11 text-xs"
                />
              </TextField>
            </div>

            {/* Amount with Currency Prefix & 3-Digit Separator */}
            <div className="space-y-2">
              <TextField className="w-full space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Amount ({currency}) *
                </Label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 z-10 flex items-center pointer-events-none text-xs font-bold text-default-500 select-none">
                    {currencyPrefix}
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={formatAmountInput(formData.amount)}
                    onChange={handleAmountChange}
                    required
                    className="h-11 text-xs font-mono pl-11 pr-4 font-semibold"
                  />
                </div>
              </TextField>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Reset", val: "0" },
                  { label: "+10k", val: 10000 },
                  { label: "+25k", val: 25000 },
                  { label: "+50k", val: 50000 },
                  { label: "+100k", val: 100000 },
                  { label: "+500k", val: 500000 },
                ].map((btn) => (
                  <Button
                    key={btn.label}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onPress={() =>
                      setFormData({
                        ...formData,
                        amount:
                          btn.val === "0"
                            ? "0"
                            : String(
                                (Number(formData.amount) || 0) +
                                  (btn.val as number),
                              ),
                      })
                    }
                    className="font-semibold text-[11px] px-3 py-1"
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date (HeroUI DatePicker) + Wallet / Account */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                className="w-full space-y-1.5"
                value={selectedDate}
                onChange={(val) => {
                  setSelectedDate(val);
                  if (val) {
                    setFormData((prev) => ({ ...prev, date: val.toString() }));
                  }
                }}
              >
                <Label className="text-xs font-semibold text-foreground">
                  Date *
                </Label>
                <DateField.Group
                  fullWidth
                  className="h-11 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 hover:bg-default-100 transition-colors flex items-center justify-between"
                >
                  <DateField.Input className="flex items-center gap-0.5 text-xs font-medium">
                    {(segment) => (
                      <DateField.Segment
                        segment={segment}
                        className="px-0.5 rounded outline-none focus:bg-blue-500 focus:text-white"
                      />
                    )}
                  </DateField.Input>
                  <DateField.Suffix>
                    <DatePicker.Trigger className="p-1.5 rounded-lg hover:bg-default-200 dark:hover:bg-default-700 text-default-500 cursor-pointer">
                      <DatePicker.TriggerIndicator />
                    </DatePicker.Trigger>
                  </DateField.Suffix>
                </DateField.Group>
                <DatePicker.Popover className="p-3 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-2xl shadow-2xl z-50">
                  <Calendar aria-label="Transaction date">
                    <Calendar.Header className="flex items-center justify-between pb-2 mb-2 border-b border-default-100 dark:border-default-800">
                      <Calendar.YearPickerTrigger className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-default-100 dark:hover:bg-default-800">
                        <Calendar.YearPickerTriggerHeading />
                        <Calendar.YearPickerTriggerIndicator />
                      </Calendar.YearPickerTrigger>
                      <div className="flex items-center gap-1">
                        <Calendar.NavButton
                          slot="previous"
                          className="p-1 rounded hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer text-xs"
                        />
                        <Calendar.NavButton
                          slot="next"
                          className="p-1 rounded hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer text-xs"
                        />
                      </div>
                    </Calendar.Header>
                    <Calendar.Grid className="w-full border-collapse">
                      <Calendar.GridHeader>
                        {(day) => (
                          <Calendar.HeaderCell className="text-[10px] font-medium text-default-400 pb-1 text-center">
                            {day}
                          </Calendar.HeaderCell>
                        )}
                      </Calendar.GridHeader>
                      <Calendar.GridBody>
                        {(date) => (
                          <Calendar.Cell
                            date={date}
                            className="w-8 h-8 text-xs text-center rounded-lg hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer data-[selected=true]:bg-blue-600 data-[selected=true]:text-white font-medium flex items-center justify-center m-0.5"
                          />
                        )}
                      </Calendar.GridBody>
                    </Calendar.Grid>
                  </Calendar>
                </DatePicker.Popover>
              </DatePicker>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Account / Wallet *
                </Label>
                <Select
                  aria-label="Account"
                  placeholder="Select account"
                  selectedKey={formData.account || null}
                  onSelectionChange={(key) =>
                    setFormData({
                      ...formData,
                      account: key ? String(key) : "",
                    })
                  }
                  className="w-full"
                >
                  <Select.Trigger className="w-full justify-between h-11 flex items-center px-4 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 hover:bg-default-100 transition-colors text-xs font-medium outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="w-[var(--trigger-width)] z-50 p-2 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    <ListBox aria-label="Accounts">
                      {accounts.length > 0 ? (
                        accounts.map((acc: any) => (
                          <ListBox.Item
                            key={acc.id}
                            id={acc.id}
                            textValue={acc.name}
                            className="px-3 py-2.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              {getAccountIcon(acc.type)}
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs text-foreground">
                                  {acc.name}
                                </span>
                                <span className="text-[10px] text-default-400">
                                  {acc.type?.toUpperCase()}
                                  {acc.bankName ? ` · ${acc.bankName}` : ""}
                                  {acc.balance
                                    ? ` · ${Number(acc.balance).toLocaleString("id-ID")} ${acc.currency || currency}`
                                    : ""}
                                </span>
                              </div>
                            </div>
                            <ListBox.ItemIndicator className="text-blue-500" />
                          </ListBox.Item>
                        ))
                      ) : (
                        <ListBox.Item
                          id="no-accounts"
                          textValue="No accounts yet"
                          className="px-3 py-2 text-xs text-default-400 italic"
                        >
                          No accounts yet — will auto-create &quot;Main
                          Cash&quot;
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>

            {/* Category & Payment Method (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Category
                </Label>
                <Select
                  aria-label="Category"
                  placeholder="Select category"
                  selectedKey={formData.category || null}
                  onSelectionChange={(key) =>
                    setFormData({
                      ...formData,
                      category: key ? String(key) : "",
                    })
                  }
                  className="w-full"
                >
                  <Select.Trigger className="w-full justify-between h-11 flex items-center px-4 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 hover:bg-default-100 transition-colors text-xs font-medium outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="w-[var(--trigger-width)] z-50 p-2 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    <ListBox aria-label="Categories">
                      {allCategoryOptions.length > 0 ? (
                        allCategoryOptions.map((cat) => (
                          <ListBox.Item
                            key={cat.id}
                            id={cat.id}
                            textValue={cat.name}
                            className="px-3 py-2.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold text-xs text-foreground">
                                  {cat.name}
                                </span>
                                <span className="text-[10px] text-default-400 uppercase">
                                  {cat.type}
                                  {cat.isPreset ? " · default preset" : " · master"}
                                </span>
                              </div>
                            </div>
                            <ListBox.ItemIndicator className="text-blue-500" />
                          </ListBox.Item>
                        ))
                      ) : (
                        <ListBox.Item
                          id="no-categories"
                          textValue="No categories"
                          className="px-3 py-2 text-xs text-default-400 italic"
                        >
                          No categories available
                        </ListBox.Item>
                      )}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">
                  Payment Method
                </Label>
                <Select
                  aria-label="Payment Method"
                  placeholder="Select payment method"
                  selectedKey={formData.paymentMethod}
                  onSelectionChange={(key) =>
                    setFormData({
                      ...formData,
                      paymentMethod: key ? String(key) : "cash",
                    })
                  }
                  className="w-full"
                >
                  <Select.Trigger className="w-full justify-between h-11 flex items-center px-4 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 hover:bg-default-100 transition-colors text-xs font-medium outline-none">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="w-[var(--trigger-width)] z-50 p-2 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                    <ListBox aria-label="Payment Methods">
                      {PAYMENT_METHODS.map((pm) => {
                        const Icon = pm.icon;
                        return (
                          <ListBox.Item
                            key={pm.id}
                            id={pm.id}
                            textValue={pm.label}
                            className="px-3 py-2.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-default-500" />
                              <span className="font-semibold text-xs text-foreground">
                                {pm.label}
                              </span>
                            </div>
                            <ListBox.ItemIndicator className="text-blue-500" />
                          </ListBox.Item>
                        );
                      })}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>

            {/* Reference Number */}
            <TextField className="w-full space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-default-400" />
                <Label className="text-xs font-semibold text-foreground">
                  Reference / Invoice No. (Optional)
                </Label>
              </div>
              <Input
                type="text"
                placeholder="e.g. INV/2026/09/001, TRX-99238, Struk #12"
                value={formData.referenceNo}
                onChange={(e) =>
                  setFormData({ ...formData, referenceNo: e.target.value })
                }
                className="h-11 text-xs font-mono"
              />
            </TextField>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Notes (Optional)
              </Label>
              <textarea
                rows={3}
                placeholder="Memo, reference, or detailed notes..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-4 py-3 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-default-50 text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-default-100 dark:border-default-800">
              <Button
                variant="secondary"
                size="sm"
                onPress={() => router.back()}
                isDisabled={loading}
                className="font-semibold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs font-bold flex items-center gap-2 px-6"
                isDisabled={loading}
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save Transaction"}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
