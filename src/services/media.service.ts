import { LOCAL_MEDIA_ITEMS, LocalMediaItem } from "../constants/localMedia";
import api from "./api";

export interface Media {
  _id: string;
  title: string;
  type: "video" | "audio" | "image" | "youtube";
  language: "en" | "ar" | "ur" | "all";
  fileName?: string;
  filePath: string;
  youtubeUrl?: string;
  youtubeId?: string;
  description?: string;
  localAsset?: any;
  category?: string;
  tags?: string[];
  ritualKey?: string;
}

export function convertLocalToMedia(item: LocalMediaItem): Media {
  return {
    _id: item._id,
    title: item.title,
    type: item.type,
    language: item.language,
    fileName: item.fileName,
    filePath: `local://${item.fileName}`,
    description: item.description,
    localAsset: item.localAsset,
    category: item.category,
    tags: item.tags,
    ritualKey: item.ritualKey,
  };
}

export const mediaService = {
  getAll: async (
    type?: string,
    language?: string,
  ): Promise<{ data: Media[] }> => {
    const localMedia = LOCAL_MEDIA_ITEMS.map(convertLocalToMedia).filter(
      (m) => {
        if (type && type !== "all" && m.type !== type) return false;
        if (
          language &&
          language !== "all" &&
          m.language !== "all" &&
          m.language !== language
        )
          return false;
        return true;
      },
    );

    try {
      const res = await api.get<Media[]>("/media", {
        params: { ...(type && { type }), ...(language && { language }) },
      });
      // Deduplicate by ID or title
      const remote = Array.isArray(res.data) ? res.data : [];
      const combined = [...localMedia];
      for (const r of remote) {
        if (
          !combined.some(
            (c) =>
              c._id === r._id ||
              c.title.toLowerCase() === r.title.toLowerCase(),
          )
        ) {
          combined.push(r);
        }
      }
      return { data: combined };
    } catch {
      // Offline fallback: return all local media matching filter
      return { data: localMedia };
    }
  },

  getById: async (id: string): Promise<{ data: Media }> => {
    // Check local assets first
    const foundLocal = LOCAL_MEDIA_ITEMS.find((item) => item._id === id);
    if (foundLocal) {
      return { data: convertLocalToMedia(foundLocal) };
    }

    try {
      return await api.get<Media>(`/media/${id}`);
    } catch (err) {
      // If offline, check if any local matches roughly
      if (foundLocal) return { data: convertLocalToMedia(foundLocal) };
      throw err;
    }
  },

  getByRitual: async (ritualId: string): Promise<{ data: Media[] }> => {
    const localMatches = LOCAL_MEDIA_ITEMS.filter(
      (item) => item.ritualKey === ritualId || item.ritualKey === "all",
    ).map(convertLocalToMedia);

    try {
      const res = await api.get<Media[]>(`/rituals/${ritualId}/media`);
      const remote = Array.isArray(res.data) ? res.data : [];
      const combined = [...localMatches];
      for (const r of remote) {
        if (!combined.some((c) => c._id === r._id)) {
          combined.push(r);
        }
      }
      return { data: combined };
    } catch {
      return { data: localMatches };
    }
  },
};
