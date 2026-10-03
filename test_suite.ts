// VISTA Verification & Test Suite
// Self-contained test harness covering core systems, tasks, and memory controls

import { app } from './server/index.js';
import type { Server } from 'http';

let server: Server | null = null;
let BASE_URL = 'http://localhost:3001';

async function ensureServer(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/status`, { signal: AbortSignal.timeout(1000) });
    if (res.ok) {
      return; // Server is already running
    }
  } catch {
    // Server not running, start ephemeral server on port 3099
    const TEST_PORT = 3099;
    BASE_URL = `http://localhost:${TEST_PORT}`;
    await new Promise<void>((resolve) => {
      server = app.listen(TEST_PORT, () => {
        resolve();
      });
    });
  }
}

async function runTests() {
  console.log('=== STARTING VISTA SYSTEM VERIFICATION SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`, detail || '');
      failed++;
    }
  }

  try {
    await ensureServer();

    // 1. Check Server Status & AI Engine
    const statusRes = await fetch(`${BASE_URL}/api/status`).then((r) => r.json());
    assert(statusRes.status === 'ok', '1. Server is healthy and responding');
    assert(Boolean(statusRes.ai), '2. AI Provider engine initialized', statusRes.ai);

    // 2. Bot Profile Retrieval & Customization
    const botRes = await fetch(`${BASE_URL}/api/bot-profile`).then((r) => r.json());
    assert(botRes.name === 'Nova', '3. Companion default profile loaded (Nova)');

    const updateBot = await fetch(`${BASE_URL}/api/bot-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personality: 'Curious', humorLevel: 4 }),
    }).then((r) => r.json());
    assert(updateBot.personality === 'Curious' && updateBot.humorLevel === 4, '4. Bot personality updated to Curious');

    // 3. Scene Reaction Engine
    const reactionRes = await fetch(`${BASE_URL}/api/ai/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoContext: {
          videoId: 'cosmic-horizons',
          videoTitle: 'Cosmic Horizons',
          timestamp: 95,
          currentScene: {
            sceneName: 'Quantum Anomaly Flare',
            visualSummary: 'Sudden gravitational pulse distortion with energetic electric pulses',
            intensity: 'action',
            pacing: 'fast',
            mood: 'Thrilling',
            keyObjects: ['Gravitational vortex'],
          },
        },
        isSceneChange: true,
      }),
    }).then((r) => r.json());
    assert(reactionRes.reaction !== undefined, '5. Bot generated reactive scene event', reactionRes);

    // 4. Visual Frame Analysis
    const frameRes = await fetch(`${BASE_URL}/api/ai/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...',
        videoContext: {
          videoId: 'cyber-city-2099',
          videoTitle: 'Cyber City 2099',
          timestamp: 25,
          currentScene: {
            sceneName: 'Rainy Alleyway',
            visualSummary: 'Cybernetic operative weaving through dark alleys reflecting neon signs',
            intensity: 'intriguing',
            pacing: 'medium',
            mood: 'Tense & Gritty',
            keyObjects: ['Cybernetic visor', 'Neon signs'],
          },
        },
      }),
    }).then((r) => r.json());
    assert(frameRes.analyzed === true, '6. Visual frame analyzed asynchronously with scene context', frameRes);

    // 5. Chat with Companion
    const chatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'What just happened in this scene?',
        videoContext: {
          videoId: 'cosmic-horizons',
          videoTitle: 'Cosmic Horizons',
          timestamp: 95,
          currentScene: {
            sceneName: 'Quantum Anomaly Flare',
            visualSummary: 'Sudden gravitational pulse distortion',
            intensity: 'action',
            pacing: 'fast',
            mood: 'Thrilling',
          },
        },
      }),
    }).then((r) => r.json());
    assert(Boolean(chatRes.botReply && chatRes.botReply.length > 5), '7. Companion replied about current scene', chatRes);

    // 6. Test Taste Learning & Signal Ingestion
    const tasteRes = await fetch(`${BASE_URL}/api/taste-signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: 'cosmic-horizons',
        videoTitle: 'Cosmic Horizons',
        signalType: 'love',
        category: 'Sci-Fi',
        genres: ['Sci-Fi', 'Astronomy'],
        themes: ['Space Exploration'],
        visualStyle: 'Deep Space',
        sourceReason: 'User reacted with Love',
      }),
    }).then((r) => r.json());
    assert(tasteRes.updatedProfile?.genres['Sci-Fi'] >= 0.65, '8. Taste profile updated Sci-Fi affinity', tasteRes.updatedProfile?.genres);

    // 7. Test Memory Controls - Privacy Turn OFF
    await fetch(`${BASE_URL}/api/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalMemory: false }),
    });

    const tasteWhileOff = await fetch(`${BASE_URL}/api/taste-signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: 'random-horror',
        videoTitle: 'Scary Night',
        signalType: 'love',
        genres: ['Horror'],
      }),
    }).then((r) => r.json());
    assert(tasteWhileOff.signal === null, '9. When Personal Memory is OFF, no new taste signals are persisted');

    // 8. Restore Memory ON
    await fetch(`${BASE_URL}/api/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personalMemory: true, dataStorageMode: 'personal_memory' }),
    });

    // 9. Add Explicit Memory Item
    const memItem = await fetch(`${BASE_URL}/api/memory/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'pref_cyberpunk_neon',
        category: 'visual_style',
        value: 'Neon Cyberpunk Aesthetic',
        reason: 'User directly stated in chat',
      }),
    }).then((r) => r.json());
    assert(Boolean(memItem.id), '10. Explicit memory item created and stored');

    // 10. Memory Update and Toggle
    const updatedMem = await fetch(`${BASE_URL}/api/memory/items/${memItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'Ultra Neon Cyberpunk Aesthetic' }),
    }).then((r) => r.json());
    assert(updatedMem.value === 'Ultra Neon Cyberpunk Aesthetic', '11. Memory item updated successfully');

    const toggledMem = await fetch(`${BASE_URL}/api/memory/items/${memItem.id}/toggle`, {
      method: 'PATCH',
    }).then((r) => r.json());
    assert(toggledMem.disabled === true, '12. Memory item toggled to disabled');

    // 11. Delete Individual Memory Item
    const delMem = await fetch(`${BASE_URL}/api/memory/items/${memItem.id}`, {
      method: 'DELETE',
    }).then((r) => r.json());
    assert(delMem.success === true, '13. Individual memory item deleted successfully');

    // 12. Persistent Task Subsystem Verification
    const createdTask = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Generate Weekly Viewing Digest',
        description: 'Aggregate taste signals and favorite scenes into summary.',
        type: 'video_summary',
      }),
    }).then((r) => r.json());
    assert(createdTask.id && createdTask.status === 'pending', '14. Persistent task created in pending state');

    const allTasks = await fetch(`${BASE_URL}/api/tasks`).then((r) => r.json());
    assert(Array.isArray(allTasks) && allTasks.length >= 1, '15. Retrieved tasks array from database');

    const cancelledRes = await fetch(`${BASE_URL}/api/tasks/${createdTask.id}/cancel`, {
      method: 'POST',
    }).then((r) => r.json());
    assert(cancelledRes.success === true, '16. Task cancelled via control endpoint');

    const retriedTask = await fetch(`${BASE_URL}/api/tasks/${createdTask.id}/retry`, {
      method: 'POST',
    }).then((r) => r.json());
    assert(retriedTask.retries === 1 && retriedTask.status === 'pending', '17. Task retry control resets to pending and increments retry counter');

    // 13. Activity Timeline Verification
    const activities = await fetch(`${BASE_URL}/api/activities`).then((r) => r.json());
    assert(Array.isArray(activities) && activities.length > 0, '18. Activity timeline recorded actions and details');

    // 14. Server-Side Input Validation
    const invalidTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });
    assert(invalidTaskRes.status === 400, '19. Server rejects invalid task payload with HTTP 400');

    console.log(`\n=== TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  } finally {
    if (server) {
      server.close(() => {
        process.exit(failed > 0 ? 1 : 0);
      });
    } else {
      process.exit(failed > 0 ? 1 : 0);
    }
  }
}

runTests();
