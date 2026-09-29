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
    return typeof window !== 'undefined' && 'localStorage' in window;
  }

  public saveBotSettings(settings: BotSettings): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BOT_SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  public getBotSettings(): Partial<BotSettings> | null {
    if (!this.isAvailable()) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOT_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public savePrivacySettings(settings: PrivacySettings): void {
    if (!this.isAvailable()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PRIVACY_SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('LocalStorage save failed:', err);
    }
  }

  public getPrivacySettings(): Partial<PrivacySettings> | null {
    if (!this.isAvailable()) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRIVACY_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public clearAllCache(): void {
    if (!this.isAvailable()) return;
    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch (err) {
      console.warn('LocalStorage clear failed:', err);
    }
  }
}

export const storageService = new LocalStorageService();
