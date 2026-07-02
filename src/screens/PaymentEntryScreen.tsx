import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { InvoiceAPI, PaymentAPI, PartyAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { PartySelect } from '../components/PartySelect';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, money, radius, spacing } from '../theme';
import type { InvoiceSummary, Party, PaymentMode } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

const MODES: { key: PaymentMode; label: string }[] = [
  { key: 'cash', label: 'Cash' },
  { key: 'bank_transfer', label: 'Bank' },
  { key: 'upi', label: 'UPI' },
  { key: 'cheque', label: 'Cheque' },
  { key: 'card', label: 'Card' },
  { key: 'other', label: 'Other' },
];

export default function PaymentEntryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const prefillPartyId: number | undefined = route.params?.partyId;
  const prefillInvoiceId: number | undefined = route.params?.invoiceId;

  const [party, setParty] = useState<Party | null>(null);
  const [bills, setBills] = useState<InvoiceSummary[]>([]);
  const [bill, setBill] = useState<InvoiceSummary | null>(null);
  const [billPickerOpen, setBillPickerOpen] = useState(false);
  const [form, setForm] = useState({ amount: '', reference_no: '', payment_date: today(), remarks: '' });
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (prefillPartyId) PartyAPI.get(prefillPartyId).then(setParty).catch(() => {});
  }, [prefillPartyId]);

  // Load the party's unpaid bills so a payment can be applied to one.
  useEffect(() => {
    if (!party) {
      setBills([]);
      return;
    }
    InvoiceAPI.list({ party_id: party.id })
      .then((all) => {
        const unpaid = all.filter((b) => b.payment_status !== 'paid');
        setBills(unpaid);
        if (prefillInvoiceId) {
          const found = unpaid.find((b) => b.id === prefillInvoiceId);
          if (found) setBill(found);
        }
      })
      .catch(() => setBills([]));
  }, [party, prefillInvoiceId]);

  async function onSave() {
    setError(null);
    if (!party) return setError('Select a party');
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) return setError('Enter a valid amount');
    setSaving(true);
    try {
      await PaymentAPI.create({
        party_id: party.id,
        invoice_id: bill ? bill.id : null,
        amount: amt,
        mode,
        payment_date: form.payment_date || undefined,
        reference_no: form.reference_no || undefined,
        remarks: form.remarks || undefined,
      });
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Payment entry</Text>
        <PartySelect value={party} onChange={(p) => { setParty(p); setBill(null); }} label="Party *" />

        <Text style={styles.label}>Apply to bill (optional)</Text>
        <Pressable style={styles.select} onPress={() => party && setBillPickerOpen(true)}>
          <Text style={bill ? styles.selectText : styles.selectPlaceholder}>
            {bill ? `${bill.invoice_number} · bal ${money(Number(bill.grand_total) - Number(bill.amount_paid))}` : party ? 'On account (no specific bill)' : 'Select a party first'}
          </Text>
        </Pressable>

        <View style={{ height: spacing.md }} />
        <AppInput label="Amount received *" value={form.amount} onChangeText={set('amount')} keyboardType="decimal-pad" placeholder="0.00" />

        <Text style={styles.label}>Mode</Text>
        <View style={styles.modeRow}>
          {MODES.map((m) => (
            <Pressable
              key={m.key}
              style={[styles.chip, mode === m.key && styles.chipActive]}
              onPress={() => setMode(m.key)}
            >
              <Text style={[styles.chipText, mode === m.key && styles.chipTextActive]}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <AppInput label="Reference no." value={form.reference_no} onChangeText={set('reference_no')} placeholder="UPI / cheque / txn no." />
        <AppInput label="Payment date" value={form.payment_date} onChangeText={set('payment_date')} placeholder="YYYY-MM-DD" />
        <AppInput label="Remarks" value={form.remarks} onChangeText={set('remarks')} multiline />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Save payment" onPress={onSave} loading={saving} />
      </Card>

      <Modal visible={billPickerOpen} transparent animationType="slide" onRequestClose={() => setBillPickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setBillPickerOpen(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.title}>Select bill</Text>
            <Pressable style={styles.row} onPress={() => { setBill(null); setBillPickerOpen(false); }}>
              <Text style={styles.rowText}>On account (no bill)</Text>
            </Pressable>
            <FlatList
              data={bills}
              keyExtractor={(b) => String(b.id)}
              ListEmptyComponent={<Text style={styles.selectPlaceholder}>No unpaid bills.</Text>}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => { setBill(item); setBillPickerOpen(false); }}>
                  <Text style={styles.rowText}>{item.invoice_number}</Text>
                  <Text style={styles.selectPlaceholder}>
                    {item.invoice_date} · balance {money(Number(item.grand_total) - Number(item.amount_paid))}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  select: {
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  selectText: { fontSize: 15, color: colors.text },
  selectPlaceholder: { fontSize: 15, color: colors.textMuted },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBg,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  error: { color: colors.danger, marginBottom: spacing.sm },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, maxHeight: '70%' },
  row: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { fontSize: 16, fontWeight: '600', color: colors.text },
});
