import AsyncStorage from "@react-native-async-storage/async-storage";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";

export type RitualMode = "learn" | "perform";

export interface AppSettings {
  ritualMode: RitualMode;
  spiritualFocusMode: boolean;
  isElderly: boolean;
  notificationsEnabled: boolean;
  language: "en" | "ar" | "ur";
  offlineOnly: boolean;
}

const SETTINGS_STORAGE_KEY = "@smart_umrah_app_settings";

export const DEFAULT_SETTINGS: AppSettings = {
  ritualMode: "learn",
  spiritualFocusMode: false,
  isElderly: false,
  notificationsEnabled: true,
  language: "en",
  offlineOnly: false,
};

// Jotai atoms
export const appSettingsAtom = atom<AppSettings>(DEFAULT_SETTINGS);
export const ritualModeAtom = atom(
  (get) => get(appSettingsAtom).ritualMode,
  (get, set, newMode: RitualMode) => {
    const current = get(appSettingsAtom);
    const updated = { ...current, ritualMode: newMode };
    set(appSettingsAtom, updated);
    persistSettings(updated);
  }
);

export const spiritualFocusModeAtom = atom(
  (get) => get(appSettingsAtom).spiritualFocusMode,
  (get, set, enabled: boolean) => {
    const current = get(appSettingsAtom);
    // When spiritual focus is on, non-critical notifications are automatically silenced
    const updated = {
      ...current,
      spiritualFocusMode: enabled,
      notificationsEnabled: enabled ? false : current.notificationsEnabled,
    };
    set(appSettingsAtom, updated);
    persistSettings(updated);
  }
);

export const isElderlySettingAtom = atom(
  (get) => get(appSettingsAtom).isElderly,
  (get, set, val: boolean) => {
    const current = get(appSettingsAtom);
    const updated = { ...current, isElderly: val };
    set(appSettingsAtom, updated);
    persistSettings(updated);
  }
);

/**
 * Save settings to AsyncStorage
 */
export async function persistSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Failed to persist app settings to AsyncStorage", err);
  }
}

/**
 * Load settings from AsyncStorage
 */
export async function loadPersistedSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Custom React Hook to consume and update App Settings across any screen
 */
export function useAppSettings() {
  const [settings, setSettings] = useAtom(appSettingsAtom);

  // Initialize from storage on mount
  useEffect(() => {
    let isMounted = true;
    loadPersistedSettings().then((loaded) => {
      if (isMounted) {
        setSettings(loaded);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [setSettings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "spiritualFocusMode" && value === true) {
        updated.notificationsEnabled = false;
      }
      persistSettings(updated);
      return updated;
    });
  };

  const setRitualMode = (mode: RitualMode) => updateSetting("ritualMode", mode);
  const setSpiritualFocusMode = (enabled: boolean) => updateSetting("spiritualFocusMode", enabled);
  const toggleSpiritualFocusMode = () => updateSetting("spiritualFocusMode", !settings.spiritualFocusMode);
  const setIsElderly = (val: boolean) => updateSetting("isElderly", val);
  const setNotificationsEnabled = (enabled: boolean) => updateSetting("notificationsEnabled", enabled);
  const setLanguage = (lang: "en" | "ar" | "ur") => updateSetting("language", lang);

  return {
    settings,
    ritualMode: settings.ritualMode,
    isLearnMode: settings.ritualMode === "learn",
    isPerformMode: settings.ritualMode === "perform",
    setRitualMode,
    spiritualFocusMode: settings.spiritualFocusMode,
    setSpiritualFocusMode,
    toggleSpiritualFocusMode,
    isElderly: settings.isElderly,
    setIsElderly,
    notificationsEnabled: settings.notificationsEnabled,
    setNotificationsEnabled,
    language: settings.language,
    setLanguage,
  };
}
