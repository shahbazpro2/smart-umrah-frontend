import { FadeIn, SlideIn } from '@/components/FadeIn';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useGetMistakeGuideByRitual } from '@/hooks/useMistakeGuides';
import { useGetAllRituals, useGetProgress, useGetRitualById, useMarkCompleteMutation } from '@/hooks/useRitualQueries';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/services/error.handler';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Ritual {
  _id: string;
  sequence: number;
  estimatedDuration: string;
  translations: {
    en: { title: string; description: string; tips: string[]; commonMistakes: string[] };
    ar: { title: string; description: string; tips: string[]; commonMistakes: string[] };
    ur: { title: string; description: string; tips: string[]; commonMistakes: string[] };
  };
}

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
  const isUmrahGuideFlow = source === 'umrah-guide';

  const { data: ritual, isLoading: loading, isError } = useGetRitualById(id as string);
  const { data: allRituals = [] } = useGetAllRituals();
  const { data: progress = [] } = useGetProgress();
  const { data: mistakeGuide } = useGetMistakeGuideByRitual(id as string, lang, isUmrahGuideFlow);
  const markCompleteMutation = useMarkCompleteMutation();
  const toast = useToast();

  // Check if already completed
  const isCompleted = progress.some((p: any) => p.ritualId === id && p.completed);

  // In umrah-guide flow, check if this is the current (next enabled) step
  const isCurrentStep = isUmrahGuideFlow && ritual && typeof ritual.sequence === 'number' && allRituals.length > 0 ? (() => {
    const completedSet = new Set(progress.filter((p: any) => p.completed).map((p: any) => p.ritualId));
    const completedCount = completedSet.size;

    // Find highest completed sequence by looking at ritual objects
    let highestCompletedSequence = 0;
    if (completedCount > 0) {
      for (const r of allRituals) {
        if (completedSet.has(r._id) && typeof r.sequence === 'number' && r.sequence > highestCompletedSequence) {
          highestCompletedSequence = r.sequence;
        }
      }
    }

    // Current step is either already completed or the next one (highest + 1)
    const canProceed = isCompleted || ritual.sequence === highestCompletedSequence + 1;
    return canProceed;
  })() : false;

  // In umrah-guide flow, only allow marking complete if this is the current step
  const canMarkComplete = isCurrentStep;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/rituals');
    }
  };

  const handleMarkComplete = async () => {
    if (!ritual) return;
    try {
      await markCompleteMutation.mutateAsync(ritual._id);
      toast.success('Ritual complete! 🎉', `${ritual.translations['en'].title} has been marked as done.`);
      // If from umrah guide, replace to return to checklist with justCompleted flag; otherwise back
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
          <View style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.heroBanner, { backgroundColor: `${colors.primary}10` }]}>
            <SkeletonLoader width={56} height={56} borderRadius={BorderRadius.md} />
            <View style={{ marginTop: Spacing.md, width: '100%', gap: Spacing.sm }}>
              <SkeletonLoader width="60%" height={28} />
              <SkeletonLoader width="40%" height={16} />
            </View>
          </View>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <SkeletonLoader width="50%" height={16} />
              <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                <SkeletonLoader height={14} />
                <SkeletonLoader height={14} />
                <SkeletonLoader width="80%" height={14} />
              </View>
            </View>
          ))}
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

  const ritualText = ritual.translations[lang];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <AnimatedPressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </AnimatedPressable>
        <View style={[styles.stepBadge, { backgroundColor: `${colors.primary}15` }]}>
          <Text style={[styles.stepText, { color: colors.primary, fontSize: 12 + (fontSize.base - 13) }]}>Step {ritual.sequence} of 8</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <FadeIn duration={400}>
          <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
            <View style={styles.heroBadge}>
              <Text style={[styles.heroBadgeText, { fontSize: 22 + (fontSize.xl - 16) }]}>{ritual.sequence}</Text>
            </View>
            <Text style={[styles.heroTitle, { fontSize: 26 + (fontSize.xl - 16) }]}>{ritualText.title}</Text>
            <View style={styles.heroDuration}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={[styles.heroDurationText, { fontSize: 12 + (fontSize.base - 13) }]}>{ritual.estimatedDuration}</Text>
            </View>
          </View>
        </FadeIn>

        {/* Description */}
        <SlideIn direction="up" delay={100} distance={20}>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="book-outline" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>Description</Text>
            </View>
            <Text style={[styles.description, { color: colors.icon, fontSize: 14 + (fontSize.base - 13) }]}>{ritualText.description}</Text>
          </View>
        </SlideIn>

        {/* Tips */}
        <SlideIn direction="up" delay={200} distance={20}>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#FEF3C715' }]}>
                <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>Tips for Success</Text>
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

        {/* Common Mistakes */}
        <SlideIn direction="up" delay={300} distance={20}>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: `${colors.error}12` }]}>
                <Ionicons name="warning-outline" size={16} color={colors.error} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>Common Mistakes</Text>
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

        {/* Mistake Prevention Guide (from API) */}
        {isUmrahGuideFlow && mistakeGuide && (
          <SlideIn direction="up" delay={400} distance={20}>
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

        {/* Complete Button — only shown in the umrah-guide checklist flow */}
        {isUmrahGuideFlow && (
          <SlideIn direction="up" delay={mistakeGuide ? 500 : 400} distance={20}>
            {isCompleted ? (
              <AnimatedPressable
                style={[styles.completeBtn, { backgroundColor: colors.success }]}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={[styles.completeBtnText, { fontSize: 16 + (fontSize.base - 13) }]}>
                  {t('umrahGuide.alreadyCompleted')}
                </Text>
              </AnimatedPressable>
            ) : !isCurrentStep ? (
              <View style={[styles.completeBtn, { backgroundColor: colors.cardAlt }]}>
                <Ionicons name="lock-closed" size={20} color={colors.icon} />
                <Text style={[styles.completeBtnText, { color: colors.icon, fontSize: 16 + (fontSize.base - 13) }]}>
                  Complete previous steps first
                </Text>
              </View>
            ) : (
              <AnimatedPressable
                onPress={handleMarkComplete}
                disabled={markCompleteMutation.isPending}
                style={[
                  styles.completeBtn,
                  { backgroundColor: colors.primary },
                  markCompleteMutation.isPending && { opacity: 0.6 },
                ]}
              >
                {markCompleteMutation.isPending ? (
                  <Text style={[styles.completeBtnText, { fontSize: 16 + (fontSize.base - 13) }]}>Saving...</Text>
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={20} color="#fff" />
                    <Text style={[styles.completeBtnText, { fontSize: 16 + (fontSize.base - 13) }]}>
                      {t('umrahGuide.returnToGuide')}
                    </Text>
                  </>
                )}
              </AnimatedPressable>
            )}
          </SlideIn>
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
  stepBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  stepText: { fontSize: 12, fontWeight: '700' },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  heroBanner: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  heroBadgeText: { color: '#fff', fontWeight: '800', fontSize: 22 },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
  },
  heroDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  heroDurationText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 23 },
  itemList: { gap: Spacing.sm },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
  },
  listItemText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '500' },
  completeBtn: {
    borderRadius: BorderRadius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: Spacing.sm,
  },
  completeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
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
  preventionItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  preventionTitle: { fontWeight: '700', marginBottom: 4 },
  preventionText: { marginBottom: 2, lineHeight: 18 },
});
