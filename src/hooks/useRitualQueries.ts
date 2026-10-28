import { normaliseProgress, ritualService } from "@/services/ritual.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAllRituals = () => {
  return useQuery({
    queryKey: ["rituals"],
    queryFn: async () => {
      const { data } = await ritualService.getAll();
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useGetRitualById = (id: string) => {
  return useQuery({
    queryKey: ["ritual", id],
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
    queryKey: ["progress"],
    queryFn: async () => {
      const { data } = await ritualService.getProgress();
      // Normalise: backend returns isCompleted + populated ritualId object
      return data.map(normaliseProgress);
    },
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useMarkCompleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ritualId: string) => ritualService.markComplete(ritualId),
    onSuccess: async (response: any, ritualId: string) => {
      const wasQueued = response?.data?.queued === true;

      if (wasQueued) {
        // Offline path — optimistically update the local progress cache
        // so the checklist immediately shows this step as done
        queryClient.setQueryData(["progress"], (old: any[] | undefined) => {
          if (!old) return [{ ritualId, completed: true }];
          const exists = old.some((p) => p.ritualId === ritualId);
          if (exists) {
            return old.map((p) =>
              p.ritualId === ritualId ? { ...p, completed: true } : p,
            );
          }
          return [...old, { ritualId, completed: true }];
        });
      } else {
        // Online path — force immediate refetch from server
        await Promise.all([
          queryClient.refetchQueries({ queryKey: ["progress"], exact: true }),
          queryClient.refetchQueries({
            queryKey: ["progressStats"],
            exact: true,
          }),
        ]);
      }
    },
    onError: (error: any) => {
      console.error("Mark complete error:", error);
    },
  });
};

export const useResetProgressMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => ritualService.resetProgress(),
    onSuccess: async () => {
      queryClient.setQueryData(["progress"], []);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["progress"] }),
        queryClient.invalidateQueries({ queryKey: ["progressStats"] }),
      ]);
    },
    onError: (error: any) => {
      console.error("Reset progress error:", error);
    },
  });
};

export const useGetProgressStats = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["progressStats"],
    queryFn: async () => {
      const { data } = await ritualService.getStats();
      return data;
    },
    enabled,
    staleTime: 1000 * 60 * 2,
  });
};
