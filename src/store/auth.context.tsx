import { useGetCurrentUser, useLoginMutation, useRegisterMutation } from '@/hooks/useAuthMutations';
import api from '@/services/api';
import {
  saveOfflineCredentials,
  verifyOfflineCredentials
} from '@/services/auth.service';
import { getErrorMessage } from '@/services/error.handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import React, { createContext, useCallback, useEffect } from 'react';
import { LoginData, RegisterData } from '../services/auth.service';
import { authErrorAtom, authLoadingAtom, isLoggingInAtom, isRegisteringAtom, tokenAtom, userAtom } from './authAtoms';
import { elderlyModeAtom } from './elderlyModeAtom';

const USER_CACHE_KEY = '@cached_user';

interface AuthContextType {
  user: any;
  token: string | null;
  loading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useAtom(userAtom);
  const [token, setToken] = useAtom(tokenAtom);
  const [isLoggingIn, setIsLoggingIn] = useAtom(isLoggingInAtom);
  const [isRegistering, setIsRegistering] = useAtom(isRegisteringAtom);
  const [error, setError] = useAtom(authErrorAtom);
  const [loading, setLoading] = useAtom(authLoadingAtom);
  const [, setElderlyMode] = useAtom(elderlyModeAtom);
  const queryClient = useQueryClient();

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const { refetch: refetchUser } = useGetCurrentUser(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    setElderlyMode(user?.isElderly || false);
  }, [user?.isElderly, setElderlyMode]);

  const initializeAuth = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('auth_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

      // Restore cached user immediately so the app renders correctly offline
      const cachedUserRaw = await AsyncStorage.getItem(USER_CACHE_KEY);
      if (cachedUserRaw) {
        try {
          setUser(JSON.parse(cachedUserRaw));
        } catch { }
      }

      // Then try to refresh from server (will silently fail if offline)
      try {
        const { data } = await refetchUser();
        if (data) {
          setUser(data);
          // Keep the cache fresh
          await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(data));
        }
      } catch {
        // Offline — cached user already set above, continue normally
      }
    } catch {
      // No token — not logged in
    } finally {
      setLoading(false);
    }
  }, [refetchUser, setUser, setToken, setLoading]);

  const login = useCallback(async (data: LoginData) => {
    setError(null);
    setIsLoggingIn(true);
    try {
      // ── Online path ──────────────────────────────────────────────────────────
      const response = await loginMutation.mutateAsync(data);
      setToken(response.token);
      setUser(response.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(response.user));
      await saveOfflineCredentials(data.email, data.password, response.token);
    } catch (err: any) {
      // ── Offline path ─────────────────────────────────────────────────────────
      const isNetworkError =
        !err?.status ||
        err?.originalError?.code === 'ERR_NETWORK' ||
        err?.originalError?.code === 'ECONNABORTED';

      if (isNetworkError) {
        const cachedToken = await verifyOfflineCredentials(data.email, data.password);
        const cachedUserRaw = await AsyncStorage.getItem(USER_CACHE_KEY);

        if (cachedToken && cachedUserRaw) {
          try {
            const cachedUser = JSON.parse(cachedUserRaw);
            setToken(cachedToken);
            setUser(cachedUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${cachedToken}`;
            return; // offline login succeeded — finally will reset isLoggingIn
          } catch { }
        }

        setError('You are offline. Please connect to the internet to sign in for the first time.');
      } else {
        setError(getErrorMessage(err, 'Login failed'));
      }

      throw err;
    } finally {
      // Always reset the spinner — no matter which path was taken
      setIsLoggingIn(false);
    }
  }, [loginMutation, setToken, setUser, setError, setIsLoggingIn]);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setIsRegistering(true);
    try {
      const response = await registerMutation.mutateAsync(data);
      setToken(response.token);
      setUser(response.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem(USER_CACHE_KEY, JSON.stringify(response.user));
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
      throw err;
    } finally {
      setIsRegistering(false);
    }
  }, [registerMutation, setToken, setUser, setError, setIsRegistering]);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setError(null);
    queryClient.clear();
    delete api.defaults.headers.common['Authorization'];
    // Keep auth_token removed but preserve offline credentials and cached user
    // so the same user can log back in while offline
    await AsyncStorage.removeItem('auth_token');
  }, [setToken, setUser, setError, queryClient]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isLoggingIn, isRegistering, error,
      login, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
