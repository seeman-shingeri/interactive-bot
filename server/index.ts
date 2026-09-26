import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { providerFactory } from './ai/providerFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to extract or fallback userId (for multi-user / session RLS)
const getUserId = (req: express.Request): string => {
  return (req.headers['x-user-id'] as string) || 'default_user';
};

// --- Status & Config Routes ---
app.get('/api/status', (req, res) => {
  const userId = getUserId(req);
  const privacy = db.getPrivacySettings(userId);
  const taste = db.getTasteProfile(userId);
  const memories = db.getMemoryItems(userId);
  const aiStatus = providerFactory.getStatus();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai: aiStatus,
    stats: {
      totalMemories: memories.length,
      totalWatched: taste.totalVideosWatched,
      positiveSignals: taste.positiveReactionsCount,
      personalMemoryActive: privacy.personalMemory,
      storageMode: privacy.dataStorageMode,
      visualAnalysisActive: privacy.visualAnalysisEnabled,
    },
  });
});

app.post('/api/config/api-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(400).json({ error: 'Valid apiKey string required' });
  }

  providerFactory.setApiKey(apiKey.trim());
  res.json({
    success: true,
    message: 'API Key updated successfully',
    status: providerFactory.getStatus(),
  });
});

// --- Bot Settings Routes ---
app.get('/api/bot-profile', (req, res) => {
  const userId = getUserId(req);
  const settings = db.getBotSettings(userId);
  res.json(settings);
});

app.put('/api/bot-profile', (req, res) => {
  const userId = getUserId(req);
  const updated = db.updateBotSettings(userId, req.body);
  res.json(updated);
});

// --- Privacy Settings Routes ---
app.get('/api/privacy', (req, res) => {
  const userId = getUserId(req);
  const privacy = db.getPrivacySettings(userId);
  res.json(privacy);
});

app.put('/api/privacy', (req, res) => {
  const userId = getUserId(req);
  const updated = db.updatePrivacySettings(userId, req.body);
  res.json(updated);
});

// --- Taste Profile Routes ---
app.get('/api/taste-profile', (req, res) => {
  const userId = getUserId(req);
  const profile = db.getTasteProfile(userId);
  const signals = db.getTasteSignals(userId);
  res.json({ profile, signals });
});

app.post('/api/taste-signal', (req, res) => {
  const userId = getUserId(req);
  const { videoId, videoTitle, signalType, category, genres, themes, visualStyle, sourceReason } = req.body;

  if (!videoId || !signalType) {
    return res.status(400).json({ error: 'Missing required signal fields' });
  }

  const signal = db.addTasteSignal({
    userId,
    videoId,
    videoTitle: videoTitle || 'Untitled Video',
    signalType,
    category: category || 'General',
    genres: genres || [],
    themes: themes || [],
    visualStyle: visualStyle || '',
    sourceReason: sourceReason || 'User feedback interaction',
  });

  const updatedProfile = db.getTasteProfile(userId);
  res.json({ signal, updatedProfile });
});

// --- Memory Items Routes ---
app.get('/api/memory/items', (req, res) => {
  const userId = getUserId(req);
  const items = db.getMemoryItems(userId);
  res.json(items);
});

app.post('/api/memory/items', (req, res) => {
  const userId = getUserId(req);
  const { key, category, value, reason } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: 'Missing key or value' });
  }

  const item = db.addMemoryItem(userId, {
    key,
    category: category || 'visual_style',
    value,
    confidence: 0.85,
    sourceCount: 1,
    reason: reason || 'Direct user preference confirmation',
  });

  res.json(item);
});

app.delete('/api/memory/items/:id', (req, res) => {
  const userId = getUserId(req);
  const success = db.deleteMemoryItem(userId, req.params.id);
  res.json({ success });
});

// --- Delete ALL Memory (GDPR / Strict Privacy) ---
app.delete('/api/memory/all', (req, res) => {
  const userId = getUserId(req);
  const result = db.deleteAllMemory(userId);
  res.json({
    success: true,
    message: 'All memory, preferences, and viewing records permanently deleted.',
    ...result,
  });
});

// --- Viewing History Routes ---
app.get('/api/history', (req, res) => {
  const userId = getUserId(req);
  const history = db.getViewingHistory(userId);
  res.json(history);
});

app.post('/api/history', (req, res) => {
  const userId = getUserId(req);
  const session = db.recordViewingSession({
    userId,
    ...req.body,
  });
  res.json(session);
});

// --- Visual Observations Routes ---
app.get('/api/observations', (req, res) => {
  const userId = getUserId(req);
  const videoId = req.query.videoId as string | undefined;
  const observations = db.getRecentObservations(userId, videoId);
  res.json(observations);
});

// --- AI Visual Analysis Route ---
app.post('/api/ai/analyze-frame', async (req, res) => {
  const userId = getUserId(req);
  const privacy = db.getPrivacySettings(userId);

  if (!privacy.visualAnalysisEnabled) {
    return res.json({
      analyzed: false,
      reason: 'Visual analysis is disabled in privacy settings',
    });
  }

  const { imageBase64, videoContext } = req.body;
  const provider = providerFactory.getProvider();

  try {
    const fullVideoContext = {
      ...videoContext,
      privacy: {
        personalMemory: privacy.personalMemory,
        learnVisualTaste: privacy.learnVisualTaste,
        visualAnalysisEnabled: privacy.visualAnalysisEnabled,
      },
    };
    const analysis = await provider.analyzeFrame(imageBase64 || '', fullVideoContext);

    // Record observation if allowed
    db.addObservation({
      userId,
      sessionId: req.body.sessionId || 'active_session',
      videoId: videoContext.videoId,
      timestamp: videoContext.timestamp,
      brightness: analysis.brightness,
      motionIntensity: analysis.motionIntensity,
      dominantColors: analysis.dominantColors,
      detectedObjects: analysis.detectedObjects,
      sceneDescription: analysis.sceneDescription,
    });

    // Check if taste signal was discovered
    if (analysis.learnedTasteSignal && privacy.personalMemory && privacy.learnVisualTaste) {
      db.addTasteSignal({
        userId,
        videoId: videoContext.videoId,
        videoTitle: videoContext.videoTitle,
        signalType: 'watch_complete',
        category: analysis.learnedTasteSignal.category,
        genres: [analysis.learnedTasteSignal.category],
        themes: [analysis.learnedTasteSignal.theme],
        visualStyle: analysis.learnedTasteSignal.visualStyle,
        sourceReason: analysis.learnedTasteSignal.reason,
      });
    }

    res.json({ analyzed: true, ...analysis });
  } catch (err: any) {
    console.error('Frame analysis error:', err);
    res.status(500).json({ error: err.message || 'Frame analysis failed' });
  }
});

// --- AI Reaction Route ---
app.post('/api/ai/reaction', async (req, res) => {
  const userId = getUserId(req);
  const botSettings = db.getBotSettings(userId);
  const privacy = db.getPrivacySettings(userId);

  if (botSettings.reactionsPaused || !botSettings.isVisible) {
    return res.json({ reaction: null, reason: 'Reactions are paused or bot is hidden' });
  }

  const { videoContext, isSceneChange, recentBotComments } = req.body;
  const provider = providerFactory.getProvider();

  try {
    const reaction = await provider.generateReaction({
      videoContext: {
        ...videoContext,
        botPersonality: {
          name: botSettings.name,
          personality: botSettings.personality,
          customInstructions: botSettings.customInstructions,
          tone: botSettings.tone,
          humorLevel: botSettings.humorLevel,
          talkativeness: botSettings.talkativeness,
        },
        privacy: {
          personalMemory: privacy.personalMemory,
          learnVisualTaste: privacy.learnVisualTaste,
          visualAnalysisEnabled: privacy.visualAnalysisEnabled,
        },
      },
      isSceneChange: Boolean(isSceneChange),
      userReactionFrequency: botSettings.reactionFrequency,
      recentBotComments: recentBotComments || [],
    });

    res.json({ reaction });
  } catch (err: any) {
    console.error('Reaction generation error:', err);
    res.status(500).json({ error: err.message || 'Reaction failed' });
  }
});

// --- AI Chat Route ---
app.post('/api/ai/chat', async (req, res) => {
  const userId = getUserId(req);
  const botSettings = db.getBotSettings(userId);
  const privacy = db.getPrivacySettings(userId);
  const tasteProfile = privacy.personalMemory ? db.getTasteProfile(userId) : undefined;
  const memories = privacy.personalMemory ? db.getMemoryItems(userId) : [];

  const { userMessage, videoContext, sessionId, recentHistory } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage required' });
  }

  // Record user message
  db.addChatMessage({
    userId,
    sessionId: sessionId || 'default_session',
    sender: 'user',
    text: userMessage,
    videoTimestamp: videoContext?.timestamp,
  });

  const provider = providerFactory.getProvider();

  try {
    const response = await provider.chat({
      userMessage,
      videoContext: {
        ...videoContext,
        botPersonality: {
          name: botSettings.name,
          personality: botSettings.personality,
          customInstructions: botSettings.customInstructions,
          tone: botSettings.tone,
          humorLevel: botSettings.humorLevel,
          talkativeness: botSettings.talkativeness,
        },
        privacy: {
          personalMemory: privacy.personalMemory,
          learnVisualTaste: privacy.learnVisualTaste,
          visualAnalysisEnabled: privacy.visualAnalysisEnabled,
        },
      },
      recentHistory: recentHistory || [],
      userTasteProfile: tasteProfile,
      memories,
    });

    // Record bot response
    db.addChatMessage({
      userId,
      sessionId: sessionId || 'default_session',
      sender: 'bot',
      text: response.botReply,
      videoTimestamp: videoContext?.timestamp,
      emotion: response.emotion,
      memorySignal: response.suggestedMemory
        ? {
            suggestedMemory: response.suggestedMemory.value,
            category: response.suggestedMemory.category,
            status: 'pending',
          }
        : undefined,
    });

    res.json(response);
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

// --- Chat History Routes ---
app.get('/api/chat/history', (req, res) => {
  const userId = getUserId(req);
  const sessionId = req.query.sessionId as string | undefined;
  const history = db.getChatHistory(userId, sessionId);
  res.json(history);
});

app.delete('/api/chat/history', (req, res) => {
  const userId = getUserId(req);
  const sessionId = req.query.sessionId as string | undefined;
  db.clearChatHistory(userId, sessionId);
  res.json({ success: true });
});

// Serve static assets from Vite build
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`[VISTA Backend] Server listening on http://localhost:${PORT}`);
  console.log(`[VISTA Backend] Active AI Provider: ${providerFactory.getStatus().providerName}`);
});
