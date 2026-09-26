import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Heart, EyeOff, BookmarkPlus, X } from 'lucide-react';
import { BotReaction } from '../../types/index.js';

interface SpeechBubbleProps {
  reaction: BotReaction | null;
  botName: string;
  onDismiss: () => void;
  onUserFeedback: (type: 'like' | 'dislike' | 'love' | 'not_interested') => void;
  onRememberPreference?: () => void;
  memorySuggestion?: { text: string; category: string } | null;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  reaction,
  botName,
  onDismiss,
  onUserFeedback,
  onRememberPreference,
  memorySuggestion,
}) => {
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);

  useEffect(() => {
    setFeedbackSent(null);
  }, [reaction?.id]);

  if (!reaction && !memorySuggestion) return null;

  const textToDisplay = memorySuggestion
    ? `Would you like me to remember that you prefer "${memorySuggestion.text}"?`
    : reaction?.spokenComment;

  if (!textToDisplay) return null;

  return (
    <div className="relative max-w-xs md:max-w-sm mb-3 z-30 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Speech Bubble Container with glassmorphism */}
      <div className="relative p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-2xl shadow-cyan-950/40 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300">
              {botName}
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bubble text */}
        <p className="text-sm font-normal text-slate-200 leading-snug">
          "{textToDisplay}"
        </p>

        {/* Memory remember question if present */}
        {memorySuggestion && onRememberPreference && (
          <div className="mt-3 pt-2.5 border-t border-purple-500/20 flex items-center justify-end space-x-2">
            <button
              onClick={onDismiss}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Not now
            </button>
            <button
              onClick={() => {
                onRememberPreference();
                onDismiss();
              }}
              className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-md shadow-purple-600/30 transition-all transform active:scale-95"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Remember</span>
            </button>
          </div>
        )}

        {/* User Reaction Feedback Toolbar (Requirement 14) */}
        {!memorySuggestion && (
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-mono tracking-tight">
              {feedbackSent ? `Thanks for feedback!` : 'Teach companion:'}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  onUserFeedback('like');
                  setFeedbackSent('like');
                }}
                className={`p-1 rounded-md text-xs transition-all ${
                  feedbackSent === 'like'
                    ? 'bg-cyan-500/30 text-cyan-300'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
                }`}
                title="Like this reaction"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onUserFeedback('love');
                  setFeedbackSent('love');
                }}
                className={`p-1 rounded-md text-xs transition-all ${
                  feedbackSent === 'love'
                    ? 'bg-rose-500/30 text-rose-300'
                    : 'text-slate-400 hover:text-rose-400 hover:bg-white/5'
                }`}
                title="Love this reaction"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onUserFeedback('dislike');
                  setFeedbackSent('dislike');
                }}
                className={`p-1 rounded-md text-xs transition-all ${
                  feedbackSent === 'dislike'
                    ? 'bg-amber-500/30 text-amber-300'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-white/5'
                }`}
                title="Dislike reaction"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  onUserFeedback('not_interested');
                  setFeedbackSent('not_interested');
                }}
                className={`p-1 rounded-md text-xs transition-all ${
                  feedbackSent === 'not_interested'
                    ? 'bg-slate-700 text-slate-300'
                    : 'text-slate-400 hover:text-red-400 hover:bg-white/5'
                }`}
                title="Not interested in this topic"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Small tail pointing to the bot */}
        <div className="absolute -bottom-2 right-8 w-4 h-4 bg-slate-900/90 border-r border-b border-cyan-500/30 transform rotate-45" />
      </div>
    </div>
  );
};
