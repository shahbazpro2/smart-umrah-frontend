import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useGetAllRituals, useGetProgress } from '@/hooks/useRitualQueries';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Ritual {
  _id: string;
  sequence: number;
  key: string;
  estimatedDuration: string;
  translations: {
    en: { title: string };
    ar: { title: string };
    ur: { title: string };
  };
}

function ChecklistRow({ ritual, isCompleted, isEnabled, isNewlyUnlocked, lang, onPress, fontSize }: {
  ritual: Ritual;
  isCompleted: boolean;
  isEnabled: boolean;
  isNewlyUnlocked: boolean;
  lang: 'en' | 'ar' | 'ur';
  onPress: () => void;
  fontSize: any;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const isRTL = lang === 'ar' || lang === 'ur';

  // Pulse animation for newly unlocked step
  useEffect(() => {
    if (isNewlyUnlocked) {
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseOpacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          ]),
          { iterations: 3 }
        ),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
  }, [isNewlyUnlocked]);

  const onPressIn = () => {
    if (isEnabled || isCompleted) {
      Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
    }
  };
  const onPressOut = () => {
    if (isEnabled || isCompleted) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={!isEnabled && !isCompleted}
        style={[
          styles.row,
          {
            backgroundColor: isCompleted ? colors.card : isEnabled ? colors.card : colors.cardAlt,
            borderColor: isNewlyUnlocked ? colors.success : isEnabled ? colors.primary : colors.border,
            borderWidth: isEnabled ? 2 : 1,
            minHeight: 56,
            flexDirection: isRTL ? 'row-reverse' : 'row',
            opacity: isCompleted || isEnabled ? 1 : 0.5,
          },
        ]}
      >
        {/* Pulse highlight overlay for newly unlocked step */}
        {isNewlyUnlocked && (
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                borderRadius: BorderRadius.lg,
                backgroundColor: colors.success,
                opacity: pulseOpacity,
              },
            ]}
          />
        )}
        {/* Left: numbered circle */}
        <View
          style={[
            styles.numberCircle,
            {
              backgroundColor: isCompleted ? colors.success : colors.primary,
            },
          ]}
        >
          {isCompleted ? (
            <Ionicons name="checkmark" size={20} color="#fff" />
          ) : (
            <Text style={[styles.numberText, { color: '#fff' }]}>{ritual.sequence}</Text>
          )}
        </View>

        {/* Center: title and duration */}
        <View style={[styles.infoWrap, { flex: 1, marginHorizontal: Spacing.md }]}>
          <Text
            style={[
              styles.ritualTitle,
              {
                color: isCompleted ? colors.text : colors.icon,
                fontSize: 15 + (fontSize.base - 13),
                fontWeight: isCompleted ? '700' : '600',
              },
            ]}
          >
            {ritual.translations[lang].title}
          </Text>
          <Text style={[styles.duration, { color: isCompleted ? colors.icon : colors.icon, fontSize: 12 + (fontSize.small - 12), opacity: 0.7 }]}>
            ⏱ {ritual.estimatedDuration}
          </Text>
        </View>

        {/* Right: checkmark, arrow, or lock */}
        <View style={[styles.iconWrap, { marginStart: isRTL ? undefined : Spacing.md, marginEnd: isRTL ? Spacing.md : undefined }]}>
          {isCompleted ? (
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          ) : isEnabled ? (
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={22}
              color={colors.primary}
            />
          ) : (
            <Ionicons name="lock-closed" size={20} color={colors.icon} />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function UmrahGuideScreen() {
  const router = useRouter();
  const { justCompleted } = useLocalSearchParams<{ justCompleted?: string }>();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/rituals');
    }
  };
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { fontSize } = useElderlyMode();
  const { t, lang } = useTranslation();
  const { data: rituals = [], isLoading } = useGetAllRituals();
  const { data: progress = [] } = useGetProgress();
  const flatListRef = useRef<FlatList>(null);

  const isRTL = lang === 'ar' || lang === 'ur';

  // Create completed set and find next enabled ritual
  const completedSet = useMemo(() => {
    return new Set(progress.filter((p: any) => p.completed).map((p: any) => p.ritualId));
  }, [progress]);

  // Sort rituals by sequence (MUST be before highestCompletedSequence)
  const sortedRituals = useMemo(() => {
    return [...rituals].sort((a: Ritual, b: Ritual) => a.sequence - b.sequence);
  }, [rituals]);

  const completedCount = completedSet.size;
  const isComplete = completedCount === 8;

  // Find highest completed sequence number
  const highestCompletedSequence = useMemo(() => {
    if (completedCount === 0) return 0;
    if (sortedRituals.length === 0) return 0;
    const completedRituals = sortedRituals.filter((r: Ritual) => completedSet.has(r._id));
    if (completedRituals.length === 0) return 0;
    const sequences = completedRituals.map((r: Ritual) => r.sequence);
    return Math.max(...sequences);
  }, [completedCount, completedSet, sortedRituals]);

  // Index of the next step to scroll to after a completion
  const nextStepIndex = useMemo(() => {
    if (isComplete) return -1;
    return sortedRituals.findIndex((r: Ritual) => r.sequence === highestCompletedSequence + 1);
  }, [isComplete, sortedRituals, highestCompletedSequence]);

  // Auto-scroll to the next step when returning from a completed ritual
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (justCompleted && nextStepIndex >= 0 && !scrolledRef.current && flatListRef.current) {
      scrolledRef.current = true;
      // Small delay to let the list render with updated data
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: nextStepIndex,
          animated: true,
          viewPosition: 0.3,
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [justCompleted, nextStepIndex]);

  // Reset scroll flag when justCompleted param changes
  useEffect(() => {
    scrolledRef.current = false;
  }, [justCompleted]);

  const Header = (
    <>
      {/* Nav Bar */}
      <View style={[styles.navBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Pressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={22} color={colors.primary} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.navTitle, { color: colors.text, fontSize: 18 + (fontSize.base - 13) }]}>
            {t('umrahGuide.title')}
          </Text>
          <Text style={[styles.navCounter, { color: colors.icon, fontSize: 13 + (fontSize.small - 12) }]}>
            {t('umrahGuide.progress')} {completedCount} / 8
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.cardAlt }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: colors.success,
              width: `${(completedCount / 8) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Completion Banner */}
      {isComplete && (
        <View style={[styles.completionBanner, { backgroundColor: colors.success }]}>
          <Ionicons name="checkmark-done" size={28} color="#fff" />
          <View style={{ flex: 1, marginHorizontal: Spacing.md }}>
            <Text style={[styles.completionTitle, { fontSize: 18 + (fontSize.base - 13) }]}>
              {t('umrahGuide.congratulations')}
            </Text>
            <Text style={[styles.completionSub, { fontSize: 13 + (fontSize.small - 12) }]}>
              {t('umrahGuide.congratulationsSub')}
            </Text>
          </View>
        </View>
      )}

      {/* Section Header */}
      <View style={[styles.sectionHeader, { paddingHorizontal: Spacing.lg, marginTop: isComplete ? Spacing.md : Spacing.lg }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 14 + (fontSize.small - 12) }]}>
          {t('umrahGuide.checklistTitle')}
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={sortedRituals}
        keyExtractor={(item: Ritual) => item._id}
        ListHeaderComponent={Header}
        renderItem={({ item, index }: { item: Ritual; index: number }) => {
          const isCompleted = completedSet.has(item._id);
          const isEnabled = isCompleted || item.sequence === highestCompletedSequence + 1;
          const isNewlyUnlocked = !!justCompleted && item.sequence === highestCompletedSequence + 1 && !isCompleted;
          return (
            <ChecklistRow
              ritual={item}
              isCompleted={isCompleted}
              isEnabled={isEnabled}
              isNewlyUnlocked={isNewlyUnlocked}
              lang={lang}
              onPress={() => router.push(`/ritual/${item._id}?source=umrah-guide`)}
              fontSize={fontSize}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        contentContainerStyle={[styles.listContent]}
        scrollEnabled={!isLoading}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          // Fallback: scroll to end if index fails
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 200);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: { fontWeight: '800', letterSpacing: -0.5 },
  navCounter: { fontWeight: '500', marginTop: 2 },
  progressContainer: {
    height: 8,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  completionTitle: { fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  completionSub: { fontWeight: '500', color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  sectionHeader: { marginBottom: Spacing.md },
  sectionTitle: { fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  numberCircle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  numberText: { fontWeight: '800', fontSize: 16 },
  infoWrap: { gap: 2 },
  ritualTitle: { fontWeight: '700' },
  duration: { fontWeight: '500' },
  iconWrap: { flexShrink: 0 },
});
