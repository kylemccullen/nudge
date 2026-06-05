import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParams } from '../navigation';
import { colors, font, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

const IS_DEV = process.env.NODE_ENV === 'development' || __DEV__;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doLogin = async (e: string, p: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authApi.login({ email: e.trim(), password: p });
      await login(res.token);
    } catch (err: any) {
      console.log('Login error:', err?.message, err?.status);
      setError(err?.status === 401 || err?.status === 400
        ? 'Invalid email or password.'
        : `Network error: ${err?.message ?? 'Could not reach server'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (!email.trim() || !password) return;
    doLogin(email, password);
  };

  const handleDevLogin = () => doLogin('test@example.com', 'password');

  const isDisabled = isLoading || !email.trim() || !password;

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View style={styles.logoRow}>
          <Text style={styles.logo}>nudge</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign in</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textDisabled}
              secureTextEntry
              textContentType="password"
              onSubmitEditing={handleLogin}
            />
          </View>

          <Pressable onPress={handleLogin} disabled={isDisabled} style={[styles.btn, isDisabled && styles.btnDisabled]}>
            <Text style={styles.btnText}>{isLoading ? 'Signing in…' : 'Sign in'}</Text>
          </Pressable>

          {IS_DEV && (
            <View style={styles.devSection}>
              <Pressable onPress={handleDevLogin} disabled={isLoading} style={[styles.devBtn, isLoading && styles.btnDisabled]}>
                <Text style={styles.devBtnText}>DEV — Sign in as test@example.com</Text>
              </Pressable>
            </View>
          )}

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkHighlight}>Register</Text></Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, maxWidth: 400, width: '100%', alignSelf: 'center' },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  logo: { color: colors.textPrimary, fontSize: font.xl, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  cardTitle: { color: colors.textPrimary, fontSize: font.lg, fontWeight: '600' },
  error: { color: '#f87171', fontSize: font.sm },
  field: { gap: spacing.xs },
  label: { color: colors.textMuted, fontSize: font.sm },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'web' ? spacing.md : spacing.sm,
    color: colors.textPrimary,
    fontSize: font.md,
  },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: font.sm, fontWeight: '600' },
  devSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  devBtn: { backgroundColor: '#854d0e', borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  devBtnText: { color: '#fef08a', fontSize: font.sm, fontWeight: '600' },
  link: { alignItems: 'center' },
  linkText: { color: colors.textMuted, fontSize: font.sm },
  linkHighlight: { color: colors.info },
});
