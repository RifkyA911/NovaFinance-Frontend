"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Chip,
  Table,
  Spinner,
} from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
} from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryFunctions } from "../../lib/queries";
import type { TransactionWithIcon } from "../../lib/api";

export default function Transactions() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.transactions(selectedWorkspace?.id || "", 100),
    enabled: !!selectedWorkspace,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories(selectedWorkspace?.id || ""),
    queryFn: () => queryFunctions.categories(selectedWorkspace?.id || ""),
    enabled: !!selectedWorkspace,
  });

  const rawTransactions = transactionsQuery.data?.data?.transactions || [];
  const allCategories = categoriesQuery.data?.data?.categories || [];

  const categoryList = ["All", ...allCategories.map((c: { name: string }) => c.name)];

  const filteredTransactions = rawTransactions.filter((tx: { type?: string; category?: string | { name?: string }; description?: string }) => {
    if (selectedType !== "ALL" && tx.type?.toUpperCase() !== selectedType) return false;
    const catName = typeof tx.category === "object" && tx.category ? tx.category.name : tx.category;
    if (selectedCategory !== "All" && catName !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const desc = (tx.description || "").toLowerCase();
      if (!desc.includes(searchQuery.toLowerCase())) return false;
    }
    return true;
  });

  const transactions: TransactionWithIcon[] = filteredTransactions.map(
    (
      tx: { id?: string; category?: string | { name?: string }; type: string; date: string; description: string; amount: number },
      index: number
    ) => {
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
        type: isIncome ? ("INCOME" as const) : ("EXPENSE" as const),
        id: tx.id || `tx-${index}`,
        category: categoryName,
        icon: isIncome ? (
          <Wallet className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <CreditCard className="w-3.5 h-3.5 text-red-500" />
        ),
        date: tx.date
          ? new Date(tx.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          : "-",
      };
    }
  );

  const totalIncome = rawTransactions
    .filter((t: { type?: string }) => t.type?.toLowerCase() === "income")
    .reduce((sum: number, t: { amount?: number }) => sum + Number(t.amount || 0), 0);
  const totalExpense = rawTransactions
    .filter((t: { type?: string }) => t.type?.toLowerCase() === "expense")
    .reduce((sum: number, t: { amount?: number }) => sum + Number(t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  if (transactionsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-5 flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-2.5">
          <Spinner size="md" />
          <p className="text-default-500 text-xs sm:text-sm">Loading transactions...</p>
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
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Transactions</h1>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">
              Manage your income and expenses for <span className="font-medium text-foreground">{selectedWorkspace?.name || "Workspace"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-xs cursor-pointer"
              onPress={() => router.push("/transactions/new")}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Stats Cards - Compact 80% proportion */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Income</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">
                  Rp {(totalIncome / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-success">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Incoming funds</span>
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
                <p className="text-xs font-medium text-default-500">Total Expenses</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                  Rp {(totalExpense / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-danger">
                  <ArrowDownRight className="w-3 h-3" />
                  <span>Outgoing spending</span>
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
                <p className="text-xs font-medium text-default-500">Net Balance</p>
                <p className={`text-xl sm:text-2xl font-bold tracking-tight ${netBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-danger'}`}>
                  Rp {(netBalance / 1000000).toFixed(1)}M
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-default-500">
                  <Wallet className="w-3 h-3" />
                  <span>Cashflow result</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Bar */}
        <Card className="p-3 sm:p-3.5 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-default-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                placeholder="Search transactions by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-default-200 dark:border-default-700 bg-default-50 dark:bg-default-800/60 text-xs text-foreground placeholder:text-default-400 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1 p-0.5 bg-default-100 dark:bg-default-800/60 rounded-lg shrink-0">
              {(["ALL", "INCOME", "EXPENSE"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`py-1 px-2.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    selectedType === t
                      ? "bg-white dark:bg-gray-700 text-foreground shadow-2xs font-semibold"
                      : "text-default-600 hover:text-foreground"
                  }`}
                >
                  {t === "ALL" ? "All" : t === "INCOME" ? "Income" : "Expense"}
                </button>
              ))}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {categoryList.slice(0, 7).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-medium border transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === category
                      ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-semibold"
                      : "border-default-200 dark:border-default-700 text-default-600 hover:bg-default-100 dark:hover:bg-default-800"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Transactions Table - HeroUI v3 Compound Components */}
        <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs overflow-hidden">
          <Card.Header className="p-3.5 sm:p-4 border-b border-default-100 dark:border-default-800/80 flex items-center justify-between">
            <div>
              <Card.Title className="text-sm font-semibold text-foreground">All Transactions</Card.Title>
              <Card.Description className="text-xs text-default-500">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""} recorded
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            <Table className="w-full">
              <Table.ScrollContainer className="overflow-x-auto">
                <Table.Content aria-label="Transactions Table" className="w-full min-w-140">
                  <Table.Header>
                    <Table.Column id="transaction" isRowHeader className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30">
                      Transaction
                    </Table.Column>
                    <Table.Column id="category" className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30 hidden sm:table-cell">
                      Category
                    </Table.Column>
                    <Table.Column id="date" className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30 hidden md:table-cell">
                      Date
                    </Table.Column>
                    <Table.Column id="amount" className="text-right py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30">
                      Amount
                    </Table.Column>
                    <Table.Column id="status" className="text-left py-2.5 px-3.5 text-xs font-semibold text-default-500 bg-default-50/50 dark:bg-default-900/30 hidden sm:table-cell">
                      Status
                    </Table.Column>
                  </Table.Header>
                  <Table.Body
                    items={transactions}
                    renderEmptyState={() => (
                      <div className="py-12 text-center text-default-500 text-xs space-y-2">
                        <p>No transactions found matching your criteria</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onPress={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                            setSelectedType("ALL");
                          }}
                        >
                          Clear Filters
                        </Button>
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
                              <p className="text-[11px] text-default-400 sm:hidden">{tx.category}</p>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="py-2 px-3.5 hidden sm:table-cell">
                          <Chip size="sm" variant="soft" className="text-[11px] h-5">
                            {tx.category}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell className="py-2 px-3.5 hidden md:table-cell">
                          <span className="text-default-400 text-xs">{tx.date}</span>
                        </Table.Cell>
                        <Table.Cell className="py-2 px-3.5 text-right">
                          <span
                            className={`font-semibold text-xs sm:text-sm ${
                              tx.type?.toLowerCase() === "income" ? "text-success" : "text-danger"
                            }`}
                          >
                            {tx.type?.toLowerCase() === "income" ? "+" : "-"}Rp {(Number(tx.amount) / 1000000).toFixed(1)}M
                          </span>
                        </Table.Cell>
                        <Table.Cell className="py-2 px-3.5 hidden sm:table-cell">
                          <Chip size="sm" color="success" variant="soft" className="text-[11px] h-5">
                            Completed
                          </Chip>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Content>
              </Table.ScrollContainer>
            </Table>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
