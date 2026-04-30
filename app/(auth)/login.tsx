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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoggingIn, error } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleEmailChange = useCallback((t: string) => setEmail(t), []);
  const handlePasswordChange = useCallback((t: string) => setPassword(t), []);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await login({ email, password });
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
              <Text style={styles.heroTitle}>Smart Umrah</Text>
              <Text style={styles.heroSub}>Step-by-step guidance for your sacred journey</Text>
            </View>
          </FadeIn>

          {/* Form Card */}
          <SlideIn direction="up" delay={150} distance={30}>
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.formHeading, { color: colors.text }]}>Sign In</Text>
              <Text style={[styles.formSub, { color: colors.icon }]}>Welcome back, pilgrim</Text>

              {/* Error */}
              {error ? (
                <View style={[styles.errorBanner, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
                  <Ionicons name="alert-circle" size={16} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}

              <InputField
                label="Email Address"
                icon="mail-outline"
                value={email}
                onChangeText={handleEmailChange}
                placeholder="you@example.com"
                keyboardType="email-address"
                editable={!isLoggingIn}
              />

              <InputField
                label="Password"
                icon="lock-closed-outline"
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                editable={!isLoggingIn}
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

              {/* Sign In Button */}
              <AnimatedPressable
                onPress={handleLogin}
                disabled={isLoggingIn}
                style={[styles.primaryBtn, { backgroundColor: colors.primary }, isLoggingIn && { opacity: 0.6 }]}
              >
                {isLoggingIn
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <>
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                }
              </AnimatedPressable>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.icon }]}>New here?</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Register Link */}
              <AnimatedPressable
                onPress={() => router.push('/(auth)/register')}
                disabled={isLoggingIn}
                style={[styles.secondaryBtn, { borderColor: colors.border }]}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Create an Account</Text>
              </AnimatedPressable>
            </View>
          </SlideIn>

          {/* Footer */}
          <FadeIn delay={400} duration={500}>
            <Text style={[styles.footer, { color: colors.icon }]}>
              Begin your blessed journey today 🤲
            </Text>
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
    gap: Spacing.lg,
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
  heroTitle: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20 },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    gap: Spacing.md,
  },
  formHeading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  formSub: { fontSize: 14, marginTop: -Spacing.xs, marginBottom: Spacing.xs },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: '500', flex: 1 },
  primaryBtn: {
    height: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerText: { fontSize: 12, fontWeight: '500' },
  secondaryBtn: {
    height: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 13, paddingBottom: Spacing.md },
});
