import { FadeIn, SlideIn } from '@/components/FadeIn';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '@/hooks/useAuthMutations';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/services/error.handler';
import { useAuth } from '@/store/auth.context';
import { Ionicons } from '@expo/vector-icons';
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
  const TAB_BAR_HEIGHT = 65;
  const bottomPadding = TAB_BAR_HEIGHT + insets.bottom + Spacing.lg;

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [language, setLanguage] = useState((user?.preferredLanguage || 'en') as string);
  const [isElderly, setIsElderly] = useState(user?.isElderly || false);
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
    try {
      await updateProfileMutation.mutateAsync({
        name,
        age: age ? parseInt(age) : undefined,
        preferredLanguage: language as any,
        isElderly,
      });
      toast.success('Profile saved', 'Your changes have been updated.');
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to update profile');
      setError(msg);
      toast.error('Update failed', msg);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <FadeIn duration={400}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
            <Text style={[styles.subtitle, { color: colors.icon }]}>Manage your account</Text>
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
            <Text style={[styles.avatarName, { color: colors.text }]}>{user?.name}</Text>
            <Text style={[styles.avatarEmail, { color: colors.icon }]}>{user?.email}</Text>
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

        {/* Form */}
        <SlideIn direction="up" delay={200} distance={20}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formHeading, { color: colors.text }]}>Personal Info</Text>

            <InputField
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              editable={!isPending}
              placeholder="Your name"
            />

            <InputField
              label="Email Address"
              icon="mail-outline"
              value={user?.email || ''}
              editable={false}
              placeholder="email@example.com"
            />

            <InputField
              label="Age (Optional)"
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
            <Text style={[styles.formHeading, { color: colors.text }]}>Preferred Language</Text>
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
                    <Text style={[styles.langLabel, { color: active ? colors.primary : colors.text }]}>
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
            onPress={() => !isPending && setIsElderly(!isElderly)}
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
            <View style={[
              styles.toggleSwitch,
              { backgroundColor: isElderly ? colors.primary : colors.border },
            ]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: isElderly ? 18 : 2 }] }]} />
            </View>
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
                <Text style={styles.saveBtnText}>Save Changes</Text>
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
            <Text style={[styles.logoutBtnText, { color: colors.error }]}>Sign Out</Text>
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
    paddingTop: Spacing.md,
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
