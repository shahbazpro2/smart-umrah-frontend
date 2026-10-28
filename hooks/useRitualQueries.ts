import { useMutation, useQuery } from '@tanstack/react-query';
import { ritualService } from '@/services/ritual.service';

export const useGetAllRituals = () => {
  return useQuery({
    queryKey: ['rituals'],
    queryFn: async () => {
      const { data } = await ritualService.getAll();
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useGetRitualById = (id: string) => {
  return useQuery({
    queryKey: ['ritual', id],
    queryFn: async () => {
      const { data } = await ritualService.getById(id);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetProgress = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const { data } = await ritualService.getProgress();
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useMarkCompleteMutation = () => {
  return useMutation({
    mutationFn: (ritualId: string) => ritualService.markComplete(ritualId),
    onError: (error: any) => {
      console.error('Mark complete error:', error);
    },
  });
};

export const useGetProgressStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['progressStats'],
    queryFn: async () => {
      const { data } = await ritualService.getStats();
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};
