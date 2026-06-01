import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { Ionicons } from '@expo/vector-icons';

interface ElderlyModifications {
  title: string;
  modifications: string[];
  restBreaks: {
    recommendedMinutes: number;
    position: string;
  };
  healthWarnings: string[];
  accompaniments: string[];
  emergencyTips: string[];
}

interface ElderlyGuideCardProps {
  guide: ElderlyModifications;
  showWarnings?: boolean;
}

export function ElderlyGuideCard({ guide, showWarnings = true }: ElderlyGuideCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isPlaying, isLoading, play, stop } = useAudioPlayback();
  const [audioSection, setAudioSection] = useState<string | null>(null);

  const handlePlayAudio = async (section: string, text: string) => {
    if (isPlaying && audioSection === section) {
      await stop();
      setAudioSection(null);
    } else {
      await stop();
      await play(text);
      setAudioSection(section);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.titleSection}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name="accessibility-outline" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{guide.title}</Text>
        <Pressable
          onPress={() => handlePlayAudio('title', guide.title)}
          style={[styles.audioBtn, { backgroundColor: `${colors.primary}15` }]}
        >
          {isLoading && audioSection === 'title' ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons
              name={isPlaying && audioSection === 'title' ? 'pause' : 'volume-high'}
              size={16}
              color={colors.primary}
            />
          )}
        </Pressable>
      </View>

      {showWarnings && guide.healthWarnings.length > 0 && (
        <View style={[styles.warningsSection, { backgroundColor: `#EF444410` }]}>
          <View style={styles.warningHeader}>
            <Ionicons name="alert" size={16} color="#EF4444" />
            <Text style={[styles.warningTitle, { color: '#EF4444' }]}>Health Warnings</Text>
          </View>
          {guide.healthWarnings.map((warning, idx) => (
            <View key={idx} style={styles.warningItem}>
              <Text style={[styles.warningDot, { color: colors.text }]}>•</Text>
              <Text style={[styles.warningText, { color: colors.icon }]}>{warning}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="refresh-outline" size={16} color="#F59E0B" />
          <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Modifications</Text>
          <Pressable
            onPress={() => handlePlayAudio('modifications', guide.modifications.join('. '))}
            style={[styles.audioBtn, { backgroundColor: '#F59E0B15' }]}
          >
            {isLoading && audioSection === 'modifications' ? (
              <ActivityIndicator size="small" color="#F59E0B" />
            ) : (
              <Ionicons
                name={isPlaying && audioSection === 'modifications' ? 'pause' : 'volume-high'}
                size={14}
                color="#F59E0B"
              />
            )}
          </Pressable>
        </View>
        {guide.modifications.map((mod, idx) => (
          <View key={idx} style={styles.item}>
            <Text style={[styles.bullet, { color: colors.text }]}>→</Text>
            <Text style={[styles.itemText, { color: colors.text }]}>{mod}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={16} color="#10B981" />
          <Text style={[styles.sectionTitle, { color: '#10B981' }]}>Rest Breaks</Text>
        </View>
        <View style={[styles.restBreakBox, { backgroundColor: `#10B98115` }]}>
          <Text style={[styles.restBreakText, { color: colors.text }]}>
            <Text style={{ fontWeight: '700' }}>{guide.restBreaks.recommendedMinutes} mins</Text>
            {' - '}
            <Text style={{ fontWeight: '500' }}>{guide.restBreaks.position}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="warning-outline" size={16} color="#EF4444" />
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Emergency Tips</Text>
        </View>
        {guide.emergencyTips.slice(0, 2).map((tip, idx) => (
          <View key={idx} style={styles.item}>
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text style={[styles.itemText, { color: colors.text }]}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  warningsSection: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  warningItem: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: 4,
  },
  warningDot: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginVertical: 4,
  },
  bullet: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  itemText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  restBreakBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  restBreakText: {
    fontSize: 13,
    lineHeight: 18,
  },
  audioBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
