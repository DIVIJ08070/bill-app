import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { InvoiceAPI, PartyAPI } from '../api/endpoints';
import { Badge, EmptyState } from '../components/ui';
import { colors, money, radius, spacing, statusColor } from '../theme';
import type { InvoiceSummary, PaymentStatus } from '../types';

const FILTERS: { label: string; value?: PaymentStatus }[] = [
  { label: 'All' },
  { label: 'Pending', value: 'pending' },
  { label: 'Partial', value: 'partial' },
  { label: 'Paid', value: 'paid' },
];

export default function InvoicesScreen() {
  const navigation = useNavigation<any>();
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [partyNames, setPartyNames] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<PaymentStatus | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (status?: PaymentStatus) => {
    try {
      const [inv, parties] = await Promise.all([
        InvoiceAPI.list(status ? { payment_status: status } : undefined),
        PartyAPI.list(),
      ]);
      setInvoices(inv);
      const map: Record<number, string> = {};
      parties.forEach((p) => (map[p.id] = p.name));
      setPartyNames(map);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filter);
    }, [load, filter])
  );

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={invoices}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : <EmptyState title="No invoices" subtitle="Tap + to create your first bill." />
        }
        renderItem={({ item }) => {
          const sc = statusColor(item.payment_status);
          return (
            <Pressable
              style={styles.row}
              onPress={() => navigation.navigate('InvoiceDetail', { id: item.id })}
            >
              <View style={styles.flex}>
                <Text style={styles.number}>{item.invoice_number}</Text>
                <Text style={styles.party} numberOfLines={1}>
                  {partyNames[item.party_id] || 'Party'}
                </Text>
                <Text style={styles.date}>{item.invoice_date}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.amount}>{money(item.grand_total)}</Text>
                <Badge text={item.payment_status} fg={sc.fg} bg={sc.bg} />
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('CreateInvoice')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filters: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  flex: { flex: 1 },
  number: { fontSize: 16, fontWeight: '800', color: colors.text },
  party: { color: colors.text, marginTop: 2 },
  date: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 16, fontWeight: '800', color: colors.text },
  fab: {
    position: 'absolute', right: spacing.lg, bottom: spacing.xl,
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
});
