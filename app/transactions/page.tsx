"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Chip,
  Input,
} from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Filter,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const transactions = [
  {
    id: "1",
    description: "Salary Payment",
    amount: 15000000,
    type: "income",
    date: "2026-07-15",
    category: "Salary",
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    id: "2",
    description: "Freelance Project",
    amount: 5000000,
    type: "income",
    date: "2026-07-14",
    category: "Side Income",
    icon: <TrendingUp className="w-4 h-4" />,
  },
  {
    id: "3",
    description: "Grocery Shopping",
    amount: 850000,
    type: "expense",
    date: "2026-07-13",
    category: "Food",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: "4",
    description: "Electricity Bill",
    amount: 450000,
    type: "expense",
    date: "2026-07-12",
    category: "Utilities",
    icon: <CreditCard className="w-4 h-4" />,
  },
  {
    id: "5",
    description: "Investment Deposit",
    amount: 2000000,
    type: "expense",
    date: "2026-07-11",
    category: "Investment",
    icon: <PiggyBank className="w-4 h-4" />,
  },
  {
    id: "6",
    description: "Restaurant",
    amount: 350000,
    type: "expense",
    date: "2026-07-10",
    category: "Food",
    icon: <CreditCard className="w-4 h-4" />,
  },
];

const categories = [
  "All",
  "Salary",
  "Food",
  "Utilities",
  "Transport",
  "Entertainment",
  "Investment",
];

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = txn.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || txn.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl">NovaJournal</span>
            </div>
            <div className="flex gap-4">
              <a href="/dashboard" className="text-default-500 hover:text-foreground">Overview</a>
              <a href="/transactions" className="text-foreground font-medium">Transactions</a>
              <a href="/portfolio" className="text-default-500 hover:text-foreground">Portfolio</a>
              <a href="/analytics" className="text-default-500 hover:text-foreground">Analytics</a>
              <a href="/settings" className="text-default-500 hover:text-foreground">Settings</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-default-500 mt-1">Manage your income and expenses</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-linear-to-r from-blue-500 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Income</p>
                <p className="text-2xl font-bold mt-1 text-success">Rp {(totalIncome / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Expenses</p>
                <p className="text-2xl font-bold mt-1 text-danger">Rp {(totalExpense / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Net Balance</p>
                <p className="text-2xl font-bold mt-1">Rp {((totalIncome - totalExpense) / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "primary" : "outline"}
                  onPress={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">All Transactions</h3>
                <p className="text-sm text-default-500">{filteredTransactions.length} transactions found</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Transaction</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-right py-3 px-4">Amount</th>
                  <th className="text-right py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-default-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                          {txn.icon}
                        </div>
                        <div>
                          <p className="font-medium">{txn.description}</p>
                          <p className="text-sm text-default-500">{txn.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Chip size="sm" variant="soft">
                        {txn.category}
                      </Chip>
                    </td>
                    <td className="py-3 px-4 text-default-500">{txn.date}</td>
                    <td className={`py-3 px-4 text-right font-semibold ${txn.type === "income" ? "text-success" : "text-danger"}`}>
                      {txn.type === "income" ? "+" : "-"}Rp {(txn.amount / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Chip size="sm" color="success" variant="soft">
                        Completed
                      </Chip>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button size="sm" variant="ghost">Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
