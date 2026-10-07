import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Key,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../services/api.js';

interface AiConfigModalProps {
  status: any;
  onStatusUpdated: () => void;
  onClose?: () => void;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  status,
  onStatusUpdated,
  onClose,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const loadMetrics = async () => {
    try {
      const res = await api.getAiMetrics();
      setMetrics(res);
    } catch (e) {
      console.warn('Metrics load note:', e);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await api.clearAiCache();
      await loadMetrics();
      setSaveMessage('AI response cache cleared successfully!');
      setTimeout(() => setSaveMessage(null), 2500);
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim()) {
      setErrorMessage('Please enter an API key');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    try {
      const res = await api.setApiKey(apiKeyInput.trim());
      if (res.success) {
        setSaveMessage('Google Gemini API Key configured and active on server!');
        setApiKeyInput('');
        onStatusUpdated();
      } else {
        setErrorMessage(res.error || 'Failed to update key');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error saving API key');
    } finally {
      setIsSaving(false);
    }
  };

  const ai = status?.ai || {};

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6 p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
              AI Provider Architecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Engine & Integration
          </h1>
          <p className="text-sm text-slate-300">
            Configure Google Gemini multimodal models or use the built-in local semantic vision engine.
          </p>
        </div>
      </div>

      {/* Active Engine Card */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">
                {ai.providerName || 'VISTA Local Semantic Engine'}
              </h3>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  ai.hasApiKey
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {ai.hasApiKey ? 'Gemini 1.5/2.5 Active' : 'Local Heuristic Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-lg">
              {ai.hasApiKey
                ? `Multimodal frame perception and dialogue are powered by Google Gemini API (${ai.maskedKey}).`
                : 'Running on high-precision local semantic scene analyzer and transcript synchronizer. Enter a Gemini API key below to unlock cloud multimodal vision!'}
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-1 text-xs text-slate-400 border-l border-white/10 pl-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Frame Vision Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Realtime Scene Reactions</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Taste Learning Engine</span>
          </div>
        </div>
      </div>

      {/* Token & Cache Optimization Metrics Dashboard */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Token & Cost Optimization Metrics
            </h3>
          </div>
          <button
            onClick={handleClearCache}
            disabled={isClearingCache}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
            title="Clear in-memory response cache"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isClearingCache ? 'Clearing...' : 'Clear Cache'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Requests</span>
            <span className="text-lg font-bold text-white mt-1">{metrics?.totalRequests ?? 0}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Cache Hits</span>
            <span className="text-lg font-bold text-emerald-400 mt-1">
              {metrics?.cacheHits ?? 0} ({metrics?.hitRatePercent ?? 0}%)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">In-Flight Deduplicated</span>
            <span className="text-lg font-bold text-cyan-400 mt-1">{metrics?.deduplicatedInFlight ?? 0}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Est. Tokens Saved</span>
            <span className="text-lg font-bold text-purple-400 mt-1">
              ~{metrics?.estimatedTokensSaved ?? 0} tok
            </span>
          </div>
        </div>
      </div>

      {/* Configure Google Gemini API Key */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Configure Google Gemini API Key (Server-Side)
            </h3>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            <span>Get Gemini Key</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Your key is transmitted to and saved strictly on the local backend server (never exposed to client browser javascript).
          It unlocks real multimodal frame vision processing for video keyframes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="password"
            placeholder={ai.hasApiKey ? `Current: ${ai.maskedKey}` : 'Enter your Google Gemini API Key (AIzaSy...)'}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleSaveKey}
            disabled={isSaving || !apiKeyInput.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
          >
            {isSaving ? 'Verifying...' : 'Set API Key'}
          </button>
        </div>

        {saveMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Security & Zero Leak Guarantee */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center space-x-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <span>
          <strong>Security Guarantee:</strong> VISTA never embeds API credentials in client-side bundles. All model calls and vision perception pass through secure server routes.
        </span>
      </div>
    </div>
  );
};
