const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category: string;
}

export interface TransactionWithIcon extends Transaction {
  icon?: React.ReactNode;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'BANK' | 'CASH';
  balance: number;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'PERSONAL' | 'BUSINESS';
  currency: string;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle error responses from backend
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Workspaces
  async getWorkspaces(): Promise<{ success: boolean; data: { workspaces: Workspace[] } }> {
    return this.request('/api/workspaces');
  }

  // Transactions
  async getTransactions(workspaceId: string, limit?: number): Promise<{ success: boolean; data: { transactions: Transaction[] } }> {
    const params = new URLSearchParams({ workspaceId });
    if (limit) params.append('limit', limit.toString());
    return this.request(`/api/transactions?${params}`);
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<{ success: boolean; data: { transaction: Transaction } }> {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Categories
  async getCategories(workspaceId?: string): Promise<{ success: boolean; data: { categories: Category[] } }> {
    const url = workspaceId ? `/api/categories?workspaceId=${workspaceId}` : '/api/categories';
    return this.request(url);
  }

  // Accounts
  async getAccounts(): Promise<{ success: boolean; data: { accounts: Account[] } }> {
    return this.request('/api/accounts');
  }

  // Dashboard
  async getDashboardSummary(workspaceId: string): Promise<{ success: boolean; data: { totalBalance: number; monthlyIncome: number; monthlyExpense: number; savingsRate: number } }> {
    return this.request(`/api/dashboard/summary?workspaceId=${workspaceId}`);
  }

  async getDashboardTrends(workspaceId: string, months?: number): Promise<{ success: boolean; data: { trends: Array<{ month: string; income: number; expense: number }> } }> {
    const params = new URLSearchParams({ workspaceId });
    if (months) params.append('months', months.toString());
    return this.request(`/api/dashboard/trends?${params}`);
  }

  async getDashboardCategories(workspaceId: string, type?: string): Promise<{ success: boolean; data: { categories: Array<{ name: string; value: number; percentage: string }> } }> {
    const params = new URLSearchParams({ workspaceId });
    if (type) params.append('type', type);
    return this.request(`/api/dashboard/categories?${params}`);
  }

  async getDashboardAccounts(workspaceId: string): Promise<{ success: boolean; data: { accounts: Array<{ id: string; name: string; balance: string; type: string }> } }> {
    return this.request(`/api/dashboard/accounts?workspaceId=${workspaceId}`);
  }
}

export const api = new ApiClient();
