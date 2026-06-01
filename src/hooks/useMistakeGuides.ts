import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface MistakeGuide {
  _id: string;
  ritualId: string;
  ritualKey: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  commonMistakes: {
    mistake: string;
    impact: string;
    prevention: string;
  }[];
  tips: string[];
  allLanguages?: any;
}

export const useGetAllMistakeGuides = (language: string = 'en') => {
  return useQuery({
    queryKey: ['mistakeGuides', language],
    queryFn: async () => {
      const { data } = await api.get<MistakeGuide[]>('/mistake-guides', {
        params: { language },
      });
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetMistakeGuideByRitual = (ritualId: string, language: string = 'en', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['mistakeGuide', ritualId, language],
    queryFn: async () => {
      const { data } = await api.get<MistakeGuide>(`/mistake-guides/ritual/${ritualId}`, {
        params: { language },
      });
      return data;
    },
    enabled: enabled && !!ritualId,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
};

export const useGetMistakesByKey = (ritualKey: string, language: string = 'en') => {
  return useQuery({
    queryKey: ['mistakesByKey', ritualKey, language],
    queryFn: async () => {
      const { data } = await api.get(`/mistake-guides/by-key/${ritualKey}`, {
        params: { language },
      });
      return data;
    },
    enabled: !!ritualKey,
    staleTime: 1000 * 60 * 10,
  });
};
