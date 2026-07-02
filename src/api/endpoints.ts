import { api } from './client';
import { API_BASE_URL } from './config';
import type {
  AgingReport,
  AuthResponse,
  BillReport,
  CollectionReport,
  CollectionSummary,
  Company,
  Dashboard,
  Followup,
  FollowupInput,
  FollowupStatus,
  Invoice,
  InvoiceSummary,
  Item,
  ItemInput,
  NewInvoice,
  OutstandingInput,
  Party,
  PartyInput,
  PartyLedger,
  Payment,
  PaymentInput,
  PaymentStatus,
  OutstandingReport,
  RegisterPayload,
  SubscriptionInfo,
  User,
  WhatsAppMessage,
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
  listStaff: () => api.get<User[]>('/company/staff').then((r) => r.data),
  addStaff: (payload: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
  }) => api.post<User>('/company/staff', payload).then((r) => r.data),
  updateStaff: (
    id: number,
    payload: { full_name?: string; phone?: string; role?: string; is_active?: boolean }
  ) => api.patch<User>(`/company/staff/${id}`, payload).then((r) => r.data),
  setStaffActive: (id: number, is_active: boolean) =>
    api.patch<User>(`/company/staff/${id}/active`, null, { params: { is_active } }).then((r) => r.data),
  backup: () => api.get('/company/backup').then((r) => r.data),
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
  createOutstanding: (payload: OutstandingInput) =>
    api.post<Invoice>('/invoices/outstanding', payload).then((r) => r.data),
  recordPayment: (
    id: number,
    payload: { amount_paid: number; payment_mode?: string; payment_date?: string }
  ) => api.post<Invoice>(`/invoices/${id}/payment`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/invoices/${id}`).then((r) => r.data),
  pdfUrl: (id: number) => `${API_BASE_URL}/invoices/${id}/pdf`,
};

export const PaymentAPI = {
  list: (params?: { party_id?: number; invoice_id?: number }) =>
    api.get<Payment[]>('/payments', { params }).then((r) => r.data),
  create: (payload: PaymentInput) =>
    api.post<Payment>('/payments', payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/payments/${id}`).then((r) => r.data),
};

export const FollowupAPI = {
  list: (params?: { party_id?: number; status?: FollowupStatus }) =>
    api.get<Followup[]>('/followups', { params }).then((r) => r.data),
  due: () => api.get<Followup[]>('/followups/due').then((r) => r.data),
  create: (payload: FollowupInput) =>
    api.post<Followup>('/followups', payload).then((r) => r.data),
  update: (id: number, payload: Partial<FollowupInput>) =>
    api.patch<Followup>(`/followups/${id}`, payload).then((r) => r.data),
  remove: (id: number) => api.delete(`/followups/${id}`).then((r) => r.data),
};

export const ReportAPI = {
  summary: () => api.get<CollectionSummary>('/reports/summary').then((r) => r.data),
  aging: () => api.get<AgingReport>('/reports/aging').then((r) => r.data),
  outstanding: () => api.get<OutstandingReport>('/reports/outstanding').then((r) => r.data),
  bills: (overdueOnly = false) =>
    api.get<BillReport>('/reports/bills', { params: { overdue_only: overdueOnly } }).then((r) => r.data),
  overdue: () => api.get<BillReport>('/reports/overdue').then((r) => r.data),
  collection: (params?: { from_date?: string; to_date?: string }) =>
    api.get<CollectionReport>('/reports/collection', { params }).then((r) => r.data),
  ledger: (partyId: number) =>
    api.get<PartyLedger>(`/reports/ledger/${partyId}`).then((r) => r.data),
};

export const WhatsAppAPI = {
  reminder: (partyId: number) =>
    api.get<WhatsAppMessage>(`/whatsapp/reminder/${partyId}`).then((r) => r.data),
};

export const DashboardAPI = {
  get: () => api.get<Dashboard>('/dashboard').then((r) => r.data),
};
