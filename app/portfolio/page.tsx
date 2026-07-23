"use client";

import { useState } from "react";
import {
  Card,
  Button,
  Chip,
  Table,
  Input,
  Avatar,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  Wallet,
  TrendingUp,
  Plus,
  Search,
  Bell,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  PieChart,
  BarChart3,
  LineChart,
  Target,
  Percent,
  DollarSign,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

const portfolioData = [
  { name: "Stocks", value: 45000000, color: "#3b82f6", change: 12.5, allocation: 45 },
  { name: "Crypto", value: 25000000, color: "#8b5cf6", change: -3.2, allocation: 25 },
  { name: "Bonds", value: 15000000, color: "#10b981", change: 5.8, allocation: 15 },
  { name: "Cash", value: 35000000, color: "#f59e0b", change: 0.0, allocation: 35 },
  { name: "Real Estate", value: 80000000, color: "#ef4444", change: 8.1, allocation: 80 },
];

const assets = [
  {
    id: 1,
    name: "Apple Inc.",
    symbol: "AAPL",
    type: "Stock",
    value: 15000000,
    shares: 50,
    avgPrice: 280000,
    currentPrice: 300000,
    change: 7.14,
    color: "#3b82f6",
  },
  {
    id: 2,
    name: "Bitcoin",
    symbol: "BTC",
    type: "Crypto",
    value: 25000000,
    shares: 0.5,
    avgPrice: 45000000,
    currentPrice: 50000000,
    change: -3.2,
    color: "#8b5cf6",
  },
  {
    id: 3,
    name: "Government Bonds",
    symbol: "GOV",
    type: "Bond",
    value: 15000000,
    shares: 150,
    avgPrice: 95000,
    currentPrice: 100000,
    change: 5.26,
    color: "#10b981",
  },
  {
    id: 4,
    name: "Cash Savings",
    symbol: "CASH",
    type: "Cash",
    value: 35000000,
    shares: 1,
    avgPrice: 35000000,
    currentPrice: 35000000,
    change: 0.0,
    color: "#f59e0b",
  },
];

const performanceData = [
  { month: "Jan", value: 95000000 },
  { month: "Feb", value: 98000000 },
  { month: "Mar", value: 102000000 },
  { month: "Apr", value: 98000000 },
  { month: "May", value: 105000000 },
  { month: "Jun", value: 110000000 },
  { month: "Jul", value: 115000000 },
];

const allocationData = [
  { name: "Stocks", value: 45 },
  { name: "Crypto", value: 25 },
  { name: "Bonds", value: 15 },
  { name: "Cash", value: 35 },
  { name: "Real Estate", value: 80 },
];

export default function Portfolio() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalChange = portfolioData.reduce((sum, item) => sum + item.change, 0) / portfolioData.length;

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
              <a href="/transactions" className="text-default-500 hover:text-foreground">Transactions</a>
              <a href="/portfolio" className="text-foreground font-medium">Portfolio</a>
              <a href="/analytics" className="text-default-500 hover:text-foreground">Analytics</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-default-500 mt-1">Track your investments and asset allocation</p>
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
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+{totalChange.toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Total Assets</p>
                <p className="text-2xl font-bold mt-1">{assets.length}</p>
                <p className="text-sm text-default-500 mt-2">Active positions</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-default-500">Best Performer</p>
                <p className="text-2xl font-bold mt-1">AAPL</p>
                <div className="flex items-center gap-1 mt-2 text-success text-sm">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>+7.14%</span>
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
                <p className="text-sm text-default-500">Target Allocation</p>
                <p className="text-2xl font-bold mt-1">85%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)}>
          <Tab key="overview" title="Overview">
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
                      formatter={(value: any) => `Rp ${(value / 1000000).toFixed(1)}M`}
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
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-default-500">Rp {(item.value / 1000000).toFixed(0)}M</span>
                            <Chip
                              size="sm"
                              color={item.change >= 0 ? "success" : "danger"}
                              variant="soft"
                            >
                              {item.change >= 0 ? "+" : ""}{item.change}%
                            </Chip>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.allocation}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </Tab>

          <Tab key="assets" title="Assets">
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
                  <Table aria-label="Assets table">
                    <Table.Content>
                      <Table.Header>
                        <Table.Column id="asset">Asset</Table.Column>
                        <Table.Column id="type">Type</Table.Column>
                        <Table.Column id="shares">Shares/Units</Table.Column>
                        <Table.Column id="avgPrice">Avg Price</Table.Column>
                        <Table.Column id="currentPrice">Current Price</Table.Column>
                        <Table.Column id="value" className="text-right">Value</Table.Column>
                        <Table.Column id="change" className="text-right">Change</Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {assets.map((asset) => (
                          <Table.Row key={asset.id} id={asset.id}>
                            <Table.Cell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${asset.color}20` }}>
                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: asset.color }} />
                                </div>
                                <div>
                                  <p className="font-medium">{asset.name}</p>
                                  <p className="text-sm text-default-500">{asset.symbol}</p>
                                </div>
                              </div>
                            </Table.Cell>
                            <Table.Cell>
                              <Chip size="sm" variant="flat">
                                {asset.type}
                              </Chip>
                            </Table.Cell>
                            <Table.Cell>{asset.shares}</Table.Cell>
                            <Table.Cell>Rp {(asset.avgPrice / 1000).toFixed(0)}K</Table.Cell>
                            <Table.Cell>Rp {(asset.currentPrice / 1000).toFixed(0)}K</Table.Cell>
                            <Table.Cell className="text-right font-medium">
                              Rp {(asset.value / 1000000).toFixed(1)}M
                            </Table.Cell>
                            <Table.Cell className="text-right">
                              <Chip
                                size="sm"
                                color={asset.change >= 0 ? "success" : "danger"}
                                variant="soft"
                              >
                                {asset.change >= 0 ? "+" : ""}{asset.change}%
                              </Chip>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table>
                </div>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
