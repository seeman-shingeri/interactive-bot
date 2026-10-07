import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { providerFactory } from './ai/providerFactory.js';
import { taskExecutor } from './taskExecutor.js';

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

// --- Download Standalone Bot Endpoint ---
app.get('/api/download/bot', (req, res) => {
  const filePath = path.join(__dirname, '../public/vista-companion.html');
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'vista-companion.html');
  } else {
    // Fallback if public folder is mapped in dist
    const fallbackPath = path.join(__dirname, '../dist/vista-companion.html');
    if (fs.existsSync(fallbackPath)) {
      res.download(fallbackPath, 'vista-companion.html');
    } else {
      res.status(404).json({ error: 'Standalone companion file not found' });
    }
  }
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

app.put('/api/memory/items/:id', (req, res) => {
  const userId = getUserId(req);
  const { value, category, reason, isConfirmed, disabled, tags } = req.body;
  const updated = db.updateMemoryItem(userId, req.params.id, {
    value,
    category,
    reason,
    isConfirmed,
    disabled,
    tags,
  });
  if (!updated) {
    return res.status(404).json({ error: 'Memory item not found' });
  }
  res.json(updated);
});

app.patch('/api/memory/items/:id/toggle', (req, res) => {
  const userId = getUserId(req);
  const updated = db.toggleMemoryItem(userId, req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Memory item not found' });
  }
  res.json(updated);
});

app.post('/api/memory/items/:id/confirm', (req, res) => {
  const userId = getUserId(req);
  const updated = db.confirmMemoryItem(userId, req.params.id);
  if (!updated) {
    return res.status(404).json({ error: 'Memory item not found' });
  }
  res.json(updated);
});

// --- Delete ALL Memory (GDPR / Strict Privacy) ---
app.delete('/api/memory/all', (req, res) => {
  const userId = getUserId(req);
  const result = db.deleteAllMemory(userId);
  res.json({
    message: 'All memory, preferences, and viewing records permanently deleted.',
    ...result,
  });
});

// --- Export User Data Archive (GDPR / Data Sovereignty) ---
app.get('/api/user/export', (req, res) => {
  const userId = getUserId(req);
  const botSettings = db.getBotSettings(userId);
  const privacySettings = db.getPrivacySettings(userId);
  const tasteProfile = db.getTasteProfile(userId);
  const tasteSignals = db.getTasteSignals(userId);
  const memories = db.getMemoryItems(userId);
  const viewingHistory = db.getViewingHistory(userId);
  const observations = db.getRecentObservations(userId);
  const tasks = db.getTasks(userId);
  const activities = db.getActivityLogs(userId, 200);

  db.logActivity(userId, 'Exported complete personal data archive', 'privacy', 'Exported GDPR compliant JSON archive');

  res.json({
    exportVersion: '1.0',
    exportTimestamp: new Date().toISOString(),
    userId,
    profile: {
      botSettings,
      privacySettings,
      tasteProfile,
    },
    data: {
      tasteSignals,
      memories,
      viewingHistory,
      observations,
      tasks,
      activities,
    },
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

// --- AI Request Budget & Rate Limiting Guard ---
const aiRequestTracker = new Map<string, number[]>();
const checkAiBudget = (userId: string, maxPerMinute: number = 60): boolean => {
  if (process.env.NODE_ENV === 'test') return true;
  const now = Date.now();
  const windowStart = now - 60_000;
  const timestamps = (aiRequestTracker.get(userId) || []).filter((t) => t > windowStart);
  if (timestamps.length >= maxPerMinute) {
    return false;
  }
  timestamps.push(now);
  aiRequestTracker.set(userId, timestamps);
  return true;
};

// --- AI Optimization, Caching & Metrics Tracking ---
interface AiMetrics {
  totalRequests: number;
  cacheHits: number;
  deduplicatedInFlight: number;
  estimatedTokensSaved: number;
}

const aiMetrics: AiMetrics = {
  totalRequests: 0,
  cacheHits: 0,
  deduplicatedInFlight: 0,
  estimatedTokensSaved: 0,
};

const aiResponseCache = new Map<string, { data: any; expiry: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

const getCachedAiResponse = (cacheKey: string): any | null => {
  const cached = aiResponseCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    aiMetrics.cacheHits++;
    aiMetrics.estimatedTokensSaved += 250;
    return cached.data;
  }
  if (cached) {
    aiResponseCache.delete(cacheKey);
  }
  return null;
};

const setCachedAiResponse = (cacheKey: string, data: any, ttlMs: number = 30_000) => {
  aiResponseCache.set(cacheKey, { data, expiry: Date.now() + ttlMs });
  if (aiResponseCache.size > 100) {
    const firstKey = aiResponseCache.keys().next().value;
    if (firstKey) aiResponseCache.delete(firstKey);
  }
};

// --- AI Visual Analysis Route ---
app.post('/api/ai/analyze-frame', async (req, res) => {
  const userId = getUserId(req);
  const privacy = db.getPrivacySettings(userId);

  if (!checkAiBudget(userId)) {
    return res.status(429).json({ error: 'AI budget limit reached. Please wait before making more requests.' });
  }

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

  if (botSettings.reactionsPaused || botSettings.quietMode || !botSettings.isVisible) {
    return res.json({ reaction: null, reason: 'Reactions are paused, quiet mode is active, or bot is hidden' });
  }

  if (!checkAiBudget(userId)) {
    return res.status(429).json({ error: 'AI budget limit reached. Please wait before making more requests.' });
  }

  aiMetrics.totalRequests++;
  const { videoContext, isSceneChange, recentBotComments } = req.body;
  const cacheKey = `react_${videoContext?.videoId}_${videoContext?.timestamp}_${isSceneChange}`;

  const cached = getCachedAiResponse(cacheKey);
  if (cached) {
    return res.json({ reaction: cached, cached: true });
  }

  const existingInFlight = inFlightRequests.get(cacheKey);
  if (existingInFlight) {
    aiMetrics.deduplicatedInFlight++;
    aiMetrics.estimatedTokensSaved += 250;
    const reaction = await existingInFlight;
    return res.json({ reaction, deduplicated: true });
  }

  const provider = providerFactory.getProvider();
  const reactionPromise = provider.generateReaction({
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

  inFlightRequests.set(cacheKey, reactionPromise);

  try {
    const reaction = await reactionPromise;
    setCachedAiResponse(cacheKey, reaction);
    res.json({ reaction });
  } catch (err: any) {
    console.error('Reaction generation error:', err);
    res.status(500).json({ error: err.message || 'Reaction failed' });
  } finally {
    inFlightRequests.delete(cacheKey);
  }
});

// --- AI Metrics & Cache Control Routes ---
app.get('/api/ai/metrics', (req, res) => {
  const hitRate =
    aiMetrics.totalRequests > 0
      ? Math.round((aiMetrics.cacheHits / aiMetrics.totalRequests) * 100)
      : 0;

  res.json({
    totalRequests: aiMetrics.totalRequests,
    cacheHits: aiMetrics.cacheHits,
    hitRatePercent: hitRate,
    deduplicatedInFlight: aiMetrics.deduplicatedInFlight,
    estimatedTokensSaved: aiMetrics.estimatedTokensSaved,
    activeProvider: providerFactory.getStatus().providerName,
  });
});

app.post('/api/ai/cache/clear', (req, res) => {
  aiResponseCache.clear();
  inFlightRequests.clear();
  res.json({
    success: true,
    message: 'AI response cache cleared successfully',
    cacheSize: 0,
  });
});

// --- AI Chat Route ---
app.post('/api/ai/chat', async (req, res) => {
  const userId = getUserId(req);
  const botSettings = db.getBotSettings(userId);
  const privacy = db.getPrivacySettings(userId);
  const tasteProfile = privacy.personalMemory ? db.getTasteProfile(userId) : undefined;
  const { userMessage, videoContext, sessionId, recentHistory } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage required' });
  }

  if (!checkAiBudget(userId)) {
    return res.status(429).json({ error: 'AI budget limit reached. Please wait before making more requests.' });
  }

  // Token optimization: rolling conversation window of most recent 6 messages
  const rollingHistory = (recentHistory || []).slice(-6);

  // Selective relevance retrieval: only retrieve top 4 memories relevant to query/context
  const relevantQuery = `${userMessage} ${videoContext?.videoTitle || ''}`.trim();
  const memories = privacy.personalMemory ? db.getRelevantMemories(userId, relevantQuery, 4) : [];

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
      recentHistory: rollingHistory,
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

// --- Tasks Routes ---
app.get('/api/tasks', (req, res) => {
  const userId = getUserId(req);
  const tasks = db.getTasks(userId);
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const userId = getUserId(req);
  const { title, description, type, schedule } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Valid task title required' });
  }

  const validTypes = ['video_summary', 'preference_refresh', 'scene_index', 'custom_agent'];
  if (type && !validTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid task type. Must be one of: ${validTypes.join(', ')}` });
  }

  const task = db.createTask(userId, {
    title: title.trim(),
    description,
    type,
    schedule,
  });
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const userId = getUserId(req);
  const { title, description, status, progress, result, error } = req.body;

  const updated = db.updateTask(userId, req.params.id, {
    ...(title ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(status ? { status } : {}),
    ...(progress !== undefined ? { progress } : {}),
    ...(result !== undefined ? { result } : {}),
    ...(error !== undefined ? { error } : {}),
  });

  if (!updated) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(updated);
});

app.post('/api/tasks/:id/cancel', (req, res) => {
  const userId = getUserId(req);
  const success = db.cancelTask(userId, req.params.id);
  if (!success) {
    return res.status(400).json({ error: 'Task not found or cannot be cancelled' });
  }
  res.json({ success: true, message: 'Task cancelled' });
});

app.post('/api/tasks/:id/retry', (req, res) => {
  const userId = getUserId(req);
  const task = db.retryTask(userId, req.params.id);
  if (!task) {
    return res.status(400).json({ error: 'Task not found or max retries exceeded' });
  }
  res.json(task);
});

app.post('/api/tasks/:id/run', async (req, res) => {
  const userId = getUserId(req);
  const task = await taskExecutor.executeTask(userId, req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.post('/api/tasks/:id/pause', (req, res) => {
  const userId = getUserId(req);
  const task = taskExecutor.pauseTask(userId, req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

app.post('/api/tasks/:id/resume', async (req, res) => {
  const userId = getUserId(req);
  const task = await taskExecutor.executeTask(userId, req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// --- Scheduled Tasks Automation Routes ---
app.post('/api/tasks/scheduler/check', async (req, res) => {
  const userId = getUserId(req);
  const executedTasks = await taskExecutor.checkAndRunScheduledTasks(userId);
  res.json({
    executedCount: executedTasks.length,
    executedTasks,
  });
});

app.get('/api/tasks/scheduler/status', (req, res) => {
  const userId = getUserId(req);
  const userTasks = db.getTasks(userId);
  const scheduledTasks = userTasks.filter((t) => t.schedule?.recurring);
  res.json({
    isRunning: taskExecutor.isSchedulerRunning(),
    scheduledCount: scheduledTasks.length,
    tasks: scheduledTasks,
  });
});

// --- Activity Timeline Route ---
app.get('/api/activities', (req, res) => {
  const userId = getUserId(req);
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const activities = db.getActivityLogs(userId, isNaN(limit) ? 50 : limit);
  res.json(activities);
});

// Serve static assets from Vite build
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  taskExecutor.startScheduler(60_000);
  app.listen(PORT, () => {
    console.log(`[VISTA Backend] Server listening on http://localhost:${PORT}`);
    console.log(`[VISTA Backend] Active AI Provider: ${providerFactory.getStatus().providerName}`);
    console.log(`[VISTA Backend] Task Automation Scheduler: Active`);
  });
}

export { app };
