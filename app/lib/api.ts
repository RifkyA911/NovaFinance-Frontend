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
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Workspaces
  async getWorkspaces(): Promise<{ workspaces: Workspace[] }> {
    return this.request('/api/workspaces');
  }

  // Transactions
  async getTransactions(): Promise<{ transactions: Transaction[] }> {
    return this.request('/api/transactions');
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<{ success: boolean; data: Transaction }> {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return this.request('/api/categories');
  }

  // Accounts
  async getAccounts(): Promise<{ accounts: Account[] }> {
    return this.request('/api/accounts');
  }
}

export const api = new ApiClient();
