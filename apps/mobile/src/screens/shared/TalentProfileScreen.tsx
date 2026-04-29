import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/auth.store';
import { colors, spacing, radius, getAvatarColor } from '../../theme';
import { VideoPlayer } from '../../components/ui/VideoPlayer';

const LANG_LEVEL_COLOR: Record<string, string> = {
  native: colors.green,
  fluent: colors.brand[600],
  conversational: colors.yellow,
  basic: colors.gray[400],
};

function StatChip({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) {
  return (
    <View style={stat.wrap}>
      <Text style={stat.icon}>{icon}</Text>
      <Text style={stat.value}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

export function TalentProfileScreen({ route }: any) {
  const { slug } = route.params;
  const user = useAuthStore(s => s.user);
  const qc = useQueryClient();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data, isLoading } = useQuery({
    queryKey: ['talent-profile', slug],
    queryFn: () => api.get(`/talents/${slug}`).then(r => r.data.data),
    staleTime: 0,
  });

  // Also fetch own profile to compare — so talent can see their own pending media
  const { data: myProfile } = useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () =>
      api
        .get('/talents/me/profile')
        .then(r => r.data.data)
        .catch(() => null),
    enabled: user?.role === 'talent',
  });

  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading]);

  const isOwnProfile = user?.role === 'talent' && myProfile?.slug === slug;

  const saveMutation = useMutation({
    mutationFn: (profileId: string) =>
      api.post(`/casting/me/saved/${profileId}`),
    onSuccess: () => {
      Alert.alert('Saved! ❤️', 'Talent added to your favourites.');
      qc.invalidateQueries({ queryKey: ['saved-talents'] });
    },
  });

  const contactMutation = useMutation({
    mutationFn: (profileId: string) =>
      api.post(`/contact-requests/talents/${profileId}`, {
        message: 'I would like to discuss a potential casting opportunity.',
      }),
    onSuccess: () =>
      Alert.alert('Request sent', 'The talent will be notified.'),
    onError: (e: any) =>
      Alert.alert(
        'Error',
        e.response?.data?.error || 'Failed to send contact request.',
      ),
  });

  if (isLoading) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 40 }}>🎭</Text>
        <Text style={{ color: colors.gray[400], marginTop: 12 }}>
          Loading profile…
        </Text>
      </View>
    );
  }

  if (!data && !isOwnProfile) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 40 }}>😕</Text>
        <Text style={{ color: colors.gray[400], marginTop: 12 }}>
          Profile not found.
        </Text>
      </View>
    );
  }

  // Own profile: use full myProfile data so pending media is visible
  const t = isOwnProfile ? myProfile ?? data : data;
  if (!t) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 40 }}>😕</Text>
        <Text style={{ color: colors.gray[400], marginTop: 12 }}>
          Profile not found.
        </Text>
      </View>
    );
  }

  const initials = t.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const avatarBg = getAvatarColor(t.fullName);
  const isAvail = t.availability === 'available';

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Hero ── */}
        <View style={s.hero}>
          {/* Decorative circle */}
          <View style={s.heroCircle} />

          {/* Photo */}
          <View style={s.photoRing}>
            <View style={[s.photo, { backgroundColor: avatarBg }]}>
              {t.profilePhoto?.url ? (
                <Image
                  source={{ uri: t.profilePhoto.url }}
                  style={s.photoImg}
                />
              ) : (
                <Text style={s.photoInitials}>{initials}</Text>
              )}
            </View>
          </View>

          {/* Name + meta */}
          <Text style={s.heroName}>{t.fullName}</Text>

          <View style={s.heroMeta}>
            {t.isVerified && (
              <View style={s.verifiedBadge}>
                <Text style={s.verifiedText}>✓ Verified</Text>
              </View>
            )}
            {t.city || t.country ? (
              <View style={s.locBadge}>
                <Text style={s.locText}>
                  📍 {[t.city, t.country].filter(Boolean).join(', ')}
                </Text>
              </View>
            ) : null}
            <View
              style={[
                s.availBadge,
                {
                  backgroundColor: isAvail
                    ? colors.greenLight
                    : colors.gray[100],
                },
              ]}
            >
              <Text
                style={[
                  s.availText,
                  { color: isAvail ? colors.green : colors.gray[500] },
                ]}
              >
                {isAvail ? '● Available' : '○ Unavailable'}
              </Text>
            </View>
          </View>

          {/* Category tags */}
          {t.categories?.length > 0 && (
            <View style={s.catRow}>
              {t.categories.map((c: string) => (
                <View key={c} style={s.catChip}>
                  <Text style={s.catText}>{c.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Stats bar ── */}
        {(t.experience || t.height || t.age) && (
          <View style={s.statsBar}>
            {t.experience && (
              <StatChip icon="🏆" value={t.experience} label="Experience" />
            )}
            {t.height && (
              <StatChip icon="📏" value={`${t.height} cm`} label="Height" />
            )}
            {t.eyeColor && (
              <StatChip icon="👁️" value={t.eyeColor} label="Eyes" />
            )}
            {t.hairColor && (
              <StatChip icon="💇" value={t.hairColor} label="Hair" />
            )}
          </View>
        )}

        {/* ── Bio ── */}
        {t.bio && (
          <View style={s.section}>
            <Text style={s.secTitle}>About</Text>
            <Text style={s.bioText}>{t.bio}</Text>
          </View>
        )}

        {/* ── Languages ── */}
        {t.languages?.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Languages</Text>
            <View style={s.langGrid}>
              {t.languages.map((l: any) => (
                <View key={l.language} style={s.langCard}>
                  <Text style={s.langName}>{l.language}</Text>
                  <View
                    style={[
                      s.langLevelBadge,
                      {
                        backgroundColor: `${
                          LANG_LEVEL_COLOR[l.level?.toLowerCase()] ??
                          colors.gray[400]
                        }18`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.langLevel,
                        {
                          color:
                            LANG_LEVEL_COLOR[l.level?.toLowerCase()] ??
                            colors.gray[500],
                        },
                      ]}
                    >
                      {l.level}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Skills ── */}
        {t.skills?.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Skills</Text>
            <View style={s.skillRow}>
              {t.skills.map((sk: string) => (
                <View key={sk} style={s.skillChip}>
                  <Text style={s.skillText}>{sk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Videos ── */}
        {t.introVideo?.url &&
          (t.introVideo.status === 'approved' || isOwnProfile) && (
            <View style={s.section}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={s.secTitle}>🎥 Intro Video</Text>
                {isOwnProfile && t.introVideo.status !== 'approved' && (
                  <View
                    style={[
                      s.pendingBadge,
                      {
                        marginLeft: 8,
                        backgroundColor:
                          t.introVideo.status === 'rejected'
                            ? colors.redLight
                            : colors.yellowLight,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color:
                          t.introVideo.status === 'rejected'
                            ? colors.red
                            : colors.yellow,
                        fontWeight: '600',
                      }}
                    >
                      {t.introVideo.status === 'rejected'
                        ? '✕ Rejected'
                        : '⏳ Pending'}
                    </Text>
                  </View>
                )}
              </View>
              <VideoPlayer uri={t.introVideo.url} style={s.video} />
            </View>
          )}

        {t.sceneVideo?.url &&
          (t.sceneVideo.status === 'approved' || isOwnProfile) && (
            <View style={s.section}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={s.secTitle}>🎭 Acting Scene</Text>
                {isOwnProfile && t.sceneVideo.status !== 'approved' && (
                  <View
                    style={[
                      s.pendingBadge,
                      {
                        marginLeft: 8,
                        backgroundColor:
                          t.sceneVideo.status === 'rejected'
                            ? colors.redLight
                            : colors.yellowLight,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color:
                          t.sceneVideo.status === 'rejected'
                            ? colors.red
                            : colors.yellow,
                        fontWeight: '600',
                      }}
                    >
                      {t.sceneVideo.status === 'rejected'
                        ? '✕ Rejected'
                        : '⏳ Pending'}
                    </Text>
                  </View>
                )}
              </View>
              <VideoPlayer uri={t.sceneVideo.url} style={s.video} />
            </View>
          )}

        {t.portfolioVideos?.filter(
          (v: any) => v.status === 'approved' || isOwnProfile,
        ).length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>🎬 Portfolio</Text>
            {t.portfolioVideos
              .filter((v: any) => v.status === 'approved' || isOwnProfile)
              .map((v: any, i: number) => (
                <View
                  key={v.publicId || i}
                  style={{ marginBottom: spacing.md }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    {v.title && <Text style={s.videoTitle}>{v.title}</Text>}
                    {isOwnProfile && v.status !== 'approved' && (
                      <View
                        style={[
                          s.pendingBadge,
                          {
                            marginLeft: 6,
                            backgroundColor:
                              v.status === 'rejected'
                                ? colors.redLight
                                : colors.yellowLight,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color:
                              v.status === 'rejected'
                                ? colors.red
                                : colors.yellow,
                            fontWeight: '600',
                          }}
                        >
                          {v.status === 'rejected'
                            ? '✕ Rejected'
                            : '⏳ Pending'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <VideoPlayer uri={v.url} style={s.video} />
                </View>
              ))}
          </View>
        )}
      </ScrollView>

      {/* ── Floating CTA bar ── */}
      {user?.role === 'casting' && (
        <View style={s.floatingBar}>
          <TouchableOpacity
            style={s.saveBtn}
            onPress={() => saveMutation.mutate(t._id)}
            activeOpacity={0.85}
          >
            <Text style={s.saveBtnText}>❤️ Save Talent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.contactBtn}
            activeOpacity={0.85}
            onPress={() => contactMutation.mutate(t._id)}
            disabled={contactMutation.isPending}
          >
            <Text style={s.contactBtnText}>
              {contactMutation.isPending ? 'Sending...' : '✉️  Contact'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray[50] },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },

  /* Hero */
  hero: {
    backgroundColor: colors.brand[800],
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(139,92,246,0.18)',
    top: -60,
    right: -60,
  },
  photoRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  photo: {
    width: 106,
    height: 106,
    borderRadius: 53,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoInitials: {
    fontSize: 36,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },

  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },

  verifiedBadge: {
    backgroundColor: colors.blueLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: { fontSize: 11, color: colors.blue, fontWeight: '700' },
  locBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  locText: { fontSize: 11, color: '#fff', fontWeight: '500' },
  availBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  availText: { fontSize: 11, fontWeight: '600' },

  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  catChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  catText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  /* Stats bar */
  statsBar: {
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

  /* Section */
  section: {
    backgroundColor: '#fff',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.brand[800],
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  secTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },

  bioText: { fontSize: 14, color: colors.gray[600], lineHeight: 22 },

  /* Languages */
  langGrid: { gap: 8 },
  langCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  langName: { fontSize: 14, fontWeight: '600', color: colors.gray[800] },
  langLevelBadge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  langLevel: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },

  /* Skills */
  skillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: {
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.brand[200],
  },
  skillText: { fontSize: 12, color: colors.brand[700], fontWeight: '500' },

  /* Videos */
  video: { marginTop: 4, borderRadius: radius.md, overflow: 'hidden' },
  videoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
  },
  pendingBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  /* Floating CTA */
  floatingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.brand[600],
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  contactBtn: {
    flex: 1,
    backgroundColor: colors.brand[50],
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.brand[200],
  },
  contactBtnText: { color: colors.brand[700], fontWeight: '700', fontSize: 15 },
});

const stat = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  icon: { fontSize: 18, marginBottom: 2 },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray[800],
    textTransform: 'capitalize',
  },
  label: { fontSize: 10, color: colors.gray[400], marginTop: 1 },
});
