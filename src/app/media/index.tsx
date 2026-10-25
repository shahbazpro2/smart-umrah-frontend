import { FadeIn } from '@/components/FadeIn';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useGetAllMedia } from '@/hooks/useMediaQueries';
import { useTranslation } from '@/hooks/useTranslation';
import { Media } from '@/services/media.service';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getTypeFilters = (t: (key: string) => string) => [
  { key: 'all', label: t('media.all'), icon: 'grid-outline' as const },
  { key: 'video', label: t('media.videos'), icon: 'play-circle-outline' as const },
  { key: 'audio', label: t('media.audio'), icon: 'musical-notes-outline' as const },
  { key: 'image', label: t('media.images'), icon: 'image-outline' as const },
  { key: 'youtube', label: t('media.youtube'), icon: 'logo-youtube' as const },
];

const MEDIA_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  video: 'play-circle',
  audio: 'musical-notes',
  image: 'image',
  youtube: 'logo-youtube',
};

const MEDIA_COLORS: Record<string, string> = {
  video: '#6366F1',
  audio: '#10B981',
  image: '#F59E0B',
  youtube: '#FF0000',
};

function MediaCard({ item, onPress }: { item: Media; onPress: () => void }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { fontSize } = useElderlyMode();
  const scale = useRef(new Animated.Value(1)).current;
  const accent = MEDIA_COLORS[item.type] ?? colors.primary;

  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 10 }).start();

  const isLocalImage = item.type === 'image' && item.localAsset;

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.mediaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.mediaThumb, { backgroundColor: `${accent}12` }]}>
          {isLocalImage ? (
            <Image
              source={item.localAsset}
              style={styles.thumbImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name={MEDIA_ICONS[item.type] ?? 'document'} size={38} color={accent} />
          )}

          {item.localAsset && (
            <View style={styles.offlinePill}>
              <Ionicons name="cloud-offline" size={10} color="#fff" />
              <Text style={styles.offlinePillText}>OFFLINE</Text>
            </View>
          )}
        </View>

        <View style={styles.mediaInfo}>
          <Text
            style={[
              styles.mediaTitle,
              { color: colors.text, fontSize: 13 + (fontSize.base - 13) },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.typePill, { backgroundColor: `${accent}15` }]}>
              <Text style={[styles.typeText, { color: accent, fontSize: 10 + (fontSize.small - 12) }]}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            {item.category && (
              <Text style={[styles.categoryText, { color: colors.icon }]}>
                {item.category}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function MediaGalleryScreen() {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { fontSize } = useElderlyMode();
  const { t } = useTranslation();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const { data: allMedia = [], isLoading: loading, isError } = useGetAllMedia();

  const filteredMedia = useMemo(() => {
    let result = allMedia;

    if (selectedType !== 'all') {
      result = result.filter((m: Media) => m.type === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((m: Media) => {
        const titleMatch = m.title?.toLowerCase().includes(q);
        const descMatch = m.description?.toLowerCase().includes(q);
        const catMatch = m.category?.toLowerCase().includes(q);
        const tagsMatch = m.tags?.some((t) => t.toLowerCase().includes(q));
        const ritualMatch = m.ritualKey?.toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch || tagsMatch || ritualMatch;
      });
    }

    return result;
  }, [allMedia, selectedType, searchQuery]);

  const TYPE_FILTERS = getTypeFilters(t);

  const Header = (
    <>
      <View style={styles.headerSection}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text, fontSize: 24 + (fontSize.xl - 16) }]}>
              {t('media.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.icon, fontSize: 13 + (fontSize.base - 13) }]}>
              {loading ? t('media.loading') : `${filteredMedia.length} audio, videos & image guides`}
            </Text>
          </View>
        </View>

        {/* Media Search Input */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search-outline" size={18} color={colors.icon} />
          <TextInput
            placeholder="Search guides, duas, videos, talbiyah..."
            placeholderTextColor={colors.icon}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.icon} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {TYPE_FILTERS.map((f) => {
          const active = selectedType === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setSelectedType(f.key)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons name={f.icon} size={14} color={active ? '#fff' : colors.icon} />
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? '#fff' : colors.text, fontSize: 13 + (fontSize.base - 13) },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {Header}
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.skeletonCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <SkeletonLoader width="100%" height={100} borderRadius={BorderRadius.md} />
              <View style={{ marginTop: Spacing.sm, gap: Spacing.xs }}>
                <SkeletonLoader width="80%" height={14} />
                <SkeletonLoader width="40%" height={12} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (isError && filteredMedia.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {Header}
        <View style={styles.centerContent}>
          <View
            style={[
              styles.errorBox,
              { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` },
            ]}
          >
            <Ionicons name="alert-circle" size={32} color={colors.error} />
            <Text style={[styles.errorTitle, { color: colors.error, fontSize: 16 + (fontSize.base - 13) }]}>
              {t('media.failedLoad')}
            </Text>
            <Text style={[styles.errorSub, { color: colors.icon, fontSize: 13 + (fontSize.base - 13) }]}>
              {t('media.checkConnection')}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredMedia}
        keyExtractor={(item: Media) => item._id}
        numColumns={2}
        ListHeaderComponent={Header}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }: { item: Media; index: number }) => (
          <FadeIn delay={Math.min(index * 30, 300)} duration={250} style={{ flex: 1 }}>
            <MediaCard item={item} onPress={() => router.push(`/media/${item._id}`)} />
          </FadeIn>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text, fontSize: 16 + (fontSize.base - 13) }]}>
              {t('media.noMedia')}
            </Text>
            <Text style={[styles.emptySub, { color: colors.icon, fontSize: 13 + (fontSize.base - 13) }]}>
              {t('media.tryFilter')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontWeight: '500' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterScroll: { marginBottom: Spacing.md },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterLabel: { fontSize: 13, fontWeight: '600' },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  columnWrapper: { gap: Spacing.md },
  cardWrap: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  mediaCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mediaThumb: {
    width: '100%',
    aspectRatio: 1.25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  offlinePill: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  offlinePillText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  mediaInfo: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  mediaTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  typePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  categoryText: { fontSize: 11, fontWeight: '500', textTransform: 'capitalize' },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  skeletonCard: {
    width: '47%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
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
  errorSub: { fontSize: 13, textAlign: 'center' },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13 },
});
