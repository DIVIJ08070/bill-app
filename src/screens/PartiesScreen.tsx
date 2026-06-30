import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { PartyAPI } from '../api/endpoints';
import { EmptyState } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import type { Party } from '../types';

export default function PartiesScreen() {
  const navigation = useNavigation<any>();
  const [parties, setParties] = useState<Party[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q?: string) => {
    try {
      const data = await PartyAPI.list(q);
      setParties(data);
    } catch {
      setParties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(search);
    }, [load]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search parties"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={(t) => {
            setSearch(t);
            load(t);
          }}
        />
      </View>

      <FlatList
        data={parties}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState title="No parties yet" subtitle="Add a customer to bill them." />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('PartyForm', { id: item.id })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>
                {[item.city, item.gstin].filter(Boolean).join(' · ') || 'No details'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('PartyForm')}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    margin: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, height: 44, color: colors.text, fontSize: 15 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  flex: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  fab: {
    position: 'absolute', right: spacing.lg, bottom: spacing.xl,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
});
