import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BotEmotion, BotSettings, PrivacySettings, BotReaction } from '../../types/index.js';
import { GrabControlRadial } from './GrabControlRadial.js';
import { SpeechBubble } from './SpeechBubble.js';
import { Sparkles, MessageSquare, Maximize2, Minimize2, Eye, EyeOff } from 'lucide-react';

interface CompanionAvatarProps {
  botSettings: BotSettings;
  privacySettings: PrivacySettings;
  currentEmotion: BotEmotion;
  activeReaction: BotReaction | null;
  onUpdateBotSettings: (partial: Partial<BotSettings>) => void;
  onUpdatePrivacy: (partial: Partial<PrivacySettings>) => void;
  onOpenChat: () => void;
  onUserFeedback: (type: 'like' | 'dislike' | 'love' | 'not_interested') => void;
  onRememberPreference?: () => void;
  onResetConversation: () => void;
  onOpenStudio: () => void;
  onOpenMemoryCenter: () => void;
  memorySuggestion?: { text: string; category: string } | null;
  videoPlaying: boolean;
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  botSettings,
  privacySettings,
  currentEmotion,
  activeReaction,
  onUpdateBotSettings,
  onUpdatePrivacy,
  onOpenChat,
  onUserFeedback,
  onRememberPreference,
  onResetConversation,
  onOpenStudio,
  onOpenMemoryCenter,
  memorySuggestion,
  videoPlaying,
}) => {
  // Grab / Hold state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const [isControlModeOpen, setIsControlModeOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Position coordinates (for floating/dragged mode)
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Eye tracking & blinking
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });

  // Blinking loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle cursor eye tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current || currentEmotion === 'sleeping') return;
      const rect = avatarRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      setEyeOffset({
        x: Math.max(-4, Math.min(4, dx * 6)),
        y: Math.max(-3, Math.min(3, dy * 4)),
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [currentEmotion]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Pointer Down -> Start Hold detection (approx 2 seconds for Control Mode)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (botSettings.isLocked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const currentElemRect = avatarRef.current?.getBoundingClientRect();
    const initialX = coords?.x ?? currentElemRect?.left ?? window.innerWidth - 180;
    const initialY = coords?.y ?? currentElemRect?.top ?? window.innerHeight - 260;

    dragStartRef.current = { startX, startY, initialX, initialY };

    // Start 2000ms hold timer
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const holdDuration = 2000;

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / holdDuration) * 100);
      setHoldProgress(progress);
    }, 25);

    holdTimerRef.current = setTimeout(() => {
      // 2 seconds reached! Enter Control Mode
      clearInterval(holdIntervalRef.current!);
      setIsHolding(false);
      setHoldProgress(0);
      setIsControlModeOpen(true);
      if ('vibrate' in navigator) navigator.vibrate(50);
    }, holdDuration);
  };

  // Pointer Move -> Dragging check
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    // If moved more than 8 pixels, treat as drag and cancel hold timer
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      setIsHolding(false);
      setHoldProgress(0);
      setIsDragging(true);

      // Update position
      const newX = Math.max(10, Math.min(window.innerWidth - 140, dragStartRef.current.initialX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 180, dragStartRef.current.initialY + dy));
      setCoords({ x: newX, y: newY });
    }
  };

  // Pointer Up -> End Hold or Click
  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    const wasDragging = isDragging;
    setIsHolding(false);
    setHoldProgress(0);
    setIsDragging(false);
    dragStartRef.current = null;

    // If it was a short tap without drag or control mode, open companion chat!
    if (!wasDragging && !isControlModeOpen) {
      onOpenChat();
    }
  };

  if (!botSettings.isVisible) {
    return (
      <button
        onClick={() => onUpdateBotSettings({ isVisible: true })}
        className="fixed bottom-6 right-6 z-40 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-300 text-xs font-medium shadow-lg hover:bg-cyan-500 hover:text-black transition-all flex items-center space-x-1.5 backdrop-blur-md"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Unhide {botSettings.name}</span>
      </button>
    );
  }

  // Size styling
  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40',
  }[botSettings.size];

  // Color theming
  const colorGradients = {
    cyan: {
      core: 'from-cyan-400 to-blue-600',
      glow: 'shadow-cyan-500/30',
      border: 'border-cyan-400/40',
      eye: '#00f0ff',
      accent: 'text-cyan-400',
    },
    purple: {
      core: 'from-purple-400 to-indigo-600',
      glow: 'shadow-purple-500/30',
      border: 'border-purple-400/40',
      eye: '#c084fc',
      accent: 'text-purple-400',
    },
    gold: {
      core: 'from-amber-400 to-orange-500',
      glow: 'shadow-amber-500/30',
      border: 'border-amber-400/40',
      eye: '#fbbf24',
      accent: 'text-amber-400',
    },
    emerald: {
      core: 'from-emerald-400 to-teal-600',
      glow: 'shadow-emerald-500/30',
      border: 'border-emerald-400/40',
      eye: '#34d399',
      accent: 'text-emerald-400',
    },
    rose: {
      core: 'from-rose-400 to-pink-600',
      glow: 'shadow-rose-500/30',
      border: 'border-rose-400/40',
      eye: '#fb7185',
      accent: 'text-rose-400',
    },
  }[botSettings.avatarColor || 'cyan'];

  // Emotion-specific character postures & accessories
  const emotionConfig = {
    idle: {
      animation: 'animate-float',
      tilt: 'rotate-0',
      statusColor: 'bg-cyan-400',
      statusText: 'Watching peacefully',
    },
    watching: {
      animation: 'animate-float',
      tilt: '-rotate-2',
      statusColor: 'bg-cyan-400',
      statusText: 'Watching screen',
    },
    attentive: {
      animation: 'translate-y-[-4px] scale-[1.03]',
      tilt: 'rotate-1',
      statusColor: 'bg-emerald-400',
      statusText: 'Intently focused',
    },
    talking: {
      animation: 'animate-pulse',
      tilt: 'rotate-1',
      statusColor: 'bg-blue-400',
      statusText: 'Speaking',
    },
    excited: {
      animation: 'animate-bounce',
      tilt: 'rotate-3',
      statusColor: 'bg-amber-400',
      statusText: 'Excited!',
    },
    laughing: {
      animation: 'animate-bounce',
      tilt: '-rotate-3',
      statusColor: 'bg-pink-400',
      statusText: 'Laughing',
    },
    thinking: {
      animation: 'animate-float',
      tilt: 'rotate-6',
      statusColor: 'bg-purple-400',
      statusText: 'Pondering scene',
    },
    confused: {
      animation: 'animate-float',
      tilt: '-rotate-8',
      statusColor: 'bg-orange-400',
      statusText: 'Confused?',
    },
    surprised: {
      animation: 'scale-110 -translate-y-3',
      tilt: 'rotate-0',
      statusColor: 'bg-rose-400',
      statusText: 'Surprised!',
    },
    sleeping: {
      animation: 'opacity-70 translate-y-2',
      tilt: 'rotate-4',
      statusColor: 'bg-slate-500',
      statusText: 'Dozing off',
    },
  }[currentEmotion];

  // Docking positions
  const getDockStyle = (): React.CSSProperties => {
    if (coords) {
      return {
        position: 'fixed',
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        opacity: botSettings.opacity,
      };
    }

    switch (botSettings.position) {
      case 'left':
        return {
          position: 'fixed',
          left: '32px',
          bottom: '120px',
          opacity: botSettings.opacity,
        };
      case 'bottom-corner':
        return {
          position: 'fixed',
          right: '32px',
          bottom: '32px',
          opacity: botSettings.opacity,
        };
      case 'floating':
        return {
          position: 'fixed',
          right: '80px',
          top: '35%',
          opacity: botSettings.opacity,
        };
      case 'right':
      default:
        return {
          position: 'fixed',
          right: '32px',
          bottom: '120px',
          opacity: botSettings.opacity,
        };
    }
  };

  return (
    <div
      ref={avatarRef}
      style={getDockStyle()}
      className={`z-40 flex flex-col items-center select-none touch-none transition-transform duration-200 ${
        isHolding ? 'scale-95' : ''
      }`}
    >
      {/* Active Speech / Reaction Bubble */}
      <SpeechBubble
        reaction={activeReaction}
        botName={botSettings.name}
        onDismiss={() => {}}
        onUserFeedback={onUserFeedback}
        onRememberPreference={onRememberPreference}
        memorySuggestion={memorySuggestion}
      />

      {/* Main Companion Body */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative cursor-pointer transition-all duration-300 ${sizeClasses} ${emotionConfig.tilt}`}
        title="Click to chat • Hold 2 seconds to grab & control"
      >
        {/* Grab Hold Charging SVG Ring (Progress 0% to 100%) */}
        {isHolding && (
          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] z-30 pointer-events-none rotate-[-90deg]">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="stroke-cyan-500/20"
              strokeWidth="5"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="stroke-cyan-400"
              strokeWidth="5"
              fill="none"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * holdProgress) / 100}
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* Ambient Halo Glow */}
        <div
          className={`absolute -inset-2 rounded-full bg-gradient-to-tr ${colorGradients.core} opacity-30 blur-xl ${
            videoPlaying ? 'animate-pulse-glow' : 'opacity-15'
          }`}
        />

        {/* Character Outer Helmet / Chassis */}
        <div
          className={`relative w-full h-full rounded-3xl bg-slate-950/90 border-2 ${colorGradients.border} shadow-2xl ${colorGradients.glow} backdrop-blur-xl flex flex-col items-center justify-center p-2.5 overflow-hidden transition-all duration-300`}
        >
          {/* Top Holographic Antenna / Ear Fins */}
          <div className="absolute top-1.5 flex items-center justify-between w-16 px-1">
            <div
              className={`w-2.5 h-1 rounded-full bg-gradient-to-r ${colorGradients.core} ${
                currentEmotion === 'surprised' ? '-rotate-45' : 'rotate-0'
              } transition-transform`}
            />
            <div
              className={`w-1.5 h-1.5 rounded-full ${emotionConfig.statusColor} shadow-sm shadow-cyan-400 animate-pulse`}
            />
            <div
              className={`w-2.5 h-1 rounded-full bg-gradient-to-r ${colorGradients.core} ${
                currentEmotion === 'surprised' ? 'rotate-45' : 'rotate-0'
              } transition-transform`}
            />
          </div>

          {/* Visor Screen */}
          <div className="relative w-full h-20 rounded-2xl bg-[#030712] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
            {/* Subtle Screen Scanline Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(#00ffff08_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

            {/* Expressive Eyes Engine */}
            {currentEmotion === 'sleeping' ? (
              // Sleeping straight lines
              <div className="flex items-center space-x-4">
                <div className="w-5 h-0.5 rounded-full bg-slate-400" />
                <div className="w-5 h-0.5 rounded-full bg-slate-400" />
              </div>
            ) : currentEmotion === 'laughing' ? (
              // Laughing crescent arches `^ ^`
              <div className="flex items-center space-x-3.5">
                <div className="w-5 h-3 border-t-2 border-l-2 border-r-2 border-cyan-300 rounded-t-full transform rotate-180" />
                <div className="w-5 h-3 border-t-2 border-l-2 border-r-2 border-cyan-300 rounded-t-full transform rotate-180" />
              </div>
            ) : currentEmotion === 'surprised' ? (
              // Surprised wide eyes `O O`
              <div className="flex items-center space-x-3.5">
                <div className="w-6 h-6 rounded-full border-2 border-cyan-300 flex items-center justify-center animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-cyan-300 flex items-center justify-center animate-pulse">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                </div>
              </div>
            ) : currentEmotion === 'thinking' ? (
              // Thinking spiral orbit
              <div className="flex items-center space-x-3.5">
                <div className="relative w-5 h-5 rounded-full border border-purple-400 flex items-center justify-center animate-spin-slow">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                </div>
                <div className="relative w-5 h-5 rounded-full border border-purple-400 flex items-center justify-center animate-spin-slow">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                </div>
              </div>
            ) : currentEmotion === 'excited' ? (
              // Excited star sparkles
              <div className="flex items-center space-x-3.5 text-amber-300">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>
            ) : (
              // Natural expressive eyes with cursor tracking & blinking
              <div
                style={{
                  transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
                }}
                className={`flex items-center space-x-3.5 transition-transform duration-100 ${
                  blink ? 'scale-y-[0.1]' : 'scale-y-100'
                }`}
              >
                {/* Left Eye */}
                <div className="relative w-4 h-6 rounded-full bg-slate-900 border border-cyan-400/60 shadow-sm shadow-cyan-400/50 flex items-center justify-center overflow-hidden">
                  <div
                    style={{ backgroundColor: colorGradients.eye }}
                    className="w-2.5 h-3.5 rounded-full shadow-inner animate-pulse"
                  />
                  <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white" />
                </div>

                {/* Right Eye */}
                <div className="relative w-4 h-6 rounded-full bg-slate-900 border border-cyan-400/60 shadow-sm shadow-cyan-400/50 flex items-center justify-center overflow-hidden">
                  <div
                    style={{ backgroundColor: colorGradients.eye }}
                    className="w-2.5 h-3.5 rounded-full shadow-inner animate-pulse"
                  />
                  <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-white" />
                </div>
              </div>
            )}

            {/* Speaking Audio Equalizer Wave if talking */}
            {currentEmotion === 'talking' && (
              <div className="absolute bottom-1.5 flex items-center space-x-0.5">
                <div className="w-1 h-2 bg-cyan-400 rounded animate-bounce" />
                <div className="w-1 h-3 bg-cyan-300 rounded animate-bounce [animation-delay:100ms]" />
                <div className="w-1 h-1.5 bg-cyan-400 rounded animate-bounce [animation-delay:200ms]" />
                <div className="w-1 h-3 bg-cyan-300 rounded animate-bounce [animation-delay:150ms]" />
              </div>
            )}
          </div>

          {/* Lower Chassis / Audio Core Reactor */}
          <div className="mt-2 flex items-center justify-between w-full px-1">
            <span className="text-[9px] font-mono tracking-wider uppercase text-slate-400 font-bold truncate max-w-[65px]">
              {botSettings.name}
            </span>
            <div className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${emotionConfig.statusColor}`} />
              <span className="text-[9px] text-slate-400 font-medium capitalize">
                {botSettings.personality}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Mini Controls Toolbar on Hover */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 group-hover:opacity-100 flex items-center space-x-1 bg-slate-900/90 border border-white/10 px-2 py-0.5 rounded-full shadow-md transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat();
            }}
            className="p-1 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Open Chat"
          >
            <MessageSquare className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsControlModeOpen(true);
            }}
            className="p-1 text-slate-300 hover:text-cyan-400 transition-colors"
            title="Open Radial Controls"
          >
            <Sparkles className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Radial Quick Control Menu Modal */}
      <GrabControlRadial
        isOpen={isControlModeOpen}
        onClose={() => setIsControlModeOpen(false)}
        botSettings={botSettings}
        privacySettings={privacySettings}
        onUpdateBotSettings={onUpdateBotSettings}
        onUpdatePrivacy={onUpdatePrivacy}
        onResetConversation={onResetConversation}
        onOpenSettingsModal={onOpenStudio}
        onOpenMemoryModal={onOpenMemoryCenter}
      />
    </div>
  );
};
