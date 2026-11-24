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
  FrameAnalysisPayload,
  ReactionPayload,
  AiChatPayload,
  AiChatResponse,
  ExportUserDataResponse,
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

function postJson<T = any>(url: string, body?: unknown): Promise<T> {
  return fetchJson<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function putJson<T = any>(url: string, body?: unknown): Promise<T> {
  return fetchJson<T>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function patchJson<T = any>(url: string, body?: unknown): Promise<T> {
  return fetchJson<T>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function deleteJson<T = any>(url: string): Promise<T> {
  return fetchJson<T>(url, {
    method: 'DELETE',
  });
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
    return postJson(`${API_BASE}/config/api-key`, { apiKey });
  },

  async getBotProfile(): Promise<BotSettings> {
    return fetchJson(`${API_BASE}/bot-profile`);
  },

  async updateBotProfile(partial: Partial<BotSettings>): Promise<BotSettings> {
    return putJson(`${API_BASE}/bot-profile`, partial);
  },

  async getPrivacySettings(): Promise<PrivacySettings> {
    return fetchJson(`${API_BASE}/privacy`);
  },

  async updatePrivacySettings(partial: Partial<PrivacySettings>): Promise<PrivacySettings> {
    return putJson(`${API_BASE}/privacy`, partial);
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
    return postJson(`${API_BASE}/taste-signal`, payload);
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
    return postJson(`${API_BASE}/memory/items`, payload);
  },

  async deleteMemoryItem(id: string): Promise<{ success: boolean }> {
    return deleteJson(`${API_BASE}/memory/items/${id}`);
  },

  async updateMemoryItem(id: string, partial: Partial<MemoryItem>): Promise<MemoryItem> {
    return putJson(`${API_BASE}/memory/items/${id}`, partial);
  },

  async toggleMemoryItem(id: string): Promise<MemoryItem> {
    return patchJson(`${API_BASE}/memory/items/${id}/toggle`);
  },

  async confirmMemoryItem(id: string): Promise<MemoryItem> {
    return postJson(`${API_BASE}/memory/items/${id}/confirm`);
  },

  async deleteAllMemory(): Promise<{ success: boolean; message: string; clearedCount: number }> {
    return deleteJson(`${API_BASE}/memory/all`);
  },

  async getViewingHistory(): Promise<ViewingSession[]> {
    return fetchJson(`${API_BASE}/history`);
  },

  async recordViewingSession(session: Omit<ViewingSession, 'id' | 'userId'>): Promise<ViewingSession> {
    return postJson(`${API_BASE}/history`, session);
  },

  async clearViewingHistory(): Promise<{ success: boolean; clearedCount: number }> {
    return deleteJson(`${API_BASE}/history`);
  },

  async getObservations(videoId?: string): Promise<VisualObservation[]> {
    const url = videoId ? `${API_BASE}/observations?videoId=${videoId}` : `${API_BASE}/observations`;
    return fetchJson(url);
  },

  async analyzeFrame(payload: FrameAnalysisPayload) {
    return postJson(`${API_BASE}/ai/analyze-frame`, payload);
  },

  async generateReaction(payload: ReactionPayload): Promise<{ reaction: BotReaction | null }> {
    return postJson(`${API_BASE}/ai/reaction`, payload);
  },

  async sendChatMessage(payload: AiChatPayload): Promise<AiChatResponse> {
    return postJson(`${API_BASE}/ai/chat`, payload);
  },

  async getChatHistory(sessionId?: string): Promise<ChatMessage[]> {
    const url = sessionId ? `${API_BASE}/chat/history?sessionId=${sessionId}` : `${API_BASE}/chat/history`;
    return fetchJson(url);
  },

  async clearChatHistory(sessionId?: string): Promise<{ success: boolean }> {
    const url = sessionId ? `${API_BASE}/chat/history?sessionId=${sessionId}` : `${API_BASE}/chat/history`;
    return deleteJson(url);
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
    return postJson(`${API_BASE}/tasks`, payload);
  },

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<TaskItem> {
    return putJson(`${API_BASE}/tasks/${id}`, updates);
  },

  async cancelTask(id: string): Promise<{ success: boolean; message?: string }> {
    return postJson(`${API_BASE}/tasks/${id}/cancel`);
  },

  async retryTask(id: string): Promise<TaskItem> {
    return postJson(`${API_BASE}/tasks/${id}/retry`);
  },

  async runTask(id: string): Promise<TaskItem> {
    return postJson(`${API_BASE}/tasks/${id}/run`);
  },

  async pauseTask(id: string): Promise<TaskItem> {
    return postJson(`${API_BASE}/tasks/${id}/pause`);
  },

  async resumeTask(id: string): Promise<TaskItem> {
    return postJson(`${API_BASE}/tasks/${id}/resume`);
  },

  async checkScheduledTasks(): Promise<{ executedCount: number; executedTasks: TaskItem[] }> {
    return postJson(`${API_BASE}/tasks/scheduler/check`);
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
    return deleteJson(`${API_BASE}/activities`);
  },

  async exportUserData(): Promise<ExportUserDataResponse> {
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
    return postJson(`${API_BASE}/ai/cache/clear`);
  },
};
