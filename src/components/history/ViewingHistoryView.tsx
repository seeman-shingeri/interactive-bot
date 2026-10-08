import React from 'react';
import { History, Play, Clock, Film, Trash2 } from 'lucide-react';
import { ViewingSession } from '../../types/index.js';

interface ViewingHistoryViewProps {
  history: ViewingSession[];
  onPlayVideoById: (videoId: string) => void;
  onClearHistory?: () => void;
}

export const ViewingHistoryView: React.FC<ViewingHistoryViewProps> = ({
  history,
  onPlayVideoById,
  onClearHistory,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
              Activity Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Viewing History ({history.length})
          </h1>
          <p className="text-sm text-slate-300">
            Recorded sessions and videos watched alongside your AI companion.
          </p>
        </div>

        {onClearHistory && history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear your entire viewing history? This cannot be undone.')) {
                onClearHistory();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
            aria-label="Clear all viewing history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-white/5 text-center flex flex-col items-center justify-center space-y-3">
          <History className="w-10 h-10 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No viewing records yet</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Watch any video in the player to start building your companion history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center justify-between hover:border-cyan-400/40 transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {item.videoTitle}
                  </h4>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-0.5">
                    <span>
                      Watched {Math.floor(item.watchDurationSeconds)}s ({item.completedPercentage}%)
                    </span>
                    <span>•</span>
                    <span>{new Date(item.startedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onPlayVideoById(item.videoId)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-xs font-semibold text-white transition-all shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
