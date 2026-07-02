import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { PartyAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, spacing } from '../theme';
import type { PartyInput } from '../types';

export default function PartyFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editId: number | undefined = route.params?.id;

  const [form, setForm] = useState<PartyInput>({ name: '' });
  const [creditDays, setCreditDays] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof PartyInput) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Edit Party' : 'New Party' });
    if (editId) {
      PartyAPI.get(editId)
        .then((p) => {
          setForm({
            name: p.name,
            address: p.address ?? '',
            city: p.city ?? '',
            state: p.state ?? '',
            state_code: p.state_code ?? '',
            place_of_supply: p.place_of_supply ?? '',
            gstin: p.gstin ?? '',
            phone: p.phone ?? '',
            email: p.email ?? '',
          });
          setCreditDays(p.credit_days ? String(p.credit_days) : '');
          setOpeningBalance(p.opening_balance ? String(p.opening_balance) : '');
        })
        .catch(() => {});
    }
  }, [editId]);

  async function onSave() {
    setError(null);
    if (!form.name.trim()) {
      setError('Party name is required');
      return;
    }
    setLoading(true);
    try {
      const payload: PartyInput = {
        name: form.name.trim(),
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        state_code: form.state_code || undefined,
        place_of_supply: form.place_of_supply || undefined,
        gstin: form.gstin || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        credit_days: creditDays ? Number(creditDays) : 0,
        opening_balance: openingBalance ? Number(openingBalance) : 0,
      };
      if (editId) await PartyAPI.update(editId, payload);
      else await PartyAPI.create(payload);
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function onDelete() {
    if (!editId) return;
    Alert.alert('Delete party?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await PartyAPI.remove(editId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Cannot delete', getErrorMessage(e));
          }
        },
      },
    ]);
  }

  return (
    <Screen>
      <Card>
        <AppInput label="Party name *" value={form.name} onChangeText={set('name')} placeholder="Gajanan Industries" />
        <AppInput label="Address" value={form.address} onChangeText={set('address')} multiline />
        <AppInput label="City" value={form.city} onChangeText={set('city')} placeholder="Morbi" />
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppInput label="State" value={form.state} onChangeText={set('state')} placeholder="Gujarat" />
          </View>
          <View style={styles.codeBox}>
            <AppInput label="Code" value={form.state_code} onChangeText={set('state_code')} keyboardType="number-pad" placeholder="24" />
          </View>
        </View>
        <AppInput label="Place of supply" value={form.place_of_supply} onChangeText={set('place_of_supply')} placeholder="24-Gujarat" />
        <AppInput label="GSTIN" value={form.gstin} onChangeText={set('gstin')} autoCapitalize="characters" />
        <AppInput label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppInput label="Credit days" value={creditDays} onChangeText={setCreditDays} keyboardType="number-pad" placeholder="30" />
          </View>
          <View style={styles.flex}>
            <AppInput label="Opening balance" value={openingBalance} onChangeText={setOpeningBalance} keyboardType="decimal-pad" placeholder="0" />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title={editId ? 'Save changes' : 'Add party'} onPress={onSave} loading={loading} />
      </Card>

      {editId ? (
        <>
          <AppButton title="View ledger" variant="outline" onPress={() => navigation.navigate('PartyLedger', { partyId: editId })} />
          <AppButton title="Delete party" variant="danger" onPress={onDelete} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  codeBox: { width: 90 },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
