import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, radius, spacing } from '../theme';

type Item = {
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: string;
  color: string;
};

const ACTIONS: Item[] = [
  { label: 'Add Outstanding', desc: 'Enter a bill due from a party', icon: 'add-circle-outline', screen: 'OutstandingEntry', color: colors.primary },
  { label: 'Add Payment', desc: 'Record money collected', icon: 'cash-outline', screen: 'PaymentEntry', color: colors.success },
  { label: 'Follow-ups', desc: 'Calls, WhatsApp & visits', icon: 'call-outline', screen: 'Followups', color: colors.warning },
];

const REPORTS: Item[] = [
  { label: 'Summary', desc: 'One-page overview', icon: 'grid-outline', screen: 'Summary', color: colors.primary },
  { label: 'Outstanding Report', desc: 'Party-wise dues', icon: 'people-outline', screen: 'OutstandingReport', color: colors.danger },
  { label: 'Overdue Report', desc: 'Bills past due date', icon: 'alarm-outline', screen: 'OverdueReport', color: colors.warning },
  { label: 'Aging Report', desc: '30 / 60 / 90 / 120 days', icon: 'hourglass-outline', screen: 'AgingReport', color: colors.primary },
  { label: 'Collection Report', desc: 'Payments received', icon: 'wallet-outline', screen: 'CollectionReport', color: colors.success },
];

export default function CollectionScreen() {
  const navigation = useNavigation<any>();

  const renderCard = (item: Item) => (
    <Pressable key={item.label} style={styles.card} onPress={() => navigation.navigate(item.screen)}>
      <View style={[styles.iconWrap, { backgroundColor: item.color + '22' }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{item.label}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.section}>Quick actions</Text>
      {ACTIONS.map(renderCard)}
      <Text style={styles.section}>Reports</Text>
      {REPORTS.map(renderCard)}
      <View style={{ height: spacing.lg }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.sm },
  section: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', marginTop: spacing.md, marginBottom: spacing.xs },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardDesc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
