import { FadeIn, SlideIn } from '@/components/FadeIn';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetRitualById, useMarkCompleteMutation } from '@/hooks/useRitualQueries';
import { useToast } from '@/hooks/useToast';
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
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { data: ritual, isLoading: loading, isError } = useGetRitualById(id as string);
  const markCompleteMutation = useMarkCompleteMutation();
  const toast = useToast();
  const lang = (user?.preferredLanguage || 'en') as 'en' | 'ar' | 'ur';

  const handleMarkComplete = async () => {
    if (!ritual) return;
    try {
      await markCompleteMutation.mutateAsync(ritual._id);
      toast.success('Ritual complete! 🎉', `${ritual.translations['en'].title} has been marked as done.`);
      router.back();
    } catch (err) {
      toast.error('Could not save progress', getErrorMessage(err, 'Please try again.'));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <AnimatedPressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </AnimatedPressable>
        </View>
        <View style={styles.centerContent}>
          <View style={[styles.errorBox, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
            <Ionicons name="alert-circle" size={32} color={colors.error} />
            <Text style={[styles.errorTitle, { color: colors.error }]}>Ritual not found</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const t = ritual.translations[lang];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        <AnimatedPressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </AnimatedPressable>
        <View style={[styles.stepBadge, { backgroundColor: `${colors.primary}15` }]}>
          <Text style={[styles.stepText, { color: colors.primary }]}>Step {ritual.sequence} of 8</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <FadeIn duration={400}>
          <View style={[styles.heroBanner, { backgroundColor: colors.primary }]}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{ritual.sequence}</Text>
            </View>
            <Text style={styles.heroTitle}>{t.title}</Text>
            <View style={styles.heroDuration}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroDurationText}>{ritual.estimatedDuration}</Text>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            </View>
            <Text style={[styles.description, { color: colors.icon }]}>{t.description}</Text>
          </View>
        </SlideIn>

        {/* Tips */}
        <SlideIn direction="up" delay={200} distance={20}>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: '#FEF3C715' }]}>
                <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tips for Success</Text>
            </View>
            <View style={styles.itemList}>
              {t.tips.map((tip, idx) => (
                <View key={idx} style={[styles.listItem, { backgroundColor: `${colors.primary}08`, borderLeftColor: colors.primary }]}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                  <Text style={[styles.listItemText, { color: colors.text }]}>{tip}</Text>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Mistakes</Text>
            </View>
            <View style={styles.itemList}>
              {t.commonMistakes.map((mistake, idx) => (
                <View key={idx} style={[styles.listItem, { backgroundColor: `${colors.error}08`, borderLeftColor: colors.error }]}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={[styles.listItemText, { color: colors.text }]}>{mistake}</Text>
                </View>
              ))}
            </View>
          </View>
        </SlideIn>

        {/* Complete Button */}
        <SlideIn direction="up" delay={400} distance={20}>
          <AnimatedPressable
            onPress={handleMarkComplete}
            disabled={markCompleteMutation.isPending}
            style={[styles.completeBtn, { backgroundColor: colors.primary }, markCompleteMutation.isPending && { opacity: 0.6 }]}
          >
            {markCompleteMutation.isPending ? (
              <Text style={styles.completeBtnText}>Saving…</Text>
            ) : (
              <>
                <Ionicons name="checkmark-done" size={20} color="#fff" />
                <Text style={styles.completeBtnText}>Mark as Complete</Text>
              </>
            )}
          </AnimatedPressable>
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
});
