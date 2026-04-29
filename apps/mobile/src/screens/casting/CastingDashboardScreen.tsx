import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, ScrollView, Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../services/api';
import { colors, spacing, radius, typography } from '../../theme';

export function CastingDashboardScreen() {
  const { user, logout } = useAuthStore();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newCall, setNewCall] = useState({ title: '', description: '', roleType: '', deadline: '' });

  const { data: calls } = useQuery({
    queryKey: ['my-casting-calls'],
    queryFn: () => api.get('/casting-calls/my/calls').then((r) => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => api.post('/casting-calls', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-casting-calls'] });
      setShowCreate(false);
      setNewCall({ title: '', description: '', roleType: '', deadline: '' });
      Alert.alert('Published!', 'Your casting call is now live.');
    },
    onError: (e: any) => Alert.alert('Error', e.response?.data?.error || 'Failed to create'),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Casting Calls</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
        <Text style={styles.createBtnText}>+ Post New Casting Call</Text>
      </TouchableOpacity>

      <FlatList
        data={calls?.items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No Casting Calls Yet</Text>
            <Text style={styles.emptyDesc}>Post your first casting call to find talent.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.callTitle} numberOfLines={2}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: item.status === 'open' ? '#dcfce7' : '#f3f4f6' }]}>
                <Text style={{ fontSize: 11, color: item.status === 'open' ? '#16a34a' : colors.gray[500], fontWeight: '500' }}>{item.status}</Text>
              </View>
            </View>
            {item.roleType && <Text style={styles.roleType}>{item.roleType}</Text>}
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
          </View>
        )}
      />

      {/* Create Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="formSheet">
        <ScrollView style={styles.modal} keyboardShouldPersistTaps="handled">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post a Casting Call</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Text style={{ color: colors.brand[600], fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lead Actor for Drama Series"
              value={newCall.title}
              onChangeText={(v) => setNewCall({ ...newCall, title: v })}
            />

            <Text style={[styles.label, { marginTop: spacing.md }]}>Role Type</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lead, Supporting"
              value={newCall.roleType}
              onChangeText={(v) => setNewCall({ ...newCall, roleType: v })}
            />

            <Text style={[styles.label, { marginTop: spacing.md }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              multiline
              numberOfLines={5}
              placeholder="Describe the role and requirements..."
              value={newCall.description}
              onChangeText={(v) => setNewCall({ ...newCall, description: v })}
            />

            <TouchableOpacity
              style={[styles.submitBtn, createMutation.isPending && styles.btnDisabled]}
              onPress={() => {
                if (!newCall.title || !newCall.description) return Alert.alert('Error', 'Title and description are required');
                createMutation.mutate(newCall);
              }}
              disabled={createMutation.isPending}
            >
              <Text style={styles.submitText}>{createMutation.isPending ? 'Publishing...' : 'Publish Casting Call'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: { backgroundColor: colors.brand[700], padding: spacing.lg, paddingTop: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { ...typography.h2, color: colors.white },
  email: { ...typography.caption, color: colors.brand[200], marginTop: 2 },
  logoutBtn: { paddingVertical: spacing.xs },
  logoutText: { color: colors.brand[200], fontWeight: '600' },
  createBtn: { margin: spacing.md, backgroundColor: colors.brand[600], borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  createBtnText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  callTitle: { ...typography.h3, color: colors.gray[900], flex: 1, marginRight: spacing.sm },
  badge: { borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  roleType: { ...typography.label, color: colors.brand[600], marginTop: 4 },
  desc: { ...typography.body, color: colors.gray[600], marginTop: spacing.sm },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.gray[700] },
  emptyDesc: { ...typography.body, color: colors.gray[400], textAlign: 'center', marginTop: spacing.xs },
  modal: { flex: 1, backgroundColor: colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  modalTitle: { ...typography.h3, color: colors.gray[900] },
  modalBody: { padding: spacing.lg },
  label: { ...typography.label, color: colors.gray[700], marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: radius.md, padding: spacing.md, fontSize: 15, color: colors.gray[900] },
  textarea: { minHeight: 120, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: colors.brand[600], borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontWeight: '700', fontSize: 16 },
});
