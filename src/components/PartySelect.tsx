import React, { useCallback, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { PartyAPI } from '../api/endpoints';
import { colors, radius, spacing } from '../theme';
import type { Party } from '../types';

export function PartySelect({
  value,
  onChange,
  label = 'Party',
}: {
  value: Party | null;
  onChange: (p: Party) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback((q?: string) => {
    PartyAPI.list(q).then(setParties).catch(() => setParties([]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.select} onPress={() => setOpen(true)}>
        <Text style={value ? styles.selectText : styles.selectPlaceholder}>
          {value ? value.name : 'Select a party'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.title}>Select party</Text>
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
              ListEmptyComponent={<Text style={styles.muted}>No parties found.</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.row}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.rowText}>{item.name}</Text>
                  <Text style={styles.muted}>
                    {[item.city, item.phone].filter(Boolean).join(' · ')}
                  </Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  selectText: { fontSize: 16, color: colors.text },
  selectPlaceholder: { fontSize: 16, color: colors.textMuted },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg,
    padding: spacing.lg, maxHeight: '75%',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, height: 44, color: colors.text, fontSize: 15 },
  row: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { fontSize: 16, fontWeight: '600', color: colors.text },
  muted: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
});
