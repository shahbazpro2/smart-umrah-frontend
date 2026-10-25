import { BorderRadius, Spacing } from '@/constants/theme';
import { useAppSettings } from '@/store/settings.store';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RitualFocusContent {
  id: string;
  name: string;
  arabicName: string;
  maxRounds?: number;
  counterLabel?: string;
  essentialAction: string;
  primaryArabic: string;
  transliteration: string;
  meaning: string;
  sunnahNotes: string;
}

const RITUAL_FOCUS_DATA: RitualFocusContent[] = [
  {
    id: 'ihram',
    name: 'Ihram & Talbiyah',
    arabicName: 'الإحرام والتلبية',
    essentialAction: 'Pronounce Niyyah at Miqat and recite Talbiyah continuously with humility.',
    primaryArabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لاَ شَرِيكَ لَكَ',
    transliteration: 'Labbayk Allaahumma labbayk, labbayka laa shareeka laka labbayk...',
    meaning: 'Here I am O Allah, here I am. You have no partner. All praise and blessing belong to You.',
    sunnahNotes: 'Recite Talbiyah frequently until you begin Tawaf at the Kaaba.',
  },
  {
    id: 'tawaf',
    name: 'Tawaf al-Umrah',
    arabicName: 'طواف العمرة',
    maxRounds: 7,
    counterLabel: 'Circuits Completed',
    essentialAction: '7 rounds counter-clockwise keeping the Kaaba to your left, starting at the Black Stone.',
    primaryArabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    transliteration: 'Rabbana aatina fid-dunya hasanatan wa fil-aakhirati hasanatan wa qina \'adhaaban-naar',
    meaning: 'Our Lord, give us in this world good and in the Hereafter good, and save us from the punishment of the Fire.',
    sunnahNotes: 'Recited between Rukn al-Yamani and Hajar al-Aswad. Make personal supplications freely during rounds.',
  },
  {
    id: 'maqam_ibrahim',
    name: 'Maqam-e-Ibrahim',
    arabicName: 'مقام إبراهيم',
    essentialAction: 'Pray 2 Rakat Sunnah behind Maqam Ibrahim (or anywhere in Masjid al-Haram).',
    primaryArabic: 'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
    transliteration: 'Wattakhidhoo min maqaami Ibraaheema musallaa',
    meaning: 'And take the station of Ibrahim as a place of prayer.',
    sunnahNotes: 'Recite Surah Al-Kafirun in 1st Rakat, Surah Al-Ikhlas in 2nd Rakat.',
  },
  {
    id: 'zamzam',
    name: 'Drinking Zamzam',
    arabicName: 'شرب ماء زمزم',
    essentialAction: 'Drink Zamzam water while standing, facing the Kaaba, with sincere intention.',
    primaryArabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ',
    transliteration: 'Allaahumma innee as-aluka \'ilman naafi\'an, wa rizqan waasi\'an, wa shifaa-an min kulli daa\'',
    meaning: 'O Allah, I ask You for beneficial knowledge, abundant sustenance, and a cure from all illness.',
    sunnahNotes: 'The Prophet (ﷺ) said: Zamzam water is for whatever it is drunk for.',
  },
  {
    id: 'sai',
    name: "Sa'i (Safa & Marwa)",
    arabicName: 'السعي بين الصفا والمروة',
    maxRounds: 7,
    counterLabel: 'Laps Completed',
    essentialAction: '7 laps between Mount Safa and Mount Marwah. Start at Safa, finish at Marwah.',
    primaryArabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ ۖ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    transliteration: 'Innas-Safaa wal-Marwata min sha\'aa-irillaah... Laa ilaaha ill-Allaah wahdahu laa shareeka lah',
    meaning: 'Indeed Safa and Marwah are from the symbols of Allah. There is no deity worthy of worship except Allah alone.',
    sunnahNotes: 'Face Kaaba on Safa and Marwah and make heartfelt Dua 3 times. Men jog gently between green markers.',
  },
  {
    id: 'halq',
    name: 'Halq or Taqsir',
    arabicName: 'الحلق أو التقصير',
    essentialAction: 'Shave head completely (Halq, recommended for men) or trim hair evenly (Taqsir).',
    primaryArabic: 'اللَّهُمَّ اغْفِرْ لِلْمُحَلِّقِينَ، اللَّهُمَّ اغْفِرْ لِلْمُحَلِّقِينَ',
    transliteration: 'Allaahumm-aghfir lil-muhalliqeen (three times)... wa lil-muqassireen',
    meaning: 'O Allah, forgive those who shave their heads... and those who shorten their hair.',
    sunnahNotes: 'Completes the Umrah. You can now leave Ihram and wear normal clothes.',
  },
];

export default function SpiritualFocusScreen() {
  const router = useRouter();
  const { setSpiritualFocusMode } = useAppSettings();
  const [selectedRitualIndex, setSelectedRitualIndex] = useState(1); // Default to Tawaf
  const [counter, setCounter] = useState(0);

  const activeRitual = RITUAL_FOCUS_DATA[selectedRitualIndex];

  const handleExit = () => {
    setSpiritualFocusMode(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSelectRitual = (idx: number) => {
    setSelectedRitualIndex(idx);
    setCounter(0);
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleIncrementCounter = () => {
    if (activeRitual.maxRounds) {
      if (counter < activeRitual.maxRounds) {
        const next = counter + 1;
        setCounter(next);
        if (process.env.EXPO_OS === 'ios') {
          if (next === activeRitual.maxRounds) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }
      }
    }
  };

  const handleResetCounter = () => {
    setCounter(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />

      {/* Top Minimal Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={handleExit} style={styles.backCircleBtn}>
          <Ionicons name="chevron-back" size={20} color="#D1D5DB" />
        </Pressable>

        <View style={styles.focusIndicator}>
          <Ionicons name="notifications-off" size={13} color="#10B981" />
          <Text style={styles.focusIndicatorText}>Spiritual Focus</Text>
        </View>

        <Pressable onPress={handleExit} style={styles.exitButton}>
          <Ionicons name="close" size={16} color="#D1D5DB" />
          <Text style={styles.exitButtonText}>Exit</Text>
        </Pressable>
      </View>

      {/* Silent Guidance Banner */}
      <View style={styles.silentBanner}>
        <Ionicons name="notifications-off-outline" size={14} color="#9CA3AF" />
        <Text style={styles.silentBannerText}>
          Silent guidance active • Non-critical notifications disabled
        </Text>
      </View>

      {/* Minimal Ritual Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.ritualPickerRow}
        style={styles.ritualPickerScroll}
      >
        {RITUAL_FOCUS_DATA.map((item, idx) => {
          const isSelected = idx === selectedRitualIndex;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleSelectRitual(idx)}
              style={[
                styles.ritualPill,
                isSelected && styles.ritualPillActive,
              ]}
            >
              <Text style={[styles.ritualPillText, isSelected && styles.ritualPillTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Ritual Content Body */}
      <ScrollView
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.ritualHeader}>
          <Text style={styles.ritualArabicTitle}>{activeRitual.arabicName}</Text>
          <Text style={styles.ritualEnglishTitle}>{activeRitual.name}</Text>
          <Text style={styles.essentialActionText}>{activeRitual.essentialAction}</Text>
        </View>

        {/* Counter (if ritual has circuits like Tawaf or Sa'i) */}
        {activeRitual.maxRounds && (
          <View style={styles.counterSection}>
            <Text style={styles.counterTitle}>
              {activeRitual.counterLabel || 'Counter'}: {counter} / {activeRitual.maxRounds}
            </Text>

            <Pressable
              onPress={handleIncrementCounter}
              style={[
                styles.tapCounterButton,
                counter >= activeRitual.maxRounds && styles.tapCounterButtonComplete,
              ]}
            >
              <Text style={styles.counterNumber}>
                {counter >= activeRitual.maxRounds ? '✓ Completed' : `Tap for Circuit ${counter + 1}`}
              </Text>
              <Text style={styles.counterHint}>
                {counter >= activeRitual.maxRounds
                  ? '7 circuits finished. Proceed to next ritual.'
                  : 'Silent tap after completing each round'}
              </Text>
            </Pressable>

            {counter > 0 && counter < activeRitual.maxRounds && (
              <Pressable onPress={handleResetCounter} style={styles.resetButton}>
                <Ionicons name="refresh" size={13} color="#6B7280" />
                <Text style={styles.resetButtonText}>Reset Counter</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Central Arabic Dua Box */}
        <View style={styles.arabicBox}>
          <Text style={styles.arabicDua}>{activeRitual.primaryArabic}</Text>
          <View style={styles.divider} />
          <Text style={styles.transliterationText}>"{activeRitual.transliteration}"</Text>
          <Text style={styles.meaningText}>"{activeRitual.meaning}"</Text>
        </View>

        {/* Sunnah Advice */}
        <View style={styles.sunnahBox}>
          <Ionicons name="book-outline" size={16} color="#D4AF37" />
          <Text style={styles.sunnahText}>{activeRitual.sunnahNotes}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F23',
  },
  backCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1C1C22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  focusIndicatorText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: '#1C1C22',
  },
  exitButtonText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  silentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    backgroundColor: '#121217',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A22',
  },
  silentBannerText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  ritualPickerScroll: {
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A22',
  },
  ritualPickerRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  ritualPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: '#16161D',
  },
  ritualPillActive: {
    backgroundColor: '#D4AF37',
  },
  ritualPillText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
  ritualPillTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  contentScroll: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.xl,
  },
  ritualHeader: {
    alignItems: 'center',
    gap: 4,
  },
  ritualArabicTitle: {
    color: '#D4AF37',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  ritualEnglishTitle: {
    color: '#F3F4F6',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  essentialActionText: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },
  counterSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  counterTitle: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tapCounterButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#1E1E28',
    borderWidth: 1,
    borderColor: '#2F2F3D',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tapCounterButtonComplete: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  counterNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  counterHint: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  resetButtonText: {
    color: '#6B7280',
    fontSize: 11,
  },
  arabicBox: {
    borderRadius: BorderRadius.xl,
    backgroundColor: '#121218',
    borderWidth: 1,
    borderColor: '#22222E',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  arabicDua: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 40,
  },
  divider: {
    height: 1,
    backgroundColor: '#1F1F2E',
    marginVertical: 4,
  },
  transliterationText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  meaningText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  sunnahBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#18181F',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#262633',
  },
  sunnahText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 18,
  },
});
