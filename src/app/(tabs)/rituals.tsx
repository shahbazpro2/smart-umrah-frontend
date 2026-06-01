import { SkeletonCard } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useGetAllRituals, useGetProgress } from '@/hooks/useRitualQueries';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Ritual {
  _id: string;
  sequence: number;
  key: string;
  translations: {
    en: { title: string; description: string };
    ar: { title: string; description: string };
    ur: { title: string; description: string };
  };
}

function RitualCard({ item, lang, onPress, index }: {
  item: Ritual;
  lang: 'en' | 'ar' | 'ur';
  onPress: () => void;
  index: number;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const elderlyMode = useElderlyMode();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.cardWrap]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[styles.ritualCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.sequenceBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.sequenceText}>{item.sequence}</Text>
        </View>
        <View style={styles.ritualInfo}>
          <Text style={[styles.ritualTitle, { color: colors.text, fontSize: elderlyMode.fontSize.large }]}>
            {item.translations[lang].title}
          </Text>
          <Text style={[styles.ritualDescription, { color: colors.icon, fontSize: elderlyMode.fontSize.base }]} numberOfLines={2}>
            {item.translations[lang].description}
          </Text>
        </View>
        <View style={[styles.arrowWrap, { backgroundColor: `${colors.primary}10` }]}>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function RitualsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const elderlyMode = useElderlyMode();
  const TAB_BAR_HEIGHT = 65;
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + Spacing.lg;

  const { data: ritualsData, isLoading: loading, isError } = useGetAllRituals();
  const { data: progress = [] } = useGetProgress();
  const rituals = (ritualsData || []).sort((a: Ritual, b: Ritual) => a.sequence - b.sequence);
  const lang = (user?.preferredLanguage || 'en') as 'en' | 'ar' | 'ur';

  const completedCount = progress.filter((p: any) => p.completed).length;
  const progressText = completedCount > 0
    ? `${completedCount} of 8 rituals completed`
    : 'Begin your journey';

  const Header = (
    <>
      <View style={styles.headerSection}>
        <Text style={[styles.title, { color: colors.text }]}>Umrah Rituals</Text>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {loading ? '8 sacred steps' : `${rituals.length} sacred steps`}
        </Text>
      </View>

      {/* Start Umrah Banner */}
      <Pressable
        onPress={() => router.push('/umrah-guide')}
        style={[
          styles.startBanner,
          {
            backgroundColor: colors.primary,
            minHeight: 56,
          },
        ]}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerIconWrap}>
            <Text style={styles.bannerIcon}>🕌</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: '#fff', fontSize: 16 + (elderlyMode.fontSize.base - 13) }]}>
              Start Your Umrah Journey
            </Text>
            <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.85)', fontSize: 13 + (elderlyMode.fontSize.small - 12) }]}>
              {progressText}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </View>
      </Pressable>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {Header}
        <View style={styles.skeletonList}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {Header}
        <View style={styles.centerContent}>
          <View style={[styles.errorBox, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
            <Ionicons name="alert-circle" size={32} color={colors.error} />
            <Text style={[styles.errorTitle, { color: colors.error }]}>Failed to load rituals</Text>
            <Text style={[styles.errorSub, { color: colors.icon }]}>Check your connection and try again</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={rituals}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={Header}
        renderItem={({ item, index }) => (
          <RitualCard
            item={item}
            lang={lang}
            index={index}
            onPress={() => router.push(`/ritual/${item._id}`)}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: { fontSize: 14, fontWeight: '500' },
  startBanner: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  bannerIconWrap: {
    fontSize: 32,
  },
  bannerIcon: {
    fontSize: 32,
  },
  bannerTitle: { fontWeight: '800', marginBottom: 2 },
  bannerSub: { fontWeight: '500' },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  skeletonList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  cardWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  ritualCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  sequenceBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sequenceText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  ritualInfo: { flex: 1 },
  ritualTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  ritualDescription: { fontSize: 13, lineHeight: 18 },
  arrowWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
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
});
