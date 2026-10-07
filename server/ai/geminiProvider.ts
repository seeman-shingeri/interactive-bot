import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIProvider,
  VideoFrameContext,
  FrameAnalysisResult,
  ReactionDecisionInput,
  ChatInput,
  ChatResponse,
} from './types.js';
import { BotReaction, BotEmotion, ReactionLevel, TasteProfile } from '../../src/types/index.js';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini 2.5 Flash';
  private genAI: GoogleGenerativeAI | null = null;
  private apiKey: string = '';
  private modelName: string;
  private analysisCache = new Map<string, { data: FrameAnalysisResult; expiresAt: number }>();
  private reactionCache = new Map<string, { data: BotReaction | null; expiresAt: number }>();

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (key) {
      this.setApiKey(key);
    }
  }

  setApiKey(key: string) {
    this.apiKey = key;
    this.genAI = new GoogleGenerativeAI(key);
  }

  isReady(): boolean {
    return Boolean(this.genAI && this.apiKey);
  }

  async analyzeFrame(imageBase64: string, context: VideoFrameContext): Promise<FrameAnalysisResult> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured');
    }

    // Cache check: round timestamp to 15-second buckets to avoid repeated frame calls for same scene
    const cacheKey = `${context.videoId || 'unknown'}_${context.currentScene?.sceneName || Math.floor(context.timestamp / 15)}`;
    const cached = this.analysisCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          maxOutputTokens: 350,
          temperature: 0.3,
        },
      });
      const prompt = `You are VISTA, a friendly visual companion watching a video titled "${context.videoTitle}" alongside the user.
Current timestamp: ${Math.floor(context.timestamp)} seconds.
Scene info: ${JSON.stringify(context.currentScene || {})}
Recent transcript: ${JSON.stringify(context.recentTranscript || [])}

Analyze this video frame as a viewer sitting next to your friend.
Return a valid JSON object matching this schema:
{
  "brightness": 0.0 to 1.0,
  "motionIntensity": 0.0 to 1.0,
  "dominantColors": ["#hex1", "#hex2"],
  "detectedObjects": ["object1", "object2"],
  "sceneDescription": "short description of visual elements",
  "suggestedEmotion": "idle" | "watching" | "attentive" | "excited" | "laughing" | "thinking" | "confused" | "surprised",
  "reactionLevel": "NONE" | "SUBTLE" | "NORMAL" | "STRONG",
  "spokenComment": "A brief, natural 1-sentence comment as a friend (or null if silent)",
  "learnedTasteSignal": {
    "category": "genre/category",
    "visualStyle": "aesthetic style",
    "theme": "thematic element",
    "confidence": 0.0 to 1.0,
    "reason": "Why the user might appreciate this visual"
  }
}
Return only JSON.`;

      let contents: any[] = [prompt];
      if (imageBase64 && imageBase64.includes('base64,')) {
        const cleanBase64 = imageBase64.split('base64,')[1];
        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: 'image/jpeg',
          },
        });
      }

      const result = await model.generateContent(contents);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Cache frame analysis for 10 minutes (TTL)
        this.analysisCache.set(cacheKey, {
          data: parsed,
          expiresAt: Date.now() + 600_000,
        });
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini frame analysis failed, falling back:', err);
    }

    return {
      brightness: 0.5,
      motionIntensity: 0.5,
      dominantColors: ['#00d2ff', '#1a1f2c'],
      detectedObjects: ['scene subjects'],
      sceneDescription: `Scene at ${Math.floor(context.timestamp)}s`,
      suggestedEmotion: 'attentive',
      reactionLevel: 'SUBTLE',
    };
  }

  async analyzeScene(sceneData: any, context: VideoFrameContext): Promise<FrameAnalysisResult> {
    return this.analyzeFrame('', { ...context, currentScene: sceneData });
  }

  async generateReaction(input: ReactionDecisionInput): Promise<BotReaction | null> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured');
    }

    const { videoContext, isSceneChange, userReactionFrequency } = input;
    const { botPersonality } = videoContext;

    // Cache check for identical scene/moment reaction
    const cacheKey = `${videoContext.videoId || 'v'}_${videoContext.currentScene?.sceneName || Math.floor(videoContext.timestamp / 15)}_${userReactionFrequency}`;
    const cached = this.reactionCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          maxOutputTokens: 180,
          temperature: 0.6,
        },
        systemInstruction: `You are ${botPersonality.name}, a cozy AI companion watching a video with your best friend.
Personality: ${botPersonality.personality}.
Tone: ${botPersonality.tone}.
Humor: ${botPersonality.humorLevel}/5. Talkativeness: ${botPersonality.talkativeness}/5.
Instructions: ${botPersonality.customInstructions || 'React like two friends watching together. Keep comments short, natural, and never intrusive.'}`,
      });

      const prompt = `Current video: "${videoContext.videoTitle}" at ${Math.floor(videoContext.timestamp)}s.
Scene details: ${JSON.stringify(videoContext.currentScene || {})}
Recent transcript: ${JSON.stringify(videoContext.recentTranscript || [])}
Is major scene change: ${isSceneChange}
User reaction frequency setting: ${userReactionFrequency}

Decide if you should react right now. If it's not a noteworthy moment, return {"reaction": null}.
Otherwise return JSON:
{
  "emotion": "watching" | "attentive" | "excited" | "laughing" | "thinking" | "confused" | "surprised",
  "reactionLevel": "SUBTLE" | "NORMAL" | "STRONG",
  "spokenComment": "One punchy casual sentence or phrase to say out loud (or null if just a visual reaction)",
  "internalThought": "What you're thinking privately",
  "suggestedAction": "ask_user" | "laugh" | "gasp" | "point" | "ponder" | null
}
Return only JSON.`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.reaction && !parsed.emotion) {
          this.reactionCache.set(cacheKey, { data: null, expiresAt: Date.now() + 600_000 });
          return null;
        }
        const botReaction: BotReaction = {
          id: `react_${Date.now()}`,
          emotion: parsed.emotion || 'watching',
          reactionLevel: parsed.reactionLevel || 'SUBTLE',
          spokenComment: parsed.spokenComment || undefined,
          internalThought: parsed.internalThought || 'Watching video',
          suggestedAction: parsed.suggestedAction || undefined,
        };
        this.reactionCache.set(cacheKey, { data: botReaction, expiresAt: Date.now() + 600_000 });
        return botReaction;
      }
    } catch (err) {
      console.warn('Gemini reaction generation failed:', err);
    }
    return null;
  }

  async chat(input: ChatInput): Promise<ChatResponse> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured');
    }

    const { userMessage, videoContext, recentHistory, userTasteProfile, memories } = input;
    const { botPersonality } = videoContext;

    try {
      const responseStyle = botPersonality.responseStyle || 'balanced';
      const maxTokens =
        responseStyle === 'concise' ? 80 : responseStyle === 'deep_analytical' ? 350 : 250;
      const styleDirective =
        responseStyle === 'concise'
          ? 'Response Style: Ultra-concise (1 single sentence, max 20 words, minimal tokens).'
          : responseStyle === 'deep_analytical'
          ? 'Response Style: Deep analytical breakdown of cinematography, lighting, and pacing.'
          : responseStyle === 'humorous'
          ? 'Response Style: Witty, playful, humorous banter and entertaining observation.'
          : 'Response Style: Balanced, warm, conversational.';

      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: responseStyle === 'concise' ? 0.3 : 0.7,
        },
        systemInstruction: `You are ${botPersonality.name}, a visual companion watching videos alongside the user.
Your personality is ${botPersonality.personality}.
Tone: ${botPersonality.tone}.
${styleDirective}
Instructions: ${botPersonality.customInstructions || 'Talk like a friend sitting on the couch watching this exact moment.'}
Current video: "${videoContext.videoTitle}" (timestamp: ${Math.floor(videoContext.timestamp)}s).
Current Scene: ${JSON.stringify(videoContext.currentScene || {})}
Saved User Memories: ${JSON.stringify(memories || [])}
Learned Taste Profile: ${JSON.stringify(userTasteProfile || {})}`,
      });

      // Token optimization: rolling conversation window of most recent 6 messages
      const rollingHistory = (recentHistory || []).slice(-6);
      const conversationContext = rollingHistory
        .map((h) => `${h.sender === 'user' ? 'Friend' : botPersonality.name}: ${h.text}`)
        .join('\n');

      const prompt = `Recent conversation:
${conversationContext}

Friend says: "${userMessage.slice(0, 1000)}"

Reply in character as their friend watching the video right now.
Keep your response conversational, concise (1-3 sentences), warm and engaging.
If the friend expressed a clear preference (e.g. "I love this animation style" or "I hate jump scares"), include a suggestedMemory object so we can ask permission to remember it.

Format your output as JSON:
{
  "botReply": "your response",
  "emotion": "talking" | "excited" | "laughing" | "thinking" | "surprised" | "confused",
  "suggestedMemory": {
    "key": "pref_identifier",
    "category": "genre" | "theme" | "visual_style" | "pacing" | "dislike",
    "value": "what they liked/disliked",
    "reason": "why you suggested remembering this"
  } // (or omit suggestedMemory if no preference was expressed)
}
Return only JSON.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.warn('Gemini chat failed:', err);
    }

    return {
      botReply: `Watching "${videoContext.videoTitle}" with you is great! What a cool moment at ${Math.floor(videoContext.timestamp)}s.`,
      emotion: 'talking',
    };
  }

  async summarizeVideo(title: string, scenes: any[], userSignals: string[]): Promise<string> {
    if (!this.genAI) return `Watched ${title}`;
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const res = await model.generateContent(
        `Summarize the user's viewing of "${title}". Scenes: ${JSON.stringify(scenes)}. Reactions: ${userSignals.join(', ')}.`
      );
      return res.response.text();
    } catch (err) {
      return `Completed viewing of ${title}.`;
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.genAI) return [];
    try {
      const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const res = await model.embedContent(text);
      return res.embedding.values;
    } catch (err) {
      return [];
    }
  }

  async updateTasteProfile(signals: any[], currentProfile: TasteProfile): Promise<Partial<TasteProfile>> {
    return currentProfile;
  }
}
