import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppSettings, RitualMode } from '@/store/settings.store';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  compact?: boolean;
}

export function LearnPerformSwitch({ compact = false }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { ritualMode, setRitualMode } = useAppSettings();

  const isLearn = ritualMode === 'learn';

  const handleSelect = (mode: RitualMode) => {
    if (mode !== ritualMode) {
      if (process.env.EXPO_OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      setRitualMode(mode);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.border },
        compact && styles.compactContainer,
      ]}
    >
      {/* Learn Option */}
      <Pressable
        onPress={() => handleSelect('learn')}
        style={[
          styles.optionButton,
          isLearn && {
            backgroundColor: `${colors.primary}18`,
            borderColor: colors.primary,
          },
          compact && styles.compactOption,
        ]}
      >
        <Ionicons
          name={isLearn ? 'book' : 'book-outline'}
          size={compact ? 13 : 15}
          color={isLearn ? colors.primary : colors.icon}
        />
        <Text
          style={[
            styles.optionLabel,
            compact && styles.compactLabel,
            {
              color: isLearn ? colors.primary : colors.icon,
              fontWeight: isLearn ? '800' : '600',
            },
          ]}
        >
          Learn Mode
        </Text>
      </Pressable>

      {/* Perform Option */}
      <Pressable
        onPress={() => handleSelect('perform')}
        style={[
          styles.optionButton,
          !isLearn && {
            backgroundColor: '#10B98118',
            borderColor: '#10B981',
          },
          compact && styles.compactOption,
        ]}
      >
        <FontAwesome5
          name="pray"
          size={compact ? 13 : 15}
          color={!isLearn ? '#10B981' : colors.icon}
        />
        <Text
          style={[
            styles.optionLabel,
            compact && styles.compactLabel,
            {
              color: !isLearn ? '#10B981' : colors.icon,
              fontWeight: !isLearn ? '800' : '600',
            },
          ]}
        >
          Perform Mode
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: 3,
    gap: 4,
  },
  compactContainer: {
    borderRadius: BorderRadius.full,
    padding: 2,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  compactOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
  },
  optionLabel: {
    fontSize: 13,
  },
  compactLabel: {
    fontSize: 12,
  },
});
