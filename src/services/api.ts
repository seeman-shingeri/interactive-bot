import {
  BotSettings,
  PrivacySettings,
  TasteProfile,
  TasteSignal,
  MemoryItem,
  ViewingSession,
  VisualObservation,
  ChatMessage,
  BotReaction,
} from '../types/index.js';

const API_BASE = '/api';

export const api = {
  async getStatus() {
    const res = await fetch(`${API_BASE}/status`);
    return res.json();
  },

  async setApiKey(apiKey: string) {
    const res = await fetch(`${API_BASE}/config/api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return res.json();
  },

  async getBotProfile(): Promise<BotSettings> {
    const res = await fetch(`${API_BASE}/bot-profile`);
    return res.json();
  },

  async updateBotProfile(partial: Partial<BotSettings>): Promise<BotSettings> {
    const res = await fetch(`${API_BASE}/bot-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
    return res.json();
  },

  async getPrivacySettings(): Promise<PrivacySettings> {
    const res = await fetch(`${API_BASE}/privacy`);
    return res.json();
  },

  async updatePrivacySettings(partial: Partial<PrivacySettings>): Promise<PrivacySettings> {
    const res = await fetch(`${API_BASE}/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
    return res.json();
  },

  async getTasteProfile(): Promise<{ profile: TasteProfile; signals: TasteSignal[] }> {
    const res = await fetch(`${API_BASE}/taste-profile`);
    return res.json();
  },

  async sendTasteSignal(payload: {
    videoId: string;
    videoTitle: string;
    signalType: TasteSignal['signalType'];
    category?: string;
    genres?: string[];
    themes?: string[];
    visualStyle?: string;
    sourceReason?: string;
  }): Promise<{ signal: TasteSignal | null; updatedProfile: TasteProfile }> {
    const res = await fetch(`${API_BASE}/taste-signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getMemoryItems(): Promise<MemoryItem[]> {
    const res = await fetch(`${API_BASE}/memory/items`);
    return res.json();
  },

  async addMemoryItem(payload: {
    key: string;
    category?: MemoryItem['category'];
    value: string;
    reason?: string;
  }): Promise<MemoryItem> {
    const res = await fetch(`${API_BASE}/memory/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteMemoryItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/memory/items/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async deleteAllMemory(): Promise<{ success: boolean; message: string; clearedCount: number }> {
    const res = await fetch(`${API_BASE}/memory/all`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getViewingHistory(): Promise<ViewingSession[]> {
    const res = await fetch(`${API_BASE}/history`);
    return res.json();
  },

  async recordViewingSession(session: Omit<ViewingSession, 'id' | 'userId'>): Promise<ViewingSession> {
    const res = await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
    return res.json();
  },

  async getObservations(videoId?: string): Promise<VisualObservation[]> {
    const url = videoId ? `${API_BASE}/observations?videoId=${videoId}` : `${API_BASE}/observations`;
    const res = await fetch(url);
    return res.json();
  },

  async analyzeFrame(payload: {
    imageBase64?: string;
    sessionId?: string;
    videoContext: any;
  }) {
    const res = await fetch(`${API_BASE}/ai/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async generateReaction(payload: {
    videoContext: any;
    isSceneChange?: boolean;
    recentBotComments?: string[];
  }): Promise<{ reaction: BotReaction | null }> {
    const res = await fetch(`${API_BASE}/ai/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async sendChatMessage(payload: {
    userMessage: string;
    videoContext: any;
    sessionId?: string;
    recentHistory?: { sender: 'user' | 'bot'; text: string }[];
  }): Promise<{ botReply: string; emotion: any; suggestedMemory?: any }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getChatHistory(sessionId?: string): Promise<ChatMessage[]> {
    const url = sessionId ? `${API_BASE}/chat/history?sessionId=${sessionId}` : `${API_BASE}/chat/history`;
    const res = await fetch(url);
    return res.json();
  },

  async clearChatHistory(sessionId?: string): Promise<{ success: boolean }> {
    const url = sessionId ? `${API_BASE}/chat/history?sessionId=${sessionId}` : `${API_BASE}/chat/history`;
    const res = await fetch(url, { method: 'DELETE' });
    return res.json();
  },
};
