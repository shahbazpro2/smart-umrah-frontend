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
  // ritualId is populated by the backend — it's the full ritual object
  ritualId: { _id: string; sequence: number; key: string } | string;
  isCompleted: boolean;
  completedAt?: string;
}

/** Normalise a progress entry to a plain { ritualId: string, completed: boolean } */
export function normaliseProgress(p: RitualProgress): { ritualId: string; completed: boolean } {
  const ritualId =
    typeof p.ritualId === 'string' ? p.ritualId : (p.ritualId as any)?._id ?? '';
  return { ritualId, completed: p.isCompleted };
}

export const ritualService = {
  getAll: () => api.get<Ritual[]>('/rituals'),
  getById: (id: string) => api.get<Ritual>(`/rituals/${id}`),
  getProgress: () => api.get<RitualProgress[]>('/progress'),
  markComplete: (ritualId: string) => api.post('/progress', { ritualId }),
  getStats: () => api.get('/progress/stats'),
};
