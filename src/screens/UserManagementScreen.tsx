import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { CompanyAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { AppButton, AppInput, Badge } from '../components/ui';
import { colors, radius, spacing } from '../theme';
import type { User, UserRole } from '../types';

const ROLES: { key: UserRole; label: string }[] = [
  { key: 'company_staff', label: 'Staff' },
  { key: 'collection_executive', label: 'Collection Exec' },
  { key: 'viewer', label: 'Viewer' },
];

const ROLE_LABEL: Record<string, string> = {
  company_admin: 'Admin',
  company_staff: 'Staff',
  collection_executive: 'Collection Exec',
  viewer: 'Viewer',
};

export default function UserManagementScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' });
  const [role, setRole] = useState<UserRole>('company_staff');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const load = useCallback(() => {
    CompanyAPI.listStaff().then(setUsers).catch(() => setUsers([]));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function onAdd() {
    setError(null);
    if (!form.full_name || !form.email || form.password.length < 8) {
      setError('Name, email and an 8+ char password are required');
      return;
    }
    setSaving(true);
    try {
      await CompanyAPI.addStaff({ ...form, phone: form.phone || undefined, role });
      setAddOpen(false);
      setForm({ full_name: '', email: '', password: '', phone: '' });
      setRole('company_staff');
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: User) {
    try {
      await CompanyAPI.setStaffActive(u.id, !u.is_active);
      load();
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  }

  function changeRole(u: User) {
    Alert.alert('Change role', `Set role for ${u.full_name}`, [
      ...ROLES.map((r) => ({
        text: r.label,
        onPress: async () => {
          try {
            await CompanyAPI.updateStaff(u.id, { role: r.key });
            load();
          } catch (e) {
            Alert.alert('Error', getErrorMessage(e));
          }
        },
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isAdmin = item.role === 'company_admin';
          return (
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.sub}>{item.email}</Text>
                <View style={styles.badges}>
                  <Badge text={ROLE_LABEL[item.role] ?? item.role} fg={colors.primary} bg={colors.bg} />
                  <Badge
                    text={item.is_active ? 'Active' : 'Disabled'}
                    fg={item.is_active ? colors.success : colors.danger}
                    bg={item.is_active ? colors.successBg : colors.dangerBg}
                  />
                </View>
              </View>
              {!isAdmin ? (
                <View style={styles.rowActions}>
                  <Pressable onPress={() => changeRole(item)} style={styles.action}>
                    <Text style={styles.actionText}>Role</Text>
                  </Pressable>
                  <Pressable onPress={() => toggleActive(item)} style={styles.action}>
                    <Text style={[styles.actionText, { color: item.is_active ? colors.danger : colors.success }]}>
                      {item.is_active ? 'Disable' : 'Enable'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        }}
      />
      <View style={styles.footer}>
        <AppButton title="+ Add user" onPress={() => setAddOpen(true)} />
      </View>

      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAddOpen(false)}>
          <Pressable style={styles.modal}>
            <Text style={styles.modalTitle}>Add user</Text>
            <AppInput label="Full name" value={form.full_name} onChangeText={set('full_name')} />
            <AppInput label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
            <AppInput label="Password (min 8)" value={form.password} onChangeText={set('password')} secureTextEntry />
            <AppInput label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
            <Text style={styles.label}>Role</Text>
            <View style={styles.chipRow}>
              {ROLES.map((r) => (
                <Pressable key={r.key} style={[styles.chip, role === r.key && styles.chipActive]} onPress={() => setRole(r.key)}>
                  <Text style={[styles.chipText, role === r.key && styles.chipTextActive]}>{r.label}</Text>
                </Pressable>
              ))}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <AppButton title="Create user" onPress={onAdd} loading={saving} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  flex: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: colors.text },
  sub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: 6 },
  rowActions: { gap: 6 },
  action: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { fontWeight: '700', color: colors.primary, fontSize: 13 },
  footer: { padding: spacing.lg },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.lg },
  modal: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBg },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
