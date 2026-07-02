import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ReportAPI } from '../api/endpoints';
import { AppButton, AppInput, EmptyState } from '../components/ui';
import { colors, money, radius, spacing } from '../theme';
import type { CollectionReport } from '../types';

const MODE_LABEL: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank', upi: 'UPI', cheque: 'Cheque', card: 'Card', other: 'Other',
};

export default function CollectionReportScreen() {
  const [data, setData] = useState<CollectionReport | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback((f?: string, t?: string) => {
    ReportAPI.collection({ from_date: f || undefined, to_date: t || undefined })
      .then(setData)
      .catch(() => setData(null));
  }, []);

  useFocusEffect(useCallback(() => { load(from, to); }, [load])); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.filterRow}>
          <View style={styles.flex}>
            <AppInput label="From" value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" />
          </View>
          <View style={styles.flex}>
            <AppInput label="To" value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" />
          </View>
        </View>
        <AppButton title="Apply filter" variant="outline" onPress={() => load(from, to)} />
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total collected ({data?.count ?? 0})</Text>
          <Text style={styles.totalValue}>{money(data?.total_collected ?? 0)}</Text>
        </View>
      </View>

      <FlatList
        data={data?.payments ?? []}
        keyExtractor={(p) => String(p.payment_id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState title="No collections" subtitle="No payments in this range." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.party_name}</Text>
              <Text style={styles.sub}>
                {item.payment_date} · {MODE_LABEL[item.mode] ?? item.mode}
                {item.reference_no ? ` · ${item.reference_no}` : ''}
                {item.invoice_number ? ` · ${item.invoice_number}` : ''}
              </Text>
            </View>
            <Text style={styles.amt}>{money(item.amount)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  filterRow: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  totalBox: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.sm },
  totalLabel: { color: colors.textMuted, fontSize: 13 },
  totalValue: { fontSize: 22, fontWeight: '800', color: colors.success },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  amt: { fontSize: 16, fontWeight: '800', color: colors.success },
});
