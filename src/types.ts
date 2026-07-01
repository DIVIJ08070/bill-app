// Shared types mirroring the FastAPI backend schemas.

export type UserRole = 'super_admin' | 'company_admin' | 'company_staff';
export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type GstType = 'none' | 'intra_state' | 'inter_state';
export type DocumentType = 'invoice' | 'debit_memo' | 'credit_memo';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  company_id?: number | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface Company {
  id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  state_code?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  pan?: string | null;
  logo_base64?: string | null;
  signature_base64?: string | null;
  stamp_base64?: string | null;
  payment_qr_base64?: string | null;
  bank_name?: string | null;
  bank_account_no?: string | null;
  bank_ifsc?: string | null;
  upi_number?: string | null;
  invoice_prefix: string;
  next_invoice_number: number;
  default_note?: string | null;
  is_active: boolean;
}

export interface Party {
  id: number;
  company_id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  state_code?: string | null;
  place_of_supply?: string | null;
  gstin?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface InvoiceItem {
  id: number;
  sr_no: number;
  product_name: string;
  years?: string | null;
  quantity: number;
  rate: number;
  taxable_amount: number;
  gst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  tax_amount: number;
  net_amount: number;
}

export interface InvoiceSummary {
  id: number;
  invoice_number: string;
  invoice_date: string;
  party_id: number;
  grand_total: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  document_type: DocumentType;
}

export interface Invoice {
  id: number;
  company_id: number;
  party_id: number;
  invoice_number: string;
  invoice_date: string;
  document_type: DocumentType;
  copy_type: string;
  place_of_supply?: string | null;
  gst_type: GstType;
  total_taxable: number;
  total_cgst: number;
  total_sgst: number;
  total_igst: number;
  total_tax: number;
  round_off: number;
  grand_total: number;
  amount_in_words?: string | null;
  note?: string | null;
  payment_status: PaymentStatus;
  amount_paid: number;
  payment_date?: string | null;
  payment_mode?: string | null;
  party: Party;
  items: InvoiceItem[];
}

export interface Dashboard {
  total_invoices: number;
  total_billed: number;
  total_received: number;
  total_outstanding: number;
  paid_count: number;
  partial_count: number;
  pending_count: number;
  total_parties: number;
}

export interface SubscriptionInfo {
  is_active: boolean;
  current: {
    id: number;
    cycle: string;
    start_date: string;
    end_date: string;
    status: string;
  } | null;
  days_remaining: number | null;
}

// --- Input payloads ---

export interface RegisterPayload {
  company_name: string;
  address?: string;
  city?: string;
  state?: string;
  state_code?: string;
  pincode?: string;
  phone?: string;
  gstin?: string;
  admin_name: string;
  email: string;
  password: string;
}

export interface PartyInput {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  state_code?: string;
  place_of_supply?: string;
  gstin?: string;
  phone?: string;
  email?: string;
}

export interface NewInvoiceItem {
  product_name: string;
  years?: string;
  quantity: number;
  rate: number;
  gst_rate?: number;
}

export interface NewInvoice {
  party_id: number;
  invoice_date?: string;
  apply_gst?: boolean | null;
  note?: string;
  round_off?: number;
  items: NewInvoiceItem[];
}
