import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { InvoiceAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { PartySelect } from '../components/PartySelect';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, spacing } from '../theme';
import type { Party } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

export default function OutstandingEntryScreen() {
  const navigation = useNavigation<any>();
  const [party, setParty] = useState<Party | null>(null);
  const [form, setForm] = useState({
    invoice_number: '',
    invoice_date: today(),
    due_date: '',
    amount: '',
    remarks: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSave() {
    setError(null);
    if (!party) return setError('Select a party');
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) return setError('Enter a valid bill amount');
    setSaving(true);
    try {
      const inv = await InvoiceAPI.createOutstanding({
        party_id: party.id,
        invoice_number: form.invoice_number || undefined,
        invoice_date: form.invoice_date || undefined,
        due_date: form.due_date || undefined,
        amount: amt,
        remarks: form.remarks || undefined,
      });
      navigation.replace('InvoiceDetail', { id: inv.id });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Outstanding entry</Text>
        <Text style={styles.hint}>Record a bill amount due from a party (no GST line items).</Text>
        <PartySelect value={party} onChange={setParty} label="Party *" />
        <AppInput label="Bill / Invoice No (optional)" value={form.invoice_number} onChangeText={set('invoice_number')} placeholder="Auto if empty" />
        <AppInput label="Invoice date" value={form.invoice_date} onChangeText={set('invoice_date')} placeholder="YYYY-MM-DD" />
        <AppInput label="Due date (optional — auto from credit days)" value={form.due_date} onChangeText={set('due_date')} placeholder="YYYY-MM-DD" />
        <AppInput label="Bill amount *" value={form.amount} onChangeText={set('amount')} keyboardType="decimal-pad" placeholder="50000" />
        <AppInput label="Remarks" value={form.remarks} onChangeText={set('remarks')} multiline />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Save outstanding" onPress={onSave} loading={saving} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  hint: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.md },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
