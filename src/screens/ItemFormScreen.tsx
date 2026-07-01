import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { ItemAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, spacing } from '../theme';
import type { ItemInput } from '../types';

export default function ItemFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editId: number | undefined = route.params?.id;

  const [form, setForm] = useState({
    name: '',
    hsn_code: '',
    unit: '',
    default_rate: '',
    default_gst_rate: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    navigation.setOptions({ title: editId ? 'Edit Item' : 'New Item' });
    if (editId) {
      ItemAPI.get(editId)
        .then((it) =>
          setForm({
            name: it.name,
            hsn_code: it.hsn_code ?? '',
            unit: it.unit ?? '',
            default_rate: it.default_rate ? String(it.default_rate) : '',
            default_gst_rate: it.default_gst_rate ? String(it.default_gst_rate) : '',
            description: it.description ?? '',
          })
        )
        .catch(() => {});
    }
  }, [editId]);

  async function onSave() {
    setError(null);
    if (!form.name.trim()) {
      setError('Item name is required');
      return;
    }
    const rate = form.default_rate ? Number(form.default_rate) : 0;
    const gst = form.default_gst_rate ? Number(form.default_gst_rate) : 0;
    if (isNaN(rate) || rate < 0) {
      setError('Rate must be a valid number');
      return;
    }
    if (isNaN(gst) || gst < 0 || gst > 100) {
      setError('GST % must be between 0 and 100');
      return;
    }
    setLoading(true);
    try {
      const payload: ItemInput = {
        name: form.name.trim(),
        hsn_code: form.hsn_code || undefined,
        unit: form.unit || undefined,
        default_rate: rate,
        default_gst_rate: gst,
        description: form.description || undefined,
      };
      if (editId) await ItemAPI.update(editId, payload);
      else await ItemAPI.create(payload);
      navigation.goBack();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  function onDelete() {
    if (!editId) return;
    Alert.alert('Delete item?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ItemAPI.remove(editId);
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
        <AppInput label="Item name *" value={form.name} onChangeText={set('name')} placeholder="Accounting charges" />
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppInput label="Rate" value={form.default_rate} onChangeText={set('default_rate')} keyboardType="decimal-pad" placeholder="500" />
          </View>
          <View style={styles.gstBox}>
            <AppInput label="GST %" value={form.default_gst_rate} onChangeText={set('default_gst_rate')} keyboardType="decimal-pad" placeholder="18" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppInput label="HSN / SAC" value={form.hsn_code} onChangeText={set('hsn_code')} placeholder="9982" />
          </View>
          <View style={styles.flex}>
            <AppInput label="Unit" value={form.unit} onChangeText={set('unit')} placeholder="Nos / Year" />
          </View>
        </View>
        <AppInput label="Description" value={form.description} onChangeText={set('description')} multiline />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title={editId ? 'Save changes' : 'Add item'} onPress={onSave} loading={loading} />
      </Card>

      {editId ? <AppButton title="Delete item" variant="danger" onPress={onDelete} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  gstBox: { width: 90 },
  error: { color: colors.danger, marginBottom: spacing.sm },
});
