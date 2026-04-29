import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, radius, typography } from '../../theme';

export function RegisterScreen({ navigation }: any) {
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'talent' | 'casting'>('talent');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields');
    if (password.length < 8) return Alert.alert('Error', 'Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, role);
    } catch (e: any) {
      Alert.alert('Registration Failed', e.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🎭</Text>
          <Text style={styles.appName}>TalentCasting</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <View style={styles.form}>
          {/* Role toggle */}
          <View style={styles.roleRow}>
            {(['talent', 'casting'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              >
                <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                  {r === 'talent' ? '🎭 I am a Talent' : '🎬 I am Casting'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.gray[400]}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: spacing.md }]}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="At least 8 characters"
            placeholderTextColor={colors.gray[400]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.btnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.link}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  inner: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logoSection: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 48 },
  appName: { ...typography.h1, color: colors.brand[700], marginTop: spacing.sm },
  tagline: { ...typography.body, color: colors.gray[500], marginTop: spacing.xs },
  form: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  roleRow: { flexDirection: 'row', backgroundColor: colors.gray[100], borderRadius: radius.md, padding: 4, marginBottom: spacing.lg },
  roleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  roleBtnActive: { backgroundColor: colors.brand[600] },
  roleBtnText: { fontSize: 13, fontWeight: '500', color: colors.gray[500] },
  roleBtnTextActive: { color: colors.white },
  label: { ...typography.label, color: colors.gray[700], marginBottom: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.gray[900],
  },
  btn: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: colors.white, fontWeight: '600', fontSize: 16 },
  linkRow: { alignItems: 'center', marginTop: spacing.lg },
  linkText: { color: colors.gray[500], fontSize: 14 },
  link: { color: colors.brand[600], fontWeight: '600' },
});
