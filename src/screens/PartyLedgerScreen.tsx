import React, { useCallback, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import { ReportAPI, WhatsAppAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { AppButton, Card, Loading, Screen } from '../components/ui';
import { colors, money, spacing } from '../theme';
import type { PartyLedger } from '../types';

export default function PartyLedgerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const partyId: number = route.params.partyId;
  const [ledger, setLedger] = useState<PartyLedger | null>(null);

  const load = useCallback(() => {
    ReportAPI.ledger(partyId).then(setLedger).catch((e) => Alert.alert('Error', getErrorMessage(e)));
  }, [partyId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onWhatsApp() {
    try {
      const msg = await WhatsAppAPI.reminder(partyId);
      if (!msg.wa_link) {
        Alert.alert('No phone', 'This party has no valid phone number for WhatsApp.');
        return;
      }
      const ok = await Linking.canOpenURL(msg.wa_link);
      if (ok) Linking.openURL(msg.wa_link);
      else Alert.alert('WhatsApp not available', msg.message);
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  }

  if (!ledger) return <Loading text="Loading ledger..." />;

  return (
    <Screen>
      <Card>
        <Text style={styles.name}>{ledger.party_name}</Text>
        <View style={styles.divider} />
        <Row label="Opening balance" value={money(ledger.opening_balance)} />
        <Row label="Total billed" value={money(ledger.total_billed)} />
        <Row label="Total paid" value={money(ledger.total_paid)} fg={colors.success} />
        <View style={styles.divider} />
        <Row label="Outstanding" value={money(ledger.outstanding)} strong fg={colors.danger} />
      </Card>

      <View style={styles.actions}>
        <View style={styles.flex}>
          <AppButton title="Reminder" variant="outline" onPress={onWhatsApp} />
        </View>
        <View style={styles.flex}>
          <AppButton title="+ Payment" onPress={() => navigation.navigate('PaymentEntry', { partyId })} />
        </View>
      </View>
      <AppButton title="+ Follow-up" variant="outline" onPress={() => navigation.navigate('FollowupForm', { partyId })} />

      <Card>
        <Text style={styles.cardTitle}>Transactions</Text>
        {ledger.entries.length === 0 ? (
          <Text style={styles.muted}>No transactions yet.</Text>
        ) : (
          ledger.entries.map((e, i) => (
            <View key={i} style={styles.entry}>
              <View style={styles.flex}>
                <Text style={styles.entryTitle}>{e.particulars}</Text>
                <Text style={styles.muted}>{e.date}{e.ref ? ` · ${e.ref}` : ''}</Text>
              </View>
              <View style={styles.entryAmts}>
                <Text style={[styles.amt, { color: e.credit > 0 ? colors.success : colors.text }]}>
                  {e.credit > 0 ? `- ${money(e.credit)}` : money(e.debit)}
                </Text>
                <Text style={styles.balance}>bal {money(e.balance)}</Text>
              </View>
            </View>
          ))
        )}
      </Card>
    </Screen>
  );
}

function Row({ label, value, strong, fg }: { label: string; value: string; strong?: boolean; fg?: string }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.strong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.strong, fg ? { color: fg } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { color: colors.textMuted, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  strong: { fontSize: 18, fontWeight: '800', color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  muted: { color: colors.textMuted, fontSize: 13 },
  entry: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  entryTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  entryAmts: { alignItems: 'flex-end' },
  amt: { fontSize: 14, fontWeight: '700' },
  balance: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});
