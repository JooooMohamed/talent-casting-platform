import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions,
} from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, radius } from '../../theme';

const { height: SCREEN_H } = Dimensions.get('window');

export function LoginScreen({ navigation }: any) {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Missing fields', 'Please enter your email and password.');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Hero band ── */}
        <View style={styles.heroBand}>
          {/* Decorative circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />

          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🎭</Text>
          </View>
          <Text style={styles.appName}>TalentCasting</Text>
          <Text style={styles.tagline}>Your spotlight starts here</Text>
        </View>

        {/* ── Form card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to continue</Text>

          {/* Email */}
          <View style={[styles.inputWrap, focused === 'email' && styles.inputWrapFocused]}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={colors.gray[400]}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Password */}
          <View style={[styles.inputWrap, focused === 'password' && styles.inputWrapFocused]}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.gray[400]}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
            {!loading && <Text style={styles.btnArrow}>→</Text>}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerText}>
              New here? <Text style={styles.registerLink}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom hint */}
        <Text style={styles.hint}>By continuing you agree to our Terms & Privacy Policy</Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand[800] },
  scroll: { flexGrow: 1 },

  /* ── Hero ── */
  heroBand: {
    height: SCREEN_H * 0.38,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(139,92,246,0.25)', top: -80, right: -60,
  },
  circle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(109,40,217,0.35)', top: 20, left: -80,
  },
  circle3: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(196,181,253,0.15)', bottom: 30, right: 30,
  },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 32, fontWeight: '800', color: colors.white, letterSpacing: -1 },
  tagline: { fontSize: 14, color: colors.brand[300], marginTop: 4 },

  /* ── Card ── */
  card: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: colors.gray[900], marginBottom: 2 },
  cardSub:   { fontSize: 13, color: colors.gray[400], marginBottom: spacing.lg },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  inputWrapFocused: { borderColor: colors.brand[500], backgroundColor: colors.brand[50] },
  inputIcon: { fontSize: 16, marginRight: spacing.sm },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.gray[900] },

  btn: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnLoading: { opacity: 0.7 },
  btnText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  btnArrow: { color: 'rgba(255,255,255,0.7)', fontSize: 18 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
  dividerText: { color: colors.gray[400], fontSize: 13 },

  registerBtn: { alignItems: 'center' },
  registerText: { color: colors.gray[500], fontSize: 14 },
  registerLink: { color: colors.brand[600], fontWeight: '700' },

  hint: { textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: spacing.lg, marginBottom: spacing.xl, paddingHorizontal: spacing.xl },
});
