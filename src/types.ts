// Shared types mirroring the FastAPI backend schemas.

export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'company_staff'
  | 'collection_executive'
  | 'viewer';
export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type GstType = 'none' | 'intra_state' | 'inter_state';
export type DocumentType = 'invoice' | 'debit_memo' | 'credit_memo';
export type PaymentMode = 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';
export type FollowupType = 'call' | 'whatsapp' | 'visit' | 'other';
export type FollowupStatus = 'pending' | 'done';

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
  default_credit_days: number;
  financial_year_start?: string | null;
  financial_year_end?: string | null;
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
  credit_days: number;
  opening_balance: number;
}

export interface Item {
  id: number;
  company_id: number;
  name: string;
  hsn_code?: string | null;
  unit?: string | null;
  default_rate: number;
  default_gst_rate: number;
  description?: string | null;
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
  due_date?: string | null;
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
  due_date?: string | null;
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
  total_overdue: number;
  today_due: number;
  today_collection: number;
  month_collection: number;
  today_followups: number;
  pending_followups: number;
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
  credit_days?: number;
  opening_balance?: number;
}

export interface ItemInput {
  name: string;
  hsn_code?: string;
  unit?: string;
  default_rate?: number;
  default_gst_rate?: number;
  description?: string;
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
  due_date?: string;
  apply_gst?: boolean | null;
  note?: string;
  round_off?: number;
  items: NewInvoiceItem[];
}

export interface OutstandingInput {
  party_id: number;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  amount: number;
  remarks?: string;
}

// --- Collection (payments, follow-ups, reports) ---

export interface Payment {
  id: number;
  company_id: number;
  party_id: number;
  invoice_id?: number | null;
  amount: number;
  payment_date: string;
  mode: PaymentMode;
  reference_no?: string | null;
  remarks?: string | null;
}

export interface PaymentInput {
  party_id: number;
  invoice_id?: number | null;
  amount: number;
  payment_date?: string;
  mode?: PaymentMode;
  reference_no?: string;
  remarks?: string;
}

export interface Followup {
  id: number;
  company_id: number;
  party_id: number;
  invoice_id?: number | null;
  type: FollowupType;
  remarks?: string | null;
  followup_date: string;
  next_followup_date?: string | null;
  status: FollowupStatus;
  party_name?: string | null;
}

export interface FollowupInput {
  party_id: number;
  invoice_id?: number | null;
  type?: FollowupType;
  remarks?: string;
  followup_date?: string;
  next_followup_date?: string;
  status?: FollowupStatus;
}

export interface AgingBuckets {
  not_due: number;
  d1_30: number;
  d31_60: number;
  d61_90: number;
  d91_120: number;
  d120_plus: number;
  total: number;
}

export interface PartyAgingRow extends AgingBuckets {
  party_id: number;
  party_name: string;
}

export interface AgingReport {
  totals: AgingBuckets;
  parties: PartyAgingRow[];
}

export interface OutstandingPartyRow {
  party_id: number;
  party_name: string;
  phone?: string | null;
  city?: string | null;
  outstanding: number;
  overdue: number;
  oldest_due_date?: string | null;
}

export interface OutstandingReport {
  total_outstanding: number;
  total_overdue: number;
  parties: OutstandingPartyRow[];
}

export interface BillRow {
  invoice_id: number;
  invoice_number: string;
  party_id: number;
  party_name: string;
  invoice_date: string;
  due_date?: string | null;
  grand_total: number;
  amount_paid: number;
  balance: number;
  overdue_days: number;
}

export interface BillReport {
  total_balance: number;
  total_overdue: number;
  bills: BillRow[];
}

export interface LedgerEntry {
  date: string;
  kind: string;
  ref?: string | null;
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface PartyLedger {
  party_id: number;
  party_name: string;
  opening_balance: number;
  total_billed: number;
  total_paid: number;
  outstanding: number;
  entries: LedgerEntry[];
}

export interface CollectionRow {
  payment_id: number;
  payment_date: string;
  party_id: number;
  party_name: string;
  amount: number;
  mode: PaymentMode;
  reference_no?: string | null;
  invoice_number?: string | null;
}

export interface CollectionReport {
  from_date?: string | null;
  to_date?: string | null;
  total_collected: number;
  count: number;
  payments: CollectionRow[];
}

export interface CollectionSummary {
  total_outstanding: number;
  total_overdue: number;
  today_collection: number;
  month_collection: number;
  today_followups: number;
  pending_followups: number;
  total_parties: number;
  recent_payments: CollectionRow[];
  upcoming_followups: Followup[];
}

export interface WhatsAppMessage {
  party_id: number;
  party_name: string;
  phone?: string | null;
  outstanding: number;
  message: string;
  wa_link?: string | null;
}
