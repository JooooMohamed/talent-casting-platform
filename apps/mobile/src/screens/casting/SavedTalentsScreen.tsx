import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { colors, spacing, radius, typography } from '../../theme';

export function SavedTalentsScreen({ navigation }: any) {
  const qc = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['saved-talents'],
    queryFn: () => api.get('/casting/me/saved').then(r => r.data.data),
    staleTime: 0,
  });

  const onRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const removeMutation = useMutation({
    mutationFn: (profileId: string) =>
      api.delete(`/casting/me/saved/${profileId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-talents'] }),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Talents</Text>
        <Text style={styles.sub}>{data?.length ?? 0} saved</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          color={colors.brand[600]}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={onRefresh}
              tintColor="#7C3AED"
              colors={['#7C3AED']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={{ fontSize: 48 }}>❤️</Text>
              <Text style={styles.emptyTitle}>No Saved Talents</Text>
              <Text style={styles.emptyDesc}>
                Browse the marketplace and save talents you love.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('TalentProfile', { slug: item.slug })
              }
            >
              <View style={styles.photo}>
                {item.profilePhoto?.url ? (
                  <Image
                    source={{ uri: item.profilePhoto.url }}
                    style={styles.photoImg}
                  />
                ) : (
                  <View style={[styles.photoImg, styles.photoFallback]}>
                    <Text style={styles.initials}>{item.fullName?.[0]}</Text>
                  </View>
                )}
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.location}>
                  {[item.city, item.country].filter(Boolean).join(', ')}
                </Text>
                {item.categories?.length > 0 && (
                  <View style={styles.tagRow}>
                    {item.categories.slice(0, 2).map((c: string) => (
                      <View key={c} style={styles.tag}>
                        <Text style={styles.tagText}>
                          {c.replace('_', ' ')}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={() => removeMutation.mutate(item._id)}>
                <Text style={{ fontSize: 20 }}>❤️</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    paddingTop: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  title: { ...typography.h2, color: colors.gray[900] },
  sub: { ...typography.caption, color: colors.gray[500], marginTop: 2 },
  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: spacing.md,
  },
  photo: {},
  photoImg: { width: 56, height: 56, borderRadius: radius.md },
  photoFallback: {
    backgroundColor: colors.brand[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { fontSize: 20, fontWeight: '700', color: colors.brand[600] },
  info: { flex: 1 },
  name: { ...typography.h3, color: colors.gray[900] },
  location: { ...typography.caption, color: colors.gray[500], marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  tag: {
    backgroundColor: colors.brand[50],
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    color: colors.brand[700],
    textTransform: 'capitalize',
  },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: {
    ...typography.h3,
    color: colors.gray[700],
    marginTop: spacing.md,
  },
  emptyDesc: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
