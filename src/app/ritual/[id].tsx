import { FadeIn, SlideIn } from '@/components/FadeIn';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { LearnPerformSwitch } from '@/components/LearnPerformSwitch';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useGetMistakeGuideByRitual } from '@/hooks/useMistakeGuides';
import { useGetAllRituals, useGetProgress, useGetRitualById, useMarkCompleteMutation } from '@/hooks/useRitualQueries';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/services/error.handler';
import { useAuth } from '@/store/auth.context';
import { useAppSettings } from '@/store/settings.store';
import { LOCAL_MEDIA_ITEMS } from '@/constants/localMedia';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useMemo } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function AnimatedPressable({ onPress, disabled, style, children }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} disabled={disabled} style={style}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default function RitualDetailScreen() {
  const { id, source } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { fontSize } = useElderlyMode();
  const { t, lang } = useTranslation();
  const { isLearnMode, isPerformMode, spiritualFocusMode, setSpiritualFocusMode } = useAppSettings();
  const isUmrahGuideFlow = source === 'umrah-guide';

  const { data: ritual, isLoading: loading, isError } = useGetRitualById(id as string);
  const { data: allRituals = [] } = useGetAllRituals();
  const { data: progress = [] } = useGetProgress();
  const { data: mistakeGuide } = useGetMistakeGuideByRitual(id as string, lang, isUmrahGuideFlow);
  const markCompleteMutation = useMarkCompleteMutation();
  const toast = useToast();

  const isCompleted = progress.some((p: any) => p.ritualId === id && p.completed);

  const sortedRituals = useMemo(() => {
    return [...allRituals].sort((a: any, b: any) => (a.sequence ?? 0) - (b.sequence ?? 0));
  }, [allRituals]);

  const nextRitual = useMemo(() => {
    if (!ritual || sortedRituals.length === 0) return undefined;
    const matchBySeq = sortedRituals.find((r: any) => r.sequence === ritual.sequence + 1);
    if (matchBySeq) return matchBySeq;
    const currentIdx = sortedRituals.findIndex((r: any) => r._id === ritual._id);
    if (currentIdx >= 0 && currentIdx < sortedRituals.length - 1) {
      return sortedRituals[currentIdx + 1];
    }
    return undefined;
  }, [sortedRituals, ritual]);

  const isCurrentStep = isUmrahGuideFlow && ritual && typeof ritual.sequence === 'number' && allRituals.length > 0 ? (() => {
    const completedSet = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.ritualId));
    let highestCompletedSequence = 0;
    if (completedSet.size > 0) {
      for (const r of allRituals) {
        if (completedSet.has(r._id) && typeof r.sequence === 'number' && r.sequence > highestCompletedSequence) {
          highestCompletedSequence = r.sequence;
        }
      }
    }
    return isCompleted || ritual.sequence === highestCompletedSequence + 1;
  })() : false;

  const handleBack = () => {
    router.replace('/(tabs)/rituals');
  };

  const handleEnterSpiritualFocus = () => {
    setSpiritualFocusMode(true);
    router.push('/spiritual-focus');
  };

  const handleMarkComplete = async () => {
    if (!ritual) return;
    try {
      if (process.env.EXPO_OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (!isCompleted) {
        await markCompleteMutation.mutateAsync(ritual._id);
      }

      if (isPerformMode) {
        if (nextRitual) {
          const nextTitle =
            nextRitual.translations?.[lang]?.title ||
            nextRitual.translations?.['en']?.title ||
            `Step ${nextRitual.sequence}`;
          toast.success(
            isCompleted ? `Opening Step ${nextRitual.sequence}` : `Step ${ritual.sequence} Complete! 🎉`,
            `Step ${nextRitual.sequence}: ${nextTitle}`
          );
          router.replace(`/ritual/${nextRitual._id}${isUmrahGuideFlow ? '?source=umrah-guide' : ''}`);
          return;
        } else {
          toast.success('Umrah Complete! 🎉', 'Mabroor! You have completed all sacred rituals.');
          if (isUmrahGuideFlow) {
            router.replace('/umrah-guide?justCompleted=1');
          } else {
            router.replace('/(tabs)/rituals');
          }
          return;
        }
      }

      toast.success(
        'Ritual complete! 🎉',
        `${ritual.translations[lang]?.title || ritual.translations['en']?.title || 'Ritual'} has been marked as done.`
      );
      if (isUmrahGuideFlow) {
        router.replace('/umrah-guide?justCompleted=1');
      } else {
        handleBack();
      }
    } catch (err) {
      toast.error('Could not save progress', getErrorMessage(err, 'Please try again.'));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.navBar}>
          <AnimatedPressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </AnimatedPressable>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroBanner, { backgroundColor: `${colors.primary}10` }]}>
            <SkeletonLoader width={56} height={56} borderRadius={BorderRadius.md} />
            <View style={{ marginTop: Spacing.md, width: '100%', gap: Spacing.sm }}>
              <SkeletonLoader width="60%" height={28} />
              <SkeletonLoader width="40%" height={16} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !ritual) {
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
            <Text style={[styles.errorTitle, { color: colors.error, fontSize: 16 + (fontSize.base - 13) }]}>Ritual not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const ritualText = ritual.translations[lang] || ritual.translations['en'];

  // Match local media for this ritual
  const ritualSlug = (ritual.translations['en']?.title || '').toLowerCase();
  const relatedMedia = LOCAL_MEDIA_ITEMS.filter((item) => {
    if (ritualSlug.includes('ihram') && item.ritualKey === 'ihram') return true;
    if (ritualSlug.includes('tawaf') && item.ritualKey === 'tawaf') return true;
    if (ritualSlug.includes('zamzam') && item.ritualKey === 'zamzam') return true;
    if (ritualSlug.includes('sa\'i') && item.ritualKey === 'sai') return true;
    if (ritualSlug.includes('safa') && item.ritualKey === 'sai') return true;
    if (ritualSlug.includes('shaving') && item.ritualKey === 'halq_taqsir') return true;
    if (ritualSlug.includes('maqam') && item.ritualKey === 'maqam_ibrahim') return true;
    return false;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <AnimatedPressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </AnimatedPressable>
        <View style={styles.navRight}>
          <Pressable
            onPress={handleEnterSpiritualFocus}
            style={[
              styles.focusPill,
              spiritualFocusMode
                ? { backgroundColor: '#10B98118', borderColor: '#10B981' }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name={spiritualFocusMode ? 'notifications-off' : 'notifications-off-outline'}
              size={13}
              color={spiritualFocusMode ? '#10B981' : colors.icon}
            />
            <Text
              style={[
                styles.focusPillText,
                { color: spiritualFocusMode ? '#10B981' : colors.icon },
              ]}
            >
              Spiritual Focus
            </Text>
          </Pressable>
          <View style={[styles.stepBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.stepText, { color: colors.primary, fontSize: 12 + (fontSize.base - 13) }]}>
              Step {ritual.sequence} of 8
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Learn vs Perform Switcher */}
        <LearnPerformSwitch />

        {/* ================= PERFORM MODE (Concise, step-only, minimal text) ================= */}
        {isPerformMode && (
          <FadeIn duration={300}>
            <View style={[styles.performCard, { backgroundColor: colors.card, borderColor: '#10B981' }]}>
              <View style={styles.performHeader}>
                <View style={styles.performBadge}>
                  <Text style={styles.performBadgeText}>⚡ PERFORMING STEP {ritual.sequence}</Text>
                </View>
                <Text style={[styles.performTitle, { color: colors.text, fontSize: 24 + (fontSize.xl - 16) }]}>
                  {ritualText.title}
                </Text>
                <Text style={[styles.performSub, { color: colors.icon }]}>
                  Duration: {ritual.estimatedDuration} • Focus on action
                </Text>
              </View>

              {/* Action Steps - Concise & Direct */}
              <View style={styles.actionList}>
                {ritualText.tips.slice(0, 3).map((action, idx) => (
                  <View key={idx} style={[styles.actionRow, { backgroundColor: `${colors.primary}08` }]}>
                    <View style={[styles.actionNum, { backgroundColor: colors.primary }]}>
                      <Text style={styles.actionNumText}>{idx + 1}</Text>
                    </View>
                    <Text style={[styles.actionText, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                      {action}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Reduced Interaction: Big Mark Completed Button */}
              <AnimatedPressable
                onPress={handleMarkComplete}
                disabled={markCompleteMutation.isPending}
                style={[
                  styles.performActionBtn,
                  { backgroundColor: isCompleted ? (nextRitual ? colors.primary : colors.success) : '#10B981' },
                  markCompleteMutation.isPending && { opacity: 0.6 },
                ]}
              >
                <Ionicons
                  name={
                    isCompleted
                      ? nextRitual
                        ? 'arrow-forward-circle'
                        : 'ribbon'
                      : nextRitual
                      ? 'checkmark-done-circle'
                      : 'ribbon'
                  }
                  size={24}
                  color="#fff"
                />
                <Text style={styles.performActionBtnText}>
                  {isCompleted
                    ? nextRitual
                      ? `Go to Next Step (${nextRitual.sequence}/8) ➔`
                      : 'Umrah Completed ✓'
                    : nextRitual
                    ? `Complete & Go to Step ${nextRitual.sequence} ➔`
                    : 'Complete Final Step & Finish Umrah 🎉'}
                </Text>
              </AnimatedPressable>
            </View>
          </FadeIn>
        )}

        {/* ================= LEARN MODE (Detailed explanations, educational content, guides) ================= */}
        {isLearnMode && (
          <>
            {/* Hero Banner */}
            <FadeIn duration={400}>
              <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
                <View style={styles.heroBadge}>
                  <Text style={[styles.heroBadgeText, { fontSize: 22 + (fontSize.xl - 16) }]}>{ritual.sequence}</Text>
                </View>
                <Text style={[styles.heroTitle, { fontSize: 24 + (fontSize.xl - 16) }]}>{ritualText.title}</Text>
                <View style={styles.heroDuration}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={[styles.heroDurationText, { fontSize: 12 + (fontSize.base - 13) }]}>
                    Estimated time: {ritual.estimatedDuration}
                  </Text>
                </View>
              </View>
            </FadeIn>

            {/* Description & Explanation */}
            <SlideIn direction="up" delay={100} distance={20}>
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primary}12` }]}>
                    <Ionicons name="book-outline" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                    Detailed Explanation
                  </Text>
                </View>
                <Text style={[styles.description, { color: colors.text, fontSize: 14 + (fontSize.base - 13) }]}>
                  {ritualText.description}
                </Text>
              </View>
            </SlideIn>

            {/* Educational Tips */}
            <SlideIn direction="up" delay={150} distance={20}>
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: '#FEF3C715' }]}>
                    <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                    Educational Steps & Tips
                  </Text>
                </View>
                <View style={styles.itemList}>
                  {ritualText.tips.map((tip, idx) => (
                    <View key={idx} style={[styles.listItem, { backgroundColor: `${colors.primary}08`, borderLeftColor: colors.primary }]}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      <Text style={[styles.listItemText, { color: colors.text, fontSize: 13 + (fontSize.base - 13) }]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </SlideIn>

            {/* Related Multimedia Guides (if any match) */}
            {relatedMedia.length > 0 && (
              <SlideIn direction="up" delay={200} distance={20}>
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: '#6366F115' }]}>
                      <Ionicons name="images-outline" size={16} color="#6366F1" />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                      Visual Guides & Audio
                    </Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
                    {relatedMedia.map((m) => (
                      <Pressable
                        key={m._id}
                        onPress={() => router.push(`/media/${m._id}`)}
                        style={[styles.mediaMiniCard, { borderColor: colors.border, backgroundColor: colors.cardAlt }]}
                      >
                        {m.type === 'image' && m.localAsset ? (
                          <Image source={m.localAsset} style={styles.miniImage} resizeMode="cover" />
                        ) : (
                          <View style={styles.miniIconWrap}>
                            <Ionicons
                              name={m.type === 'video' ? 'play-circle' : 'musical-notes'}
                              size={28}
                              color={colors.primary}
                            />
                          </View>
                        )}
                        <Text style={[styles.miniMediaTitle, { color: colors.text }]} numberOfLines={2}>
                          {m.title}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </SlideIn>
            )}

            {/* Common Mistakes */}
            <SlideIn direction="up" delay={250} distance={20}>
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.error}12` }]}>
                    <Ionicons name="warning-outline" size={16} color={colors.error} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                    Common Mistakes to Avoid
                  </Text>
                </View>
                <View style={styles.itemList}>
                  {ritualText.commonMistakes.map((mistake, idx) => (
                    <View key={idx} style={[styles.listItem, { backgroundColor: `${colors.error}08`, borderLeftColor: colors.error }]}>
                      <Ionicons name="alert-circle" size={18} color={colors.error} />
                      <Text style={[styles.listItemText, { color: colors.text, fontSize: 13 + (fontSize.base - 13) }]}>{mistake}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </SlideIn>

            {/* Mistake Prevention Guide (from API if available) */}
            {isUmrahGuideFlow && mistakeGuide && (
              <SlideIn direction="up" delay={300} distance={20}>
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.warning || colors.primary}12` }]}>
                      <Ionicons name="shield-checkmark-outline" size={16} color={colors.warning || colors.primary} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                      {t('umrahGuide.mistakePrevention')}
                    </Text>
                  </View>
                  <View style={styles.itemList}>
                    {mistakeGuide.commonMistakes?.map((item: any, idx: number) => (
                      <View key={idx} style={[styles.preventionItem, { backgroundColor: `${colors.warning || colors.primary}08` }]}>
                        <View>
                          <Text style={[styles.preventionTitle, { color: colors.text, fontSize: 13 + (fontSize.base - 13) }]}>
                            {item.mistake}
                          </Text>
                          <Text style={[styles.preventionText, { color: colors.icon, fontSize: 12 + (fontSize.small - 12) }]}>
                            Impact: {item.impact}
                          </Text>
                          <Text style={[styles.preventionText, { color: colors.icon, fontSize: 12 + (fontSize.small - 12) }]}>
                            Prevention: {item.prevention}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </SlideIn>
            )}

            {/* Complete / Progress Button */}
            <SlideIn direction="up" delay={350} distance={20}>
              <AnimatedPressable
                onPress={handleMarkComplete}
                disabled={markCompleteMutation.isPending}
                style={[
                  styles.completeBtn,
                  { backgroundColor: isCompleted ? colors.success : colors.primary },
                  markCompleteMutation.isPending && { opacity: 0.6 },
                ]}
              >
                <Ionicons name={isCompleted ? 'checkmark-circle' : 'checkmark-done'} size={20} color="#fff" />
                <Text style={[styles.completeBtnText, { fontSize: 16 + (fontSize.base - 13) }]}>
                  {isCompleted ? 'Completed ✓' : 'Mark as Done'}
                </Text>
              </AnimatedPressable>
            </SlideIn>

            {/* Next Ritual Shortcut in Learn Mode if available */}
            {nextRitual && (
              <SlideIn direction="up" delay={400} distance={20}>
                <AnimatedPressable
                  onPress={() =>
                    router.replace(
                      `/ritual/${nextRitual._id}${isUmrahGuideFlow ? '?source=umrah-guide' : ''}`
                    )
                  }
                  style={[
                    styles.nextRitualBtn,
                    { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
                  ]}
                >
                  <Ionicons name="arrow-forward-circle" size={20} color={colors.primary} />
                  <Text
                    style={[
                      styles.nextRitualBtnText,
                      { color: colors.primary, fontSize: 14 + (fontSize.base - 13) },
                    ]}
                  >
                    Go to Step {nextRitual.sequence}:{' '}
                    {nextRitual.translations?.[lang]?.title ||
                      nextRitual.translations?.['en']?.title ||
                      'Next Step'}{' '}
                    ➔
                  </Text>
                </AnimatedPressable>
              </SlideIn>
            )}
          </>
        )}
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
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  focusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  focusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  stepText: { fontSize: 12, fontWeight: '700' },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.massive,
    gap: Spacing.lg,
  },
  heroBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBadgeText: { color: '#fff', fontWeight: '800' },
  heroTitle: { color: '#fff', fontWeight: '800', textAlign: 'center' },
  heroDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroDurationText: { color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  section: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontWeight: '700' },
  description: { lineHeight: 22 },
  itemList: { gap: Spacing.sm },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
  },
  listItemText: { flex: 1, lineHeight: 18, fontWeight: '500' },
  preventionItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  preventionTitle: { fontWeight: '700', marginBottom: 2 },
  preventionText: { lineHeight: 16 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  completeBtnText: { color: '#fff', fontWeight: '700' },
  nextRitualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
  },
  nextRitualBtnText: {
    fontWeight: '700',
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
  errorTitle: { fontWeight: '700' },
  mediaMiniCard: {
    width: 140,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: Spacing.sm,
  },
  miniImage: {
    width: '100%',
    height: 80,
  },
  miniIconWrap: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniMediaTitle: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    marginTop: 4,
    lineHeight: 14,
  },
  // Perform Mode styles
  performCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  performHeader: {
    alignItems: 'center',
    gap: 6,
  },
  performBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  performBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  performTitle: {
    fontWeight: '800',
    textAlign: 'center',
  },
  performSub: {
    fontSize: 13,
  },
  actionList: {
    gap: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  actionNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionNumText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  actionText: {
    flex: 1,
    fontWeight: '600',
    lineHeight: 20,
  },
  performActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 18,
    borderRadius: BorderRadius.xl,
  },
  performActionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
