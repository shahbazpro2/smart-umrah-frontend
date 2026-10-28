import { AnimatedPressable } from '@/components/AnimatedPressable';
import { FadeIn, SlideIn } from '@/components/FadeIn';
import { InputField } from '@/components/InputField';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'ur', label: 'اردو', flag: '🇵🇰' },
];

const EXPERIENCE_LEVELS = [
  { value: 'first_time', label: 'First Time', icon: 'star-outline' as const, desc: 'New to Umrah' },
  { value: 'experienced', label: 'Experienced', icon: 'ribbon-outline' as const, desc: 'Performed before' },
];

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState('en');
  const [experience, setExperience] = useState('first_time');
  const [isElderly, setIsElderly] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { register, isRegistering, error } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleNameChange = useCallback((t: string) => setName(t), []);
  const handleEmailChange = useCallback((t: string) => setEmail(t), []);
  const handlePasswordChange = useCallback((t: string) => setPassword(t), []);
  const handleAgeChange = useCallback((t: string) => setAge(t), []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      await register({
        name,
        email,
        password,
        age: age ? parseInt(age) : undefined,
        preferredLanguage: language as 'en' | 'ar' | 'ur',
        experienceLevel: experience as 'first_time' | 'experienced',
        isElderly,
      });
      router.replace('/(tabs)');
    } catch {
      // handled by auth context
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <FadeIn duration={500}>
            <View style={[styles.hero, { backgroundColor: colors.primary }]}>
              <View style={styles.heroIconWrap}>
                <Text style={styles.heroEmoji}>🕌</Text>
              </View>
              <Text style={styles.heroTitle}>Join Smart Umrah</Text>
              <Text style={styles.heroSub}>Create your account and begin your journey</Text>
            </View>
          </FadeIn>

          {/* Error */}
          {error ? (
            <SlideIn direction="down" distance={10}>
              <View style={[styles.errorBanner, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            </SlideIn>
          ) : null}

          {/* Basic Info Card */}
          <SlideIn direction="up" delay={150} distance={30}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardHeading, { color: colors.text }]}>Basic Info</Text>

              <InputField
                label="Full Name"
                icon="person-outline"
                value={name}
                onChangeText={handleNameChange}
                placeholder="Your full name"
                autoCapitalize="words"
                editable={!isRegistering}
              />

              <InputField
                label="Email Address"
                icon="mail-outline"
                value={email}
                onChangeText={handleEmailChange}
                placeholder="you@example.com"
                keyboardType="email-address"
                editable={!isRegistering}
              />

              <InputField
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Min. 8 characters"
                secureTextEntry={!showPassword}
                editable={!isRegistering}
                rightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={colors.icon}
                    />
                  </Pressable>
                }
              />

              <InputField
                label="Age (Optional)"
                icon="calendar-outline"
                value={age}
                onChangeText={handleAgeChange}
                placeholder="Your age"
                keyboardType="number-pad"
                editable={!isRegistering}
              />
            </View>
          </SlideIn>

          {/* Language Card */}
          <SlideIn direction="up" delay={250} distance={30}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardHeading, { color: colors.text }]}>Preferred Language</Text>
              <View style={styles.optionGrid}>
                {LANGUAGES.map((lang) => {
                  const active = language === lang.value;
                  return (
                    <AnimatedPressable
                      key={lang.value}
                      onPress={() => !isRegistering && setLanguage(lang.value)}
                      style={[
                        styles.optionBtn,
                        {
                          backgroundColor: active ? `${colors.primary}10` : colors.cardAlt,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={styles.optionFlag}>{lang.flag}</Text>
                      <Text style={[styles.optionLabel, { color: active ? colors.primary : colors.text }]}>
                        {lang.label}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          </SlideIn>

          {/* Experience Card */}
          <SlideIn direction="up" delay={350} distance={30}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardHeading, { color: colors.text }]}>Experience Level</Text>
              <View style={styles.expGrid}>
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const active = experience === lvl.value;
                  return (
                    <AnimatedPressable
                      key={lvl.value}
                      onPress={() => !isRegistering && setExperience(lvl.value)}
                      style={[
                        styles.expBtn,
                        {
                          backgroundColor: active ? `${colors.primary}10` : colors.cardAlt,
                          borderColor: active ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.expIconWrap, { backgroundColor: active ? `${colors.primary}15` : `${colors.border}30` }]}>
                        <Ionicons name={lvl.icon} size={20} color={active ? colors.primary : colors.icon} />
                      </View>
                      <Text style={[styles.expLabel, { color: active ? colors.primary : colors.text }]}>
                        {lvl.label}
                      </Text>
                      <Text style={[styles.expDesc, { color: colors.icon }]}>{lvl.desc}</Text>
                      {active && (
                        <View style={[styles.expCheck, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        </View>
                      )}
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          </SlideIn>

          {/* Elderly Toggle */}
          <SlideIn direction="up" delay={450} distance={30}>
            <AnimatedPressable
              onPress={() => !isRegistering && setIsElderly(!isElderly)}
              style={[
                styles.toggleCard,
                {
                  backgroundColor: isElderly ? `${colors.primary}08` : colors.card,
                  borderColor: isElderly ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={[styles.toggleIconWrap, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="accessibility" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: colors.text }]}>Elderly Pilgrim</Text>
                <Text style={[styles.toggleSub, { color: colors.icon }]}>Enable accessibility features (60+)</Text>
              </View>
              <View style={[styles.toggleSwitch, { backgroundColor: isElderly ? colors.primary : colors.border }]}>
                <View style={[styles.toggleThumb, { transform: [{ translateX: isElderly ? 18 : 2 }] }]} />
              </View>
            </AnimatedPressable>
          </SlideIn>

          {/* Register Button */}
          <SlideIn direction="up" delay={550} distance={30}>
            <AnimatedPressable
              onPress={handleRegister}
              disabled={isRegistering}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }, isRegistering && { opacity: 0.6 }]}
            >
              {isRegistering
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </>
              }
            </AnimatedPressable>
          </SlideIn>

          {/* Sign In Link */}
          <SlideIn direction="up" delay={650} distance={30}>
            <View style={styles.signinRow}>
              <Text style={[styles.signinText, { color: colors.icon }]}>Already have an account?</Text>
              <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
                <Text style={[styles.signinLink, { color: colors.primary }]}>Sign In</Text>
              </Pressable>
            </View>
          </SlideIn>

          <FadeIn delay={700} duration={500}>
            <Text style={[styles.footer, { color: colors.icon }]}>Join millions of pilgrims 🤲</Text>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  hero: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.md,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroEmoji: { fontSize: 38 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: '500', flex: 1 },
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: Spacing.md,
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  optionGrid: { gap: Spacing.sm },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  optionFlag: { fontSize: 20 },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  expGrid: { flexDirection: 'row', gap: Spacing.md },
  expBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    position: 'relative',
  },
  expIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  expDesc: { fontSize: 11, textAlign: 'center' },
  expCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  toggleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTitle: { fontSize: 15, fontWeight: '600' },
  toggleSub: { fontSize: 12, marginTop: 2 },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  primaryBtn: {
    height: 54,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  signinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  signinText: { fontSize: 14 },
  signinLink: { fontSize: 14, fontWeight: '700' },
  footer: { textAlign: 'center', fontSize: 13, paddingBottom: Spacing.md },
});
