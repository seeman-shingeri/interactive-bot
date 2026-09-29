import React from 'react';
import { SceneMetadata } from '../../types/index.js';
import { Bookmark, Clock, Sparkles } from 'lucide-react';

interface ChapterBookmarksProps {
  scenes: SceneMetadata[];
  activeScene?: SceneMetadata;
  currentTimestamp: number;
  duration: number;
  onSeekToScene: (scene: SceneMetadata) => void;
}

export const ChapterBookmarks: React.FC<ChapterBookmarksProps> = ({
  scenes,
  activeScene,
  currentTimestamp,
  duration,
  onSeekToScene,
}) => {
  if (!scenes || scenes.length === 0) return null;

  return (
    <div className="w-full flex flex-col space-y-2 pt-2 border-t border-white/5">
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5 font-medium">
          <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Scene Chapters</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500">
          {scenes.length} Scenes Indexed
        </span>
      </div>

      {/* Chapters Grid / Scroller */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10">
        {scenes.map((scene, idx) => {
          const isActive =
            activeScene?.sceneName === scene.sceneName &&
            activeScene?.startTime === scene.startTime;
          return (
            <button
              key={`${scene.sceneName}-${idx}`}
              onClick={() => onSeekToScene(scene)}
              className={`flex-shrink-0 flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition-all active:scale-95 ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/15'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border-white/5 hover:border-white/10'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-[11px] truncate max-w-[130px]">
                  {scene.sceneName}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {Math.floor(scene.startTime / 60)}:
                  {String(Math.floor(scene.startTime % 60)).padStart(2, '0')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
