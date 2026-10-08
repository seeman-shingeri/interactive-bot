/**
 * Local Storage Persistence & Offline Sync Service
 * Safely caches user settings and companion state in browser localStorage with fallback handling.
 */

import { BotSettings, PrivacySettings } from '../types/index.js';

const STORAGE_KEYS = {
  BOT_SETTINGS: 'vista_bot_settings_cache',
  PRIVACY_SETTINGS: 'vista_privacy_settings_cache',
  LAST_VIDEO_ID: 'vista_last_watched_video',
  OFFLINE_CHAT_HISTORY: 'vista_offline_chat_history',
};

class LocalStorageService {
  private isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__vista_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private safeParse<T>(data: string | null): T | null {
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (err) {
      console.warn('LocalStorage JSON parse failed:', err);
      return null;
    }
  }

  private safeSetItem(key: string, value: string): void {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch (err: any) {
      if (err?.name === 'QuotaExceededError' || err?.code === 22) {
        console.warn('LocalStorage quota exceeded. Evicting non-critical cache...');
        try {
          window.localStorage.removeItem(STORAGE_KEYS.OFFLINE_CHAT_HISTORY);
          window.localStorage.setItem(key, value);
          return;
        } catch (retryErr) {
          console.warn('LocalStorage retry failed after eviction:', retryErr);
        }
      }
      console.warn(`LocalStorage write failed for key "${key}":`, err);
    }
  }

  public saveBotSettings(settings: BotSettings): void {
    this.safeSetItem(STORAGE_KEYS.BOT_SETTINGS, JSON.stringify(settings));
  }

  public getBotSettings(): Partial<BotSettings> | null {
    if (!this.isAvailable()) return null;
    return this.safeParse<Partial<BotSettings>>(window.localStorage.getItem(STORAGE_KEYS.BOT_SETTINGS));
  }

  public savePrivacySettings(settings: PrivacySettings): void {
    this.safeSetItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(settings));
  }

  public getPrivacySettings(): Partial<PrivacySettings> | null {
    if (!this.isAvailable()) return null;
    return this.safeParse<Partial<PrivacySettings>>(window.localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS));
  }

  public saveLastVideoId(videoId: string): void {
    this.safeSetItem(STORAGE_KEYS.LAST_VIDEO_ID, videoId);
  }

  public getLastVideoId(): string | null {
    if (!this.isAvailable()) return null;
    return window.localStorage.getItem(STORAGE_KEYS.LAST_VIDEO_ID);
  }

  public saveOfflineChatHistory(messages: any[]): void {
    this.safeSetItem(STORAGE_KEYS.OFFLINE_CHAT_HISTORY, JSON.stringify(messages.slice(-20)));
  }

  public getOfflineChatHistory(): any[] | null {
    if (!this.isAvailable()) return null;
    return this.safeParse<any[]>(window.localStorage.getItem(STORAGE_KEYS.OFFLINE_CHAT_HISTORY));
  }

  public clearAllCache(): void {
    if (!this.isAvailable()) return;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
    } catch (err) {
      console.warn('LocalStorage clear failed:', err);
    }
  }
}

export const storageService = new LocalStorageService();
