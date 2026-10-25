import { SkeletonCard } from '@/components/SkeletonLoader';
import { LearnPerformSwitch } from '@/components/LearnPerformSwitch';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useGetAllRituals, useGetProgress, useResetProgressMutation } from '@/hooks/useRitualQueries';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/store/auth.context';
import { useAppSettings } from '@/store/settings.store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Alert, Animated, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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

  const { spiritualFocusMode, setSpiritualFocusMode } = useAppSettings();

  const resetMutation = useResetProgressMutation();
  const toast = useToast();

  const handleConfirmReset = () => {
    Alert.alert(
      'Reset Umrah Journey?',
      'Are you sure you want to restart your journey from Step 1? This will reset all completed rituals.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to Step 1',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetMutation.mutateAsync();
              toast.success('Journey Reset', 'All rituals reset. You can now start fresh from Step 1.');
            } catch {
              toast.error('Reset Failed', 'Could not reset journey. Please try again.');
            }
          },
        },
      ]
    );
  };

  const Header = (
    <>
      <View style={styles.headerSection}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Umrah Rituals</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              {loading ? '8 sacred steps' : `${rituals.length} sacred steps`}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setSpiritualFocusMode(true);
              router.push('/spiritual-focus');
            }}
            style={[
              styles.spiritualFocusBtn,
              spiritualFocusMode
                ? { borderColor: '#10B981', backgroundColor: '#10B98118' }
                : { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Ionicons
              name={spiritualFocusMode ? 'notifications-off' : 'notifications-off-outline'}
              size={14}
              color={spiritualFocusMode ? '#10B981' : colors.icon}
            />
            <Text
              style={[
                styles.spiritualFocusBtnText,
                { color: spiritualFocusMode ? '#10B981' : colors.icon },
              ]}
            >
              Focus Mode
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Active Spiritual Focus Banner */}
      {spiritualFocusMode && (
        <Pressable
          onPress={() => router.push('/spiritual-focus')}
          style={[
            styles.focusActiveBanner,
            { backgroundColor: '#10B98115', borderColor: '#10B981' },
          ]}
        >
          <View style={styles.focusActiveLeft}>
            <Ionicons name="notifications-off" size={16} color="#10B981" />
            <View style={{ flex: 1 }}>
              <Text style={styles.focusActiveTitle}>Spiritual Focus Active</Text>
              <Text style={styles.focusActiveSub}>Notifications muted • Tap to resume silent guide</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#10B981" />
        </Pressable>
      )}

      {/* Learn & Perform Switch */}
      <View style={styles.switchWrapper}>
        <LearnPerformSwitch />
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

      {completedCount > 0 && (
        <View style={styles.resetRow}>
          <Pressable onPress={handleConfirmReset} style={styles.resetBtn}>
            <Ionicons name="refresh" size={13} color={colors.primary} />
            <Text style={[styles.resetBtnText, { color: colors.primary }]}>
              Reset journey to start from Step 1
            </Text>
          </Pressable>
        </View>
      )}
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.listContent}>
          {Header}
          <View style={styles.skeletonList}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </View>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spiritualFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  spiritualFocusBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  focusActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  focusActiveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  focusActiveTitle: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 13,
  },
  focusActiveSub: {
    color: '#10B981',
    opacity: 0.85,
    fontSize: 11,
  },
  switchWrapper: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: { fontSize: 14, fontWeight: '500' },
  startBanner: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  resetRow: {
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  bannerIconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
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
