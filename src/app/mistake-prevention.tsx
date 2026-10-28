import { FadeIn, SlideIn } from '@/components/FadeIn';
import { MistakeGuideCard } from '@/components/MistakeGuideCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGetAllMistakeGuides } from '@/hooks/useMistakeGuides';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SEVERITY_FILTERS = [
  { key: 'all', label: 'All', icon: 'grid-outline' as const },
  { key: 'critical', label: 'Critical', icon: 'alert' as const },
  { key: 'high', label: 'High', icon: 'alert-circle' as const },
  { key: 'medium', label: 'Medium', icon: 'warning' as const },
  { key: 'low', label: 'Low', icon: 'information-circle-outline' as const },
];

export default function MistakePreventionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const lang = (user?.preferredLanguage || 'en') as 'en' | 'ar' | 'ur';

  const { data: allGuides = [], isLoading } = useGetAllMistakeGuides(lang);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const filteredGuides = useMemo(() => {
    if (selectedSeverity === 'all') return allGuides;
    return allGuides.filter(g => g.severity === selectedSeverity);
  }, [allGuides, selectedSeverity]);

  const Header = (
    <>
      <View style={styles.headerSection}>
        <Pressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Mistake Prevention</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            {isLoading ? 'Loading...' : `${filteredGuides.length} guides`}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {SEVERITY_FILTERS.map(f => {
          const active = selectedSeverity === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setSelectedSeverity(f.key)}
              style={[
                styles.filterPill,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons
                name={f.icon}
                size={14}
                color={active ? '#fff' : colors.icon}
              />
              <Text
                style={[styles.filterLabel, { color: active ? '#fff' : colors.text }]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {Header}
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.skeletonCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <SkeletonLoader width="80%" height={16} />
              <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
                <SkeletonLoader height={14} />
                <SkeletonLoader width="90%" height={14} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={filteredGuides}
        keyExtractor={item => item._id}
        ListHeaderComponent={Header}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <FadeIn delay={index * 50} duration={300}>
            <SlideIn direction="up" delay={index * 50} distance={10}>
              <MistakeGuideCard
                mistake={item.commonMistakes[0]}
                severity={item.severity}
              />
            </SlideIn>
          </FadeIn>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-outline" size={56} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No mistakes found
            </Text>
            <Text style={[styles.emptySub, { color: colors.icon }]}>
              Try a different filter
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  filterScroll: { marginBottom: Spacing.md },
  filterRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
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
  filterLabel: { fontSize: 12, fontWeight: '600' },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  loadingContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
});
