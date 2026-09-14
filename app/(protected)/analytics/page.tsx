"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Chip,
} from "@heroui/react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const monthlyIncomeData = [
  { month: "Jan", salary: 12000000, freelance: 2000000, investment: 500000 },
  { month: "Feb", salary: 12000000, freelance: 3000000, investment: 500000 },
  { month: "Mar", salary: 12000000, freelance: 1000000, investment: 500000 },
  { month: "Apr", salary: 13000000, freelance: 5000000, investment: 1000000 },
  { month: "May", salary: 13000000, freelance: 3000000, investment: 500000 },
  { month: "Jun", salary: 15000000, freelance: 5000000, investment: 1000000 },
];

const monthlyExpenseData = [
  { month: "Jan", food: 3000000, transport: 1500000, utilities: 800000, entertainment: 500000 },
  { month: "Feb", food: 3500000, transport: 1800000, utilities: 900000, entertainment: 700000 },
  { month: "Mar", food: 2800000, transport: 1200000, utilities: 750000, entertainment: 400000 },
  { month: "Apr", food: 4000000, transport: 2000000, utilities: 1000000, entertainment: 800000 },
  { month: "May", food: 3200000, transport: 1600000, utilities: 850000, entertainment: 600000 },
  { month: "Jun", food: 3800000, transport: 1900000, utilities: 950000, entertainment: 750000 },
];

const categoryData = [
  { name: "Food", value: 3500000, color: "#3b82f6" },
  { name: "Transport", value: 2000000, color: "#8b5cf6" },
  { name: "Utilities", value: 1500000, color: "#10b981" },
  { name: "Entertainment", value: 1200000, color: "#f59e0b" },
  { name: "Shopping", value: 1000000, color: "#ef4444" },
  { name: "Others", value: 800000, color: "#6b7280" },
];

const savingsTrend = [
  { month: "Jan", savings: 5000000 },
  { month: "Feb", savings: 5500000 },
  { month: "Mar", savings: 4800000 },
  { month: "Apr", savings: 6000000 },
  { month: "May", savings: 5800000 },
  { month: "Jun", savings: 7000000 },
];

const topExpenses = [
  { id: "1", description: "Rent Payment", category: "Housing", date: "2026-06-01", amount: 5000000 },
  { id: "2", description: "Car Purchase", category: "Transport", date: "2026-05-15", amount: 150000000 },
  { id: "3", description: "Vacation Trip", category: "Travel", date: "2026-04-20", amount: 25000000 },
  { id: "4", description: "Medical Checkup", category: "Healthcare", date: "2026-03-10", amount: 3000000 },
  { id: "5", description: "Home Renovation", category: "Housing", date: "2026-02-25", amount: 45000000 },
];

export default function Analytics() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const totalIncome = monthlyIncomeData.reduce((sum, m) => sum + m.salary + m.freelance + m.investment, 0);
  const totalExpense = monthlyExpenseData.reduce((sum, m) => sum + m.food + m.transport + m.utilities + m.entertainment, 0);
  const avgSavings = savingsTrend.reduce((sum, s) => sum + s.savings, 0) / savingsTrend.length;

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">Detailed financial insights and reports</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-xs cursor-pointer"
              onPress={() => router.push("/transactions/new")}
            >
              <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />
              New Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Income (YTD)</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">Rp {(totalIncome / 1000000).toFixed(0)}M</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                <ArrowUpRight className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Expenses (YTD)</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">Rp {(totalExpense / 1000000).toFixed(0)}M</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                <ArrowDownRight className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Average Savings</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">Rp {(avgSavings / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full mr-2">
                <p className="text-xs font-medium text-default-500">Savings Rate</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">{((avgSavings / (totalIncome / 6)) * 100).toFixed(0)}%</p>
                <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 mt-2">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${((avgSavings / (totalIncome / 6)) * 100)}%` }}></div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <PieChart className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-default-200 dark:border-default-800">
          <button
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              selectedTab === "overview"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-default-500 hover:text-foreground"
            }`}
            onClick={() => setSelectedTab("overview")}
          >
            Overview
          </button>
          <button
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              selectedTab === "categories"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-default-500 hover:text-foreground"
            }`}
            onClick={() => setSelectedTab("categories")}
          >
            Categories
          </button>
          <button
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              selectedTab === "trends"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-default-500 hover:text-foreground"
            }`}
            onClick={() => setSelectedTab("trends")}
          >
            Trends
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="space-y-4">
            {/* Income Breakdown */}
            <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Income Breakdown</h3>
                  <p className="text-xs text-default-500">Monthly income by source</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                  <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.4} fontSize={11} />
                  <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background, #18181b)", border: "1px solid var(--default-200, #3f3f46)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => `Rp ${(Number(value || 0) / 1000000).toFixed(1)}M`}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="salary" fill="#3b82f6" name="Salary" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="freelance" fill="#8b5cf6" name="Freelance" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="investment" fill="#10b981" name="Investment" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Expense Breakdown */}
            <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Expense Breakdown</h3>
                  <p className="text-xs text-default-500">Monthly expenses by category</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <AreaChart data={monthlyExpenseData}>
                  <defs>
                    <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                  <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.4} fontSize={11} />
                  <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background, #18181b)", border: "1px solid var(--default-200, #3f3f46)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => `Rp ${(Number(value || 0) / 1000000).toFixed(1)}M`}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area type="monotone" dataKey="food" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorFood)" />
                  <Area type="monotone" dataKey="transport" stackId="1" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTransport)" />
                  <Area type="monotone" dataKey="utilities" stackId="1" stroke="#10b981" fillOpacity={0.6} fill="#10b981" />
                  <Area type="monotone" dataKey="entertainment" stackId="1" stroke="#f59e0b" fillOpacity={0.6} fill="#f59e0b" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {selectedTab === "categories" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Expense Distribution</h3>
                    <p className="text-xs text-default-500">By category</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown) => `Rp ${(Number(value || 0) / 1000000).toFixed(1)}M`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Category Breakdown</h3>
                    <p className="text-xs text-default-500">Detailed view</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {categoryData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                        <span className="text-default-500">Rp {(item.value / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${(item.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {selectedTab === "trends" && (
          <div className="space-y-4">
            <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Savings Trend</h3>
                  <p className="text-xs text-default-500">Monthly savings over time</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <RechartsLineChart data={savingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                  <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.4} fontSize={11} />
                  <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background, #18181b)", border: "1px solid var(--default-200, #3f3f46)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => `Rp ${(Number(value || 0) / 1000000).toFixed(1)}M`}
                  />
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs overflow-hidden">
              <div className="p-3.5 sm:p-4 border-b border-default-100 dark:border-default-800">
                <h3 className="text-sm font-semibold text-foreground">Top Expenses</h3>
                <p className="text-xs text-default-500">Highest transactions this year</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-default-100 dark:border-default-800 bg-default-50/50 dark:bg-default-900/30">
                      <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Description</th>
                      <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Category</th>
                      <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Date</th>
                      <th className="text-right py-2.5 px-3.5 font-semibold text-default-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topExpenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-default-100 dark:border-default-800 hover:bg-default-50/50 dark:hover:bg-default-800/40">
                        <td className="py-2 px-3.5 font-medium text-foreground">{expense.description}</td>
                        <td className="py-2 px-3.5">
                          <Chip size="sm" variant="soft" className="text-[11px] h-5">
                            {expense.category}
                          </Chip>
                        </td>
                        <td className="py-2 px-3.5 text-default-400">{expense.date}</td>
                        <td className="py-2 px-3.5 text-right font-semibold text-danger">
                          -Rp {(expense.amount / 1000000).toFixed(0)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
