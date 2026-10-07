// AI Provider Abstraction Interface for VISTA

import {
  BotEmotion,
  ReactionLevel,
  BotReaction,
  TasteProfile,
  MemoryItem,
  SceneMetadata,
  TranscriptCue,
} from '../../src/types/index.js';

export interface VideoFrameContext {
  videoId: string;
  videoTitle: string;
  timestamp: number;
  currentScene?: SceneMetadata;
  recentTranscript?: TranscriptCue[];
  botPersonality: {
    name: string;
    personality: string;
    customInstructions?: string;
    tone: string;
    responseStyle?: 'concise' | 'balanced' | 'deep_analytical' | 'humorous';
    humorLevel: number;
    talkativeness: number;
  };
  userTasteProfile?: TasteProfile;
  privacy: {
    personalMemory: boolean;
    learnVisualTaste: boolean;
    visualAnalysisEnabled: boolean;
  };
}

export interface FrameAnalysisResult {
  brightness: number;
  motionIntensity: number;
  dominantColors: string[];
  detectedObjects: string[];
  sceneDescription: string;
  suggestedEmotion: BotEmotion;
  reactionLevel: ReactionLevel;
  spokenComment?: string;
  learnedTasteSignal?: {
    category: string;
    visualStyle: string;
    theme: string;
    confidence: number;
    reason: string;
  };
}

export interface ReactionDecisionInput {
  videoContext: VideoFrameContext;
  visualSummary?: string;
  isSceneChange: boolean;
  userReactionFrequency: 'Low' | 'Balanced' | 'High' | 'Custom';
  recentBotComments: string[];
}

export interface ChatInput {
  userMessage: string;
  videoContext: VideoFrameContext;
  recentHistory: { sender: 'user' | 'bot'; text: string }[];
  userTasteProfile?: TasteProfile;
  memories?: MemoryItem[];
}

export interface ChatResponse {
  botReply: string;
  emotion: BotEmotion;
  suggestedMemory?: {
    key: string;
    category: MemoryItem['category'];
    value: string;
    reason: string;
  };
}

export interface AIProvider {
  name: string;
  isReady(): boolean;
  analyzeFrame(imageBase64: string, context: VideoFrameContext): Promise<FrameAnalysisResult>;
  analyzeScene(sceneData: SceneMetadata, context: VideoFrameContext): Promise<FrameAnalysisResult>;
  generateReaction(input: ReactionDecisionInput): Promise<BotReaction | null>;
  chat(input: ChatInput): Promise<ChatResponse>;
  summarizeVideo(title: string, scenes: SceneMetadata[], userSignals: string[]): Promise<string>;
  generateEmbeddings(text: string): Promise<number[]>;
  updateTasteProfile(signals: any[], currentProfile: TasteProfile): Promise<Partial<TasteProfile>>;
}
