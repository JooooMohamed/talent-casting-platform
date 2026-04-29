import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../services/api';
import { colors, spacing, radius, getAvatarColor } from '../../theme';

const STATUS_META: Record<
  string,
  { bg: string; text: string; icon: string; label: string }
> = {
  approved: {
    bg: colors.greenLight,
    text: colors.green,
    icon: '✅',
    label: 'Profile Approved',
  },
  pending: {
    bg: colors.yellowLight,
    text: colors.yellow,
    icon: '⏳',
    label: 'Pending Review',
  },
  rejected: {
    bg: colors.redLight,
    text: colors.red,
    icon: '❌',
    label: 'Profile Rejected',
  },
};

function QuickAction({ icon, title, sub, onPress, accent }: any) {
  return (
    <TouchableOpacity
      style={[qa.wrap, accent && qa.accent]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <Text style={qa.icon}>{icon}</Text>
      <Text style={[qa.title, accent && qa.accentTitle]}>{title}</Text>
      {sub ? <Text style={qa.sub}>{sub}</Text> : null}
    </TouchableOpacity>
  );
}

export function TalentDashboardScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const {
    data: profile,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () =>
      api
        .get('/talents/me/profile')
        .then(r => r.data.data)
        .catch(() => null),
    staleTime: 0,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const initials =
    profile?.fullName
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ??
    user?.email?.[0]?.toUpperCase() ??
    '?';
  const avatarBg = getAvatarColor(profile?.fullName ?? user?.email ?? '');
  const statusMeta = STATUS_META[profile?.approvalStatus] ?? null;
  const introCount = profile?.introVideo ? 1 : 0;
  const portfolioCount = profile?.portfolioVideos?.length ?? 0;

  return (
    <ScrollView
      style={s.root}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isFetching}
          onRefresh={onRefresh}
          tintColor={colors.brand[600]}
          colors={[colors.brand[600]]}
        />
      }
    >
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* ── Hero ── */}
        <View style={s.hero}>
          <View style={s.heroCircle1} />
          <View style={s.heroCircle2} />

          {/* Avatar — shows real photo if available */}
          <View style={[s.avatar, { backgroundColor: avatarBg }]}>
            {profile?.profilePhoto?.url ? (
              <Image
                source={{ uri: profile.profilePhoto.url }}
                style={s.avatarImg}
              />
            ) : (
              <Text style={s.avatarText}>{initials}</Text>
            )}
          </View>

          {/* Name + email */}
          <Text style={s.heroName}>
            {profile?.fullName ?? 'Set up your profile'}
          </Text>
          <Text style={s.heroEmail}>{user?.email}</Text>

          {/* Location & experience */}
          {(profile?.city || profile?.experience) && (
            <View style={s.heroBadgeRow}>
              {profile?.city && (
                <View style={s.heroBadge}>
                  <Text style={s.heroBadgeText}>
                    📍{' '}
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
              {profile?.experience && (
                <View style={s.heroBadge}>
                  <Text style={s.heroBadgeText}>🏆 {profile.experience}</Text>
                </View>
              )}
            </View>
          )}

          {/* Approval status */}
          {statusMeta && (
            <View style={[s.statusBadge, { backgroundColor: statusMeta.bg }]}>
              <Text style={{ fontSize: 14 }}>{statusMeta.icon}</Text>
              <Text style={[s.statusText, { color: statusMeta.text }]}>
                {statusMeta.label}
              </Text>
              {profile?.rejectionReason && (
                <Text style={[s.statusReason, { color: statusMeta.text }]}>
                  {' '}
                  — {profile.rejectionReason}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* ── Media stats strip ── */}
        <View style={s.statsStrip}>
          <View style={s.statItem}>
            <Text style={s.statNum}>{introCount}</Text>
            <Text style={s.statLabel}>Intro Video</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{portfolioCount}/5</Text>
            <Text style={s.statLabel}>Portfolio</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{profile?.skills?.length ?? 0}</Text>
            <Text style={s.statLabel}>Skills</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{profile?.languages?.length ?? 0}</Text>
            <Text style={s.statLabel}>Languages</Text>
          </View>
        </View>

        {/* ── Quick actions ── */}
        <Text style={s.sectionTitle}>Quick Actions</Text>
        <View style={s.qaGrid}>
          <QuickAction
            icon="✏️"
            title={profile ? 'Edit Profile' : 'Create Profile'}
            sub="Update your info"
            onPress={() => navigation.navigate('EditProfile')}
            accent
          />
          <QuickAction
            icon="🎬"
            title="Media"
            sub={`${introCount} intro · ${portfolioCount}/5 videos`}
            onPress={() => navigation.navigate('UploadMedia')}
          />
          <QuickAction
            icon="📋"
            title="Casting Calls"
            sub="Browse & apply"
            onPress={() => navigation.navigate('CastingCalls')}
          />
          <QuickAction
            icon="👤"
            title="View Profile"
            sub="As casting sees it"
            onPress={() =>
              profile?.slug &&
              navigation.navigate('TalentProfile', { slug: profile.slug })
            }
          />
        </View>

        {/* ── Profile completeness ── */}
        {profile && (
          <View style={s.completeCard}>
            <Text style={s.completeTitle}>Profile Completeness</Text>
            <View style={s.progressBg}>
              <View
                style={[
                  s.progressFill,
                  { width: `${getCompleteness(profile)}%` },
                ]}
              />
            </View>
            <Text style={s.completeHint}>
              {getCompleteness(profile)}% complete —{' '}
              {getCompletenessTip(profile)}
            </Text>
          </View>
        )}

        {/* ── Sign out ── */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text style={s.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

// Completeness helpers
function getCompleteness(p: any): number {
  const checks = [
    p.fullName,
    p.bio,
    p.city,
    p.experience,
    p.profilePhoto,
    p.introVideo,
    p.skills?.length > 0,
    p.languages?.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function getCompletenessTip(p: any): string {
  if (!p.bio) return 'Add a bio to stand out';
  if (!p.introVideo) return 'Upload an intro video';
  if (!p.profilePhoto) return 'Add a profile photo';
  if (!p.skills?.length) return 'List your skills';
  return 'Looking great!';
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray[50] },

  hero: {
    backgroundColor: colors.brand[800],
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: spacing.xl + 8,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(139,92,246,0.18)',
    top: -50,
    right: -50,
  },
  heroCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(109,40,217,0.2)',
    bottom: -40,
    left: -30,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    overflow: 'hidden',
  },
  avatarImg: { width: 88, height: 88, borderRadius: 44 },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },

  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroEmail: { fontSize: 13, color: colors.brand[300], marginTop: 2 },

  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: spacing.md,
  },
  statusText: { fontSize: 13, fontWeight: '700' },
  statusReason: { fontSize: 11, fontWeight: '400' },

  /* Stats strip */
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginTop: -1,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingVertical: spacing.md,
    shadowColor: colors.brand[800],
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: colors.brand[600] },
  statLabel: { fontSize: 10, color: colors.gray[400], marginTop: 2 },
  statDiv: { width: 1, backgroundColor: colors.gray[200] },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  /* Quick action grid */
  qaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  /* Completeness */
  completeCard: {
    backgroundColor: '#fff',
    margin: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.brand[800],
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: 10,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brand[600],
    borderRadius: 4,
  },
  completeHint: { fontSize: 12, color: colors.gray[500] },

  logoutBtn: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
  },
  logoutText: { color: colors.red, fontWeight: '600', fontSize: 15 },
});

// Quick action tile
const qa = StyleSheet.create({
  wrap: {
    width: '47.5%',
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.brand[800],
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  accent: {
    backgroundColor: colors.brand[600],
  },
  icon: { fontSize: 26, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: '700', color: colors.gray[800] },
  accentTitle: { color: '#fff' },
  sub: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
});
