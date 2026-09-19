import { api } from './api';
import type {
  CreateTransactionPayload,
  CreateAccountPayload,
  UpdateAccountPayload,
  CreateCategoryPayload,
  CreateGoalPayload,
  UpdateGoalPayload,
  ReorderGoalItem,
} from './api';

// Query keys
export const queryKeys = {
  workspaces: ['workspaces'] as const,
  transactions: (workspaceId: string, limit?: number, sortBy?: string, order?: string) =>
    ['transactions', workspaceId, limit, sortBy, order] as const,
  categories: (workspaceId?: string) => ['categories', workspaceId] as const,
  accounts: (workspaceId?: string) => ['accounts', workspaceId] as const,
  goals: (workspaceId: string, status?: string, priority?: string, category?: string) =>
    ['goals', workspaceId, status, priority, category] as const,
  goalsAnalytics: (workspaceId: string) => ['goals', 'analytics', workspaceId] as const,
  dashboardSummary: (workspaceId: string) => ['dashboard', 'summary', workspaceId] as const,
  dashboardTrends: (workspaceId: string, months?: number) => ['dashboard', 'trends', workspaceId, months] as const,
  dashboardCategories: (workspaceId: string, type?: string) => ['dashboard', 'categories', workspaceId, type] as const,
  dashboardAccounts: (workspaceId: string) => ['dashboard', 'accounts', workspaceId] as const,
};

// Query functions
export const queryFunctions = {
  // Workspaces
  workspaces: () => api.getWorkspaces(),
  
  // Transactions
  transactions: (workspaceId: string, limit?: number, sortBy?: string, order?: string) =>
    api.getTransactions(workspaceId, limit, sortBy, order),
  
  // Categories
  categories: (workspaceId?: string) => api.getCategories(workspaceId),
  
  // Accounts
  accounts: (workspaceId?: string) => api.getAccounts(workspaceId),

  // Goals
  goals: (workspaceId: string, status?: string, priority?: string, category?: string) =>
    api.getGoals(workspaceId, status, priority, category),
  goalsAnalytics: (workspaceId: string) => api.getGoalsAnalytics(workspaceId),
  
  // Dashboard
  dashboardSummary: (workspaceId: string) => api.getDashboardSummary(workspaceId),
  dashboardTrends: (workspaceId: string, months?: number) => api.getDashboardTrends(workspaceId, months),
  dashboardCategories: (workspaceId: string, type?: string) => api.getDashboardCategories(workspaceId, type),
  dashboardAccounts: (workspaceId: string) => api.getDashboardAccounts(workspaceId),
};

// Mutation functions
export const mutationFunctions = {
  createTransaction: (payload: CreateTransactionPayload) => api.createTransaction(payload),
  deleteTransaction: (id: string) => api.deleteTransaction(id),
  createAccount: (payload: CreateAccountPayload) => api.createAccount(payload),
  updateAccount: (id: string, payload: UpdateAccountPayload) => api.updateAccount(id, payload),
  deleteAccount: (id: string) => api.deleteAccount(id),
  createCategory: (payload: CreateCategoryPayload) => api.createCategory(payload),
  linkDocumentToTransaction: (payload: { documentId: string; transactionId: string }) =>
    api.linkDocumentToTransaction(payload.documentId, payload.transactionId),
  // Goals mutations
  createGoal: (payload: CreateGoalPayload) => api.createGoal(payload),
  updateGoal: (payload: { id: string; data: UpdateGoalPayload }) => api.updateGoal(payload.id, payload.data),
  depositGoal: (payload: { id: string; amount: number | string; accountId?: string; note?: string }) =>
    api.depositGoal(payload.id, payload.amount, payload.accountId, payload.note),
  reorderGoals: (payload: { workspaceId: string; items: ReorderGoalItem[] }) =>
    api.reorderGoals(payload.workspaceId, payload.items),
  deleteGoal: (id: string) => api.deleteGoal(id),
};

