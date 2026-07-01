import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../api/client';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, spacing } from '../theme';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    company_name: '',
    city: '',
    state: '',
    state_code: '',
    pincode: '',
    gstin: '',
    phone: '',
    admin_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit() {
    setError(null);
    if (!form.company_name || !form.admin_name || !form.email || form.password.length < 8) {
      setError('Company name, your name, email and an 8+ char password are required');
      return;
    }
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      setError('Pincode must be exactly 6 digits');
      return;
    }
    setLoading(true);
    try {
      await signUp({
        company_name: form.company_name,
        city: form.city || undefined,
        state: form.state || undefined,
        state_code: form.state_code || undefined,
        pincode: form.pincode || undefined,
        gstin: form.gstin || undefined,
        phone: form.phone || undefined,
        admin_name: form.admin_name,
        email: form.email,
        password: form.password,
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginVertical: spacing.lg }}>
        <Text style={styles.logo}>Create Company</Text>
        <Text style={styles.tagline}>Set up your billing account</Text>
      </View>

      <Card>
        <Text style={styles.section}>Company</Text>
        <AppInput label="Company name *" value={form.company_name} onChangeText={set('company_name')} placeholder="E&H Fincorp Associates" />
        <AppInput label="City" value={form.city} onChangeText={set('city')} placeholder="Morbi" />
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppInput label="State" value={form.state} onChangeText={set('state')} placeholder="Gujarat" />
          </View>
          <View style={styles.codeBox}>
            <AppInput label="Code" value={form.state_code} onChangeText={set('state_code')} placeholder="24" keyboardType="number-pad" />
          </View>
        </View>
        <AppInput label="Pincode" value={form.pincode} onChangeText={set('pincode')} placeholder="6 digits" keyboardType="number-pad" maxLength={6} />
        <AppInput label="GSTIN (leave empty for non-GST bills)" value={form.gstin} onChangeText={set('gstin')} autoCapitalize="characters" placeholder="24ABCDE1234F1Z5" />
        <AppInput label="Phone" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" />

        <Text style={styles.section}>Login</Text>
        <AppInput label="Your name *" value={form.admin_name} onChangeText={set('admin_name')} />
        <AppInput label="Email *" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
        <AppInput label="Password * (min 8 chars)" value={form.password} onChangeText={set('password')} secureTextEntry />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Create account" onPress={onSubmit} loading={loading} />
      </Card>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>
          Already registered? <Text style={styles.linkStrong}>Login</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { fontSize: 26, fontWeight: '800', color: colors.primary },
  tagline: { color: colors.textMuted, marginTop: 4 },
  section: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.md, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
  codeBox: { width: 90 },
  error: { color: colors.danger, marginBottom: spacing.sm },
  link: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md },
  linkStrong: { color: colors.primary, fontWeight: '700' },
});
