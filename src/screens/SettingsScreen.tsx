import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../auth/AuthContext';
import { CompanyAPI } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, radius, spacing } from '../theme';

type BrandingKey = 'logo_base64' | 'signature_base64' | 'stamp_base64' | 'payment_qr_base64';

const BRANDING: { key: BrandingKey; label: string }[] = [
  { key: 'logo_base64', label: 'Logo' },
  { key: 'signature_base64', label: 'Signature' },
  { key: 'stamp_base64', label: 'Stamp' },
  { key: 'payment_qr_base64', label: 'Payment QR' },
];

export default function SettingsScreen() {
  const { company, user, signOut, refreshCompany } = useAuth();
  const [form, setForm] = useState({
    name: company?.name ?? '',
    address: company?.address ?? '',
    city: company?.city ?? '',
    state: company?.state ?? '',
    state_code: company?.state_code ?? '',
    gstin: company?.gstin ?? '',
    bank_name: company?.bank_name ?? '',
    bank_account_no: company?.bank_account_no ?? '',
    bank_ifsc: company?.bank_ifsc ?? '',
    upi_number: company?.upi_number ?? '',
    invoice_prefix: company?.invoice_prefix ?? 'INV/',
    default_note: company?.default_note ?? '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSave() {
    setSaving(true);
    try {
      await CompanyAPI.update({
        name: form.name,
        address: form.address || null,
        city: form.city || null,
        state: form.state || null,
        state_code: form.state_code || null,
        gstin: form.gstin || null,
        bank_name: form.bank_name || null,
        bank_account_no: form.bank_account_no || null,
        bank_ifsc: form.bank_ifsc || null,
        upi_number: form.upi_number || null,
        invoice_prefix: form.invoice_prefix || 'INV/',
        default_note: form.default_note || null,
      } as any);
      await refreshCompany();
      Alert.alert('Saved', 'Company details updated.');
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function pickImage(key: BrandingKey) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to upload images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    try {
      await CompanyAPI.updateBranding({ [key]: result.assets[0].base64 } as any);
      await refreshCompany();
      Alert.alert('Uploaded', 'Image saved.');
    } catch (e) {
      Alert.alert('Error', getErrorMessage(e));
    }
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Company</Text>
        <AppInput label="Company name" value={form.name} onChangeText={set('name')} />
        <AppInput label="Address" value={form.address} onChangeText={set('address')} multiline />
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppInput label="City" value={form.city} onChangeText={set('city')} />
          </View>
          <View style={styles.flex}>
            <AppInput label="State" value={form.state} onChangeText={set('state')} />
          </View>
          <View style={styles.codeBox}>
            <AppInput label="Code" value={form.state_code} onChangeText={set('state_code')} keyboardType="number-pad" />
          </View>
        </View>
        <AppInput label="GSTIN (empty = non-GST bills)" value={form.gstin} onChangeText={set('gstin')} autoCapitalize="characters" />
        <AppInput label="Invoice prefix" value={form.invoice_prefix} onChangeText={set('invoice_prefix')} placeholder="EH/" />
      </Card>

      <Card>
        <Text style={styles.title}>Bank & Payment</Text>
        <AppInput label="Bank name" value={form.bank_name} onChangeText={set('bank_name')} />
        <AppInput label="Account number" value={form.bank_account_no} onChangeText={set('bank_account_no')} />
        <AppInput label="IFSC" value={form.bank_ifsc} onChangeText={set('bank_ifsc')} autoCapitalize="characters" />
        <AppInput label="G-Pay / UPI number" value={form.upi_number} onChangeText={set('upi_number')} />
      </Card>

      <Card>
        <Text style={styles.title}>Note on invoices</Text>
        <AppInput label="Default note" value={form.default_note} onChangeText={set('default_note')} multiline />
      </Card>

      <AppButton title="Save details" onPress={onSave} loading={saving} />

      <Card>
        <Text style={styles.title}>Branding</Text>
        <Text style={styles.muted}>Logo, signature, stamp and payment QR shown on the PDF.</Text>
        <View style={styles.brandGrid}>
          {BRANDING.map((b) => {
            const value = company?.[b.key];
            return (
              <Pressable key={b.key} style={styles.brandItem} onPress={() => pickImage(b.key)}>
                {value ? (
                  <Image source={{ uri: `data:image/jpeg;base64,${value}` }} style={styles.brandImg} resizeMode="contain" />
                ) : (
                  <View style={styles.brandPlaceholder}>
                    <Text style={styles.brandPlus}>+</Text>
                  </View>
                )}
                <Text style={styles.brandLabel}>{b.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <Text style={styles.muted}>Signed in as {user?.email}</Text>
      </Card>
      <AppButton title="Logout" variant="danger" onPress={signOut} />
      <View style={{ height: spacing.lg }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  muted: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  codeBox: { width: 70 },
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  brandItem: { width: '47%', alignItems: 'center', gap: 6 },
  brandImg: { width: '100%', height: 80, borderRadius: radius.sm, backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border },
  brandPlaceholder: {
    width: '100%', height: 80, borderRadius: radius.sm, backgroundColor: colors.inputBg,
    borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  brandPlus: { fontSize: 28, color: colors.textMuted },
  brandLabel: { color: colors.textMuted, fontSize: 13 },
});
