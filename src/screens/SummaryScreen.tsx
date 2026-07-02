import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ReportAPI } from '../api/endpoints';
import { Card } from '../components/ui';
import { colors, money, spacing } from '../theme';
import type { CollectionSummary } from '../types';

export default function SummaryScreen() {
  const [data, setData] = useState<CollectionSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    return ReportAPI.summary().then(setData).catch(() => setData(null));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.grid}>
        <Stat label="Outstanding" value={money(data?.total_outstanding ?? 0)} color={colors.danger} />
        <Stat label="Overdue" value={money(data?.total_overdue ?? 0)} color={colors.warning} />
        <Stat label="Today collection" value={money(data?.today_collection ?? 0)} color={colors.success} />
        <Stat label="This month" value={money(data?.month_collection ?? 0)} color={colors.primary} />
        <Stat label="Today follow-ups" value={String(data?.today_followups ?? 0)} color={colors.text} />
        <Stat label="Pending follow-ups" value={String(data?.pending_followups ?? 0)} color={colors.text} />
      </View>

      <Card>
        <Text style={styles.title}>Recent payments</Text>
        {(data?.recent_payments ?? []).length === 0 ? (
          <Text style={styles.muted}>No payments yet.</Text>
        ) : (
          data!.recent_payments.map((p) => (
            <View key={p.payment_id} style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.name}>{p.party_name}</Text>
                <Text style={styles.muted}>{p.payment_date}{p.invoice_number ? ` · ${p.invoice_number}` : ''}</Text>
              </View>
              <Text style={styles.amtGood}>{money(p.amount)}</Text>
            </View>
          ))
        )}
      </Card>

      <Card>
        <Text style={styles.title}>Upcoming follow-ups</Text>
        {(data?.upcoming_followups ?? []).length === 0 ? (
          <Text style={styles.muted}>Nothing due.</Text>
        ) : (
          data!.upcoming_followups.map((f) => (
            <View key={f.id} style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.name}>{f.party_name ?? `Party #${f.party_id}`}</Text>
                <Text style={styles.muted}>{f.remarks ?? f.type}</Text>
              </View>
              <Text style={styles.due}>{f.next_followup_date}</Text>
            </View>
          ))
        )}
      </Card>
      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { width: '47%', flexGrow: 1, paddingVertical: spacing.md },
  statLabel: { color: colors.textMuted, fontSize: 13 },
  statValue: { fontSize: 19, fontWeight: '800', marginTop: 4 },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  amtGood: { fontSize: 15, fontWeight: '800', color: colors.success },
  due: { fontSize: 13, fontWeight: '700', color: colors.warning },
});
