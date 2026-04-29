import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { colors, spacing, radius, typography } from '../../theme';
import { ExperienceLevel, AvailabilityStatus } from '@talent-casting/shared';

export function EditProfileScreen({ navigation }: any) {
  const qc = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () =>
      api
        .get('/talents/me/profile')
        .then(r => r.data.data)
        .catch(() => null),
  });

  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    city: '',
    country: '',
    experience: '',
    availability: AvailabilityStatus.AVAILABLE,
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!existing) return;
    setForm({
      fullName: existing.fullName || '',
      bio: existing.bio || '',
      city: existing.city || '',
      country: existing.country || '',
      experience: existing.experience || '',
      availability: existing.availability || AvailabilityStatus.AVAILABLE,
      skills: existing.skills || [],
    });
  }, [existing]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (form.skills.includes(trimmed)) return;
    if (form.skills.length >= 20)
      return Alert.alert('Limit', 'Maximum 20 skills allowed.');
    setForm(f => ({ ...f, skills: [...f.skills, trimmed] }));
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/talents/me/profile', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
      qc.invalidateQueries({ queryKey: ['marketplace'] });
      Alert.alert('Saved!', 'Your profile has been updated.');
      navigation.goBack();
    },
    onError: (e: any) =>
      Alert.alert('Error', e.response?.data?.error || 'Failed to save'),
  });

  if (isLoading)
    return <ActivityIndicator style={{ flex: 1 }} color={colors.brand[600]} />;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Info</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your full name"
          value={form.fullName}
          onChangeText={v => setForm({ ...form, fullName: v })}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          numberOfLines={4}
          placeholder="Tell casting directors about yourself..."
          value={form.bio}
          onChangeText={v => setForm({ ...form, bio: v })}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="Cairo"
          value={form.city}
          onChangeText={v => setForm({ ...form, city: v })}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Country</Text>
        <TextInput
          style={styles.input}
          placeholder="Egypt"
          value={form.country}
          onChangeText={v => setForm({ ...form, country: v })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience Level</Text>
        <View style={styles.optionGrid}>
          {Object.values(ExperienceLevel).map(lvl => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.optionBtn,
                form.experience === lvl && styles.optionBtnActive,
              ]}
              onPress={() => setForm({ ...form, experience: lvl })}
            >
              <Text
                style={[
                  styles.optionText,
                  form.experience === lvl && styles.optionTextActive,
                ]}
              >
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.optionGrid}>
          {Object.values(AvailabilityStatus).map(av => (
            <TouchableOpacity
              key={av}
              style={[
                styles.optionBtn,
                form.availability === av && styles.optionBtnActive,
              ]}
              onPress={() => setForm({ ...form, availability: av })}
            >
              <Text
                style={[
                  styles.optionText,
                  form.availability === av && styles.optionTextActive,
                ]}
              >
                {av.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Skills ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text style={styles.hint}>
          Add up to 20 skills (e.g. Horse Riding, Accents, Combat)
        </Text>

        {/* Input row */}
        <View style={styles.skillInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Add a skill…"
            value={skillInput}
            onChangeText={setSkillInput}
            onSubmitEditing={addSkill}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addSkillBtn} onPress={addSkill}>
            <Text style={styles.addSkillBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Skill chips */}
        {form.skills.length > 0 && (
          <View style={styles.skillChips}>
            {form.skills.map(sk => (
              <View key={sk} style={styles.skillChip}>
                <Text style={styles.skillChipText}>{sk}</Text>
                <TouchableOpacity
                  onPress={() => removeSkill(sk)}
                  hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                >
                  <Text style={styles.skillRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {form.skills.length === 0 && (
          <Text style={styles.emptySkills}>No skills added yet.</Text>
        )}
      </View>

      <View style={{ padding: spacing.lg }}>
        <TouchableOpacity
          style={[styles.submitBtn, mutation.isPending && styles.btnDisabled]}
          onPress={() => {
            if (!form.fullName.trim())
              return Alert.alert('Error', 'Full name is required');
            mutation.mutate(form);
          }}
          disabled={mutation.isPending}
        >
          <Text style={styles.submitText}>
            {mutation.isPending ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  section: {
    backgroundColor: colors.white,
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  hint: { fontSize: 12, color: colors.gray[400], marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  optionBtnActive: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  optionText: {
    fontSize: 13,
    color: colors.gray[600],
    textTransform: 'capitalize',
  },
  optionTextActive: { color: colors.white, fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontWeight: '700', fontSize: 16 },
  // Skills
  skillInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  addSkillBtn: {
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addSkillBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  skillChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.brand[200],
  },
  skillChipText: { fontSize: 13, color: colors.brand[700], fontWeight: '500' },
  skillRemove: { fontSize: 11, color: colors.brand[400], fontWeight: '700' },
  emptySkills: {
    fontSize: 13,
    color: colors.gray[400],
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
