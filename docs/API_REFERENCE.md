# VISTA REST API Reference

The VISTA backend runs on `http://localhost:3001` (proxied via Vite on `/api/*`).

---

## 1. System Health & Configuration

### `GET /api/status`
Returns server health, database metric counts, active AI provider info, and sensor privacy states.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-09-27T18:00:00.000Z",
  "ai": {
    "activeProvider": "local_semantic",
    "providerName": "VISTA Local Semantic Engine",
    "hasApiKey": false,
    "maskedKey": "",
    "isOnline": true,
    "supportedFeatures": {
      "visualAnalysis": true,
      "realtimeReactions": true,
      "dialogue": true,
      "tasteLearning": true,
      "memoryControl": true
    }
  },
  "stats": {
    "totalMemories": 2,
    "totalWatched": 4,
    "positiveSignals": 5,
    "personalMemoryActive": true,
    "storageMode": "personal_memory",
    "visualAnalysisActive": true
  }
}
```

### `POST /api/config/api-key`
Securely configures or updates the Google Gemini API key on the server. Never exposed to client JS.

**Request Body:**
```json
{
  "apiKey": "AIzaSy..."
}
```

---

## 2. Companion Profile Management

### `GET /api/bot-profile`
Retrieves companion appearance, personality preset, tone, sliders, position, and voice settings.

### `PUT /api/bot-profile`
Updates companion attributes.
```json
{
  "name": "Nova",
  "personality": "Curious",
  "avatarColor": "cyan",
  "humorLevel": 4,
  "talkativeness": 3,
  "reactionFrequency": "Balanced"
}
```

---

## 3. Privacy & Sovereign Memory Controls

### `GET /api/privacy`
Returns privacy flags and active data storage mode.

### `PUT /api/privacy`
Updates sovereign privacy settings.
```json
{
  "personalMemory": true,
  "savePreferences": true,
  "learnVisualTaste": true,
  "dataStorageMode": "personal_memory",
  "visualAnalysisEnabled": true
}
```

---

## 4. Visual Taste Intelligence

### `GET /api/taste-profile`
Returns current genre/theme affinities, pacing preferences, and raw taste signals.

### `POST /api/taste-signal`
Registers a direct user rating (`like`, `love`, `dislike`, `not_interested`) or completion event.
```json
{
  "videoId": "cosmic-horizons",
  "videoTitle": "Cosmic Horizons: Deep Space Nebula",
  "signalType": "love",
  "category": "Sci-Fi & Astronomy",
  "genres": ["Sci-Fi"],
  "themes": ["Space Exploration"],
  "visualStyle": "Deep Space"
}
```

---

## 5. Explicit Memory Items

### `GET /api/memory/items`
Returns all explicit learned preference items.

### `POST /api/memory/items`
Saves an explicit preference when confirmed by user.
```json
{
  "key": "pref_neon_cyber",
  "category": "visual_style",
  "value": "Neon Cyberpunk Lighting",
  "reason": "Direct user preference confirmation in companion chat"
}
```

### `DELETE /api/memory/items/:id`
Deletes an individual learned memory item.

### `DELETE /api/memory/all`
**GDPR Sovereign Wipe**: Permanently wipes all memory items, taste signals, viewing logs, and conversation history.

---

## 6. AI Perception & Dialogue

### `POST /api/ai/analyze-frame`
Asynchronously analyzes a video keyframe canvas base64 image alongside scene context.

### `POST /api/ai/reaction`
Evaluates whether the companion should react (visually or vocally) to the current video timestamp.

### `POST /api/ai/chat`
Companion dialogue endpoint. Synthesizes current scene context, recent messages, and saved memories.
```json
{
  "userMessage": "What do you think about this scene?",
  "videoContext": {
    "videoId": "cosmic-horizons",
    "timestamp": 45,
    "currentScene": { "sceneName": "Nebula Proximity", "mood": "Wonder" }
  }
}
```
