"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Chip,
  Avatar,
  Input,
  Modal,
  Select,
} from "@heroui/react";
import { DocumentUpload } from "../components/DocumentUpload";
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
  LogOut,
  Download,
  FileSpreadsheet,
  FileText,
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
import { api, Transaction, TransactionWithIcon } from "../../lib/api";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import { useForm } from "@tanstack/react-form";

export default function Dashboard() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { selectedWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'addTransaction' | 'filter' | 'addIncome' | 'addExpense'>('addTransaction');
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // TanStack Form for Add Transaction
  const form = useForm({
    defaultValues: {
      description: '',
      amount: '',
      type: 'expense' as 'INCOME' | 'EXPENSE',
      categoryId: '',
      accountId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
    onSubmit: async ({ value }) => {
      if (!selectedWorkspace) return;
      const transaction = {
        description: value.description,
        amount: Number(value.amount),
        type: modalType === 'addIncome' ? 'INCOME' : 'EXPENSE',
        category: value.categoryId,
        date: value.date,
      };
      await mutationFunctions.createTransaction(transaction);
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(selectedWorkspace.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) });
      setIsModalOpen(false);
      form.reset();
    },
  });

  // Filter state
  const [filterCategory, setFilterCategory] = useState<string[]>([]);
  const [filterTimeRange, setFilterTimeRange] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterEquityMin, setFilterEquityMin] = useState('');
  const [filterEquityMax, setFilterEquityMax] = useState('');
  const [filterInvestedMin, setFilterInvestedMin] = useState('');
  const [filterInvestedMax, setFilterInvestedMax] = useState('');
  const [filterIncomeMin, setFilterIncomeMin] = useState('');
  const [filterIncomeMax, setFilterIncomeMax] = useState('');
  const [filterCurrencies, setFilterCurrencies] = useState<string[]>([]);
  const [filterPlatforms, setFilterPlatforms] = useState<string[]>([]);

  const handleFilterSubmit = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // TanStack Query hooks for dashboard data
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboardSummary(selectedWorkspace?.id || ''),
    queryFn: () => queryFunctions.dashboardSummary(selectedWorkspace?.id || ''),
    enabled: !!selectedWorkspace,
  });

  const trendsQuery = useQuery({
    queryKey: queryKeys.dashboardTrends(selectedWorkspace?.id || '', 6),
    queryFn: () => queryFunctions.dashboardTrends(selectedWorkspace?.id || '', 6),
    enabled: !!selectedWorkspace,
  });

  const categoriesQuery = useQuery({
    queryKey: queryKeys.dashboardCategories(selectedWorkspace?.id || '', 'expense'),
    queryFn: () => queryFunctions.dashboardCategories(selectedWorkspace?.id || '', 'expense'),
    enabled: !!selectedWorkspace,
  });

  const accountsQuery = useQuery({
    queryKey: queryKeys.dashboardAccounts(selectedWorkspace?.id || ''),
    queryFn: () => queryFunctions.dashboardAccounts(selectedWorkspace?.id || ''),
    enabled: !!selectedWorkspace,
  });

  const transactionsQuery = useQuery({
    queryKey: queryKeys.transactions(selectedWorkspace?.id || ''),
    queryFn: () => queryFunctions.transactions(selectedWorkspace?.id || '', 10),
    enabled: !!selectedWorkspace,
  });

  const allCategoriesQuery = useQuery({
    queryKey: queryKeys.categories(selectedWorkspace?.id || ''),
    queryFn: () => queryFunctions.categories(selectedWorkspace?.id || ''),
    enabled: !!selectedWorkspace,
  });

  const loading = summaryQuery.isLoading || trendsQuery.isLoading || categoriesQuery.isLoading || accountsQuery.isLoading || transactionsQuery.isLoading || allCategoriesQuery.isLoading;

  const summary = summaryQuery.data?.data;
  const trends = trendsQuery.data?.data.trends;
  const categories = categoriesQuery.data?.data.categories || [];
  const accounts = accountsQuery.data?.data.accounts || [];
  const allCategories = allCategoriesQuery.data?.data.categories || [];

  const transactions: TransactionWithIcon[] = transactionsQuery.data?.data.transactions?.map((tx: { category: string | { name: string }; type: string; date: string }) => {
    const categoryValue = tx.category;
    let categoryName = 'Uncategorized';
    if (typeof categoryValue === 'string') {
      categoryName = categoryValue;
    } else if (categoryValue && typeof categoryValue === 'object' && categoryValue.name) {
      categoryName = categoryValue.name;
    }
    return {
      ...tx,
      category: categoryName,
      icon: tx.type === "income" ? <Wallet className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />,
      date: new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  }) || [];

  const monthlyData = trends || [];
  const spendingCategories = categories || [];
  const portfolioData = accounts?.map((acc: { name: string; balance: string; type: string }) => ({
    name: acc.name,
    value: parseFloat(acc.balance) || 0,
    color: acc.type === 'bank' ? '#3b82f6' : acc.type === 'ewallet' ? '#10b981' : acc.type === 'cash' ? '#f59e0b' : '#8b5cf6',
  })) || [];

  const totalBalance = summary?.totalBalance || 0;
  const monthlyIncome = summary?.monthlyIncome || 0;
  const monthlyExpense = summary?.monthlyExpense || 0;
  const savingsRate = summary?.savingsRate || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-default-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-default-500">No workspace selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-default-500 mt-1 text-sm md:text-base">Welcome back! Here's your financial overview.</p>
          </div>
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-2 rounded-lg text-sm">
              {apiError}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { setModalType('filter'); setIsModalOpen(true); }}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-linear-to-r from-blue-500 to-purple-600 text-white" size="sm" onClick={() => { setModalType('addTransaction'); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              {isDownloadDropdownOpen && (
                <div className="absolute top-full mt-2 right-0 bg-background border border-default-200 rounded-lg shadow-lg z-50 min-w-40">
                  <button className="w-full text-left px-4 py-3 hover:bg-default-100 text-sm flex items-center gap-2" onClick={() => { console.log('Download Excel'); setIsDownloadDropdownOpen(false); }}>
                    <FileSpreadsheet className="w-4 h-4" />
                    Download Excel
                  </button>
                  <button className="w-full text-left px-4 py-3 hover:bg-default-100 text-sm flex items-center gap-2" onClick={() => { console.log('Download PDF'); setIsDownloadDropdownOpen(false); }}>
                    <FileText className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6 border-2 border-blue-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-default-500 font-medium">Total Balance</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-blue-600">Rp {(totalBalance / 1000000).toFixed(0)}M</p>
                <div className="flex items-center gap-1 mt-3 text-success text-xs md:text-sm font-semibold">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 md:w-7 md:h-7 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-2 border-green-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-default-500 font-medium">Monthly Income</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-green-600">Rp {(monthlyIncome / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-3 text-success text-xs md:text-sm font-semibold">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                  <span>+8.2%</span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-2 border-red-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-default-500 font-medium">Monthly Expenses</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-red-600">Rp {(monthlyExpense / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-3 text-danger text-xs md:text-sm font-semibold">
                  <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />
                  <span>-3.1%</span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-red-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 md:w-7 md:h-7 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-2 border-purple-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-default-500 font-medium">Savings Rate</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-purple-600">{savingsRate}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mt-3">
                  <div className="bg-purple-500 h-2 md:h-3 rounded-full transition-all duration-500" style={{ width: `${savingsRate}%` }}></div>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 md:w-7 md:h-7 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Income vs Expense Chart */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold">Income vs Expenses</h3>
                <p className="text-xs md:text-sm text-default-500">Monthly comparison</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs md:text-sm">
                This Year
              </Button>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
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
                  <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.5} fontSize={10} tick={{ fontSize: 10 }} />
                  <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={10} tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-default-500 text-sm">
                No trend data available
              </div>
            )}
          </Card>

          {/* Portfolio Distribution */}
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h3 className="text-base md:text-lg font-semibold">Portfolio Distribution</h3>
                <p className="text-xs md:text-sm text-default-500">Asset allocation</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs md:text-sm">
                View Details
              </Button>
            </div>
            {portfolioData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    strokeOpacity={0.5}
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value: string) => typeof value === 'string' ? value.slice(0, 8) : value}
                  />
                  <YAxis
                    stroke="currentColor"
                    strokeOpacity={0.5}
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value: number) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--heroui-background)", border: "1px solid var(--border)", borderRadius: "8px" }}
                    formatter={(value: number) => `Rp ${(value / 1000000).toFixed(1)}M`}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {portfolioData.map((entry: { color?: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-75 flex items-center justify-center text-default-500 text-sm">
                No portfolio data available
              </div>
            )}
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <div className="p-4 md:p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-semibold">Recent Transactions</h3>
                <p className="text-xs md:text-sm text-default-500">Your latest financial activities</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs md:text-sm">
                View All
              </Button>
            </div>
          </div>
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-150">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm">Transaction</th>
                    <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm hidden sm:table-cell">Category</th>
                    <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm hidden md:table-cell">Date</th>
                    <th className="text-right py-3 px-2 md:px-4 text-xs md:text-sm">Amount</th>
                    <th className="text-left py-3 px-2 md:px-4 text-xs md:text-sm hidden sm:table-cell">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map((tx: TransactionWithIcon) => (
                      <tr key={tx.id} className="border-b hover:bg-default-100">
                        <td className="py-3 px-2 md:px-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === "INCOME" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                              {tx.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs md:text-sm truncate">{tx.description}</p>
                              <p className="text-xs text-default-500 hidden sm:block">{tx.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 md:px-4 hidden sm:table-cell">
                          <Chip size="sm" variant="soft" className="text-xs">
                            {tx.category}
                          </Chip>
                        </td>
                        <td className="py-3 px-2 md:px-4 hidden md:table-cell">
                          <span className="text-default-500 text-xs md:text-sm">{tx.date}</span>
                        </td>
                        <td className="py-3 px-2 md:px-4 text-right">
                          <span className={`font-semibold text-xs md:text-sm ${tx.type === "INCOME" ? "text-success" : "text-danger"}`}>
                            {tx.type === "INCOME" ? "+" : "-"}Rp {(Number(tx.amount) / 1000000).toFixed(1)}M
                          </span>
                        </td>
                        <td className="py-3 px-2 md:px-4 hidden sm:table-cell">
                          <Chip size="sm" color="success" variant="soft" className="text-xs">
                            Completed
                          </Chip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-default-500 text-sm">
                        No transactions available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Spending Categories */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold">Spending by Category</h3>
              <p className="text-xs md:text-sm text-default-500">This month's breakdown</p>
            </div>
          </div>
          <div className="space-y-3 md:space-y-4">
            {spendingCategories.length > 0 ? spendingCategories.map((category: { id?: string; name: string; value?: string; percentage?: string }, index: number) => {
              const categoryName = typeof category === 'object' && category.name ? category.name : (typeof category === 'string' ? category : `Category ${index}`);
              return (
                <div key={category.id || index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium">{categoryName}</span>
                    <span className="text-xs md:text-sm text-default-500">
                      {category.value ? `Rp ${(Number(category.value) / 1000000).toFixed(1)}M` : ''}
                      {category.percentage ? ` (${category.percentage}%)` : ''}
                    </span>
                  </div>
                  {category.percentage && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                      <div className="bg-blue-500 h-1.5 md:h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <p className="text-default-500 text-xs md:text-sm">No category data available</p>
            )}
          </div>
        </Card>

      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen} size="2xl">
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="max-w-5xl w-full">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  {modalType === 'addTransaction' && 'Add Transaction'}
                  {modalType === 'filter' && 'Filter Transactions'}
                  {modalType === 'addIncome' && 'Add Income'}
                  {modalType === 'addExpense' && 'Add Expense'}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="max-h-[75vh] overflow-y-auto p-6">
                {(modalType === 'addTransaction' || modalType === 'addIncome' || modalType === 'addExpense') && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      form.handleSubmit();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <form.Field
                        name="description"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <div>
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            <Input
                              fullWidth
                              placeholder="Enter description"
                              value={field.state.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                            />
                          </div>
                        )}
                      />
                      <form.Field
                        name="amount"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <div>
                            <label className="text-sm font-medium mb-1 block">Amount</label>
                            <Input
                              fullWidth
                              type="number"
                              placeholder="Enter amount"
                              value={field.state.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                            />
                          </div>
                        )}
                      />
                      <form.Field
                        name="categoryId"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <div>
                            <label className="text-sm font-medium mb-1 block">Category</label>
                            <select
                              className="w-full p-2 pl-3 pr-10 border rounded-lg bg-background"
                              value={field.state.value}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.handleChange(e.target.value)}
                            >
                              <option value="">Select category</option>
                              {allCategories?.map((cat: { id: string; name: string }, index: number) => (
                                <option key={`cat-${cat.id || index}`} value={cat.id}>
                                  {typeof cat.name === 'string' ? cat.name : 'Category'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      />
                      <form.Field
                        name="accountId"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <div>
                            <label className="text-sm font-medium mb-1 block">Account</label>
                            <select
                              className="w-full p-2 pl-3 pr-10 border rounded-lg bg-background"
                              value={field.state.value}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => field.handleChange(e.target.value)}
                            >
                              <option value="">Select account</option>
                              {accounts?.map((acc: { id: string; name: string }, index: number) => (
                                <option key={`acc-${acc.id || index}`} value={acc.id}>
                                  {typeof acc.name === 'string' ? acc.name : 'Account'}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      />
                      <form.Field
                        name="date"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <div>
                            <label className="text-sm font-medium mb-1 block">Date</label>
                            <Input
                              fullWidth
                              type="date"
                              value={field.state.value}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                            />
                          </div>
                        )}
                      />
                    </div>
                    <form.Field
                      name="notes"
                      // eslint-disable-next-line react/no-children-prop
                      children={(field) => (
                        <div>
                          <label className="text-sm font-medium mb-1 block">Notes</label>
                          <textarea
                            className="w-full p-2 border rounded-lg bg-background min-h-25"
                            placeholder="Optional notes"
                            value={field.state.value}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                          />
                        </div>
                      )}
                    />
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium mb-2 block">Attach Documents</label>
                      <DocumentUpload
                        onUpload={(file, type) => console.log('Uploaded:', file, type)}
                        workspaceId={selectedWorkspace?.id || ''}
                      />
                    </div>
                  </form>
                )}
                {modalType === 'filter' && (
                  <div className="space-y-4">
                    {/* Filter by Time */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold mb-3">Time Range</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium mb-1 block">Period</label>
                          <select
                            className="w-full p-2 pl-3 pr-10 border rounded-lg bg-background text-sm"
                            value={filterTimeRange}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterTimeRange(e.target.value)}
                          >
                            <option value="all">All Time</option>
                            <option value="year">This Year</option>
                            <option value="month">This Month</option>
                            <option value="month_today">Month to Date</option>
                            <option value="day">Today</option>
                            <option value="custom">Custom Range</option>
                          </select>
                        </div>
                        {filterTimeRange === 'custom' && (
                          <>
                            <div>
                              <label className="text-xs font-medium mb-1 block">Start Date</label>
                              <Input
                                type="date"
                                value={filterStartDate ? filterStartDate.toISOString().split('T')[0] : ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterStartDate(new Date(e.target.value))}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium mb-1 block">End Date</label>
                              <Input
                                type="date"
                                value={filterEndDate ? filterEndDate.toISOString().split('T')[0] : ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterEndDate(new Date(e.target.value))}
                                className="text-sm"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Filter by Category */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold mb-3">Category</h4>
                      <Select
                        selectionMode="multiple"
                        placeholder="Select categories"
                        selectedKeys={filterCategory}
                        onSelectionChange={(keys) => setFilterCategory(Array.from(keys) as string[])}
                        className="w-full"
                      >
                        {allCategories?.map((cat: { name: string }) => (
                          <Select.Item key={cat.name}>
                            {cat.name}
                          </Select.Item>
                        ))}
                      </Select>
                    </div>

                    {/* Filter by Amount Ranges */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold mb-3">Amount Ranges</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Equity Min</label>
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filterEquityMin}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterEquityMin(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Equity Max</label>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filterEquityMax}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterEquityMax(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Invested Min</label>
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filterInvestedMin}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterInvestedMin(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Invested Max</label>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filterInvestedMax}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterInvestedMax(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium mb-1 block">Income Min</label>
                            <Input
                              type="number"
                              placeholder="Min"
                              value={filterIncomeMin}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterIncomeMin(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium mb-1 block">Income Max</label>
                            <Input
                              type="number"
                              placeholder="Max"
                              value={filterIncomeMax}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterIncomeMax(e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Filter by Currencies */}
                    <div className="border-b pb-4">
                      <h4 className="text-sm font-semibold mb-3">Currencies</h4>
                      <Select
                        selectionMode="multiple"
                        placeholder="Select currencies"
                        selectedKeys={filterCurrencies}
                        onSelectionChange={(keys) => setFilterCurrencies(Array.from(keys) as string[])}
                        className="w-full"
                      >
                        {['IDR', 'USD', 'EUR', 'SGD', 'JPY'].map((currency) => (
                          <Select.Item key={currency}>
                            {currency}
                          </Select.Item>
                        ))}
                      </Select>
                    </div>

                    {/* Filter by Platform */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Platform Income</h4>
                      <Select
                        selectionMode="multiple"
                        placeholder="Select platforms"
                        selectedKeys={filterPlatforms}
                        onSelectionChange={(keys) => setFilterPlatforms(Array.from(keys) as string[])}
                        className="w-full"
                      >
                        {['stocks', 'crypto', 'trading', 'freelance', 'salary'].map((platform) => (
                          <Select.Item key={platform}>
                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </Select.Item>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
              </Modal.Body>
              {(modalType === 'addTransaction' || modalType === 'addIncome' || modalType === 'addExpense') && (
                <Modal.Footer>
                  <Button type="submit" className="w-full bg-blue-500 text-white" onPress={() => form.handleSubmit()}>
                    {modalType === 'addIncome' ? 'Add Income' : 'Add Expense'}
                  </Button>
                </Modal.Footer>
              )}
              {modalType === 'filter' && (
                <Modal.Footer>
                  <Button onClick={handleFilterSubmit} className="w-full bg-blue-500 text-white">
                    Apply Filter
                  </Button>
                </Modal.Footer>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
