// VISTA Core Types

export type BotPersonalityPreset =
  | 'Friendly'
  | 'Funny'
  | 'Calm'
  | 'Curious'
  | 'Enthusiastic'
  | 'Analytical'
  | 'Sarcastic'
  | 'Supportive'
  | 'Custom';

export type BotEmotion =
  | 'idle'
  | 'watching'
  | 'attentive'
  | 'talking'
  | 'excited'
  | 'laughing'
  | 'thinking'
  | 'confused'
  | 'surprised'
  | 'sleeping';

export type ReactionLevel = 'NONE' | 'SUBTLE' | 'NORMAL' | 'STRONG';
export type ReactionFrequency = 'Low' | 'Balanced' | 'High' | 'Custom';
export type BotDockPosition = 'right' | 'left' | 'bottom-corner' | 'floating';
export type DataStorageMode = 'session_only' | 'personal_memory' | 'no_storage';

export interface BotSettings {
  name: string;
  avatarColor: 'cyan' | 'purple' | 'gold' | 'emerald' | 'rose';
  personality: BotPersonalityPreset;
  customInstructions: string;
  tone: 'casual' | 'witty' | 'formal' | 'poetic' | 'hype';
  reactionFrequency: ReactionFrequency;
  talkativeness: number; // 1 to 5
  humorLevel: number; // 1 to 5
  energyLevel: number; // 1 to 5
  expressiveness: number; // 1 to 5
  position: BotDockPosition;
  size: 'small' | 'medium' | 'large';
  opacity: number; // 0.2 to 1.0
  isVisible: boolean;
  isMinimized: boolean;
  isLocked: boolean;
  isMuted: boolean;
  reactionsPaused: boolean;
  voiceEnabled: boolean;
  voiceSpeed: number; // 0.8 to 1.5
  voicePitch: number; // 0.8 to 1.5
  voiceVoiceURI?: string;
}

export interface PrivacySettings {
  personalMemory: boolean; // Master switch
  savePreferences: boolean;
  rememberVideos: boolean;
  learnVisualTaste: boolean;
  storeVisualObservations: boolean;
  storeConversationHistory: boolean;
  useHistoryForRecommendations: boolean;
  dataStorageMode: DataStorageMode;
  visualAnalysisEnabled: boolean;
  microphoneEnabled: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration: number; // seconds
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  genres: string[];
  themes: string[];
  visualStyles: string[];
  isCustomUpload?: boolean;
  chapters?: { time: number; title: string }[];
  scenes?: SceneMetadata[];
  transcript?: TranscriptCue[];
}

export interface SceneMetadata {
  startTime: number;
  endTime: number;
  sceneName: string;
  visualSummary: string;
  mood: string;
  lighting: string;
  keyObjects: string[];
  pacing: 'slow' | 'medium' | 'fast';
  intensity: 'calm' | 'intriguing' | 'dramatic' | 'action' | 'funny';
}

export interface TranscriptCue {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface VisualObservation {
  id: string;
  sessionId: string;
  videoId: string;
  timestamp: number;
  brightness: number;
  motionIntensity: number;
  dominantColors: string[];
  detectedObjects: string[];
  sceneDescription: string;
  observedAt: string;
}

export interface TasteSignal {
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

export interface MemoryItem {
  id: string;
  userId: string;
  key: string;
  category: 'genre' | 'theme' | 'visual_style' | 'pacing' | 'character' | 'dislike';
  value: string;
  confidence: number; // 0.0 to 1.0
  sourceCount: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasteProfile {
  genres: Record<string, number>; // e.g. { "Sci-Fi": 0.85, "Comedy": 0.70 }
  themes: Record<string, number>; // e.g. { "Futuristic Space": 0.9, "Cyberpunk": 0.8 }
  visualPreferences: Record<string, number>; // e.g. { "Neon Cyber": 0.9, "Deep Space": 0.8 }
  pacingPreference: 'slow' | 'balanced' | 'fast';
  skippedCategories: string[];
  frequentlyWatched: string[];
  positiveReactionsCount: number;
  totalVideosWatched: number;
  totalWatchTimeSeconds: number;
  lastUpdated: string;
}

export interface BotReaction {
  id: string;
  emotion: BotEmotion;
  reactionLevel: ReactionLevel;
  spokenComment?: string;
  internalThought: string;
  suggestedAction?: 'ask_user' | 'laugh' | 'gasp' | 'point' | 'ponder';
  userFeedbackQuestion?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  videoTimestamp?: number;
  emotion?: BotEmotion;
  memorySignal?: {
    suggestedMemory: string;
    category: MemoryItem['category'];
    status: 'pending' | 'accepted' | 'rejected';
  };
}

export interface ViewingSession {
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
