import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, radius } from '../../theme';

// ── Helpers ───────────────────────────────────────────────────────────────────
const ROLE_ICONS: Record<string, string> = {
  lead: '⭐', actress: '🎭', actor: '🎭', supporting: '🎬',
  model: '👗', dancer: '💃', musician: '🎵',
  voice: '🎙️', presenter: '📺', default: '🎭',
};

function getRoleIcon(roleType = '') {
  const l = roleType.toLowerCase();
  for (const k of Object.keys(ROLE_ICONS)) if (l.includes(k)) return ROLE_ICONS[k];
  return ROLE_ICONS.default;
}

function getDaysLeft(deadline?: string) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

function DeadlineTag({ deadline }: { deadline?: string }) {
  const days = getDaysLeft(deadline);
  if (days === null) return null;
  if (days < 0)  return <View style={[tag.wrap, tag.expired]}><Text style={[tag.text, { color: colors.red }]}>⛔ Expired</Text></View>;
  if (days <= 3) return <View style={[tag.wrap, tag.fire]}><Text style={[tag.text, { color: '#EA580C' }]}>🔥 {days}d left</Text></View>;
  if (days <= 7) return <View style={[tag.wrap, tag.warn]}><Text style={[tag.text, { color: colors.yellow }]}>⚡ {days}d left</Text></View>;
  return (
    <View style={[tag.wrap, tag.normal]}>
      <Text style={[tag.text, { color: colors.gray[500] }]}>
        📅 {new Date(deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </Text>
    </View>
  );
}

// ── Apply Modal (works on Android + iOS) ─────────────────────────────────────
function ApplyModal({
  visible, callTitle, callId, onClose,
}: { visible: boolean; callTitle: string; callId: string; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const qc = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: ({ coverMessage }: { coverMessage: string }) =>
      api.post(`/casting-calls/${callId}/apply`, { coverMessage }),
    onSuccess: () => {
      Alert.alert('Applied! 🎉', 'Your application has been submitted. Good luck!');
      qc.invalidateQueries({ queryKey: ['casting-calls'] });
      setMessage('');
      onClose();
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || 'Failed to apply. Please try again.';
      Alert.alert('Error', msg);
    },
  });

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <KeyboardAvoidingView
        style={modal.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={modal.dimArea} activeOpacity={1} onPress={onClose} />

        <View style={modal.sheet}>
          {/* Handle bar */}
          <View style={modal.handle} />

          {/* Header */}
          <View style={modal.header}>
            <View>
              <Text style={modal.title}>Apply for Role</Text>
              <Text style={modal.subtitle} numberOfLines={2}>{callTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
              <Text style={modal.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Cover message */}
          <View style={modal.body}>
            <Text style={modal.label}>Cover Message <Text style={{ color: colors.gray[400], fontWeight: '400' }}>(optional)</Text></Text>
            <TextInput
              style={modal.textarea}
              placeholder="Tell the casting director why you're a great fit for this role..."
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
              maxLength={500}
            />
            <Text style={modal.charCount}>{message.length}/500</Text>

            {/* Tips */}
            <View style={modal.tipBox}>
              <Text style={modal.tipTitle}>💡 Tips for a strong application</Text>
              <Text style={modal.tipText}>• Mention your relevant experience</Text>
              <Text style={modal.tipText}>• Reference a specific skill or trait</Text>
              <Text style={modal.tipText}>• Keep it concise and professional</Text>
            </View>

            {/* Actions */}
            <View style={modal.actions}>
              <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
                <Text style={modal.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modal.submitBtn, applyMutation.isPending && modal.submitDisabled]}
                onPress={() => applyMutation.mutate({ coverMessage: message })}
                disabled={applyMutation.isPending}
              >
                <Text style={modal.submitText}>
                  {applyMutation.isPending ? 'Submitting…' : 'Submit Application →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Casting Card ──────────────────────────────────────────────────────────────
function CastingCard({ item, canApply, onApply }: any) {
  const days = getDaysLeft(item.deadline);
  const isExpired = days !== null && days < 0;
  const isOpen = item.status === 'open';
  const isUrgent = days !== null && days <= 7 && !isExpired;

  return (
    <View style={[card.wrap, isUrgent && card.urgent]}>
      <View style={[card.stripe, { backgroundColor: isOpen ? colors.brand[600] : colors.gray[300] }]} />

      <View style={card.body}>
        <View style={card.topRow}>
          <View style={card.iconBox}>
            <Text style={{ fontSize: 22 }}>{getRoleIcon(item.roleType)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={card.title} numberOfLines={2}>{item.title}</Text>
            {item.roleType && (
              <View style={card.roleChip}>
                <Text style={card.roleChipText}>{item.roleType}</Text>
              </View>
            )}
          </View>
          <View style={[card.statusBadge, { backgroundColor: isOpen ? colors.greenLight : colors.gray[100] }]}>
            <Text style={[card.statusText, { color: isOpen ? colors.green : colors.gray[500] }]}>
              {isOpen ? '● Open' : '○ Closed'}
            </Text>
          </View>
        </View>

        <Text style={card.desc} numberOfLines={2}>{item.description}</Text>

        {item.categories?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }} contentContainerStyle={{ gap: 6 }}>
            {item.categories.map((c: string) => (
              <View key={c} style={card.catTag}>
                <Text style={card.catTagText}>{c.replace('_', ' ')}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={card.footer}>
          <DeadlineTag deadline={item.deadline} />
          {canApply && isOpen && !isExpired && (
            <TouchableOpacity style={card.applyBtn} onPress={onApply} activeOpacity={0.85}>
              <Text style={card.applyText}>Apply Now →</Text>
            </TouchableOpacity>
          )}
          {!canApply && isOpen && (
            <View style={card.viewBtn}>
              <Text style={card.viewText}>Casting Call</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function CastingCallsScreen() {
  const user = useAuthStore((s) => s.user);
  const [applyTarget, setApplyTarget] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['casting-calls'],
    queryFn: () => api.get('/casting-calls').then((r) => r.data.data),
  });

  const openCount   = data?.items?.filter((i: any) => i.status === 'open').length ?? 0;
  const urgentCount = data?.items?.filter((i: any) => {
    const d = getDaysLeft(i.deadline); return d !== null && d <= 7 && d >= 0;
  }).length ?? 0;

  const isTalent  = user?.role === 'talent';
  const isCasting = user?.role === 'casting';

  return (
    <View style={s.container}>

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.circle} />
        <View>
          <Text style={s.headerTitle}>Casting Calls</Text>
          <Text style={s.headerSub}>{openCount} open opportunities</Text>
        </View>
        <View style={s.headerIcon}><Text style={{ fontSize: 28 }}>🎬</Text></View>
      </View>

      {/* ── Role context banner ── */}
      {isTalent && (
        <View style={s.roleBanner}>
          <Text style={s.roleBannerIcon}>🎭</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.roleBannerTitle}>You're browsing as a Talent</Text>
            <Text style={s.roleBannerSub}>Tap "Apply Now" on any open role to submit your application</Text>
          </View>
        </View>
      )}
      {isCasting && (
        <View style={[s.roleBanner, { backgroundColor: colors.blueLight, borderColor: '#BFDBFE' }]}>
          <Text style={s.roleBannerIcon}>🎥</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.roleBannerTitle, { color: colors.blue }]}>You're a Casting Director</Text>
            <Text style={s.roleBannerSub}>These are live casting calls. Post yours from your dashboard.</Text>
          </View>
        </View>
      )}

      {/* ── Stats row ── */}
      {!isLoading && (data?.total ?? 0) > 0 && (
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{data?.total ?? 0}</Text>
            <Text style={s.statLabel}>Total</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: colors.green }]}>{openCount}</Text>
            <Text style={s.statLabel}>Open</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: colors.yellow }]}>{urgentCount}</Text>
            <Text style={s.statLabel}>Urgent</Text>
          </View>
        </View>
      )}

      {/* ── List ── */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.brand[600]} size="large" />
      ) : (
        <FlatList
          data={data?.items}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <CastingCard
              item={item}
              canApply={isTalent}
              onApply={() => setApplyTarget({ id: item._id, title: item.title })}
            />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 48 }}>📋</Text>
              <Text style={s.emptyTitle}>No casting calls right now</Text>
              <Text style={s.emptySub}>Check back soon for new roles</Text>
            </View>
          }
        />
      )}

      {/* ── Apply Modal ── */}
      {applyTarget && (
        <ApplyModal
          visible={!!applyTarget}
          callTitle={applyTarget.title}
          callId={applyTarget.id}
          onClose={() => setApplyTarget(null)}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },

  header: {
    backgroundColor: colors.brand[800],
    padding: spacing.lg,
    paddingTop: 52,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(139,92,246,0.2)', top: -60, right: -40,
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: colors.brand[300], marginTop: 2 },
  headerIcon: {
    width: 52, height: 52, backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },

  roleBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.brand[50],
    borderWidth: 1, borderColor: colors.brand[200],
    marginHorizontal: spacing.md, marginTop: spacing.sm,
    borderRadius: radius.md, padding: spacing.sm,
  },
  roleBannerIcon: { fontSize: 22, marginTop: 1 },
  roleBannerTitle: { fontSize: 13, fontWeight: '700', color: colors.brand[700] },
  roleBannerSub: { fontSize: 11, color: colors.brand[600], marginTop: 1, lineHeight: 16 },

  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    marginHorizontal: spacing.md, marginTop: spacing.sm,
    borderRadius: radius.lg, paddingVertical: spacing.md,
    shadowColor: colors.brand[800], shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.brand[600] },
  statLabel: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.gray[200] },

  list: { padding: spacing.md, gap: spacing.sm },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[700] },
  emptySub: { fontSize: 13, color: colors.gray[400] },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff', borderRadius: radius.lg,
    flexDirection: 'row', overflow: 'hidden',
    shadowColor: colors.brand[800], shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  urgent: { borderWidth: 1, borderColor: '#FED7AA' },
  stripe: { width: 4 },
  body: { flex: 1, padding: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  iconBox: {
    width: 44, height: 44, backgroundColor: colors.brand[100],
    borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray[900], lineHeight: 19, flex: 1 },
  roleChip: {
    backgroundColor: colors.brand[100], borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4,
  },
  roleChipText: { fontSize: 11, color: colors.brand[700], fontWeight: '600' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexShrink: 0 },
  statusText: { fontSize: 11, fontWeight: '600' },
  desc: { fontSize: 13, color: colors.gray[500], lineHeight: 18 },
  catTag: { backgroundColor: colors.gray[100], borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  catTagText: { fontSize: 10, color: colors.gray[500], textTransform: 'capitalize', fontWeight: '500' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  applyBtn: {
    backgroundColor: colors.brand[600], borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  applyText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  viewBtn: {
    backgroundColor: colors.gray[100], borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  viewText: { color: colors.gray[500], fontWeight: '600', fontSize: 13 },
});

const tag = StyleSheet.create({
  wrap: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontSize: 12, fontWeight: '600' },
  normal: { backgroundColor: colors.gray[100] },
  warn: { backgroundColor: colors.yellowLight },
  fire: { backgroundColor: colors.orangeLight },
  expired: { backgroundColor: colors.redLight },
});

const modal = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  dimArea: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handle: {
    width: 40, height: 4, backgroundColor: colors.gray[300],
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: spacing.md, paddingTop: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  title: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  subtitle: { fontSize: 13, color: colors.gray[500], marginTop: 2, maxWidth: 260 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center',
  },
  closeText: { color: colors.gray[500], fontSize: 13, fontWeight: '600' },
  body: { padding: spacing.md },
  label: { fontSize: 13, fontWeight: '700', color: colors.gray[700], marginBottom: 8 },
  textarea: {
    borderWidth: 1.5, borderColor: colors.gray[200], borderRadius: radius.md,
    padding: spacing.md, fontSize: 14, color: colors.gray[900],
    minHeight: 120, textAlignVertical: 'top',
    backgroundColor: colors.gray[50],
  },
  charCount: { fontSize: 11, color: colors.gray[400], textAlign: 'right', marginTop: 4 },
  tipBox: {
    backgroundColor: colors.brand[50], borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.md,
    borderWidth: 1, borderColor: colors.brand[100],
  },
  tipTitle: { fontSize: 13, fontWeight: '700', color: colors.brand[700], marginBottom: 6 },
  tipText: { fontSize: 12, color: colors.brand[600], lineHeight: 20 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: colors.gray[200],
    borderRadius: radius.md, paddingVertical: 14, alignItems: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.gray[600] },
  submitBtn: {
    flex: 2, backgroundColor: colors.brand[600],
    borderRadius: radius.md, paddingVertical: 14, alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
