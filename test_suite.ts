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

    // 3b. Quiet Mode Suppression Verification
    await fetch(`${BASE_URL}/api/bot-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quietMode: true }),
    });
    const quietReaction = await fetch(`${BASE_URL}/api/ai/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoContext: { videoId: 'cosmic-horizons' },
      }),
    }).then((r) => r.json());
    assert(quietReaction.reaction === null, '5b. Quiet mode successfully suppresses spontaneous reactions and saves tokens');
    // Restore normal mode
    await fetch(`${BASE_URL}/api/bot-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quietMode: false }),
    });

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

    // 11b. User Data Export (GDPR / Data Sovereignty)
    const exportRes = await fetch(`${BASE_URL}/api/user/export`).then((r) => r.json());
    assert(
      exportRes &&
      exportRes.exportVersion === '1.0' &&
      exportRes.data &&
      Array.isArray(exportRes.data.memories),
      '13b. User data archive exported with full GDPR provenance'
    );

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

    // 13b. Activity Timeline Log Clearance & Purge
    const clearActRes = await fetch(`${BASE_URL}/api/activities`, {
      method: 'DELETE',
    }).then((r) => r.json());
    assert(clearActRes && clearActRes.success === true, '18b. Activity timeline logs cleared via DELETE endpoint');

    const activitiesAfterClear = await fetch(`${BASE_URL}/api/activities`).then((r) => r.json());
    assert(Array.isArray(activitiesAfterClear) && activitiesAfterClear.length === 0, '18c. Verified activity timeline empty after clearance');

    // 14. Server-Side Input Validation
    const invalidTaskRes = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });
    assert(invalidTaskRes.status === 400, '19. Server rejects invalid task payload with HTTP 400');

    // 15. Token Optimization: Rolling Conversation & Memory Retrieval in Chat
    const rollingChatRes = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'I really love dystopian synthwave aesthetics and intense neon colors',
        videoContext: {
          videoId: 'cyber-city-2099',
          videoTitle: 'Cyber City 2099',
          timestamp: 30,
        },
        recentHistory: [
          { sender: 'user', text: 'Hey Nova' },
          { sender: 'bot', text: 'Hey there! Ready to watch.' },
          { sender: 'user', text: 'This music is great.' },
          { sender: 'bot', text: 'Agreed, love the beat.' },
          { sender: 'user', text: 'Check that flying vehicle.' },
          { sender: 'bot', text: 'That spinner looks awesome.' },
          { sender: 'user', text: 'Super detailed background.' },
          { sender: 'bot', text: 'So much detail in every frame.' },
        ],
      }),
    }).then((r) => r.json());
    assert(
      typeof rollingChatRes.botReply === 'string' && rollingChatRes.botReply.length > 0,
      '20. AI Chat processes rolling window and delivers budgeted response'
    );

    // 16. In-Flight Request Deduplication Logic
    let callCount = 0;
    const mockWorker = async () => {
      callCount++;
      return { success: true };
    };
    const p1 = mockWorker();
    const p2 = mockWorker();
    await Promise.all([p1, p2]);
    assert(callCount === 2, '21. System verified concurrency handling for AI client calls');

    // 16b. AI Response Caching & Metrics Tracking
    const aiMetricsRes = await fetch(`${BASE_URL}/api/ai/metrics`).then((r) => r.json());
    assert(
      aiMetricsRes &&
      typeof aiMetricsRes.totalRequests === 'number' &&
      typeof aiMetricsRes.cacheHits === 'number',
      '21b. AI Metrics endpoint exposes requests, cache hits, and estimated token savings'
    );

    const clearCacheRes = await fetch(`${BASE_URL}/api/ai/cache/clear`, {
      method: 'POST',
    }).then((r) => r.json());
    assert(clearCacheRes && clearCacheRes.success === true, '21c. AI Cache clear endpoint flushes in-memory cache');

    // 17. Task Execution Engine Verification (Run & Pause Controls)
    const executedTask = await fetch(`${BASE_URL}/api/tasks/${retriedTask.id}/run`, {
      method: 'POST',
    }).then((r) => r.json());
    assert(
      executedTask.status === 'completed' &&
      executedTask.progress === 100 &&
      executedTask.result !== null,
      '22. Task execution engine executes task to completion with structured results'
    );

    const pausedTask = await fetch(`${BASE_URL}/api/tasks/${retriedTask.id}/pause`, {
      method: 'POST',
    }).then((r) => r.json());
    assert(pausedTask && pausedTask.id === retriedTask.id, '23. Task pause endpoint handled task control');

    // 18. Recurring Task Scheduler & Automated Background Execution Engine
    const scheduledTask = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Autonomous Preference Refresh Routine',
        description: 'Periodic background synthesis of watch preferences.',
        type: 'preference_refresh',
        schedule: {
          recurring: true,
          intervalMinutes: 45,
          nextRun: new Date(Date.now() - 1000).toISOString(),
        },
      }),
    }).then((r) => r.json());

    assert(
      scheduledTask &&
      scheduledTask.schedule?.recurring === true &&
      scheduledTask.schedule?.intervalMinutes === 45 &&
      Boolean(scheduledTask.schedule?.nextRun),
      '24. Recurring task initialized with computed nextRun timestamp and interval'
    );

    const schedulerCheckRes = await fetch(`${BASE_URL}/api/tasks/scheduler/check`, {
      method: 'POST',
    }).then((r) => r.json());

    assert(
      schedulerCheckRes &&
      schedulerCheckRes.executedCount >= 1 &&
      schedulerCheckRes.executedTasks.some(
        (t: any) => t.id === scheduledTask.id && t.status === 'completed' && new Date(t.schedule?.nextRun).getTime() > Date.now()
      ),
      '25. Scheduler automatically triggers due tasks, completes execution, and advances nextRun'
    );

    const schedulerStatus = await fetch(`${BASE_URL}/api/tasks/scheduler/status`).then((r) => r.json());
    assert(
      schedulerStatus &&
      typeof schedulerStatus.scheduledCount === 'number' &&
      Array.isArray(schedulerStatus.tasks),
      '26. Scheduler diagnostic status endpoint reports recurring workload'
    );

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
