import { mediaService } from '@/services/media.service';
import { useQuery } from '@tanstack/react-query';

export const useGetAllMedia = (type?: string, language?: string) => {
  return useQuery({
    queryKey: ['mediaList', type, language],
    queryFn: async () => {
      const { data } = await mediaService.getAll(type, language);
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetMediaById = (id: string) => {
  return useQuery({
    queryKey: ['mediaItem', id],
    queryFn: async () => {
      const { data } = await mediaService.getById(id);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetRitualMedia = (ritualId: string) => {
  return useQuery({
    queryKey: ['ritualMedia', ritualId],
    queryFn: async () => {
      const { data } = await mediaService.getByRitual(ritualId);
      return data;
    },
    enabled: !!ritualId,
    staleTime: 1000 * 60 * 10,
  });
};
