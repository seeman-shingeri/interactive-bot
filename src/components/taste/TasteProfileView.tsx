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
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Check,
  Shield,
  Tag,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';
import { TasteProfile, TasteSignal, MemoryItem } from '../../types/index.js';

interface TasteProfileViewProps {
  tasteProfile: TasteProfile;
  signals: TasteSignal[];
  memories: MemoryItem[];
  onDeleteMemory: (id: string) => void;
  onUpdateMemory?: (id: string, partial: Partial<MemoryItem>) => void;
  onToggleMemory?: (id: string) => void;
  onConfirmMemory?: (id: string) => void;
  onAddMemory?: (payload: { key: string; category: MemoryItem['category']; value: string; reason: string }) => void;
  onRefresh: () => void;
}

export const TasteProfileView: React.FC<TasteProfileViewProps> = ({
  tasteProfile,
  signals,
  memories,
  onDeleteMemory,
  onUpdateMemory,
  onToggleMemory,
  onConfirmMemory,
  onAddMemory,
  onRefresh,
}) => {
  const [selectedExplain, setSelectedExplain] = useState<{
    title: string;
    score: number;
    explanation: string;
    matchingSignals: TasteSignal[];
  } | null>(null);

  // Memory inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editCategory, setEditCategory] = useState<MemoryItem['category']>('genre');
  const [editReason, setEditReason] = useState<string>('');

  // Memory addition modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('visual_style');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');

  // Memory search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | MemoryItem['category']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'unconfirmed'>('all');

  const filteredMemories = memories.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (statusFilter === 'active' && m.disabled) return false;
    if (statusFilter === 'inactive' && !m.disabled) return false;
    if (statusFilter === 'unconfirmed' && m.isConfirmed !== false) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        m.key.toLowerCase().includes(q) ||
        m.value.toLowerCase().includes(q) ||
        m.reason.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

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

      {/* Explicit User Learned Memories List & Sovereign Memory Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Persistent Memories & Preferences ({memories.length})
            </h3>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Full user control: review, edit, toggle, and delete
            </span>
            {onAddMemory && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Preference</span>
              </button>
            )}
          </div>
        </div>

        {memories.length > 0 && (
          <div className="flex flex-col space-y-3 pb-2">
            {/* Search input & status filter row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories by keyword, value, or reason..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status filter buttons */}
              <div className="flex items-center space-x-1 text-xs">
                {(['all', 'active', 'inactive', 'unconfirmed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-medium transition-colors ${
                      statusFilter === st
                        ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold'
                        : 'text-slate-400 hover:text-white bg-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <span className="text-slate-500 text-[10px] uppercase font-bold pr-1 flex items-center space-x-1">
                <Filter className="w-3 h-3" />
                <span>Filter:</span>
              </span>
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'genre', label: 'Genres' },
                { id: 'theme', label: 'Themes' },
                { id: 'visual_style', label: 'Visual Styles' },
                { id: 'pacing', label: 'Pacing' },
                { id: 'character', label: 'Characters' },
                { id: 'dislike', label: 'Dislikes' },
              ].map((cat) => {
                const count =
                  cat.id === 'all'
                    ? memories.length
                    : memories.filter((m) => m.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-2.5 py-0.5 rounded-lg whitespace-nowrap transition-all flex items-center space-x-1 ${
                      categoryFilter === cat.id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                        : 'text-slate-400 hover:text-slate-200 bg-white/5 border border-white/5'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-[9px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {memories.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No memories saved yet. Click "Add Preference" or chat with your companion to record favorite tastes!
          </p>
        ) : filteredMemories.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-950/40 border border-white/5 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
            <p>No memories match your active search or category filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-purple-300 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMemories.map((mem) => {
              const isEditing = editingId === mem.id;
              const sourceLabel =
                mem.source === 'confirmed_inference'
                  ? 'Inference'
                  : mem.source === 'video_observation'
                  ? 'Video'
                  : 'Explicit';
              const sourceColor =
                mem.source === 'confirmed_inference'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : mem.source === 'video_observation'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';

              return (
                <div
                  key={mem.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    mem.disabled
                      ? 'bg-slate-950/40 border-white/5 opacity-60'
                      : 'bg-slate-950/70 border-white/10 hover:border-purple-400/40 shadow-sm'
                  }`}
                >
                  {isEditing ? (
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as any)}
                          className="bg-slate-900 border border-white/20 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="genre">Genre</option>
                          <option value="theme">Theme</option>
                          <option value="visual_style">Visual Style</option>
                          <option value="pacing">Pacing</option>
                          <option value="character">Character</option>
                          <option value="dislike">Dislike</option>
                        </select>
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="Preference value"
                          className="flex-1 bg-slate-900 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Reason / context"
                        className="w-full bg-slate-900 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                      />
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (onUpdateMemory && editValue.trim()) {
                              onUpdateMemory(mem.id, {
                                value: editValue.trim(),
                                category: editCategory,
                                reason: editReason.trim() || mem.reason,
                              });
                            }
                            setEditingId(null);
                          }}
                          className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider border ${sourceColor}`}
                          >
                            {sourceLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] uppercase font-bold tracking-wide border border-white/10">
                            {mem.category}
                          </span>
                          {mem.disabled && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[9px] uppercase font-semibold border border-white/10">
                              Inactive
                            </span>
                          )}
                          {mem.isConfirmed === false && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[9px] uppercase font-bold border border-amber-500/30 flex items-center space-x-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>Needs Confirmation</span>
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs font-semibold text-white ${
                            mem.disabled ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {mem.value}
                        </span>
                        <p className="text-[11px] text-slate-400 leading-snug">{mem.reason}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(mem.createdAt).toLocaleDateString()} • {Math.round(mem.confidence * 100)}% conf
                        </span>

                        <div className="flex items-center space-x-1">
                          {mem.isConfirmed === false && onConfirmMemory && (
                            <button
                              onClick={() => onConfirmMemory(mem.id)}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold"
                              title="Confirm this companion inference"
                            >
                              <Check className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          )}

                          {onToggleMemory && (
                            <button
                              onClick={() => onToggleMemory(mem.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                              title={mem.disabled ? 'Enable memory' : 'Disable memory temporarily'}
                            >
                              {mem.disabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {onUpdateMemory && (
                            <button
                              onClick={() => {
                                setEditingId(mem.id);
                                setEditValue(mem.value);
                                setEditCategory(mem.category);
                                setEditReason(mem.reason);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                              title="Edit this memory"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteMemory(mem.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete this memory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-purple-500/40 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Add Explicit Preference</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Key Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. pref_favorite_director"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="genre">Genre</option>
                  <option value="theme">Theme</option>
                  <option value="visual_style">Visual Style</option>
                  <option value="pacing">Pacing</option>
                  <option value="character">Character</option>
                  <option value="dislike">Dislike</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Preference Value</label>
                <input
                  type="text"
                  placeholder="e.g. Christopher Nolan Sci-Fi"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. User explicitly requested companion to keep this in mind"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onAddMemory && newKey.trim() && newValue.trim()) {
                    onAddMemory({
                      key: newKey.trim(),
                      category: newCategory,
                      value: newValue.trim(),
                      reason: newReason.trim() || 'Explicitly saved user preference',
                    });
                    setNewKey('');
                    setNewValue('');
                    setNewReason('');
                    setIsAddModalOpen(false);
                  }
                }}
                disabled={!newKey.trim() || !newValue.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all active:scale-95"
              >
                Save Preference
              </button>
            </div>
          </div>
        </div>
      )}

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
