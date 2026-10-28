import api from './api';

export interface Media {
  _id: string;
  title: string;
  type: 'video' | 'audio' | 'image' | 'youtube';
  language: 'en' | 'ar' | 'ur' | 'all';
  fileName?: string;
  filePath: string;
  youtubeUrl?: string;
  youtubeId?: string;
}

export const mediaService = {
  getAll: (type?: string, language?: string) =>
    api.get<Media[]>('/media', {
      params: { ...(type && { type }), ...(language && { language }) },
    }),
  getById: (id: string) => api.get<Media>(`/media/${id}`),
  getByRitual: (ritualId: string) => api.get<Media[]>(`/rituals/${ritualId}/media`),
};
