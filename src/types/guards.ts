/**
 * VISTA Type Guard Validations
 * Provides runtime validation for companion emotions, reaction levels, and privacy modes.
 */

import {
  BotEmotion,
  ReactionLevel,
  BotPersonalityPreset,
  DataStorageMode,
} from './index.js';

export const VALID_EMOTIONS: readonly BotEmotion[] = [
  'idle',
  'watching',
  'attentive',
  'talking',
  'excited',
  'laughing',
  'thinking',
  'confused',
  'surprised',
  'sleeping',
];

export const VALID_REACTION_LEVELS: readonly ReactionLevel[] = [
  'NONE',
  'SUBTLE',
  'NORMAL',
  'STRONG',
];

export const VALID_PERSONALITIES: readonly BotPersonalityPreset[] = [
  'Friendly',
  'Funny',
  'Calm',
  'Curious',
  'Enthusiastic',
  'Analytical',
  'Sarcastic',
  'Supportive',
  'Custom',
];

export const VALID_STORAGE_MODES: readonly DataStorageMode[] = [
  'session_only',
  'personal_memory',
  'no_storage',
];

export function isBotEmotion(val: unknown): val is BotEmotion {
  return typeof val === 'string' && VALID_EMOTIONS.includes(val as BotEmotion);
}

export function isReactionLevel(val: unknown): val is ReactionLevel {
  return typeof val === 'string' && VALID_REACTION_LEVELS.includes(val as ReactionLevel);
}

export function isBotPersonalityPreset(val: unknown): val is BotPersonalityPreset {
  return typeof val === 'string' && VALID_PERSONALITIES.includes(val as BotPersonalityPreset);
}

export function isDataStorageMode(val: unknown): val is DataStorageMode {
  return typeof val === 'string' && VALID_STORAGE_MODES.includes(val as DataStorageMode);
}
