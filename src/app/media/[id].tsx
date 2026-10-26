import { FadeIn, SlideIn } from '@/components/FadeIn';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetMediaById } from '@/hooks/useMediaQueries';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const MEDIA_ACCENT: Record<string, string> = {
  video: '#6366F1',
  audio: '#10B981',
  image: '#F59E0B',
  youtube: '#FF0000',
};

function AnimatedPressable({ onPress, disabled, style, children }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function YoutubePlayer({ youtubeId, width }: { youtubeId: string; width: number }) {
  const [webLoading, setWebLoading] = useState(true);
  const height = Math.round(width * (9 / 16));

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; background: #000; }
          html, body { width: 100%; height: 100%; overflow: hidden; }
          iframe { width: 100%; height: 100%; border: none; display: block; }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.youtube.com/embed/${youtubeId}?playsinline=1&rel=0&modestbranding=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  return (
    <View style={[styles.playerContainer, { width, height }]}>
      {webLoading && (
        <View style={styles.playerLoading}>
          <ActivityIndicator size="large" color="#FF0000" />
        </View>
      )}
      <WebView
        source={{ html }}
        style={{ width, height, backgroundColor: '#000' }}
        allowsFullscreenVideo
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setWebLoading(false)}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function NativeVideoPlayer({ source, width }: { source: any; width: number }) {
  const height = Math.round(width * (9 / 16));
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
  });

  return (
    <View style={[styles.playerContainer, { width, height }]}>
      <VideoView
        style={{ width, height, backgroundColor: '#000' }}
        player={player}
        allowsPictureInPicture
        nativeControls
        contentFit="contain"
      />
    </View>
  );
}

function NativeAudioPlayer({ source, width }: { source: any; width: number }) {
  const player = useAudioPlayer(source, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (direction: 'forward' | 'backward') => {
    const delta = direction === 'forward' ? 10 : -10;
    const target = Math.max(0, Math.min(status.duration || 0, (status.currentTime || 0) + delta));
    player.seekTo(target);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent =
    status.duration > 0
      ? Math.min(100, Math.max(0, ((status.currentTime || 0) / status.duration) * 100))
      : 0;

  return (
    <View style={[styles.nativeAudioBox, { width }]}>
      {/* Progress & Time */}
      <View style={styles.audioProgressCol}>
        <View style={styles.audioProgressBarTrack}>
          <View style={[styles.audioProgressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.audioTimeRow}>
          <Text style={styles.audioTimeText}>{formatTime(status.currentTime)}</Text>
          <Text style={styles.audioTimeText}>{formatTime(status.duration)}</Text>
        </View>
      </View>

      {/* Playback Controls */}
      <View style={styles.audioControlsRow}>
        <Pressable
          onPress={() => handleSeek('backward')}
          style={styles.audioSecondaryBtn}
          accessibilityLabel="Rewind 10 seconds"
        >
          <Ionicons name="play-back" size={20} color="#10B981" />
        </Pressable>

        <Pressable
          onPress={togglePlay}
          style={styles.audioMainPlayBtn}
          accessibilityLabel={status.playing ? 'Pause' : 'Play'}
        >
          {status.isBuffering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name={status.playing ? 'pause' : 'play'}
              size={26}
              color="#fff"
              style={{ marginLeft: status.playing ? 0 : 2 }}
            />
          )}
        </Pressable>

        <Pressable
          onPress={() => handleSeek('forward')}
          style={styles.audioSecondaryBtn}
          accessibilityLabel="Forward 10 seconds"
        >
          <Ionicons name="play-forward" size={20} color="#10B981" />
        </Pressable>
      </View>
    </View>
  );
}

export default function MediaViewerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: media, isLoading: loading, isError } = useGetMediaById(id as string);
  const playerWidth = width - Spacing.lg * 2;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/media');
    }
  };

  const accent = media ? (MEDIA_ACCENT[media.type] ?? colors.primary) : colors.primary;

  const videoSource = media
    ? media.localAsset ?? (media.filePath ? `${process.env.EXPO_PUBLIC_API_URL}${media.filePath}` : null)
    : null;

  const audioSource = media
    ? media.localAsset ?? (media.filePath ? `${process.env.EXPO_PUBLIC_API_URL}${media.filePath}` : null)
    : null;

  const languageDisplay =
    media?.language === 'en'
      ? 'English'
      : media?.language === 'ar'
        ? 'العربية'
        : media?.language === 'ur'
          ? 'اردو'
          : 'All Languages';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.navBar}>
          <View style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SkeletonLoader
            width="100%"
            height={Math.round(((width - Spacing.lg * 2) * 9) / 16)}
            borderRadius={BorderRadius.xl}
          />
          <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
            <SkeletonLoader width="70%" height={28} />
            <SkeletonLoader width="40%" height={16} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !media) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.navBar}>
          <AnimatedPressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </AnimatedPressable>
        </View>
        <View style={styles.centerContent}>
          <View style={[styles.errorBox, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
            <Ionicons name="alert-circle" size={32} color={colors.error} />
            <Text style={[styles.errorTitle, { color: colors.error }]}>Media not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav */}
      <View style={styles.navBar}>
        <AnimatedPressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </AnimatedPressable>
        <View style={styles.navBadges}>
          {media.localAsset && (
            <View style={styles.offlineNavPill}>
              <Ionicons name="cloud-offline" size={12} color="#10B981" />
              <Text style={styles.offlineNavText}>Offline Ready</Text>
            </View>
          )}
          <View style={[styles.typePill, { backgroundColor: `${accent}15` }]}>
            <Ionicons
              name={
                media.type === 'youtube'
                  ? 'logo-youtube'
                  : media.type === 'video'
                    ? 'play-circle'
                    : media.type === 'audio'
                      ? 'musical-notes'
                      : 'image'
              }
              size={13}
              color={accent}
            />
            <Text style={[styles.typeText, { color: accent }]}>{media.type.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* Media Display */}
        <FadeIn duration={400}>
          {media.type === 'youtube' && media.youtubeId ? (
            <View style={[styles.youtubeWrapper, { borderColor: colors.border }]}>
              <YoutubePlayer youtubeId={media.youtubeId} width={playerWidth} />
            </View>
          ) : media.type === 'video' && videoSource ? (
            <View style={[styles.videoWrapper, { borderColor: colors.border }]}>
              <NativeVideoPlayer source={videoSource} width={playerWidth} />
            </View>
          ) : media.type === 'audio' && audioSource ? (
            <View style={[styles.audioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.audioIconBadge, { backgroundColor: `${accent}15` }]}>
                <Ionicons name="musical-notes" size={32} color={accent} />
              </View>
              <Text style={[styles.audioCardTitle, { color: colors.text }]}>{media.title}</Text>
              <Text style={[styles.audioCardSub, { color: colors.icon }]}>
                High-quality offline recitation & pronunciation
              </Text>
              <NativeAudioPlayer source={audioSource} width={playerWidth - Spacing.lg * 2} />
            </View>
          ) : media.type === 'image' ? (
            <View style={[styles.imageWrapper, { borderColor: colors.border }]}>
              <Image
                source={
                  media.localAsset ?? {
                    uri: `${process.env.EXPO_PUBLIC_API_URL}${media.filePath}`,
                  }
                }
                style={[styles.image, { width: playerWidth }]}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View
              style={[
                styles.playerCard,
                { backgroundColor: `${accent}10`, borderColor: `${accent}25` },
              ]}
            >
              <View style={[styles.playerIconWrap, { backgroundColor: `${accent}20` }]}>
                <Ionicons
                  name={media.type === 'video' ? 'play-circle' : 'musical-notes'}
                  size={64}
                  color={accent}
                />
              </View>
              <Text style={[styles.playerLabel, { color: colors.text }]}>
                Media Not Available
              </Text>
            </View>
          )}
        </FadeIn>

        {/* Special Dua/Talbiyah Card for Audio */}
        {media._id === 'audio_talbiyah_translation' && (
          <SlideIn direction="up" delay={80} distance={15}>
            <View style={[styles.talbiyahBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.arabicText, { color: colors.text }]}>
                لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لاَ شَرِيكَ لَكَ
              </Text>
              <Text style={[styles.translitText, { color: colors.primary }]}>
                "Labbayk Allaahumma labbayk, labbayka laa shareeka laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, laa shareeka lak."
              </Text>
              <Text style={[styles.transText, { color: colors.icon }]}>
                "Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and grace are Yours, and the sovereignty. You have no partner."
              </Text>
            </View>
          </SlideIn>
        )}

        {/* Title & Meta */}
        <SlideIn direction="up" delay={100} distance={20}>
          <View style={styles.titleSection}>
            <Text style={[styles.mediaTitle, { color: colors.text }]}>{media.title}</Text>
            {media.description && (
              <Text style={[styles.mediaDescription, { color: colors.icon }]}>
                {media.description}
              </Text>
            )}
            <View style={styles.metaRow}>
              <View style={[styles.metaBadge, { backgroundColor: `${accent}12` }]}>
                <Ionicons name="globe-outline" size={13} color={accent} />
                <Text style={[styles.metaText, { color: accent }]}>{languageDisplay}</Text>
              </View>
              {media.ritualKey && (
                <View style={[styles.metaBadge, { backgroundColor: `${colors.primary}12` }]}>
                  <Ionicons name="book-outline" size={13} color={colors.primary} />
                  <Text style={[styles.metaText, { color: colors.primary }]}>
                    Ritual: {media.ritualKey.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </SlideIn>

        {/* Details Card */}
        <SlideIn direction="up" delay={200} distance={20}>
          <View
            style={[
              styles.detailsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.detailsHeading, { color: colors.text }]}>Details</Text>
            {[
              { icon: 'document-outline' as const, label: 'Type', value: media.type.toUpperCase() },
              { icon: 'globe-outline' as const, label: 'Language', value: languageDisplay },
              {
                icon: 'cloud-done-outline' as const,
                label: 'Availability',
                value: media.localAsset ? 'Available 100% Offline' : 'Cloud / Streaming',
              },
              ...(media.fileName
                ? [{ icon: 'folder-outline' as const, label: 'File', value: media.fileName }]
                : []),
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[
                  styles.detailRow,
                  i < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[styles.detailIconWrap, { backgroundColor: `${colors.primary}10` }]}>
                  <Ionicons name={row.icon} size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>{row.label}</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </SlideIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  offlineNavPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  offlineNavText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  typeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.massive,
    gap: Spacing.lg,
  },
  youtubeWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#000',
  },
  imageWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000008',
  },
  image: {
    height: 320,
  },
  playerContainer: {
    position: 'relative',
    backgroundColor: '#000',
  },
  playerLoading: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000080',
    zIndex: 1,
  },
  audioCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  audioIconBadge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  audioCardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  audioCardSub: {
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  nativeAudioBox: {
    gap: Spacing.md,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  audioProgressCol: {
    gap: 6,
  },
  audioProgressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    overflow: 'hidden',
  },
  audioProgressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  audioTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  audioTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  audioControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  audioMainPlayBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  audioSecondaryBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  talbiyahBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  arabicText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 38,
  },
  translitText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  transText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  playerCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  playerIconWrap: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerLabel: { fontSize: 18, fontWeight: '700' },
  titleSection: { gap: Spacing.xs },
  mediaTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, lineHeight: 28 },
  mediaDescription: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs, flexWrap: 'wrap' },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  metaText: { fontSize: 12, fontWeight: '600' },
  detailsCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  detailsHeading: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.xs },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: { fontSize: 12, fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '600', marginTop: 1 },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorBox: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    width: '100%',
  },
  errorTitle: { fontWeight: '700' },
});
