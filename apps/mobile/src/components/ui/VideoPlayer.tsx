import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { colors, spacing, radius } from '../../theme';

interface VideoPlayerProps {
  uri: string;
  title?: string;
  style?: object;
}

export function VideoPlayer({ uri, title, style }: VideoPlayerProps) {
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={{ fontSize: 32 }}>⚠️</Text>
        <Text style={styles.errorText}>Video unavailable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          paused={paused}
          resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoad={(data) => {
            setLoading(false);
            setDuration(data.duration);
          }}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          onProgress={(data) => setCurrentTime(data.currentTime)}
          onEnd={() => {
            setPaused(true);
            setCurrentTime(0);
            videoRef.current?.seek(0);
          }}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        )}

        {/* Play/Pause overlay */}
        {!loading && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={() => setPaused((p) => !p)}
            activeOpacity={0.7}
          >
            {paused && (
              <View style={styles.playBtn}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setPaused((p) => !p)}>
          <Text style={styles.controlIcon}>{paused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>

        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  title: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  playIcon: { color: colors.white, fontSize: 22, marginLeft: 4 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: spacing.sm,
  },
  controlIcon: { color: colors.white, fontSize: 16 },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.brand[400],
    borderRadius: 2,
  },
  timeText: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  errorContainer: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[900],
  },
  errorText: { color: colors.gray[400], marginTop: spacing.xs },
});
