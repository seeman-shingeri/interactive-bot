import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  X,
  BookmarkPlus,
  Bot,
  User,
  Radio,
} from 'lucide-react';
import {
  ChatMessage,
  BotSettings,
  PrivacySettings,
  SceneMetadata,
  TasteProfile,
  MemoryItem,
} from '../../types/index.js';
import { speechService } from '../../services/speech.js';

interface CompanionChatProps {
  isOpen: boolean;
  onClose: () => void;
  botSettings: BotSettings;
  privacySettings: PrivacySettings;
  currentScene?: SceneMetadata;
  currentVideoTitle: string;
  currentTimestamp: number;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: () => void;
  onAcceptMemory: (memory: { key: string; category: MemoryItem['category']; value: string; reason: string }) => void;
  isThinking: boolean;
  isSpeaking: boolean;
  videoPlaying: boolean;
}

export const CompanionChat: React.FC<CompanionChatProps> = ({
  isOpen,
  onClose,
  botSettings,
  privacySettings,
  currentScene,
  currentVideoTitle,
  currentTimestamp,
  messages,
  onSendMessage,
  onClearHistory,
  onAcceptMemory,
  isThinking,
  isSpeaking,
  videoPlaying,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isThinking) return;
    setInputText('');
    await onSendMessage(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Push-to-Talk Mic Handler
  const toggleListening = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
    } else {
      setSpeechError(null);
      speechService.startListening({
        onResult: (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            setIsRecording(false);
            handleSend(transcript);
          }
        },
        onError: (err) => {
          console.warn('Speech recognition error:', err);
          setSpeechError('Microphone access denied or not available.');
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        },
      });
      setIsRecording(true);
    }
  };

  // Quick Prompt Suggestions (Requirement 16)
  const quickPrompts = [
    'What just happened?',
    'Who is that?',
    'What do you think about this scene?',
    'Did you notice that detail?',
    'Would I probably like this?',
    'Have we watched something similar?',
  ];

  // Current status indicator (Requirement 16)
  const getStatusIndicator = () => {
    if (!privacySettings.personalMemory) {
      return {
        label: 'Memory Off',
        color: 'bg-amber-400',
        textColor: 'text-amber-300',
        border: 'border-amber-500/30',
      };
    }
    if (isThinking) {
      return {
        label: 'Thinking...',
        color: 'bg-purple-400 animate-pulse',
        textColor: 'text-purple-300',
        border: 'border-purple-500/30',
      };
    }
    if (isSpeaking) {
      return {
        label: 'Speaking',
        color: 'bg-blue-400 animate-pulse',
        textColor: 'text-blue-300',
        border: 'border-blue-500/30',
      };
    }
    if (videoPlaying) {
      return {
        label: 'Watching Together',
        color: 'bg-emerald-400',
        textColor: 'text-emerald-300',
        border: 'border-emerald-500/30',
      };
    }
    return {
      label: 'Paused',
      color: 'bg-slate-400',
      textColor: 'text-slate-300',
      border: 'border-slate-500/30',
    };
  };

  const status = getStatusIndicator();

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950/95 border-l border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold shadow-md shadow-cyan-500/30">
            <Bot className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                {botSettings.name}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {botSettings.personality}
              </span>
            </div>
            {/* Real-time Status Badge */}
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
              <span className={`text-[10px] font-medium tracking-tight ${status.textColor}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synchronized Content Context Header */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5 truncate max-w-[240px]">
          <Radio className="w-3 h-3 text-cyan-400 flex-shrink-0 animate-pulse" />
          <span className="truncate">{currentVideoTitle}</span>
        </div>
        <span className="font-mono text-cyan-300">
          {Math.floor(currentTimestamp / 60)}:
          {(Math.floor(currentTimestamp) % 60).toString().padStart(2, '0')}
        </span>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <Sparkles className="w-8 h-8 text-cyan-400/60" />
            <p className="text-xs font-medium text-slate-300">
              Watching alongside you!
            </p>
            <p className="text-[11px] text-slate-500">
              Ask {botSettings.name} about what's happening on screen or tap a quick prompt below.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}

              {/* Memory Suggestion confirmation card */}
              {msg.memorySignal && msg.memorySignal.status === 'pending' && (
                <div className="mt-2.5 pt-2 border-t border-purple-500/20 bg-purple-950/20 p-2 rounded-xl flex flex-col space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-purple-300 font-semibold text-[10px]">
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Remember preference?</span>
                  </div>
                  <p className="text-[10px] text-purple-200">
                    "{msg.memorySignal.suggestedMemory}"
                  </p>
                  <div className="flex items-center justify-end space-x-1.5 pt-1">
                    <button
                      onClick={() =>
                        onAcceptMemory({
                          key: `pref_${Date.now()}`,
                          category: msg.memorySignal!.category,
                          value: msg.memorySignal!.suggestedMemory,
                          reason: 'Accepted from companion conversation',
                        })
                      }
                      className="px-2.5 py-0.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-[10px] transition-colors"
                    >
                      Save to Memory
                    </button>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 px-3 rounded-2xl bg-slate-900/60 border border-white/5 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{botSettings.name} is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-white/10 bg-slate-950/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            disabled={isThinking}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 text-[11px] transition-all flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Speech / Mic Error Alert if any */}
      {speechError && (
        <div className="px-4 py-1.5 bg-rose-950/80 border-t border-rose-500/30 text-[11px] text-rose-300 flex items-center justify-between">
          <span>{speechError}</span>
          <button onClick={() => setSpeechError(null)} className="p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Input Form & Push-to-Talk Toolbar */}
      <div className="p-3 border-t border-white/10 bg-slate-900/80">
        <div className="flex items-center space-x-2">
          {/* Push to Talk Mic Button (Requirement 17) */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl border transition-all ${
              isRecording
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/40'
                : 'bg-slate-950 text-slate-400 hover:text-cyan-300 border-white/10 hover:border-cyan-400/40'
            }`}
            title={isRecording ? 'Listening... click to send' : 'Push to talk with microphone'}
          >
            {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={`Chat with ${botSettings.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition-all shadow-md shadow-cyan-600/30"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
