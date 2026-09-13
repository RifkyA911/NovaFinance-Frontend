"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Chip,
  Input,
  TextArea,
  Label,
  TextField,
  Modal,
  Select,
  ListBox,
  Dropdown,
  ProgressBar,
  Checkbox,
  Spinner,
  Table,
} from "@heroui/react";
import { DocumentUpload } from "../components/DocumentUpload";
import {
  Wallet,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  PiggyBank,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TransactionWithIcon } from "../../lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, queryFunctions, mutationFunctions } from "../../lib/queries";
import { useForm } from "@tanstack/react-form";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { selectedWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'addTransaction' | 'filter' | 'addIncome' | 'addExpense'>('addTransaction');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [transactionError, setTransactionError] = useState('');

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
      setIsSubmitting(true);
      try {
        const transaction = {
          description: value.description,
          amount: Number(value.amount),
          type: modalType === 'addIncome' ? 'INCOME' as const : 'EXPENSE' as const,
          category: value.categoryId,
          date: value.date,
        };
        await mutationFunctions.createTransaction(transaction);
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions(selectedWorkspace.id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary(selectedWorkspace.id) });
        setIsModalOpen(false);
        form.reset();
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Transaction creation error:', error);
        setTransactionError('Failed to create transaction. Please try again.');
        setShowErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
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
  const trends = trendsQuery.data?.data?.trends;
  const categories = categoriesQuery.data?.data?.categories || [];
  const accounts = accountsQuery.data?.data?.accounts || [];
  const allCategories = allCategoriesQuery.data?.data?.categories || [];

  const transactions: TransactionWithIcon[] = transactionsQuery.data?.data?.transactions?.map((tx: { id?: string; category?: string | { name?: string }; type: string; date: string; description: string; amount: number }, index: number) => {
    const categoryValue = tx.category;
    let categoryName = 'Uncategorized';
    if (typeof categoryValue === 'string') {
      categoryName = categoryValue;
    } else if (categoryValue && typeof categoryValue === 'object' && categoryValue.name) {
      categoryName = categoryValue.name;
    }
    const isIncome = tx.type?.toLowerCase() === "income";
    return {
      ...tx,
      type: isIncome ? ('INCOME' as const) : ('EXPENSE' as const),
      id: tx.id || `tx-${index}`,
      category: categoryName,
      icon: isIncome ? <Wallet className="w-4 h-4 text-green-500" /> : <CreditCard className="w-4 h-4 text-red-500" />,
      date: tx.date ? new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-',
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
        <div className="text-center flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-default-500 text-sm">Loading dashboard...</p>
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-default-500 mt-1 text-sm md:text-base">Welcome back! Here&apos;s your financial overview.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onPress={() => { setModalType('filter'); setIsModalOpen(true); }}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-sm" size="sm" onPress={() => { setModalType('addTransaction'); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>

            {/* HeroUI Dropdown */}
            <Dropdown>
              <Dropdown.Trigger>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </Dropdown.Trigger>
              <Dropdown.Popover className="min-w-44 z-50 shadow-lg">
                <Dropdown.Menu
                  aria-label="Export options"
                  onAction={(key) => {
                    if (key === 'excel') console.log('Download Excel');
                    if (key === 'pdf') console.log('Download PDF');
                  }}
                >
                  <Dropdown.Item id="excel" textValue="Download Excel" className="flex items-center gap-2 cursor-pointer py-2">
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span>Download Excel</span>
                  </Dropdown.Item>
                  <Dropdown.Item id="pdf" textValue="Download PDF" className="flex items-center gap-2 cursor-pointer py-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span>Download PDF</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 md:p-6 border-2 border-blue-500/20 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-default-500 font-medium">Total Balance</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-blue-600">Rp {(totalBalance / 1000000).toFixed(0)}M</p>
                <div className="flex items-center gap-1 mt-3 text-success text-xs md:text-sm font-semibold">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                  <span>+12.5%</span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 md:w-7 md:h-7 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-2 border-green-500/20 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-default-500 font-medium">Monthly Income</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-green-600">Rp {(monthlyIncome / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-3 text-success text-xs md:text-sm font-semibold">
                  <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                  <span>+8.2%</span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-2 border-red-500/20 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs md:text-sm text-default-500 font-medium">Monthly Expenses</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-red-600">Rp {(monthlyExpense / 1000000).toFixed(1)}M</p>
                <div className="flex items-center gap-1 mt-3 text-danger text-xs md:text-sm font-semibold">
                  <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />
                  <span>-3.1%</span>
                </div>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 md:w-7 md:h-7 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 border-2 border-purple-500/20 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="w-full mr-2">
                <p className="text-xs md:text-sm text-default-500 font-medium">Savings Rate</p>
                <p className="text-2xl md:text-3xl font-bold mt-2 text-purple-600">{savingsRate}%</p>
                {/* HeroUI ProgressBar */}
                <ProgressBar value={Math.min(100, Math.max(0, savingsRate))} aria-label="Savings Rate" className="mt-3">
                  <ProgressBar.Track className="h-2 md:h-3 rounded-full bg-purple-100 dark:bg-purple-950/40">
                    <ProgressBar.Fill className="bg-purple-500 rounded-full transition-all duration-500" />
                  </ProgressBar.Track>
                </ProgressBar>
              </div>
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5 md:w-7 md:h-7 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Income vs Expense Chart */}
          <Card className="p-4 md:p-6 shadow-xs">
            <Card.Header className="flex items-center justify-between mb-4 md:mb-6 p-0">
              <div>
                <Card.Title className="text-base md:text-lg font-semibold">Income vs Expenses</Card.Title>
                <Card.Description className="text-xs md:text-sm text-default-500">Monthly comparison</Card.Description>
              </div>
              <Button size="sm" variant="ghost" className="text-xs md:text-sm">
                This Year
              </Button>
            </Card.Header>
            <Card.Content className="p-0">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                    <XAxis dataKey="month" stroke="currentColor" strokeOpacity={0.5} fontSize={10} tick={{ fontSize: 10 }} />
                    <YAxis stroke="currentColor" strokeOpacity={0.5} fontSize={10} tick={{ fontSize: 10 }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--heroui-background, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: "8px" }}
                      formatter={(value) => `Rp ${(Number(value || 0) / 1000000).toFixed(1)}M`}
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
            </Card.Content>
          </Card>

          {/* Portfolio Distribution */}
          <Card className="p-4 md:p-6 shadow-xs">
            <Card.Header className="flex items-center justify-between mb-4 md:mb-6 p-0">
              <div>
                <Card.Title className="text-base md:text-lg font-semibold">Portfolio Distribution</Card.Title>
                <Card.Description className="text-xs md:text-sm text-default-500">Asset allocation</Card.Description>
              </div>
              <Button size="sm" variant="ghost" className="text-xs md:text-sm">
                View Details
              </Button>
            </Card.Header>
            <Card.Content className="p-0">
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
                      contentStyle={{ backgroundColor: "var(--heroui-background, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: "8px" }}
                      formatter={(value) => `Rp ${(Number(value || 0) / 1000000).toFixed(1)}M`}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {portfolioData.map((entry: { color?: string }, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-default-500 text-sm">
                  No portfolio data available
                </div>
              )}
            </Card.Content>
          </Card>
        </div>

        {/* Recent Transactions with HeroUI Table */}
        <Card className="shadow-xs">
          <Card.Header className="p-4 md:p-6 border-b border-default-200 dark:border-default-700">
            <div className="flex items-center justify-between w-full">
              <div>
                <Card.Title className="text-base md:text-lg font-semibold">Recent Transactions</Card.Title>
                <Card.Description className="text-xs md:text-sm text-default-500">Your latest financial activities</Card.Description>
              </div>
              <Button size="sm" variant="ghost" className="text-xs md:text-sm">
                View All
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="p-4 md:p-6">
            <Table className="w-full">
              <Table.ScrollContainer className="overflow-x-auto">
                <Table.Content aria-label="Recent Transactions" className="w-full min-w-150">
                  <Table.Header>
                    <Table.Column isRowHeader className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold">Transaction</Table.Column>
                    <Table.Column className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold hidden sm:table-cell">Category</Table.Column>
                    <Table.Column className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold hidden md:table-cell">Date</Table.Column>
                    <Table.Column className="text-right py-3 px-2 md:px-4 text-xs md:text-sm font-semibold">Amount</Table.Column>
                    <Table.Column className="text-left py-3 px-2 md:px-4 text-xs md:text-sm font-semibold hidden sm:table-cell">Status</Table.Column>
                  </Table.Header>
                  <Table.Body
                    items={transactions}
                    renderEmptyState={() => (
                      <div className="py-8 text-center text-default-500 text-sm">
                        No transactions available
                      </div>
                    )}
                  >
                    {(tx: TransactionWithIcon) => (
                      <Table.Row id={tx.id} className="border-b border-default-100 dark:border-default-800 hover:bg-default-50 dark:hover:bg-default-800/50 transition-colors">
                        <Table.Cell className="py-3 px-2 md:px-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type?.toLowerCase() === "income" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                              {tx.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs md:text-sm truncate">{tx.description}</p>
                              <p className="text-xs text-default-500 hidden sm:block">{tx.category}</p>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="py-3 px-2 md:px-4 hidden sm:table-cell">
                          <Chip size="sm" variant="soft" className="text-xs">
                            {tx.category}
                          </Chip>
                        </Table.Cell>
                        <Table.Cell className="py-3 px-2 md:px-4 hidden md:table-cell">
                          <span className="text-default-500 text-xs md:text-sm">{tx.date}</span>
                        </Table.Cell>
                        <Table.Cell className="py-3 px-2 md:px-4 text-right">
                          <span className={`font-semibold text-xs md:text-sm ${tx.type?.toLowerCase() === "income" ? "text-success" : "text-danger"}`}>
                            {tx.type?.toLowerCase() === "income" ? "+" : "-"}Rp {(Number(tx.amount) / 1000000).toFixed(1)}M
                          </span>
                        </Table.Cell>
                        <Table.Cell className="py-3 px-2 md:px-4 hidden sm:table-cell">
                          <Chip size="sm" color="success" variant="soft" className="text-xs">
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

        {/* Spending Categories with HeroUI ProgressBar */}
        <Card className="p-4 md:p-6 shadow-xs">
          <Card.Header className="flex items-center justify-between mb-4 md:mb-6 p-0">
            <div>
              <Card.Title className="text-base md:text-lg font-semibold">Spending by Category</Card.Title>
              <Card.Description className="text-xs md:text-sm text-default-500">This month&apos;s breakdown</Card.Description>
            </div>
          </Card.Header>
          <Card.Content className="space-y-3 md:space-y-4 p-0">
            {spendingCategories.length > 0 ? spendingCategories.map((category, index) => {
              const categoryName = typeof category === 'object' && category.name ? category.name : (typeof category === 'string' ? category : `Category ${index}`);
              const percentageNum = Number(category.percentage) || 0;
              return (
                <div key={category.name || index} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium">{categoryName}</span>
                    <span className="text-xs md:text-sm text-default-500">
                      {category.value ? `Rp ${(Number(category.value) / 1000000).toFixed(1)}M` : ''}
                      {category.percentage ? ` (${category.percentage}%)` : ''}
                    </span>
                  </div>
                  {category.percentage && (
                    <ProgressBar value={percentageNum} aria-label={categoryName}>
                      <ProgressBar.Track className="h-1.5 md:h-2 rounded-full bg-default-200 dark:bg-default-700">
                        <ProgressBar.Fill className="bg-blue-500 rounded-full transition-all duration-500" />
                      </ProgressBar.Track>
                    </ProgressBar>
                  )}
                </div>
              );
            }) : (
              <p className="text-default-500 text-xs md:text-sm">No category data available</p>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Main Modal (Add Transaction / Filter) */}
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
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
                          <TextField className="space-y-1">
                            <Label className="text-sm font-medium block text-default-700 dark:text-default-300">Title</Label>
                            <Input
                              type="text"
                              aria-label="Title"
                              placeholder="Enter description"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          </TextField>
                        )}
                      />
                      <form.Field
                        name="amount"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <TextField className="space-y-1">
                            <Label className="text-sm font-medium block text-default-700 dark:text-default-300">Amount</Label>
                            <Input
                              type="number"
                              aria-label="Amount"
                              placeholder="Enter amount"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          </TextField>
                        )}
                      />
                      <form.Field
                        name="categoryId"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium block text-default-700 dark:text-default-300">Category</Label>
                            <Select
                              aria-label="Category"
                              selectedKey={field.state.value || null}
                              onSelectionChange={(key) => field.handleChange(key ? String(key) : '')}
                              placeholder="Select category"
                              className="w-full"
                            >
                              <Select.Trigger className="w-full justify-between">
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover className="min-w-50 z-50 shadow-lg">
                                <ListBox items={allCategories || []}>
                                  {(cat: { id: string; name: string }) => (
                                    <ListBox.Item id={cat.id} textValue={typeof cat.name === 'string' ? cat.name : 'Category'}>
                                      {typeof cat.name === 'string' ? cat.name : 'Category'}
                                    </ListBox.Item>
                                  )}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          </div>
                        )}
                      />
                      <form.Field
                        name="accountId"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <div className="space-y-1">
                            <Label className="text-sm font-medium block text-default-700 dark:text-default-300">Account</Label>
                            <Select
                              aria-label="Account"
                              selectedKey={field.state.value || null}
                              onSelectionChange={(key) => field.handleChange(key ? String(key) : '')}
                              placeholder="Select account"
                              className="w-full"
                            >
                              <Select.Trigger className="w-full justify-between">
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover className="min-w-50 z-50 shadow-lg">
                                <ListBox items={accounts || []}>
                                  {(acc: { id: string; name: string }) => (
                                    <ListBox.Item id={acc.id} textValue={typeof acc.name === 'string' ? acc.name : 'Account'}>
                                      {typeof acc.name === 'string' ? acc.name : 'Account'}
                                    </ListBox.Item>
                                  )}
                                </ListBox>
                              </Select.Popover>
                            </Select>
                          </div>
                        )}
                      />
                      <form.Field
                        name="date"
                        // eslint-disable-next-line react/no-children-prop
                        children={(field) => (
                          <TextField className="space-y-1">
                            <Label className="text-sm font-medium block text-default-700 dark:text-default-300">Date</Label>
                            <Input
                              type="date"
                              aria-label="Date"
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                            />
                          </TextField>
                        )}
                      />
                    </div>
                    <form.Field
                      name="notes"
                      // eslint-disable-next-line react/no-children-prop
                      children={(field) => (
                        <TextField className="space-y-1">
                          <Label className="text-sm font-medium block text-default-700 dark:text-default-300">Notes</Label>
                          <TextArea
                            className="min-h-24"
                            aria-label="Notes"
                            placeholder="Optional notes"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                        </TextField>
                      )}
                    />
                    <div className="border-t border-default-200 dark:border-default-700 pt-4">
                      <Label className="text-sm font-medium mb-2 block text-default-700 dark:text-default-300">Attach Documents</Label>
                      <DocumentUpload
                        onUpload={(file, type) => console.log('Uploaded:', file, type)}
                        workspaceId={selectedWorkspace?.id || ''}
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="ghost"
                        onPress={() => setIsModalOpen(false)}
                        isDisabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-sm flex items-center gap-2"
                        isDisabled={isSubmitting}
                      >
                        {isSubmitting && <Spinner size="sm" />}
                        <span>{isSubmitting ? 'Saving...' : 'Save Transaction'}</span>
                      </Button>
                    </div>
                  </form>
                )}
                {modalType === 'filter' && (
                  <div className="space-y-4">
                    {/* Filter by Time */}
                    <div className="border-b border-default-200 dark:border-default-700 pb-4">
                      <h4 className="text-sm font-semibold mb-3">Time Range</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs font-medium mb-1 block text-default-700 dark:text-default-300">Period</Label>
                          <Select
                            aria-label="Time Period"
                            selectedKey={filterTimeRange}
                            onSelectionChange={(key) => setFilterTimeRange(String(key))}
                            className="w-full"
                          >
                            <Select.Trigger className="w-full justify-between">
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover className="min-w-40 z-50 shadow-lg">
                              <ListBox items={[
                                { id: 'all', name: 'All Time' },
                                { id: 'year', name: 'This Year' },
                                { id: 'month', name: 'This Month' },
                                { id: 'month_today', name: 'Month to Date' },
                                { id: 'day', name: 'Today' },
                                { id: 'custom', name: 'Custom Range' },
                              ]}>
                                {(item) => (
                                  <ListBox.Item id={item.id} textValue={item.name}>
                                    {item.name}
                                  </ListBox.Item>
                                )}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        </div>
                        {filterTimeRange === 'custom' && (
                          <>
                            <TextField className="space-y-1">
                              <Label className="text-xs font-medium block text-default-700 dark:text-default-300">Start Date</Label>
                              <Input
                                type="date"
                                aria-label="Start Date"
                                value={filterStartDate ? filterStartDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setFilterStartDate(new Date(e.target.value))}
                              />
                            </TextField>
                            <TextField className="space-y-1">
                              <Label className="text-xs font-medium block text-default-700 dark:text-default-300">End Date</Label>
                              <Input
                                type="date"
                                aria-label="End Date"
                                value={filterEndDate ? filterEndDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => setFilterEndDate(new Date(e.target.value))}
                              />
                            </TextField>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Filter by Category */}
                    <div className="border-b border-default-200 dark:border-default-700 pb-4">
                      <h4 className="text-sm font-semibold mb-3">Category</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {allCategories?.map((cat: { id?: string; name: string }) => (
                          <Checkbox
                            key={cat.id || cat.name}
                            isSelected={filterCategory.includes(cat.name)}
                            onChange={(isSelected) => {
                              if (isSelected) {
                                setFilterCategory([...filterCategory, cat.name]);
                              } else {
                                setFilterCategory(filterCategory.filter(c => c !== cat.name));
                              }
                            }}
                          >
                            <Checkbox.Content className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-default-100 dark:hover:bg-default-800">
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              <span className="text-sm">{cat.name}</span>
                            </Checkbox.Content>
                          </Checkbox>
                        ))}
                      </div>
                    </div>

                    {/* Filter by Amount Ranges */}
                    <div className="border-b border-default-200 dark:border-default-700 pb-4">
                      <h4 className="text-sm font-semibold mb-3">Amount Ranges</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <TextField className="space-y-1">
                            <Label className="text-xs font-medium block text-default-700 dark:text-default-300">Equity Min</Label>
                            <Input
                              type="number"
                              aria-label="Equity Min"
                              placeholder="Min"
                              value={filterEquityMin}
                              onChange={(e) => fieldToNumber(e, setFilterEquityMin)}
                            />
                          </TextField>
                          <TextField className="space-y-1">
                            <Label className="text-xs font-medium block text-default-700 dark:text-default-300">Equity Max</Label>
                            <Input
                              type="number"
                              aria-label="Equity Max"
                              placeholder="Max"
                              value={filterEquityMax}
                              onChange={(e) => fieldToNumber(e, setFilterEquityMax)}
                            />
                          </TextField>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <TextField className="space-y-1">
                            <Label className="text-xs font-medium block text-default-700 dark:text-default-300">Invested Min</Label>
                            <Input
                              type="number"
                              aria-label="Invested Min"
                              placeholder="Min"
                              value={filterInvestedMin}
                              onChange={(e) => fieldToNumber(e, setFilterInvestedMin)}
                            />
                          </TextField>
                          <TextField className="space-y-1">
                            <Label className="text-xs font-medium block text-default-700 dark:text-default-300">Invested Max</Label>
                            <Input
                              type="number"
                              aria-label="Invested Max"
                              placeholder="Max"
                              value={filterInvestedMax}
                              onChange={(e) => fieldToNumber(e, setFilterInvestedMax)}
                            />
                          </TextField>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <TextField className="space-y-1">
                            <Label className="text-xs font-medium block text-default-700 dark:text-default-300">Income Min</Label>
                            <Input
                              type="number"
                              aria-label="Income Min"
                              placeholder="Min"
                              value={filterIncomeMin}
                              onChange={(e) => fieldToNumber(e, setFilterIncomeMin)}
                            />
                          </TextField>
                          <TextField className="space-y-1">
                            <Label className="text-xs font-medium block text-default-700 dark:text-default-300">Income Max</Label>
                            <Input
                              type="number"
                              aria-label="Income Max"
                              placeholder="Max"
                              value={filterIncomeMax}
                              onChange={(e) => fieldToNumber(e, setFilterIncomeMax)}
                            />
                          </TextField>
                        </div>
                      </div>
                    </div>

                    {/* Filter by Currencies */}
                    <div className="border-b border-default-200 dark:border-default-700 pb-4">
                      <h4 className="text-sm font-semibold mb-3">Currencies</h4>
                      <div className="space-y-2">
                        {['IDR', 'USD', 'EUR', 'SGD', 'JPY'].map((currency) => (
                          <Checkbox
                            key={currency}
                            isSelected={filterCurrencies.includes(currency)}
                            onChange={(isSelected) => {
                              if (isSelected) {
                                setFilterCurrencies([...filterCurrencies, currency]);
                              } else {
                                setFilterCurrencies(filterCurrencies.filter(c => c !== currency));
                              }
                            }}
                          >
                            <Checkbox.Content className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-default-100 dark:hover:bg-default-800">
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              <span className="text-sm">{currency}</span>
                            </Checkbox.Content>
                          </Checkbox>
                        ))}
                      </div>
                    </div>

                    {/* Filter by Platform */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Platform Income</h4>
                      <div className="space-y-2">
                        {['stocks', 'crypto', 'trading', 'freelance', 'salary'].map((platform) => (
                          <Checkbox
                            key={platform}
                            isSelected={filterPlatforms.includes(platform)}
                            onChange={(isSelected) => {
                              if (isSelected) {
                                setFilterPlatforms([...filterPlatforms, platform]);
                              } else {
                                setFilterPlatforms(filterPlatforms.filter(p => p !== platform));
                              }
                            }}
                          >
                            <Checkbox.Content className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-default-100 dark:hover:bg-default-800">
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              <span className="text-sm capitalize">{platform}</span>
                            </Checkbox.Content>
                          </Checkbox>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Modal.Body>
              {modalType === 'addIncome' || modalType === 'addExpense' ? (
                <Modal.Footer>
                  <Button type="submit" className="w-full bg-blue-500 text-white" onPress={() => form.handleSubmit()}>
                    {modalType === 'addIncome' ? 'Add Income' : 'Add Expense'}
                  </Button>
                </Modal.Footer>
              ) : null}
              {modalType === 'filter' && (
                <Modal.Footer>
                  <Button onPress={handleFilterSubmit} className="w-full bg-blue-500 text-white">
                    Apply Filter
                  </Button>
                </Modal.Footer>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Success</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-default-600">Transaction created successfully!</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  onPress={() => setShowSuccessModal(false)}
                  className="bg-linear-to-r from-blue-500 to-purple-600 text-white"
                >
                  OK
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* Error Modal */}
      <Modal isOpen={showErrorModal} onOpenChange={setShowErrorModal}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Error</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-danger">{transactionError}</p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  onPress={() => setShowErrorModal(false)}
                  className="bg-linear-to-r from-blue-500 to-purple-600 text-white"
                >
                  OK
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}

function fieldToNumber(e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) {
  setter(e.target.value);
}
