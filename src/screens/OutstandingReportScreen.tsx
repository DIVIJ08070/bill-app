import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { ReportAPI } from '../api/endpoints';
import { EmptyState } from '../components/ui';
import { colors, money, radius, spacing } from '../theme';
import type { OutstandingReport } from '../types';

export default function OutstandingReportScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<OutstandingReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    ReportAPI.outstanding()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.screen}>
      <View style={styles.summary}>
        <Stat label="Outstanding" value={money(data?.total_outstanding ?? 0)} color={colors.danger} />
        <Stat label="Overdue" value={money(data?.total_overdue ?? 0)} color={colors.warning} />
      </View>
      <FlatList
        data={data?.parties ?? []}
        keyExtractor={(p) => String(p.party_id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={loading ? null : <EmptyState title="Nothing outstanding" subtitle="All dues are cleared." />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => navigation.navigate('PartyLedger', { partyId: item.party_id })}>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.party_name}</Text>
              <Text style={styles.sub}>
                {[item.city, item.phone].filter(Boolean).join(' · ') || 'No details'}
                {item.overdue > 0 ? ` · overdue ${money(item.overdue)}` : ''}
              </Text>
            </View>
            <Text style={styles.amt}>{money(item.outstanding)}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  summary: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, paddingBottom: spacing.sm },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  statLabel: { color: colors.textMuted, fontSize: 13 },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  flex: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  amt: { fontSize: 16, fontWeight: '800', color: colors.danger },
});
