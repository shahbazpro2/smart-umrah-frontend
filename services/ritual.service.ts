import api from './api';

export interface Ritual {
  _id: string;
  sequence: number;
  key: string;
  estimatedDuration: string;
  translations: {
    en: { title: string; description: string; tips: string[]; commonMistakes: string[] };
    ar: { title: string; description: string; tips: string[]; commonMistakes: string[] };
    ur: { title: string; description: string; tips: string[]; commonMistakes: string[] };
  };
}

export interface RitualProgress {
  ritualId: string;
  completed: boolean;
  completedAt?: string;
}

export const ritualService = {
  getAll: () => api.get<Ritual[]>('/rituals'),
  getById: (id: string) => api.get<Ritual>(`/rituals/${id}`),
  getProgress: () => api.get<RitualProgress[]>('/progress'),
  markComplete: (ritualId: string) => api.post('/progress', { ritualId }),
  getStats: () => api.get('/progress/stats'),
};
