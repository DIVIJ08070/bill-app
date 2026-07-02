import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { ReportAPI } from '../api/endpoints';
import { Badge, EmptyState } from '../components/ui';
import { colors, money, radius, spacing } from '../theme';
import type { BillReport } from '../types';

export default function OverdueReportScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<BillReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    ReportAPI.overdue().then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.screen}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total overdue</Text>
        <Text style={styles.summaryValue}>{money(data?.total_overdue ?? 0)}</Text>
      </View>
      <FlatList
        data={data?.bills ?? []}
        keyExtractor={(b) => String(b.invoice_id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={loading ? null : <EmptyState title="Nothing overdue" subtitle="No bills are past their due date." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('InvoiceDetail', { id: item.invoice_id })}>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.party_name}</Text>
              <Text style={styles.sub}>{item.invoice_number} · due {item.due_date ?? '—'}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.amt}>{money(item.balance)}</Text>
              <Badge text={`${item.overdue_days}d`} fg={colors.danger} bg={colors.dangerBg} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  summary: { padding: spacing.lg, paddingBottom: spacing.sm },
  summaryLabel: { color: colors.textMuted, fontSize: 13 },
  summaryValue: { fontSize: 26, fontWeight: '800', color: colors.danger },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  amt: { fontSize: 16, fontWeight: '800', color: colors.text },
});
