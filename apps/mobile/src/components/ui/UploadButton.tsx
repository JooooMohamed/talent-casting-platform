import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator,
} from 'react-native';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { colors, spacing, radius, typography } from '../../theme';

interface UploadButtonProps {
  label: string;
  mediaType: 'photo' | 'video' | 'mixed';
  onPicked: (uri: string, fileName: string, mimeType: string) => void;
  isUploading?: boolean;
  progress?: number;
  currentUrl?: string;
  disabled?: boolean;
}

export function UploadButton({
  label,
  mediaType,
  onPicked,
  isUploading = false,
  progress = 0,
  currentUrl,
  disabled = false,
}: UploadButtonProps) {
  const handlePick = () => {
    Alert.alert(label, 'Choose source', [
      {
        text: 'Camera',
        onPress: () => openPicker('camera'),
      },
      {
        text: 'Gallery / Files',
        onPress: () => openPicker('library'),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const openPicker = (source: 'camera' | 'library') => {
    const options = {
      mediaType: mediaType as MediaType,
      quality: 0.8 as 0.8,
      videoQuality: 'high' as 'high',
      durationLimit: 300, // 5 minutes max
      includeBase64: false,
    };

    const launcher = source === 'camera' ? launchCamera : launchImageLibrary;

    launcher(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      const fileName = asset.fileName || `upload_${Date.now()}.${mediaType === 'photo' ? 'jpg' : 'mp4'}`;
      const mimeType = asset.type || (mediaType === 'photo' ? 'image/jpeg' : 'video/mp4');

      onPicked(asset.uri, fileName, mimeType);
    });
  };

  return (
    <TouchableOpacity
      style={[styles.btn, (isUploading || disabled) && styles.btnDisabled]}
      onPress={handlePick}
      disabled={isUploading || disabled}
      activeOpacity={0.8}
    >
      {isUploading ? (
        <View style={styles.uploadingRow}>
          <ActivityIndicator size="small" color={colors.brand[600]} />
          <Text style={styles.uploadingText}>Uploading {progress}%</Text>
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={styles.icon}>
            {mediaType === 'photo' ? '📷' : '🎬'}
          </Text>
          <View style={styles.info}>
            <Text style={styles.label}>{label}</Text>
            {currentUrl ? (
              <Text style={styles.uploaded}>✓ Uploaded — tap to replace</Text>
            ) : (
              <Text style={styles.hint}>Tap to choose from camera or gallery</Text>
            )}
          </View>
          <Text style={styles.arrow}>›</Text>
        </View>
      )}

      {/* Progress bar */}
      {isUploading && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  btnDisabled: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, justifyContent: 'center' },
  icon: { fontSize: 24 },
  info: { flex: 1 },
  label: { ...typography.label, color: colors.gray[800] },
  hint: { ...typography.caption, color: colors.gray[400], marginTop: 2 },
  uploaded: { ...typography.caption, color: colors.green, marginTop: 2 },
  arrow: { fontSize: 20, color: colors.gray[400] },
  uploadingText: { ...typography.body, color: colors.brand[600], fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: colors.gray[100], borderRadius: 4, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: colors.brand[600], borderRadius: 4 },
});
