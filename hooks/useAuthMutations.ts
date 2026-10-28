import { useMutation, useQuery } from '@tanstack/react-query';
import { authService, LoginData, RegisterData } from '@/services/auth.service';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (data: LoginData) => {
      try {
        const { data: response } = await authService.login(data);
        return response;
      } catch (error: any) {
        console.error('[Login] Error:', error.message || error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('[Login Mutation Error]', {
        message: error.message,
        status: error.status,
        data: error.data,
      });
    },
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      try {
        const { data: response } = await authService.register(data);
        return response;
      } catch (error: any) {
        console.error('[Register] Error:', error.message || error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('[Register Mutation Error]', {
        message: error.message,
        status: error.status,
        data: error.data,
      });
    },
  });
};

export const useGetCurrentUser = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await authService.getCurrentUser();
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: authService.updateProfile,
    onError: (error: any) => {
      console.error('Profile update error:', error);
    },
  });
};

export const useUploadAvatarMutation = () => {
  return useMutation({
    mutationFn: authService.uploadAvatar,
    onError: (error: any) => {
      console.error('Avatar upload error:', error);
    },
  });
};
