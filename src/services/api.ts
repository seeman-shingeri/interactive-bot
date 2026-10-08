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
  TaskItem,
  TaskType,
  ActivityLogItem,
} from '../types/index.js';

const API_BASE = '/api';

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Executes a network fetch with automatic in-flight request deduplication
 * for concurrent queries and AI analysis calls.
 */
async function fetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const method = (options?.method || 'GET').toUpperCase();
  const bodyKey = typeof options?.body === 'string' ? options.body : '';
  const dedupKey = `${method}:${url}:${bodyKey}`;

  // Deduplicate GET requests and read/eval AI calls while already in flight
  const isDedupable = method === 'GET' || url.includes('/api/ai/') || url.includes('/api/status');
  if (isDedupable && inFlightRequests.has(dedupKey)) {
    return inFlightRequests.get(dedupKey)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url, options);
      if (!res.ok && res.status === 429) {
        console.warn('VISTA API Rate Limited (429): Token budget threshold reached.');
      }
      return await res.json();
    } finally {
      inFlightRequests.delete(dedupKey);
    }
  })();

  if (isDedupable) {
    inFlightRequests.set(dedupKey, promise);
  }

  return promise;
}

/**
 * Debounce helper for client-side event throttling
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let timer: any = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

export const api = {
  async getStatus() {
    return fetchJson(`${API_BASE}/status`);
  },

  async setApiKey(apiKey: string) {
    return fetchJson(`${API_BASE}/config/api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
  },

  async getBotProfile(): Promise<BotSettings> {
    return fetchJson(`${API_BASE}/bot-profile`);
  },

  async updateBotProfile(partial: Partial<BotSettings>): Promise<BotSettings> {
    return fetchJson(`${API_BASE}/bot-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
  },

  async getPrivacySettings(): Promise<PrivacySettings> {
    return fetchJson(`${API_BASE}/privacy`);
  },

  async updatePrivacySettings(partial: Partial<PrivacySettings>): Promise<PrivacySettings> {
    return fetchJson(`${API_BASE}/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
  },

  async getTasteProfile(): Promise<{ profile: TasteProfile; signals: TasteSignal[] }> {
    return fetchJson(`${API_BASE}/taste-profile`);
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
    return fetchJson(`${API_BASE}/taste-signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async getMemoryItems(): Promise<MemoryItem[]> {
    return fetchJson(`${API_BASE}/memory/items`);
  },

  async addMemoryItem(payload: {
    key: string;
    category?: MemoryItem['category'];
    value: string;
    reason?: string;
  }): Promise<MemoryItem> {
    return fetchJson(`${API_BASE}/memory/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async deleteMemoryItem(id: string): Promise<{ success: boolean }> {
    return fetchJson(`${API_BASE}/memory/items/${id}`, {
      method: 'DELETE',
    });
  },

  async updateMemoryItem(id: string, partial: Partial<MemoryItem>): Promise<MemoryItem> {
    return fetchJson(`${API_BASE}/memory/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
  },

  async toggleMemoryItem(id: string): Promise<MemoryItem> {
    return fetchJson(`${API_BASE}/memory/items/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async confirmMemoryItem(id: string): Promise<MemoryItem> {
    return fetchJson(`${API_BASE}/memory/items/${id}/confirm`, {
      method: 'POST',
    });
  },

  async deleteAllMemory(): Promise<{ success: boolean; message: string; clearedCount: number }> {
    return fetchJson(`${API_BASE}/memory/all`, {
      method: 'DELETE',
    });
  },

  async getViewingHistory(): Promise<ViewingSession[]> {
    return fetchJson(`${API_BASE}/history`);
  },

  async recordViewingSession(session: Omit<ViewingSession, 'id' | 'userId'>): Promise<ViewingSession> {
    return fetchJson(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });
  },

  async clearViewingHistory(): Promise<{ success: boolean; clearedCount: number }> {
    return fetchJson(`${API_BASE}/history`, {
      method: 'DELETE',
    });
  },

  async getObservations(videoId?: string): Promise<VisualObservation[]> {
    const url = videoId ? `${API_BASE}/observations?videoId=${videoId}` : `${API_BASE}/observations`;
    return fetchJson(url);
  },

  async analyzeFrame(payload: {
    imageBase64?: string;
    sessionId?: string;
    videoContext: any;
  }) {
    return fetchJson(`${API_BASE}/ai/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async generateReaction(payload: {
    videoContext: any;
    isSceneChange?: boolean;
    recentBotComments?: string[];
  }): Promise<{ reaction: BotReaction | null }> {
    return fetchJson(`${API_BASE}/ai/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async sendChatMessage(payload: {
    userMessage: string;
    videoContext: any;
    sessionId?: string;
    recentHistory?: { sender: 'user' | 'bot'; text: string }[];
  }): Promise<{ botReply: string; emotion: any; suggestedMemory?: any }> {
    return fetchJson(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async getChatHistory(sessionId?: string): Promise<ChatMessage[]> {
    const url = sessionId ? `${API_BASE}/chat/history?sessionId=${sessionId}` : `${API_BASE}/chat/history`;
    return fetchJson(url);
  },

  async clearChatHistory(sessionId?: string): Promise<{ success: boolean }> {
    const url = sessionId ? `${API_BASE}/chat/history?sessionId=${sessionId}` : `${API_BASE}/chat/history`;
    return fetchJson(url, { method: 'DELETE' });
  },

  async getTasks(): Promise<TaskItem[]> {
    return fetchJson(`${API_BASE}/tasks`);
  },

  async createTask(payload: {
    title: string;
    description?: string;
    type?: TaskType;
    schedule?: TaskItem['schedule'];
  }): Promise<TaskItem> {
    return fetchJson(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    return fetchJson(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async cancelTask(id: string): Promise<{ success: boolean; message?: string }> {
    return fetchJson(`${API_BASE}/tasks/${id}/cancel`, {
      method: 'POST',
    });
  },

  async retryTask(id: string): Promise<TaskItem> {
    return fetchJson(`${API_BASE}/tasks/${id}/retry`, {
      method: 'POST',
    });
  },

  async runTask(id: string): Promise<TaskItem> {
    return fetchJson(`${API_BASE}/tasks/${id}/run`, {
      method: 'POST',
    });
  },

  async pauseTask(id: string): Promise<TaskItem> {
    return fetchJson(`${API_BASE}/tasks/${id}/pause`, {
      method: 'POST',
    });
  },

  async resumeTask(id: string): Promise<TaskItem> {
    return fetchJson(`${API_BASE}/tasks/${id}/resume`, {
      method: 'POST',
    });
  },

  async checkScheduledTasks(): Promise<{ executedCount: number; executedTasks: TaskItem[] }> {
    return fetchJson(`${API_BASE}/tasks/scheduler/check`, {
      method: 'POST',
    });
  },

  async getSchedulerStatus(): Promise<{
    isRunning: boolean;
    scheduledCount: number;
    tasks: TaskItem[];
  }> {
    return fetchJson(`${API_BASE}/tasks/scheduler/status`);
  },

  async getActivities(limit: number = 50): Promise<ActivityLogItem[]> {
    return fetchJson(`${API_BASE}/activities?limit=${limit}`);
  },

  async clearActivities(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE}/activities`, {
      method: 'DELETE',
    });
  },

  async exportUserData(): Promise<any> {
    return fetchJson(`${API_BASE}/user/export`);
  },

  async getAiMetrics(): Promise<{
    totalRequests: number;
    cacheHits: number;
    hitRatePercent: number;
    deduplicatedInFlight: number;
    estimatedTokensSaved: number;
    activeProvider: string;
  }> {
    return fetchJson(`${API_BASE}/ai/metrics`);
  },

  async clearAiCache(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE}/ai/cache/clear`, {
      method: 'POST',
    });
  },
};
