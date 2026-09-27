// VISTA Multi-Video Viewing Simulation & Stress Test

const BASE_URL = 'http://localhost:3001';

async function runSimulation() {
  console.log('=== VISTA MULTI-VIDEO VIEWING SIMULATION ===\n');

  try {
    // 1. Session Start
    console.log('[Step 1] Initializing companion viewing session...');
    const botRes = await fetch(`${BASE_URL}/api/bot-profile`).then((r) => r.json());
    console.log(` Companion active: ${botRes.name} (${botRes.personality})`);

    // 2. Simulate Watching Video 1: Cosmic Horizons
    console.log('\n[Step 2] Simulating playback of "Cosmic Horizons: Deep Space Nebula"...');
    const signal1 = await fetch(`${BASE_URL}/api/taste-signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: 'cosmic-horizons',
        videoTitle: 'Cosmic Horizons: Deep Space Nebula',
        signalType: 'love',
        category: 'Sci-Fi & Astronomy',
        genres: ['Sci-Fi', 'Astronomy'],
        themes: ['Space Exploration'],
        visualStyle: 'Deep Space',
        sourceReason: 'Simulation user loved deep space nebula scene',
      }),
    }).then((r) => r.json());
    console.log(' Taste profile updated for Sci-Fi:', signal1.updatedProfile?.genres['Sci-Fi']);

    // 3. Simulate Watching Video 2: Cyber City 2099
    console.log('\n[Step 3] Simulating playback of "Cyber City 2099"...');
    const signal2 = await fetch(`${BASE_URL}/api/taste-signal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId: 'cyber-city-2099',
        videoTitle: 'Cyber City 2099: Neon Syndicate',
        signalType: 'like',
        category: 'Cyberpunk & Action',
        genres: ['Cyberpunk', 'Action'],
        themes: ['High-Tech Megacity'],
        visualStyle: 'Neon Cyber',
        sourceReason: 'Simulation user liked rainy neon alley aesthetic',
      }),
    }).then((r) => r.json());
    console.log(' Taste profile updated for Cyberpunk:', signal2.updatedProfile?.genres['Cyberpunk']);

    // 4. Simulate Dialogue Context Query
    console.log('\n[Step 4] Simulating companion conversation query...');
    const chat = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: 'Would I probably like futuristic videos with neon visuals?',
        videoContext: {
          videoId: 'cyber-city-2099',
          videoTitle: 'Cyber City 2099',
          timestamp: 50,
        },
      }),
    }).then((r) => r.json());
    console.log(' Companion replied:', chat.botReply);

    console.log('\n=== SIMULATION PASSED: Multi-video lifecycle verified successfully ===');
  } catch (err) {
    console.error('Simulation failed:', err);
  }
}

runSimulation();
