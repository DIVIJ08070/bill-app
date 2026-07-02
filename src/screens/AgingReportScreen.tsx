import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ReportAPI } from '../api/endpoints';
import { Card, Loading } from '../components/ui';
import { colors, money, spacing } from '../theme';
import type { AgingBuckets, AgingReport } from '../types';

const BUCKETS: { key: keyof AgingBuckets; label: string }[] = [
  { key: 'not_due', label: 'Not due' },
  { key: 'd1_30', label: '1–30 days' },
  { key: 'd31_60', label: '31–60 days' },
  { key: 'd61_90', label: '61–90 days' },
  { key: 'd91_120', label: '91–120 days' },
  { key: 'd120_plus', label: '120+ days' },
];

export default function AgingReportScreen() {
  const [data, setData] = useState<AgingReport | null>(null);

  const load = useCallback(() => {
    ReportAPI.aging().then(setData).catch(() => setData(null));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!data) return <Loading text="Loading aging..." />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Aging summary</Text>
        {BUCKETS.map((b) => (
          <View key={b.key} style={styles.bucketRow}>
            <Text style={styles.bucketLabel}>{b.label}</Text>
            <Text style={[styles.bucketValue, b.key === 'd120_plus' && data.totals[b.key] > 0 ? { color: colors.danger } : null]}>
              {money(data.totals[b.key])}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.bucketRow}>
          <Text style={styles.totalLabel}>Total outstanding</Text>
          <Text style={styles.totalValue}>{money(data.totals.total)}</Text>
        </View>
      </Card>

      <Text style={styles.section}>By party</Text>
      {data.parties.map((p) => (
        <Card key={p.party_id} style={styles.partyCard}>
          <View style={styles.partyHeader}>
            <Text style={styles.partyName}>{p.party_name}</Text>
            <Text style={styles.partyTotal}>{money(p.total)}</Text>
          </View>
          <Text style={styles.partyBreakdown}>
            {BUCKETS.filter((b) => p[b.key] > 0).map((b) => `${b.label}: ${money(p[b.key])}`).join('   ')}
          </Text>
        </Card>
      ))}
      {data.parties.length === 0 ? <Text style={styles.muted}>No outstanding bills.</Text> : null}
      <View style={{ height: spacing.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  bucketRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  bucketLabel: { color: colors.textMuted, fontSize: 15 },
  bucketValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalLabel: { fontSize: 16, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.danger },
  section: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  partyCard: { paddingVertical: spacing.md },
  partyHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  partyName: { fontSize: 15, fontWeight: '700', color: colors.text },
  partyTotal: { fontSize: 15, fontWeight: '800', color: colors.text },
  partyBreakdown: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  muted: { color: colors.textMuted, textAlign: 'center' },
});
