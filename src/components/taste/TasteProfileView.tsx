import React, { useState } from 'react';
import {
  Sparkles,
  Film,
  Palette,
  Compass,
  Gauge,
  Heart,
  Ban,
  HelpCircle,
  Trash2,
  TrendingUp,
  History,
  X,
  CheckCircle,
} from 'lucide-react';
import { TasteProfile, TasteSignal, MemoryItem } from '../../types/index.js';

interface TasteProfileViewProps {
  tasteProfile: TasteProfile;
  signals: TasteSignal[];
  memories: MemoryItem[];
  onDeleteMemory: (id: string) => void;
  onRefresh: () => void;
}

export const TasteProfileView: React.FC<TasteProfileViewProps> = ({
  tasteProfile,
  signals,
  memories,
  onDeleteMemory,
  onRefresh,
}) => {
  const [selectedExplain, setSelectedExplain] = useState<{
    title: string;
    score: number;
    explanation: string;
    matchingSignals: TasteSignal[];
  } | null>(null);

  // Helper to find signals supporting a trait
  const getExplanation = (traitName: string, score: number, type: 'genre' | 'theme' | 'visual') => {
    const matching = signals.filter(
      (s) =>
        s.genres.includes(traitName) ||
        s.themes.includes(traitName) ||
        s.visualStyle === traitName ||
        s.category === traitName
    );

    const posCount = matching.filter(
      (s) => s.signalType === 'like' || s.signalType === 'love' || s.signalType === 'watch_complete'
    ).length;

    const explanation = `VISTA identified this preference because you watched ${matching.length} video${
      matching.length === 1 ? '' : 's'
    } with this ${type} and gave ${posCount} positive signal${
      posCount === 1 ? '' : 's'
    }.`;

    setSelectedExplain({
      title: traitName,
      score,
      explanation,
      matchingSignals: matching,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900 border border-cyan-500/20 shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
                Visual Taste Intelligence
              </span>
              <span className="text-xs text-slate-400">
                Updated {new Date(tasteProfile.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your Visual Taste Profile
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              VISTA continuously models your aesthetic inclinations, pacing tolerance, and narrative
              themes from your permitted viewing sessions.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
              <span className="text-xs text-slate-400 block">Watched</span>
              <span className="text-xl font-bold text-cyan-400">
                {tasteProfile.totalVideosWatched}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
              <span className="text-xs text-slate-400 block">Likes & Loves</span>
              <span className="text-xl font-bold text-rose-400">
                {tasteProfile.positiveReactionsCount}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
              <span className="text-xs text-slate-400 block">Saved Traits</span>
              <span className="text-xl font-bold text-purple-400">
                {memories.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Taste Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Preferred Genres Card */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Film className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Preferred Genres
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Affinity</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(tasteProfile.genres).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Watch more videos to uncover genre preferences.
              </p>
            ) : (
              Object.entries(tasteProfile.genres)
                .sort((a, b) => b[1] - a[1])
                .map(([genre, score]) => (
                  <div key={genre} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{genre}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-300">
                          {Math.round(score * 100)}%
                        </span>
                        <button
                          onClick={() => getExplanation(genre, score, 'genre')}
                          className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                          title="Why did VISTA learn this?"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                      <div
                        style={{ width: `${Math.round(score * 100)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Visual Styles & Aesthetics Card */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Visual Styles & Aesthetics
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Affinity</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(tasteProfile.visualPreferences).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Visual preferences will emerge as you watch.
              </p>
            ) : (
              Object.entries(tasteProfile.visualPreferences)
                .sort((a, b) => b[1] - a[1])
                .map(([style, score]) => (
                  <div key={style} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{style}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-purple-300">
                          {Math.round(score * 100)}%
                        </span>
                        <button
                          onClick={() => getExplanation(style, score, 'visual')}
                          className="p-1 text-slate-400 hover:text-purple-400 transition-colors"
                          title="Why did VISTA learn this?"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                      <div
                        style={{ width: `${Math.round(score * 100)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Themes & Narrative Worlds Card */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Narrative Themes
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Affinity</span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(tasteProfile.themes).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No themes recorded yet.
              </p>
            ) : (
              Object.entries(tasteProfile.themes)
                .sort((a, b) => b[1] - a[1])
                .map(([theme, score]) => (
                  <div key={theme} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{theme}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-amber-300">
                          {Math.round(score * 100)}%
                        </span>
                        <button
                          onClick={() => getExplanation(theme, score, 'theme')}
                          className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Why did VISTA learn this?"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                      <div
                        style={{ width: `${Math.round(score * 100)}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Pacing, Avoided Topics, and Frequently Watched Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pacing Preference */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Pacing Preference</h4>
          </div>
          <p className="text-xs text-slate-400">
            Current calculated speed comfort zone:
          </p>
          <div className="flex items-center space-x-2 pt-1">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/30 uppercase tracking-wide">
              {tasteProfile.pacingPreference || 'Balanced'} Pacing
            </span>
          </div>
        </div>

        {/* Skipped / Avoided Topics */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <Ban className="w-5 h-5 text-rose-400" />
            <h4 className="text-sm font-bold text-white">Avoided / Skipped</h4>
          </div>
          <p className="text-xs text-slate-400">
            Categories you frequently skip or marked "Not Interested":
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tasteProfile.skippedCategories.length === 0 ? (
              <span className="text-xs text-slate-500">None yet</span>
            ) : (
              tasteProfile.skippedCategories.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-500/20 text-xs"
                >
                  {c}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Frequently Watched */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <h4 className="text-sm font-bold text-white">Frequently Watched</h4>
          </div>
          <p className="text-xs text-slate-400">
            Recurring titles and series:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tasteProfile.frequentlyWatched.length === 0 ? (
              <span className="text-xs text-slate-500">None yet</span>
            ) : (
              tasteProfile.frequentlyWatched.map((t, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/40 text-blue-300 border border-blue-500/20 text-xs truncate max-w-full"
                >
                  {t}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Explicit User Learned Memories List (with Delete capability) */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Learned Preferences & Memory Items ({memories.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            You can delete any individual memory at any time
          </span>
        </div>

        {memories.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No memories saved yet. When watching videos, click "Remember" to store specific tastes!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-start justify-between gap-3 group hover:border-purple-400/40 transition-all"
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold tracking-wide border border-purple-500/30">
                      {mem.category}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {mem.value}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {mem.reason}
                  </p>
                  <span className="text-[9px] text-slate-500 font-mono">
                    Learned on {new Date(mem.createdAt).toLocaleDateString()} • Confidence {Math.round(mem.confidence * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove this learned memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "Why Did You Learn This?" Explanation Modal (Requirement 26) */}
      {selectedExplain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  Why VISTA Learned "{selectedExplain.title}"
                </h3>
              </div>
              <button
                onClick={() => setSelectedExplain(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedExplain.explanation}
            </p>

            {/* List of evidence videos */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Supporting Viewing Evidence:
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                {selectedExplain.matchingSignals.length === 0 ? (
                  <p className="text-xs text-slate-500">Initial taste baseline profile.</p>
                ) : (
                  selectedExplain.matchingSignals.map((sig, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-white truncate max-w-[240px]">
                        {sig.videoTitle}
                      </span>
                      <span className="text-cyan-300 uppercase text-[10px] font-bold">
                        {sig.signalType}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedExplain(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
