import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Tabs: undefined;
  CreateInvoice: undefined;
  InvoiceDetail: { id: number };
  PartyForm: { id?: number } | undefined;
  ItemForm: { id?: number } | undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Invoices: undefined;
  Parties: undefined;
  Items: undefined;
  Settings: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
