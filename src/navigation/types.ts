import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Tabs: undefined;
  CreateInvoice: undefined;
  InvoiceDetail: { id: number };
  PartyForm: { id?: number } | undefined;
  ItemForm: { id?: number } | undefined;
  OutstandingEntry: undefined;
  PaymentEntry: { partyId?: number; invoiceId?: number } | undefined;
  Followups: undefined;
  FollowupForm: { partyId?: number } | undefined;
  PartyLedger: { partyId: number };
  OutstandingReport: undefined;
  AgingReport: undefined;
  OverdueReport: undefined;
  CollectionReport: undefined;
  Summary: undefined;
  UserManagement: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Invoices: undefined;
  Parties: undefined;
  Items: undefined;
  Collection: undefined;
  Settings: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
