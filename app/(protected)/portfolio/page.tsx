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
  Filter,
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
    <div className="min-h-screen bg-background p-6">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-default-500 mt-1">Track your investments and assets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-linear-to-r from-blue-500 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Value</p>
                <p className="text-2xl font-bold mt-1">Rp {(totalValue / 1000000).toFixed(0)}M</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Assets</p>
                <p className="text-2xl font-bold mt-1">{assets.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Avg Return</p>
                <p className="text-2xl font-bold mt-1 text-success">{totalChange.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Target Goal</p>
                <p className="text-2xl font-bold mt-1">Rp 500M</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(totalValue / 500000000) * 100}%` }}></div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
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
            className={`pb-2 px-4 ${selectedTab === "assets" ? "border-b-2 border-blue-500 text-blue-500" : "text-default-500"}`}
            onClick={() => setSelectedTab("assets")}
          >
            Assets
          </button>
        </div>

        {/* Tab Content */}
        {selectedTab === "overview" && (
          <div className="space-y-6 mt-6">
              {/* Performance Chart */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Portfolio Performance</h3>
                    <p className="text-sm text-default-500">Value over time</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <LineChart className="w-4 h-4 mr-2" />
                    7 Days
                  </Button>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                    <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.5} fontSize={12} />
                    <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--heroui-background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                      formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
                    />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </Card>

              {/* Allocation Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Asset Allocation</h3>
                      <p className="text-sm text-default-500">Distribution by type</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
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
                      <Tooltip formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Allocation Breakdown</h3>
                      <p className="text-sm text-default-500">Target vs Actual</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {portfolioData.map((item) => (
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
                            style={{ width: `${(item.value / portfolioData.reduce((sum, cat) => sum + cat.value, 0)) * 100}%` }}
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
            <div className="mt-6">
              <Card>
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">All Assets</h3>
                      <p className="text-sm text-default-500">{assets.length} assets in portfolio</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Asset</th>
                        <th className="text-left py-3 px-4">Type</th>
                        <th className="text-left py-3 px-4">Shares/Units</th>
                        <th className="text-left py-3 px-4">Avg Price</th>
                        <th className="text-left py-3 px-4">Current Price</th>
                        <th className="text-right py-3 px-4">Value</th>
                        <th className="text-right py-3 px-4">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset) => (
                        <tr key={asset.id} className="border-b hover:bg-default-100">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${asset.color}20` }}>
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: asset.color }} />
                              </div>
                              <div>
                                <p className="font-medium">{asset.name}</p>
                                <p className="text-sm text-default-500">{asset.symbol}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Chip size="sm" variant="soft">
                              {asset.type}
                            </Chip>
                          </td>
                          <td className="py-3 px-4">{asset.shares}</td>
                          <td className="py-3 px-4">Rp {(asset.avgPrice / 1000).toFixed(0)}K</td>
                          <td className="py-3 px-4">Rp {(asset.currentPrice / 1000).toFixed(0)}K</td>
                          <td className="py-3 px-4 text-right font-medium">
                            Rp {(asset.value / 1000000).toFixed(1)}M
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Chip
                              size="sm"
                              color={asset.change >= 0 ? "success" : "danger"}
                              variant="soft"
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
            </div>
          )}
      </div>
    </div>
  );
}
