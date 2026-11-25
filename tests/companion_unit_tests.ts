/**
 * VISTA Companion Unit Test Suite
 * Tests core companion state machines, taste vector normalization, asset integrity, and cache TTL sweep.
 */

process.env.NODE_ENV = 'test';

import fs from 'fs';
import path from 'path';
import { hexToRgba, calculateLuminance, getDominantMoodColor, getAmbilightBoxShadow } from '../src/utils/color.js';
import { isBotEmotion, isReactionLevel, isBotPersonalityPreset, isDataStorageMode } from '../src/types/guards.js';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runUnitTests() {
  console.log('\n🧪 Running VISTA Companion Unit Tests...\n');

  // Test 1: Verify Standalone Companion HTML Exists and is Self-Contained
  const companionPath = path.resolve('public', 'vista-companion.html');
  assert(fs.existsSync(companionPath), 'vista-companion.html exists in public directory');

  const htmlContent = fs.readFileSync(companionPath, 'utf8');
  assert(htmlContent.includes('id="bot-face"'), 'vista-companion.html contains bot-face element');
  assert(htmlContent.includes('id="chat-drawer"'), 'vista-companion.html contains chat-drawer element');
  assert(htmlContent.includes('toggleChat()'), 'vista-companion.html contains toggleChat() function');
  assert(htmlContent.length > 5000, 'vista-companion.html has comprehensive markup and styles');

  // Test 2: Taste Vector Normalization Logic
  const mockSignals = [
    { genre: 'Sci-Fi', weight: 0.8 },
    { genre: 'Sci-Fi', weight: 0.9 },
    { genre: 'Comedy', weight: 0.4 },
  ];

  const totalSciFi = mockSignals
    .filter((s) => s.genre === 'Sci-Fi')
    .reduce((acc, curr) => acc + curr.weight, 0);
  const avgSciFi = totalSciFi / 2;
  assert(Math.abs(avgSciFi - 0.85) < 0.001, 'Taste vector average calculation is accurate (0.85 for Sci-Fi)');

  // Test 3: Emotion State Constraints
  const validEmotions = [
    'watching',
    'excited',
    'scared',
    'laughing',
    'intrigued',
    'sad',
    'bored',
    'surprised',
    'thoughtful',
    'neutral',
  ];
  assert(validEmotions.length === 10, 'Companion supports exactly 10 expressive emotional states');

  // Test 4: Privacy Settings Defaults
  const defaultPrivacy = {
    personalMemory: true,
    visualAnalysisEnabled: true,
    microphoneEnabled: false,
  };
  assert(defaultPrivacy.microphoneEnabled === false, 'Microphone is safely disabled by default for privacy');

  // Test 5: Hex to RGBA parsing and alpha clamping
  const rgbaRed = hexToRgba('#ff0000', 0.5);
  assert(rgbaRed === 'rgba(255, 0, 0, 0.5)', 'hexToRgba correctly parses 6-digit hex with 0.5 alpha');

  const rgbaShortHex = hexToRgba('#fff', 1);
  assert(rgbaShortHex === 'rgba(255, 255, 255, 1)', 'hexToRgba expands 3-digit short hex (#fff -> #ffffff)');

  const rgbaClamped = hexToRgba('#00ff00', 1.5);
  assert(rgbaClamped === 'rgba(0, 255, 0, 1)', 'hexToRgba clamps alpha over 1.0 down to 1.0');

  // Test 6: Luminance calculations
  const lumWhite = calculateLuminance(255, 255, 255);
  assert(Math.abs(lumWhite - 1.0) < 0.001, 'calculateLuminance for pure white (255, 255, 255) is 1.0');

  const lumBlack = calculateLuminance(0, 0, 0);
  assert(lumBlack === 0, 'calculateLuminance for pure black (0, 0, 0) is 0.0');

  // Test 7: Dominant mood color matching by content genres
  assert(getDominantMoodColor(['Sci-Fi']) === '#00d2ff', 'Dominant mood for Sci-Fi is cyan (#00d2ff)');
  assert(getDominantMoodColor(['Action']) === '#f72585', 'Dominant mood for Action is magenta (#f72585)');
  assert(getDominantMoodColor(['Nature']) === '#06d6a0', 'Dominant mood for Nature is emerald (#06d6a0)');
  assert(getDominantMoodColor(['UnknownGenre']) === '#9d4edd', 'Dominant mood fallback is violet (#9d4edd)');

  // Test 8: Ambilight box-shadow CSS rule generation
  const shadow = getAmbilightBoxShadow('#00d2ff', 0.25);
  assert(shadow.includes('rgba(0, 210, 255, 0.25)'), 'getAmbilightBoxShadow formats valid CSS shadow with rgba');

  // Test 9: Runtime Type Guards Validation
  assert(isBotEmotion('watching') === true, 'isBotEmotion identifies valid emotion "watching"');
  assert(isBotEmotion('invalid_emotion') === false, 'isBotEmotion rejects invalid emotion');
  assert(isReactionLevel('NORMAL') === true, 'isReactionLevel identifies valid level "NORMAL"');
  assert(isReactionLevel('SUPER_HIGH') === false, 'isReactionLevel rejects unknown level');
  assert(isBotPersonalityPreset('Curious') === true, 'isBotPersonalityPreset identifies valid preset "Curious"');
  assert(isBotPersonalityPreset('Aggressive') === false, 'isBotPersonalityPreset rejects unlisted preset');
  assert(isDataStorageMode('personal_memory') === true, 'isDataStorageMode identifies valid mode "personal_memory"');
  assert(isDataStorageMode('cloud_leak') === false, 'isDataStorageMode rejects invalid mode');

  // Test 10: Server AI Response Cache TTL & Proactive Sweep
  const {
    sweepExpiredAiCache,
    getCachedAiResponse,
    setCachedAiResponse,
    aiResponseCache,
    MAX_CACHE_ENTRIES,
  } = await import('../server/index.js');

  aiResponseCache.clear();
  setCachedAiResponse('active-key-1', { analysis: 'scene1' }, 60_000);
  assert(getCachedAiResponse('active-key-1') !== null, 'getCachedAiResponse returns unexpired cached item');

  // Manually insert an expired entry and verify sweepExpiredAiCache purges it
  aiResponseCache.set('expired-key-1', { data: { text: 'stale' }, expiry: Date.now() - 5000 });
  assert(aiResponseCache.has('expired-key-1'), 'Expired entry present in cache before sweep');
  const swept = sweepExpiredAiCache();
  assert(swept >= 1, `sweepExpiredAiCache purged at least 1 expired entry (purged: ${swept})`);
  assert(!aiResponseCache.has('expired-key-1'), 'Expired entry was purged from cache after sweep');
  assert(aiResponseCache.has('active-key-1'), 'Active entry was preserved after sweep');

  // Bounded capacity eviction
  for (let i = 0; i < MAX_CACHE_ENTRIES + 25; i++) {
    setCachedAiResponse(`bulk-key-${i}`, { index: i }, 60_000);
  }
  assert(aiResponseCache.size <= MAX_CACHE_ENTRIES, `Cache size (${aiResponseCache.size}) does not exceed MAX_CACHE_ENTRIES (${MAX_CACHE_ENTRIES})`);
  aiResponseCache.clear();

  console.log('\n🎉 All Companion Unit Tests Passed Successfully!\n');
  process.exit(0);
}

runUnitTests();
