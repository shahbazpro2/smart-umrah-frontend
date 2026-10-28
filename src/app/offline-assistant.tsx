import { FadeIn, SlideIn } from '@/components/FadeIn';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNLPAssistant } from '@/hooks/useNLPAssistant';
import {
  useClearOfflineCache,
  useGetOfflineMistakeGuides,
  useGetOfflineRituals,
  useGetOfflineStats,
  useGetOfflineSyncStatus,
  useSyncOfflineData,
} from '@/hooks/useOfflineAssistant';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function AnimatedPressable({ onPress, disabled, style, children }: any) {
  const scale = new Animated.Value(1);
  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const POPULAR_KEYWORDS = [
  'Ihram',
  'Talbiyah',
  'Tawaf',
  'Zamzam',
  'Sa\'i',
  'Halq',
  'Mistakes',
  'Elderly',
  'Dua',
];

export default function OfflineAssistantScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const toast = useToast();
  const { user } = useAuth();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const { data: stats } = useGetOfflineStats();
  const { data: syncStatus } = useGetOfflineSyncStatus();
  const { data: offlineRituals = [] } = useGetOfflineRituals();
  const { data: offlineMistakes = [] } = useGetOfflineMistakeGuides();
  const syncMutation = useSyncOfflineData();
  const clearMutation = useClearOfflineCache();
  const nlpAssistant = useNLPAssistant();
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [inputQuestion, setInputQuestion] = useState('');

  useEffect(() => {
    if (syncStatus?.syncedAt) {
      const date = new Date(syncStatus.syncedAt);
      const timeStr = date.toLocaleString();
      setLastSyncTime(timeStr);
    }
  }, [syncStatus?.syncedAt]);

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      toast.success('Sync Complete', 'Your offline data has been updated');
    } catch (err: any) {
      toast.error('Sync Failed', err.message || 'Unable to sync offline data');
    }
  };

  const handleClear = async () => {
    try {
      await clearMutation.mutateAsync();
      toast.success('Cache Cleared', 'Offline cache has been cleared');
    } catch (err: any) {
      toast.error('Clear Failed', err.message || 'Unable to clear cache');
    }
  };

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      toast.error('Empty Query', 'Please enter a keyword or query');
      return;
    }

    const lang = (user?.preferredLanguage || 'en') as string;
    await nlpAssistant.askQuestion(
      searchTerm,
      offlineRituals,
      offlineMistakes,
      lang
    );
  };

  const handleAskQuestion = async () => {
    await executeSearch(inputQuestion);
  };

  const handleTapKeyword = async (kw: string) => {
    setInputQuestion(kw);
    await executeSearch(kw);
  };

  const isSynced = syncStatus?.syncStatus === 'synced';
  const isSyncing = syncMutation.isPending;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Pressable onPress={handleBack} style={[styles.backBtn, { borderColor: colors.border }]}>
            <Ionicons name="chevron-back" size={22} color={colors.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Offline Smart Assistant</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              Keyword-based answers & offline guidance
            </Text>
          </View>
        </View>

        {/* ================= KEYWORD BASED SEARCH & QUERY ================= */}
        <SlideIn direction="up" delay={50} distance={15}>
          <View style={[styles.searchSectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.searchSectionHeader}>
              <View style={[styles.searchIconBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Ionicons name="search" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.qaTitle, { color: colors.text }]}>Keyword Search & Q&A</Text>
                <Text style={[styles.qaSub, { color: colors.icon }]}>
                  Type any Umrah term (e.g. Ihram, Tawaf, Zamzam) to get an immediate reply
                </Text>
              </View>
            </View>

            {/* Keyword Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.keywordChipsRow}
            >
              {POPULAR_KEYWORDS.map((kw) => (
                <Pressable
                  key={kw}
                  onPress={() => handleTapKeyword(kw)}
                  style={[
                    styles.keywordChip,
                    {
                      backgroundColor: inputQuestion.toLowerCase() === kw.toLowerCase() ? colors.primary : `${colors.primary}10`,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.keywordChipText,
                      { color: inputQuestion.toLowerCase() === kw.toLowerCase() ? '#fff' : colors.primary },
                    ]}
                  >
                    #{kw}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Input Bar */}
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Search a keyword or ask a question..."
                placeholderTextColor={colors.icon}
                value={inputQuestion}
                onChangeText={setInputQuestion}
                onSubmitEditing={handleAskQuestion}
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                editable={!nlpAssistant.isLoading}
                returnKeyType="search"
              />
              <Pressable
                onPress={handleAskQuestion}
                disabled={nlpAssistant.isLoading}
                style={[
                  styles.sendBtn,
                  { backgroundColor: colors.primary },
                  nlpAssistant.isLoading && { opacity: 0.6 },
                ]}
              >
                {nlpAssistant.isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="search" size={16} color="#fff" />
                )}
              </Pressable>
            </View>

            {/* Answer Display */}
            {nlpAssistant.answer && (
              <FadeIn duration={300}>
                <View style={[styles.answerBox, { backgroundColor: `${colors.primary}08`, borderColor: colors.primary }]}>
                  <View style={styles.answerHeader}>
                    <Text style={[styles.answerTitle, { color: colors.text }]}>
                      {nlpAssistant.answer.title}
                    </Text>
                    {nlpAssistant.answer.confidence > 0 && (
                      <View style={[styles.confBadge, { backgroundColor: '#10B98115' }]}>
                        <Text style={styles.confBadgeText}>
                          {Math.round(nlpAssistant.answer.confidence * 100)}% match
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Arabic Text if present */}
                  {nlpAssistant.answer.arabic && (
                    <View style={[styles.arabicCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      <Text style={[styles.arabicText, { color: colors.text }]}>
                        {nlpAssistant.answer.arabic}
                      </Text>
                      {nlpAssistant.answer.transliteration && (
                        <Text style={[styles.translitText, { color: colors.primary }]}>
                          "{nlpAssistant.answer.transliteration}"
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Content Lines */}
                  <View style={styles.answerContent}>
                    {nlpAssistant.answer.content.map((line, idx) => (
                      <Text key={idx} style={[styles.answerText, { color: colors.text }]}>
                        {line}
                      </Text>
                    ))}
                  </View>

                  {/* Related Media Link if present */}
                  {nlpAssistant.answer.relatedMediaId && (
                    <Pressable
                      onPress={() => router.push(`/media/${nlpAssistant.answer?.relatedMediaId}`)}
                      style={[styles.relatedMediaBtn, { backgroundColor: colors.primary }]}
                    >
                      <Ionicons name="play-circle" size={16} color="#fff" />
                      <Text style={styles.relatedMediaBtnText}>View Related Media Guide</Text>
                      <Ionicons name="chevron-forward" size={14} color="#fff" />
                    </Pressable>
                  )}
                </View>
              </FadeIn>
            )}
          </View>
        </SlideIn>

        {/* Status Card */}
        <FadeIn duration={400}>
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: isSynced ? `#10B98110` : `#F59E0B10`,
                borderColor: isSynced ? '#10B981' : '#F59E0B',
              },
            ]}
          >
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isSynced ? '#10B981' : '#F59E0B' },
              ]}
            >
              <Ionicons
                name={isSynced ? 'checkmark-circle' : 'cloud-download-outline'}
                size={24}
                color="#fff"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {isSynced ? 'Offline Data Synced' : 'Ready for Sync'}
              </Text>
              <Text style={[styles.statusText, { color: colors.icon }]}>
                {isSynced && lastSyncTime
                  ? `Last synced: ${lastSyncTime}`
                  : 'Sync data to enable complete offline access'}
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Statistics */}
        {stats && (
          <SlideIn direction="up" delay={100} distance={20}>
            <View
              style={[
                styles.statsCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.statsTitle, { color: colors.text }]}>Offline Data Available</Text>

              <View style={styles.statsGrid}>
                {[
                  {
                    icon: 'book-outline',
                    label: 'Rituals',
                    value: stats.statistics.totalRituals,
                    color: '#6366F1',
                  },
                  {
                    icon: 'play-circle-outline',
                    label: 'Media',
                    value: stats.statistics.totalMedia,
                    color: '#10B981',
                  },
                  {
                    icon: 'alert-circle-outline',
                    label: 'Mistakes',
                    value: stats.statistics.totalMistakeGuides,
                    color: '#F59E0B',
                  },
                  {
                    icon: 'accessibility-outline',
                    label: 'Elderly',
                    value: stats.statistics.totalElderlyGuides,
                    color: '#EC4899',
                  },
                ].map((item, idx) => (
                  <View key={idx} style={styles.statItem}>
                    <View
                      style={[
                        styles.statIcon,
                        { backgroundColor: `${item.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {item.value}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.icon }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.sizeInfo, { backgroundColor: `${colors.primary}08` }]}>
                <Text style={[styles.sizeLabel, { color: colors.icon }]}>Total Size:</Text>
                <Text style={[styles.sizeValue, { color: colors.text }]}>
                  ~{(stats.statistics.estimatedSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            </View>
          </SlideIn>
        )}

        {/* Actions */}
        <SlideIn direction="up" delay={250} distance={20}>
          <AnimatedPressable
            onPress={handleSync}
            disabled={isSyncing}
            style={[
              styles.syncBtn,
              {
                backgroundColor: colors.primary,
                opacity: isSyncing ? 0.6 : 1,
              },
            ]}
          >
            <Ionicons
              name={isSyncing ? 'sync' : 'cloud-download-outline'}
              size={20}
              color="#fff"
            />
            <Text style={styles.syncBtnText}>
              {isSyncing ? 'Syncing...' : 'Sync Offline Data'}
            </Text>
          </AnimatedPressable>
        </SlideIn>

        {isSynced && (
          <SlideIn direction="up" delay={300} distance={20}>
            <AnimatedPressable
              onPress={handleClear}
              disabled={clearMutation.isPending}
              style={[
                styles.clearBtn,
                {
                  backgroundColor: colors.error,
                  opacity: clearMutation.isPending ? 0.6 : 1,
                },
              ]}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.clearBtnText}>
                {clearMutation.isPending ? 'Clearing...' : 'Clear Cache'}
              </Text>
            </AnimatedPressable>
          </SlideIn>
        )}

        {/* Info */}
        <View style={[styles.infoSection, { backgroundColor: `${colors.primary}08` }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.icon }]}>
            All guides, media, and keyword search work seamlessly offline with no internet required.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
    paddingBottom: Spacing.massive,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, marginTop: 2 },
  searchSectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  searchSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qaTitle: { fontSize: 16, fontWeight: '800' },
  qaSub: { fontSize: 12, marginTop: 1 },
  keywordChipsRow: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  keywordChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  keywordChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerBox: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  answerTitle: { fontSize: 15, fontWeight: '800', flex: 1 },
  confBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  confBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '700' },
  arabicCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  arabicText: { fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  translitText: { fontSize: 12, fontStyle: 'italic', textAlign: 'center' },
  answerContent: { gap: 6 },
  answerText: { fontSize: 13, lineHeight: 18 },
  relatedMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: 4,
  },
  relatedMediaBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  statusBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  statusText: { fontSize: 12, marginTop: 2 },
  statsCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  statsTitle: { fontSize: 15, fontWeight: '700' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 11 },
  sizeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sizeLabel: { fontSize: 12 },
  sizeValue: { fontSize: 13, fontWeight: '700' },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
  },
  syncBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
  },
  clearBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
