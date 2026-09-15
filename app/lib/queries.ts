import { api } from './api';
import type {
  CreateTransactionPayload,
  CreateAccountPayload,
  CreateCategoryPayload,
} from './api';

// Query keys
export const queryKeys = {
  workspaces: ['workspaces'] as const,
  transactions: (workspaceId: string, limit?: number, sortBy?: string, order?: string) =>
    ['transactions', workspaceId, limit, sortBy, order] as const,
  categories: (workspaceId?: string) => ['categories', workspaceId] as const,
  accounts: (workspaceId?: string) => ['accounts', workspaceId] as const,
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
  createCategory: (payload: CreateCategoryPayload) => api.createCategory(payload),
  linkDocumentToTransaction: (payload: { documentId: string; transactionId: string }) =>
    api.linkDocumentToTransaction(payload.documentId, payload.transactionId),
};
