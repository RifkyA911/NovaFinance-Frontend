/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Building2,
  CreditCard,
  Smartphone,
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
  Upload,
  Image as ImageIcon,
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

const PALETTE_CONFIG: Record<string, { primary: string; subtle: string; ring: string }> = {
  blue: { primary: "#2563eb", subtle: "rgba(37, 99, 235, 0.1)", ring: "rgba(37, 99, 235, 0.35)" },
  violet: { primary: "#7c3aed", subtle: "rgba(124, 58, 237, 0.1)", ring: "rgba(124, 58, 237, 0.35)" },
  emerald: { primary: "#059669", subtle: "rgba(5, 150, 105, 0.1)", ring: "rgba(5, 150, 105, 0.35)" },
  amber: { primary: "#d97706", subtle: "rgba(217, 119, 6, 0.1)", ring: "rgba(217, 119, 6, 0.35)" },
  rose: { primary: "#e11d48", subtle: "rgba(225, 29, 72, 0.1)", ring: "rgba(225, 29, 72, 0.35)" },
  slate: { primary: "#475569", subtle: "rgba(71, 85, 105, 0.1)", ring: "rgba(71, 85, 105, 0.35)" },
};

const ACCOUNT_TYPES = [
  {
    id: "bank" as const,
    label: "Rekening Bank",
    subtitle: "Giro, Tabungan, RDN",
    icon: Landmark,
  },
  {
    id: "ewallet" as const,
    label: "E-Wallet Digital",
    subtitle: "GoPay, OVO, Dana, QRIS",
    icon: Smartphone,
  },
  {
    id: "cash" as const,
    label: "Kas Tunai Fisik",
    subtitle: "Brankas kas & operasional",
    icon: Coins,
  },
  {
    id: "credit" as const,
    label: "Kartu Kredit",
    subtitle: "Plafon & cicilan bisnis",
    icon: CreditCard,
  },
];

export default function WalletsMasterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedWorkspace } = useWorkspace();

  // Dynamic Theme Palette Listener
  const [activePalette, setActivePalette] = useState<string>("blue");

  useEffect(() => {
    try {
      const pal = localStorage.getItem("novajournal_theme_palette") || "blue";
      setActivePalette(pal);

      const onPaletteChange = (e: any) => {
        const nextPal = e.detail || localStorage.getItem("novajournal_theme_palette") || "blue";
        setActivePalette(nextPal);
      };

      window.addEventListener("novajournal_palette_changed", onPaletteChange);
      return () => window.removeEventListener("novajournal_palette_changed", onPaletteChange);
    } catch {}
  }, []);

  const activeColor = PALETTE_CONFIG[activePalette]?.primary || "var(--primary-color, #2563eb)";
  const activeSubtle = PALETTE_CONFIG[activePalette]?.subtle || "var(--primary-subtle, rgba(37, 99, 235, 0.1))";
  const activeRing = PALETTE_CONFIG[activePalette]?.ring || "var(--primary-ring, rgba(37, 99, 235, 0.35))";

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
  const [formCustomLogo, setFormCustomLogo] = useState<string | null>(null);
  const [formNotes, setFormNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Professional Multi-Currency Intl Formatter with Live Display
  const formatIntlPreview = (val: number | string, curr: string = "IDR") => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return `${curr} 0`;
    try {
      const locale =
        curr === "IDR"
          ? "id-ID"
          : curr === "USD"
          ? "en-US"
          : curr === "EUR"
          ? "de-DE"
          : curr === "SGD"
          ? "en-SG"
          : curr === "GBP"
          ? "en-GB"
          : curr === "JPY"
          ? "ja-JP"
          : "id-ID";
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: curr,
        maximumFractionDigits: curr === "IDR" || curr === "JPY" ? 0 : 2,
      }).format(num);
    } catch {
      return `${curr} ${num.toLocaleString()}`;
    }
  };

  const formatCompactK = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(0)}M`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(0)}Jt`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
    return String(num);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran file logo maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormCustomLogo(reader.result as string);
      playSoftChime();
    };
    reader.readAsDataURL(file);
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
    setFormCustomLogo(null);
    setFormNotes("");
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
    setFormCustomLogo((acc as any).customLogo || null);
    setFormNotes((acc as any).notes || "");
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
        ...(formCustomLogo ? { customLogo: formCustomLogo } : {}),
      } as any);

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
        ...(formCustomLogo ? { customLogo: formCustomLogo } : {}),
      } as any);

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
                customLogo={(acc as any).customLogo}
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
          <div
            className="p-2.5 rounded-2xl text-white shadow-md shrink-0"
            style={{ background: `linear-gradient(135deg, ${activeColor} 0%, #4f46e5 100%)` }}
          >
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Wallets & Rekening Bank
              </h1>
              {selectedWorkspace && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-default-100 dark:bg-default-800 text-default-600 dark:text-default-300 font-medium border border-default-200/60 dark:border-default-700/60">
                  {selectedWorkspace.name}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Manajemen brankas kas fisik, rekening giro bank, dan dompet digital dengan alokasi likuiditas terintegrasi.
            </p>
          </div>
        </div>

        {/* Row 2: Controls (Left) and Actions (Far Right) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Controls: View Mode & Workspace Entity Link */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Grid vs Tabel */}
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
                    ? { backgroundColor: activeColor, color: "#ffffff" }
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
                    ? { backgroundColor: activeColor, color: "#ffffff" }
                    : undefined
                }
                title="Tampilan Daftar Tabel"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Daftar Tabel</span>
              </button>
            </div>

            {/* Pilih Entitas Workspace */}
            <Link
              href="/workspaces"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-default-50 dark:hover:bg-default-800 text-default-800 dark:text-default-200 font-semibold text-xs h-9 border border-default-200 dark:border-default-700 shadow-2xs transition cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-default-500" />
              <span>Pilih Entitas Workspace</span>
            </Link>
          </div>

          {/* Far Right: AI Treasury Advisor & Buka Rekening Baru */}
          <div className="flex items-center gap-2 ml-auto">
            {/* AI Treasury Advisor Button with NovaFinance Gradient */}
            <Button
              size="sm"
              onPress={() => setIsAiTreasuryOpen(true)}
              className="h-9 px-3.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer border-0"
              style={{ background: `linear-gradient(135deg, ${activeColor} 0%, #4f46e5 100%)` }}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>AI Treasury Advisor</span>
            </Button>

            {/* Buka Rekening Baru Button */}
            <Button
              size="sm"
              onPress={handleOpenCreate}
              className="h-9 px-4 text-xs font-semibold text-white cursor-pointer shadow-xs hover:opacity-95 active:scale-95 transition-all border-0"
              style={{ backgroundColor: activeColor }}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Buka Rekening Baru</span>
            </Button>
          </div>
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
                          backgroundColor: activeColor,
                          borderColor: activeColor,
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
                          customLogo={(acc as any).customLogo}
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

      {/* 8. Modal Tambah / Buka Rekening Baru (Wide 2x Layout) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs shrink-0"
                  style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-color)" }}
                >
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Buka Rekening & Akun Kas Baru</h3>
                  <p className="text-xs text-default-500">
                    Registrasi akun bank, e-wallet, kas fisik, atau plafon kredit dengan double-entry terintegrasi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden File Input for Logo Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            <form onSubmit={handleSubmitCreate} className="space-y-5 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 2-Column Professional Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ── Left Column: Account Details ── */}
                <div className="space-y-3.5">
                  {/* Tipe Rekening */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">Tipe Akun Kas *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACCOUNT_TYPES.map((typeObj) => {
                        const isSel = formType === typeObj.id;
                        const Icon = typeObj.icon;
                        return (
                          <button
                            key={typeObj.id}
                            type="button"
                            onClick={() => setFormType(typeObj.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center gap-2.5 relative ${
                              isSel
                                ? "shadow-2xs font-bold ring-1.5"
                                : "bg-default-50/80 dark:bg-default-800/60 border-default-200 dark:border-default-700 hover:bg-default-100 dark:hover:bg-default-800"
                            }`}
                            style={
                              isSel
                                ? {
                                    backgroundColor: activeSubtle,
                                    borderColor: activeColor,
                                    boxShadow: `0 0 0 1px ${activeColor}`,
                                  }
                                : undefined
                            }
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isSel
                                  ? "text-white shadow-2xs"
                                  : "bg-default-200/60 dark:bg-default-700 text-default-600 dark:text-default-300"
                              }`}
                              style={isSel ? { backgroundColor: activeColor } : undefined}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-foreground block leading-tight truncate">
                                {typeObj.label}
                              </span>
                              <span className="text-[10px] text-default-400 block truncate mt-0.5">
                                {typeObj.subtitle}
                              </span>
                            </div>
                            {isSel && (
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 ml-auto"
                                style={{ backgroundColor: activeColor }}
                              >
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nama Rekening */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Nama Akun / Rekening *</label>
                    <input
                      type="text"
                      placeholder="Contoh: BCA Giro Operasional, GoPay Merchant, Petty Cash HQ"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                      required
                    />
                  </div>

                  {/* Bank / Provider */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Institusi / Bank / Provider</label>
                    <input
                      type="text"
                      placeholder="BCA, Mandiri, BRI, GoPay, Chase, Wise..."
                      value={formBankName}
                      onChange={(e) => setFormBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                    />
                    <div className="flex items-center gap-1 mt-1.5 overflow-x-auto py-0.5">
                      {BANK_PRESETS.slice(0, 10).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormBankName(p)}
                          className="px-2.5 py-1 rounded-md text-[10px] bg-default-50 dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 shrink-0 cursor-pointer font-medium"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nomor Rekening */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Nomor Rekening / VA / IBAN (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: 123-456-7890 atau 0812-xxxx-xxxx"
                      value={formAccountNumber}
                      onChange={(e) => setFormAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40 font-mono"
                    />
                  </div>
                </div>

                {/* ── Right Column: Visual, Currency & Balance ── */}
                <div className="space-y-3.5">
                  {/* Brand Visual & Logo Upload */}
                  <div className="p-3 rounded-xl bg-default-50/80 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">Identitas Visual & Logo</label>
                      <span className="text-[10px] text-default-400">PNG, SVG, JPG (Max 2MB)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BankLogo
                        customLogo={formCustomLogo}
                        bankName={formBankName}
                        accountName={formName}
                        type={formType}
                        size={48}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 hover:bg-default-100 text-foreground shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-default-500" />
                            <span>Upload Logo</span>
                          </button>
                          {formCustomLogo && (
                            <button
                              type="button"
                              onClick={() => setFormCustomLogo(null)}
                              className="px-2 py-1 rounded-lg text-[11px] font-medium text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              Reset Default
                            </button>
                          )}
                        </div>
                        <p className="text-[10.5px] text-default-400 leading-tight">
                          {formCustomLogo
                            ? "Logo kustom terpasang untuk rekening ini."
                            : "Logo otomatis dicocokkan dengan nama bank / e-wallet jika tersedia."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mata Uang Akun */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Mata Uang Akun (Currency)</label>
                    <select
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40 font-mono font-medium"
                    >
                      <option value="IDR">IDR - Indonesian Rupiah (Rp)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="SGD">SGD - Singapore Dollar (S$)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                    </select>
                  </div>

                  {/* Saldo Awal Likuid with Live Preview */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-default-50/80 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">Saldo Awal ({formCurrency}) *</label>
                      <span className="text-[10px] text-default-400 font-mono font-bold">{formCurrency}</span>
                    </div>
                    <input
                      type="number"
                      step="1000"
                      value={formBalance}
                      onChange={(e) => setFormBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                      placeholder="0"
                      required
                    />

                    {/* Live Currency Preview */}
                    <div className="px-3 py-2 rounded-xl bg-default-100/70 dark:bg-default-800/70 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between">
                      <span className="text-xs text-default-500 font-medium">Estimasi Saldo:</span>
                      <span className="font-mono font-bold text-xs" style={{ color: activeColor }}>
                        {formatIntlPreview(formBalance, formCurrency)}
                      </span>
                    </div>

                    {/* Quick chips */}
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      {[1000000, 5000000, 10000000, 50000000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFormBalance(String(Number(formBalance || 0) + v))}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 font-mono hover:bg-default-100 cursor-pointer"
                        >
                          +{formatCompactK(v)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormBalance("0")}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 font-mono hover:bg-rose-500/20 cursor-pointer"
                      >
                        Reset 0
                      </button>
                    </div>
                  </div>

                  {/* Catatan / Peruntukan Akun */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Catatan & Peruntukan Akun (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Misal: Operasional payroll karyawan & transfer vendor"
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-default-100 dark:bg-default-800 hover:bg-default-200 dark:hover:bg-default-700 text-foreground text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer border-0"
                  style={{ backgroundColor: activeColor }}
                >
                  {isSubmitting ? "Mendaftarkan Rekening..." : "Buka Rekening Kas"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* 9. Modal Edit Rekening & Penyesuaian Saldo (Wide 2x Layout) */}
      {isEditModalOpen && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl border border-default-200/80 dark:border-default-800 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-default-100 dark:border-default-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-2xs shrink-0"
                  style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-color)" }}
                >
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Edit Rekening & Rekonsiliasi Kas</h3>
                  <p className="text-xs text-default-500">
                    Perbarui profil institusi, identitas visual, atau rekonsiliasi saldo kas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-default-400 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hidden File Input for Logo Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />

            <form onSubmit={handleSubmitUpdate} className="space-y-5 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 2-Column Professional Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ── Left Column: Account Details ── */}
                <div className="space-y-3.5">
                  {/* Tipe Rekening */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground text-xs">Tipe Akun Kas</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ACCOUNT_TYPES.map((typeObj) => {
                        const isSel = formType === typeObj.id;
                        const Icon = typeObj.icon;
                        return (
                          <button
                            key={typeObj.id}
                            type="button"
                            onClick={() => setFormType(typeObj.id)}
                            className={`p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-center gap-2.5 relative ${
                              isSel
                                ? "shadow-2xs font-bold ring-1.5"
                                : "bg-default-50/80 dark:bg-default-800/60 border-default-200 dark:border-default-700 hover:bg-default-100 dark:hover:bg-default-800"
                            }`}
                            style={
                              isSel
                                ? {
                                    backgroundColor: activeSubtle,
                                    borderColor: activeColor,
                                    boxShadow: `0 0 0 1px ${activeColor}`,
                                  }
                                : undefined
                            }
                          >
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isSel
                                  ? "text-white shadow-2xs"
                                  : "bg-default-200/60 dark:bg-default-700 text-default-600 dark:text-default-300"
                              }`}
                              style={isSel ? { backgroundColor: activeColor } : undefined}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-foreground block leading-tight truncate">
                                {typeObj.label}
                              </span>
                              <span className="text-[10px] text-default-400 block truncate mt-0.5">
                                {typeObj.subtitle}
                              </span>
                            </div>
                            {isSel && (
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 ml-auto"
                                style={{ backgroundColor: activeColor }}
                              >
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nama Rekening */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Nama Akun / Rekening *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                      required
                    />
                  </div>

                  {/* Bank / Provider */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Institusi / Bank / Provider</label>
                    <input
                      type="text"
                      placeholder="BCA, Mandiri, BRI, GoPay, Chase, Wise..."
                      value={formBankName}
                      onChange={(e) => setFormBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                    />
                    <div className="flex items-center gap-1 mt-1.5 overflow-x-auto py-0.5">
                      {BANK_PRESETS.slice(0, 10).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormBankName(p)}
                          className="px-2.5 py-1 rounded-md text-[10px] bg-default-50 dark:bg-default-800 hover:bg-default-100 dark:hover:bg-default-700 border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 shrink-0 cursor-pointer font-medium"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40 font-mono"
                    />
                  </div>
                </div>

                {/* ── Right Column: Visual, Currency & Reconciliation ── */}
                <div className="space-y-3.5">
                  {/* Brand Visual & Logo Upload */}
                  <div className="p-3 rounded-xl bg-default-50/80 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">Identitas Visual & Logo</label>
                      <span className="text-[10px] text-default-400">PNG, SVG, JPG (Max 2MB)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BankLogo
                        customLogo={formCustomLogo}
                        bankName={formBankName}
                        accountName={formName}
                        type={formType}
                        size={48}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 hover:bg-default-100 text-foreground shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5 text-default-500" />
                            <span>Ganti Logo</span>
                          </button>
                          {formCustomLogo && (
                            <button
                              type="button"
                              onClick={() => setFormCustomLogo(null)}
                              className="px-2 py-1 rounded-lg text-[11px] font-medium text-rose-600 hover:bg-rose-500/10 transition cursor-pointer"
                            >
                              Reset Default
                            </button>
                          )}
                        </div>
                        <p className="text-[10.5px] text-default-400 leading-tight">
                          {formCustomLogo
                            ? "Logo kustom terpasang untuk rekening ini."
                            : "Logo otomatis dicocokkan dengan nama bank / e-wallet jika tersedia."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mata Uang Akun */}
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Mata Uang Akun (Currency)</label>
                    <select
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary/40 font-mono font-medium"
                    >
                      <option value="IDR">IDR - Indonesian Rupiah (Rp)</option>
                      <option value="USD">USD - US Dollar ($)</option>
                      <option value="EUR">EUR - Euro (€)</option>
                      <option value="SGD">SGD - Singapore Dollar (S$)</option>
                      <option value="JPY">JPY - Japanese Yen (¥)</option>
                      <option value="GBP">GBP - British Pound (£)</option>
                      <option value="AUD">AUD - Australian Dollar (A$)</option>
                      <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                    </select>
                  </div>

                  {/* Penyesuaian Saldo Kas with Live Preview */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-default-50/80 dark:bg-default-800/50 border border-default-200/60 dark:border-default-700/60">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground text-xs">Penyesuaian Saldo Kas ({formCurrency})</label>
                      <span className="text-[10px] text-default-400 font-mono font-bold">{formCurrency}</span>
                    </div>
                    <input
                      type="number"
                      step="1000"
                      value={formBalance}
                      onChange={(e) => setFormBalance(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-default-200 dark:border-default-700 bg-white dark:bg-default-900 text-foreground text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-theme-primary/40"
                    />

                    {/* Live Currency Preview */}
                    <div className="px-3 py-2 rounded-xl bg-default-100/70 dark:bg-default-800/70 border border-default-200/60 dark:border-default-700/60 flex items-center justify-between">
                      <span className="text-xs text-default-500 font-medium">Estimasi Saldo:</span>
                      <span className="font-mono font-bold text-xs" style={{ color: activeColor }}>
                        {formatIntlPreview(formBalance, formCurrency)}
                      </span>
                    </div>

                    {/* Quick chips */}
                    <div className="flex items-center gap-1 pt-1 flex-wrap">
                      {[1000000, 5000000, 10000000, 50000000].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFormBalance(String(Number(formBalance || 0) + v))}
                          className="px-2 py-0.5 rounded-md text-[10px] bg-white dark:bg-default-900 border border-default-200 dark:border-default-700 text-default-600 dark:text-default-300 font-mono hover:bg-default-100 cursor-pointer"
                        >
                          +{formatCompactK(v)}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setFormBalance("0")}
                        className="px-2 py-0.5 rounded-md text-[10px] bg-rose-500/10 text-rose-600 border border-rose-500/20 font-mono hover:bg-rose-500/20 cursor-pointer"
                      >
                        Reset 0
                      </button>
                    </div>

                    <p className="text-[10.5px] text-default-400 leading-relaxed pt-1">
                      💡 Gunakan fitur ini untuk set saldo awal akun baru atau rekonsiliasi opname kas fisik. Untuk mutasi operasional harian, catat di menu Transaksi agar double-entry ledger tetap seimbang.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-default-100 dark:border-default-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-default-100 dark:bg-default-800 hover:bg-default-200 dark:hover:bg-default-700 text-foreground text-xs font-semibold cursor-pointer transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-white font-semibold text-xs shadow-xs hover:opacity-95 disabled:opacity-50 transition cursor-pointer border-0"
                  style={{ backgroundColor: activeColor }}
                >
                  {isSubmitting ? "Menyimpan Perubahan..." : "Perbarui Rekening"}
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
