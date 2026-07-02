import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../auth/AuthContext';
import { getErrorMessage } from '../api/client';
import { AppButton, AppInput, Card, Screen } from '../components/ui';
import { colors, spacing } from '../theme';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    if (!email || !password) {
      setError('Enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.brand}>
          <Text style={styles.logo}>Ughrani Management</Text>
          <Text style={styles.tagline}>Power by E & H</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.title}>Login</Text>
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton title="Login" onPress={onSubmit} loading={loading} />
        </Card>

        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>
            New company? <Text style={styles.linkStrong}>Create an account</Text>
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 32, fontWeight: '800', color: colors.primary },
  tagline: { color: colors.textMuted, marginTop: 4 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  error: { color: colors.danger, marginBottom: spacing.sm },
  link: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.md },
  linkStrong: { color: colors.primary, fontWeight: '700' },
  card: { width: '100%' },
});
