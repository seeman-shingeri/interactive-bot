import React from 'react';
import {
  Tv,
  Sparkles,
  Bot,
  Shield,
  History,
  Cpu,
  MessageSquare,
  Eye,
  EyeOff,
  Brain,
  Database,
  Download,
} from 'lucide-react';
import { PrivacySettings, BotSettings } from '../../types/index.js';

export type NavTab = 'watch' | 'taste' | 'studio' | 'privacy' | 'history' | 'config';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  privacySettings: PrivacySettings;
  botSettings: BotSettings;
  aiStatus: any;
  onToggleChat: () => void;
  isChatOpen: boolean;
  unreadCount?: number;
  onOpenDownloadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  privacySettings,
  botSettings,
  aiStatus,
  onToggleChat,
  isChatOpen,
  onOpenDownloadModal,
}) => {
  const tabs = [
    { id: 'watch' as NavTab, label: 'Watch Room', icon: <Tv className="w-4 h-4" /> },
    { id: 'taste' as NavTab, label: 'Taste Profile', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'studio' as NavTab, label: 'Bot Studio', icon: <Bot className="w-4 h-4" /> },
    { id: 'privacy' as NavTab, label: 'Privacy & Memory', icon: <Shield className="w-4 h-4" /> },
    { id: 'history' as NavTab, label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'config' as NavTab, label: 'AI Engine', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090e]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Brand Logo & Companion Name */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('watch')}>
        <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
          <div className="w-4 h-4 rounded-full bg-slate-950 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-base tracking-wider text-white font-mono">
              VISTA
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
              v1.0
            </span>
          </div>
          <span className="text-[10px] text-slate-400 -mt-0.5 tracking-tight font-medium hidden sm:inline">
            Visual Interactive Smart Taste Assistant
          </span>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-2xl border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Right Privacy Status Badges & Chat Button */}
      <div className="flex items-center space-x-3">
        {/* Real-Time Privacy Indicators (Requirement 18) */}
        <div className="hidden lg:flex items-center space-x-2 text-[10px] font-mono">
          {/* Vision Pill */}
          <div
            className={`px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
              privacySettings.visualAnalysisEnabled
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 border-white/10 text-slate-500'
            }`}
            title="Visual Analysis Status"
          >
            {privacySettings.visualAnalysisEnabled ? (
              <Eye className="w-3 h-3 text-emerald-400" />
            ) : (
              <EyeOff className="w-3 h-3 text-slate-500" />
            )}
            <span>Vision {privacySettings.visualAnalysisEnabled ? 'ON' : 'OFF'}</span>
          </div>

          {/* Memory Pill */}
          <div
            className={`px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
              privacySettings.personalMemory
                ? 'bg-purple-950/40 border-purple-500/30 text-purple-300'
                : 'bg-slate-900 border-white/10 text-slate-500'
            }`}
            title="Personal Memory Status"
          >
            <Brain className="w-3 h-3" />
            <span>Memory {privacySettings.personalMemory ? 'ON' : 'OFF'}</span>
          </div>

          {/* AI Engine Status Pill */}
          <button
            onClick={() => onTabChange('config')}
            className={`px-2.5 py-0.5 rounded-full border flex items-center space-x-1 transition-colors ${
              aiStatus?.ai?.hasApiKey
                ? 'bg-cyan-950/50 border-cyan-400/40 text-cyan-300 hover:bg-cyan-900/60'
                : 'bg-slate-900/80 border-white/15 text-slate-300 hover:border-cyan-400/40'
            }`}
            title="Click to configure AI Engine"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{aiStatus?.ai?.hasApiKey ? 'Gemini 1.5' : 'Local Vision'}</span>
          </button>
        </div>

        {/* Mobile Navigation Dropdown Button if small screen */}
        <div className="flex md:hidden">
          <select
            value={currentTab}
            onChange={(e) => onTabChange(e.target.value as NavTab)}
            className="px-2 py-1 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Download Standalone Bot Button */}
        {onOpenDownloadModal && (
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border-cyan-500/30 hover:border-cyan-400 hover:text-white transition-all active:scale-95 shadow-sm"
            title="Download Standalone Companion Bot"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Download Bot</span>
          </button>
        )}

        {/* Open Chat Drawer Button */}
        <button
          onClick={onToggleChat}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
            isChatOpen
              ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10'
          }`}
          title="Toggle Companion Chat"
        >
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Talk to {botSettings.name}</span>
        </button>
      </div>
    </header>
  );
};
