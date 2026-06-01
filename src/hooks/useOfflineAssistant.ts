import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

export interface OfflineSyncStatus {
  syncStatus: 'synced' | 'pending' | 'failed';
  syncedAt: string;
  lastSyncError?: string;
  version: string;
}

export interface OfflineStats {
  syncedAt: string;
  syncStatus: string;
  version: string;
  statistics: {
    totalRituals: number;
    totalMedia: number;
    totalMistakeGuides: number;
    totalElderlyGuides: number;
    estimatedSize: number;
  };
  features: {
    canViewRituals: boolean;
    canViewMistakeGuides: boolean;
    canViewElderlyGuides: boolean;
    canAccessMedia: boolean;
  };
}

export interface OfflineData {
  syncedAt: string;
  version: string;
  offlineFeatures: {
    canViewRituals: boolean;
    canViewMistakeGuides: boolean;
    canViewElderlyGuides: boolean;
    canAccessMedia: boolean;
  };
  cachedData: {
    rituals: any[];
    media: any[];
    mistakeGuides: any[];
    elderlyGuides: any[];
  };
}

export const useSyncOfflineData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/offline/sync', {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offlineSyncStatus'] });
      queryClient.invalidateQueries({ queryKey: ['offlineStats'] });
      queryClient.invalidateQueries({ queryKey: ['offlineData'] });
    },
  });
};

export const useGetOfflineSyncStatus = () => {
  return useQuery({
    queryKey: ['offlineSyncStatus'],
    queryFn: async () => {
      const { data } = await api.get<OfflineSyncStatus>('/offline/status');
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetOfflineData = () => {
  return useQuery({
    queryKey: ['offlineData'],
    queryFn: async () => {
      const { data } = await api.get<OfflineData>('/offline/data');
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetOfflineStats = () => {
  return useQuery({
    queryKey: ['offlineStats'],
    queryFn: async () => {
      const { data } = await api.get<OfflineStats>('/offline/stats');
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetOfflineRituals = () => {
  return useQuery({
    queryKey: ['offlineRituals'],
    queryFn: async () => {
      const { data } = await api.get('/offline/rituals');
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetOfflineMedia = () => {
  return useQuery({
    queryKey: ['offlineMedia'],
    queryFn: async () => {
      const { data } = await api.get('/offline/media');
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetOfflineMistakeGuides = () => {
  return useQuery({
    queryKey: ['offlineMistakeGuides'],
    queryFn: async () => {
      const { data } = await api.get('/offline/mistake-guides');
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetOfflineElderlyGuides = () => {
  return useQuery({
    queryKey: ['offlineElderlyGuides'],
    queryFn: async () => {
      const { data } = await api.get('/offline/elderly-guides');
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useClearOfflineCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/offline/cache');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offlineSyncStatus'] });
      queryClient.invalidateQueries({ queryKey: ['offlineStats'] });
      queryClient.invalidateQueries({ queryKey: ['offlineData'] });
    },
  });
};
