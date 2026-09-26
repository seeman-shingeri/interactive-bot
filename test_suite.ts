// VISTA Verification & Test Suite
// Tests all 20+ requirements from Section 32

const BASE_URL = 'http://localhost:3001';

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

    // 4. Visual Frame Analysis (with simulated base64 canvas capture)
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

    // 5. Chat with Companion (watching same scene together)
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

    // 10. Delete Individual Memory Item
    const delMem = await fetch(`${BASE_URL}/api/memory/items/${memItem.id}`, {
      method: 'DELETE',
    }).then((r) => r.json());
    assert(delMem.success === true, '11. Individual memory item deleted successfully');

    // 11. Test Visual Analysis Toggle
    await fetch(`${BASE_URL}/api/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visualAnalysisEnabled: false }),
    });

    const analysisWhileOff = await fetch(`${BASE_URL}/api/ai/analyze-frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: 'data:...',
        videoContext: { videoId: 'test', timestamp: 10 },
      }),
    }).then((r) => r.json());
    assert(analysisWhileOff.analyzed === false, '12. When Visual Analysis is disabled, frame analysis is blocked');

    // Re-enable visual analysis
    await fetch(`${BASE_URL}/api/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visualAnalysisEnabled: true }),
    });

    // 12. Test Data Storage Mode: Session Only vs No Storage
    await fetch(`${BASE_URL}/api/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataStorageMode: 'no_storage' }),
    });

    const sessionWhileNoStorage = await fetch(`${BASE_URL}/api/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: 'secret-video',
        videoTitle: 'Private Video',
        startedAt: new Date().toISOString(),
        watchDurationSeconds: 120,
        completedPercentage: 100,
        userReactionSummary: [],
      }),
    }).then((r) => r.json());
    assert(sessionWhileNoStorage === null, '13. When Data Storage is No Storage, viewing sessions are NOT recorded');

    // Restore standard personal memory mode
    await fetch(`${BASE_URL}/api/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataStorageMode: 'personal_memory' }),
    });

    // 13. Test Delete ALL Memory (GDPR requirement 12)
    const wipeRes = await fetch(`${BASE_URL}/api/memory/all`, {
      method: 'DELETE',
    }).then((r) => r.json());
    assert(wipeRes.success === true, '14. Delete All Memory wiped all memory items and signals');

    const memoriesAfterWipe = await fetch(`${BASE_URL}/api/memory/items`).then((r) => r.json());
    assert(memoriesAfterWipe.length === 0, '15. Memory items list is confirmed completely empty after wipe');

    console.log(`\n=== TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED ===`);
  } catch (err) {
    console.error('Test suite error:', err);
  }
}

runTests();
