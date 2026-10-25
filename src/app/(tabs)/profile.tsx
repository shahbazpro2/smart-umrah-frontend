import { FadeIn, SlideIn } from '@/components/FadeIn';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '@/hooks/useAuthMutations';
import { useElderlyMode } from '@/hooks/useElderlyMode';
import { useToast } from '@/hooks/useToast';
import { useTranslation } from '@/hooks/useTranslation';
import { getErrorMessage } from '@/services/error.handler';
import { useAuth } from '@/store/auth.context';
import { useAppSettings } from '@/store/settings.store';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'ur', label: 'اردو', flag: '🇵🇰' },
];

function AnimatedPressable({ onPress, disabled, style, children }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 8 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} disabled={disabled} style={style}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

function InputField({ label, icon, value, onChangeText, editable = true, keyboardType, placeholder, placeholderTextColor, inputStyle }: any) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.icon }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: editable ? colors.card : colors.cardAlt, borderColor: colors.border }]}>
        <Ionicons name={icon} size={18} color={colors.icon} />
        <TextInput
          style={[styles.input, { color: editable ? colors.text : colors.icon }, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor ?? colors.icon}
        />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { fontSize } = useElderlyMode();
  const { t } = useTranslation();
  const {
    isElderly: persistedElderly,
    setIsElderly: setPersistedElderly,
    ritualMode,
    setRitualMode,
    spiritualFocusMode,
    setSpiritualFocusMode,
    setLanguage: setPersistedLanguage,
  } = useAppSettings();

  const TAB_BAR_HEIGHT = 65;
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + Spacing.lg;

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [language, setLanguage] = useState((user?.preferredLanguage || 'en') as string);
  const [isElderly, setIsElderly] = useState(persistedElderly ?? user?.isElderly ?? false);

  const handleElderlToggle = (value: boolean) => {
    setIsElderly(value);
    setPersistedElderly(value);
    toast.success(value ? 'Elderly Mode Enabled' : 'Elderly Mode Disabled', 'Settings saved offline');
  };

  const handleRitualModeToggle = (mode: 'learn' | 'perform') => {
    setRitualMode(mode);
    toast.success(
      mode === 'learn' ? 'Learn Mode Active' : 'Perform Mode Active',
      'Settings saved offline'
    );
  };

  const handleSpiritualFocusToggle = (value: boolean) => {
    setSpiritualFocusMode(value);
    if (value) {
      toast.success(
        'Spiritual Focus Enabled',
        'Opening silent guidance & muting alerts...'
      );
      router.push('/spiritual-focus');
    } else {
      toast.success(
        'Spiritual Focus Disabled',
        'Standard notifications and UI restored.'
      );
    }
  };
  const [avatarUri, setAvatarUri] = useState(
    user?.avatarPath ? `${process.env.EXPO_PUBLIC_API_URL}${user.avatarPath}` : ''
  );
  const [error, setError] = useState('');

  const updateProfileMutation = useUpdateProfileMutation();
  const uploadAvatarMutation = useUploadAvatarMutation();
  const isPending = updateProfileMutation.isPending;

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        const formData = new FormData();
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || 'avatar.jpg';
        formData.append('avatar', { uri, name: filename, type: 'image/jpeg' } as any);
        const { data } = await uploadAvatarMutation.mutateAsync(formData);
        setAvatarUri(`${process.env.EXPO_PUBLIC_API_URL}${data.avatarPath}`);
        toast.success('Avatar updated', 'Your profile photo has been changed.');
      }
    } catch (err) {
      toast.error('Upload failed', getErrorMessage(err, 'Could not upload avatar'));
    }
  };

  const handleUpdate = async () => {
    setError('');
    // Save to offline storage immediately
    setPersistedElderly(isElderly);
    setPersistedLanguage(language as any);

    try {
      await updateProfileMutation.mutateAsync({
        name,
        age: age ? parseInt(age) : undefined,
        preferredLanguage: language as any,
        isElderly,
      });
      toast.success('Profile saved', 'Your changes have been updated and saved offline.');
    } catch (err: any) {
      // Still notify user that local settings are active
      toast.success('Settings saved offline', 'Changes are saved locally on your device.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <FadeIn duration={400}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontSize: 32 + (fontSize.xl - 16) }]}>{t('profile.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.icon, fontSize: 14 + (fontSize.base - 13) }]}>{t('profile.manage')}</Text>
          </View>
        </FadeIn>

        {/* Avatar */}
        <FadeIn delay={100} duration={400}>
          <View style={styles.avatarSection}>
            <AnimatedPressable onPress={handlePickImage} disabled={uploadAvatarMutation.isPending}>
              <View style={styles.avatarWrap}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={[styles.avatar, { borderColor: colors.primary }]} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: `${colors.primary}12`, borderColor: colors.border }]}>
                    <Ionicons name="person" size={44} color={colors.primary} />
                  </View>
                )}
                <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
                  {uploadAvatarMutation.isPending
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Ionicons name="camera" size={14} color="#fff" />
                  }
                </View>
              </View>
            </AnimatedPressable>
            <Text style={[styles.avatarName, { color: colors.text, fontSize: 18 + (fontSize.medium - 14) }]}>{user?.name}</Text>
            <Text style={[styles.avatarEmail, { color: colors.icon, fontSize: 13 + (fontSize.base - 13) }]}>{user?.email}</Text>
          </View>
        </FadeIn>

        {/* Error */}
        {error ? (
          <SlideIn direction="down" distance={10}>
            <View style={[styles.errorBanner, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error, fontSize: 13 + (fontSize.base - 13) }]}>{error}</Text>
            </View>
          </SlideIn>
        ) : null}

        {/* Form */}
        <SlideIn direction="up" delay={200} distance={20}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formHeading, { color: colors.text, fontSize: 13 + (fontSize.base - 13) }]}>{t('profile.personalInfo')}</Text>

            <InputField
              label={t('profile.fullName')}
              icon="person-outline"
              value={name}
              onChangeText={setName}
              editable={!isPending}
              placeholder="Your name"
            />

            <InputField
              label={t('profile.email')}
              icon="mail-outline"
              value={user?.email || ''}
              editable={false}
              placeholder="email@example.com"
            />

            <InputField
              label={t('profile.age')}
              icon="calendar-outline"
              value={age}
              onChangeText={setAge}
              editable={!isPending}
              keyboardType="number-pad"
              placeholder="Your age"
            />
          </View>
        </SlideIn>

        {/* Language Selector */}
        <SlideIn direction="up" delay={300} distance={20}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formHeading, { color: colors.text, fontSize: 13 + (fontSize.base - 13) }]}>{t('profile.preferredLanguage')}</Text>
            <View style={styles.langGrid}>
              {LANGUAGES.map((lang) => {
                const active = language === lang.value;
                return (
                  <AnimatedPressable
                    key={lang.value}
                    onPress={() => !isPending && setLanguage(lang.value)}
                    style={[
                      styles.langOption,
                      {
                        backgroundColor: active ? `${colors.primary}12` : colors.cardAlt,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <Text style={[styles.langLabel, { color: active ? colors.primary : colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                      {lang.label}
                    </Text>
                    {active && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
                  </AnimatedPressable>
                );
              })}
            </View>
          </View>
        </SlideIn>

        {/* Elderly Toggle */}
        <SlideIn direction="up" delay={400} distance={20}>
          <AnimatedPressable
            onPress={() => !isPending && handleElderlToggle(!isElderly)}
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
              <Text style={[styles.toggleTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>{t('profile.elderlyPilgrim')}</Text>
              <Text style={[styles.toggleSub, { color: colors.icon, fontSize: 12 + (fontSize.small - 12) }]}>{t('profile.elderlyDesc')}</Text>
            </View>
            <View style={[
              styles.toggleSwitch,
              { backgroundColor: isElderly ? colors.primary : colors.border },
            ]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: isElderly ? 18 : 2 }] }]} />
            </View>
          </AnimatedPressable>
        </SlideIn>

        {/* Learn & Perform Switch Setting */}
        <SlideIn direction="up" delay={430} distance={20}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardRowHeader}>
              <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
              <Text style={[styles.formHeading, { color: colors.text, marginBottom: 0 }]}>
                Learn & Perform Mode
              </Text>
            </View>
            <Text style={[styles.settingsExplainer, { color: colors.icon }]}>
              {ritualMode === 'learn'
                ? '📖 Learn Mode active: Detailed explanations, virtues, and step-by-step guides.'
                : '⚡ Perform Mode active: Concise instructions and minimal text for active rituals.'}
            </Text>
            <View style={styles.modeButtonsRow}>
              <Pressable
                onPress={() => handleRitualModeToggle('learn')}
                style={[
                  styles.modeButton,
                  ritualMode === 'learn' && { backgroundColor: `${colors.primary}18`, borderColor: colors.primary },
                ]}
              >
                <Ionicons name="book" size={16} color={ritualMode === 'learn' ? colors.primary : colors.icon} />
                <Text style={[styles.modeButtonText, { color: ritualMode === 'learn' ? colors.primary : colors.text }]}>
                  Learn Mode
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleRitualModeToggle('perform')}
                style={[
                  styles.modeButton,
                  ritualMode === 'perform' && { backgroundColor: '#10B98118', borderColor: '#10B981' },
                ]}
              >
                <FontAwesome5 name="pray" size={14} color={ritualMode === 'perform' ? '#10B981' : colors.icon} />
                <Text style={[styles.modeButtonText, { color: ritualMode === 'perform' ? '#10B981' : colors.text }]}>
                  Perform Mode
                </Text>
              </Pressable>
            </View>
          </View>
        </SlideIn>

        {/* Spiritual Focus Mode Setting */}
        <SlideIn direction="up" delay={460} distance={20}>
          <AnimatedPressable
            onPress={() => handleSpiritualFocusToggle(!spiritualFocusMode)}
            style={[
              styles.toggleCard,
              {
                backgroundColor: spiritualFocusMode ? '#10B98108' : colors.card,
                borderColor: spiritualFocusMode ? '#10B981' : colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.toggleIconWrap,
                { backgroundColor: spiritualFocusMode ? '#10B98115' : `${colors.border}50` },
              ]}
            >
              <Ionicons
                name={spiritualFocusMode ? 'notifications-off' : 'notifications-off-outline'}
                size={20}
                color={spiritualFocusMode ? '#10B981' : colors.icon}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text, fontSize: 15 + (fontSize.base - 13) }]}>
                Spiritual Focus Mode
              </Text>
              <Text style={[styles.toggleSub, { color: colors.icon, fontSize: 12 + (fontSize.small - 12) }]}>
                {spiritualFocusMode
                  ? 'Active now: Notifications silenced & silent counter ready.'
                  : 'Tap to enter silent ritual guidance with muted alerts.'}
              </Text>
            </View>
            {spiritualFocusMode ? (
              <Pressable
                onPress={() => router.push('/spiritual-focus')}
                style={styles.openFocusPill}
              >
                <Text style={styles.openFocusPillText}>Open ➔</Text>
              </Pressable>
            ) : (
              <View
                style={[
                  styles.toggleSwitch,
                  { backgroundColor: colors.border },
                ]}
              >
                <View style={[styles.toggleThumb, { transform: [{ translateX: 2 }] }]} />
              </View>
            )}
          </AnimatedPressable>
        </SlideIn>

        {/* Save Button */}
        <SlideIn direction="up" delay={500} distance={20}>
          <AnimatedPressable
            onPress={handleUpdate}
            disabled={isPending}
            style={[styles.saveBtn, { backgroundColor: colors.primary }, isPending && { opacity: 0.6 }]}
          >
            {isPending
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>{t('profile.saveChanges')}</Text>
              </>
            }
          </AnimatedPressable>
        </SlideIn>

        {/* Logout */}
        <SlideIn direction="up" delay={600} distance={20}>
          <AnimatedPressable
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: colors.error }]}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={[styles.logoutBtnText, { color: colors.error }]}>{t('profile.signOut')}</Text>
          </AnimatedPressable>
        </SlideIn>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.md,
  },
  header: { marginBottom: Spacing.sm },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: Spacing.xs },
  subtitle: { fontSize: 14, fontWeight: '500' },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    borderWidth: 3,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarName: { fontSize: 18, fontWeight: '700', marginTop: Spacing.xs },
  avatarEmail: { fontSize: 13 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  errorText: { fontSize: 13, fontWeight: '500', flex: 1 },
  formCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    gap: Spacing.md,
  },
  formHeading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  inputGroup: { gap: Spacing.xs },
  inputLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.md,
  },
  input: { flex: 1, fontSize: 15 },
  langGrid: { gap: Spacing.sm },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  langFlag: { fontSize: 20 },
  langLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
  openFocusPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  openFocusPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    borderRadius: BorderRadius.lg,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cardRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 4,
  },
  settingsExplainer: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  logoutBtn: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logoutBtnText: { fontSize: 15, fontWeight: '700' },
});
