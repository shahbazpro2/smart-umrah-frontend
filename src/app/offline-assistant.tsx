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
  const [showQA, setShowQA] = useState(false);
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

  const handleAskQuestion = async () => {
    if (!inputQuestion.trim()) {
      toast.error('Empty Question', 'Please type a question');
      return;
    }

    const lang = (user?.preferredLanguage || 'en') as string;
    await nlpAssistant.askQuestion(
      inputQuestion,
      offlineRituals,
      offlineMistakes,
      lang
    );
    setInputQuestion('');
  };

  const isSynced = syncStatus?.syncStatus === 'synced';
  const isSyncing = syncMutation.isPending;

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
            <Text style={[styles.title, { color: colors.text }]}>Offline Assistant</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>
              Download data for offline access
            </Text>
          </View>
        </View>

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
                {isSynced ? 'Synced' : 'Not Synced'}
              </Text>
              <Text style={[styles.statusText, { color: colors.icon }]}>
                {isSynced && lastSyncTime
                  ? `Last synced: ${lastSyncTime}`
                  : 'Sync data to enable offline access'}
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
              <Text style={[styles.statsTitle, { color: colors.text }]}>Data Available</Text>

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
                <Text style={[styles.sizeLabel, { color: colors.icon }]}>Data Size:</Text>
                <Text style={[styles.sizeValue, { color: colors.text }]}>
                  ~{(stats.statistics.estimatedSize / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            </View>
          </SlideIn>
        )}

        {/* Features */}
        {stats && (
          <SlideIn direction="up" delay={200} distance={20}>
            <View
              style={[
                styles.featuresCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.featuresTitle, { color: colors.text }]}>
                Offline Features
              </Text>

              {[
                { name: 'Rituals', enabled: stats.features.canViewRituals },
                { name: 'Mistake Guides', enabled: stats.features.canViewMistakeGuides },
                { name: 'Elderly Guides', enabled: stats.features.canViewElderlyGuides },
                { name: 'Media', enabled: stats.features.canAccessMedia },
              ].map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Ionicons
                    name={feature.enabled ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={feature.enabled ? '#10B981' : colors.icon}
                  />
                  <Text style={[styles.featureName, { color: colors.text }]}>
                    {feature.name}
                  </Text>
                </View>
              ))}
            </View>
          </SlideIn>
        )}

        {/* Smart Assistant */}
        {!showQA ? (
          <SlideIn direction="up" delay={300} distance={20}>
            <Pressable
              onPress={() => setShowQA(true)}
              style={[
                styles.assistantBtn,
                { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
              ]}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.assistantTitle, { color: colors.text }]}>
                  Smart Assistant
                </Text>
                <Text style={[styles.assistantSub, { color: colors.icon }]}>
                  Ask questions about rituals & guidance
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </Pressable>
          </SlideIn>
        ) : (
          <>
            <SlideIn direction="up" delay={300} distance={20}>
              <View
                style={[
                  styles.qaSection,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <View style={styles.qaHeader}>
                  <Text style={[styles.qaTitle, { color: colors.text }]}>
                    Ask a Question
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowQA(false);
                      nlpAssistant.clearAnswer();
                    }}
                  >
                    <Ionicons name="close" size={20} color={colors.icon} />
                  </Pressable>
                </View>

                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Ask about rituals, mistakes, elderly care..."
                    placeholderTextColor={colors.icon}
                    value={inputQuestion}
                    onChangeText={setInputQuestion}
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    editable={!nlpAssistant.isLoading}
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
                      <Ionicons name="send" size={16} color="#fff" />
                    )}
                  </Pressable>
                </View>

                {nlpAssistant.answer && (
                  <View
                    style={[
                      styles.answerBox,
                      { backgroundColor: `${colors.primary}08` },
                    ]}
                  >
                    <View style={styles.answerHeader}>
                      <Text style={[styles.answerTitle, { color: colors.text }]}>
                        {nlpAssistant.answer.title}
                      </Text>
                      {nlpAssistant.answer.confidence > 0 && (
                        <Text
                          style={[
                            styles.confidence,
                            {
                              color:
                                nlpAssistant.answer.confidence > 0.7
                                  ? '#10B981'
                                  : '#F59E0B',
                            },
                          ]}
                        >
                          {Math.round(nlpAssistant.answer.confidence * 100)}%
                        </Text>
                      )}
                    </View>
                    <View style={styles.answerContent}>
                      {nlpAssistant.answer.content.map((line, idx) => (
                        <Text
                          key={idx}
                          style={[styles.answerText, { color: colors.text }]}
                        >
                          {line}
                        </Text>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </SlideIn>
          </>
        )}

        {/* Actions */}
        <SlideIn direction="up" delay={300} distance={20}>
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
          <SlideIn direction="up" delay={400} distance={20}>
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
            Syncing enables offline access to all rituals, media, and guidance. Sync periodically to
            keep your data up-to-date.
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
  statusCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  statusBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.xs },
  statusText: { fontSize: 12, lineHeight: 16 },
  statsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  statsTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.md },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  sizeInfo: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizeLabel: { fontSize: 12, fontWeight: '500' },
  sizeValue: { fontSize: 14, fontWeight: '700' },
  featuresCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  featuresTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  featureName: { fontSize: 13, fontWeight: '500', flex: 1 },
  syncBtn: {
    borderRadius: BorderRadius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  syncBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  clearBtn: {
    borderRadius: BorderRadius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clearBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  infoSection: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  infoText: { fontSize: 12, lineHeight: 18, flex: 1 },
  assistantBtn: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  assistantTitle: { fontSize: 14, fontWeight: '700' },
  assistantSub: { fontSize: 12, marginTop: 2 },
  qaSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  qaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qaTitle: { fontSize: 15, fontWeight: '700' },
  inputWrapper: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 13,
    maxHeight: 80,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  answerTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  confidence: { fontSize: 12, fontWeight: '600' },
  answerContent: { gap: Spacing.sm },
  answerText: { fontSize: 13, lineHeight: 18 },
});
