import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { FollowupAPI, PartyAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { PartySelect } from '../components/PartySelect';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, spacing } from '../theme';
import type { FollowupStatus, FollowupType, Party } from '../types';

const today = () => new Date().toISOString().slice(0, 10);

const TYPES: { key: FollowupType; label: string }[] = [
  { key: 'call', label: 'Call' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'visit', label: 'Visit' },
  { key: 'other', label: 'Other' },
];

export default function FollowupFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const prefillPartyId: number | undefined = route.params?.partyId;

  const [party, setParty] = useState<Party | null>(null);
  const [type, setType] = useState<FollowupType>('call');
  const [status, setStatus] = useState<FollowupStatus>('done');
  const [form, setForm] = useState({ remarks: '', followup_date: today(), next_followup_date: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (prefillPartyId) PartyAPI.get(prefillPartyId).then(setParty).catch(() => {});
  }, [prefillPartyId]);

  async function onSave() {
    setError(null);
    if (!party) return setError('Select a party');
    setSaving(true);
    try {
      await FollowupAPI.create({
        party_id: party.id,
        type,
        status,
        remarks: form.remarks || undefined,
        followup_date: form.followup_date || undefined,
        next_followup_date: form.next_followup_date || undefined,
      });
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>New follow-up</Text>
        <PartySelect value={party} onChange={setParty} label="Party *" />

        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {TYPES.map((t) => (
            <Pressable key={t.key} style={[styles.chip, type === t.key && styles.chipActive]} onPress={() => setType(t.key)}>
              <Text style={[styles.chipText, type === t.key && styles.chipTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        <AppInput label="Remarks" value={form.remarks} onChangeText={set('remarks')} multiline placeholder="Promised to pay next week" />
        <AppInput label="Follow-up date" value={form.followup_date} onChangeText={set('followup_date')} placeholder="YYYY-MM-DD" />
        <AppInput label="Next follow-up date (optional)" value={form.next_followup_date} onChangeText={set('next_followup_date')} placeholder="YYYY-MM-DD" />

        <Text style={styles.label}>Status</Text>
        <View style={styles.chipRow}>
          {(['done', 'pending'] as FollowupStatus[]).map((s) => (
            <Pressable key={s} style={[styles.chip, status === s && styles.chipActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s === 'done' ? 'Done' : 'Pending'}</Text>
            </Pressable>
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Save follow-up" onPress={onSave} loading={saving} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.inputBg },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
