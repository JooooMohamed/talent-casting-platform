import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, Image,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { uploadService } from '../../services/upload.service';
import { UploadButton } from '../../components/ui/UploadButton';
import { colors, spacing, radius, typography } from '../../theme';

type UploadKey = 'photo' | 'intro' | 'scene' | 'portfolio';

export function UploadMediaScreen() {
  const qc = useQueryClient();

  const { data: profile, refetch } = useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () => api.get('/talents/me/profile').then((r) => r.data.data).catch(() => null),
  });

  const [uploading, setUploading] = useState<UploadKey | null>(null);
  const [progress, setProgress] = useState(0);
  const [portfolioTitle, _setPortfolioTitle] = useState('');

  const handleUpload = async (
    key: UploadKey,
    uri: string,
    fileName: string,
    _mimeType: string,
  ) => {
    setUploading(key);
    setProgress(0);

    try {
      switch (key) {
        case 'photo':
          await uploadService.profilePhoto(uri, fileName, (p) => setProgress(p));
          break;
        case 'intro':
          await uploadService.introVideo(uri, fileName, (p) => setProgress(p));
          break;
        case 'scene':
          await uploadService.sceneVideo(uri, fileName, (p) => setProgress(p));
          break;
        case 'portfolio':
          const title = portfolioTitle || `Portfolio ${(profile?.portfolioVideos?.length || 0) + 1}`;
          await uploadService.portfolioVideo(uri, fileName, title, (p) => setProgress(p));
          break;
      }

      await refetch();
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
      Alert.alert('Uploaded!', 'Your media has been submitted for admin review. It will appear on your public profile once approved.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setUploading(null);
      setProgress(0);
    }
  };

  const removePortfolioVideo = async (publicId: string) => {
    Alert.alert('Remove Video', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/talents/me/videos/portfolio/${encodeURIComponent(publicId)}`);
            refetch();
          } catch {
            Alert.alert('Error', 'Failed to remove video');
          }
        },
      },
    ]);
  };

  const videoStatusColor = (status: string) => {
    if (status === 'approved') return colors.green;
    if (status === 'rejected') return colors.red;
    return colors.yellow;
  };

  const videoStatusLabel = (status: string) => {
    if (status === 'approved') return '✓ Approved';
    if (status === 'rejected') return '✗ Rejected';
    return '⏳ Pending review';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Photo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Photo</Text>
        <Text style={styles.sectionDesc}>Your main photo shown on the marketplace card.</Text>

        {profile?.profilePhoto?.url && (
          <Image
            source={{ uri: profile.profilePhoto.url }}
            style={styles.photoPreview}
          />
        )}

        <UploadButton
          label="Profile Photo"
          mediaType="photo"
          currentUrl={profile?.profilePhoto?.url}
          isUploading={uploading === 'photo'}
          progress={uploading === 'photo' ? progress : 0}
          onPicked={(uri, fileName, mime) => handleUpload('photo', uri, fileName, mime)}
          disabled={!!uploading && uploading !== 'photo'}
        />
      </View>

      {/* Intro Video */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Intro Video</Text>
        <Text style={styles.sectionDesc}>A short 30-60 second introduction of yourself. First video casting directors see.</Text>

        {profile?.introVideo && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: videoStatusColor(profile.introVideo.status) }]}>
              {videoStatusLabel(profile.introVideo.status)}
            </Text>
            {profile.introVideo.rejectionReason && (
              <Text style={styles.rejectionReason}>Reason: {profile.introVideo.rejectionReason}</Text>
            )}
          </View>
        )}

        <UploadButton
          label="Intro Video"
          mediaType="video"
          currentUrl={profile?.introVideo?.url}
          isUploading={uploading === 'intro'}
          progress={uploading === 'intro' ? progress : 0}
          onPicked={(uri, fileName, mime) => handleUpload('intro', uri, fileName, mime)}
          disabled={!!uploading && uploading !== 'intro'}
        />
      </View>

      {/* Acting Scene Video */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acting Scene</Text>
        <Text style={styles.sectionDesc}>A 1-3 minute acting scene or monologue that showcases your range.</Text>

        {profile?.sceneVideo && (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: videoStatusColor(profile.sceneVideo.status) }]}>
              {videoStatusLabel(profile.sceneVideo.status)}
            </Text>
          </View>
        )}

        <UploadButton
          label="Acting Scene Video"
          mediaType="video"
          currentUrl={profile?.sceneVideo?.url}
          isUploading={uploading === 'scene'}
          progress={uploading === 'scene' ? progress : 0}
          onPicked={(uri, fileName, mime) => handleUpload('scene', uri, fileName, mime)}
          disabled={!!uploading && uploading !== 'scene'}
        />
      </View>

      {/* Portfolio Videos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio Videos</Text>
        <Text style={styles.sectionDesc}>Up to 5 videos of your best work. Add title for each video.</Text>

        {/* Existing portfolio videos */}
        {profile?.portfolioVideos?.map((v: any, i: number) => (
          <View key={v.publicId || i} style={styles.portfolioItem}>
            <View style={styles.portfolioItemLeft}>
              <Text style={styles.portfolioTitle}>{v.title || `Video ${i + 1}`}</Text>
              <Text style={[styles.statusText, { color: videoStatusColor(v.status), fontSize: 12 }]}>
                {videoStatusLabel(v.status)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => removePortfolioVideo(v.publicId)}>
              <Text style={styles.removeBtn}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}

        {(!profile?.portfolioVideos || profile.portfolioVideos.length < 5) && (
          <UploadButton
            label="Add Portfolio Video"
            mediaType="video"
            isUploading={uploading === 'portfolio'}
            progress={uploading === 'portfolio' ? progress : 0}
            onPicked={(uri, fileName, mime) => handleUpload('portfolio', uri, fileName, mime)}
            disabled={!!uploading && uploading !== 'portfolio'}
          />
        )}

        {profile?.portfolioVideos?.length >= 5 && (
          <Text style={styles.limitReached}>Maximum 5 portfolio videos reached.</Text>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>📌 Upload Tips</Text>
        <Text style={styles.tipsItem}>• Videos are reviewed by admin before going live</Text>
        <Text style={styles.tipsItem}>• Max video size: 200MB · Formats: MP4, MOV</Text>
        <Text style={styles.tipsItem}>• Good lighting and clear audio make a big difference</Text>
        <Text style={styles.tipsItem}>• Portrait or landscape both work fine</Text>
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
    marginBottom: 0,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  sectionTitle: { ...typography.h3, color: colors.gray[900], marginBottom: 4 },
  sectionDesc: { ...typography.caption, color: colors.gray[500], marginBottom: spacing.md, lineHeight: 17 },
  photoPreview: {
    width: 100, height: 100, borderRadius: radius.lg,
    marginBottom: spacing.sm, borderWidth: 2, borderColor: colors.gray[200],
  },
  statusRow: { marginBottom: spacing.sm },
  statusText: { ...typography.label, fontWeight: '600' },
  rejectionReason: { ...typography.caption, color: colors.red, marginTop: 2 },
  portfolioItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.gray[50], borderRadius: radius.md, padding: spacing.sm,
    marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.gray[100],
  },
  portfolioItemLeft: { flex: 1 },
  portfolioTitle: { ...typography.label, color: colors.gray[800] },
  removeBtn: { color: colors.red, fontWeight: '600', fontSize: 13 },
  limitReached: { ...typography.caption, color: colors.gray[400], textAlign: 'center', padding: spacing.sm },
  tips: {
    margin: spacing.md,
    backgroundColor: colors.brand[50],
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.brand[100],
  },
  tipsTitle: { ...typography.label, color: colors.brand[700], marginBottom: spacing.sm },
  tipsItem: { ...typography.caption, color: colors.brand[700], marginBottom: 4, lineHeight: 18 },
});
