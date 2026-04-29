import React, { useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, ScrollView, Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { TalentCategory } from '@talent-casting/shared';
import { api } from '../../services/api';
import { colors, spacing, radius, getAvatarColor } from '../../theme';

const { width: W } = Dimensions.get('window');
const CARD_W = (W - spacing.md * 3) / 2;

// ── Filter categories ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All',        emoji: '✨', value: undefined },
  { label: 'Drama',      emoji: '🎭', value: TalentCategory.DRAMA },
  { label: 'Comedy',     emoji: '🎬', value: TalentCategory.COMEDY },
  { label: 'Modeling',   emoji: '👗', value: TalentCategory.MODELING },
  { label: 'Dance',      emoji: '💃', value: TalentCategory.DANCE },
  { label: 'Singing',    emoji: '🎵', value: TalentCategory.SINGING },
  { label: 'Voice Over', emoji: '🎙️', value: TalentCategory.VOICE_OVER },
  { label: 'Presenting', emoji: '📺', value: TalentCategory.PRESENTING },
  { label: 'Commercial', emoji: '📣', value: TalentCategory.COMMERCIAL },
];

// ── Featured horizontal card ──────────────────────────────────────────────────
function FeaturedCard({ talent, onPress }: any) {
  const initials = talent.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const bg = getAvatarColor(talent.fullName);
  return (
    <TouchableOpacity style={featured.card} onPress={onPress} activeOpacity={0.88}>
      <View style={[featured.photo, { backgroundColor: bg }]}>
        {talent.profilePhoto?.url
          ? <Image source={{ uri: talent.profilePhoto.url }} style={featured.img} />
          : <Text style={featured.initials}>{initials}</Text>}
        <View style={featured.overlay}>
          <View style={featured.starBadge}><Text style={featured.starText}>⭐ Featured</Text></View>
        </View>
        {talent.isVerified && (
          <View style={featured.verifiedDot}>
            <Text style={{ fontSize: 8, color: '#fff' }}>✓</Text>
          </View>
        )}
      </View>
      <Text style={featured.name} numberOfLines={1}>{talent.fullName}</Text>
      <Text style={featured.sub} numberOfLines={1}>
        {talent.categories?.[0]?.replace('_', ' ')} · {talent.city}
      </Text>
    </TouchableOpacity>
  );
}

// ── Grid talent card ──────────────────────────────────────────────────────────
function TalentCard({ talent, onPress }: any) {
  const initials = talent.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const bg = getAvatarColor(talent.fullName);
  const isAvail = talent.availability === 'available';

  return (
    <TouchableOpacity style={[card.wrap, { width: CARD_W }]} onPress={onPress} activeOpacity={0.88}>
      {/* Photo area */}
      <View style={[card.photo, { backgroundColor: bg }]}>
        {talent.profilePhoto?.url
          ? <Image source={{ uri: talent.profilePhoto.url }} style={card.img} />
          : <Text style={card.initials}>{initials}</Text>}

        {/* Availability dot */}
        <View style={[card.dot, { backgroundColor: isAvail ? '#10B981' : '#9CA3AF' }]} />

        {talent.isVerified && (
          <View style={card.verifiedBadge}>
            <Text style={{ fontSize: 9, color: '#fff', fontWeight: '700' }}>✓</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={card.info}>
        <Text style={card.name} numberOfLines={1}>{talent.fullName}</Text>
        <Text style={card.loc} numberOfLines={1}>📍 {[talent.city, talent.country].filter(Boolean).join(', ')}</Text>
        {talent.categories?.[0] && (
          <View style={card.tag}>
            <Text style={card.tagText}>{talent.categories[0].replace('_', ' ')}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export function MarketplaceScreen({ navigation }: any) {
  const [search, setSearch]     = useState('');
  const [catIdx, setCatIdx]     = useState(0);
  const [page, setPage]         = useState(1);
  const cat = CATEGORIES[catIdx];

  const { data, isLoading } = useQuery({
    queryKey: ['marketplace', search, page, cat.value],
    queryFn: () =>
      api.get('/talents', { params: { search, page, limit: 20, category: cat.value } })
        .then((r) => r.data.data),
  });

  const allItems    = data?.items ?? [];
  const featuredItems = allItems.filter((t: any) => t.isFeatured);

  const ListHeader = () => (
    <>
      {featuredItems.length > 0 && (
        <View style={s.featSection}>
          <View style={s.rowBetween}>
            <Text style={s.sectionLabel}>✨ Featured</Text>
            <Text style={s.countPill}>{featuredItems.length} talents</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: spacing.md }}>
            {featuredItems.map((t: any) => (
              <FeaturedCard key={t._id} talent={t} onPress={() => navigation.navigate('TalentProfile', { slug: t.slug })} />
            ))}
          </ScrollView>
        </View>
      )}
      <View style={[s.rowBetween, { marginBottom: spacing.sm }]}>
        <Text style={s.sectionLabel}>🎬 All Talents</Text>
        <Text style={s.countPill}>{data?.total ?? 0}</Text>
      </View>
    </>
  );

  return (
    <View style={s.container}>

      {/* ── Sticky header ── */}
      <View style={s.header}>
        {/* Title row */}
        <View style={s.titleRow}>
          <View>
            <Text style={s.headerTitle}>Discover</Text>
            <Text style={s.headerSub}>Find your perfect talent</Text>
          </View>
          <View style={s.headerBadge}><Text style={{ fontSize: 26 }}>🎬</Text></View>
        </View>

        {/* Search */}
        <View style={s.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search by name, skill, city…"
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={(t) => { setSearch(t); setPage(1); }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.gray[400], fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catContent}>
          {CATEGORIES.map((c, i) => (
            <TouchableOpacity
              key={c.label}
              style={[s.chip, catIdx === i && s.chipActive]}
              onPress={() => { setCatIdx(i); setPage(1); }}
            >
              <Text style={[s.chipText, catIdx === i && s.chipTextActive]}>
                {c.emoji} {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── List ── */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 48 }} color={colors.brand[600]} size="large" />
      ) : (
        <FlatList
          data={allItems}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={s.row}
          ListHeaderComponent={<ListHeader />}
          renderItem={({ item }) => (
            <TalentCard talent={item} onPress={() => navigation.navigate('TalentProfile', { slug: item.slug })} />
          )}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={{ fontSize: 48 }}>🎭</Text>
              <Text style={s.emptyTitle}>No talents found</Text>
              <Text style={s.emptySub}>Try a different search or category</Text>
            </View>
          }
          onEndReached={() => { if (data?.page < data?.totalPages) setPage((p) => p + 1); }}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
}

// ── Stylesheet ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },

  header: {
    backgroundColor: colors.brand[800],
    paddingTop: 52,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  headerSub:   { fontSize: 13, color: colors.brand[300], marginTop: 2 },
  headerBadge: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
  },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: colors.gray[900] },

  catContent: { gap: 8, paddingRight: spacing.md, paddingBottom: 2 },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  chipActive: { backgroundColor: '#fff' },
  chipText:   { fontSize: 12, color: '#E9D5FF', fontWeight: '500' },
  chipTextActive: { color: colors.brand[800], fontWeight: '700' },

  list: { padding: spacing.md, paddingTop: spacing.md },
  row:  { justifyContent: 'space-between', marginBottom: spacing.sm },

  featSection: { marginBottom: spacing.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  countPill: {
    backgroundColor: colors.brand[100], borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    fontSize: 12, color: colors.brand[700], fontWeight: '600',
  },

  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[700] },
  emptySub:   { fontSize: 13, color: colors.gray[400] },
});

// ── Featured styles ───────────────────────────────────────────────────────────
const featured = StyleSheet.create({
  card: { width: 150, marginRight: 0 },
  photo: { width: 150, height: 175, borderRadius: 18, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  img:   { width: '100%', height: '100%', position: 'absolute' },
  initials: { fontSize: 40, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: 'rgba(0,0,0,0.28)' },
  starBadge: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  starText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  verifiedDot: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: colors.blue, width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  name: { fontSize: 13, fontWeight: '700', color: colors.gray[900] },
  sub:  { fontSize: 11, color: colors.gray[500], textTransform: 'capitalize' },
});

// ── Grid card styles ──────────────────────────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: colors.brand[800],
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 4,
  },
  photo: { width: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  img:   { width: '100%', height: '100%', position: 'absolute' },
  initials: { fontSize: 36, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  dot: { position: 'absolute', top: 10, left: 10, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#fff' },
  verifiedBadge: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: colors.blue, width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  info: { padding: 10 },
  name: { fontSize: 13, fontWeight: '700', color: colors.gray[900], marginBottom: 2 },
  loc:  { fontSize: 10, color: colors.gray[400], marginBottom: 6 },
  tag:  { backgroundColor: colors.brand[100], borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  tagText: { fontSize: 10, color: colors.brand[700], fontWeight: '600', textTransform: 'capitalize' },
});
