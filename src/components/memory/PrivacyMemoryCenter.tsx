import React, { useState } from 'react';
import {
  Shield,
  Brain,
  Database,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Lock,
  Eye,
  Mic,
  Sparkles,
  Camera,
  Layers,
  Info,
} from 'lucide-react';
import { PrivacySettings } from '../../types/index.js';

interface PrivacyMemoryCenterProps {
  privacySettings: PrivacySettings;
  onUpdatePrivacy: (partial: Partial<PrivacySettings>) => Promise<void>;
  onDeleteAllData: () => Promise<void>;
  totalMemoriesCount: number;
}

export const PrivacyMemoryCenter: React.FC<PrivacyMemoryCenterProps> = ({
  privacySettings,
  onUpdatePrivacy,
  onDeleteAllData,
  totalMemoriesCount,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggle = async (key: keyof PrivacySettings, value: any) => {
    await onUpdatePrivacy({ [key]: value });
    setToastMessage('Privacy settings updated');
    setTimeout(() => setToastMessage(null), 2500);
  };

  const confirmDeleteAll = async () => {
    setIsDeleting(true);
    await onDeleteAllData();
    setIsDeleting(false);
    setShowDeleteModal(false);
    setToastMessage('All personal memory & viewing history wiped completely.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Toast confirmation */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-in slide-in-from-top">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
              User Sovereign Privacy
            </span>
            <span className="text-xs text-slate-400">Strict Data Boundary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Privacy & Memory Center
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            You hold total control over what VISTA remembers. Disable personal memory at any time to
            enjoy ephemeral viewing with zero persistent taste recording.
          </p>
        </div>

        {/* Master Personal Memory Toggle (Requirement 10) */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950/80 border border-purple-500/30 shadow-xl w-full md:w-auto">
          <span className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
            Master Switch: Personal Memory
          </span>
          <button
            onClick={() => handleToggle('personalMemory', !privacySettings.personalMemory)}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${
              privacySettings.personalMemory ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                privacySettings.personalMemory ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
          <span
            className={`text-xs font-bold mt-2 ${
              privacySettings.personalMemory ? 'text-purple-300' : 'text-slate-500'
            }`}
          >
            {privacySettings.personalMemory ? 'MEMORY ACTIVE' : 'MEMORY OFF'}
          </span>
        </div>
      </div>

      {/* Safety & Sensor Verification Status (Requirement 18) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center space-y-1">
          <Camera className="w-4 h-4 text-slate-500" />
          <span className="text-[11px] font-medium text-slate-400">Camera</span>
          <span className="text-xs font-bold text-slate-400">OFF (Locked)</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center space-y-1">
          <Mic className="w-4 h-4 text-cyan-400" />
          <span className="text-[11px] font-medium text-slate-400">Microphone</span>
          <span className="text-xs font-bold text-cyan-300">Push-To-Talk</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center space-y-1">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-[11px] font-medium text-slate-400">Visual Analysis</span>
          <span className="text-xs font-bold text-emerald-300">
            {privacySettings.visualAnalysisEnabled ? 'Active' : 'Disabled'}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center space-y-1">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-[11px] font-medium text-slate-400">Memory</span>
          <span className="text-xs font-bold text-purple-300">
            {privacySettings.personalMemory ? 'Enabled' : 'Off'}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center space-y-1">
          <Database className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] font-medium text-slate-400">Data Storage</span>
          <span className="text-xs font-bold text-amber-300 capitalize">
            {privacySettings.dataStorageMode.replace('_', ' ')}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center space-y-1">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="text-[11px] font-medium text-slate-400">Suggestions</span>
          <span className="text-xs font-bold text-pink-300">
            {privacySettings.useHistoryForRecommendations ? 'Active' : 'Muted'}
          </span>
        </div>
      </div>

      {/* Data Storage Mode Selector (Requirement 11) */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
          <Database className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Data Storage Architecture Mode
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Choose where and how long viewing context is retained:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Session Only */}
          <div
            onClick={() => handleToggle('dataStorageMode', 'session_only')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              privacySettings.dataStorageMode === 'session_only'
                ? 'bg-amber-950/30 border-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Session Only</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Ephemeral
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              "Data is used during this viewing session and is discarded afterward."
            </p>
          </div>

          {/* Personal Memory */}
          <div
            onClick={() => handleToggle('dataStorageMode', 'personal_memory')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              privacySettings.dataStorageMode === 'personal_memory'
                ? 'bg-purple-950/30 border-purple-400 shadow-lg shadow-purple-500/20'
                : 'bg-slate-950/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Personal Memory</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                Personalized
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              "Selected information can be saved to improve future interactions and develop taste."
            </p>
          </div>

          {/* No Storage */}
          <div
            onClick={() => handleToggle('dataStorageMode', 'no_storage')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              privacySettings.dataStorageMode === 'no_storage'
                ? 'bg-slate-800 border-white/60 shadow-lg'
                : 'bg-slate-950/60 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">No Storage</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-200 border border-white/20 font-semibold">
                Strict Zero
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              "Do not save viewing-related information at all. Zero history recorded."
            </p>
          </div>
        </div>
      </div>

      {/* Granular Memory Controls (Requirement 10) */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
        <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-wide">
            Granular Memory & Perception Controls
          </h3>
        </div>

        <div className="space-y-4">
          {/* Save my preferences */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex flex-col space-y-0.5 pr-4">
              <span className="text-sm font-semibold text-white">Save my preferences</span>
              <span className="text-xs text-slate-400">
                Allows VISTA to store explicitly confirmed preferences and favorite styles.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.savePreferences}
              onChange={(e) => handleToggle('savePreferences', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Remember videos I watch */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex flex-col space-y-0.5 pr-4">
              <span className="text-sm font-semibold text-white">Remember videos I watch</span>
              <span className="text-xs text-slate-400">
                Maintains a viewing history list so your companion knows what you already watched.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.rememberVideos}
              onChange={(e) => handleToggle('rememberVideos', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Learn my visual taste */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex flex-col space-y-0.5 pr-4">
              <span className="text-sm font-semibold text-white">Learn my visual taste</span>
              <span className="text-xs text-slate-400">
                Enables statistical taste modeling across genres, visual lighting, and themes.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.learnVisualTaste}
              onChange={(e) => handleToggle('learnVisualTaste', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Store visual observations */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex flex-col space-y-0.5 pr-4">
              <span className="text-sm font-semibold text-white">Store visual observations</span>
              <span className="text-xs text-slate-400">
                Saves high-level metadata (objects, colors, mood) without saving raw video files.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.storeVisualObservations}
              onChange={(e) => handleToggle('storeVisualObservations', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Store conversation history */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex flex-col space-y-0.5 pr-4">
              <span className="text-sm font-semibold text-white">Store conversation history</span>
              <span className="text-xs text-slate-400">
                Keeps previous discussions with your companion across browser reloads.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.storeConversationHistory}
              onChange={(e) => handleToggle('storeConversationHistory', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Use my history for recommendations */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex flex-col space-y-0.5 pr-4">
              <span className="text-sm font-semibold text-white">Use history for recommendations</span>
              <span className="text-xs text-slate-400">
                Enables companion to say "You seem to enjoy sci-fi..." and suggest matching videos.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.useHistoryForRecommendations}
              onChange={(e) => handleToggle('useHistoryForRecommendations', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* Visual Analysis Master Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="flex flex-col space-y-0.5 pr-4">
              <span className="text-sm font-semibold text-white">Visual Analysis Engine</span>
              <span className="text-xs text-slate-400">
                Captures periodic keyframes from the player for your companion to see the video.
              </span>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.visualAnalysisEnabled}
              onChange={(e) => handleToggle('visualAnalysisEnabled', e.target.checked)}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Delete All Memory Button & Danger Zone (Requirement 12) */}
      <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/30 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Danger Zone: Permanent Memory Deletion</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Permanently wipes all learned preferences, taste profile signals, viewing logs, and
            conversation history. VISTA will reset to a clean companion.
          </p>
        </div>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete All Memory</span>
        </button>
      </div>

      {/* Delete All Confirmation Modal (Requirement 12) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-rose-500/40 shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Delete All Personalized Memory?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete all {totalMemoriesCount} learned preferences, taste
              clusters, conversation messages, and viewing records. This action cannot be undone.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAll}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                {isDeleting ? 'Deleting...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
