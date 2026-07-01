import { api } from './client';
import { API_BASE_URL } from './config';
import type {
  AuthResponse,
  Company,
  Dashboard,
  Invoice,
  InvoiceSummary,
  Item,
  ItemInput,
  NewInvoice,
  Party,
  PartyInput,
  PaymentStatus,
  RegisterPayload,
  SubscriptionInfo,
  User,
} from '../types';

export const AuthAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register-company', payload).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

export const CompanyAPI = {
  get: () => api.get<Company>('/company').then((r) => r.data),
  update: (payload: Partial<Company>) =>
    api.patch<Company>('/company', payload).then((r) => r.data),
  updateBranding: (payload: {
    logo_base64?: string;
    signature_base64?: string;
    stamp_base64?: string;
    payment_qr_base64?: string;
  }) => api.put<Company>('/company/branding', payload).then((r) => r.data),
  subscription: () =>
    api.get<SubscriptionInfo>('/company/subscription').then((r) => r.data),
};

export const PartyAPI = {
  list: (search?: string) =>
    api
      .get<Party[]>('/parties', { params: search ? { search } : {} })
      .then((r) => r.data),
  get: (id: number) => api.get<Party>(`/parties/${id}`).then((r) => r.data),
  create: (payload: PartyInput) =>
    api.post<Party>('/parties', payload).then((r) => r.data),
  update: (id: number, payload: PartyInput) =>
    api.patch<Party>(`/parties/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/parties/${id}`).then((r) => r.data),
};

export const ItemAPI = {
  list: (search?: string) =>
    api
      .get<Item[]>('/items', { params: search ? { search } : {} })
      .then((r) => r.data),
  get: (id: number) => api.get<Item>(`/items/${id}`).then((r) => r.data),
  create: (payload: ItemInput) =>
    api.post<Item>('/items', payload).then((r) => r.data),
  update: (id: number, payload: ItemInput) =>
    api.patch<Item>(`/items/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/items/${id}`).then((r) => r.data),
};

export const InvoiceAPI = {
  list: (params?: { payment_status?: PaymentStatus; party_id?: number }) =>
    api.get<InvoiceSummary[]>('/invoices', { params }).then((r) => r.data),
  get: (id: number) => api.get<Invoice>(`/invoices/${id}`).then((r) => r.data),
  create: (payload: NewInvoice) =>
    api.post<Invoice>('/invoices', payload).then((r) => r.data),
  recordPayment: (
    id: number,
    payload: { amount_paid: number; payment_mode?: string; payment_date?: string }
  ) => api.post<Invoice>(`/invoices/${id}/payment`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/invoices/${id}`).then((r) => r.data),
  pdfUrl: (id: number) => `${API_BASE_URL}/invoices/${id}/pdf`,
};

export const DashboardAPI = {
  get: () => api.get<Dashboard>('/dashboard').then((r) => r.data),
};
