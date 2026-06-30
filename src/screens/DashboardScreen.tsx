import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from '../auth/AuthContext';
import { DashboardAPI, CompanyAPI } from '../api/endpoints';
import { AppButton, Badge, Card } from '../components/ui';
import { colors, money, spacing } from '../theme';
import type { Dashboard, SubscriptionInfo } from '../types';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { company, user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, s] = await Promise.all([DashboardAPI.get(), CompanyAPI.subscription()]);
      setData(d);
      setSub(s);
    } catch {
      // ignore — pull to refresh to retry
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
      <Text style={styles.hello}>Hi, {user?.full_name?.split(' ')[0] || 'there'}</Text>
      <Text style={styles.company}>{company?.name}</Text>

      {sub ? (
        <Card style={styles.subCard}>
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>Subscription</Text>
            <Badge
              text={sub.is_active ? 'Active' : 'Inactive'}
              fg={sub.is_active ? colors.success : colors.danger}
              bg={sub.is_active ? colors.successBg : colors.dangerBg}
            />
          </View>
          <Text style={styles.subText}>
            {sub.is_active && sub.days_remaining != null
              ? `${sub.days_remaining} days remaining (${sub.current?.cycle})`
              : 'No active plan — ask the admin to activate a subscription to create bills.'}
          </Text>
        </Card>
      ) : null}

      <AppButton title="+ Create New Bill" onPress={() => navigation.navigate('CreateInvoice')} />

      <View style={styles.grid}>
        <Stat label="Total Billed" value={money(data?.total_billed ?? 0)} color={colors.primary} />
        <Stat label="Received" value={money(data?.total_received ?? 0)} color={colors.success} />
        <Stat label="Outstanding" value={money(data?.total_outstanding ?? 0)} color={colors.danger} />
        <Stat label="Invoices" value={String(data?.total_invoices ?? 0)} color={colors.text} />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Payment status</Text>
        <Row label="Paid" value={data?.paid_count ?? 0} fg={colors.success} bg={colors.successBg} />
        <Row label="Partial" value={data?.partial_count ?? 0} fg={colors.warning} bg={colors.warningBg} />
        <Row label="Pending" value={data?.pending_count ?? 0} fg={colors.danger} bg={colors.dangerBg} />
        <View style={styles.divider} />
        <Row label="Total parties" value={data?.total_parties ?? 0} fg={colors.textMuted} bg={colors.bg} />
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </Card>
  );
}

function Row({ label, value, fg, bg }: { label: string; value: number; fg: string; bg: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Badge text={String(value)} fg={fg} bg={bg} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  hello: { fontSize: 16, color: colors.textMuted },
  company: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  subCard: { paddingVertical: spacing.md },
  subRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  subLabel: { fontWeight: '700', color: colors.text },
  subText: { color: colors.textMuted, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  stat: { width: '47%', flexGrow: 1, paddingVertical: spacing.md },
  statLabel: { color: colors.textMuted, fontSize: 13 },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  statusLabel: { color: colors.text, fontSize: 15 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
});
