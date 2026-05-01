import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
  Dimensions, PanResponder, StatusBar,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import { colors, spacing, radius } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoPlayerProps {
  uri: string;
  title?: string;
  style?: object;
}

export function VideoPlayer({ uri, title, style }: VideoPlayerProps) {
  const videoRef = useRef<VideoRef>(null);
  const [paused, setPaused] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [muted, setMuted] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (buffered / duration) * 100 : 0;

  // Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!paused) setShowControls(false);
    }, 3000);
  }, [paused]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimeout]);

  useEffect(() => {
    if (isFullscreen) {
      StatusBar.setHidden(true);
    } else {
      StatusBar.setHidden(false);
    }
    return () => StatusBar.setHidden(false);
  }, [isFullscreen]);

  const togglePlayPause = () => {
    setPaused(prev => !prev);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    resetControlsTimeout();
  };

  const seekTo = (percent: number) => {
    if (videoRef.current && duration > 0) {
      const newTime = (percent / 100) * duration;
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
    }
  };

  const handleProgressBarPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const progressBarWidth = (isFullscreen ? screenHeight : screenWidth) - spacing.md * 2;
    const percent = (locationX / progressBarWidth) * 100;
    seekTo(Math.max(0, Math.min(100, percent)));
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: resetControlsTimeout,
    onPanResponderMove: () => resetControlsTimeout,
    onPanResponderRelease: handleProgressBarPress,
  });

  const containerStyle = isFullscreen ? styles.fullscreenContainer : [styles.container, style];
  const videoWrapperStyle = isFullscreen ? styles.fullscreenVideoWrapper : styles.videoWrapper;

  if (error) {
    return (
      <View style={[containerStyle, styles.errorContainer]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            setPaused(true);
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {title && !isFullscreen && <Text style={styles.title}>{title}</Text>}

      <View style={videoWrapperStyle}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          paused={paused}
          muted={muted}
          resizeMode={isFullscreen ? "contain" : "contain"}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoad={(data) => {
            setLoading(false);
            setDuration(data.duration);
            setCurrentTime(0);
          }}
          onError={(err) => {
            console.error('Video error:', err);
            setLoading(false);
            setError(err.error?.localizedDescription || 'Video failed to load');
          }}
          onProgress={(data) => {
            setCurrentTime(data.currentTime);
            setBuffered(data.playableDuration || 0);
          }}
          onEnd={() => {
            setPaused(true);
            setCurrentTime(0);
            videoRef.current?.seek(0);
            setShowControls(true);
          }}
          onBuffer={({ isBuffering }) => {
            setLoading(isBuffering);
          }}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
          controls={false}
          playInBackground={false}
          playWhenInactive={false}
        />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {/* Play/Pause overlay */}
        {!loading && paused && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={togglePlayPause}
            activeOpacity={0.7}
          >
            <View style={styles.playBtn}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Tap to show controls */}
        {!loading && (
          <TouchableOpacity
            style={styles.tapOverlay}
            onPress={() => setShowControls(prev => !prev)}
            activeOpacity={1}
          />
        )}
      </View>

      {/* Controls */}
      {showControls && !loading && (
        <View style={[styles.controls, isFullscreen && styles.fullscreenControls]}>
          <TouchableOpacity onPress={togglePlayPause}>
            <Text style={styles.controlIcon}>{paused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressContainer} {...panResponder.panHandlers}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBuffered, { width: `${bufferedPercent}%` }]} />
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <View style={[styles.progressHandle, { left: `${progressPercent}%` }]} />
          </View>

          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>

          {/* Volume control */}
          <TouchableOpacity onPress={() => setMuted(prev => !prev)}>
            <Text style={styles.controlIcon}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>

          {/* Fullscreen toggle */}
          <TouchableOpacity onPress={toggleFullscreen}>
            <Text style={styles.controlIcon}>{isFullscreen ? '⛶' : '⛶'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  fullscreenContainer: {
    backgroundColor: colors.black,
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenHeight,
    height: screenWidth,
    zIndex: 9999,
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
  fullscreenVideoWrapper: {
    width: screenHeight,
    height: screenWidth,
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
  loadingText: {
    color: colors.white,
    marginTop: spacing.sm,
    fontSize: 14,
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
  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: spacing.sm,
  },
  fullscreenControls: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  controlIcon: { color: colors.white, fontSize: 16 },
  progressContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBuffered: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.brand[400],
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressHandle: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.brand[400],
    marginLeft: -6,
  },
  timeText: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  errorIcon: { fontSize: 32 },
  errorText: { color: colors.gray[400], marginTop: spacing.xs },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.brand[500],
    borderRadius: radius.md,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
  },
});
