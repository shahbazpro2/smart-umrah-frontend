import { AnimatedCard } from '@/components/AnimatedCard';
import { FadeIn, SlideIn } from '@/components/FadeIn';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function QuickLinkCard({ label, icon, route, delay, onPress }: {
  label: string; icon: keyof typeof Ionicons.glyphMap; route: string; delay: number; onPress: () => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { fontSize } = useElderlyMode();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 10 }).start();

  return (
    <SlideIn direction="up" delay={delay} distance={30} style={{ flex: 1 }}>
      <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
        <Pressable
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[styles.quickLink, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.quickLinkIconWrap, { backgroundColor: `${colors.primary}12` }]}>
            <Ionicons name={icon} size={26} color={colors.primary} />
          </View>
          <Text style={[styles.linkLabel, { color: colors.text, fontSize: 12 + (fontSize.base - 13) }]}>{label}</Text>
        </Pressable>
      </Animated.View>
    </SlideIn>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { fontSize } = useElderlyMode();
  const { t } = useTranslation();
  const TAB_BAR_HEIGHT = 65;
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + Spacing.lg;

  const quickLinks: { label: string; icon: keyof typeof Ionicons.glyphMap; route: string }[] = [
    { label: t('home.rituals'), icon: 'book', route: '/(tabs)/rituals' },
    { label: t('home.profile'), icon: 'person', route: '/(tabs)/profile' },
    { label: t('home.media'), icon: 'play-circle', route: '/media' },
  ];

  const rituals = [
    { num: 1, name: 'Ihram', desc: 'Intention & Dress', icon: 'shirt-outline' as keyof typeof Ionicons.glyphMap },
    { num: 2, name: 'Tawaf', desc: 'Circle the Kaaba', icon: 'sync-outline' as keyof typeof Ionicons.glyphMap },
    { num: 3, name: 'Prayer', desc: 'At Maqam Ibrahim', icon: 'hand-left-outline' as keyof typeof Ionicons.glyphMap },
    { num: 4, name: "Sa'i", desc: 'Safa & Marwa', icon: 'walk-outline' as keyof typeof Ionicons.glyphMap },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Header */}
        <FadeIn duration={500}>
          <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
            <View style={styles.heroContent}>
              <Text style={[styles.heroGreeting, { fontSize: 13 + (fontSize.base - 13) }]}>{t('home.welcome')}</Text>
              <Text style={[styles.heroName, { fontSize: 24 + (fontSize.large - 15) }]}>{user?.name ?? 'Pilgrim'}</Text>
              <Text style={[styles.heroSub, { fontSize: 13 + (fontSize.base - 13) }]}>{t('home.ready')}</Text>
            </View>
            <View style={styles.heroMoon}>
              <Text style={{ fontSize: 56 }}>🕌</Text>
            </View>
          </View>
        </FadeIn>

        {/* Quick Access */}
        <SlideIn direction="up" delay={150} distance={30}>
          <Text style={[styles.sectionLabel, { color: colors.icon, fontSize: 11 + (fontSize.small - 12) }]}>{t('home.quickAccess')}</Text>
        </SlideIn>
        <View style={styles.linksGrid}>
          {quickLinks.map((link, idx) => (
            <QuickLinkCard
              key={link.route}
              label={link.label}
              icon={link.icon}
              route={link.route}
              delay={200 + idx * 80}
              onPress={() => router.push(link.route as any)}
            />
          ))}
        </View>

        {/* About Card */}
        <SlideIn direction="up" delay={400} distance={30}>
          <AnimatedCard style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="moon" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>{t('home.about')}</Text>
            </View>
            <Text style={[styles.cardText, { color: colors.icon, fontSize: 14 + (fontSize.base - 13) }]}>
              {t('home.aboutDesc')}
            </Text>
          </AnimatedCard>
        </SlideIn>

        {/* Rituals Overview */}
        <SlideIn direction="up" delay={500} distance={30}>
          <AnimatedCard style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="list" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>{t('home.theRituals')}</Text>
            </View>
            <View style={styles.ritualRows}>
              {rituals.map((r) => (
                <View key={r.num} style={[styles.ritualRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.ritualNumBadge, { backgroundColor: `${colors.primary}15` }]}>
                    <Text style={[styles.ritualNumText, { color: colors.primary, fontSize: 13 + (fontSize.base - 13) }]}>{r.num}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ritualName, { color: colors.text, fontSize: 13 + (fontSize.base - 13) }]}>{r.name}</Text>
                    <Text style={[styles.ritualDesc, { color: colors.icon, fontSize: 12 + (fontSize.small - 12) }]}>{r.desc}</Text>
                  </View>
                  <Ionicons name={r.icon} size={18} color={colors.border} />
                </View>
              ))}
              <Pressable onPress={() => router.push('/(tabs)/rituals')} style={styles.seeAllRow}>
                <Text style={[styles.seeAllText, { color: colors.primary, fontSize: 13 + (fontSize.base - 13) }]}>{t('home.seeAll')}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </Pressable>
            </View>
          </AnimatedCard>
        </SlideIn>

        {/* Tips Card */}
        <SlideIn direction="up" delay={600} distance={30}>
          <AnimatedCard style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: '#FEF3C715' }]}>
                <Ionicons name="bulb" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>{t('home.pilgrimTips')}</Text>
            </View>
            {[
              { icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap, text: t('home.tip1') },
              { icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap, text: t('home.tip2') },
              { icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap, text: t('home.tip3') },
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name={tip.icon} size={16} color={colors.success} />
                <Text style={[styles.tipText, { color: colors.icon, fontSize: 13 + (fontSize.base - 13) }]}>{tip.text}</Text>
              </View>
            ))}
          </AnimatedCard>
        </SlideIn>

        {/* Language Card */}
        <SlideIn direction="up" delay={700} distance={30}>
          <AnimatedCard style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconWrap, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="globe" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>{t('home.multilingualSupport')}</Text>
            </View>
            <View style={styles.langRow}>
              {['English', 'العربية', 'اردو'].map((lang) => (
                <View key={lang} style={[styles.langBadge, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` }]}>
                  <Text style={[styles.langText, { color: colors.primary, fontSize: 13 + (fontSize.base - 13) }]}>{lang}</Text>
                </View>
              ))}
            </View>
          </AnimatedCard>
        </SlideIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: { flex: 1 },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 4 },
  heroName: { fontSize: 24, color: '#fff', fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '400' },
  heroMoon: { marginLeft: Spacing.md },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: -Spacing.xs,
    marginTop: Spacing.sm,
  },
  linksGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  quickLink: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    gap: Spacing.sm,
  },
  quickLinkIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardText: { fontSize: 14, lineHeight: 22 },
  ritualRows: { gap: 0 },
  ritualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ritualNumBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ritualNumText: { fontSize: 13, fontWeight: '700' },
  ritualName: { fontSize: 13, fontWeight: '600' },
  ritualDesc: { fontSize: 12, marginTop: 1 },
  seeAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.md,
    justifyContent: 'flex-end',
  },
  seeAllText: { fontSize: 13, fontWeight: '600' },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tipText: { fontSize: 13, lineHeight: 20, flex: 1 },
  langRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  langBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  langText: { fontSize: 13, fontWeight: '600' },
});
