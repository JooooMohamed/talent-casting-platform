import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { colors, spacing, radius, typography } from '../../theme';
import { ExperienceLevel, AvailabilityStatus } from '@talent-casting/shared';

export function EditProfileScreen({ navigation }: any) {
  const qc = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () => api.get('/talents/me/profile').then((r) => r.data.data).catch(() => null),
  });

  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    city: '',
    country: '',
    experience: '',
    availability: AvailabilityStatus.AVAILABLE,
  });

  useEffect(() => {
    if (!existing) return;
    setForm({
      fullName: existing.fullName || '',
      bio: existing.bio || '',
      city: existing.city || '',
      country: existing.country || '',
      experience: existing.experience || '',
      availability: existing.availability || AvailabilityStatus.AVAILABLE,
    });
  }, [existing]);

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/talents/me/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
      Alert.alert('Saved!', 'Your profile has been updated.');
      navigation.goBack();
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.error || 'Failed to save'),
  });

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.brand[600]} />;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          value={form.fullName}
          onChangeText={(v) => setForm({ ...form, fullName: v })}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={4}
          placeholder="Tell casting directors about yourself..."
          value={form.bio}
          onChangeText={(v) => setForm({ ...form, bio: v })}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Cairo"
          value={form.city}
          onChangeText={(v) => setForm({ ...form, city: v })}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Country</Text>
        <TextInput
          style={styles.input}
          placeholder="Egypt"
          value={form.country}
          onChangeText={(v) => setForm({ ...form, country: v })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience Level</Text>
        <View style={styles.optionGrid}>
          {Object.values(ExperienceLevel).map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.optionBtn, form.experience === lvl && styles.optionBtnActive]}
              onPress={() => setForm({ ...form, experience: lvl })}
            >
              <Text style={[styles.optionText, form.experience === lvl && styles.optionTextActive]}>
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.optionGrid}>
          {Object.values(AvailabilityStatus).map((av) => (
            <TouchableOpacity
              key={av}
              style={[styles.optionBtn, form.availability === av && styles.optionBtnActive]}
              onPress={() => setForm({ ...form, availability: av })}
            >
              <Text style={[styles.optionText, form.availability === av && styles.optionTextActive]}>
                {av.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ padding: spacing.lg }}>
        <TouchableOpacity
          style={[styles.submitBtn, mutation.isPending && styles.btnDisabled]}
          onPress={() => {
            if (!form.fullName.trim()) return Alert.alert('Error', 'Full name is required');
            mutation.mutate(form);
          }}
          disabled={mutation.isPending}
        >
          <Text style={styles.submitText}>{mutation.isPending ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  section: { backgroundColor: colors.white, margin: spacing.md, borderRadius: radius.lg, padding: spacing.md },
  sectionTitle: { ...typography.h3, color: colors.gray[800], marginBottom: spacing.md },
  label: { ...typography.label, color: colors.gray[700], marginBottom: spacing.xs },
  input: {
    borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md,
    padding: spacing.md, fontSize: 15, color: colors.gray[900], backgroundColor: colors.white,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  optionBtnActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  optionText: { fontSize: 13, color: colors.gray[600], textTransform: 'capitalize' },
  optionTextActive: { color: colors.white, fontWeight: '600' },
  submitBtn: { backgroundColor: colors.brand[600], borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
