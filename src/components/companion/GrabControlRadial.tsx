import React from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Eye,
  EyeOff,
  Database,
  Brain,
  Sparkles,
  Settings,
  RotateCcw,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import { BotSettings, PrivacySettings } from '../../types/index.js';

interface GrabControlRadialProps {
  isOpen: boolean;
  onClose: () => void;
  botSettings: BotSettings;
  privacySettings: PrivacySettings;
  onUpdateBotSettings: (partial: Partial<BotSettings>) => void;
  onUpdatePrivacy: (partial: Partial<PrivacySettings>) => void;
  onResetConversation: () => void;
  onOpenSettingsModal: () => void;
  onOpenMemoryModal: () => void;
}

export const GrabControlRadial: React.FC<GrabControlRadialProps> = ({
  isOpen,
  onClose,
  botSettings,
  privacySettings,
  onUpdateBotSettings,
  onUpdatePrivacy,
  onResetConversation,
  onOpenSettingsModal,
  onOpenMemoryModal,
}) => {
  if (!isOpen) return null;

  const cyclePersonality = () => {
    const presets: BotSettings['personality'][] = [
      'Friendly',
      'Funny',
      'Calm',
      'Curious',
      'Enthusiastic',
      'Analytical',
      'Sarcastic',
      'Supportive',
    ];
    const currentIndex = presets.indexOf(botSettings.personality);
    const nextIndex = (currentIndex + 1) % presets.length;
    onUpdateBotSettings({ personality: presets[nextIndex] });
  };

  const cycleStorageMode = () => {
    const modes: PrivacySettings['dataStorageMode'][] = [
      'session_only',
      'personal_memory',
      'no_storage',
    ];
    const currentIndex = modes.indexOf(privacySettings.dataStorageMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onUpdatePrivacy({ dataStorageMode: modes[nextIndex] });
  };

  // Radial menu item definitions
  const items = [
    {
      id: 'mute',
      label: botSettings.isMuted ? 'Unmute' : 'Mute Voice',
      icon: botSettings.isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />,
      action: () => onUpdateBotSettings({ isMuted: !botSettings.isMuted }),
      active: botSettings.isMuted,
    },
    {
      id: 'pause_reactions',
      label: botSettings.reactionsPaused ? 'Resume Reactions' : 'Pause Reactions',
      icon: botSettings.reactionsPaused ? <Play className="w-5 h-5 text-amber-400" /> : <Pause className="w-5 h-5 text-cyan-400" />,
      action: () => onUpdateBotSettings({ reactionsPaused: !botSettings.reactionsPaused }),
      active: botSettings.reactionsPaused,
    },
    {
      id: 'visual_analysis',
      label: privacySettings.visualAnalysisEnabled ? 'Vision ON' : 'Vision OFF',
      icon: privacySettings.visualAnalysisEnabled ? <Eye className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-slate-500" />,
      action: () => onUpdatePrivacy({ visualAnalysisEnabled: !privacySettings.visualAnalysisEnabled }),
      active: privacySettings.visualAnalysisEnabled,
    },
    {
      id: 'memory_toggle',
      label: privacySettings.personalMemory ? 'Memory ON' : 'Memory OFF',
      icon: <Brain className={`w-5 h-5 ${privacySettings.personalMemory ? 'text-purple-400' : 'text-slate-500'}`} />,
      action: () => onUpdatePrivacy({ personalMemory: !privacySettings.personalMemory }),
      active: privacySettings.personalMemory,
    },
    {
      id: 'storage_mode',
      label: `Storage: ${privacySettings.dataStorageMode === 'session_only' ? 'Session' : privacySettings.dataStorageMode === 'personal_memory' ? 'Saved' : 'None'}`,
      icon: <Database className="w-5 h-5 text-amber-400" />,
      action: cycleStorageMode,
      active: privacySettings.dataStorageMode === 'personal_memory',
    },
    {
      id: 'personality',
      label: `Mood: ${botSettings.personality}`,
      icon: <Sparkles className="w-5 h-5 text-pink-400" />,
      action: cyclePersonality,
      active: true,
    },
    {
      id: 'lock_pos',
      label: botSettings.isLocked ? 'Position Locked' : 'Unlocked',
      icon: botSettings.isLocked ? <Lock className="w-5 h-5 text-amber-400" /> : <Unlock className="w-5 h-5 text-cyan-400" />,
      action: () => onUpdateBotSettings({ isLocked: !botSettings.isLocked }),
      active: botSettings.isLocked,
    },
    {
      id: 'reset_chat',
      label: 'Reset Chat',
      icon: <RotateCcw className="w-5 h-5 text-blue-400" />,
      action: () => {
        onResetConversation();
        onClose();
      },
      active: false,
    },
    {
      id: 'settings',
      label: 'Companion Studio',
      icon: <Settings className="w-5 h-5 text-slate-200" />,
      action: () => {
        onOpenSettingsModal();
        onClose();
      },
      active: false,
    },
  ];

  // Distribute items in a circle around the bot
  const radius = 135;
  const total = items.length;

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
      {/* Backdrop overlay to catch outside clicks */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Center glowing ring */}
      <div className="relative pointer-events-auto flex items-center justify-center">
        <div className="absolute w-72 h-72 rounded-full border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-md animate-pulse-glow" />

        {/* Center Close / Dismiss button */}
        <button
          onClick={onClose}
          className="absolute z-20 w-12 h-12 rounded-full bg-slate-900/90 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all transform hover:scale-110 active:scale-95"
          title="Close Quick Control Menu"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Orbiting radial buttons */}
        {items.map((item, idx) => {
          const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
          const x = Math.round(Math.cos(angle) * radius);
          const y = Math.round(Math.sin(angle) * radius);

          return (
            <div
              key={item.id}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              className="absolute z-10 flex flex-col items-center justify-center transition-all duration-300 ease-out"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
                }}
                className={`group flex items-center justify-center w-12 h-12 rounded-2xl border backdrop-blur-lg shadow-xl transition-all duration-200 transform hover:scale-115 active:scale-90 ${
                  item.active
                    ? 'bg-slate-900/90 border-cyan-400/60 shadow-cyan-500/30'
                    : 'bg-slate-950/80 border-white/10 hover:border-white/30 text-slate-300'
                }`}
                title={item.label}
              >
                {item.icon}

                {/* Tooltip badge */}
                <span className="absolute -bottom-7 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-900/95 border border-white/10 text-[10px] font-medium tracking-wide text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                  {item.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
