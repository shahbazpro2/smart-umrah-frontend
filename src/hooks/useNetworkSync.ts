/**
 * useNetworkSync
 *
 * Mounts at the root layout. Does three things:
 *  1. Tracks online/offline state (via fetch-based polling — no extra package needed)
 *  2. When connectivity is restored, flushes the pending progress queue to the backend
 *  3. After flushing, invalidates TanStack Query caches so UI refreshes automatically
 *
 * The hook also exposes `isOnline` so any component can read network state.
 */

import api from '@/services/api';
import {
    queueGetAll,
    queueRemove,
    setSyncedAt,
} from '@/services/offline-storage.service';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 5000;
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.100:3000';

/**
 * Use a raw fetch (bypasses the axios cache interceptor) so we get a true
 * network result. A resolved promise = online, a rejection = offline.
 */
async function checkOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_URL}/rituals`, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    // Any HTTP response (even 401/403/404) means the network is reachable
    return res.status > 0;
  } catch {
    return false;
  }
}

export function useNetworkSync() {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(true);
  const wasOfflineRef = useRef(false);
  const isFlushing = useRef(false);

  const flushQueue = async () => {
    if (isFlushing.current) return;
    isFlushing.current = true;

    try {
      const queue = await queueGetAll();
      if (queue.length === 0) return;

      console.log(`[Sync] Flushing ${queue.length} queued progress item(s)`);

      for (const item of queue) {
        try {
          await api.post('/progress', { ritualId: item.ritualId });
          await queueRemove(item.ritualId);
          console.log(`[Sync] Flushed progress for ritual ${item.ritualId}`);
        } catch (err) {
          // Still offline or server error — leave in queue, try next time
          console.warn(`[Sync] Failed to flush ritual ${item.ritualId}`, err);
        }
      }

      // Invalidate progress caches so UI reflects the synced state
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
        queryClient.invalidateQueries({ queryKey: ['progressStats'] }),
      ]);

      // Record sync time
      await setSyncedAt(new Date().toISOString());
    } finally {
      isFlushing.current = false;
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    const poll = async () => {
      const online = await checkOnline();
      setIsOnline(online);

      if (online && wasOfflineRef.current) {
        // Just came back online — flush queue then refresh all queries
        console.log('[Sync] Back online — flushing queue and refreshing data');
        wasOfflineRef.current = false;
        await flushQueue();
        // Refresh all stale queries so the app shows fresh server data
        queryClient.invalidateQueries();
      } else if (!online) {
        wasOfflineRef.current = true;
      }
    };

    // Run immediately, then on interval
    poll();
    timer = setInterval(poll, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [queryClient]);

  return { isOnline };
}
