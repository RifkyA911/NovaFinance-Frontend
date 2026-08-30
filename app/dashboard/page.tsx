"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Chip,
  Input,
  Avatar,
} from "@heroui/react";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  PieChart,
  Settings,
  Plus,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  CreditCard,
  PiggyBank,
  Target,
  Calendar,
  Filter,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { api, Transaction, TransactionWithIcon } from "../lib/api";
import { useTheme } from "next-themes";

const portfolioData = [
  { name: "Stocks", value: 45000000, color: "#3b82f6" },
  { name: "Crypto", value: 25000000, color: "#8b5cf6" },
  { name: "Bonds", value: 15000000, color: "#10b981" },
  { name: "Cash", value: 35000000, color: "#f59e0b" },
];

const monthlyData = [
  { month: "Jan", income: 12000000, expense: 8000000 },
  { month: "Feb", income: 15000000, expense: 9500000 },
  { month: "Mar", income: 13000000, expense: 7500000 },
  { month: "Apr", income: 18000000, expense: 11000000 },
  { month: "May", income: 16000000, expense: 9000000 },
  { month: "Jun", income: 20000000, expense: 12000000 },
  { month: "Jul", income: 20000000, expense: 8500000 },
];

const spendingCategories = [
  { name: "Food", value: 3500000, percentage: 35 },
  { name: "Transport", value: 2000000, percentage: 20 },
  { name: "Utilities", value: 1500000, percentage: 15 },
  { name: "Entertainment", value: 1200000, percentage: 12 },
  { name: "Shopping", value: 1000000, percentage: 10 },
  { name: "Others", value: 800000, percentage: 8 },
];

export default function Dashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [transactions, setTransactions] = useState<TransactionWithIcon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.getTransactions();
        const transactionsWithIcons: TransactionWithIcon[] = data.transactions.map(tx => ({
          ...tx,
          icon: tx.type === "INCOME" ? <Wallet className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />
        }));
        setTransactions(transactionsWithIcons);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        // Fallback to mock data if API fails
        setTransactions([
          {
            id: "1",
            description: "Salary Payment",
            amount: 15000000,
            type: "INCOME",
            date: "2026-07-15",
            category: "Salary",
            icon: <Wallet className="w-4 h-4" />,
          },
          {
            id: "2",
            description: "Freelance Project",
            amount: 5000000,
            type: "INCOME",
            date: "2026-07-14",
            category: "Side Income",
            icon: <TrendingUp className="w-4 h-4" />,
          },
          {
            id: "3",
            description: "Grocery Shopping",
            amount: 850000,
            type: "EXPENSE",
            date: "2026-07-13",
            category: "Food",
            icon: <CreditCard className="w-4 h-4" />,
          },
          {
            id: "4",
            description: "Electricity Bill",
            amount: 450000,
            type: "EXPENSE",
            date: "2026-07-12",
            category: "Utilities",
            icon: <CreditCard className="w-4 h-4" />,
          },
          {
            id: "5",
            description: "Investment Deposit",
            amount: 2000000,
            type: "EXPENSE",
            date: "2026-07-11",
            category: "Investment",
            icon: <PiggyBank className="w-4 h-4" />,
          },
          {
            id: "6",
            description: "Restaurant",
            amount: 350000,
            type: "EXPENSE",
            date: "2026-07-10",
            category: "Food",
            icon: <CreditCard className="w-4 h-4" />,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalBalance = 120000000;
  const monthlyIncome = 20000000;
  const monthlyExpense = 8500000;
  const savingsRate = ((monthlyIncome - monthlyExpense) / monthlyIncome * 100).toFixed(1);

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
              <a href="/dashboard" className="text-foreground font-medium">Overview</a>
              <a href="/transactions" className="text-default-500 hover:text-foreground">Transactions</a>
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
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-default-500 mt-1">Welcome back! Here's your financial overview.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Balance</p>
                <p className="text-2xl font-bold mt-1">Rp 120M</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Monthly Income</p>
                <p className="text-2xl font-bold mt-1">Rp 20M</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Monthly Expenses</p>
                <p className="text-2xl font-bold mt-1">Rp 8.5M</p>
                <div className="flex items-center gap-1 mt-2 text-danger text-sm">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>-3.1%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Savings Rate</p>
                <p className="text-2xl font-bold mt-1">{savingsRate}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${savingsRate}%` }}></div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income vs Expense Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Income vs Expenses</h3>
                <p className="text-sm text-default-500">Monthly comparison</p>
              </div>
              <Button size="sm" variant="ghost">
                This Year
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.5} fontSize={12} />
                <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--heroui-background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                  formatter={(value: any) => `Rp ${(value / 1000000).toFixed(1)}M`}
                />
                <Legend />
                <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Portfolio Distribution */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Portfolio Distribution</h3>
                <p className="text-sm text-default-500">Asset allocation</p>
              </div>
              <Button size="sm" variant="ghost">
                View Details
              </Button>
            </div>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {portfolioData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">Rp {(item.value / 1000000).toFixed(0)}M</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Recent Transactions</h3>
                <p className="text-sm text-default-500">Your latest financial activities</p>
              </div>
              <Button size="sm" variant="ghost">
                View All
              </Button>
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
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-default-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === "INCOME" ? "bg-green-500/10" : "bg-red-500/10"}`}>
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
                    <td className={`py-3 px-4 text-right font-semibold ${txn.type === "INCOME" ? "text-success" : "text-danger"}`}>
                      {txn.type === "INCOME" ? "+" : "-"}Rp {(txn.amount / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Chip size="sm" color="success" variant="soft">
                        Completed
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Spending Categories */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Spending by Category</h3>
              <p className="text-sm text-default-500">This month's breakdown</p>
            </div>
          </div>
          <div className="space-y-4">
            {spendingCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-default-500">Rp {(category.value / 1000000).toFixed(1)}M ({category.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Plus className="w-6 h-6" />
            <span className="text-sm">Add Income</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <CreditCard className="w-6 h-6" />
            <span className="text-sm">Add Expense</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Target className="w-6 h-6" />
            <span className="text-sm">Set Goal</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <PieChart className="w-6 h-6" />
            <span className="text-sm">View Reports</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
