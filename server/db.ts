import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'vista_db.json');

export interface UserRecord {
  id: string;
  name: string;
  createdAt: string;
}

export interface BotSettingsRecord {
  userId: string;
  name: string;
  avatarColor: 'cyan' | 'purple' | 'gold' | 'emerald' | 'rose';
  personality: string;
  customInstructions: string;
  tone: 'casual' | 'witty' | 'formal' | 'poetic' | 'hype';
  reactionFrequency: 'Low' | 'Balanced' | 'High' | 'Custom';
  talkativeness: number;
  humorLevel: number;
  energyLevel: number;
  expressiveness: number;
  position: 'right' | 'left' | 'bottom-corner' | 'floating';
  size: 'small' | 'medium' | 'large';
  opacity: number;
  isVisible: boolean;
  isMinimized: boolean;
  isLocked: boolean;
  isMuted: boolean;
  reactionsPaused: boolean;
  voiceEnabled: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceVoiceURI?: string;
}

export interface PrivacySettingsRecord {
  userId: string;
  personalMemory: boolean;
  savePreferences: boolean;
  rememberVideos: boolean;
  learnVisualTaste: boolean;
  storeVisualObservations: boolean;
  storeConversationHistory: boolean;
  useHistoryForRecommendations: boolean;
  dataStorageMode: 'session_only' | 'personal_memory' | 'no_storage';
  visualAnalysisEnabled: boolean;
  microphoneEnabled: boolean;
}

export interface MemoryItemRecord {
  id: string;
  userId: string;
  key: string;
  category: 'genre' | 'theme' | 'visual_style' | 'pacing' | 'character' | 'dislike';
  value: string;
  confidence: number;
  sourceCount: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasteSignalRecord {
  id: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  signalType: 'like' | 'dislike' | 'love' | 'not_interested' | 'watch_complete' | 'rewatch' | 'comment_positive';
  category: string;
  genres: string[];
  themes: string[];
  visualStyle: string;
  sourceReason: string;
  timestamp: string;
}

export interface TasteProfileRecord {
  userId: string;
  genres: Record<string, number>;
  themes: Record<string, number>;
  visualPreferences: Record<string, number>;
  pacingPreference: 'slow' | 'balanced' | 'fast';
  skippedCategories: string[];
  frequentlyWatched: string[];
  positiveReactionsCount: number;
  totalVideosWatched: number;
  totalWatchTimeSeconds: number;
  lastUpdated: string;
}

export interface ViewingSessionRecord {
  id: string;
  userId: string;
  videoId: string;
  videoTitle: string;
  startedAt: string;
  endedAt?: string;
  watchDurationSeconds: number;
  completedPercentage: number;
  userReactionSummary: string[];
}

export interface VisualObservationRecord {
  id: string;
  sessionId: string;
  userId: string;
  videoId: string;
  timestamp: number;
  brightness: number;
  motionIntensity: number;
  dominantColors: string[];
  detectedObjects: string[];
  sceneDescription: string;
  observedAt: string;
}

export interface ConversationMessageRecord {
  id: string;
  userId: string;
  sessionId: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  videoTimestamp?: number;
  emotion?: string;
  memorySignal?: {
    suggestedMemory: string;
    category: MemoryItemRecord['category'];
    status: 'pending' | 'accepted' | 'rejected';
  };
}

interface DatabaseSchema {
  users: UserRecord[];
  botSettings: BotSettingsRecord[];
  privacySettings: PrivacySettingsRecord[];
  memoryItems: MemoryItemRecord[];
  tasteSignals: TasteSignalRecord[];
  tasteProfiles: TasteProfileRecord[];
  viewingSessions: ViewingSessionRecord[];
  visualObservations: VisualObservationRecord[];
  conversationMessages: ConversationMessageRecord[];
}

const defaultSchema: DatabaseSchema = {
  users: [
    {
      id: 'default_user',
      name: 'Explorer',
      createdAt: new Date().toISOString(),
    },
  ],
  botSettings: [
    {
      userId: 'default_user',
      name: 'Nova',
      avatarColor: 'cyan',
      personality: 'Friendly',
      customInstructions: 'You are curious, warm, and love pointing out cool visual details without talking too much.',
      tone: 'casual',
      reactionFrequency: 'Balanced',
      talkativeness: 3,
      humorLevel: 3,
      energyLevel: 3,
      expressiveness: 4,
      position: 'right',
      size: 'medium',
      opacity: 0.95,
      isVisible: true,
      isMinimized: false,
      isLocked: false,
      isMuted: false,
      reactionsPaused: false,
      voiceEnabled: true,
      voiceSpeed: 1.0,
      voicePitch: 1.0,
    },
  ],
  privacySettings: [
    {
      userId: 'default_user',
      personalMemory: true,
      savePreferences: true,
      rememberVideos: true,
      learnVisualTaste: true,
      storeVisualObservations: true,
      storeConversationHistory: true,
      useHistoryForRecommendations: true,
      dataStorageMode: 'personal_memory',
      visualAnalysisEnabled: true,
      microphoneEnabled: false,
    },
  ],
  memoryItems: [
    {
      id: 'mem_1',
      userId: 'default_user',
      key: 'pref_scifi',
      category: 'genre',
      value: 'Sci-Fi and Space Exploration',
      confidence: 0.88,
      sourceCount: 3,
      reason: 'Watched Cosmic Horizons to completion and reacted with love.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'mem_2',
      userId: 'default_user',
      key: 'style_cyber',
      category: 'visual_style',
      value: 'Neon Cyberpunk & Dynamic Lighting',
      confidence: 0.82,
      sourceCount: 2,
      reason: 'Positive comment on neon city aesthetics in Cyber City 2099.',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ],
  tasteSignals: [],
  tasteProfiles: [
    {
      userId: 'default_user',
      genres: {
        'Sci-Fi': 0.85,
        'Animation': 0.65,
        'Documentary': 0.55,
        'Comedy': 0.70,
        'Action': 0.40,
      },
      themes: {
        'Deep Space': 0.90,
        'Futuristic Technology': 0.82,
        'Artificial Intelligence': 0.75,
        'Atmospheric Worlds': 0.68,
      },
      visualPreferences: {
        'Cinematic Darkness': 0.80,
        'Vibrant Neon Glow': 0.88,
        'Clean High-Tech Architecture': 0.72,
        'Nature Bioluminescence': 0.65,
      },
      pacingPreference: 'balanced',
      skippedCategories: ['Horror'],
      frequentlyWatched: ['Cosmic Horizons', 'Cyber City 2099'],
      positiveReactionsCount: 5,
      totalVideosWatched: 4,
      totalWatchTimeSeconds: 620,
      lastUpdated: new Date().toISOString(),
    },
  ],
  viewingSessions: [],
  visualObservations: [],
  conversationMessages: [],
};

class Database {
  private data: DatabaseSchema;
  private sessionOnlyCache: {
    visualObservations: VisualObservationRecord[];
    viewingSessions: ViewingSessionRecord[];
    conversationMessages: ConversationMessageRecord[];
  } = {
    visualObservations: [],
    viewingSessions: [],
    conversationMessages: [],
  };

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultSchema, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load database file, initializing defaults:', err);
    }
    this.save(defaultSchema);
    return defaultSchema;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // --- Bot Settings ---
  getBotSettings(userId: string): BotSettingsRecord {
    let s = this.data.botSettings.find((b) => b.userId === userId);
    if (!s) {
      s = { ...defaultSchema.botSettings[0], userId };
      this.data.botSettings.push(s);
      this.save();
    }
    return s;
  }

  updateBotSettings(userId: string, partial: Partial<BotSettingsRecord>): BotSettingsRecord {
    const idx = this.data.botSettings.findIndex((b) => b.userId === userId);
    if (idx >= 0) {
      this.data.botSettings[idx] = { ...this.data.botSettings[idx], ...partial };
    } else {
      this.data.botSettings.push({ ...defaultSchema.botSettings[0], ...partial, userId });
    }
    this.save();
    return this.getBotSettings(userId);
  }

  // --- Privacy Settings ---
  getPrivacySettings(userId: string): PrivacySettingsRecord {
    let p = this.data.privacySettings.find((ps) => ps.userId === userId);
    if (!p) {
      p = { ...defaultSchema.privacySettings[0], userId };
      this.data.privacySettings.push(p);
      this.save();
    }
    return p;
  }

  updatePrivacySettings(userId: string, partial: Partial<PrivacySettingsRecord>): PrivacySettingsRecord {
    const idx = this.data.privacySettings.findIndex((ps) => ps.userId === userId);
    if (idx >= 0) {
      this.data.privacySettings[idx] = { ...this.data.privacySettings[idx], ...partial };
    } else {
      this.data.privacySettings.push({ ...defaultSchema.privacySettings[0], ...partial, userId });
    }
    this.save();
    return this.getPrivacySettings(userId);
  }

  // --- Taste Profile ---
  getTasteProfile(userId: string): TasteProfileRecord {
    let tp = this.data.tasteProfiles.find((p) => p.userId === userId);
    if (!tp) {
      tp = {
        userId,
        genres: {},
        themes: {},
        visualPreferences: {},
        pacingPreference: 'balanced',
        skippedCategories: [],
        frequentlyWatched: [],
        positiveReactionsCount: 0,
        totalVideosWatched: 0,
        totalWatchTimeSeconds: 0,
        lastUpdated: new Date().toISOString(),
      };
      this.data.tasteProfiles.push(tp);
      this.save();
    }
    return tp;
  }

  updateTasteProfile(userId: string, profile: Partial<TasteProfileRecord>): TasteProfileRecord {
    const privacy = this.getPrivacySettings(userId);
    // If personalMemory is OFF or learnVisualTaste is false or dataStorageMode is no_storage, do not persist to long-term memory!
    if (!privacy.personalMemory || !privacy.learnVisualTaste || privacy.dataStorageMode === 'no_storage') {
      return this.getTasteProfile(userId);
    }

    const idx = this.data.tasteProfiles.findIndex((p) => p.userId === userId);
    if (idx >= 0) {
      this.data.tasteProfiles[idx] = {
        ...this.data.tasteProfiles[idx],
        ...profile,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      this.data.tasteProfiles.push({
        ...this.getTasteProfile(userId),
        ...profile,
        lastUpdated: new Date().toISOString(),
      });
    }
    this.save();
    return this.getTasteProfile(userId);
  }

  // --- Taste Signals ---
  addTasteSignal(signal: Omit<TasteSignalRecord, 'id' | 'timestamp'>): TasteSignalRecord | null {
    const privacy = this.getPrivacySettings(signal.userId);
    if (!privacy.personalMemory || privacy.dataStorageMode === 'no_storage') {
      return null;
    }

    const newSignal: TasteSignalRecord = {
      ...signal,
      id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    if (privacy.dataStorageMode === 'personal_memory') {
      this.data.tasteSignals.push(newSignal);
      this.recalculateTasteProfile(signal.userId, newSignal);
      this.save();
    }
    return newSignal;
  }

  getTasteSignals(userId: string): TasteSignalRecord[] {
    return this.data.tasteSignals.filter((s) => s.userId === userId);
  }

  private recalculateTasteProfile(userId: string, latestSignal: TasteSignalRecord) {
    const current = this.getTasteProfile(userId);
    const multiplier =
      latestSignal.signalType === 'love'
        ? 0.15
        : latestSignal.signalType === 'like' || latestSignal.signalType === 'comment_positive'
        ? 0.08
        : latestSignal.signalType === 'watch_complete'
        ? 0.05
        : latestSignal.signalType === 'dislike'
        ? -0.1
        : -0.2; // not_interested

    const updatedGenres = { ...current.genres };
    latestSignal.genres.forEach((g) => {
      const val = updatedGenres[g] || 0.5;
      updatedGenres[g] = Math.max(0.1, Math.min(1.0, Number((val + multiplier).toFixed(2))));
    });

    const updatedThemes = { ...current.themes };
    latestSignal.themes.forEach((t) => {
      const val = updatedThemes[t] || 0.5;
      updatedThemes[t] = Math.max(0.1, Math.min(1.0, Number((val + multiplier).toFixed(2))));
    });

    const updatedVisuals = { ...current.visualPreferences };
    if (latestSignal.visualStyle) {
      const val = updatedVisuals[latestSignal.visualStyle] || 0.5;
      updatedVisuals[latestSignal.visualStyle] = Math.max(
        0.1,
        Math.min(1.0, Number((val + multiplier).toFixed(2)))
      );
    }

    let positiveCount = current.positiveReactionsCount;
    if (multiplier > 0) positiveCount += 1;

    const frequentlyWatched = Array.from(
      new Set([latestSignal.videoTitle, ...current.frequentlyWatched])
    ).slice(0, 8);

    const skippedCategories = [...current.skippedCategories];
    if (multiplier < 0 && !skippedCategories.includes(latestSignal.category)) {
      skippedCategories.push(latestSignal.category);
    }

    this.data.tasteProfiles = this.data.tasteProfiles.map((tp) =>
      tp.userId === userId
        ? {
            ...tp,
            genres: updatedGenres,
            themes: updatedThemes,
            visualPreferences: updatedVisuals,
            positiveReactionsCount: positiveCount,
            frequentlyWatched,
            skippedCategories,
            lastUpdated: new Date().toISOString(),
          }
        : tp
    );
  }

  // --- Memory Items ---
  getMemoryItems(userId: string): MemoryItemRecord[] {
    const privacy = this.getPrivacySettings(userId);
    if (!privacy.personalMemory || privacy.dataStorageMode === 'no_storage') {
      return [];
    }
    return this.data.memoryItems.filter((m) => m.userId === userId);
  }

  addMemoryItem(
    userId: string,
    item: Omit<MemoryItemRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): MemoryItemRecord | null {
    const privacy = this.getPrivacySettings(userId);
    if (!privacy.personalMemory || !privacy.savePreferences || privacy.dataStorageMode !== 'personal_memory') {
      return null;
    }

    // Check if key already exists
    const existingIdx = this.data.memoryItems.findIndex((m) => m.userId === userId && m.key === item.key);
    if (existingIdx >= 0) {
      const existing = this.data.memoryItems[existingIdx];
      existing.sourceCount += 1;
      existing.confidence = Math.min(1.0, existing.confidence + 0.05);
      existing.value = item.value;
      existing.reason = item.reason;
      existing.updatedAt = new Date().toISOString();
      this.save();
      return existing;
    }

    const newItem: MemoryItemRecord = {
      ...item,
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.memoryItems.push(newItem);
    this.save();
    return newItem;
  }

  deleteMemoryItem(userId: string, id: string): boolean {
    const initialLen = this.data.memoryItems.length;
    this.data.memoryItems = this.data.memoryItems.filter((m) => !(m.userId === userId && m.id === id));
    if (this.data.memoryItems.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Delete ALL Memory (GDPR / Privacy requirement) ---
  deleteAllMemory(userId: string): { success: boolean; clearedCount: number } {
    const memoryCount = this.data.memoryItems.filter((m) => m.userId === userId).length;
    const signalCount = this.data.tasteSignals.filter((s) => s.userId === userId).length;

    this.data.memoryItems = this.data.memoryItems.filter((m) => m.userId !== userId);
    this.data.tasteSignals = this.data.tasteSignals.filter((s) => s.userId !== userId);
    this.data.viewingSessions = this.data.viewingSessions.filter((s) => s.userId !== userId);
    this.data.visualObservations = this.data.visualObservations.filter((s) => s.userId !== userId);
    this.data.conversationMessages = this.data.conversationMessages.filter((m) => m.userId !== userId);

    // Reset taste profile to clean initial state
    const tpIdx = this.data.tasteProfiles.findIndex((p) => p.userId === userId);
    if (tpIdx >= 0) {
      this.data.tasteProfiles[tpIdx] = {
        userId,
        genres: {},
        themes: {},
        visualPreferences: {},
        pacingPreference: 'balanced',
        skippedCategories: [],
        frequentlyWatched: [],
        positiveReactionsCount: 0,
        totalVideosWatched: 0,
        totalWatchTimeSeconds: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    this.save();
    return { success: true, clearedCount: memoryCount + signalCount };
  }

  // --- Visual Observations ---
  addObservation(
    obs: Omit<VisualObservationRecord, 'id' | 'observedAt'>
  ): VisualObservationRecord | null {
    const privacy = this.getPrivacySettings(obs.userId);
    if (!privacy.visualAnalysisEnabled || privacy.dataStorageMode === 'no_storage') {
      return null;
    }

    const record: VisualObservationRecord = {
      ...obs,
      id: `obs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      observedAt: new Date().toISOString(),
    };

    if (privacy.dataStorageMode === 'session_only') {
      this.sessionOnlyCache.visualObservations.push(record);
      if (this.sessionOnlyCache.visualObservations.length > 50) {
        this.sessionOnlyCache.visualObservations.shift();
      }
      return record;
    }

    if (privacy.dataStorageMode === 'personal_memory' && privacy.storeVisualObservations) {
      this.data.visualObservations.push(record);
      // Keep reasonable bound
      if (this.data.visualObservations.length > 300) {
        this.data.visualObservations.shift();
      }
      this.save();
      return record;
    }

    return null;
  }

  getRecentObservations(userId: string, videoId?: string): VisualObservationRecord[] {
    const privacy = this.getPrivacySettings(userId);
    if (privacy.dataStorageMode === 'session_only') {
      return this.sessionOnlyCache.visualObservations.filter(
        (o) => o.userId === userId && (!videoId || o.videoId === videoId)
      );
    }
    return this.data.visualObservations
      .filter((o) => o.userId === userId && (!videoId || o.videoId === videoId))
      .slice(-10);
  }

  // --- Viewing Sessions ---
  recordViewingSession(session: Omit<ViewingSessionRecord, 'id'>): ViewingSessionRecord | null {
    const privacy = this.getPrivacySettings(session.userId);
    if (privacy.dataStorageMode === 'no_storage' || !privacy.rememberVideos) {
      return null;
    }

    const record: ViewingSessionRecord = {
      ...session,
      id: `vs_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    if (privacy.dataStorageMode === 'session_only') {
      this.sessionOnlyCache.viewingSessions.push(record);
      return record;
    }

    if (privacy.dataStorageMode === 'personal_memory') {
      this.data.viewingSessions.push(record);
      const tp = this.getTasteProfile(session.userId);
      tp.totalVideosWatched += 1;
      tp.totalWatchTimeSeconds += session.watchDurationSeconds;
      this.save();
      return record;
    }
    return null;
  }

  getViewingHistory(userId: string): ViewingSessionRecord[] {
    const privacy = this.getPrivacySettings(userId);
    if (privacy.dataStorageMode === 'session_only') {
      return this.sessionOnlyCache.viewingSessions.filter((s) => s.userId === userId);
    }
    return this.data.viewingSessions.filter((s) => s.userId === userId);
  }

  // --- Conversation Messages ---
  addChatMessage(msg: Omit<ConversationMessageRecord, 'id' | 'timestamp'>): ConversationMessageRecord | null {
    const privacy = this.getPrivacySettings(msg.userId);
    const record: ConversationMessageRecord = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    if (privacy.dataStorageMode === 'no_storage') {
      return record; // in-memory response only
    }

    if (privacy.dataStorageMode === 'session_only') {
      this.sessionOnlyCache.conversationMessages.push(record);
      return record;
    }

    if (privacy.dataStorageMode === 'personal_memory' && privacy.storeConversationHistory) {
      this.data.conversationMessages.push(record);
      if (this.data.conversationMessages.length > 200) {
        this.data.conversationMessages.shift();
      }
      this.save();
    }
    return record;
  }

  getChatHistory(userId: string, sessionId?: string): ConversationMessageRecord[] {
    const privacy = this.getPrivacySettings(userId);
    if (privacy.dataStorageMode === 'session_only') {
      return this.sessionOnlyCache.conversationMessages.filter(
        (m) => m.userId === userId && (!sessionId || m.sessionId === sessionId)
      );
    }
    return this.data.conversationMessages.filter(
      (m) => m.userId === userId && (!sessionId || m.sessionId === sessionId)
    );
  }

  clearChatHistory(userId: string, sessionId?: string) {
    if (sessionId) {
      this.data.conversationMessages = this.data.conversationMessages.filter(
        (m) => !(m.userId === userId && m.sessionId === sessionId)
      );
      this.sessionOnlyCache.conversationMessages = this.sessionOnlyCache.conversationMessages.filter(
        (m) => !(m.userId === userId && m.sessionId === sessionId)
      );
    } else {
      this.data.conversationMessages = this.data.conversationMessages.filter((m) => m.userId !== userId);
      this.sessionOnlyCache.conversationMessages = this.sessionOnlyCache.conversationMessages.filter(
        (m) => m.userId !== userId
      );
    }
    this.save();
  }
}

export const db = new Database();
