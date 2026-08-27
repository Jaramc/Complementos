import axios from 'axios';
import type { CreateKbArticleRequest, KbArticle, RagSearchResponse, Ticket, TicketPriority, TicketStatus } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('pqrs_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as { token?: string };
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      localStorage.removeItem('pqrs_user');
    }
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('pqrs_user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  },
);

export const ticketsApi = {
  list: async (params?: { status?: TicketStatus; priority?: TicketPriority; page?: number; pageSize?: number }) => {
    const response = await client.get<Ticket[]>('/tickets', { params });
    return response.data;
  },
  updateStatus: async (id: string, status: TicketStatus) => {
    const response = await client.patch<Ticket>(`/tickets/${id}/status`, { status });
    return response.data;
  },
};

export const kbApi = {
  list: async () => {
    const response = await client.get<KbArticle[]>('/kb-articles');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await client.get<KbArticle>(`/kb-articles/${id}`);
    return response.data;
  },
  create: async (data: CreateKbArticleRequest) => {
    const response = await client.post<KbArticle>('/kb-articles', data);
    return response.data;
  },
  delete: async (id: string) => {
    await client.delete(`/kb-articles/${id}`);
  },
};

export const ragApi = {
  search: async (query: string, tenantId?: string) => {
    const headers = tenantId ? { 'X-Tenant-Id': tenantId } : undefined;
    const response = await client.post<RagSearchResponse>('/widget/rag-search', { query }, { headers });
    return response.data;
  },
};

export default client;
