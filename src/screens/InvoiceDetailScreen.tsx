import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useNavigation, useRoute } from '@react-navigation/native';

import { InvoiceAPI } from '../api/endpoints';
import { getAccessToken, getErrorMessage } from '../api/client';
import { AppButton, Badge, Card, Loading, Screen } from '../components/ui';
import { colors, money, spacing, statusColor } from '../theme';
import type { Invoice } from '../types';

export default function InvoiceDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id: number = route.params.id;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [sharing, setSharing] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('');

  async function load() {
    try {
      const inv = await InvoiceAPI.get(id);
      setInvoice(inv);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function onShare() {
    if (!invoice) return;
    setSharing(true);
    try {
      const safeNo = invoice.invoice_number.replace(/[\\/]/g, '-');
      const fileUri = `${FileSystem.documentDirectory}invoice-${safeNo}.pdf`;
      const token = getAccessToken();
      const res = await FileSystem.downloadAsync(InvoiceAPI.pdfUrl(id), fileUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status !== 200) throw new Error('Could not generate the PDF');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(res.uri, {
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
          dialogTitle: `Invoice ${invoice.invoice_number}`,
        });
      } else {
        Alert.alert('Saved', `PDF saved to ${res.uri}`);
      }
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSharing(false);
    }
  }

  function openPayment() {
    if (!invoice) return;
    const due = Number(invoice.grand_total) - Number(invoice.amount_paid);
    setPayAmount(due > 0 ? String(due) : '');
    setPayMode('');
    setPayOpen(true);
  }

  async function submitPayment() {
    if (!invoice) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt < 0) {
      Alert.alert('Invalid amount');
      return;
    }
    try {
      const updated = await InvoiceAPI.recordPayment(id, {
        amount_paid: amt,
        payment_mode: payMode || undefined,
      });
      setInvoice(updated);
      setPayOpen(false);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  }

  function onDelete() {
    Alert.alert('Delete invoice?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await InvoiceAPI.remove(id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', getErrorMessage(e));
          }
        },
      },
    ]);
  }

  if (!invoice) return <Loading text="Loading invoice..." />;

  const sc = statusColor(invoice.payment_status);
  const due = Number(invoice.grand_total) - Number(invoice.amount_paid);

  return (
    <Screen>
      <Card>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.number}>{invoice.invoice_number}</Text>
            <Text style={styles.muted}>{invoice.invoice_date}</Text>
          </View>
          <Badge text={invoice.payment_status} fg={sc.fg} bg={sc.bg} />
        </View>
        <View style={styles.divider} />
        <Text style={styles.partyLabel}>Bill to</Text>
        <Text style={styles.partyName}>{invoice.party.name}</Text>
        {invoice.party.gstin ? <Text style={styles.muted}>GSTIN: {invoice.party.gstin}</Text> : null}
        {invoice.place_of_supply ? <Text style={styles.muted}>Place of supply: {invoice.place_of_supply}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Items</Text>
        {invoice.items.map((it) => (
          <View key={it.id} style={styles.itemRow}>
            <View style={styles.flex}>
              <Text style={styles.itemName}>{it.product_name}</Text>
              <Text style={styles.muted}>
                {it.years ? `${it.years} · ` : ''}{Number(it.quantity)} × {money(it.rate)}
                {Number(it.gst_rate) > 0 ? ` · GST ${Number(it.gst_rate)}%` : ''}
              </Text>
            </View>
            <Text style={styles.itemAmt}>{money(it.net_amount)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <TotalRow label="Taxable" value={money(invoice.total_taxable)} />
        {invoice.gst_type === 'inter_state' ? (
          <TotalRow label="IGST" value={money(invoice.total_igst)} />
        ) : invoice.gst_type === 'intra_state' ? (
          <>
            <TotalRow label="CGST" value={money(invoice.total_cgst)} />
            <TotalRow label="SGST" value={money(invoice.total_sgst)} />
          </>
        ) : null}
        <TotalRow label="Grand Total" value={money(invoice.grand_total)} strong />
        <View style={styles.divider} />
        <TotalRow label="Paid" value={money(invoice.amount_paid)} />
        <TotalRow label="Balance due" value={money(due)} />
      </Card>

      {invoice.amount_in_words ? (
        <Card>
          <Text style={styles.muted}>{invoice.amount_in_words}</Text>
        </Card>
      ) : null}

      <AppButton title={sharing ? 'Preparing PDF...' : 'Share / Download PDF'} onPress={onShare} loading={sharing} />
      {invoice.payment_status !== 'paid' ? (
        <AppButton title="Record Payment" variant="outline" onPress={openPayment} />
      ) : null}
      <AppButton title="Delete Invoice" variant="danger" onPress={onDelete} />

      <Modal visible={payOpen} transparent animationType="fade" onRequestClose={() => setPayOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setPayOpen(false)}>
          <Pressable style={styles.payCard}>
            <Text style={styles.cardTitle}>Record Payment</Text>
            <Text style={styles.label}>Amount received</Text>
            <TextInput style={styles.input} value={payAmount} onChangeText={setPayAmount} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} />
            <Text style={styles.label}>Mode (optional)</Text>
            <TextInput style={styles.input} value={payMode} onChangeText={setPayMode} placeholder="UPI / Cash / Bank" placeholderTextColor={colors.textMuted} />
            <View style={{ height: spacing.md }} />
            <AppButton title="Save payment" onPress={submitPayment} />
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && styles.totalStrong]}>{label}</Text>
      <Text style={[styles.totalValue, strong && styles.totalStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  number: { fontSize: 22, fontWeight: '800', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  partyLabel: { color: colors.textMuted, fontSize: 13 },
  partyName: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: spacing.sm },
  flex: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.text },
  itemAmt: { fontSize: 15, fontWeight: '700', color: colors.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { color: colors.textMuted, fontSize: 15 },
  totalValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  totalStrong: { fontSize: 18, fontWeight: '800', color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.lg },
  payCard: { backgroundColor: colors.card, borderRadius: 16, padding: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6, marginTop: spacing.sm },
  input: { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 16, color: colors.text },
});
