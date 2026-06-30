import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { useAuth } from '../auth/AuthContext';
import { InvoiceAPI, PartyAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { AppButton, AppInput, Card } from '../components/ui';
import { colors, money, radius, spacing } from '../theme';
import type { NewInvoice, Party } from '../types';

interface ItemRow {
  product_name: string;
  years: string;
  quantity: string;
  rate: string;
  gst_rate: string;
}

const emptyRow = (): ItemRow => ({ product_name: '', years: '', quantity: '1', rate: '', gst_rate: '18' });

export default function CreateInvoiceScreen() {
  const navigation = useNavigation<any>();
  const { company } = useAuth();
  const gstAvailable = !!company?.gstin;

  const [parties, setParties] = useState<Party[]>([]);
  const [party, setParty] = useState<Party | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [applyGst, setApplyGst] = useState(gstAvailable);
  const [items, setItems] = useState<ItemRow[]>([emptyRow()]);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      PartyAPI.list().then(setParties).catch(() => {});
    }, [])
  );

  const num = (s: string) => {
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const totals = useMemo(() => {
    let taxable = 0;
    let tax = 0;
    for (const it of items) {
      const t = num(it.quantity) * num(it.rate);
      taxable += t;
      if (applyGst) tax += (t * num(it.gst_rate)) / 100;
    }
    return { taxable, tax, grand: taxable + tax };
  }, [items, applyGst]);

  function updateItem(idx: number, key: keyof ItemRow, value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, emptyRow()]);
  }
  function removeItem(idx: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  async function onSave() {
    setError(null);
    if (!party) {
      setError('Select a party to bill');
      return;
    }
    const validItems = items.filter((it) => it.product_name.trim() && num(it.rate) >= 0 && num(it.quantity) > 0);
    if (validItems.length === 0) {
      setError('Add at least one item with a name, quantity and rate');
      return;
    }
    const payload: NewInvoice = {
      party_id: party.id,
      apply_gst: gstAvailable ? applyGst : false,
      note: note || undefined,
      items: validItems.map((it) => ({
        product_name: it.product_name.trim(),
        years: it.years || undefined,
        quantity: num(it.quantity),
        rate: num(it.rate),
        gst_rate: applyGst ? num(it.gst_rate) : 0,
      })),
    };
    setSaving(true);
    try {
      const created = await InvoiceAPI.create(payload);
      navigation.replace('InvoiceDetail', { id: created.id });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      data={items}
      keyExtractor={(_, i) => String(i)}
      ListHeaderComponent={
        <View style={{ gap: spacing.md }}>
          <Card>
            <Text style={styles.label}>Bill to</Text>
            <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
              <Text style={party ? styles.selectText : styles.selectPlaceholder}>
                {party ? party.name : 'Select a party'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('PartyForm')}>
              <Text style={styles.addParty}>+ Add new party</Text>
            </Pressable>

            {gstAvailable ? (
              <View style={styles.gstRow}>
                <Text style={styles.label}>Apply GST</Text>
                <Switch value={applyGst} onValueChange={setApplyGst} />
              </View>
            ) : (
              <Text style={styles.hint}>
                No GSTIN set — bills are created without GST. Add a GSTIN in Settings to enable GST.
              </Text>
            )}
          </Card>

          <Text style={styles.sectionTitle}>Items</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <Card style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNo}>Item {index + 1}</Text>
            {items.length > 1 ? (
              <Pressable onPress={() => removeItem(index)} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            ) : null}
          </View>
          <AppInput
            label="Product / service *"
            value={item.product_name}
            onChangeText={(v) => updateItem(index, 'product_name', v)}
            placeholder="Accounting charges"
          />
          <AppInput
            label="Years / period"
            value={item.years}
            onChangeText={(v) => updateItem(index, 'years', v)}
            placeholder="2024-2025"
          />
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppInput label="Qty *" value={item.quantity} onChangeText={(v) => updateItem(index, 'quantity', v)} keyboardType="decimal-pad" />
            </View>
            <View style={styles.flex}>
              <AppInput label="Rate *" value={item.rate} onChangeText={(v) => updateItem(index, 'rate', v)} keyboardType="decimal-pad" placeholder="500" />
            </View>
            {applyGst ? (
              <View style={styles.gstBox}>
                <AppInput label="GST %" value={item.gst_rate} onChangeText={(v) => updateItem(index, 'gst_rate', v)} keyboardType="decimal-pad" />
              </View>
            ) : null}
          </View>
          <Text style={styles.lineTotal}>
            Line total: {money(num(item.quantity) * num(item.rate) * (applyGst ? 1 + num(item.gst_rate) / 100 : 1))}
          </Text>
        </Card>
      )}
      ListFooterComponent={
        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
          <AppButton title="+ Add item" variant="outline" onPress={addItem} />

          <Card>
            <AppInput label="Note (optional)" value={note} onChangeText={setNote} multiline placeholder="Thank you for your business" />
          </Card>

          <Card style={styles.totalsCard}>
            <TotalRow label="Taxable" value={money(totals.taxable)} />
            {applyGst ? <TotalRow label="GST" value={money(totals.tax)} /> : null}
            <View style={styles.divider} />
            <TotalRow label="Grand Total" value={money(totals.grand)} strong />
          </Card>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton title="Create Bill" onPress={onSave} loading={saving} />
          <View style={{ height: spacing.xl }} />
        </View>
      }
    />
    <PartyPicker
      open={pickerOpen}
      parties={parties}
      onClose={() => setPickerOpen(false)}
      onSelect={(p) => {
        setParty(p);
        setPickerOpen(false);
      }}
    />
    </>
  );
}

function TotalRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && styles.totalStrong]}>{label}</Text>
      <Text style={[styles.totalValue, strong && styles.totalStrong]}>{value}</Text>
    </View>
  );
}

function PartyPicker({
  open,
  parties,
  onClose,
  onSelect,
}: {
  open: boolean;
  parties: Party[];
  onClose: () => void;
  onSelect: (p: Party) => void;
}) {
  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select party</Text>
          <FlatList
            data={parties}
            keyExtractor={(p) => String(p.id)}
            ListEmptyComponent={<Text style={styles.hint}>No parties yet. Add one first.</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.modalRow} onPress={() => onSelect(item)}>
                <Text style={styles.modalRowText}>{item.name}</Text>
                <Text style={styles.hint}>{[item.city, item.gstin].filter(Boolean).join(' · ')}</Text>
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  select: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  selectText: { fontSize: 16, color: colors.text },
  selectPlaceholder: { fontSize: 16, color: colors.textMuted },
  addParty: { color: colors.primary, fontWeight: '700', marginTop: spacing.sm },
  gstRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  itemCard: { marginTop: spacing.md },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  itemNo: { fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  gstBox: { width: 80 },
  lineTotal: { textAlign: 'right', color: colors.textMuted, fontWeight: '600' },
  totalsCard: { gap: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { color: colors.textMuted, fontSize: 15 },
  totalValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  totalStrong: { fontSize: 18, fontWeight: '800', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  error: { color: colors.danger },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.lg, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  modalRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalRowText: { fontSize: 16, fontWeight: '600', color: colors.text },
});
