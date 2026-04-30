import { useGetCurrentUser, useLoginMutation, useRegisterMutation } from '@/hooks/useAuthMutations';
import api from '@/services/api';
import { getErrorMessage } from '@/services/error.handler';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import React, { createContext, useCallback, useEffect } from 'react';
import { LoginData, RegisterData } from '../services/auth.service';
import { authErrorAtom, authLoadingAtom, isLoggingInAtom, isRegisteringAtom, tokenAtom, userAtom } from './authAtoms';

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
  const queryClient = useQueryClient();

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const { refetch: refetchUser } = useGetCurrentUser(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const { data } = await refetchUser();
      if (data) setUser(data);
    } catch {
      // not logged in — silent
    } finally {
      setLoading(false);
    }
  }, [refetchUser, setUser, setLoading]);

  const login = useCallback(async (data: LoginData) => {
    setError(null);
    setIsLoggingIn(true);
    try {
      const response = await loginMutation.mutateAsync(data);
      setToken(response.token);
      setUser(response.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
    } catch (err) {
      const message = getErrorMessage(err, 'Login failed');
      setError(message);
      setIsLoggingIn(false);
      throw err;
    }
    setIsLoggingIn(false);
  }, [loginMutation, setToken, setUser, setError, setIsLoggingIn]);

  const register = useCallback(async (data: RegisterData) => {
    setError(null);
    setIsRegistering(true);
    try {
      const response = await registerMutation.mutateAsync(data);
      setToken(response.token);
      setUser(response.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
    } catch (err) {
      const message = getErrorMessage(err, 'Registration failed');
      setError(message);
      setIsRegistering(false);
      throw err;
    }
    setIsRegistering(false);
  }, [registerMutation, setToken, setUser, setError, setIsRegistering]);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    setError(null);
    queryClient.clear();
    delete api.defaults.headers.common['Authorization'];
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
