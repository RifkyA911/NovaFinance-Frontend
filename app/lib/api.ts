const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Transaction {
  id: string;
  workspaceId?: string;
  accountId?: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    type?: string;
    color?: string;
    icon?: string;
  } | string;
  account?: {
    id: string;
    name: string;
    type: string;
  };
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'income' | 'expense';
  description: string;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionWithIcon extends Omit<Transaction, 'category'> {
  category: string;
  icon?: React.ReactNode;
  rawDate?: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  color?: string;
  icon?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number | string;
  currency?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'PERSONAL' | 'BUSINESS' | 'personal' | 'umkm' | 'pt';
  currency: string;
  createdAt: string;
}

export interface CreateTransactionPayload {
  workspaceId: string;
  accountId: string;
  categoryId?: string;
  amount: string | number;
  type: string;
  description: string;
  date?: string;
  notes?: string;
  metadata?: unknown;
}

export interface CreateAccountPayload {
  workspaceId: string;
  name: string;
  type: 'bank' | 'cash' | 'ewallet' | 'credit';
  balance?: string | number;
  currency?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface UpdateAccountPayload {
  name?: string;
  type?: 'bank' | 'cash' | 'ewallet' | 'credit';
  balance?: string | number;
  currency?: string;
  accountNumber?: string;
  bankName?: string;
}

export interface CreateCategoryPayload {
  workspaceId: string;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
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
      const errorBody = await response.text();
      let errorMsg = `API request failed: ${response.statusText}`;
      try {
        const parsed = JSON.parse(errorBody);
        if (parsed.error) errorMsg = parsed.error;
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
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
  async getTransactions(
    workspaceId: string,
    limit?: number,
    sortBy?: string,
    order?: string
  ): Promise<{ success: boolean; data: { transactions: Transaction[]; total?: number } }> {
    const params = new URLSearchParams({ workspaceId });
    if (limit) params.append('limit', limit.toString());
    if (sortBy) params.append('sortBy', sortBy);
    if (order) params.append('order', order);
    return this.request(`/api/transactions?${params}`);
  }

  async createTransaction(payload: CreateTransactionPayload): Promise<{ success: boolean; data: { transaction: Transaction } }> {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({
        workspaceId: payload.workspaceId,
        accountId: payload.accountId,
        categoryId: payload.categoryId || undefined,
        amount: String(payload.amount),
        type: payload.type.toLowerCase(),
        description: payload.description,
        date: payload.date ? new Date(payload.date).toISOString() : new Date().toISOString(),
        notes: payload.notes || undefined,
        metadata: payload.metadata || undefined,
      }),
    });
  }

  async linkDocumentToTransaction(documentId: string, transactionId: string): Promise<{ success: boolean }> {
    return this.request(`/api/documents/${documentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ transactionId }),
    });
  }

  async deleteTransaction(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(workspaceId?: string): Promise<{ success: boolean; data: { categories: Category[] } }> {
    const url = workspaceId ? `/api/categories?workspaceId=${workspaceId}` : '/api/categories';
    return this.request(url);
  }

  async createCategory(payload: CreateCategoryPayload): Promise<{ success: boolean; data: { category: Category } }> {
    return this.request('/api/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Accounts
  async getAccounts(workspaceId?: string): Promise<{ success: boolean; data: { accounts: Account[] } }> {
    const url = workspaceId ? `/api/accounts?workspaceId=${workspaceId}` : '/api/accounts';
    return this.request(url);
  }

  async createAccount(payload: CreateAccountPayload): Promise<{ success: boolean; data: { account: Account } }> {
    return this.request('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateAccount(id: string, payload: UpdateAccountPayload): Promise<{ success: boolean; data: { account: Account } }> {
    return this.request(`/api/accounts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteAccount(id: string): Promise<{ success: boolean }> {
    return this.request(`/api/accounts/${id}`, {
      method: 'DELETE',
    });
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
