/**
 * offline-storage.service.ts
 *
 * Single source of truth for everything stored locally in AsyncStorage.
 *
 * Keys
 * ────
 *  @cache/<url>          – cached GET response body (JSON string)
 *  @progress_queue       – array of pending { ritualId, queuedAt } objects
 *  @offline_synced_at    – ISO timestamp of last successful /offline/sync
 *  @is_offline           – 'true' | 'false' persisted flag (optional, for cold start)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Cache ────────────────────────────────────────────────────────────────────

const cacheKey = (url: string) => `@cache/${url}`;

export async function cacheSet(url: string, data: any): Promise<void> {
  try {
    await AsyncStorage.setItem(cacheKey(url), JSON.stringify({ data, cachedAt: Date.now() }));
  } catch {
    // storage full or unavailable — silently skip
  }
}

export async function cacheGet<T = any>(url: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(url));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data as T;
  } catch {
    return null;
  }
}

export async function cacheClear(url: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(cacheKey(url));
  } catch {}
}

/** Remove all @cache/* keys */
export async function cacheFlushAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('@cache/'));
    if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
  } catch {}
}

// ─── Pending progress queue ───────────────────────────────────────────────────

const QUEUE_KEY = '@progress_queue';

export interface PendingProgress {
  ritualId: string;
  queuedAt: string; // ISO
}

export async function queueGetAll(): Promise<PendingProgress[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function queueAdd(ritualId: string): Promise<void> {
  try {
    const existing = await queueGetAll();
    // Deduplicate — don't queue the same ritual twice
    if (existing.some(p => p.ritualId === ritualId)) return;
    existing.push({ ritualId, queuedAt: new Date().toISOString() });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
  } catch {}
}

export async function queueRemove(ritualId: string): Promise<void> {
  try {
    const existing = await queueGetAll();
    const updated = existing.filter(p => p.ritualId !== ritualId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  } catch {}
}

export async function queueClear(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch {}
}

// ─── Last sync timestamp ──────────────────────────────────────────────────────

const SYNC_TS_KEY = '@offline_synced_at';

export async function setSyncedAt(iso: string): Promise<void> {
  try {
    await AsyncStorage.setItem(SYNC_TS_KEY, iso);
  } catch {}
}

export async function getSyncedAt(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SYNC_TS_KEY);
  } catch {
    return null;
  }
}
