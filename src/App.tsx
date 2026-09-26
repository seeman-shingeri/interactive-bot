import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BotSettings,
  PrivacySettings,
  TasteProfile,
  TasteSignal,
  MemoryItem,
  ViewingSession,
  ChatMessage,
  BotReaction,
  BotEmotion,
  VideoItem,
  SceneMetadata,
} from './types/index.js';
import { SAMPLE_VIDEOS } from './data/sampleVideos.js';
import { api } from './services/api.js';
import { speechService } from './services/speech.js';

// Components
import { Navbar, NavTab } from './components/common/Navbar.js';
import { VideoPlayer } from './components/video/VideoPlayer.js';
import { CompanionAvatar } from './components/companion/CompanionAvatar.js';
import { CompanionChat } from './components/chat/CompanionChat.js';
import { TasteProfileView } from './components/taste/TasteProfileView.js';
import { PrivacyMemoryCenter } from './components/memory/PrivacyMemoryCenter.js';
import { BotStudio } from './components/studio/BotStudio.js';
import { ViewingHistoryView } from './components/history/ViewingHistoryView.js';
import { AiConfigModal } from './components/config/AiConfigModal.js';
import { MemoryToast, MemoryToastData } from './components/common/MemoryToast.js';

export const App: React.FC = () => {
  // Navigation & View
  const [currentTab, setCurrentTab] = useState<NavTab>('watch');

  // Video State
  const [currentVideo, setCurrentVideo] = useState<VideoItem>(SAMPLE_VIDEOS[0]);
  const [playlist, setPlaylist] = useState<VideoItem[]>(SAMPLE_VIDEOS);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [activeScene, setActiveScene] = useState<SceneMetadata | undefined>(
    SAMPLE_VIDEOS[0].scenes?.[0]
  );

  // Settings & DB State
  const [botSettings, setBotSettings] = useState<BotSettings>({
    name: 'Nova',
    avatarColor: 'cyan',
    personality: 'Friendly',
    customInstructions: 'Be warm, witty, and enjoy pointing out neat visual details together.',
    tone: 'casual',
    reactionFrequency: 'Balanced',
    talkativeness: 3,
    humorLevel: 3,
    energyLevel: 3,
    expressiveness: 4,
    position: 'right',
    size: 'medium',
    opacity: 0.95,
    isVisible: true,
    isMinimized: false,
    isLocked: false,
    isMuted: false,
    reactionsPaused: false,
    voiceEnabled: true,
    voiceSpeed: 1.0,
    voicePitch: 1.0,
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    personalMemory: true,
    savePreferences: true,
    rememberVideos: true,
    learnVisualTaste: true,
    storeVisualObservations: true,
    storeConversationHistory: true,
    useHistoryForRecommendations: true,
    dataStorageMode: 'personal_memory',
    visualAnalysisEnabled: true,
    microphoneEnabled: false,
  });

  const [tasteProfile, setTasteProfile] = useState<TasteProfile>({
    genres: { 'Sci-Fi': 0.85, Animation: 0.65, Documentary: 0.55, Comedy: 0.7 },
    themes: { 'Deep Space': 0.9, 'Futuristic Technology': 0.82 },
    visualPreferences: { 'Neon Cyber': 0.88, 'Dark Cinematic': 0.8 },
    pacingPreference: 'balanced',
    skippedCategories: [],
    frequentlyWatched: ['Cosmic Horizons'],
    positiveReactionsCount: 4,
    totalVideosWatched: 3,
    totalWatchTimeSeconds: 420,
    lastUpdated: new Date().toISOString(),
  });

  const [tasteSignals, setTasteSignals] = useState<TasteSignal[]>([]);
  const [memoryItems, setMemoryItems] = useState<MemoryItem[]>([]);
  const [viewingHistory, setViewingHistory] = useState<ViewingSession[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiStatus, setAiStatus] = useState<any>(null);

  // Companion Live Reaction State
  const [currentEmotion, setCurrentEmotion] = useState<BotEmotion>('watching');
  const [activeReaction, setActiveReaction] = useState<BotReaction | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeMemoryToast, setActiveMemoryToast] = useState<MemoryToastData | null>(null);

  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recentBotCommentsRef = useRef<string[]>([]);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Load initial backend state
  const loadData = useCallback(async () => {
    try {
      const [statusRes, botRes, privacyRes, tasteRes, memRes, historyRes, chatRes] =
        await Promise.all([
          api.getStatus(),
          api.getBotProfile(),
          api.getPrivacySettings(),
          api.getTasteProfile(),
          api.getMemoryItems(),
          api.getViewingHistory(),
          api.getChatHistory(),
        ]);

      setAiStatus(statusRes);
      if (botRes) setBotSettings(botRes);
      if (privacyRes) setPrivacySettings(privacyRes);
      if (tasteRes?.profile) {
        setTasteProfile(tasteRes.profile);
        setTasteSignals(tasteRes.signals || []);
      }
      if (memRes) setMemoryItems(memRes);
      if (historyRes) setViewingHistory(historyRes);
      if (chatRes) setChatMessages(chatRes);
    } catch (err) {
      console.warn('Backend connection note:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger companion speech via Web Speech API
  const speakReaction = useCallback(
    (text: string) => {
      if (!botSettings.voiceEnabled || botSettings.isMuted) return;

      setIsSpeaking(true);
      setCurrentEmotion('talking');

      speechService.speak(text, {
        voiceURI: botSettings.voiceVoiceURI,
        rate: botSettings.voiceSpeed,
        pitch: botSettings.voicePitch,
        onEnd: () => {
          setIsSpeaking(false);
          setCurrentEmotion('watching');
        },
        onError: () => {
          setIsSpeaking(false);
          setCurrentEmotion('watching');
        },
      });
    },
    [botSettings]
  );

  // Handle Scene Change in Video
  const handleSceneChange = useCallback(
    async (scene: SceneMetadata) => {
      setActiveScene(scene);

      // Bot reacts to scene changes (Requirement 6)
      if (botSettings.reactionsPaused || !botSettings.isVisible) return;

      // Adapt emotion based on scene mood
      if (scene.intensity === 'funny') {
        setCurrentEmotion('laughing');
      } else if (scene.intensity === 'action') {
        setCurrentEmotion('surprised');
      } else if (scene.intensity === 'intriguing') {
        setCurrentEmotion('thinking');
      } else {
        setCurrentEmotion('attentive');
      }

      // Query AI Reaction from backend
      try {
        const { reaction } = await api.generateReaction({
          videoContext: {
            videoId: currentVideo.id,
            videoTitle: currentVideo.title,
            timestamp: scene.startTime,
            currentScene: scene,
            botPersonality: botSettings,
          },
          isSceneChange: true,
          recentBotComments: recentBotCommentsRef.current,
        });

        if (reaction) {
          setActiveReaction(reaction);
          setCurrentEmotion(reaction.emotion);

          if (reaction.spokenComment) {
            recentBotCommentsRef.current.push(reaction.spokenComment);
            if (recentBotCommentsRef.current.length > 6) {
              recentBotCommentsRef.current.shift();
            }
            speakReaction(reaction.spokenComment);
          }

          if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
          reactionTimeoutRef.current = setTimeout(() => {
            setActiveReaction(null);
            setCurrentEmotion('watching');
          }, 6500);
        }
      } catch (err) {
        console.warn('Reaction error:', err);
      }
    },
    [botSettings, currentVideo, speakReaction]
  );

  // Handle Intelligent Video Frame Analysis
  const handleFrameAnalyzed = useCallback(
    async (sample: any, scene?: SceneMetadata) => {
      if (!privacySettings.visualAnalysisEnabled) return;

      try {
        const res = await api.analyzeFrame({
          imageBase64: sample.base64Image,
          videoContext: {
            videoId: currentVideo.id,
            videoTitle: currentVideo.title,
            timestamp: sample.timestamp,
            currentScene: scene,
          },
        });

        if (res.analyzed) {
          // If frame triggered a taste signal and memory is ON, show transparency toast!
          if (res.learnedTasteSignal && privacySettings.personalMemory) {
            const newTrait = `${res.learnedTasteSignal.visualStyle} (${res.learnedTasteSignal.theme})`;

            setActiveMemoryToast({
              id: `toast_${Date.now()}`,
              botName: botSettings.name,
              message: `${botSettings.name} noticed you enjoy ${newTrait}.`,
              onKeep: () => {
                api.addMemoryItem({
                  key: `pref_${Date.now()}`,
                  category: 'visual_style',
                  value: newTrait,
                  reason: `Discovered during ${currentVideo.title}`,
                });
                loadData();
              },
              onRemove: () => {
                // Ignore
              },
            });
          }
        }
      } catch (err) {
        console.warn('Frame analysis error:', err);
      }
    },
    [privacySettings, currentVideo, botSettings.name, loadData]
  );

  // User Direct Taste Feedback (Requirement 14: 👍, 👎, ❤️, 🚫)
  const handleUserFeedback = async (
    signalType: 'like' | 'dislike' | 'love' | 'not_interested'
  ) => {
    try {
      const res = await api.sendTasteSignal({
        videoId: currentVideo.id,
        videoTitle: currentVideo.title,
        signalType,
        category: currentVideo.category,
        genres: currentVideo.genres,
        themes: currentVideo.themes,
        visualStyle: currentVideo.visualStyles?.[0] || 'Cinematic',
        sourceReason: `Direct user rating of ${signalType} on ${currentVideo.title}`,
      });

      if (res?.updatedProfile) {
        setTasteProfile(res.updatedProfile);
      }

      // Companion emotional response to user feedback
      if (signalType === 'love' || signalType === 'like') {
        setCurrentEmotion('excited');
        setActiveReaction({
          id: `react_${Date.now()}`,
          emotion: 'excited',
          reactionLevel: 'NORMAL',
          spokenComment: `Awesome! I'll remember you like ${currentVideo.genres[0]} vibes.`,
          internalThought: 'User gave positive taste signal',
        });
        speakReaction(`Awesome! I'll remember you like this.`);
      } else {
        setCurrentEmotion('thinking');
        setActiveReaction({
          id: `react_${Date.now()}`,
          emotion: 'thinking',
          reactionLevel: 'SUBTLE',
          spokenComment: "Got it! I'll tune future suggestions away from this.",
          internalThought: 'User gave negative taste filter',
        });
      }

      setTimeout(() => {
        setActiveReaction(null);
        setCurrentEmotion('watching');
      }, 4500);

      loadData();
    } catch (err) {
      console.warn('Feedback signal error:', err);
    }
  };

  // Chat message send handler
  const handleSendChatMessage = async (text: string) => {
    setIsThinking(true);
    setCurrentEmotion('thinking');

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await api.sendChatMessage({
        userMessage: text,
        videoContext: {
          videoId: currentVideo.id,
          videoTitle: currentVideo.title,
          timestamp: 30, // active playback time
          currentScene: activeScene,
        },
        recentHistory: chatMessages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
      });

      setIsThinking(false);
      setCurrentEmotion(response.emotion || 'talking');

      const botMsg: ChatMessage = {
        id: `msg_b_${Date.now()}`,
        sender: 'bot',
        text: response.botReply,
        timestamp: new Date().toISOString(),
        emotion: response.emotion,
        memorySignal: response.suggestedMemory
          ? {
              suggestedMemory: response.suggestedMemory.value,
              category: response.suggestedMemory.category,
              status: 'pending',
            }
          : undefined,
      };

      setChatMessages((prev) => [...prev, botMsg]);
      speakReaction(response.botReply);
    } catch (err) {
      setIsThinking(false);
      setCurrentEmotion('watching');
      console.warn('Chat send error:', err);
    }
  };

  // Custom Video Upload handler
  const handleUploadCustomVideo = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    const customItem: VideoItem = {
      id: `custom_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      category: 'User Upload',
      duration: 300,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80',
      videoUrl: objectUrl,
      description: `Locally uploaded video file: ${file.name}`,
      genres: ['Custom', 'User File'],
      themes: ['User Content'],
      visualStyles: ['Custom Footage'],
      isCustomUpload: true,
      chapters: [{ time: 0, title: 'Start' }],
    };

    setPlaylist((prev) => [customItem, ...prev]);
    setCurrentVideo(customItem);
  };

  // Custom Video URL handler
  const handleCustomUrlVideo = (url: string, title: string) => {
    const customItem: VideoItem = {
      id: `stream_${Date.now()}`,
      title: title || 'Custom Web Stream',
      category: 'Live Stream / URL',
      duration: 300,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
      videoUrl: url,
      description: `Stream loaded from URL: ${url}`,
      genres: ['Stream'],
      themes: ['Web Stream'],
      visualStyles: ['Digital Stream'],
      isCustomUpload: true,
    };

    setPlaylist((prev) => [customItem, ...prev]);
    setCurrentVideo(customItem);
  };

  // Delete all data (GDPR requirement 12)
  const handleDeleteAllData = async () => {
    await api.deleteAllMemory();
    setMemoryItems([]);
    setTasteSignals([]);
    setViewingHistory([]);
    setChatMessages([]);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        privacySettings={privacySettings}
        botSettings={botSettings}
        aiStatus={aiStatus}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        {currentTab === 'watch' && (
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
            {/* Recommendation Prompt / Two Friends Header */}
            {tasteProfile.totalVideosWatched > 1 &&
              privacySettings.useHistoryForRecommendations && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 backdrop-blur-md flex items-center justify-between text-xs text-cyan-200">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span>
                      <strong>{botSettings.name}'s Insight:</strong> "You seem to really enjoy{' '}
                      {Object.keys(tasteProfile.genres)[0] || 'sci-fi'} with{' '}
                      {Object.keys(tasteProfile.visualPreferences)[0] || 'vibrant'} aesthetics!"
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentTab('taste')}
                    className="font-bold underline hover:text-white"
                  >
                    View Taste Radar →
                  </button>
                </div>
              )}

            {/* Video Player Component */}
            <VideoPlayer
              currentVideo={currentVideo}
              onVideoSelect={(v) => {
                setCurrentVideo(v);
                setActiveScene(v.scenes?.[0]);
              }}
              playlist={playlist}
              onUploadCustomVideo={handleUploadCustomVideo}
              onCustomUrlVideo={handleCustomUrlVideo}
              onFrameAnalyzed={handleFrameAnalyzed}
              onSceneChange={handleSceneChange}
              onUserFeedback={handleUserFeedback}
              visualAnalysisEnabled={privacySettings.visualAnalysisEnabled}
              activeReaction={activeReaction}
              botName={botSettings.name}
            />
          </div>
        )}

        {currentTab === 'taste' && (
          <TasteProfileView
            tasteProfile={tasteProfile}
            signals={tasteSignals}
            memories={memoryItems}
            onDeleteMemory={async (id) => {
              await api.deleteMemoryItem(id);
              loadData();
            }}
            onRefresh={loadData}
          />
        )}

        {currentTab === 'studio' && (
          <BotStudio
            botSettings={botSettings}
            onSaveBotSettings={async (updated) => {
              const res = await api.updateBotProfile(updated);
              setBotSettings(res);
            }}
            onTestVoice={(text, s) => {
              speechService.speak(text, {
                voiceURI: s.voiceVoiceURI,
                rate: s.voiceSpeed,
                pitch: s.voicePitch,
              });
            }}
          />
        )}

        {currentTab === 'privacy' && (
          <PrivacyMemoryCenter
            privacySettings={privacySettings}
            onUpdatePrivacy={async (partial) => {
              const res = await api.updatePrivacySettings(partial);
              setPrivacySettings(res);
            }}
            onDeleteAllData={handleDeleteAllData}
            totalMemoriesCount={memoryItems.length}
          />
        )}

        {currentTab === 'history' && (
          <ViewingHistoryView
            history={viewingHistory}
            onPlayVideoById={(vId) => {
              const found = playlist.find((v) => v.id === vId);
              if (found) {
                setCurrentVideo(found);
                setCurrentTab('watch');
              }
            }}
          />
        )}

        {currentTab === 'config' && (
          <AiConfigModal status={aiStatus} onStatusUpdated={loadData} />
        )}
      </main>

      {/* Visual AI Animated Companion (Always Present on screen) */}
      <CompanionAvatar
        botSettings={botSettings}
        privacySettings={privacySettings}
        currentEmotion={currentEmotion}
        activeReaction={activeReaction}
        onUpdateBotSettings={async (partial) => {
          const res = await api.updateBotProfile(partial);
          setBotSettings(res);
        }}
        onUpdatePrivacy={async (partial) => {
          const res = await api.updatePrivacySettings(partial);
          setPrivacySettings(res);
        }}
        onOpenChat={() => setIsChatOpen(true)}
        onUserFeedback={handleUserFeedback}
        onResetConversation={() => {
          api.clearChatHistory();
          setChatMessages([]);
        }}
        onOpenStudio={() => setCurrentTab('studio')}
        onOpenMemoryCenter={() => setCurrentTab('privacy')}
        videoPlaying={videoPlaying}
      />

      {/* Companion Dialogue Drawer */}
      <CompanionChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        botSettings={botSettings}
        privacySettings={privacySettings}
        currentScene={activeScene}
        currentVideoTitle={currentVideo.title}
        currentTimestamp={25}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        onClearHistory={async () => {
          await api.clearChatHistory();
          setChatMessages([]);
        }}
        onAcceptMemory={async (mem) => {
          await api.addMemoryItem(mem);
          loadData();
        }}
        isThinking={isThinking}
        isSpeaking={isSpeaking}
        videoPlaying={videoPlaying}
      />

      {/* Memory Transparency Update Notification (Requirement 27) */}
      <MemoryToast
        toast={activeMemoryToast}
        onDismiss={() => setActiveMemoryToast(null)}
      />
    </div>
  );
};

export default App;
