import React, { useState, useMemo } from 'react';
import { SceneMetadata, TranscriptCue } from '../../types/index.js';
import { Bookmark, MessageSquareQuote, Search, Clock, Sparkles, X, ChevronRight } from 'lucide-react';

interface ChapterBookmarksProps {
  scenes: SceneMetadata[];
  activeScene?: SceneMetadata;
  transcript?: TranscriptCue[];
  currentTimestamp: number;
  duration: number;
  onSeekToScene: (scene: SceneMetadata) => void;
  onSeekToTime?: (seconds: number) => void;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const ChapterBookmarks: React.FC<ChapterBookmarksProps> = ({
  scenes = [],
  activeScene,
  transcript = [],
  currentTimestamp,
  duration,
  onSeekToScene,
  onSeekToTime,
}) => {
  const [activeTab, setActiveTab] = useState<'chapters' | 'transcript'>('chapters');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transcript cues based on search query
  const filteredTranscript = useMemo(() => {
    if (!transcript || transcript.length === 0) return [];
    if (!searchQuery.trim()) return transcript;
    const q = searchQuery.toLowerCase().trim();
    return transcript.filter(
      (cue) =>
        cue.text.toLowerCase().includes(q) ||
        (cue.speaker && cue.speaker.toLowerCase().includes(q))
    );
  }, [transcript, searchQuery]);

  // If there are neither scenes nor transcript cues, hide the container
  if ((!scenes || scenes.length === 0) && (!transcript || transcript.length === 0)) {
    return null;
  }

  return (
    <div className="w-full flex flex-col space-y-2.5 p-3 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
      {/* Header and Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center space-x-2">
          {scenes.length > 0 && (
            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'chapters'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>Scene Chapters</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {scenes.length}
              </span>
            </button>
          )}

          {transcript.length > 0 && (
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'transcript'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transcript & Dialogue</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {transcript.length}
              </span>
            </button>
          )}
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{formatTime(currentTimestamp)}</span>
          <span className="text-slate-600">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Mode: Scene Chapters */}
      {activeTab === 'chapters' && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
          {scenes.map((scene, idx) => {
            const isActive =
              activeScene?.sceneName === scene.sceneName &&
              activeScene?.startTime === scene.startTime;
            return (
              <button
                key={`${scene.sceneName}-${idx}`}
                onClick={() => {
                  onSeekToScene(scene);
                  if (onSeekToTime) onSeekToTime(scene.startTime);
                }}
                className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs transition-all active:scale-95 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/15'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-[11px] truncate max-w-[130px]">
                    {scene.sceneName}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-mono">
                    <span>{formatTime(scene.startTime)}</span>
                    {scene.mood && (
                      <span className="text-cyan-400/80 capitalize">• {scene.mood}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Mode: Searchable Transcript Dialogue */}
      {activeTab === 'transcript' && (
        <div className="flex flex-col space-y-2">
          {/* Search bar */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dialogue phrases, speech, or speakers..."
              className="w-full pl-8 pr-8 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Transcript Cues List */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {filteredTranscript.length > 0 ? (
              filteredTranscript.map((cue, idx) => {
                const isCurrent =
                  currentTimestamp >= cue.start && currentTimestamp <= cue.end;
                return (
                  <div
                    key={`cue-${idx}`}
                    onClick={() => onSeekToTime && onSeekToTime(cue.start)}
                    className={`group flex items-start space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200'
                        : 'bg-slate-950/40 hover:bg-slate-800/60 border-white/5 hover:border-white/10 text-slate-300'
                    }`}
                  >
                    <button
                      className="flex-shrink-0 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-slate-800/80 border border-white/5 font-mono text-[10px] text-cyan-300 hover:bg-cyan-500/30"
                      title="Jump video to this timestamp"
                    >
                      <span>{formatTime(cue.start)}</span>
                      <ChevronRight className="w-2.5 h-2.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="flex-1 flex flex-col">
                      {cue.speaker && (
                        <span className="text-[10px] font-semibold text-cyan-400/90 tracking-wide uppercase">
                          {cue.speaker}
                        </span>
                      )}
                      <p className="text-xs leading-relaxed text-slate-200 group-hover:text-white">
                        {cue.text}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-slate-500">
                {searchQuery
                  ? `No dialogue matches found for "${searchQuery}"`
                  : 'No dialogue transcript cues indexed for this video.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
