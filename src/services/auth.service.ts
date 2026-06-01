import api from './api';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  age?: number;
  preferredLanguage: 'en' | 'ar' | 'ur';
  experienceLevel: 'first_time' | 'experienced';
  isElderly: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferredLanguage: 'en' | 'ar' | 'ur';
  age?: number;
  isElderly?: boolean;
  experienceLevel?: 'first_time' | 'experienced';
  avatarPath?: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProfileUpdateData {
  name?: string;
  age?: number;
  preferredLanguage?: 'en' | 'ar' | 'ur';
  isElderly?: boolean;
}

export const authService = {
  register: (data: RegisterData) => api.post<AuthResponse>('/auth/register', data),
  login: (data: LoginData) => api.post<AuthResponse>('/auth/login', data),
  getCurrentUser: () => api.get<User>('/auth/me'),
  updateProfile: (data: ProfileUpdateData) => api.put<User>('/users/profile', data),
  uploadAvatar: (formData: FormData) =>
    api.post<{ avatarPath: string }>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ─── Offline credential cache ─────────────────────────────────────────────────
// We store a simple hash of the password so we never persist the plain text.
// This is NOT cryptographically secure server-side auth — it's a convenience
// offline fallback for a user who has already authenticated online before.

import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_CREDS_KEY = '@offline_credentials';

/** Cheap deterministic hash — good enough for a local offline check */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // convert to 32-bit int
  }
  return hash.toString(36);
}

export async function saveOfflineCredentials(
  email: string,
  password: string,
  token: string,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      OFFLINE_CREDS_KEY,
      JSON.stringify({
        email: email.toLowerCase().trim(),
        passwordHash: simpleHash(password),
        token,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch {}
}

export async function verifyOfflineCredentials(
  email: string,
  password: string,
): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_CREDS_KEY);
    if (!raw) return null;
    const creds = JSON.parse(raw);
    if (
      creds.email === email.toLowerCase().trim() &&
      creds.passwordHash === simpleHash(password)
    ) {
      return creds.token as string;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearOfflineCredentials(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_CREDS_KEY);
  } catch {}
}
