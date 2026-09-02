"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Chip,
} from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Download,
  LogOut,
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
  const { logout, isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const totalIncome = monthlyIncomeData.reduce((sum, m) => sum + m.salary + m.freelance + m.investment, 0);
  const totalExpense = monthlyExpenseData.reduce((sum, m) => sum + m.food + m.transport + m.utilities + m.entertainment, 0);
  const avgSavings = savingsTrend.reduce((sum, s) => sum + s.savings, 0) / savingsTrend.length;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-default-500 mt-1">Detailed financial insights and reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Date Range
            </Button>
            <Button className="bg-linear-to-r from-blue-500 to-purple-600 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Income (YTD)</p>
                <p className="text-2xl font-bold mt-1 text-success">Rp {(totalIncome / 1000000).toFixed(0)}M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Expenses (YTD)</p>
                <p className="text-2xl font-bold mt-1 text-danger">Rp {(totalExpense / 1000000).toFixed(0)}M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Average Savings</p>
                <p className="text-2xl font-bold mt-1">Rp {(avgSavings / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Savings Rate</p>
                <p className="text-2xl font-bold mt-1">{((avgSavings / (totalIncome / 6)) * 100).toFixed(0)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((avgSavings / (totalIncome / 6)) * 100)}%` }}></div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          <button
            className={`pb-2 px-4 ${selectedTab === "overview" ? "border-b-2 border-blue-500 text-blue-500" : "text-default-500"}`}
            onClick={() => setSelectedTab("overview")}
          >
            Overview
          </button>
          <button
            className={`pb-2 px-4 ${selectedTab === "categories" ? "border-b-2 border-blue-500 text-blue-500" : "text-default-500"}`}
            onClick={() => setSelectedTab("categories")}
          >
            Categories
          </button>
          <button
            className={`pb-2 px-4 ${selectedTab === "trends" ? "border-b-2 border-blue-500 text-blue-500" : "text-default-500"}`}
            onClick={() => setSelectedTab("trends")}
          >
            Trends
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="space-y-6 mt-6">
            {/* Income Breakdown */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Income Breakdown</h3>
                  <p className="text-sm text-default-500">Monthly income by source</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyIncomeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                  <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    formatter={(value: any) => `Rp ${(value / 1000000).toFixed(1)}M`}
                  />
                  <Legend />
                  <Bar dataKey="salary" fill="#3b82f6" name="Salary" />
                  <Bar dataKey="freelance" fill="#8b5cf6" name="Freelance" />
                  <Bar dataKey="investment" fill="#10b981" name="Investment" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Expense Breakdown */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Expense Breakdown</h3>
                  <p className="text-sm text-default-500">Monthly expenses by category</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyExpenseData}>
                  <defs>
                    <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTransport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
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
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Expense Distribution</h3>
                    <p className="text-sm text-default-500">By category</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Category Breakdown</h3>
                    <p className="text-sm text-default-500">Detailed view</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {categoryData.map((item) => (
                    <div key={item.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-sm text-default-500">Rp {(item.value / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(item.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100}%` }}
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
          <div className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Savings Trend</h3>
                  <p className="text-sm text-default-500">Monthly savings over time</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={savingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                  <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.5} fontSize={12} />
                  <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    formatter={(value: any) => `Rp ${(value / 1000000).toFixed(1)}M`}
                  />
                  <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Top Expenses</h3>
                  <p className="text-sm text-default-500">Highest transactions this year</p>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {topExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-default-100">
                      <td className="py-3 px-4 font-medium">{expense.description}</td>
                      <td className="py-3 px-4">
                        <Chip size="sm" variant="soft">
                          {expense.category}
                        </Chip>
                      </td>
                      <td className="py-3 px-4 text-default-500">{expense.date}</td>
                      <td className="py-3 px-4 text-right font-semibold text-danger">
                        -Rp {(expense.amount / 1000000).toFixed(0)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
