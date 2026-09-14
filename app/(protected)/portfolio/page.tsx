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
  PieChart,
  Target,
  LineChart,
  Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const portfolioData = [
  { name: "Stocks", value: 45000000, color: "#3b82f6", allocation: 45, change: 12.5 },
  { name: "Crypto", value: 25000000, color: "#8b5cf6", allocation: 25, change: 8.3 },
  { name: "Bonds", value: 15000000, color: "#10b981", allocation: 15, change: 3.2 },
  { name: "Cash", value: 35000000, color: "#f59e0b", allocation: 35, change: 0.5 },
];

const performanceData = [
  { month: "Jan", value: 95000000 },
  { month: "Feb", value: 98000000 },
  { month: "Mar", value: 102000000 },
  { month: "Apr", value: 108000000 },
  { month: "May", value: 115000000 },
  { month: "Jun", value: 120000000 },
];

const assets = [
  {
    id: "1",
    name: "BBCA",
    symbol: "BBCA.JK",
    type: "Stock",
    shares: 1000,
    avgPrice: 8500,
    currentPrice: 9200,
    value: 9200000,
    change: 8.2,
    color: "#3b82f6",
  },
  {
    id: "2",
    name: "Bitcoin",
    symbol: "BTC",
    type: "Crypto",
    shares: 0.5,
    avgPrice: 450000000,
    currentPrice: 520000000,
    value: 260000000,
    change: 15.6,
    color: "#f59e0b",
  },
  {
    id: "3",
    name: "SBN",
    symbol: "SBN018",
    type: "Bond",
    shares: 100,
    avgPrice: 980000,
    currentPrice: 1020000,
    value: 102000000,
    change: 4.1,
    color: "#10b981",
  },
  {
    id: "4",
    name: "GOTO",
    symbol: "GOTO.JK",
    type: "Stock",
    shares: 5000,
    avgPrice: 86,
    currentPrice: 78,
    value: 390000,
    change: -9.3,
    color: "#ef4444",
  },
];

export default function Portfolio() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalChange = portfolioData.reduce((sum, item) => sum + item.change, 0) / portfolioData.length;

  return (
    <div className="min-h-screen bg-background p-3.5 sm:p-5 md:p-6 text-foreground">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Portfolio</h1>
            <p className="text-xs sm:text-sm text-default-500 mt-0.5">Track your investments and asset allocation</p>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Value</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">Rp {(totalValue / 1000000).toFixed(0)}M</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                <Wallet className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Total Assets</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">{assets.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                <PieChart className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-default-500">Avg Return</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">+{totalChange.toFixed(1)}%</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
            </div>
          </Card>

          <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1 w-full mr-2">
                <p className="text-xs font-medium text-default-500">Target Goal</p>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-orange-600 dark:text-orange-400">Rp 500M</p>
                <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5 mt-2">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${(totalValue / 500000000) * 100}%` }}></div>
                </div>
              </div>
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                <Target className="w-4.5 h-4.5" />
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
              selectedTab === "assets"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-default-500 hover:text-foreground"
            }`}
            onClick={() => setSelectedTab("assets")}
          >
            Assets
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="space-y-4">
            {/* Performance Chart */}
            <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Portfolio Performance</h3>
                  <p className="text-xs text-default-500">Value over time</p>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs">
                  <LineChart className="w-3.5 h-3.5 mr-1.5" />
                  6 Months
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <RechartsLineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                  <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.4} fontSize={11} />
                  <YAxis stroke="currentColor" strokeOpacity={0.4} fontSize={11} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background, #18181b)", border: "1px solid var(--default-200, #3f3f46)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: unknown) => `Rp ${(Number(value || 0) / 1000000).toFixed(1)}M`}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </Card>

            {/* Allocation Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              <Card className="p-3.5 sm:p-4 rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Asset Allocation</h3>
                    <p className="text-xs text-default-500">Distribution by type</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {portfolioData.map((entry, index) => (
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
                    <h3 className="text-sm font-semibold text-foreground">Allocation Breakdown</h3>
                    <p className="text-xs text-default-500">Target vs Actual</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {portfolioData.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="font-medium text-foreground">{item.name}</span>
                        </div>
                        <span className="text-default-500">Rp {(item.value / 1000000).toFixed(1)}M ({item.allocation}%)</span>
                      </div>
                      <div className="w-full bg-default-100 dark:bg-default-800 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${item.allocation}%`,
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

        {selectedTab === "assets" && (
          <Card className="rounded-xl border border-default-200/80 dark:border-default-800 shadow-2xs overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-default-100 dark:border-default-800">
              <h3 className="text-sm font-semibold text-foreground">All Assets</h3>
              <p className="text-xs text-default-500">{assets.length} assets in portfolio</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-default-100 dark:border-default-800 bg-default-50/50 dark:bg-default-900/30">
                    <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Asset</th>
                    <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Type</th>
                    <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Shares/Units</th>
                    <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Avg Price</th>
                    <th className="text-left py-2.5 px-3.5 font-semibold text-default-500">Current Price</th>
                    <th className="text-right py-2.5 px-3.5 font-semibold text-default-500">Value</th>
                    <th className="text-right py-2.5 px-3.5 font-semibold text-default-500">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.id} className="border-b border-default-100 dark:border-default-800 hover:bg-default-50/50 dark:hover:bg-default-800/40">
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${asset.color}20` }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: asset.color }} />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{asset.name}</p>
                            <p className="text-[10px] text-default-400">{asset.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-3.5">
                        <Chip size="sm" variant="soft" className="text-[11px] h-5">
                          {asset.type}
                        </Chip>
                      </td>
                      <td className="py-2 px-3.5 text-default-600 dark:text-default-400">{asset.shares}</td>
                      <td className="py-2 px-3.5 text-default-600 dark:text-default-400">Rp {(asset.avgPrice / 1000).toFixed(0)}K</td>
                      <td className="py-2 px-3.5 text-default-600 dark:text-default-400">Rp {(asset.currentPrice / 1000).toFixed(0)}K</td>
                      <td className="py-2 px-3.5 text-right font-medium text-foreground">
                        Rp {(asset.value / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-2 px-3.5 text-right">
                        <Chip
                          size="sm"
                          color={asset.change >= 0 ? "success" : "danger"}
                          variant="soft"
                          className="text-[11px] h-5"
                        >
                          {asset.change >= 0 ? "+" : ""}{asset.change}%
                        </Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
