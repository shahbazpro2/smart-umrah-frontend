import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';

export interface ElderlyGuide {
  _id: string;
  ritualId: string;
  ritualKey: string;
  isModified: boolean;
  healthWarnings: string[];
  title: string;
  description: string;
  modifications: string[];
  restBreaks: {
    recommendedMinutes: number;
    position: string;
  };
  physicalConsiderations: string[];
  accompaniments: string[];
  emergencyTips: string[];
  allLanguages?: any;
}

export interface ElderlyModifications {
  _id: string;
  ritualKey: string;
  modifications: string[];
  restBreaks: {
    recommendedMinutes: number;
    position: string;
  };
  physicalConsiderations: string[];
  healthWarnings: string[];
  accompaniments: string[];
  emergencyTips: string[];
}

export const useGetAllElderlyGuides = (language: string = 'en') => {
  return useQuery({
    queryKey: ['elderlyGuides', language],
    queryFn: async () => {
      const { data } = await api.get<ElderlyGuide[]>('/elderly-guides', {
        params: { language },
      });
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetElderlyGuideByRitual = (ritualId: string, language: string = 'en') => {
  return useQuery({
    queryKey: ['elderlyGuide', ritualId, language],
    queryFn: async () => {
      const { data } = await api.get<ElderlyGuide>(`/elderly-guides/ritual/${ritualId}`, {
        params: { language },
      });
      return data;
    },
    enabled: !!ritualId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetElderlyModifications = (ritualId: string, language: string = 'en') => {
  return useQuery({
    queryKey: ['elderlyModifications', ritualId, language],
    queryFn: async () => {
      const { data } = await api.get<ElderlyModifications>(
        `/elderly-guides/modifications/${ritualId}`,
        {
          params: { language },
        }
      );
      return data;
    },
    enabled: !!ritualId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetHealthWarnings = () => {
  return useQuery({
    queryKey: ['healthWarnings'],
    queryFn: async () => {
      const { data } = await api.get('/elderly-guides/warnings/all');
      return data;
    },
    staleTime: 1000 * 60 * 30,
  });
};
