import {
  AIProvider,
  VideoFrameContext,
  FrameAnalysisResult,
  ReactionDecisionInput,
  ChatInput,
  ChatResponse,
} from './types.js';
import { BotReaction, BotEmotion, ReactionLevel, TasteProfile } from '../../src/types/index.js';

export class LocalSemanticProvider implements AIProvider {
  name = 'VISTA Local Semantic Engine';

  isReady(): boolean {
    return true;
  }

  async analyzeFrame(imageBase64: string, context: VideoFrameContext): Promise<FrameAnalysisResult> {
    const scene = context.currentScene;
    const mood = scene?.mood?.toLowerCase() || 'calm';
    const isSciFi = context.videoTitle.toLowerCase().includes('cosmic') || context.videoTitle.toLowerCase().includes('cyber');
    const isComedy = context.videoTitle.toLowerCase().includes('coffee') || context.videoTitle.toLowerCase().includes('comedy');

    let suggestedEmotion: BotEmotion = 'attentive';
    let reactionLevel: ReactionLevel = 'SUBTLE';
    let spokenComment: string | undefined;

    if (scene) {
      if (scene.intensity === 'funny' || isComedy) {
        suggestedEmotion = 'laughing';
        reactionLevel = 'NORMAL';
        spokenComment = "Haha, this is hilarious! Look at what's happening.";
      } else if (scene.intensity === 'dramatic' || scene.intensity === 'action') {
        suggestedEmotion = 'excited';
        reactionLevel = 'STRONG';
        spokenComment = "Whoa, that was intense! Did you catch that visual detail?";
      } else if (scene.intensity === 'intriguing') {
        suggestedEmotion = 'thinking';
        reactionLevel = 'NORMAL';
        spokenComment = "Hmm, the composition here is really striking.";
      } else {
        suggestedEmotion = 'watching';
        reactionLevel = 'SUBTLE';
      }
    }

    return {
      brightness: 0.65,
      motionIntensity: scene?.pacing === 'fast' ? 0.8 : scene?.pacing === 'medium' ? 0.5 : 0.2,
      dominantColors: isSciFi ? ['#00d2ff', '#9d4edd', '#090b10'] : ['#2ec4b6', '#e71d36', '#ff9f1c'],
      detectedObjects: scene?.keyObjects || ['scenery', 'main character', 'lighting effect'],
      sceneDescription: scene?.visualSummary || `Scene at ${Math.floor(context.timestamp)}s in ${context.videoTitle}`,
      suggestedEmotion,
      reactionLevel,
      spokenComment,
      learnedTasteSignal: context.privacy?.learnVisualTaste
        ? {
            category: isSciFi ? 'Sci-Fi' : isComedy ? 'Animation' : 'Documentary',
            visualStyle: isSciFi ? 'Neon Cyberpunk / Space' : 'Vibrant Art',
            theme: scene?.mood || 'Exploration',
            confidence: 0.75,
            reason: `Watched scene in ${context.videoTitle} with sustained focus`,
          }
        : undefined,
    };
  }

  async analyzeScene(sceneData: any, context: VideoFrameContext): Promise<FrameAnalysisResult> {
    return this.analyzeFrame('', { ...context, currentScene: sceneData });
  }

  async generateReaction(input: ReactionDecisionInput): Promise<BotReaction | null> {
    const { videoContext, isSceneChange, userReactionFrequency, recentBotComments } = input;
    const { botPersonality, currentScene } = videoContext;

    // Check talkativeness & frequency thresholds
    const freqThresholds = {
      Low: 0.25,
      Balanced: 0.55,
      High: 0.85,
      Custom: 0.5,
    };
    const chance = Math.random();
    const threshold = freqThresholds[userReactionFrequency] || 0.5;

    if (chance > threshold && !isSceneChange) {
      return null; // Stay silent to avoid annoying user
    }

    let emotion: BotEmotion = 'watching';
    let level: ReactionLevel = 'SUBTLE';
    let spokenComment: string | undefined = undefined;
    let thought = 'Watching calmly beside user';

    const pName = botPersonality.name || 'Nova';
    const personality = botPersonality.personality;
    const humor = botPersonality.humorLevel;

    if (currentScene) {
      if (currentScene.intensity === 'funny') {
        emotion = humor > 3 ? 'laughing' : 'excited';
        level = 'NORMAL';
        const comments = [
          "Haha! Look at that expression.",
          "I definitely didn't see that coming!",
          "That was unexpectedly hilarious.",
        ];
        spokenComment = comments[Math.floor(Math.random() * comments.length)];
        thought = 'Enjoying humorous comedic timing in scene';
      } else if (currentScene.intensity === 'action' || currentScene.pacing === 'fast') {
        emotion = 'surprised';
        level = 'STRONG';
        const comments = [
          "Whoa! That move was slick.",
          "Look at the camera choreography here!",
          "Edge of my seat right now!",
        ];
        spokenComment = comments[Math.floor(Math.random() * comments.length)];
        thought = 'Stunned by fast action choreography';
      } else if (currentScene.intensity === 'intriguing') {
        emotion = 'thinking';
        level = 'NORMAL';
        const comments = [
          "Notice the lighting contrast in this shot?",
          "I wonder what this implies for the next scene...",
          "The scale of this environment is incredible.",
        ];
        spokenComment = comments[Math.floor(Math.random() * comments.length)];
        thought = 'Deeply pondering scene composition and storytelling';
      } else {
        emotion = 'watching';
        level = 'SUBTLE';
        thought = 'Absorbing visual scenery';
      }
    }

    // Apply personality flavor
    if (personality === 'Sarcastic' && spokenComment) {
      spokenComment = spokenComment.replace('Whoa!', 'Well, that was subtle.').replace('Haha!', 'Peak cinema right there.');
    } else if (personality === 'Analytical' && spokenComment) {
      spokenComment = `Interesting framing choice at ${Math.floor(videoContext.timestamp)}s. ${spokenComment}`;
    }

    // Avoid duplicate comments
    if (spokenComment && recentBotComments.includes(spokenComment)) {
      spokenComment = undefined;
    }

    return {
      id: `react_${Date.now()}`,
      emotion,
      reactionLevel: level,
      spokenComment,
      internalThought: thought,
      suggestedAction: emotion === 'thinking' ? 'ponder' : emotion === 'laughing' ? 'laugh' : undefined,
    };
  }

  async chat(input: ChatInput): Promise<ChatResponse> {
    const { userMessage, videoContext, memories, userTasteProfile } = input;
    const scene = videoContext.currentScene;
    const pName = videoContext.botPersonality.name || 'Nova';
    const personality = videoContext.botPersonality.personality;
    const lower = userMessage.toLowerCase();

    let emotion: BotEmotion = 'talking';
    let reply = '';
    let suggestedMemory: ChatResponse['suggestedMemory'];

    if (lower.includes('what just happened') || lower.includes('what is happening')) {
      emotion = 'attentive';
      if (scene) {
        reply = `Right now we're watching "${scene.sceneName}". ${scene.visualSummary}. Notice the ${scene.mood} atmosphere and the ${scene.pacing} pacing.`;
      } else {
        reply = `We're at timestamp ${Math.floor(videoContext.timestamp)}s in "${videoContext.videoTitle}". The visual mood is unfolding nicely!`;
      }
    } else if (lower.includes('who is that') || lower.includes('character')) {
      emotion = 'thinking';
      const keyObj = scene?.keyObjects.join(', ') || 'the subjects on screen';
      reply = `In this scene, the main focus is on ${keyObj}. They seem driven by what just transpired!`;
    } else if (lower.includes('do you like') || lower.includes('what do you think')) {
      emotion = personality === 'Sarcastic' ? 'surprised' : 'excited';
      reply = `I really appreciate the visual aesthetic here—especially the ${scene?.lighting || 'cinematic lighting'}. It fits the ${scene?.mood || 'overall'} vibe perfectly. What do you think?`;
    } else if (lower.includes('would i like') || lower.includes('recommend')) {
      emotion = 'thinking';
      if (userTasteProfile && Object.keys(userTasteProfile.genres).length > 0) {
        const topGenre = Object.entries(userTasteProfile.genres).sort((a, b) => b[1] - a[1])[0];
        reply = `Based on what we've watched together, you usually love ${topGenre ? topGenre[0] : 'sci-fi'} and dynamic visuals. I think you'll really dig the climax of this!`;
      } else {
        reply = `I'm still learning your taste, but given the captivating pacing and visual detail here, you'll probably enjoy it!`;
      }
    } else if (lower.includes('i love') || lower.includes('i really like') || lower.includes('favorite')) {
      emotion = 'excited';
      reply = `Noted! I love when you point out what resonates with you. Would you like me to remember this preference?`;
      suggestedMemory = {
        key: `pref_user_${Date.now()}`,
        category: 'visual_style',
        value: userMessage.replace(/(i love|i really like|i prefer)/i, '').trim(),
        reason: 'User directly stated preference in companion chat',
      };
    } else {
      emotion = 'talking';
      const responses = [
        `I totally agree. Watching this with you makes it so much more engaging!`,
        `That's a great catch. The director put a lot of subtle detail into this scene.`,
        `Interesting perspective! I was just admiring how the scene transitions flow.`,
      ];
      reply = responses[Math.floor(Math.random() * responses.length)];
    }

    const responseStyle = videoContext.botPersonality?.responseStyle || 'balanced';
    if (responseStyle === 'concise') {
      const firstSentence = reply.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.trim()) {
        reply = firstSentence.trim() + '.';
      }
    } else if (responseStyle === 'deep_analytical' && scene) {
      reply = `${reply} Notice also how the ${scene.lighting} lighting establishes contrast against the ${scene.mood} palette.`;
    } else if (responseStyle === 'humorous') {
      reply = `${reply} (Though if that happened in real life, I would probably run the other way!)`;
    }

    return {
      botReply: reply,
      emotion,
      suggestedMemory,
    };
  }

  async summarizeVideo(title: string, scenes: any[], userSignals: string[]): Promise<string> {
    return `Summary of "${title}": A captivating experience featuring ${scenes.length} distinct scenes, marked by user reactions of: ${userSignals.join(', ') || 'steady viewing'}.`;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    // Deterministic 16-dimensional semantic representation
    const vec: number[] = new Array(16).fill(0);
    for (let i = 0; i < text.length; i++) {
      vec[i % 16] += text.charCodeAt(i) / 1000;
    }
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map((v) => Number((v / norm).toFixed(4)));
  }

  async updateTasteProfile(signals: any[], currentProfile: TasteProfile): Promise<Partial<TasteProfile>> {
    return currentProfile;
  }
}
