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
