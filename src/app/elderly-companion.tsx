import { ElderlyGuideCard } from '@/components/ElderlyGuideCard';
import { FadeIn, SlideIn } from '@/components/FadeIn';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetAllElderlyGuides } from '@/hooks/useElderlyGuides';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ElderlyCompanionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const lang = (user?.preferredLanguage || 'en') as 'en' | 'ar' | 'ur';
  const { data: guides = [], isLoading } = useGetAllElderlyGuides(lang);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Pressable onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Elderly Companion</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              Special guidance for senior pilgrims
            </Text>
          </View>
        </View>

        {/* Info Card */}
        <FadeIn duration={400}>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: `${colors.primary}08`, borderColor: colors.primary },
            ]}
          >
            <View style={[styles.infoBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="accessibility-outline" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Customized Support
              </Text>
              <Text style={[styles.infoText, { color: colors.icon }]}>
                Get personalized modifications and health guidance for a comfortable Umrah
              </Text>
            </View>
          </View>
        </FadeIn>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            {[1, 2].map(i => (
              <View
                key={i}
                style={[
                  styles.skeletonCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <SkeletonLoader width="60%" height={18} />
                <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                  <SkeletonLoader height={14} />
                  <SkeletonLoader width="80%" height={14} />
                </View>
              </View>
            ))}
          </View>
        ) : guides.length > 0 ? (
          guides.map((guide, idx) => (
            <SlideIn key={guide._id} direction="up" delay={idx * 100} distance={20}>
              <ElderlyGuideCard guide={guide} showWarnings={idx === 0} />
            </SlideIn>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="information-circle-outline" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No guides available
            </Text>
            <Text style={[styles.emptySub, { color: colors.icon }]}>
              Elderly companion guides will appear here
            </Text>
          </View>
        )}

        {/* Tips Section */}
        {!isLoading && guides.length > 0 && (
          <SlideIn direction="up" delay={guides.length * 100} distance={20}>
            <View
              style={[
                styles.tipsSection,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.tipsSectionHeader}>
                <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                <Text style={[styles.tipsSectionTitle, { color: colors.text }]}>
                  General Tips
                </Text>
              </View>

              {[
                '✓ Bring a trusted family member or caregiver',
                '✓ Carry all medications in original containers',
                '✓ Stay hydrated throughout your journey',
                '✓ Wear comfortable, supportive footwear',
                '✓ Take rest breaks when needed',
              ].map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                </View>
              ))}
            </View>
          </SlideIn>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
  loadingContainer: {
    gap: Spacing.md,
  },
  skeletonCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.section,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySub: { fontSize: 13 },
  tipsSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  tipsSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  tipRow: {
    marginVertical: Spacing.xs,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
