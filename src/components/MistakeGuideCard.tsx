import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

interface Mistake {
  mistake: string;
  impact: string;
  prevention: string;
}

interface MistakeGuideCardProps {
  mistake: Mistake;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function MistakeGuideCard({ mistake, severity = 'medium' }: MistakeGuideCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const severityColors: Record<string, string> = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626',
  };

  const severityIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    low: 'alert-circle',
    medium: 'warning',
    high: 'alert',
    critical: 'alert-circle',
  };

  const accentColor = severityColors[severity] || severityColors.medium;
  const iconName = severityIcons[severity] || severityIcons.medium;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.severityBadge, { backgroundColor: `${accentColor}20` }]}>
          <Ionicons name={iconName} size={16} color={accentColor} />
        </View>
        <Text style={[styles.mistakeTitle, { color: colors.text }]} numberOfLines={2}>
          {mistake.mistake}
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionLabel}>
          <Ionicons name="alert-circle-outline" size={14} color="#EF4444" />
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Impact</Text>
        </View>
        <Text style={[styles.sectionText, { color: colors.icon }]}>{mistake.impact}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionLabel}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#10B981" />
          <Text style={[styles.sectionTitle, { color: '#10B981' }]}>Prevention</Text>
        </View>
        <Text style={[styles.sectionText, { color: colors.icon }]}>{mistake.prevention}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  severityBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  mistakeTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  sectionText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
