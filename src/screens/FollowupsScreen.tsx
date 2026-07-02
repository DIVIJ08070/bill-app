import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { FollowupAPI } from '../api/endpoints';
import { Badge, EmptyState } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import type { Followup } from '../types';

const TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  call: 'call-outline',
  whatsapp: 'logo-whatsapp',
  visit: 'walk-outline',
  other: 'chatbox-ellipses-outline',
};

export default function FollowupsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'all' | 'due'>('all');
  const [rows, setRows] = useState<Followup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (which: 'all' | 'due') => {
    setLoading(true);
    try {
      const data = which === 'due' ? await FollowupAPI.due() : await FollowupAPI.list();
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(tab);
    }, [load, tab])
  );

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {(['all', 'due'] as const).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'all' ? 'All' : 'Due'}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={rows}
        keyExtractor={(f) => String(f.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={loading ? null : <EmptyState title="No follow-ups" subtitle="Log a call, WhatsApp or visit." />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name={TYPE_ICON[item.type] ?? 'chatbox-ellipses-outline'} size={20} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.party_name ?? `Party #${item.party_id}`}</Text>
              {item.remarks ? <Text style={styles.sub}>{item.remarks}</Text> : null}
              <Text style={styles.meta}>
                {item.followup_date}
                {item.next_followup_date ? ` · next ${item.next_followup_date}` : ''}
              </Text>
            </View>
            <Badge
              text={item.status}
              fg={item.status === 'pending' ? colors.warning : colors.success}
              bg={item.status === 'pending' ? colors.warningBg : colors.successBg}
            />
          </View>
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('FollowupForm')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  tabs: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: spacing.sm },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { color: colors.text, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { color: colors.text, fontSize: 13, marginTop: 2 },
  meta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xl, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
});
