export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const STORAGE_TOKEN_KEY = 'tk_auth_token';

export const getApiBaseUrl = (): string => {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  return (fromEnv?.replace(/\/$/, '') || 'http://localhost:5000') + '/api';
};

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
};

interface ApiFetchOptions<TBody> {
  method?: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
}

export async function apiFetch<TResponse = unknown, TBody = unknown>(
  path: string,
  options: ApiFetchOptions<TBody> = {}
): Promise<TResponse> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data?.message || data?.error || message;
    } catch {}
    throw new Error(message);
  }

  // No content
  if (response.status === 204) return undefined as unknown as TResponse;

  return (await response.json()) as TResponse;
}

// Auth API helpers
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  lastLogin?: string | null;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export const authApi = {
  async register(payload: { name: string; email: string; password: string }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: payload });
  },
  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: payload });
  },
  async profile(): Promise<{ message: string; user: AuthUser }> {
    return apiFetch<{ message: string; user: AuthUser }>('/auth/profile');
  },
  async updateProfile(payload: Partial<Pick<AuthUser, 'name' | 'email'>>): Promise<{ message: string; user: AuthUser }> {
    return apiFetch<{ message: string; user: AuthUser }>('/auth/profile', { method: 'PUT', body: payload });
  },
  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return apiFetch<{ message: string }>('/auth/change-password', { method: 'PUT', body: payload });
  }
};

// Domain API helpers
export interface CustomerDto {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  photo_url?: string;
  tags?: string[];
  due_amount: number;
  total_given: number;
  total_received: number;
}

export interface PaginationResponse<T> {
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SingleResponse<T> {
  message: string;
  data: T;
}

export const customersApi = {
  list(query: { page?: number; limit?: number; search?: string } = {}) {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    const qs = params.toString();
    return apiFetch<PaginationResponse<CustomerDto>>(`/customers${qs ? `?${qs}` : ''}`);
  },
  get(id: string) {
    return apiFetch<SingleResponse<CustomerDto>>(`/customers/${id}`);
  },
  create(payload: Partial<CustomerDto>) {
    return apiFetch<SingleResponse<CustomerDto>>('/customers', { method: 'POST', body: payload });
  },
  update(id: string, payload: Partial<CustomerDto>) {
    return apiFetch<SingleResponse<CustomerDto>>(`/customers/${id}`, { method: 'PUT', body: payload });
  },
  remove(id: string) {
    return apiFetch<{ message: string }>(`/customers/${id}`, { method: 'DELETE' });
  }
};

export interface TransactionDto {
  _id: string;
  customer: string | CustomerDto;
  type: 'given' | 'received';
  amount: number;
  refund_amount: number;
  note?: string;
  date: string;
  time: string;
  due_date?: string | null;
  payment_method?: 'cash' | 'bank' | 'mobile_banking' | 'other';
}

export const transactionsApi = {
  list(query: { page?: number; limit?: number; customerId?: string } = {}) {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.customerId) params.set('customerId', query.customerId);
    const qs = params.toString();
    return apiFetch<PaginationResponse<TransactionDto>>(`/transactions${qs ? `?${qs}` : ''}`);
  },
  create(payload: Partial<TransactionDto>) {
    return apiFetch<SingleResponse<TransactionDto>>('/transactions', { method: 'POST', body: payload });
  },
  update(id: string, payload: Partial<TransactionDto>) {
    return apiFetch<SingleResponse<TransactionDto>>(`/transactions/${id}`, { method: 'PUT', body: payload });
  },
  remove(id: string) {
    return apiFetch<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' });
  }
};


