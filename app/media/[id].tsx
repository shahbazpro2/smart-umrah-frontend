import { FadeIn, SlideIn } from '@/components/FadeIn';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetMediaById } from '@/hooks/useMediaQueries';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/services/error.handler';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
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

interface Media {
  _id: string;
  title: string;
  type: 'video' | 'audio' | 'image' | 'youtube';
  language: string;
  fileName?: string;
  filePath: string;
  youtubeUrl?: string;
  youtubeId?: string;
}

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
  const height = Math.round(width * (9 / 16)); // 16:9 aspect ratio

  // Full YouTube embed HTML — enables fullscreen, native controls, autoplay off
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

export default function MediaViewerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: media, isLoading: loading, isError } = useGetMediaById(id as string);
  const playerWidth = width - Spacing.lg * 2;
  const mediaUrl = media
    ? media.type === 'youtube'
      ? (media.youtubeUrl ?? '')
      : `${process.env.EXPO_PUBLIC_API_URL}${media.filePath}`
    : '';
  const accent = media ? (MEDIA_ACCENT[media.type] ?? colors.primary) : colors.primary;
  const toast = useToast();

  const handleOpenMedia = async () => {
    try {
      await Linking.openURL(mediaUrl);
    } catch (err) {
      toast.error('Could not open file', getErrorMessage(err, 'Unable to open this media file.'));
    }
  };

  const languageDisplay =
    media?.language === 'en' ? 'English' :
      media?.language === 'ar' ? 'العربية' :
        media?.language === 'ur' ? 'اردو' : 'All Languages';

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.navBar}>
          <View style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SkeletonLoader width="100%" height={Math.round((width - Spacing.lg * 2) * 9 / 16)} borderRadius={BorderRadius.xl} />
          <View style={{ marginTop: Spacing.lg, gap: Spacing.md }}>
            <SkeletonLoader width="70%" height={28} />
            <SkeletonLoader width="40%" height={16} />
          </View>
          {[1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.detailCard,
                { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.md },
              ]}
            >
              <SkeletonLoader width={32} height={32} borderRadius={BorderRadius.sm} />
              <View style={{ flex: 1, gap: Spacing.xs }}>
                <SkeletonLoader width="40%" height={12} />
                <SkeletonLoader width="60%" height={16} />
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !media) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.navBar}>
          <AnimatedPressable
            onPress={() => router.back()}
            style={[styles.backBtn, { borderColor: colors.border }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </AnimatedPressable>
        </View>
        <View style={styles.centerContent}>
          <View
            style={[
              styles.errorBox,
              { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` },
            ]}
          >
            <Ionicons name="alert-circle" size={32} color={colors.error} />
            <Text style={[styles.errorTitle, { color: colors.error }]}>Media not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Nav */}
      <View style={styles.navBar}>
        <AnimatedPressable
          onPress={() => router.back()}
          style={[styles.backBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </AnimatedPressable>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Prevent scroll conflict with WebView
        nestedScrollEnabled
      >
        {/* Media Display */}
        <FadeIn duration={400}>
          {media.type === 'youtube' && media.youtubeId ? (
            // Inline YouTube player
            <View style={[styles.youtubeWrapper, { borderColor: colors.border }]}>
              <YoutubePlayer youtubeId={media.youtubeId} width={playerWidth} />
            </View>
          ) : media.type === 'image' ? (
            <Image
              source={{ uri: mediaUrl }}
              style={[
                styles.image,
                { width: playerWidth, borderColor: colors.border },
              ]}
              resizeMode="cover"
            />
          ) : (
            // Audio / Video file — open externally
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
                {media.type === 'video' ? 'Video' : 'Audio'} File
              </Text>
              <Text style={[styles.playerHint, { color: colors.icon }]}>
                Opens in your device's default player
              </Text>
              <AnimatedPressable
                onPress={handleOpenMedia}
                style={[styles.openBtn, { backgroundColor: accent }]}
              >
                <Ionicons name="open-outline" size={18} color="#fff" />
                <Text style={styles.openBtnText}>Open File</Text>
              </AnimatedPressable>
            </View>
          )}
        </FadeIn>

        {/* Title & Meta */}
        <SlideIn direction="up" delay={100} distance={20}>
          <View style={styles.titleSection}>
            <Text style={[styles.mediaTitle, { color: colors.text }]}>{media.title}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.metaBadge, { backgroundColor: `${accent}12` }]}>
                <Ionicons name="globe-outline" size={13} color={accent} />
                <Text style={[styles.metaText, { color: accent }]}>{languageDisplay}</Text>
              </View>
              {media.type === 'youtube' && media.youtubeUrl && (
                <AnimatedPressable
                  onPress={handleOpenMedia}
                  style={[styles.metaBadge, { backgroundColor: '#FF000012' }]}
                >
                  <Ionicons name="logo-youtube" size={13} color="#FF0000" />
                  <Text style={[styles.metaText, { color: '#FF0000' }]}>Open in YouTube</Text>
                </AnimatedPressable>
              )}
            </View>
          </View>
        </SlideIn>

        {/* Details */}
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
              ...(media.youtubeId
                ? [{ icon: 'key-outline' as const, label: 'Video ID', value: media.youtubeId }]
                : []),
              ...(media.fileName
                ? [{ icon: 'folder-outline' as const, label: 'File Name', value: media.fileName }]
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
                  <Text
                    style={[styles.detailValue, { color: colors.text }]}
                    numberOfLines={1}
                  >
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
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  typeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  youtubeWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#000',
  },
  playerContainer: {
    backgroundColor: '#000',
    position: 'relative',
  },
  playerLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  image: {
    height: 260,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  playerCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
  },
  playerIconWrap: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  playerLabel: { fontSize: 18, fontWeight: '700' },
  playerHint: { fontSize: 13, textAlign: 'center' },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  openBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  titleSection: { gap: Spacing.sm },
  mediaTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  metaText: { fontSize: 12, fontWeight: '600' },
  detailsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  detailsHeading: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  detailValue: { fontSize: 14, fontWeight: '600' },
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
  errorTitle: { fontSize: 16, fontWeight: '700' },
});
