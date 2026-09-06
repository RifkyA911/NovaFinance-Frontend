import { api } from './api';
import type { Transaction, Workspace } from './api';

// Query keys
export const queryKeys = {
  workspaces: ['workspaces'] as const,
  transactions: (workspaceId: string) => ['transactions', workspaceId] as const,
  categories: (workspaceId?: string) => ['categories', workspaceId] as const,
  accounts: ['accounts'] as const,
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
  transactions: (workspaceId: string, limit?: number) => api.getTransactions(workspaceId, limit),
  
  // Categories
  categories: (workspaceId?: string) => api.getCategories(workspaceId),
  
  // Accounts
  accounts: () => api.getAccounts(),
  
  // Dashboard
  dashboardSummary: (workspaceId: string) => api.getDashboardSummary(workspaceId),
  dashboardTrends: (workspaceId: string, months?: number) => api.getDashboardTrends(workspaceId, months),
  dashboardCategories: (workspaceId: string, type?: string) => api.getDashboardCategories(workspaceId, type),
  dashboardAccounts: (workspaceId: string) => api.getDashboardAccounts(workspaceId),
};

// Mutation functions
export const mutationFunctions = {
  createTransaction: (transaction: Omit<Transaction, 'id'>) => api.createTransaction(transaction),
};
