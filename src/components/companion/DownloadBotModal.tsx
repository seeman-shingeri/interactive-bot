import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Bot,
  Sparkles,
  Layers,
  CheckCircle,
  Copy,
  Check,
  X,
  Laptop,
  Maximize2,
} from 'lucide-react';

interface DownloadBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  botName: string;
}

export const DownloadBotModal: React.FC<DownloadBotModalProps> = ({
  isOpen,
  onClose,
  botName,
}) => {
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  if (!isOpen) return null;

  const downloadStandaloneBot = () => {
    const link = document.createElement('a');
    link.href = '/vista-companion.html';
    link.download = 'vista-companion.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const launchPopoutWindow = () => {
    window.open(
      '/?mode=standalone',
      'VISTA Standalone Companion',
      'width=440,height=720,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-950 border border-cyan-500/40 shadow-2xl flex flex-col space-y-6 text-slate-100">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/30">
              <Bot className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Download Standalone Bot
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  Self-Contained
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Run {botName} standalone on your desktop or browser window without the full player.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Click Bot Face For UI</strong>
              <span className="text-slate-400 text-[11px] leading-snug">
                Clicking {botName}'s visor face opens the complete companion dialogue and personality interface.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex items-start space-x-2.5">
            <Layers className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">2-Second Hold Controls</strong>
              <span className="text-slate-400 text-[11px] leading-snug">
                Press & hold for 2s to bloom the 10-node radial menu or drag anywhere on screen.
              </span>
            </div>
          </div>
        </div>

        {/* Download & Launch Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          {/* Direct File Download */}
          <button
            onClick={downloadStandaloneBot}
            className="w-full sm:flex-1 flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-xl shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Standalone Bot (.html)</span>
          </button>

          {/* Launch Pop-Out Window */}
          <button
            onClick={launchPopoutWindow}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all active:scale-95"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Launch Pop-Out Window</span>
          </button>
        </div>

        {/* Direct Download URL Information */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/5 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="truncate max-w-[360px]">
            <span>Direct link: </span>
            <code className="text-cyan-300 font-mono text-[10px]">/api/download/bot</code>
          </div>
          <a
            href="/api/download/bot"
            download="vista-companion.html"
            className="text-cyan-400 hover:underline font-semibold ml-2 flex-shrink-0"
          >
            Direct Link →
          </a>
        </div>

      </div>
    </div>
  );
};
