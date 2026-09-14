"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { Button, Card, TextField, Label, Input, Select, ListBox } from "@heroui/react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "@/app/lib/queries";
import {
  DocumentUpload,
  type DocumentMetadata,
  type UploadedDocumentResult,
} from "@/app/(protected)/components/DocumentUpload";

export default function NewTransactionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    account: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
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

  const [attachedDocument, setAttachedDocument] = useState<UploadedDocumentResult | null>(null);
  const [isAiAutoFilled, setIsAiAutoFilled] = useState(false);

  const handleMetadataExtracted = (meta: DocumentMetadata, doc: UploadedDocumentResult) => {
    setAttachedDocument(doc);
    setIsAiAutoFilled(true);

    // 1. Amount
    if (meta.amount !== undefined && !isNaN(Number(meta.amount))) {
      setFormData((prev) => ({ ...prev, amount: String(meta.amount) }));
    }

    // 2. Vendor / Merchant -> Description
    const title = meta.merchant || meta.vendor;
    if (title) {
      setFormData((prev) => ({ ...prev, description: title }));
    }

    // 3. Date
    if (meta.date) {
      setFormData((prev) => ({ ...prev, date: meta.date! }));
    }

    // 4. Category
    if (meta.categories && meta.categories.length > 0 && categories.length > 0) {
      const extractedCat = meta.categories[0].toLowerCase();
      const matched = categories.find((c: { name: string; id: string }) => {
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
        setFormData((prev) => ({ ...prev, category: matched.name }));
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
      setFormData((prev) => ({ ...prev, notes: itemsSummary }));
    }
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
      if (!accountId) {
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

      if (!accountId) {
        setError("Please select or create an account.");
        setLoading(false);
        return;
      }

      // 2. Resolve categoryId
      let categoryId: string | undefined = undefined;
      if (formData.category) {
        const found = categories.find((c: { id: string; name: string }) => c.name === formData.category || c.id === formData.category);
        if (found) categoryId = found.id;
      }

      const res = await mutationFunctions.createTransaction({
        workspaceId: selectedWorkspace.id,
        accountId,
        categoryId,
        amount: String(formData.amount),
        type: formData.type.toLowerCase(),
        description: formData.description.trim(),
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        notes: formData.notes.trim() || undefined,
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
      if (attachedDocument?.id && res?.data?.transaction?.id) {
        try {
          await mutationFunctions.linkDocumentToTransaction({
            documentId: attachedDocument.id,
            transactionId: res.data.transaction.id,
          });
        } catch (linkErr) {
          console.warn("Failed to link document:", linkErr);
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardTrends(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardCategories(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardAccounts(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts(selectedWorkspace.id) });

      router.push("/transactions");
    } catch (err: unknown) {
      console.error("Failed to create transaction:", err);
      const msg = err instanceof Error ? err.message : "Failed to create transaction. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-medium text-default-500 hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        </div>

        <Card className="p-5 sm:p-6 bg-white dark:bg-gray-900 border border-default-200/80 dark:border-default-800 shadow-2xs rounded-2xl">
          <div className="mb-5">
            <h1 className="text-xl font-bold tracking-tight text-foreground">New Transaction</h1>
            <p className="text-default-500 text-xs mt-0.5">Add a new income or expense entry</p>
          </div>

          {error && (
            <div className="mb-4 bg-danger/10 border border-danger/20 text-danger px-3 py-2 rounded-xl text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Gemini RAG Document Scanner & Auto-Fill */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">Attach Receipt / Invoice (AI Auto-Fill)</Label>
              <DocumentUpload
                workspaceId={selectedWorkspace?.id || ""}
                onMetadataExtracted={handleMetadataExtracted}
                compact={true}
              />
              {isAiAutoFilled && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs">
                  <span>✨ Diisi otomatis oleh Gemini Vision AI dari struk. Anda dapat mengedit nilai apa pun.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedDocument(null);
                      setIsAiAutoFilled(false);
                      setFormData({
                        description: "",
                        amount: "",
                        type: "EXPENSE",
                        account: "",
                        category: "",
                        date: new Date().toISOString().split("T")[0],
                        notes: "",
                      });
                    }}
                    className="underline text-[11px] ml-2 cursor-pointer"
                  >
                    Reset Form
                  </button>
                </div>
              )}
            </div>

            {/* Type selector */}
            <div>
              <Label className="text-xs font-medium mb-1.5 block text-foreground">Transaction Type</Label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-default-100 dark:bg-default-800/60 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    formData.type === "EXPENSE"
                      ? "bg-red-500 text-white shadow-xs"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "INCOME" })}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    formData.type === "INCOME"
                      ? "bg-green-500 text-white shadow-xs"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <TextField className="w-full space-y-1">
              <Label className="text-xs font-medium text-foreground">Description *</Label>
              <Input
                type="text"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </TextField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TextField className="w-full space-y-1">
                <Label className="text-xs font-medium text-foreground">Amount (IDR) *</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  min="0"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </TextField>

              <TextField className="w-full space-y-1">
                <Label className="text-xs font-medium text-foreground">Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </TextField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Selection */}
              <div className="space-y-1">
                <Label className="text-xs font-medium text-foreground">Account / Wallet *</Label>
                <Select
                  placeholder={accounts.length > 0 ? "Select account" : "Main Cash (Default)"}
                  selectedKey={formData.account || (accounts[0]?.id ?? null)}
                  onSelectionChange={(key) => setFormData({ ...formData, account: key ? String(key) : "" })}
                  className="w-full"
                >
                  <Select.Trigger className="w-full justify-between h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="min-w-56 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                    <ListBox>
                      {accounts.length > 0 ? (
                        accounts.map((acc) => (
                          <ListBox.Item
                            key={acc.id}
                            id={acc.id}
                            textValue={acc.name}
                            className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-default-400" />
                              <span>{acc.name}</span>
                            </div>
                            <ListBox.ItemIndicator className="text-blue-500" />
                          </ListBox.Item>
                        ))
                      ) : (
                        <ListBox.Item key="cash" id="cash" textValue="Main Cash (Default)" className="px-2.5 py-1.5 rounded-lg text-xs">
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
                <Label className="text-xs font-medium text-foreground">Category</Label>
                <Select
                  placeholder="Select category"
                  selectedKey={formData.category || null}
                  onSelectionChange={(key) => setFormData({ ...formData, category: key ? String(key) : "" })}
                  className="w-full"
                >
                  <Select.Trigger className="w-full justify-between h-8.5 px-3 rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-xs font-medium">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="min-w-50 z-50 p-1 bg-white dark:bg-gray-900 border border-default-200 dark:border-default-800 rounded-xl shadow-xl">
                    <ListBox>
                      {categories.map((cat: { id: string; name: string }) => (
                        <ListBox.Item key={cat.id || cat.name} id={cat.name} textValue={cat.name} className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-default-100 dark:hover:bg-default-800 cursor-pointer">
                          {cat.name}
                          <ListBox.ItemIndicator className="text-blue-500" />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </div>

            {/* Notes Textarea */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-foreground">Notes / Remarks (Optional)</Label>
              <textarea
                rows={3}
                placeholder="Add memo, reference or notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-default-200 dark:border-default-700 bg-transparent text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-default-100 dark:border-default-800">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => router.back()}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-linear-to-r from-blue-500 to-purple-600 text-white font-medium shadow-xs flex items-center gap-1.5 cursor-pointer"
                isDisabled={loading}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "Saving..." : "Save Transaction"}</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
